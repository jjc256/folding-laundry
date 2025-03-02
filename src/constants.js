// Simulation parameters
export const SIMULATION_PARAMS = {
    DAMPING: 0.05,
    DRAG: 0.95,
    MASS: 0.1,
    GRAVITY: 981 * 1.4,
    TIMESTEP: 18 / 1000,
    TIMESTEP_SQ: 18 / 1000 * 18 / 1000,
    
    // Cloth parameters
    xSegs: 30,
    ySegs: 30,
    restDistance: 10,
    
    // Table parameters
    TABLE_Y: -100,
    TABLE_WIDTH: 600,
    TABLE_DEPTH: 600,
    TABLE_THICKNESS: 20,
    FRICTION: 0.8,
    STICK_THRESHOLD: 0.1,
    COLLISION_ITERATIONS: 5,
    CONSTRAINT_ITERATIONS: 3,
    RELAXATION: 0.2,
    SUB_STEPS: 4,
    COLLISION_RESPONSE: 0.5,
    REST_THRESHOLD: 1e-4,
    
    // Hold parameters
    HOLD_TIME: 1000,
    CENTER_PIN_HEIGHT: 500,
    ANGULAR_DAMPING: 0.95
};

// Camera parameters
export const CAMERA_PARAMS = {
    SEPARATION: 61,     // Increased from 6cm to 30cm for better stereo effect at this scale
    HEIGHT: 400,        // Increased from 50cm to 150cm to see more of the table
    ANGLE: 60,          // Slightly decreased from 45° to 40° for a better view
    FOV: 55,            // Slightly decreased from 60° to 55° to reduce distortion
    RESOLUTION: {
        width: 640,
        height: 480
    },
    COMBINED_VIEW_RATIO: 0.35  // Increased from 0.25 to 0.35 for larger camera views
};

// Table parameters
export const TABLE_Y = SIMULATION_PARAMS.TABLE_Y;
