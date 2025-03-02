# Cloth Simulation Specification

## Overview
Create a realistic cloth simulation that demonstrates the natural physics of fabric interacting with a surface, particularly focusing on folding and crumpling behaviors. The simulation should be visually believable, interactive, and computationally efficient enough to run in a browser environment.

## Core Requirements

### Physics Simulation
1. **Mass-Spring System**
   - Implement a two-sided cloth structure with interconnected particles
   - Each point in the cloth should have mass and respond to forces
   - Connect particles with structural, shear, and bending constraints
   - Layer separation constraints to maintain cloth thickness

2. **Realistic Folding Behavior**
   - Cloth should naturally fold and crumple when colliding with surfaces
   - Prevent unrealistic sliding by implementing proper friction models
   - Detect and handle self-collisions to allow overlapping folds
   - Implement fold detection and specialized handling for fold regions
   - Apply variable collision responses based on contact conditions

3. **Physical Properties**
   - Configurable stiffness affecting how easily the cloth bends
   - Adjustable thickness with proper collision volumes
   - Variable damping to control oscillation
   - Gravity strength control
   - Friction coefficients for different surfaces

4. **Collision Handling**
   - Hard-surface collision with tables and floors
   - Self-collision detection with specialized fold-friendly algorithms
   - Prevent penetration while allowing controlled overlaps for folding
   - Use collision regions to identify potential fold formations
   - Different friction models for different surface types

### Visual Representation

1. **Cloth Rendering**
   - Two-sided mesh with proper normals for lighting
   - Texture mapping with realistic fabric textures
   - Separate handling of top and bottom cloth faces
   - Edge seams for visual thickness
   - Shadow casting and receiving

2. **Environment**
   - Wooden table surface with realistic textures
   - Table legs and floor for context
   - Proper lighting setup with main and fill lights
   - Shadows for visual depth
   - Camera controls for viewing the simulation from different angles

### User Interface

1. **Simulation Controls**
   - Start/pause simulation
   - Reset simulation to initial state
   - Adjustable parameters with real-time updates

2. **Parameter Adjustments**
   - Cloth size slider (1-8 units)
   - Cloth thickness slider (0.01-0.2 units)
   - Mesh resolution control (5-20 segments per side)
   - Material stiffness slider (0.05-0.5, lower values create more folding)
   - Damping control (0-0.2)
   - Gravity strength (0.1-1.0)

3. **Information Display**
   - Debug information showing simulation statistics
   - Visual indicators for fold regions (optional)

## Technical Details

### Cloth Structure

1. **Particle System**
   - Double-layered particles (top and bottom cloth surfaces)
   - Explicit thickness between layers
   - Particles store:
     - Current position (x,y,z)
     - Previous position for velocity calculation
     - Flags for fixed/pinned status
     - Contact state (isStuck, inFold)
     - UV coordinates for texturing

2. **Constraint Types**
   - Thickness constraints between corresponding top/bottom particles
   - Structural constraints (horizontal and vertical)
   - Shear constraints (diagonal)
   - Each with appropriate rest lengths and type-specific stiffness

### Physics Implementation

1. **Integration Method**
   - Position-based Verlet integration
   - No explicit velocity storage (derived from position differentials)
   - Multiple constraint solving iterations per frame (4+ recommended)

2. **Special Folding Improvements**
   - Fold region identification algorithm:
     - Detect particles that are close but not directly connected
     - Mark these regions for special handling
   - Three-pass collision resolution:
     - Identify potential fold regions
     - Apply specialized collision responses to fold regions
     - Add subtle randomness to fold regions for natural variation

3. **Collision Response**
   - Enhanced friction model that fully stops horizontal movement on contact
   - Particles that hit surfaces are marked as "stuck"
   - Stuck particles resist movement during collision response
   - Different collision behavior for particles in fold regions

### Rendering Techniques

1. **Mesh Construction**
   - Single buffer geometry with explicit faces
   - Separate handling for top, bottom and edge faces
   - Consistent winding order for proper normal calculation
   - Dynamic position updates without recreating geometry

2. **Anti-Flickering Measures**
   - Logarithmic depth buffer
   - High precision rendering
   - Polygon offset to prevent z-fighting
   - Consistent depth testing
   - No transparency in materials

## Simulation Initialization and Flow

1. **Initial Setup**
   - Cloth begins suspended from one corner above the table
   - Initial shape has natural droop and subtle wrinkles
   - Brief hold period (2.5s) before releasing

2. **Drop Phase**
   - Cloth falls under gravity
   - Initial contact with table creates first fold opportunity

3. **Settling Phase**
   - Portions of cloth that hit table are "stuck" with high friction
   - Other parts continue falling, creating natural folds
   - Self-collision handling allows overlapping folds
   - Special fold region handling enhances folding behavior

4. **Final Resting State**
   - Cloth settles into a naturally folded/crumpled configuration
   - Subtle movements from wind or user interaction can continue

## Performance Considerations
- Limit particle count based on needed detail
- Multiple constraint solving iterations are expensive but necessary
- Self-collision detection is the most expensive operation, optimize with spatial partitioning
- Use efficient collision detection algorithms
- Consider implementing different detail levels based on device capability

## Enhancement Opportunities
- Tearing simulation
- Multi-touch interaction for dragging cloth
- Different fabric types with varying properties
- Wind effects with directionality
- Realistic cloth sounds
- Haptic feedback for touch devices
- Multiple cloth pieces with interaction between them
- Pre-defined folding patterns or guides