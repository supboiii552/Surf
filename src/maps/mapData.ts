/**
 * CS2 Surf Maps Collection
 * Features flagship surf_utopia_njv, surf_kitsune, surf_mesa, and surf_beginner.
 */

import { MapDefinition, RampFace, RampVertex } from '../types';

// Helper to compute unit normal of triangle (v1, v2, v3)
function computeNormal(v1: RampVertex, v2: RampVertex, v3: RampVertex): RampVertex {
  const ax = v2.x - v1.x, ay = v2.y - v1.y, az = v2.z - v1.z;
  const bx = v3.x - v1.x, by = v3.y - v1.y, bz = v3.z - v1.z;

  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

// Build a smooth wedge ramp strip from a sequence of spine points
// A wedge ramp has a sharp top ridge and two sloping side faces (Left and Right sides for surfing)
export function createWedgeRamp(
  points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }>,
  sideTag: 'left' | 'right' = 'left'
): RampFace[] {
  const faces: RampFace[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Direction along spine
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;

    // Normal in horizontal plane
    const hnx = -dz / len;
    const hnz = dx / len;

    // Point 1 cross section:
    // Apex (top ridge), Left Base, Right Base
    const roll1 = p1.roll || 0;
    const cosR1 = Math.cos(roll1);
    const sinR1 = Math.sin(roll1);

    const halfW1 = p1.width * 0.5;
    const h1 = p1.height;

    // Apex 1
    const a1: RampVertex = {
      x: p1.x - sinR1 * h1 * hnx,
      y: p1.y + cosR1 * h1,
      z: p1.z - sinR1 * h1 * hnz,
    };
    // Left base 1
    const lb1: RampVertex = {
      x: p1.x - hnx * halfW1 * cosR1,
      y: p1.y - sinR1 * halfW1,
      z: p1.z - hnz * halfW1 * cosR1,
    };
    // Right base 1
    const rb1: RampVertex = {
      x: p1.x + hnx * halfW1 * cosR1,
      y: p1.y + sinR1 * halfW1,
      z: p1.z + hnz * halfW1 * cosR1,
    };

    // Point 2 cross section:
    const roll2 = p2.roll || 0;
    const cosR2 = Math.cos(roll2);
    const sinR2 = Math.sin(roll2);

    const halfW2 = p2.width * 0.5;
    const h2 = p2.height;

    // Apex 2
    const a2: RampVertex = {
      x: p2.x - sinR2 * h2 * hnx,
      y: p2.y + cosR2 * h2,
      z: p2.z - sinR2 * h2 * hnz,
    };
    // Left base 2
    const lb2: RampVertex = {
      x: p2.x - hnx * halfW2 * cosR2,
      y: p2.y - sinR2 * halfW2,
      z: p2.z - hnz * halfW2 * cosR2,
    };
    // Right base 2
    const rb2: RampVertex = {
      x: p2.x + hnx * halfW2 * cosR2,
      y: p2.y + sinR2 * halfW2,
      z: p2.z + hnz * halfW2 * cosR2,
    };

    // Left surf face (quad made of 2 triangles: lb1, a1, a2 and lb1, a2, lb2)
    const normL1 = computeNormal(lb1, a1, a2);
    faces.push({ v1: lb1, v2: a1, v3: a2, normal: normL1, side: 'left' });
    const normL2 = computeNormal(lb1, a2, lb2);
    faces.push({ v1: lb1, v2: a2, v3: lb2, normal: normL2, side: 'left' });

    // Right surf face (quad made of 2 triangles: a1, rb1, rb2 and a1, rb2, a2)
    const normR1 = computeNormal(a1, rb1, rb2);
    faces.push({ v1: a1, v2: rb1, v3: rb2, normal: normR1, side: 'right' });
    const normR2 = computeNormal(a1, rb2, a2);
    faces.push({ v1: a1, v2: rb2, v3: a2, normal: normR2, side: 'right' });

    // Bottom face (floor)
    const normB = computeNormal(lb1, lb2, rb2);
    faces.push({ v1: lb1, v2: lb2, v3: rb2, normal: normB, side: 'floor' });
  }

  return faces;
}

