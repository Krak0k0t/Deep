import * as THREE from 'three';

export interface SwimInputState {
  forward: boolean; // W / ArrowUp / primary hold
  backward: boolean; // S / ArrowDown (brake / reverse)
  turnLeft: boolean; // A / ArrowLeft (yaw left, no strafe)
  turnRight: boolean; // D / ArrowRight (yaw right, no strafe)
  ascend: boolean; // Space
  descend: boolean; // C / Shift / Ctrl
  mouseDeltaX: number; // Accumulated pointer delta X (pixels)
  mouseDeltaY: number; // Accumulated pointer delta Y (pixels)
}

export interface SwimState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  camYaw: number;
  camPitch: number;
  fishQuat: THREE.Quaternion;
  fishRoll: number;
  turnFlex: number;
}

const _worldUp = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _basisMat = new THREE.Matrix4();
const _targetQuat = new THREE.Quaternion();
const _noseDir = new THREE.Vector3();

export function createInitialSwimState(
  pos = new THREE.Vector3(0, 3.0, 4),
  yaw = Math.PI,
  pitch = -0.06,
): SwimState {
  const fwd = computeSwimForward(yaw, pitch);
  const fishQuat = computeFishTargetQuaternion(fwd).clone();
  return {
    position: pos.clone(),
    velocity: new THREE.Vector3(),
    camYaw: yaw,
    camPitch: pitch,
    fishQuat,
    fishRoll: 0,
    turnFlex: 0,
  };
}

