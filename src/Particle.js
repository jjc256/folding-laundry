import * as THREE from 'three';

export default class Particle {
    constructor(x, y, z, mass, drag) {
        this.position = new THREE.Vector3();
        this.previous = new THREE.Vector3();
        this.original = new THREE.Vector3();
        this.a = new THREE.Vector3(0, 0, 0); // acceleration
        this.mass = mass;
        this.invMass = 1 / mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();
        this.drag = drag;

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
        newPos.multiplyScalar(this.drag).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));

        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;

        this.a.set(0, 0, 0);
    }

    // Clone this particle (for saving initial state)
    clone() {
        return {
            position: this.position.clone(),
            previous: this.previous.clone(),
            original: this.original.clone()
        };
    }

    // Restore from saved state
    restore(savedState) {
        this.position.copy(savedState.position);
        this.previous.copy(savedState.previous);
        this.original.copy(savedState.original);
        this.a.set(0, 0, 0);
    }
}