// Helper to create a flat horizontal platform
export function createPlatform(x: number, y: number, z: number, width: number, length: number): RampFace[] {
  const hw = width / 2;
  const hl = length / 2;
  const p1: RampVertex = { x: x - hw, y, z: z - hl };
  const p2: RampVertex = { x: x + hw, y, z: z - hl };
  const p3: RampVertex = { x: x + hw, y, z: z + hl };
  const p4: RampVertex = { x: x - hw, y, z: z + hl };

  const norm: RampVertex = { x: 0, y: 1, z: 0 };

  return [
    { v1: p1, v2: p2, v3: p3, normal: norm, side: 'floor' },
    { v1: p1, v2: p3, v3: p4, normal: norm, side: 'floor' },
  ];
}

// -------------------------------------------------------------
// MAP 1: surf_utopia_njv (FLAGSHIP RECREATION)
// -------------------------------------------------------------
export const surfUtopia: MapDefinition = {
  id: 'surf_utopia_njv',
  name: 'surf_utopia_njv',
  title: 'Surf Utopia NJV',
  tier: 1,
  stages: 4,
  description: 'The legendary CS surf masterpiece. Soaring curved ramps, neoclassical archways, and dreamy pastel skies.',
  skyColorTop: '#38bdf8',
  skyColorBottom: '#bae6fd',
  fogColor: '#93c5fd',
  fogNear: 80,
  fogFar: 450,
  sunPosition: [120, 220, 100],
  sunColor: '#fffbeb',
  rampFaceColor: '#fde047', // Iconic Utopia yellow
  rampSideColor: '#38bdf8', // Pastel turquoise
  rampBorderColor: '#ffffff',
  floorColor: '#f1f5f9',
  spawnPosition: [0, 52, 10],
  spawnYaw: 0,
  killZ: -30,
  finishZone: {
    center: [0, 68, -480],
    size: [28, 12, 28],
  },
  checkpoints: [
    { stage: 1, center: [0, 50, 0], size: [20, 10, 20], spawnPosition: [0, 52, 10], spawnYaw: 0 },
    { stage: 2, center: [-35, 20, -145], size: [30, 20, 30], spawnPosition: [-35, 22, -140], spawnYaw: 0 },
    { stage: 3, center: [20, 15, -280], size: [30, 20, 30], spawnPosition: [20, 17, -275], spawnYaw: 0 },
    { stage: 4, center: [-15, 30, -390], size: [30, 25, 30], spawnPosition: [-15, 32, -385], spawnYaw: 0 },
  ],
  boosters: [
    { center: [0, 24, -100], size: [16, 16, 8], boostVelocity: [0, 200, -1800], label: 'Speed Gate' },
    { center: [0, 22, -330], size: [16, 16, 8], boostVelocity: [0, 450, -2200], label: 'Launch Ring' },
  ],
  buildRamps: () => {
    const ramps: RampFace[] = [];

    // 1. Starting Gazebo & Launch Platform
    ramps.push(...createPlatform(0, 50, 10, 14, 18));
    ramps.push(...createPlatform(0, 49.5, 0, 8, 10));

    // 2. Stage 1 Ramp A (The signature gentle slope down to gain speed)
    // Runs from Z= -5 to -85, Y=45 down to Y=15, width=6, height=14
    const ramp1Points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    const count1 = 18;
    for (let i = 0; i <= count1; i++) {
      const t = i / count1;
      const z = -5 - t * 80;
      // Gentle curve toward left
      const x = -Math.sin(t * Math.PI * 0.7) * 16;
      // Smooth downward slope with leveling at the end
      const y = 46 - Math.pow(t, 0.85) * 31;
      const roll = Math.sin(t * Math.PI) * 0.15;
      ramp1Points.push({ x, y, z, width: 5.5, height: 13, roll });
    }
    ramps.push(...createWedgeRamp(ramp1Points, 'right'));

    // 3. Stage 1 Ramp B (Opposite curve launching through Archway)
    const ramp2Points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    const count2 = 16;
    for (let i = 0; i <= count2; i++) {
      const t = i / count2;
      const z = -105 - t * 70;
      const x = -8 + Math.sin(t * Math.PI * 0.8) * 22;
      // Swoop down then launch up slightly
      const y = 16 - Math.sin(t * Math.PI) * 6 + t * 4;
      const roll = -Math.sin(t * Math.PI) * 0.2;
      ramp2Points.push({ x, y, z, width: 6, height: 14, roll });
    }
    ramps.push(...createWedgeRamp(ramp2Points, 'left'));

    // Checkpoint 2 platform
    ramps.push(...createPlatform(-35, 20, -145, 12, 12));

    // 4. Stage 2 Twin S-Curving High-Speed Ramps
    const ramp3Points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    const count3 = 24;
    for (let i = 0; i <= count3; i++) {
      const t = i / count3;
      const z = -190 - t * 110;
      // Wide sweeping S curve
      const x = Math.sin(t * Math.PI * 2) * 32;
      const y = 22 + Math.cos(t * Math.PI * 2) * 8 - t * 5;
      const roll = Math.cos(t * Math.PI * 2) * 0.25;
      ramp3Points.push({ x, y, z, width: 6.5, height: 15, roll });
    }
    ramps.push(...createWedgeRamp(ramp3Points, 'right'));

    // Checkpoint 3 platform
    ramps.push(...createPlatform(20, 15, -280, 12, 12));

    // 5. Stage 3 Steep Downhill Wedge into Celestial Mega Launch
    const ramp4Points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    const count4 = 18;
    for (let i = 0; i <= count4; i++) {
      const t = i / count4;
      const z = -315 - t * 75;
      const x = (1 - t) * 8 - t * 6;
      // Drop fast then kick up
      const y = 18 - Math.sin(t * Math.PI * 0.7) * 14 + Math.pow(t, 2) * 12;
      ramp4Points.push({ x, y, z, width: 7, height: 16 });
    }
    ramps.push(...createWedgeRamp(ramp4Points, 'left'));

    // Checkpoint 4 platform
    ramps.push(...createPlatform(-15, 30, -390, 14, 14));

    // 6. Stage 4 Grand Bowl / Utopia Wall Ride to the Citadel
    const ramp5Points: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    const count5 = 22;
    for (let i = 0; i <= count5; i++) {
      const t = i / count5;
      const z = -405 - t * 65;
      // Sweeping arc banking up to the victory citadel
      const x = -15 + Math.sin(t * Math.PI) * 28;
      const y = 30 + Math.pow(t, 1.3) * 36;
      const roll = Math.sin(t * Math.PI) * 0.35;
      ramp5Points.push({ x, y, z, width: 8, height: 18, roll });
    }
    ramps.push(...createWedgeRamp(ramp5Points, 'right'));

    // 7. Victory Citadel Grand Floating Island
    ramps.push(...createPlatform(0, 66, -480, 26, 26));
    ramps.push(...createPlatform(0, 66.8, -480, 14, 14));

    return ramps;
  },
  decorativeProps: [
    // Classical columns and arches around Utopia start
    { type: 'arch', position: [0, 50, 0], scale: [1.2, 1.5, 1], color: '#f8fafc' },
    { type: 'arch', position: [0, 24, -100], scale: [2, 2.2, 1], color: '#38bdf8' },
    { type: 'ring', position: [0, 22, -330], scale: [2.5, 2.5, 1], color: '#fde047' },
    { type: 'column', position: [-8, 66, -490], scale: [1, 3, 1], color: '#ffffff' },
    { type: 'column', position: [8, 66, -490], scale: [1, 3, 1], color: '#ffffff' },
    { type: 'column', position: [-8, 66, -470], scale: [1, 3, 1], color: '#ffffff' },
    { type: 'column', position: [8, 66, -470], scale: [1, 3, 1], color: '#ffffff' },
    // Floating clouds
    { type: 'cloud', position: [-25, 30, -50], scale: [8, 3, 12], color: '#ffffff' },
    { type: 'cloud', position: [30, 20, -120], scale: [12, 4, 16], color: '#ffffff' },
    { type: 'cloud', position: [-40, 15, -230], scale: [15, 5, 20], color: '#ffffff' },
    { type: 'cloud', position: [35, 40, -360], scale: [18, 5, 22], color: '#ffffff' },
    { type: 'citadel', position: [0, 66, -480], scale: [1, 1, 1], color: '#f8fafc' },
  ],
};

