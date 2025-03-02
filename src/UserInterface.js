import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { CAMERA_PARAMS } from './constants.js';

export default class UserInterface {
    constructor(app) {
        this.app = app;
        this.currentView = 'combined';
        this.setupGUI();
    }
    
    setupGUI() {
        // GUI for camera controls - position at top right
        this.gui = new GUI({ 
            width: 300,
            title: 'Control Panel'
        });
        
        // Set position to top-right corner
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = '10px';
        this.gui.domElement.style.right = '10px';
        
        // View controls
        const viewFolder = this.gui.addFolder('View Controls');
        const viewOptions = ['main', 'left', 'right', 'split', 'combined'];
        viewFolder.add({view: 'combined'}, 'view', viewOptions)
            .name('Active View')
            .onChange(value => {
                this.currentView = value;
                if (value === 'main' || value === 'combined') {
                    this.app.enableControls(true);
                } else {
                    this.app.enableControls(false);
                }
            });
        
        // Add reset button
        const simulationFolder = this.gui.addFolder('Simulation');
        simulationFolder.add({ reset: () => this.app.resetSimulation() }, 'reset').name('Reset Cloth');
        
        // Camera controls with scaled display values
        const cameraFolder = this.gui.addFolder('Camera Settings');
        
        // Create scaled values for display (1/10th of actual values)
        const cameraParams = {
            // Start with values shown at 1/10th their internal representation
            separation: CAMERA_PARAMS.SEPARATION / 10,
            height: CAMERA_PARAMS.HEIGHT / 10,
            angle: CAMERA_PARAMS.ANGLE,
            fov: CAMERA_PARAMS.FOV,
            showHelpers: false
        };
        
        cameraFolder.add(cameraParams, 'separation', 1, 10, 0.1)  // Range 1-10 (represents 10-100)
            .name('Separation (cm)')
            .onChange(value => {
                // Convert display value back to internal value (multiply by 10)
                this.app.updateCameraParams({ SEPARATION: value * 10 });
            });
        
        cameraFolder.add(cameraParams, 'height', 5, 50, 0.5)     // Range 5-50 (represents 50-500)
            .name('Height (cm)')
            .onChange(value => {
                // Convert display value back to internal value (multiply by 10)
                this.app.updateCameraParams({ HEIGHT: value * 10 });
            });
        
        cameraFolder.add(cameraParams, 'angle', 30, 90, 1)
            .name('Angle (°)')
            .onChange(value => {
                this.app.updateCameraParams({ ANGLE: value });
            });
        
        cameraFolder.add(cameraParams, 'fov', 40, 90, 1)
            .name('FOV (°)')
            .onChange(value => {
                this.app.updateCameraParams({ FOV: value });
            });
        
        // Set showHelpers to true to make it on by default
        cameraParams.showHelpers = true;
        
        cameraFolder.add(cameraParams, 'showHelpers')
            .name('Show Camera Helpers')
            .onChange(value => {
            this.app.setCameraHelpers(value);
            });
            
        // Initialize camera helpers as visible
        this.app.setCameraHelpers(true);
        
        // Visualization options
        const visualFolder = this.gui.addFolder('Visualization');
        const visualParams = {
            wireframe: false
        };
        
        visualFolder.add(visualParams, 'wireframe')
            .name('Wireframe')
            .onChange(value => {
                this.app.setWireframe(value);
            });
        
        // Open by default
        this.gui.open();
        viewFolder.open();
    }
}