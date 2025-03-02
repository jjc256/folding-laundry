import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import ClothSimulation from './src/ClothSimulation.js';
import StereoVision from './src/StereoVision.js';
import UserInterface from './src/UserInterface.js';

class Application {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupCamera();
        this.setupLights();
        this.setupRenderer();
        this.setupControls();

        // Create simulation components
        this.clothSim = new ClothSimulation(this.scene);
        this.stereoVision = new StereoVision(this.scene, this.renderer);
        this.ui = new UserInterface(this);
        
        this.currentView = 'combined';
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        this.camera.position.set(0, 500, 1000);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 200, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // API for UI
    resetSimulation() {
        this.clothSim.reset();
    }

    enableControls(enabled) {
        this.controls.enabled = enabled;
    }

    updateCameraParams(params) {
        this.stereoVision.updateCameraParams(params);
    }

    setCameraHelpers(visible) {
        this.stereoVision.setHelpersVisible(visible);
    }

    setWireframe(isWireframe) {
        this.clothSim.setWireframe(isWireframe);
    }

    setCurrentView(viewMode) {
        this.currentView = viewMode;
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        // Update simulation
        this.clothSim.simulate(Date.now());
        
        // Render the scene according to current view
        this.renderCurrentView();
        
        this.stats.update();
    }

    renderCurrentView() {
        // Always update stereo camera views
        this.stereoVision.renderViews();
        
        // Render based on current view mode
        switch (this.ui.currentView) {
            case 'main':
                this.renderer.render(this.scene, this.camera);
                break;
                
            case 'left':
                this.stereoVision.renderLeftView();
                break;
                
            case 'right':
                this.stereoVision.renderRightView();
                break;
                
            case 'split':
                this.stereoVision.renderSplitView();
                break;
                
            case 'combined':
                this.stereoVision.renderCombinedView(this.renderer, this.scene, this.camera);
                break;
        }
    }
}

// Start the application
function init() {
    if (typeof THREE !== 'undefined' && 
        typeof OrbitControls !== 'undefined' && 
        typeof Stats !== 'undefined') {
        
        console.log("All libraries loaded successfully.");
        new Application();
    } else {
        console.error("Error: One or more libraries failed to load.");
    }
}

init();