import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import Particle from './Particle.js';
import { SIMULATION_PARAMS } from './constants.js';

export default class ClothSimulation {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.constraints = [];
        this.originalParticlePositions = [];
        this.isPinned = true;
        this.startTime = Date.now();
        
        this.setupCloth();
        this.setupTable(); // Add table setup
        this.saveInitialState();
    }

    setupCloth() {
        // Create cloth geometry and particles
        const { xSegs, ySegs, MASS, DRAG, restDistance } = SIMULATION_PARAMS;
        const clothWidth = 300;
        const clothHeight = 200;
        const stepX = clothWidth / xSegs;
        const stepY = clothHeight / ySegs;

        // Initialize particles
        this.particles = [];
        for (let y = 0; y <= ySegs; y++) {
            for (let x = 0; x <= xSegs; x++) {
                const px = (x - xSegs/2) * stepX;
                const py = 200; // Start height
                const pz = (y - ySegs/2) * stepY;
                this.particles.push(new Particle(px, py, pz, MASS, DRAG));
            }
        }

        // Create constraints
        this.constraints = [];
        this.createConstraints();

        // Create cloth mesh
        const geometry = new ParametricGeometry(
            (u, v, target) => {
                const x = u * clothWidth - clothWidth/2;
                const y = v * clothHeight;
                const z = 0;
                target.set(x, y, z);
            },
            xSegs,
            ySegs
        );

        const material = new THREE.MeshPhongMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            wireframe: false
        });

        this.clothMesh = new THREE.Mesh(geometry, material);
        this.clothMesh.castShadow = true;
        this.clothMesh.receiveShadow = true;
        this.scene.add(this.clothMesh);
    }

    setupTable() {
        const { TABLE_Y, TABLE_WIDTH, TABLE_DEPTH, TABLE_THICKNESS } = SIMULATION_PARAMS;
        
        const tableGeometry = new THREE.BoxGeometry(
            TABLE_WIDTH,
            TABLE_THICKNESS,
            TABLE_DEPTH
        );
        
        const tableMaterial = new THREE.MeshPhongMaterial({
            color: 0x886633
        });
        
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = TABLE_Y;
        this.table.receiveShadow = true;
        this.scene.add(this.table);
    }

    createConstraints() {
        const { xSegs, ySegs, restDistance } = SIMULATION_PARAMS;
        
        // Structural constraints (existing)
        for (let y = 0; y < ySegs; y++) {
            for (let x = 0; x < xSegs; x++) {
                const p1 = this.particles[y * (xSegs + 1) + x];
                const p2 = this.particles[y * (xSegs + 1) + (x + 1)];
                const p3 = this.particles[(y + 1) * (xSegs + 1) + x];
                
                this.constraints.push([p1, p2, restDistance]);
                this.constraints.push([p1, p3, restDistance]);
            }
        }

        // Add shear constraints
        const diagonalDist = Math.sqrt(restDistance * restDistance * 2);
        for (let y = 0; y < ySegs; y++) {
            for (let x = 0; x < xSegs; x++) {
                const p1 = this.particles[y * (xSegs + 1) + x];
                const p2 = this.particles[(y + 1) * (xSegs + 1) + (x + 1)];
                const p3 = this.particles[y * (xSegs + 1) + (x + 1)];
                const p4 = this.particles[(y + 1) * (xSegs + 1) + x];
                
                // Add both diagonals
                this.constraints.push([p1, p2, diagonalDist]);
                this.constraints.push([p3, p4, diagonalDist]);
            }
        }
    }
    
    saveInitialState() {
        this.originalParticlePositions = this.particles.map(p => p.clone());
    }
    
    reset() {
        this.isPinned = true;
        this.startTime = Date.now();
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].restore(this.originalParticlePositions[i]);
        }
        
        // Update geometry
        this.updateGeometry();
        
        console.log("Cloth reset");
    }

    setWireframe(isWireframe) {
        this.clothMesh.material.wireframe = isWireframe;
    }

    simulate(timeElapsed) {
        const { 
            TIMESTEP, SUB_STEPS, GRAVITY, HOLD_TIME, CENTER_PIN_HEIGHT, 
            CONSTRAINT_ITERATIONS, COLLISION_ITERATIONS, TABLE_Y, TABLE_THICKNESS
        } = SIMULATION_PARAMS;
        
        const dt = TIMESTEP / SUB_STEPS;
        const dtSq = dt * dt;

        // Check if it's time to release the cloth
        if (this.isPinned && timeElapsed - this.startTime > HOLD_TIME) {
            this.isPinned = false;
            console.log("Cloth released");
        }

        for (let step = 0; step < SUB_STEPS; step++) {
            // Apply gravity
            const gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(SIMULATION_PARAMS.MASS);
            
            for (const particle of this.particles) {
                particle.addForce(gravity);
                particle.integrate(dtSq);
            }

            // Pin handling
            if (this.isPinned) {
                const centerIndex = Math.floor(this.particles.length / 2);
                const centerParticle = this.particles[centerIndex];
                centerParticle.position.set(0, CENTER_PIN_HEIGHT, 0);
                centerParticle.previous.copy(centerParticle.position);
            }

            // Multiple constraint iterations
            for (let i = 0; i < CONSTRAINT_ITERATIONS; i++) {
                for (const [p1, p2, distance] of this.constraints) {
                    this.satisfyConstraint(p1, p2, distance);
                }
            }

            // Multiple collision iterations
            for (let i = 0; i < COLLISION_ITERATIONS; i++) {
                this.handleCollisions();
            }

            // Apply velocity damping
            this.dampVelocities();
        }

        this.updateGeometry();
    }

    updateGeometry() {
        const positions = this.clothMesh.geometry.attributes.position;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
        }
        
        positions.needsUpdate = true;
        this.clothMesh.geometry.computeVertexNormals();
    }

    handleCollisions() {
        const { 
            TABLE_Y, TABLE_THICKNESS, STICK_THRESHOLD, ANGULAR_DAMPING, 
            FRICTION, COLLISION_RESPONSE 
        } = SIMULATION_PARAMS;
        
        const tableTop = TABLE_Y + TABLE_THICKNESS/2;
        const centerOfMass = this.calculateCenterOfMass();
        let totalAngularImpulse = 0;
        
        // First pass: calculate total angular impulse
        for (const particle of this.particles) {
            if (particle.position.y < tableTop) {
                const velocity = new THREE.Vector3().subVectors(
                    particle.position,
                    particle.previous
                );
                
                const radius = new THREE.Vector3().subVectors(
                    particle.position,
                    centerOfMass
                );
                
                // Calculate angular contribution
                const angularImpulse = radius.cross(velocity).y;
                totalAngularImpulse += angularImpulse;
            }
        }

        // Second pass: apply balanced forces
        for (const particle of this.particles) {
            if (particle.position.y < tableTop) {
                const penetration = tableTop - particle.position.y;
                const velocity = new THREE.Vector3().subVectors(
                    particle.position,
                    particle.previous
                );
                
                const radius = new THREE.Vector3().subVectors(
                    particle.position,
                    centerOfMass
                );

                // Apply position correction
                particle.position.y = tableTop;

                if (velocity.length() < STICK_THRESHOLD) {
                    particle.previous.copy(particle.position);
                } else {
                    // Calculate balanced tangential force
                    const tangential = new THREE.Vector3(velocity.x, 0, velocity.z);
                    const angularCorrection = (totalAngularImpulse * ANGULAR_DAMPING) / 
                                           (this.particles.length * radius.length());
                    
                    // Apply corrected velocity
                    particle.previous.x = particle.position.x - 
                        (tangential.x * (1 - FRICTION) - radius.z * angularCorrection);
                    particle.previous.z = particle.position.z - 
                        (tangential.z * (1 - FRICTION) + radius.x * angularCorrection);
                    particle.previous.y = particle.position.y - 
                        velocity.y * COLLISION_RESPONSE;
                }
                
                this.propagateCollision(particle, penetration * 0.5);
            }
        }
    }

    calculateCenterOfMass() {
        const com = new THREE.Vector3();
        for (const particle of this.particles) {
            com.add(particle.position);
        }
        return com.divideScalar(this.particles.length);
    }

    propagateCollision(particle, amount) {
        const { TABLE_Y, TABLE_THICKNESS } = SIMULATION_PARAMS;
        
        // Find connected particles through constraints
        for (const [p1, p2] of this.constraints) {
            if (p1 === particle && p2.position.y < TABLE_Y + TABLE_THICKNESS) {
                p2.position.y += amount;
            } else if (p2 === particle && p1.position.y < TABLE_Y + TABLE_THICKNESS) {
                p1.position.y += amount;
            }
        }
    }

    satisfyConstraint(p1, p2, distance) {
        const { RELAXATION } = SIMULATION_PARAMS;
        
        const diff = new THREE.Vector3().subVectors(p2.position, p1.position);
        const currentDist = diff.length();
        if (currentDist === 0) return;
        
        // Softer constraint satisfaction
        const error = Math.abs(currentDist - distance);
        const relaxFactor = Math.min(RELAXATION, error * 0.5);
        
        const correction = diff.multiplyScalar(
            (1 - distance / currentDist) * relaxFactor
        );
        const correctionHalf = correction.multiplyScalar(0.5);
        p1.position.add(correctionHalf);
        p2.position.sub(correctionHalf);
    }

    dampVelocities() {
        const { DAMPING, REST_THRESHOLD } = SIMULATION_PARAMS;
        
        for (const particle of this.particles) {
            const velocity = new THREE.Vector3().subVectors(
                particle.position,
                particle.previous
            );
            
            // Enhanced damping for small velocities
            const speedSq = velocity.lengthSq();
            if (speedSq < REST_THRESHOLD) {
                particle.previous.copy(particle.position);
            } else if (speedSq < 1.0) {
                const damping = Math.max(0.1, Math.min(0.99, speedSq));
                particle.previous.lerp(particle.position, damping * DAMPING);
            } else {
                particle.previous.lerp(particle.position, DAMPING);
            }
        }
    }
}
