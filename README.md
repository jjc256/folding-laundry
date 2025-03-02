# Folding Laundry Simulation Project

A physics-based simulation of cloth folding using Three.js, with the goal of developing algorithms for robotic laundry folding.

## Project Overview

This project simulates clothing physics and develops computer vision and robotic manipulation algorithms for automated laundry folding. The system progresses through several phases, from basic cloth simulation to stereo vision, computer vision algorithms, and robotic manipulation, with an end goal of completely automating the laundry-folding process from a pile of clothes to organized stacks.

## Current Status

### Completed: Phase 1 - Cloth Simulation
- Implemented particle-based cloth physics using Three.js
- Created realistic cloth behavior with proper constraints and collision detection
- Developed a table surface with physics interactions
- Fine-tuned simulation parameters for stable and visually appealing results

### In Progress: Phase 2 - Stereo Vision System
- Implementing dual camera setup to simulate robot vision
- Creating UI for viewing from different camera perspectives
- Building tools for image processing and analysis

## Technical Details

### Physics Simulation
- **Particle System**: 30x30 grid with Verlet integration
- **Constraints**: Structural and shear connections between particles
- **Collision**: Multi-iteration collision handling with table surface
- **Parameters**: Optimized damping, gravity, and relaxation values

### Visualization
- Built with Three.js for 3D rendering
- OrbitControls for camera manipulation
- Stats module for performance monitoring

## Planned Features

The project follows an 8-phase implementation plan:

1. ✅ **Basic Cloth Simulation & Visualization**
2. 🔄 **Stereo Vision System**
3. 📅 **Computer Vision & Feature Detection**
4. 📅 **Robot Hand Modeling & Basic Interaction**
5. 📅 **Basic Folding Algorithm**
6. 📅 **Complex Clothing Support**
7. 📅 **Pile Management**
8. 📅 **Advanced UI & Refinement**

## Running the Simulation

### Prerequisites
- Modern web browser with WebGL support
- Node.js and npm (for development)

### Setup
1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser to the URL shown in the terminal (typically http://localhost:3000)

## Controls
- **Mouse Drag**: Rotate camera
- **Mouse Scroll**: Zoom in/out
- **Right-Click Drag**: Pan camera

## Project Structure

```
/home/folding-laundry/
├── index.js          # Main simulation code
├── plan/            
│   ├── plan.md       # Complete project roadmap
│   ├── phase1.md     # Phase 1 implementation details
│   └── phase2.md     # Phase 2 specifications
└── README.md         # This file
```

## Technical Challenges

The project addresses several complex technical challenges:

1. **Cloth Physics**: Implementing stable cloth simulation with realistic draping behavior
2. **Computer Vision**: Developing algorithms to recognize and analyze cloth state
3. **Robot Manipulation**: Creating effective strategies for cloth manipulation
4. **Real-time Performance**: Maintaining interactive frame rates during simulation