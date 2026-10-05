/**
 * Source Engine Accurate Surf Physics Simulation
 * Recreates PM_AirAccelerate, plane velocity clipping, ramp surfing, and touch assist.
 */

import { RampFace, GameSettings, PlayerPhysicsState, MapDefinition } from '../types';

export const UNITS_PER_METER = 40; // 1 Three.js meter = 40 Source engine units

// Point-to-triangle distance and normal test
function closestPointOnTriangle(
  px: number, py: number, pz: number,
  v1x: number, v1y: number, v1z: number,
  v2x: number, v2y: number, v2z: number,
  v3x: number, v3y: number, v3z: number
): { x: number; y: number; z: number; distSq: number } {
  // Edge vectors
  const e1x = v2x - v1x, e1y = v2y - v1y, e1z = v2z - v1z;
  const e2x = v3x - v1x, e2y = v3y - v1y, e2z = v3z - v1z;

  // Vector from v1 to p
  const w1x = px - v1x, w1y = py - v1y, w1z = pz - v1z;

  const d1 = e1x * w1x + e1y * w1y + e1z * w1z;
  const d2 = e2x * w1x + e2y * w1y + e2z * w1z;
  if (d1 <= 0 && d2 <= 0) {
    const dx = px - v1x, dy = py - v1y, dz = pz - v1z;
    return { x: v1x, y: v1y, z: v1z, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Check vertex 2
  const w2x = px - v2x, w2y = py - v2y, w2z = pz - v2z;
  const d3 = e1x * w2x + e1y * w2y + e1z * w2z;
  const d4 = e2x * w2x + e2y * w2y + e2z * w2z;
  if (d3 >= 0 && d4 <= d3) {
    const dx = px - v2x, dy = py - v2y, dz = pz - v2z;
    return { x: v2x, y: v2y, z: v2z, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Check edge v1-v2
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    const cx = v1x + v * e1x;
    const cy = v1y + v * e1y;
    const cz = v1z + v * e1z;
    const dx = px - cx, dy = py - cy, dz = pz - cz;
    return { x: cx, y: cy, z: cz, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Check vertex 3
  const w3x = px - v3x, w3y = py - v3y, w3z = pz - v3z;
  const d5 = e1x * w3x + e1y * w3y + e1z * w3z;
  const d6 = e2x * w3x + e2y * w3y + e2z * w3z;
  if (d6 >= 0 && d5 <= d6) {
    const dx = px - v3x, dy = py - v3y, dz = pz - v3z;
    return { x: v3x, y: v3y, z: v3z, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Check edge v1-v3
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    const cx = v1x + w * e2x;
    const cy = v1y + w * e2y;
    const cz = v1z + w * e2z;
    const dx = px - cx, dy = py - cy, dz = pz - cz;
    return { x: cx, y: cy, z: cz, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Check edge v2-v3
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    const cx = v2x + w * (v3x - v2x);
    const cy = v2y + w * (v3y - v2y);
    const cz = v2z + w * (v3z - v2z);
    const dx = px - cx, dy = py - cy, dz = pz - cz;
    return { x: cx, y: cy, z: cz, distSq: dx * dx + dy * dy + dz * dz };
  }

  // Point is inside triangle
  const denom = 1.0 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  const cx = v1x + e1x * v + e2x * w;
  const cy = v1y + e1y * v + e2y * w;
  const cz = v1z + e1z * v + e2z * w;
  const dx = px - cx, dy = py - cy, dz = pz - cz;
  return { x: cx, y: cy, z: cz, distSq: dx * dx + dy * dy + dz * dz };
}

export class SurfPhysicsController {
  private ramps: RampFace[] = [];
  private playerRadius = 0.6; // Player bounding sphere radius in meters (24 units)

  public setRamps(ramps: RampFace[]) {
    this.ramps = ramps;
  }

  public step(
    player: PlayerPhysicsState,
    inputs: {
      forward: boolean;
      backward: boolean;
      strafeLeft: boolean;
      strafeRight: boolean;
      jump: boolean;
      crouch: boolean;
    },
    settings: GameSettings,
    map: MapDefinition,
    dt: number,
    onBooster?: () => void,
    onCheckpoint?: (stage: number) => void,
    onFinish?: () => void,
    onRespawn?: () => void
  ) {
    // Sub-stepping to maintain 128-tick stability regardless of screen frame rate
    const subSteps = settings.subTickSmooth ? Math.max(2, Math.min(8, Math.round(dt / (1 / 128)))) : 2;
    const subDt = dt / subSteps;

    for (let stepIdx = 0; stepIdx < subSteps; stepIdx++) {
      this.simulationStep(player, inputs, settings, map, subDt, onBooster, onCheckpoint, onFinish, onRespawn);
    }

    // Calculate speed in CS2 Source units/sec
    const horizontalSpeedMps = Math.sqrt(player.vx * player.vx + player.vz * player.vz);
    const totalSpeedMps = Math.sqrt(player.vx * player.vx + player.vy * player.vy + player.vz * player.vz);
    player.speed = Math.round(totalSpeedMps * UNITS_PER_METER);

    // Update timer if active
    if (player.isTimerRunning && !player.hasFinished) {
      // timer increments automatically via performance.now()
    }
  }

  private simulationStep(
    player: PlayerPhysicsState,
    inputs: {
      forward: boolean;
      backward: boolean;
      strafeLeft: boolean;
      strafeRight: boolean;
      jump: boolean;
      crouch: boolean;
    },
    settings: GameSettings,
    map: MapDefinition,
    dt: number,
    onBooster?: () => void,
    onCheckpoint?: (stage: number) => void,
    onFinish?: () => void,
    onRespawn?: () => void
  ) {
    // 1. Check Kill Z (fell off map)
    if (player.y < map.killZ) {
      this.respawnPlayer(player, map);
      if (onRespawn) onRespawn();
      return;
    }

    // 2. Check Finish Zone
    if (!player.hasFinished) {
      const fz = map.finishZone;
      const dx = Math.abs(player.x - fz.center[0]);
      const dy = Math.abs(player.y - fz.center[1]);
      const dz = Math.abs(player.z - fz.center[2]);
      if (dx < fz.size[0] / 2 && dy < fz.size[1] / 2 && dz < fz.size[2] / 2) {
        player.hasFinished = true;
        player.isTimerRunning = false;
        player.finishTime = performance.now() - player.stageStartTime;
        if (onFinish) onFinish();
      }
    }

    // 3. Check Booster Zones
    for (const b of map.boosters) {
      const dx = Math.abs(player.x - b.center[0]);
      const dy = Math.abs(player.y - b.center[1]);
      const dz = Math.abs(player.z - b.center[2]);
      if (dx < b.size[0] / 2 && dy < b.size[1] / 2 && dz < b.size[2] / 2) {
        player.vx = b.boostVelocity[0] / UNITS_PER_METER;
        player.vy = b.boostVelocity[1] / UNITS_PER_METER;
        player.vz = b.boostVelocity[2] / UNITS_PER_METER;
        if (onBooster) onBooster();
      }
    }

    // 4. Check Stage Checkpoints
    for (const cp of map.checkpoints) {
      if (cp.stage > player.stage) {
        const dx = Math.abs(player.x - cp.center[0]);
        const dy = Math.abs(player.y - cp.center[1]);
        const dz = Math.abs(player.z - cp.center[2]);
        if (dx < cp.size[0] / 2 && dy < cp.size[1] / 2 && dz < cp.size[2] / 2) {
          player.stage = cp.stage;
          if (onCheckpoint) onCheckpoint(cp.stage);
        }
      }
    }

    // 5. Compute Wish Direction based on player camera yaw and inputs
    let wishX = 0;
    let wishZ = 0;

    const sinYaw = Math.sin(player.yaw);
    const cosYaw = Math.cos(player.yaw);

    // Forward direction on horizontal plane
    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;

    // Right direction on horizontal plane
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    if (inputs.forward) {
      wishX += forwardX;
      wishZ += forwardZ;
    }
    if (inputs.backward) {
      wishX -= forwardX;
      wishZ -= forwardZ;
    }
    if (inputs.strafeRight) {
      wishX += rightX;
      wishZ += rightZ;
    }
    if (inputs.strafeLeft) {
      wishX -= rightX;
      wishZ -= rightZ;
    }

    const wishLen = Math.sqrt(wishX * wishX + wishZ * wishZ);
    let wishDirX = 0;
    let wishDirZ = 0;
    if (wishLen > 0.001) {
      wishDirX = wishX / wishLen;
      wishDirZ = wishZ / wishLen;
    }

    // 6. Apply Gravity (Source gravity: default 800 units/s^2 -> 20 m/s^2)
    const gravityMps2 = settings.gravity / UNITS_PER_METER;
    player.vy -= gravityMps2 * dt;

    // 7. Source Engine Air Accelerate (PM_AirAccelerate)
    // In Source, wishspeed is clamped to maxAirSpeed (typically 30 units/s)
    const maxAirSpeedMps = settings.maxAirSpeed / UNITS_PER_METER;
    const wishSpeedMps = wishLen > 0 ? maxAirSpeedMps : 0;

    if (wishSpeedMps > 0) {
      // Current velocity component along wishdir
      const currentSpeed = player.vx * wishDirX + player.vz * wishDirZ;
      const addSpeed = wishSpeedMps - currentSpeed;

      if (addSpeed > 0) {
        // accelspeed = airaccelerate * wishspeed * dt
        let accelSpeed = (settings.airAccelerate * wishSpeedMps) * dt;
        if (accelSpeed > addSpeed) {
          accelSpeed = addSpeed;
        }

        player.vx += wishDirX * accelSpeed;
        player.vz += wishDirZ * accelSpeed;
      }
    }

    // 8. Velocity Clamp to prevent engine explosions
    const maxVelocityMps = 4500 / UNITS_PER_METER;
    const hSpeed = Math.sqrt(player.vx * player.vx + player.vz * player.vz);
    if (hSpeed > maxVelocityMps) {
      const scale = maxVelocityMps / hSpeed;
      player.vx *= scale;
      player.vz *= scale;
    }

    // 9. Position Integration
    let nextX = player.x + player.vx * dt;
    let nextY = player.y + player.vy * dt;
    let nextZ = player.z + player.vz * dt;

    // 10. Ramp Collision & ClipVelocity
    player.isOnRamp = false;
    player.rampNormal = null;

    let nearestDistSq = Infinity;
    let bestNormal: [number, number, number] | null = null;
    let bestRampSide: 'left' | 'right' | 'floor' | 'booster' = 'left';

    // Broadphase: test ramps within reasonable bounding sphere
    for (const ramp of this.ramps) {
      const v1 = ramp.v1;
      const v2 = ramp.v2;
      const v3 = ramp.v3;

      // Quick bounding test
      const minX = Math.min(v1.x, v2.x, v3.x) - this.playerRadius;
      const maxX = Math.max(v1.x, v2.x, v3.x) + this.playerRadius;
      const minY = Math.min(v1.y, v2.y, v3.y) - this.playerRadius;
      const maxY = Math.max(v1.y, v2.y, v3.y) + this.playerRadius;
      const minZ = Math.min(v1.z, v2.z, v3.z) - this.playerRadius;
      const maxZ = Math.max(v1.z, v2.z, v3.z) + this.playerRadius;

      if (nextX < minX || nextX > maxX || nextY < minY || nextY > maxY || nextZ < minZ || nextZ > maxZ) {
        continue;
      }

      const closest = closestPointOnTriangle(
        nextX, nextY, nextZ,
        v1.x, v1.y, v1.z,
        v2.x, v2.y, v2.z,
        v3.x, v3.y, v3.z
      );

      if (closest.distSq < this.playerRadius * this.playerRadius) {
        const dist = Math.sqrt(closest.distSq);
        const normX = ramp.normal.x;
        const normY = ramp.normal.y;
        const normZ = ramp.normal.z;

        if (closest.distSq < nearestDistSq) {
          nearestDistSq = closest.distSq;
          bestNormal = [normX, normY, normZ];
          bestRampSide = ramp.side;
        }

        // Push player outside of ramp surface
        const penetration = this.playerRadius - dist;
        if (dist > 0.0001) {
          const pushX = (nextX - closest.x) / dist;
          const pushY = (nextY - closest.y) / dist;
          const pushZ = (nextZ - closest.z) / dist;
          nextX += pushX * penetration;
          nextY += pushY * penetration;
          nextZ += pushZ * penetration;
        } else {
          nextX += normX * penetration;
          nextY += normY * penetration;
          nextZ += normZ * penetration;
        }

        // Source Engine ClipVelocity:
        // backoff = dot(velocity, normal)
        // if backoff < 0: velocity -= normal * backoff
        const backoff = player.vx * normX + player.vy * normY + player.vz * normZ;
        if (backoff < 0) {
          player.vx -= normX * backoff * 1.001;
          player.vy -= normY * backoff * 1.001;
          player.vz -= normZ * backoff * 1.001;
        }

        // Ramp surf detection: Ramp slope steepness
        // In Source, surf slopes have normY < 0.7 (steep) and normY > 0.05
        if (normY < 0.85 && normY > 0.02) {
          player.isOnRamp = true;
          player.rampNormal = [normX, normY, normZ];

          // Ramp-Stick Assist (magnetic attraction toggle for mobile / casual)
          if (settings.rampStickAssist) {
            // Apply gentle velocity toward ramp face
            const assistPush = 0.5 * dt;
            player.vx -= normX * assistPush;
            player.vy -= normY * assistPush;
            player.vz -= normZ * assistPush;
          }
        } else if (normY >= 0.85) {
          // Walkable floor / flat landing pad
          if (inputs.jump || settings.autoBhop) {
            // Bhop jump off floor
            player.vy = 300 / UNITS_PER_METER;
          } else {
            // Gentle floor friction
            player.vx *= Math.pow(0.85, dt * 60);
            player.vz *= Math.pow(0.85, dt * 60);
          }
        }
      }
    }

    player.x = nextX;
    player.y = nextY;
    player.z = nextZ;
  }

  public respawnPlayer(player: PlayerPhysicsState, map: MapDefinition) {
    // Find current checkpoint or start spawn
    const cp = map.checkpoints.find(c => c.stage === player.stage);
    if (cp && player.stage > 1) {
      player.x = cp.spawnPosition[0];
      player.y = cp.spawnPosition[1];
      player.z = cp.spawnPosition[2];
      player.yaw = cp.spawnYaw;
    } else {
      player.x = map.spawnPosition[0];
      player.y = map.spawnPosition[1];
      player.z = map.spawnPosition[2];
      player.yaw = map.spawnYaw;
      player.stage = 1;
      player.stageStartTime = performance.now();
      player.isTimerRunning = true;
      player.hasFinished = false;
      player.finishTime = null;
    }

    // Reset velocity with small forward impulse off spawn
    const sinYaw = Math.sin(player.yaw);
    const cosYaw = Math.cos(player.yaw);
    player.vx = -sinYaw * (350 / UNITS_PER_METER);
    player.vy = -20 / UNITS_PER_METER;
    player.vz = -cosYaw * (350 / UNITS_PER_METER);
    player.pitch = 0.05;
    player.isOnRamp = false;
    player.rampNormal = null;
  }
}

export const surfPhysics = new SurfPhysicsController();
