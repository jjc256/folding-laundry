let THREE, OrbitControls, ParametricGeometry, Stats;

async function init() {
    try {
        // Development: Use local modules
        THREE = await import('three');
        const orbitControls = await import('three/examples/jsm/controls/OrbitControls');
        const parametricGeometry = await import('three/examples/jsm/geometries/ParametricGeometry');
        const stats = await import('three/examples/jsm/libs/stats.module');
        
        OrbitControls = orbitControls.OrbitControls;
        ParametricGeometry = parametricGeometry.ParametricGeometry;
        Stats = stats.default;
    } catch (e) {
        // Production: Fallback to CDN
        THREE = await import('https://cdn.jsdelivr.net/npm/three/build/three.module.js');
        const orbitControls = await import('https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/OrbitControls.js');
        const parametricGeometry = await import('https://cdn.jsdelivr.net/npm/three/examples/jsm/geometries/ParametricGeometry.js');
        const stats = await import('https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/stats.module.js');
        
        OrbitControls = orbitControls.OrbitControls;
        ParametricGeometry = parametricGeometry.ParametricGeometry;
        Stats = stats.default;
    }

    // Start your existing code here
    new TableCloth();
}

init();

// Simulation parameters
const DAMPING = 0.03;
const DRAG = 1 - DAMPING;
const MASS = 0.1;
const GRAVITY = 981 * 1.4;
const TIMESTEP = 18 / 1000;
const TIMESTEP_SQ = TIMESTEP * TIMESTEP;

// Cloth parameters
const xSegs = 30;
const ySegs = 30;
const restDistance = 10;

// Table parameters
const TABLE_Y = -100;
const TABLE_WIDTH = 300;
const TABLE_DEPTH = 300;
const FRICTION = 0.8;
const STICK_THRESHOLD = 0.1;
const COLLISION_ITERATIONS = 3;
const COLLISION_RESPONSE = 0.75;
const TABLE_THICKNESS = 20;

const HOLD_TIME = 1000; // Hold for 1 second before dropping
const CENTER_PIN_HEIGHT = 500; // Height to hold the center point
const ANGULAR_DAMPING = 1;

class Particle {
    constructor(x, y, z, mass) {
        this.position = new THREE.Vector3();
        this.previous = new THREE.Vector3();
        this.original = new THREE.Vector3();
        this.a = new THREE.Vector3(0, 0, 0); // acceleration
        this.mass = mass;
        this.invMass = 1 / mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();

        // Initialize position
        this.position.set(x, y, z);
        this.previous.copy(this.position);
        this.original.copy(this.position);
    }

    addForce(force) {
        this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
    }

    integrate(timesq) {
        const newPos = this.tmp.subVectors(this.position, this.previous);
        newPos.multiplyScalar(DRAG).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));

        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;

        this.a.set(0, 0, 0);
    }
}

class TableCloth {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupCamera();
        this.setupLights();
        this.setupRenderer();
        this.setupCloth();
        this.setupTable();
        this.setupControls();
        
        this.startTime = Date.now();
        this.isPinned = true;

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

    setupCloth() {
        // Create cloth geometry and particles
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
                this.particles.push(new Particle(px, py, pz, MASS));
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
        const tableGeometry = new THREE.BoxGeometry(
            TABLE_WIDTH,
            20,
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

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    createConstraints() {
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

    simulate() {
        // Check if we should release the pin
        if (this.isPinned && Date.now() - this.startTime > HOLD_TIME) {
            this.isPinned = false;
        }

        // Apply gravity
        const gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS);
        
        // Update particles
        for (const particle of this.particles) {
            particle.addForce(gravity);
            particle.integrate(TIMESTEP_SQ);
        }

        // Pin center point if still holding
        if (this.isPinned) {
            const centerIndex = Math.floor(this.particles.length / 2);
            const centerParticle = this.particles[centerIndex];
            centerParticle.position.set(0, CENTER_PIN_HEIGHT, 0);
            centerParticle.previous.copy(centerParticle.position);
        }

        // Multiple collision iterations for stability
        for (let i = 0; i < COLLISION_ITERATIONS; i++) {
            // Satisfy constraints first
            for (const [p1, p2, distance] of this.constraints) {
                this.satisfyConstraint(p1, p2, distance);
            }

            // Then handle collisions
            this.handleCollisions();
        }
    }

    handleCollisions() {
        const tableTop = TABLE_Y + TABLE_THICKNESS/2;
        const centerOfMass = this.calculateCenterOfMass();
        
        for (const particle of this.particles) {
            if (particle.position.y < tableTop) {
                // Calculate penetration depth
                const penetration = tableTop - particle.position.y;
                
                // Store original velocity for angular momentum
                const velocity = new THREE.Vector3().subVectors(
                    particle.position,
                    particle.previous
                );

                // Calculate radius vector from center of mass
                const radius = new THREE.Vector3().subVectors(
                    particle.position,
                    centerOfMass
                );
                
                // Apply position correction
                particle.position.y = tableTop;
                
                // Apply friction with angular momentum conservation
                if (velocity.length() < STICK_THRESHOLD) {
                    particle.previous.copy(particle.position);
                } else {
                    // Compute tangential velocity
                    const tangential = new THREE.Vector3(velocity.x, 0, velocity.z);
                    tangential.multiplyScalar(ANGULAR_DAMPING);
                    
                    // Apply damped velocity while preserving direction
                    particle.previous.x = particle.position.x - tangential.x * (1 - FRICTION);
                    particle.previous.z = particle.position.z - tangential.z * (1 - FRICTION);
                    particle.previous.y = particle.position.y - velocity.y * COLLISION_RESPONSE;
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
        const diff = new THREE.Vector3().subVectors(p2.position, p1.position);
        const currentDist = diff.length();
        if (currentDist === 0) return;
        
        const correction = diff.multiplyScalar(1 - distance / currentDist);
        const correctionHalf = correction.multiplyScalar(0.5);
        p1.position.add(correctionHalf);
        p2.position.sub(correctionHalf);
    }

    updateClothGeometry() {
        const positions = this.clothMesh.geometry.attributes.position;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
        }
        
        positions.needsUpdate = true;
        this.clothMesh.geometry.computeVertexNormals();
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        this.simulate();
        this.updateClothGeometry();
        
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }
}

// The simulation is started in the init() function