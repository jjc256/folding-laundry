# Phase 2: Stereo Vision System Implementation

## Overview
Building on our successful cloth simulation from Phase 1, we will now implement a stereo vision system that mimics how robots perceive clothing in the real world. This phase focuses on creating dual cameras that can view the cloth from different angles, providing the foundation for the computer vision algorithms in Phase 3.

## Technical Requirements

### 1. Dual Camera Setup

#### 1.1 Camera Configuration
- Create two virtual cameras positioned at configurable distances (baseline)
- Default camera separation: 6cm horizontally
- Default camera height: 50cm above table
- Default camera angle: 45° looking down at table center
- Both cameras should be able to see the entire table surface

#### 1.2 Camera Properties
- FOV: 60 degrees (configurable)
- Resolution: 640x480 pixels (configurable)
- Support for depth information calculation

### 2. Rendering Pipeline

#### 2.1 Render Targets
- Create separate WebGL render targets for each camera
- Implement efficient switching between render targets
- Configure proper projection matrices for each camera

#### 2.2 Visual Feedback
- Visual indicator showing which camera is active
- Option to display camera frustums in 3D view
- Render debug lines showing camera sight lines

### 3. User Interface

#### 3.1 View Controls
- Add buttons to switch between:
  - 3D scene view (default)
  - Left camera view
  - Right camera view
  - Split screen view showing both cameras

#### 3.2 Camera Controls
- UI sliders to adjust:
  - Camera separation (3-10cm)
  - Camera height (30-100cm)
  - Camera angle (30-60°)
  - Field of view (40-90°)

#### 3.3 Layout
- Create side panel for camera controls
- Add tabbed interface for switching between view settings
- Implement responsive design for different screen sizes

### 4. Data Processing

#### 4.1 Camera Intrinsics
- Calculate and store camera intrinsic parameters
- Generate calibration matrix for each camera
- Support export of camera parameters for later use

#### 4.2 Image Processing
- Extract raw image data from render targets
- Convert to grayscale for later processing
- Apply optional Gaussian blur for noise reduction
- Basic image histogram visualization

### 5. Technical Enhancements

#### 5.1 Visualization Tools
- Color-coded depth visualization option
- Toggle wireframe view of cloth in camera views
- Visual indicators showing current camera parameters

#### 5.2 Performance Optimization
- Efficient render target management
- Option to adjust camera resolution for performance
- Frame rate monitoring for each view

## Implementation Plan

### Week 1: Camera Setup
- Create dual camera objects in Three.js
- Position cameras correctly in the scene
- Set up proper projection matrices
- Test basic rendering from both camera perspectives

### Week 2: Render Pipeline
- Implement render targets for each camera
- Create efficient rendering pipeline
- Add basic UI for switching between views
- Test performance and optimize as needed

### Week 3: User Interface
- Build complete UI for camera controls
- Implement responsive layout
- Add visual feedback and indicators
- Create split-screen view functionality

### Week 4: Integration & Testing
- Connect camera system with cloth simulation
- Implement data processing functions
- Add visualization tools
- Final testing and bug fixes

## Success Criteria
- Both cameras can properly view the cloth simulation
- User can switch between different views seamlessly
- Camera parameters can be adjusted in real-time
- System maintains 30+ FPS when rendering all views
- Camera data can be extracted for computer vision use in Phase 3

## Limitations & Constraints
- Simplified camera models without lens distortion
- Basic image processing only (advanced features in Phase 3)
- No physical camera calibration (using ideal parameters)
- Limited to static camera positions during simulation