// -------------------------------------------------------------
// MAP 2: surf_kitsune (SYNTHWAVE NEON)
// -------------------------------------------------------------
export const surfKitsune: MapDefinition = {
  id: 'surf_kitsune',
  name: 'surf_kitsune',
  title: 'Surf Kitsune Cyber',
  tier: 2,
  stages: 3,
  description: 'Hypnotic dark neon grid aesthetics. High velocity hairpin turns and glowing wireframe gates.',
  skyColorTop: '#09090b',
  skyColorBottom: '#18181b',
  fogColor: '#0f172a',
  fogNear: 60,
  fogFar: 380,
  sunPosition: [80, 160, 60],
  sunColor: '#f43f5e',
  rampFaceColor: '#06b6d4', // Cyan neon glow
  rampSideColor: '#a855f7', // Magenta purple
  rampBorderColor: '#22d3ee',
  floorColor: '#020617',
  spawnPosition: [0, 45, 10],
  spawnYaw: 0,
  killZ: -35,
  finishZone: {
    center: [0, 48, -360],
    size: [24, 12, 24],
  },
  checkpoints: [
    { stage: 1, center: [0, 43, 0], size: [20, 10, 20], spawnPosition: [0, 45, 10], spawnYaw: 0 },
    { stage: 2, center: [28, 18, -135], size: [25, 20, 25], spawnPosition: [28, 20, -130], spawnYaw: 0 },
    { stage: 3, center: [-25, 15, -250], size: [25, 20, 25], spawnPosition: [-25, 17, -245], spawnYaw: 0 },
  ],
  boosters: [
    { center: [0, 16, -80], size: [16, 16, 8], boostVelocity: [0, 250, -2100], label: 'Cyan Warp' },
    { center: [0, 18, -200], size: [16, 16, 8], boostVelocity: [0, 300, -2200], label: 'Neon Boost' },
  ],
  buildRamps: () => {
    const ramps: RampFace[] = [];

    // Spawn Pad
    ramps.push(...createPlatform(0, 43, 10, 12, 14));

    // Ramp 1 (Steep cyber drop into wide right carve)
    const pts1: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const z = -5 - t * 75;
      const x = Math.sin(t * Math.PI * 0.8) * 18;
      const y = 40 - Math.pow(t, 0.9) * 28;
      pts1.push({ x, y, z, width: 5.5, height: 13 });
    }
    ramps.push(...createWedgeRamp(pts1, 'left'));

    // Checkpoint 2 platform
    ramps.push(...createPlatform(28, 18, -135, 12, 12));

    // Ramp 2 (Zig-zag cyber slalom)
    const pts2: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const z = -95 - t * 90;
      const x = Math.cos(t * Math.PI * 1.5) * 24;
      const y = 18 + Math.sin(t * Math.PI) * 6 - t * 4;
      pts2.push({ x, y, z, width: 6, height: 14 });
    }
    ramps.push(...createWedgeRamp(pts2, 'right'));

    // Checkpoint 3 platform
    ramps.push(...createPlatform(-25, 15, -250, 12, 12));

    // Ramp 3 (High-speed portal straightaway with launch incline)
    const pts3: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const z = -215 - t * 125;
      const x = -Math.sin(t * Math.PI * 0.5) * 12;
      const y = 14 + Math.pow(t, 1.4) * 32;
      pts3.push({ x, y, z, width: 7, height: 16 });
    }
    ramps.push(...createWedgeRamp(pts3, 'left'));

    // Victory Cyber Pad
    ramps.push(...createPlatform(0, 46, -360, 22, 22));

    return ramps;
  },
  decorativeProps: [
    { type: 'ring', position: [0, 16, -80], scale: [2.2, 2.2, 1], color: '#06b6d4' },
    { type: 'ring', position: [0, 18, -200], scale: [2.4, 2.4, 1], color: '#ec4899' },
    { type: 'arch', position: [0, 46, -360], scale: [1.8, 2, 1], color: '#a855f7' },
  ],
};

