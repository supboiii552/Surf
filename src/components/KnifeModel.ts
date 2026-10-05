/**
 * First-person CS2 Karambit Knife Viewmodel
 * Procedural Three.js geometry with dynamic viewmodel sway and bobbing.
 */

import * as THREE from 'three';

export class KnifeViewModel {
  public group: THREE.Group;
  private blade: THREE.Mesh;
  private handle: THREE.Mesh;
  private ring: THREE.Mesh;
  private basePosition = new THREE.Vector3(0.24, -0.22, -0.42);
  private currentSway = new THREE.Vector3();
  private currentTilt = 0;
  private bobCycle = 0;

  constructor() {
    this.group = new THREE.Group();

    // Materials
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.1,
    });

    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
      metalness: 0.2,
    });

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.8,
      roughness: 0.25,
    });

    // 1. Curved Blade Shape (Karambit Talon)
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.quadraticCurveTo(0.08, 0.04, 0.16, -0.04);
    bladeShape.quadraticCurveTo(0.22, -0.14, 0.2, -0.24); // Sharp tip
    bladeShape.quadraticCurveTo(0.12, -0.16, 0.04, -0.06);
    bladeShape.lineTo(0, -0.04);
    bladeShape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    };

    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    bladeGeo.center();
    this.blade = new THREE.Mesh(bladeGeo, bladeMaterial);
    this.blade.position.set(0.04, 0.08, 0);
    this.blade.rotation.z = Math.PI * 0.15;
    this.group.add(this.blade);

    // 2. Handle
    const handleGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.14, 8);
    this.handle = new THREE.Mesh(handleGeo, handleMaterial);
    this.handle.position.set(-0.02, -0.04, 0);
    this.handle.rotation.z = -Math.PI * 0.22;
    this.group.add(this.handle);

    // Handle grip ridges
    for (let i = 0; i < 3; i++) {
      const ridgeGeo = new THREE.TorusGeometry(0.019, 0.003, 6, 12);
      const ridge = new THREE.Mesh(ridgeGeo, ringMaterial);
      ridge.position.set(-0.03 + i * 0.02, -0.02 - i * 0.03, 0);
      ridge.rotation.z = -Math.PI * 0.22;
      this.group.add(ridge);
    }

    // 3. Pommel Finger Ring (Signature Karambit safety ring)
    const ringGeo = new THREE.TorusGeometry(0.022, 0.005, 8, 16);
    this.ring = new THREE.Mesh(ringGeo, ringMaterial);
    this.ring.position.set(-0.06, -0.11, 0);
    this.group.add(this.ring);

    // Initial transform relative to camera
    this.group.position.copy(this.basePosition);
    this.group.rotation.set(-0.15, -0.2, 0.05);
    this.group.scale.set(1.1, 1.1, 1.1);
  }

  public update(dt: number, speedUnits: number, lookDeltaX: number, lookDeltaY: number, strafeDir: number) {
    // 1. Viewmodel sway from mouse/touch rotation
    const targetSwayX = -lookDeltaX * 0.015;
    const targetSwayY = lookDeltaY * 0.015;
    const targetTilt = strafeDir * 0.08 - lookDeltaX * 0.03;

    this.currentSway.x += (targetSwayX - this.currentSway.x) * Math.min(1, dt * 12);
    this.currentSway.y += (targetSwayY - this.currentSway.y) * Math.min(1, dt * 12);
    this.currentTilt += (targetTilt - this.currentTilt) * Math.min(1, dt * 10);

    // 2. Bobbing when moving
    const speedFactor = Math.min(2.5, speedUnits / 1200);
    if (speedUnits > 100) {
      this.bobCycle += dt * (5 + speedFactor * 4);
    }
    const bobX = Math.cos(this.bobCycle) * 0.008 * speedFactor;
    const bobY = Math.sin(this.bobCycle * 2) * 0.006 * speedFactor;

    // Apply combined position and rotation
    this.group.position.x = this.basePosition.x + this.currentSway.x + bobX;
    this.group.position.y = this.basePosition.y + this.currentSway.y + bobY;
    this.group.position.z = this.basePosition.z;

    this.group.rotation.z = 0.05 + this.currentTilt;
    this.group.rotation.y = -0.2 + this.currentSway.x * 1.5;
    this.group.rotation.x = -0.15 - this.currentSway.y * 1.5;
  }
}
