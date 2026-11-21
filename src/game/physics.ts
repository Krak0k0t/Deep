import { Vec3 } from './npc';

export interface TrawlerWindow {
  x: number;
  y: number;
  halfWidth: number;
  halfHeight: number;
}

export interface CoralShelter {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface PearlPickup {
  id: string;
  x: number;
  y: number;
  z: number;
}

export type SquidState = 'patrol' | 'telegraph' | 'dash' | 'recover' | 'stunned';

export interface SquidEntity {
  position: Vec3;
  velocity: Vec3;
  headingYaw: number;
  state: SquidState;
  stateTimer: number;
  patrolPhase: number;
  dashDir: Vec3;
  stunTimer: number;
  distractedUntil: number;
  distractTarget: Vec3 | null;
}

// Smooth deterministic 2D value-noise + FBM for sandy reef seabed
function hash2(ix: number, iz: number): number {
  const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise2(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);

  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function fbm2D(x: number, z: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    value += amp * (smoothNoise2(x * freq, z * freq) * 2 - 1);
    freq *= 2.04;
    amp *= 0.5;
  }
  return value;
}

/**
 * Computes seafloor height for Chapter 1 "Тихий риф".
 * The reef gently slopes downward as z goes from +12 (shallows) toward -92 (abyssal crevice),
 * with raised canyon banks on left/right (|x| > 15) to naturally bound the navigable valley.
 */
export function getReefFloorHeight(x: number, z: number): number {
  const sandDunes = fbm2D(x * 0.09, z * 0.09) * 1.15;
  const microRipples = Math.sin(x * 0.8 + z * 0.45) * 0.14;
  // Gentle descent slope toward negative Z
  const slope = Math.max(-9, Math.min(2, (z + 10) * 0.085));
  // Natural reef canyon shoulders along +/- X
  const absX = Math.abs(x);
  const canyonWall = absX > 15 ? Math.pow((absX - 15) * 0.36, 1.55) : 0;
  // Deepen the final abyssal crevice near z = -88
  const creviceDip = z < -76 ? -Math.min(5.5, (-76 - z) * 0.38) : 0;
  return -2.4 + sandDunes + microRipples + slope + canyonWall + creviceDip;
}

export const CHAPTER_1_SHELTERS: CoralShelter[] = [
  { id: 'shelter_tutorial', x: 5.5, y: 1.5, z: -32, radius: 3.1 },
  { id: 'shelter_mid', x: -6.2, y: 0.4, z: -49, radius: 3.0 },
  { id: 'shelter_pre_net', x: 4.2, y: -0.3, z: -55, radius: 2.8 },
];

export const CHAPTER_1_PEARLS: PearlPickup[] = [
  { id: 'ch1_pearl_1', x: 7.4, y: 2.6, z: -14 },
  { id: 'ch1_pearl_2', x: -8.5, y: 1.8, z: -36 },
  { id: 'ch1_pearl_3', x: 8.2, y: 0.2, z: -52 },
  { id: 'ch1_pearl_4', x: 0.0, y: -1.8, z: -74 },
];

export const CHAPTER_1_NET_Z = -62;

export const CHAPTER_1_NET_WINDOWS: TrawlerWindow[] = [
  { x: -7.5, y: 1.4, halfWidth: 2.5, halfHeight: 2.2 },
  { x: 0.0, y: 3.1, halfWidth: 2.7, halfHeight: 2.2 },
  { x: 7.8, y: 0.9, halfWidth: 2.5, halfHeight: 2.2 },
];

export function isInsideCoralShelter(
  pos: Vec3,
  shelters: CoralShelter[] = CHAPTER_1_SHELTERS,
): boolean {
  for (const s of shelters) {
    const dx = pos.x - s.x;
    const dy = pos.y - s.y;
    const dz = pos.z - s.z;
    if (dx * dx + dy * dy + dz * dz <= s.radius * s.radius) {
      return true;
    }
  }
  return false;
}

export function isPointInTrawlerWindows(
  x: number,
  y: number,
  windows: TrawlerWindow[] = CHAPTER_1_NET_WINDOWS,
  padding = 0.25,
): boolean {
  for (const w of windows) {
    if (
      Math.abs(x - w.x) <= w.halfWidth - padding &&
      Math.abs(y - w.y) <= w.halfHeight - padding
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Prevents player from clipping through the trawler net mesh unless flying through one of the 3 open windows.
 */
export function resolveTrawlerNetCollision(
  prevPos: Vec3,
  nextPos: Vec3,
  netZ: number = CHAPTER_1_NET_Z,
  windows: TrawlerWindow[] = CHAPTER_1_NET_WINDOWS,
): { position: Vec3; hitNet: boolean } {
  const halfThickness = 0.85;
  const crossesFront =
    prevPos.z >= netZ + halfThickness && nextPos.z < netZ + halfThickness;
  const crossesBack =
    prevPos.z <= netZ - halfThickness && nextPos.z > netZ - halfThickness;
  const insideBand = Math.abs(nextPos.z - netZ) < halfThickness;

  if (!crossesFront && !crossesBack && !insideBand) {
    return { position: nextPos, hitNet: false };
  }

  if (isPointInTrawlerWindows(nextPos.x, nextPos.y, windows, 0.15)) {
    return { position: nextPos, hitNet: false };
  }

  const clampedZ =
    prevPos.z >= netZ ? netZ + halfThickness : netZ - halfThickness;
  return {
    position: {
      x: nextPos.x,
      y: nextPos.y,
      z: clampedZ,
    },
    hitNet: true,
  };
}

export function clampPlayerPosition(pos: Vec3): Vec3 {
  const clampedX = Math.max(-15.5, Math.min(15.5, pos.x));
  const clampedZ = Math.max(-92, Math.min(14, pos.z));
  const floorY = getReefFloorHeight(clampedX, clampedZ);
  const minY = floorY + 1.05;
  const maxY = 10.5;
  const clampedY = Math.max(minY, Math.min(maxY, pos.y));
  return { x: clampedX, y: clampedY, z: clampedZ };
}

export function createInitialSquid(): SquidEntity {
  return {
    position: { x: 0, y: 2.2, z: -46 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 0,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function stepSquidAI(
  squid: SquidEntity,
  playerPos: Vec3,
  playerHidden: boolean,
  predatorSpeedMult: number,
  dt: number,
  nowSec: number,
): {
  squid: SquidEntity;
  telegraphStarted: boolean;
  hitPlayer: boolean;
  dodgedDash: boolean;
} {
  let telegraphStarted = false;
  let hitPlayer = false;
  let dodgedDash = false;

  if (squid.stunTimer > 0) {
    const nextStun = Math.max(0, squid.stunTimer - dt);
    return {
      squid: {
        ...squid,
        stunTimer: nextStun,
        state: nextStun > 0 ? 'stunned' : 'patrol',
        velocity: { x: 0, y: 0, z: 0 },
      },
      telegraphStarted: false,
      hitPlayer: false,
      dodgedDash: false,
    };
  }

  const next = {
    ...squid,
    position: { ...squid.position },
    velocity: { ...squid.velocity },
    dashDir: { ...squid.dashDir },
  };

  const dx = playerPos.x - next.position.x;
  const dy = playerPos.y - next.position.y;
  const dz = playerPos.z - next.position.z;
  const distToPlayer = Math.hypot(dx, dy, dz);

  const isDistracted =
    nowSec < next.distractedUntil && next.distractTarget !== null;

  if (next.state === 'patrol' || next.state === 'stunned') {
    next.state = 'patrol';
    next.patrolPhase += dt * 0.9 * predatorSpeedMult;
    const targetX = isDistracted && next.distractTarget
      ? next.distractTarget.x
      : Math.sin(next.patrolPhase) * 8.8;
    const targetZ = isDistracted && next.distractTarget
      ? next.distractTarget.z
      : -47 + Math.cos(next.patrolPhase * 0.7) * 6.5;
    const targetY = isDistracted && next.distractTarget
      ? next.distractTarget.y
      : 2.3 + Math.sin(next.patrolPhase * 1.4) * 0.9;

    const toX = targetX - next.position.x;
    const toY = targetY - next.position.y;
    const toZ = targetZ - next.position.z;
    const len = Math.hypot(toX, toY, toZ) || 1;
    const speed = 4.5 * predatorSpeedMult;
    next.velocity.x = (toX / len) * speed;
    next.velocity.y = (toY / len) * speed;
    next.velocity.z = (toZ / len) * speed;
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;
    next.headingYaw = Math.atan2(next.velocity.x, next.velocity.z);

    if (!playerHidden && !isDistracted && distToPlayer < 13.5) {
      next.state = 'telegraph';
      next.stateTimer = 0.95; // generous Chapter 1 tutorial telegraph
      const inv = 1 / (distToPlayer || 1);
      next.dashDir = { x: dx * inv, y: dy * inv, z: dz * inv };
      next.headingYaw = Math.atan2(next.dashDir.x, next.dashDir.z);
      telegraphStarted = true;
    }
  } else if (next.state === 'telegraph') {
    next.stateTimer -= dt;
    // Track gently during first half of telegraph so player can dodge cleanly
    if (next.stateTimer > 0.45 && !playerHidden && distToPlayer > 0.1) {
      const inv = 1 / distToPlayer;
      next.dashDir = { x: dx * inv, y: dy * inv, z: dz * inv };
      next.headingYaw = Math.atan2(next.dashDir.x, next.dashDir.z);
    }
    // Slight recoil windup
    next.position.x -= next.dashDir.x * 1.1 * dt;
    next.position.y -= next.dashDir.y * 1.1 * dt;
    next.position.z -= next.dashDir.z * 1.1 * dt;

    if (next.stateTimer <= 0) {
      next.state = 'dash';
      next.stateTimer = 0.72;
    }
  } else if (next.state === 'dash') {
    next.stateTimer -= dt;
    const dashSpeed = 16.5 * predatorSpeedMult;
    next.velocity.x = next.dashDir.x * dashSpeed;
    next.velocity.y = next.dashDir.y * dashSpeed;
    next.velocity.z = next.dashDir.z * dashSpeed;
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;

    if (!playerHidden && distToPlayer < 1.85) {
      hitPlayer = true;
      next.state = 'recover';
      next.stateTimer = 1.6;
    } else if (next.stateTimer <= 0) {
      next.state = 'recover';
      next.stateTimer = 1.4;
      if (distToPlayer < 6.5) {
        dodgedDash = true;
      }
    }
  } else if (next.state === 'recover') {
    next.stateTimer -= dt;
    next.velocity.x *= Math.exp(-3.5 * dt);
    next.velocity.y *= Math.exp(-3.5 * dt);
    next.velocity.z *= Math.exp(-3.5 * dt);
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;
    if (next.stateTimer <= 0) {
      next.state = 'patrol';
      next.stateTimer = 0;
    }
  }

  // Keep squid above seafloor and inside reef valley
  const floorY = getReefFloorHeight(next.position.x, next.position.z);
  next.position.y = Math.max(floorY + 1.3, Math.min(8.5, next.position.y));
  next.position.x = Math.max(-13.5, Math.min(13.5, next.position.x));
  next.position.z = Math.max(-59.5, Math.min(-24, next.position.z));

  return { squid: next, telegraphStarted, hitPlayer, dodgedDash };
}

export function getRoomIdForZChapter1(z: number): string {
  if (z > -27) return 'ch1_reef_entry';
  if (z > -57) return 'ch1_squid_patrol';
  return 'ch1_trawler_net';
}