// -------------------------------------------------------------
// MAP 3: surf_mesa (GOLDEN HOUR CANYON)
// -------------------------------------------------------------
export const surfMesa: MapDefinition = {
  id: 'surf_mesa',
  name: 'surf_mesa',
  title: 'Surf Mesa Canyon',
  tier: 1,
  stages: 3,
  description: 'Warm sandstone cliffs, glowing sunset vistas, and flowing canyon ramps with exhilarating gap jumps.',
  skyColorTop: '#ea580c',
  skyColorBottom: '#fdba74',
  fogColor: '#fed7aa',
  fogNear: 70,
  fogFar: 420,
  sunPosition: [160, 90, -80],
  sunColor: '#ffedd5',
  rampFaceColor: '#fb923c', // Warm sandstone
  rampSideColor: '#b45309', // Deep canyon rock
  rampBorderColor: '#fef08a',
  floorColor: '#78350f',
  spawnPosition: [0, 48, 10],
  spawnYaw: 0,
  killZ: -30,
  finishZone: {
    center: [0, 52, -380],
    size: [26, 12, 26],
  },
  checkpoints: [
    { stage: 1, center: [0, 46, 0], size: [20, 10, 20], spawnPosition: [0, 48, 10], spawnYaw: 0 },
    { stage: 2, center: [-25, 22, -150], size: [25, 20, 25], spawnPosition: [-25, 24, -145], spawnYaw: 0 },
    { stage: 3, center: [20, 18, -260], size: [25, 20, 25], spawnPosition: [20, 20, -255], spawnYaw: 0 },
  ],
  boosters: [
    { center: [0, 22, -90], size: [16, 16, 8], boostVelocity: [0, 220, -1900], label: 'Canyon Wind' },
  ],
  buildRamps: () => {
    const ramps: RampFace[] = [];

    // Spawn Mesa
    ramps.push(...createPlatform(0, 46, 10, 14, 16));

    // Ramp 1 (Canyon descent)
    const pts1: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const z = -5 - t * 80;
      const x = -Math.sin(t * Math.PI * 0.7) * 16;
      const y = 44 - Math.pow(t, 0.85) * 26;
      pts1.push({ x, y, z, width: 6, height: 14 });
    }
    ramps.push(...createWedgeRamp(pts1, 'right'));

    // Checkpoint 2 platform
    ramps.push(...createPlatform(-25, 22, -150, 12, 12));

    // Ramp 2 (Gorge cross leap)
    const pts2: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const z = -105 - t * 95;
      const x = Math.sin(t * Math.PI) * 24 - 4;
      const y = 20 - Math.sin(t * Math.PI) * 5 + t * 4;
      pts2.push({ x, y, z, width: 6.5, height: 15 });
    }
    ramps.push(...createWedgeRamp(pts2, 'left'));

    // Checkpoint 3 platform
    ramps.push(...createPlatform(20, 18, -260, 12, 12));

    // Ramp 3 (Soaring incline to the Sun Altar)
    const pts3: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const z = -225 - t * 135;
      const x = Math.cos(t * Math.PI * 0.6) * 14 - 10;
      const y = 16 + Math.pow(t, 1.25) * 34;
      pts3.push({ x, y, z, width: 7, height: 16 });
    }
    ramps.push(...createWedgeRamp(pts3, 'right'));

    // Victory Mesa
    ramps.push(...createPlatform(0, 50, -380, 24, 24));

    return ramps;
  },
  decorativeProps: [
    { type: 'arch', position: [0, 22, -90], scale: [2.2, 2.2, 1], color: '#c2410c' },
    { type: 'column', position: [-10, 50, -385], scale: [1.2, 3, 1.2], color: '#9a3412' },
    { type: 'column', position: [10, 50, -385], scale: [1.2, 3, 1.2], color: '#9a3412' },
  ],
};