export function wrapAngleRad(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Computes unit forward vector from camera orbit yaw and pitch.
 * At yaw = Math.PI, pitch = 0 -> (0, 0, -1).
 */
export function computeSwimForward(
  yaw: number,
  pitch: number,
  out = new THREE.Vector3(),
): THREE.Vector3 {
  const cosP = Math.cos(pitch);
  return out
    .set(Math.sin(yaw) * cosP, Math.sin(pitch), Math.cos(yaw) * cosP)
    .normalize();
}

/**
 * Builds a right-handed orientation quaternion whose local +Z nose aligns with `forward`
 * and local +Y dorsal fin stays upright relative to world Y.
 */
export function computeFishTargetQuaternion(
  forward: THREE.Vector3,
  out = new THREE.Quaternion(),
): THREE.Quaternion {
  _fwd.copy(forward).normalize();
  if (Math.abs(_fwd.y) > 0.985) {
    _fwd.y = Math.sign(_fwd.y) * 0.985;
    _fwd.normalize();
  }
  _right.crossVectors(_worldUp, _fwd).normalize();
  _up.crossVectors(_fwd, _right).normalize();
  _basisMat.makeBasis(_right, _up, _fwd);
  return out.setFromRotationMatrix(_basisMat);
}

export interface SwimTuningOptions {
  mouseSensitivityScale?: number;
  keyTurnSpeedScale?: number;
  invertMouseY?: boolean;
}

const _toTarget = new THREE.Vector3();
const _desiredVel = new THREE.Vector3();
const _parallelVel = new THREE.Vector3();
const _perpVel = new THREE.Vector3();

/**
 * Immediately stops fish momentum and clears banking roll/flex.
 */
export function stopSwimMotion(state: SwimState): void {
  state.velocity.set(0, 0, 0);
  state.fishRoll = 0;
  state.turnFlex = 0;
}

/**
 * Zeroes inward velocity components when clamped against seabed, ceiling, or canyon walls
 * so momentum never piles up into boundaries and causes sticky turning or movement stalls.
 */
export function clampVelocityAgainstBounds(
  state: SwimState,
  candidatePos: { x: number; y: number; z: number },
  clampedPos: { x: number; y: number; z: number },
): void {
  const dx = clampedPos.x - candidatePos.x;
  const dy = clampedPos.y - candidatePos.y;
  const dz = clampedPos.z - candidatePos.z;
  if ((dx > 1e-4 && state.velocity.x < 0) || (dx < -1e-4 && state.velocity.x > 0)) {
    state.velocity.x = 0;
  }
  if ((dy > 1e-4 && state.velocity.y < 0) || (dy < -1e-4 && state.velocity.y > 0)) {
    state.velocity.y = 0;
  }
  if ((dz > 1e-4 && state.velocity.z < 0) || (dz < -1e-4 && state.velocity.z > 0)) {
    state.velocity.z = 0;
  }
}

/**
 * Propels the fish forward along its current nose direction for Boris's Dash Mutation.
 */
export function triggerSwimDash(
  state: SwimState,
  dashSpeed = 20.5,
  out = new THREE.Vector3(),
): THREE.Vector3 {
  _noseDir.set(0, 0, 1).applyQuaternion(state.fishQuat).normalize();
  state.velocity.copy(_noseDir).multiplyScalar(dashSpeed);
  return out.copy(_noseDir);
}

/**
 * Advances Subnautica-style swimming physics:
 * - Mouse deltas and A/D rotate the camera orbit yaw/pitch (no lateral strafe).
 * - Fish smoothly slerps toward camera forward look direction (quaternion.slerp).
 * - W applies thrust strictly along the fish's nose; releasing W glides smoothly under water drag.
 * - S brakes forward momentum rapidly, then gently reverses.
 * - Turning induces organic banking roll (left turn dips left fin, right turn dips right fin).
 */
export function stepSwimMotion(
  state: SwimState,
  input: SwimInputState,
  speedMultiplier: number,
  dt: number,
  tuning?: SwimTuningOptions,
  dashBoostActive = false,
  noseOut?: THREE.Vector3,
): {
  candidatePosition: { x: number; y: number; z: number };
  noseDir: THREE.Vector3;
  speed: number;
} {
  const sensScale = tuning?.mouseSensitivityScale ?? 1.0;
  const turnScale = tuning?.keyTurnSpeedScale ?? 1.0;
  const ySign = tuning?.invertMouseY ? -1 : 1;

  const mouseSensitivity = 0.0032 * sensScale;
  const keyYawSpeed = 2.15 * turnScale;
  const maxPitch = 1.05;

  const keyTurn = (input.turnLeft ? 1 : 0) - (input.turnRight ? 1 : 0);
  const prevCamYaw = state.camYaw;

  state.camYaw = wrapAngleRad(
    state.camYaw -
      input.mouseDeltaX * mouseSensitivity +
      keyTurn * keyYawSpeed * dt,
  );
  state.camPitch = THREE.MathUtils.clamp(
    state.camPitch - input.mouseDeltaY * mouseSensitivity * ySign,
    -maxPitch,
    maxPitch,
  );

  // Target orientation from camera sightline (center screen reticle)
  const lookDir = computeSwimForward(state.camYaw, state.camPitch, _fwd);
  computeFishTargetQuaternion(lookDir, _targetQuat);

  // Smooth quaternion slerp for organic underwater turning weight
  const slerpAlpha = 1 - Math.exp(-7.5 * dt);
  state.fishQuat.slerp(_targetQuat, slerpAlpha);

  // Actual fish nose direction in world space (local +Z)
  _noseDir.set(0, 0, 1).applyQuaternion(state.fishQuat).normalize();

  // Compute banking roll & body bend from yaw angular velocity + heading error
  const fishYaw = Math.atan2(_noseDir.x, _noseDir.z);
  const yawError = wrapAngleRad(state.camYaw - fishYaw);
  const camYawVel = THREE.MathUtils.clamp(
    wrapAngleRad(state.camYaw - prevCamYaw) / Math.max(dt, 0.001),
    -4.2,
    4.2,
  );

  // Positive roll around +Z dips -X (right fin); negative roll dips +X (left fin)
  const targetRoll = THREE.MathUtils.clamp(
    -yawError * 0.95 - camYawVel * 0.16,
    -0.62,
    0.62,
  );
  state.fishRoll = THREE.MathUtils.damp(state.fishRoll, targetRoll, 7.2, dt);

  const targetFlex = THREE.MathUtils.clamp(yawError * 0.45 + camYawVel * 0.06, -0.32, 0.32);
  state.turnFlex = THREE.MathUtils.damp(state.turnFlex, targetFlex, 8.0, dt);

  // Thrust (W) and Braking / Reverse (S) along the fish's nose
  const swimAccel = 27 * speedMultiplier;
  const forwardSpeed = state.velocity.dot(_noseDir);

  if (input.forward) {
    state.velocity.addScaledVector(_noseDir, swimAccel * dt);
  }

  if (input.backward) {
    if (forwardSpeed > 0.45) {
      // Rapid hydrodynamic braking when swimming forward
      const brakeDrag = Math.exp(-8.5 * dt);
      state.velocity.multiplyScalar(brakeDrag);
    } else {
      // Gentle reverse thrust once slowed
      state.velocity.addScaledVector(_noseDir, -swimAccel * 0.45 * dt);
    }
  }

  // Optional vertical trim (Space / C)
  const vertTrim = (input.ascend ? 1 : 0) - (input.descend ? 1 : 0);
  if (vertTrim !== 0) {
    state.velocity.y += vertTrim * swimAccel * 0.72 * dt;
  }

  // Viscous water drag: smooth glide when W is released
  const waterDrag = Math.exp(-2.85 * dt);
  state.velocity.multiplyScalar(waterDrag);

  const maxSpeed = (dashBoostActive ? 20.5 : 10.8) * speedMultiplier;
  if (state.velocity.lengthSq() > maxSpeed * maxSpeed) {
    state.velocity.setLength(maxSpeed);
  }

  const candidatePosition = {
    x: state.position.x + state.velocity.x * dt,
    y: state.position.y + state.velocity.y * dt,
    z: state.position.z + state.velocity.z * dt,
  };

  return {
    candidatePosition,
    noseDir: (noseOut ?? new THREE.Vector3()).copy(_noseDir),
    speed: state.velocity.length(),
  };
}

/**
 * Steers the fish smoothly toward a 3D double-click target point and stops cleanly on arrival.
 * Damps tangential velocity perpendicular to target so close-range arrivals never orbit in circles.
 * Camera orbit gently follows unless the player is actively panning with the mouse.
 */
export function stepAutopilotMotion(
  state: SwimState,
  target: THREE.Vector3,
  mouseDeltaX: number,
  mouseDeltaY: number,
  speedMultiplier: number,
  dt: number,
  tuning?: SwimTuningOptions,
  arrivalRadius = 0.85,
  noseOut?: THREE.Vector3,
): {
  candidatePosition: { x: number; y: number; z: number };
  noseDir: THREE.Vector3;
  speed: number;
  arrived: boolean;
} {
  _toTarget.subVectors(target, state.position);
  const dist = _toTarget.length();

  if (dist <= arrivalRadius) {
    state.velocity.set(0, 0, 0);
    state.fishRoll = THREE.MathUtils.damp(state.fishRoll, 0, 10, dt);
    state.turnFlex = THREE.MathUtils.damp(state.turnFlex, 0, 10, dt);
    _noseDir.set(0, 0, 1).applyQuaternion(state.fishQuat).normalize();
    return {
      candidatePosition: {
        x: state.position.x,
        y: state.position.y,
        z: state.position.z,
      },
      noseDir: (noseOut ?? new THREE.Vector3()).copy(_noseDir),
      speed: 0,
      arrived: true,
    };
  }

  const dirToTarget = _toTarget.multiplyScalar(1 / dist);
  const desiredYaw = Math.atan2(dirToTarget.x, dirToTarget.z);
  const desiredPitch = THREE.MathUtils.clamp(
    Math.asin(THREE.MathUtils.clamp(dirToTarget.y, -0.96, 0.96)),
    -1.05,
    1.05,
  );

  // Allow optional manual mouse look during autopilot, otherwise smoothly align camera behind swim path
  if (Math.abs(mouseDeltaX) > 0.01 || Math.abs(mouseDeltaY) > 0.01) {
    const sensScale = tuning?.mouseSensitivityScale ?? 1.0;
    const ySign = tuning?.invertMouseY ? -1 : 1;
    const mouseSensitivity = 0.0032 * sensScale;
    state.camYaw = wrapAngleRad(state.camYaw - mouseDeltaX * mouseSensitivity);
    state.camPitch = THREE.MathUtils.clamp(
      state.camPitch - mouseDeltaY * mouseSensitivity * ySign,
      -1.05,
      1.05,
    );
  } else {
    const yawDiff = wrapAngleRad(desiredYaw - state.camYaw);
    const camFollow = 1 - Math.exp(-3.4 * dt);
    state.camYaw = wrapAngleRad(state.camYaw + yawDiff * camFollow);
    state.camPitch = THREE.MathUtils.damp(state.camPitch, desiredPitch, 3.4, dt);
  }

  // Smooth quaternion slerp toward the target direction (snappier when close so fish won't orbit)
  computeFishTargetQuaternion(dirToTarget, _targetQuat);
  const turnRate = dist < 3.0 ? 12.5 : 8.5;
  const slerpAlpha = 1 - Math.exp(-turnRate * dt);
  state.fishQuat.slerp(_targetQuat, slerpAlpha);

  _noseDir.set(0, 0, 1).applyQuaternion(state.fishQuat).normalize();
  const fishYaw = Math.atan2(_noseDir.x, _noseDir.z);
  const yawError = wrapAngleRad(desiredYaw - fishYaw);

  const targetRoll = THREE.MathUtils.clamp(-yawError * 0.95, -0.62, 0.62);
  state.fishRoll = THREE.MathUtils.damp(state.fishRoll, targetRoll, 7.2, dt);

  const targetFlex = THREE.MathUtils.clamp(yawError * 0.5, -0.32, 0.32);
  state.turnFlex = THREE.MathUtils.damp(state.turnFlex, targetFlex, 8.0, dt);

  // Proportional arrival speed + aggressive lateral slip damping prevents circling near target
  const maxSpeed = 10.2 * speedMultiplier;
  const slowZone = 3.8;
  const targetSpeed =
    dist < slowZone
      ? Math.max(0.85, maxSpeed * (dist / slowZone))
      : maxSpeed;

  const vDot = state.velocity.dot(dirToTarget);
  _parallelVel.copy(dirToTarget).multiplyScalar(Math.max(0, vDot));
  _perpVel.copy(state.velocity).addScaledVector(dirToTarget, -vDot);

  const perpDecay = Math.exp(-(dist < slowZone ? 16.0 : 10.0) * dt);
  _perpVel.multiplyScalar(perpDecay);

  _desiredVel.copy(dirToTarget).multiplyScalar(targetSpeed);
  const velLerp = 1 - Math.exp(-7.5 * dt);
  _parallelVel.lerp(_desiredVel, velLerp);
  state.velocity.copy(_parallelVel).add(_perpVel);

  // Prevent overshooting past target in a single sub-step
  const stepTravel = state.velocity.length() * dt;
  if (stepTravel >= dist - arrivalRadius * 0.5) {
    state.velocity.set(0, 0, 0);
    return {
      candidatePosition: {
        x: target.x,
        y: target.y,
        z: target.z,
      },
      noseDir: (noseOut ?? new THREE.Vector3()).copy(_noseDir),
      speed: 0,
      arrived: true,
    };
  }

  return {
    candidatePosition: {
      x: state.position.x + state.velocity.x * dt,
      y: state.position.y + state.velocity.y * dt,
      z: state.position.z + state.velocity.z * dt,
    },
    noseDir: (noseOut ?? new THREE.Vector3()).copy(_noseDir),
    speed: state.velocity.length(),
    arrived: false,
  };
}

/**
 * Verifies whether the mouse button used for hold-to-swim is still physically pressed
 * according to PointerEvent.buttons, preventing permanently stuck LMB/MMB/RMB hold states
 * when pointerup is swallowed by pointer lock, context menus, overlays, or leaving the frame.
 */
export function isHoldButtonSynced(
  holdButton: number | null,
  eventButtons: number,
  isPointerLocked: boolean,
): boolean {
  if (holdButton === null) return false;
  if (isPointerLocked) return true;
  const mask =
    holdButton === 0 ? 1 : holdButton === 1 ? 4 : holdButton === 2 ? 2 : 0;
  if (mask === 0) return false;
  return (eventButtons & mask) !== 0;
}

/**
 * Tracks whether autopilot is making meaningful progress toward its destination.
 * If the fish stays blocked against terrain, the liner hull, or a closed gate without
 * getting closer for `maxStallSec`, aborts autopilot so the fish stops cleanly.
 */
export function shouldAbortStalledAutopilot(
  bestDistSq: number,
  currentDistSq: number,
  stallSec: number,
  dt: number,
  maxStallSec = 0.6,
): { bestDistSq: number; stallSec: number; abort: boolean } {
  const bestDist = Math.sqrt(Math.max(0, bestDistSq));
  const currentDist = Math.sqrt(Math.max(0, currentDistSq));
  if (!Number.isFinite(bestDist) || currentDist < bestDist - 0.03) {
    return {
      bestDistSq: currentDistSq,
      stallSec: 0,
      abort: false,
    };
  }
  const nextStall = stallSec + Math.max(0, dt);
  return {
    bestDistSq,
    stallSec: nextStall,
    abort: nextStall >= maxStallSec,
  };
}

export interface CameraRigOffset {
  distance: number;
  panX: number;
  panY: number;
}

export const DEFAULT_CAMERA_DISTANCE = 8.2;
export const MIN_CAMERA_DISTANCE = 4.0;
export const MAX_CAMERA_DISTANCE = 18.5;

export function createDefaultCameraOffset(): CameraRigOffset {
  return {
    distance: DEFAULT_CAMERA_DISTANCE,
    panX: 0,
    panY: 0,
  };
}

export function clampCameraZoom(distance: number): number {
  if (!Number.isFinite(distance)) return DEFAULT_CAMERA_DISTANCE;
  return THREE.MathUtils.clamp(distance, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE);
}

export function applyCameraPanDelta(
  offset: CameraRigOffset,
  dxPixels: number,
  dyPixels: number,
): CameraRigOffset {
  const sensitivity = 0.0085;
  return {
    distance: offset.distance,
    panX: THREE.MathUtils.clamp(offset.panX - dxPixels * sensitivity, -3.8, 3.8),
    panY: THREE.MathUtils.clamp(offset.panY + dyPixels * sensitivity, -2.4, 2.4),
  };
}

const _camRightVec = new THREE.Vector3();

export function computeOrbitCameraVectors(
  playerPos: THREE.Vector3,
  lookDir: THREE.Vector3,
  offset: CameraRigOffset,
  desiredPosOut: THREE.Vector3,
  lookTargetOut: THREE.Vector3,
): void {
  _camRightVec.crossVectors(lookDir, _worldUp);
  if (_camRightVec.lengthSq() < 1e-5) {
    _camRightVec.set(1, 0, 0);
  } else {
    _camRightVec.normalize();
  }

  const dist = clampCameraZoom(offset.distance);
  desiredPosOut.set(
    playerPos.x - lookDir.x * dist + _camRightVec.x * offset.panX,
    playerPos.y - lookDir.y * dist + 1.45 + offset.panY,
    playerPos.z - lookDir.z * dist + _camRightVec.z * offset.panX,
  );

  lookTargetOut.set(
    playerPos.x + lookDir.x * 14.0 + _camRightVec.x * offset.panX,
    playerPos.y + lookDir.y * 14.0 + 0.35 + offset.panY,
    playerPos.z + lookDir.z * 14.0 + _camRightVec.z * offset.panX,
  );
}

