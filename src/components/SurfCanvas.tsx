/**
 * CS2 Surf 3D WebGL Canvas
 * Renders Three.js scene, map geometry, decorative props, speed particles, and knife model.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MapDefinition, GameSettings, PlayerPhysicsState, InputState } from '../types';
import { surfPhysics, UNITS_PER_METER } from '../physics/surfPhysics';
import { surfAudio } from '../audio/surfAudio';
import { KnifeViewModel } from './KnifeModel';

interface SurfCanvasProps {
  map: MapDefinition;
  settings: GameSettings;
  inputsRef: React.MutableRefObject<InputState>;
  onSpeedChange: (speed: number) => void;
  onStageChange: (stage: number) => void;
  onTimerChange: (elapsedMs: number) => void;
  onFinishCourse: (timeMs: number, maxSpeed: number) => void;
  onRampStatusChange: (isOnRamp: boolean) => void;
  restartTrigger: number;
}

export const SurfCanvas: React.FC<SurfCanvasProps> = ({
  map,
  settings,
  inputsRef,
  onSpeedChange,
  onStageChange,
  onTimerChange,
  onFinishCourse,
  onRampStatusChange,
  restartTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerPhysicsState>({
    x: map.spawnPosition[0],
    y: map.spawnPosition[1],
    z: map.spawnPosition[2],
    vx: 0,
    vy: 0,
    vz: 0,
    pitch: 0.05,
    yaw: map.spawnYaw,
    isOnRamp: false,
    rampNormal: null,
    speed: 0,
    stage: 1,
    stageStartTime: performance.now(),
    isTimerRunning: true,
    hasFinished: false,
    finishTime: null,
  });

  const maxSpeedSessionRef = useRef(0);
  const knifeRef = useRef<KnifeViewModel | null>(null);

  // Restart function
  const triggerRestart = () => {
    const p = playerRef.current;
    surfPhysics.respawnPlayer(p, map);
    surfAudio.playRespawn();
    onStageChange(1);
    onSpeedChange(0);
    onRampStatusChange(false);
  };

  // React to parent restart button or keypress
  useEffect(() => {
    if (restartTrigger > 0) {
      triggerRestart();
    }
  }, [restartTrigger]);

  // Main 3D scene effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(map.skyColorTop);
    scene.fog = new THREE.Fog(map.fogColor, map.fogNear, map.fogFar);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      settings.fov,
      container.clientWidth / container.clientHeight,
      0.1,
      800
    );
    scene.add(camera);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(map.sunColor, 1.35);
    dirLight.position.set(...map.sunPosition);
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(map.skyColorTop, map.fogColor, 0.4);
    scene.add(hemiLight);

    // 5. Build Map Geometry
    const ramps = map.buildRamps();
    surfPhysics.setRamps(ramps);

    // Group for ramps
    const mapGroup = new THREE.Group();

    // Collect triangle vertices for BufferGeometry
    const facePositions: number[] = [];
    const faceNormals: number[] = [];
    const faceColors: number[] = [];

    const faceColorObj = new THREE.Color(map.rampFaceColor);
    const sideColorObj = new THREE.Color(map.rampSideColor);
    const floorColorObj = new THREE.Color(map.floorColor);

    ramps.forEach(r => {
      const col = r.side === 'floor' ? floorColorObj : r.side === 'left' ? faceColorObj : sideColorObj;

      [r.v1, r.v2, r.v3].forEach(v => {
        facePositions.push(v.x, v.y, v.z);
        faceNormals.push(r.normal.x, r.normal.y, r.normal.z);
        faceColors.push(col.r, col.g, col.b);
      });
    });

    const rampGeometry = new THREE.BufferGeometry();
    rampGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    rampGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(faceNormals, 3));
    rampGeometry.setAttribute('color', new THREE.Float32BufferAttribute(faceColors, 3));

    const rampMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
    mapGroup.add(rampMesh);

    // Edge wireframe / curb lines for high contrast visibility
    const edgeGeo = new THREE.WireframeGeometry(rampGeometry);
    const edgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(map.rampBorderColor),
      transparent: true,
      opacity: 0.45,
    });
    const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
    mapGroup.add(edgeMesh);

    // 6. Decorative Props (Arches, Columns, Floating Clouds, Booster Rings)
    if (map.decorativeProps) {
      map.decorativeProps.forEach(prop => {
        const propGroup = new THREE.Group();
        propGroup.position.set(...prop.position);
        if (prop.scale) propGroup.scale.set(...prop.scale);

        if (prop.type === 'arch') {
          // Classical archway
          const archMat = new THREE.MeshStandardMaterial({ color: prop.color || 0xffffff, roughness: 0.3 });
          const leftCol = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 12, 16), archMat);
          leftCol.position.set(-6, 6, 0);
          const rightCol = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 12, 16), archMat);
          rightCol.position.set(6, 6, 0);
          const topArch = new THREE.Mesh(new THREE.TorusGeometry(6, 0.7, 12, 24, Math.PI), archMat);
          topArch.position.set(0, 12, 0);
          topArch.rotation.z = 0;
          propGroup.add(leftCol, rightCol, topArch);
        } else if (prop.type === 'ring') {
          // Floating speed booster ring
          const ringMat = new THREE.MeshBasicMaterial({ color: prop.color || 0xfde047, wireframe: true });
          const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.5, 8, 24), ringMat);
          propGroup.add(ring);
        } else if (prop.type === 'column') {
          const colMat = new THREE.MeshStandardMaterial({ color: prop.color || 0xffffff, roughness: 0.4 });
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 10, 16), colMat);
          col.position.y = 5;
          propGroup.add(col);
        } else if (prop.type === 'cloud') {
          const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            transparent: true,
            opacity: 0.85,
          });
          const puff1 = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 12), cloudMat);
          const puff2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), cloudMat);
          puff2.position.set(1.5, -0.2, 0.5);
          const puff3 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), cloudMat);
          puff3.position.set(-1.4, -0.1, -0.4);
          propGroup.add(puff1, puff2, puff3);
        }
        mapGroup.add(propGroup);
      });
    }

    // Finish Zone Aura (golden victory pillar)
    const fz = map.finishZone;
    const finishAuraGeo = new THREE.CylinderGeometry(fz.size[0] * 0.4, fz.size[0] * 0.4, 80, 24, 1, true);
    const finishAuraMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const finishAura = new THREE.Mesh(finishAuraGeo, finishAuraMat);
    finishAura.position.set(fz.center[0], fz.center[1] + 40, fz.center[2]);
    mapGroup.add(finishAura);

    scene.add(mapGroup);

    // 7. Dynamic Speed Lines (stream past camera when going fast)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 30;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = -Math.random() * 40;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0,
    });
    const speedParticles = new THREE.Points(particleGeo, particleMat);
    camera.add(speedParticles);

    // 8. Knife Viewmodel
    const knife = new KnifeViewModel();
    knifeRef.current = knife;
    if (settings.knifeModel) {
      camera.add(knife.group);
    }

    // Respawn initial state
    surfPhysics.respawnPlayer(playerRef.current, map);

    // 9. Pointer Lock for Desktop
    const onCanvasClick = () => {
      // Resume audio on first user touch / click
      surfAudio.resume();
      if (!('ontouchstart' in window) && document.pointerLockElement !== container) {
        container.requestPointerLock().catch(() => {});
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === container) {
        const sens = settings.mouseSensitivity * 0.0022;
        const dx = e.movementX * sens;
        const dy = e.movementY * sens * (settings.invertY ? 1 : -1);

        playerRef.current.yaw -= dx;
        playerRef.current.pitch = Math.max(-1.5, Math.min(1.5, playerRef.current.pitch - dy));

        inputsRef.current.lookDeltaX += e.movementX;
        inputsRef.current.lookDeltaY += e.movementY;
      }
    };

    container.addEventListener('click', onCanvasClick);
    window.addEventListener('mousemove', onMouseMove);

    // 10. Animation & Simulation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const rawDt = (time - lastTime) / 1000;
      lastTime = time;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      const p = playerRef.current;
      const inputs = inputsRef.current;

      // Handle touch look delta
      if (inputs.lookDeltaX !== 0 || inputs.lookDeltaY !== 0) {
        const touchSens = settings.touchSensitivity * 0.0035;
        p.yaw -= inputs.lookDeltaX * touchSens;
        p.pitch = Math.max(-1.5, Math.min(1.5, p.pitch - inputs.lookDeltaY * touchSens * (settings.invertY ? 1 : -1)));
      }

      // Step physics
      surfPhysics.step(
        p,
        inputs,
        settings,
        map,
        dt,
        () => surfAudio.playBooster(),
        (stage) => {
          surfAudio.playCheckpoint();
          onStageChange(stage);
        },
        () => {
          surfAudio.playVictory();
          if (p.finishTime) {
            onFinishCourse(p.finishTime, maxSpeedSessionRef.current);
          }
        },
        () => {
          triggerRestart();
        }
      );

      // Track max speed
      if (p.speed > maxSpeedSessionRef.current) {
        maxSpeedSessionRef.current = p.speed;
      }

      // Update camera position and view angle
      camera.position.set(p.x, p.y + 0.8, p.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = p.yaw;
      camera.rotation.x = p.pitch;

      // Update audio synthesis
      surfAudio.updateSpeed(p.speed, p.isOnRamp);

      // Update speed lines particles
      if (settings.speedLines) {
        const particleOpacity = Math.max(0, Math.min(0.7, (p.speed - 900) / 2000));
        particleMat.opacity = particleOpacity;
        const posArray = particleGeo.attributes.position.array as Float32Array;
        const streamSpeed = (p.speed / UNITS_PER_METER) * dt * 1.5;
        for (let i = 2; i < posArray.length; i += 3) {
          posArray[i] += streamSpeed;
          if (posArray[i] > 5) {
            posArray[i] = -35;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particleMat.opacity = 0;
      }

      // Update Knife viewmodel
      if (knifeRef.current && settings.knifeModel) {
        const strafeDir = (inputs.strafeRight ? 1 : 0) - (inputs.strafeLeft ? 1 : 0);
        knifeRef.current.update(dt, p.speed, inputs.lookDeltaX, inputs.lookDeltaY, strafeDir);
      }

      // Reset touch look delta for next frame
      inputs.lookDeltaX = 0;
      inputs.lookDeltaY = 0;

      // Notify HUD
      onSpeedChange(p.speed);
      onRampStatusChange(p.isOnRamp);
      if (p.isTimerRunning && !p.hasFinished) {
        onTimerChange(time - p.stageStartTime);
      }
    };

    animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.fov = settings.fov;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onCanvasClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      rampGeometry.dispose();
      rampMaterial.dispose();
    };
  }, [map.id, settings.physicsPreset, settings.gravity, settings.airAccelerate, settings.rampStickAssist, settings.fov, settings.knifeModel]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none bg-slate-950" />;
};