// -------------------------------------------------------------
// MAP 4: surf_beginner (TRAINING ACADEMY)
// -------------------------------------------------------------
export const surfBeginner: MapDefinition = {
  id: 'surf_beginner',
  name: 'surf_beginner',
  title: 'Surf Beginner Academy',
  tier: 1,
  stages: 2,
  description: 'Gentle, wide ramps and forgiving transitions designed to master A/D air strafing and ramp mounting.',
  skyColorTop: '#0284c7',
  skyColorBottom: '#e0f2fe',
  fogColor: '#bae6fd',
  fogNear: 80,
  fogFar: 400,
  sunPosition: [100, 200, 100],
  sunColor: '#ffffff',
  rampFaceColor: '#10b981', // Emerald green
  rampSideColor: '#334155', // Slate
  rampBorderColor: '#6ee7b7',
  floorColor: '#1e293b',
  spawnPosition: [0, 42, 10],
  spawnYaw: 0,
  killZ: -25,
  finishZone: {
    center: [0, 36, -260],
    size: [24, 12, 24],
  },
  checkpoints: [
    { stage: 1, center: [0, 40, 0], size: [20, 10, 20], spawnPosition: [0, 42, 10], spawnYaw: 0 },
    { stage: 2, center: [-15, 18, -120], size: [25, 20, 25], spawnPosition: [-15, 20, -115], spawnYaw: 0 },
  ],
  boosters: [
    { center: [0, 18, -60], size: [16, 16, 8], boostVelocity: [0, 150, -1600], label: 'Practice Boost' },
  ],
  buildRamps: () => {
    const ramps: RampFace[] = [];

    // Spawn
    ramps.push(...createPlatform(0, 40, 10, 16, 16));

    // Ramp 1 (Extra wide, gentle slope)
    const pts1: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const z = -5 - t * 75;
      const x = -Math.sin(t * Math.PI * 0.5) * 12;
      const y = 38 - t * 22;
      pts1.push({ x, y, z, width: 8, height: 15 });
    }
    ramps.push(...createWedgeRamp(pts1, 'right'));

    // Checkpoint 2 platform
    ramps.push(...createPlatform(-15, 18, -120, 14, 14));

    // Ramp 2 (Gentle climb to finish)
    const pts2: Array<{ x: number; y: number; z: number; width: number; height: number; roll?: number }> = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const z = -90 - t * 140;
      const x = Math.sin(t * Math.PI * 0.6) * 16;
      const y = 16 + Math.pow(t, 1.1) * 18;
      pts2.push({ x, y, z, width: 8.5, height: 16 });
    }
    ramps.push(...createWedgeRamp(pts2, 'left'));

    // Victory Pad
    ramps.push(...createPlatform(0, 34, -260, 22, 22));

    return ramps;
  },
  decorativeProps: [
    { type: 'arch', position: [0, 18, -60], scale: [2, 2, 1], color: '#10b981' },
    { type: 'arch', position: [0, 34, -260], scale: [2, 2, 1], color: '#10b981' },
  ],
};

export const ALL_MAPS: Record<string, MapDefinition> = {
  surf_utopia_njv: surfUtopia,
  surf_kitsune: surfKitsune,
  surf_mesa: surfMesa,
  surf_beginner: surfBeginner,
};
