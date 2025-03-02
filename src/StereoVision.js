import * as THREE from 'three';
import { CAMERA_PARAMS, TABLE_Y } from './constants.js';

export default class StereoVision {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.cameraParams = { ...CAMERA_PARAMS };
        
        this.setupCameras();
        this.setupRenderTargets();
        this.setupViewports();
    }

    setupCameras() {
        // Left camera
        this.leftCamera = new THREE.PerspectiveCamera(
            this.cameraParams.FOV,
            this.cameraParams.RESOLUTION.width / this.cameraParams.RESOLUTION.height,
            1,
            2000
        );
        
        // Right camera
        this.rightCamera = new THREE.PerspectiveCamera(
            this.cameraParams.FOV,
            this.cameraParams.RESOLUTION.width / this.cameraParams.RESOLUTION.height,
            1,
            2000
        );

        // Add camera helpers for visualization
        this.leftCameraHelper = new THREE.CameraHelper(this.leftCamera);
        this.rightCameraHelper = new THREE.CameraHelper(this.rightCamera);
        
        this.scene.add(this.leftCameraHelper);
        this.scene.add(this.rightCameraHelper);
        
        // Initially hide camera helpers
        this.leftCameraHelper.visible = false;
        this.rightCameraHelper.visible = false;

        // Position cameras
        this.updateCameraPositions();
    }

    updateCameraPositions() {
        // Calculate camera positions based on parameters
        const tableCenter = new THREE.Vector3(0, TABLE_Y, 0);
        const radians = THREE.MathUtils.degToRad(this.cameraParams.ANGLE);
        
        // Camera offsets
        const offsetY = this.cameraParams.HEIGHT; 
        const offsetZ = this.cameraParams.HEIGHT / Math.tan(radians);
        
        // Left camera - moved further back by increasing Z offset
        this.leftCamera.position.set(
            -this.cameraParams.SEPARATION/2, 
            TABLE_Y + offsetY, 
            -offsetZ - 100  // Added 100 units to move cameras back more
        );
        this.leftCamera.lookAt(tableCenter);
        
        // Right camera - moved further back by increasing Z offset
        this.rightCamera.position.set(
            this.cameraParams.SEPARATION/2, 
            TABLE_Y + offsetY, 
            -offsetZ - 100  // Added 100 units to move cameras back more
        );
        this.rightCamera.lookAt(tableCenter);
        
        // Update camera helpers
        this.leftCameraHelper.update();
        this.rightCameraHelper.update();
        
        // Update camera intrinsics
        this.updateCameraIntrinsics();
    }

    updateCameraIntrinsics() {
        // Calculate and store camera intrinsic matrices
        const aspect = this.cameraParams.RESOLUTION.width / this.cameraParams.RESOLUTION.height;
        const fov = this.cameraParams.FOV * Math.PI / 180;
        
        // Focal length (in pixels)
        const f = this.cameraParams.RESOLUTION.height / (2 * Math.tan(fov / 2));
        
        // Camera matrices
        this.leftIntrinsics = {
            fx: f,
            fy: f,
            cx: this.cameraParams.RESOLUTION.width / 2,
            cy: this.cameraParams.RESOLUTION.height / 2
        };
        
        this.rightIntrinsics = {...this.leftIntrinsics};
        
        // Update cameras
        this.leftCamera.fov = this.cameraParams.FOV;
        this.rightCamera.fov = this.cameraParams.FOV;
        this.leftCamera.aspect = aspect;
        this.rightCamera.aspect = aspect;
        this.leftCamera.updateProjectionMatrix();
        this.rightCamera.updateProjectionMatrix();
    }

    setupRenderTargets() {
        // Create WebGL render targets for each camera
        this.leftRenderTarget = new THREE.WebGLRenderTarget(
            this.cameraParams.RESOLUTION.width,
            this.cameraParams.RESOLUTION.height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            }
        );
        
        this.rightRenderTarget = new THREE.WebGLRenderTarget(
            this.cameraParams.RESOLUTION.width,
            this.cameraParams.RESOLUTION.height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            }
        );
        
        // Create display planes for camera views
        const planeGeometry = new THREE.PlaneGeometry(1, 1);
        
        // Left camera view
        this.leftViewMaterial = new THREE.MeshBasicMaterial({
            map: this.leftRenderTarget.texture,
            side: THREE.DoubleSide
        });
        this.leftViewPlane = new THREE.Mesh(planeGeometry, this.leftViewMaterial);
        
        // Right camera view
        this.rightViewMaterial = new THREE.MeshBasicMaterial({
            map: this.rightRenderTarget.texture,
            side: THREE.DoubleSide
        });
        this.rightViewPlane = new THREE.Mesh(planeGeometry, this.rightViewMaterial);
    }

    setupViewports() {
        // Create scene for displaying camera views
        this.viewportScene = new THREE.Scene();
        this.viewportCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
        this.viewportCamera.position.z = 1;
        
        // Add view planes to viewport scene
        this.viewportScene.add(this.leftViewPlane);
        this.viewportScene.add(this.rightViewPlane);
        
        // Position view planes for split screen mode
        this.leftViewPlane.position.set(-0.25, 0, 0);
        this.leftViewPlane.scale.set(0.48, 0.48, 1);
        
        this.rightViewPlane.position.set(0.25, 0, 0);
        this.rightViewPlane.scale.set(0.48, 0.48, 1);
        
        // Add background for viewport scene
        const bgGeometry = new THREE.PlaneGeometry(1, 1);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        this.viewportBackground = new THREE.Mesh(bgGeometry, bgMaterial);
        this.viewportBackground.position.z = -0.1;
        this.viewportScene.add(this.viewportBackground);
    }

    updateCameraParams(params) {
        // Update any camera parameters that have changed
        for (const [key, value] of Object.entries(params)) {
            if (this.cameraParams[key] !== value) {
                this.cameraParams[key] = value;
            }
        }
        
        this.updateCameraPositions();
    }

    setHelpersVisible(visible) {
        this.leftCameraHelper.visible = visible;
        this.rightCameraHelper.visible = visible;
    }

    renderViews() {
        // Update camera render targets
        this.renderer.setRenderTarget(this.leftRenderTarget);
        this.renderer.render(this.scene, this.leftCamera);
        
        this.renderer.setRenderTarget(this.rightRenderTarget);
        this.renderer.render(this.scene, this.rightCamera);
        
        // Reset render target
        this.renderer.setRenderTarget(null);
    }

    renderSplitView() {
        // Setup for split view - increase scale slightly
        this.leftViewPlane.position.set(-0.25, 0, 0);
        this.leftViewPlane.scale.set(0.49, 0.49, 1); // Increased from 0.48 to 0.49
        this.rightViewPlane.position.set(0.25, 0, 0);
        this.rightViewPlane.scale.set(0.49, 0.49, 1); // Increased from 0.48 to 0.49
        this.leftViewPlane.visible = true;
        this.rightViewPlane.visible = true;
        
        this.renderer.render(this.viewportScene, this.viewportCamera);
    }

    renderLeftView() {
        this.leftViewPlane.position.set(0, 0, 0);
        this.leftViewPlane.scale.set(1, 1, 1);
        this.rightViewPlane.visible = false;
        this.leftViewPlane.visible = true;
        
        this.renderer.render(this.viewportScene, this.viewportCamera);
    }

    renderRightView() {
        this.rightViewPlane.position.set(0, 0, 0);
        this.rightViewPlane.scale.set(1, 1, 1);
        this.leftViewPlane.visible = false;
        this.rightViewPlane.visible = true;
        
        this.renderer.render(this.viewportScene, this.viewportCamera);
    }

    renderCombinedView(mainRenderer, mainScene, mainCamera) {
        // First render the main scene
        this.renderer.render(mainScene, mainCamera);
        
        // Then render camera views in corner - make the views slightly larger
        const size = this.cameraParams.COMBINED_VIEW_RATIO;
        const viewportWidth = Math.floor(window.innerWidth * size);
        const viewportHeight = Math.floor(viewportWidth * 0.5); // Maintain aspect ratio
        
        // Position for camera views (bottom-right corner instead of top-right)
        const viewportX = window.innerWidth - viewportWidth - 10; // 10px padding
        const viewportY = 10; // Position at bottom with 10px padding
        
        // Save current viewport
        const currentViewport = this.renderer.getViewport(new THREE.Vector4());
        
        // Setup small viewport in corner
        this.renderer.setViewport(viewportX, viewportY, viewportWidth, viewportHeight);
        
        // Prepare camera views - increase scale slightly for larger views
        this.leftViewPlane.position.set(-0.25, 0, 0);
        this.leftViewPlane.scale.set(0.49, 0.49, 1);  // Increased from 0.48 to 0.49
        this.rightViewPlane.position.set(0.25, 0, 0);
        this.rightViewPlane.scale.set(0.49, 0.49, 1); // Increased from 0.48 to 0.49
        this.leftViewPlane.visible = true;
        this.rightViewPlane.visible = true;
        
        // Render camera views with scissor test to avoid clearing main scene
        this.renderer.setScissorTest(true);
        this.renderer.setScissor(viewportX, viewportY, viewportWidth, viewportHeight);
        this.renderer.render(this.viewportScene, this.viewportCamera);
        this.renderer.setScissorTest(false);
        
        // Restore full viewport
        this.renderer.setViewport(currentViewport);
    }

    extractCameraImageData() {
        // Read pixels from render targets
        const leftPixels = new Uint8Array(
            this.cameraParams.RESOLUTION.width * this.cameraParams.RESOLUTION.height * 4
        );
        const rightPixels = new Uint8Array(
            this.cameraParams.RESOLUTION.width * this.cameraParams.RESOLUTION.height * 4
        );
        
        this.renderer.setRenderTarget(this.leftRenderTarget);
        this.renderer.readRenderTargetPixels(
            this.leftRenderTarget,
            0, 0,
            this.cameraParams.RESOLUTION.width, this.cameraParams.RESOLUTION.height,
            leftPixels
        );
        
        this.renderer.setRenderTarget(this.rightRenderTarget);
        this.renderer.readRenderTargetPixels(
            this.rightRenderTarget,
            0, 0,
            this.cameraParams.RESOLUTION.width, this.cameraParams.RESOLUTION.height,
            rightPixels
        );
        
        // Reset render target
        this.renderer.setRenderTarget(null);
        
        return {
            left: {
                pixels: leftPixels,
                width: this.cameraParams.RESOLUTION.width,
                height: this.cameraParams.RESOLUTION.height,
                intrinsics: this.leftIntrinsics
            },
            right: {
                pixels: rightPixels,
                width: this.cameraParams.RESOLUTION.width,
                height: this.cameraParams.RESOLUTION.height,
                intrinsics: this.rightIntrinsics
            }
        };
    }
}