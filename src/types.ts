/**
 * CS2 Surf 3D Type Definitions
 */

export type TouchLayoutType = 'strafe-buttons' | 'joystick' | 'split-screen';
export type TouchButtonSize = 'small' | 'medium' | 'large';
export type PhysicsPreset = 'cs2-authentic' | 'hardcore' | 'casual-flow' | 'custom';

export interface RampVertex {
  x: number;
  y: number;
  z: number;
}

export interface RampFace {
  // Triangle vertices
  v1: RampVertex;
  v2: RampVertex;
  v3: RampVertex;
  normal: RampVertex;
  side: 'left' | 'right' | 'floor' | 'booster';
}

export interface BoosterZone {
  center: [number, number, number];
  size: [number, number, number];
  boostVelocity: [number, number, number];
  label?: string;
}

export interface CheckpointZone {
  stage: number;
  center: [number, number, number];
  size: [number, number, number];
  spawnPosition: [number, number, number];
  spawnYaw: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  title: string;
  tier: number; // Tier 1-6
  stages: number;
  description: string;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunPosition: [number, number, number];
  sunColor: string;
  rampFaceColor: string;
  rampSideColor: string;
  rampBorderColor: string;
  floorColor: string;
  spawnPosition: [number, number, number];
  spawnYaw: number;
  killZ: number; // Below this Y coordinate, respawn player
  finishZone: {
    center: [number, number, number];
    size: [number, number, number];
  };
  checkpoints: CheckpointZone[];
  boosters: BoosterZone[];
  // Procedural generator config
  buildRamps: () => RampFace[];
  decorativeProps?: Array<{
    type: 'arch' | 'column' | 'cloud' | 'ring' | 'platform' | 'citadel';
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color?: string;
  }>;
}

export interface PlayerPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  pitch: number; // camera pitch in radians
  yaw: number;   // camera yaw in radians
  isOnRamp: boolean;
  rampNormal: [number, number, number] | null;
  speed: number; // Source units per second
  stage: number;
  stageStartTime: number;
  isTimerRunning: boolean;
  hasFinished: boolean;
  finishTime: number | null;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
  jump: boolean;
  crouch: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export interface GameSettings {
  // Controls
  touchLayout: TouchLayoutType;
  touchButtonSize: TouchButtonSize;
  touchOpacity: number;
  swapTouchHands: boolean;
  touchSensitivity: number;
  mouseSensitivity: number;
  invertY: boolean;

  // Physics
  physicsPreset: PhysicsPreset;
  airAccelerate: number;
  maxAirSpeed: number;
  gravity: number;
  rampStickAssist: boolean;
  autoBhop: boolean;
  subTickSmooth: boolean;

  // Display & Audio
  fov: number;
  showSpeedo: boolean;
  showKeypressHUD: boolean;
  showCrosshair: boolean;
  knifeModel: boolean;
  speedLines: boolean;
  soundEnabled: boolean;
  volume: number;
  stealthPreset: 'default' | 'docs' | 'canvas' | 'desmos' | 'drive' | 'physics';
}

export interface MapRecord {
  bestTime: number | null;
  maxSpeed: number;
  completions: number;
}
