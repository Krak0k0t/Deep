import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  computeFishTargetQuaternion,
  computeSwimForward,
  createInitialSwimState,
  isHoldButtonSynced,
  shouldAbortStalledAutopilot,
  stepAutopilotMotion,
  stepSwimMotion,
  stopSwimMotion,
  SwimInputState,
} from './swimControls';

function neutralInput(overrides: Partial<SwimInputState> = {}): SwimInputState {
  return {
    forward: false,
    backward: false,
    turnLeft: false,
    turnRight: false,
    ascend: false,
    descend: false,
    mouseDeltaX: 0,
    mouseDeltaY: 0,
    ...overrides,
  };
}

test('computeSwimForward aligns local +Z nose along -Z when yaw is PI', () => {
  const fwd = computeSwimForward(Math.PI, 0);
  assert.ok(Math.abs(fwd.x) < 1e-6);
  assert.ok(Math.abs(fwd.y) < 1e-6);
  assert.ok(Math.abs(fwd.z + 1) < 1e-6);

  const q = computeFishTargetQuaternion(fwd);
  const nose = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  assert.ok(nose.distanceTo(fwd) < 1e-5);
});

test('W thrusts along fish nose and releasing W decelerates smoothly via water drag', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);

  // Hold W for several steps
  let res = stepSwimMotion(state, neutralInput({ forward: true }), 1.0, 0.04);
  for (let i = 0; i < 10; i++) {
    res = stepSwimMotion(state, neutralInput({ forward: true }), 1.0, 0.04);
  }
  assert.ok(state.velocity.z < -4.0, 'Expected forward thrust toward -Z');
  assert.ok(Math.abs(state.velocity.x) < 0.05);

  const speedWithThrust = res.speed;
  // Release W -> velocity decays smoothly
  const coastRes = stepSwimMotion(state, neutralInput(), 1.0, 0.04);
  assert.ok(coastRes.speed < speedWithThrust && coastRes.speed > 0);
});

test('S brakes forward momentum rapidly without moving sideways', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  state.velocity.set(0, 0, -8.0);

  const noBrake = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  noBrake.velocity.set(0, 0, -8.0);

  const rBrake = stepSwimMotion(state, neutralInput({ backward: true }), 1.0, 0.04);
  const rCoast = stepSwimMotion(noBrake, neutralInput(), 1.0, 0.04);

  assert.ok(
    rBrake.speed < rCoast.speed * 0.85,
    `Expected S to brake faster than passive drag (${rBrake.speed} vs ${rCoast.speed})`,
  );
});

test('A and D rotate yaw and induce banking roll without lateral strafe', () => {
  const stateA = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  for (let i = 0; i < 8; i++) {
    stepSwimMotion(stateA, neutralInput({ turnLeft: true }), 1.0, 0.04);
  }
  // No velocity should be added from A alone (no strafing!)
  assert.ok(stateA.velocity.length() < 1e-6);
  // Turning left from -Z rotates nose toward -X and banks left (negative roll around +Z)
  const fwdLeft = computeSwimForward(stateA.camYaw, 0);
  assert.ok(fwdLeft.x < -0.2, `Expected left turn toward -X, got x=${fwdLeft.x}`);
  assert.ok(stateA.fishRoll < -0.05, `Expected left bank < 0, got ${stateA.fishRoll}`);

  const stateD = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  for (let i = 0; i < 8; i++) {
    stepSwimMotion(stateD, neutralInput({ turnRight: true }), 1.0, 0.04);
  }
  assert.ok(stateD.velocity.length() < 1e-6);
  const fwdRight = computeSwimForward(stateD.camYaw, 0);
  assert.ok(fwdRight.x > 0.2, `Expected right turn toward +X, got x=${fwdRight.x}`);
  assert.ok(stateD.fishRoll > 0.05, `Expected right bank > 0, got ${stateD.fishRoll}`);
});

test('Mouse orbit steers camera sightline and fish quaternion slerps smoothly toward it', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  const startQuat = state.fishQuat.clone();

  // Mouse moves right (+X) and up (-Y)
  const r = stepSwimMotion(
    state,
    neutralInput({ mouseDeltaX: 120, mouseDeltaY: -80, forward: true }),
    1.0,
    0.04,
  );
  assert.ok(state.camYaw < Math.PI, 'Moving mouse right turns camYaw right');
  assert.ok(state.camPitch > 0, 'Moving mouse up pitches camera up');
  assert.ok(startQuat.angleTo(state.fishQuat) > 0.01);
  assert.ok(r.noseDir.x > 0, 'Fish nose begins turning toward +X');
  assert.ok(r.noseDir.y > 0, 'Fish nose begins pitching upward');
});

test('stepAutopilotMotion steers fish to target point and stops completely on arrival', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  const target = new THREE.Vector3(-4.5, 2.5, -6.0);

  let arrived = false;
  let sawBank = false;
  for (let i = 0; i < 120; i++) {
    const res = stepAutopilotMotion(state, target, 0, 0, 1.0, 0.04);
    state.position.set(
      res.candidatePosition.x,
      res.candidatePosition.y,
      res.candidatePosition.z,
    );
    if (Math.abs(state.fishRoll) > 0.04) sawBank = true;
    if (res.arrived) {
      arrived = true;
      break;
    }
  }

  assert.ok(arrived, 'Fish should arrive at double-click target within simulation steps');
  assert.ok(sawBank, 'Fish should bank organically while turning toward target');
  assert.ok(state.position.distanceTo(target) <= 0.9);
  assert.equal(state.velocity.length(), 0);
});

test('stepAutopilotMotion arrives and stops cleanly near Octopus Boris in Chapter 2', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 2.2, 4), Math.PI, -0.06);
  const borisApproach = new THREE.Vector3(-4.8, 1.8, -12.8);

  let arrived = false;
  for (let i = 0; i < 150; i++) {
    const res = stepAutopilotMotion(state, borisApproach, 0, 0, 1.0, 0.04);
    state.position.set(
      res.candidatePosition.x,
      res.candidatePosition.y,
      res.candidatePosition.z,
    );
    if (res.arrived) {
      arrived = true;
      break;
    }
  }

  assert.ok(arrived, 'Fish should reach Boris approach point and stop');
  assert.equal(state.velocity.length(), 0);
});

test('isHoldButtonSynced detects missed pointerup when eventButtons drops held button bit', () => {
  assert.equal(isHoldButtonSynced(0, 1, false), true);
  assert.equal(isHoldButtonSynced(0, 0, false), false);
  assert.equal(isHoldButtonSynced(2, 2, false), true);
  assert.equal(isHoldButtonSynced(2, 1, false), false);
  assert.equal(isHoldButtonSynced(1, 4, false), true);
  assert.equal(isHoldButtonSynced(1, 0, false), false);
  assert.equal(isHoldButtonSynced(null, 1, false), false);
  assert.equal(isHoldButtonSynced(0, 0, true), true);
});

test('shouldAbortStalledAutopilot aborts when fish makes no progress against a wall or gate', () => {
  let best = Infinity;
  let stall = 0;

  // Steady progress should reset stall timer and never abort
  for (let d = 10; d >= 5; d -= 0.5) {
    const r = shouldAbortStalledAutopilot(best, d * d, stall, 0.04);
    best = r.bestDistSq;
    stall = r.stallSec;
    assert.equal(r.abort, false);
  }

  // Blocked at fixed distance 5m for > 0.6s -> must abort autopilot
  let aborted = false;
  for (let i = 0; i < 20; i++) {
    const r = shouldAbortStalledAutopilot(best, 25, stall, 0.04);
    best = r.bestDistSq;
    stall = r.stallSec;
    if (r.abort) {
      aborted = true;
      break;
    }
  }
  assert.ok(aborted, 'Blocked autopilot should abort instead of pushing forever');
});

test('stopSwimMotion immediately zeros fish velocity and clears roll', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 4), Math.PI, 0);
  state.velocity.set(3, -1, -6);
  state.fishRoll = 0.4;
  state.turnFlex = -0.2;

  stopSwimMotion(state);
  assert.equal(state.velocity.length(), 0);
  assert.equal(state.fishRoll, 0);
  assert.equal(state.turnFlex, 0);
});

import {
  applyCameraPanDelta,
  clampCameraZoom,
  computeOrbitCameraVectors,
  createDefaultCameraOffset,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
} from './swimControls';

test('camera zoom and pan helpers clamp cleanly and shift orbit rig vectors', () => {
  assert.equal(clampCameraZoom(1.2), MIN_CAMERA_DISTANCE);
  assert.equal(clampCameraZoom(45), MAX_CAMERA_DISTANCE);
  assert.equal(clampCameraZoom(10.5), 10.5);

  let offset = createDefaultCameraOffset();
  offset = applyCameraPanDelta(offset, -5000, 5000);
  assert.equal(offset.panX, 3.8);
  assert.equal(offset.panY, 2.4);

  const playerPos = new THREE.Vector3(0, 3, 0);
  const lookDir = new THREE.Vector3(0, 0, -1);
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  computeOrbitCameraVectors(
    playerPos,
    lookDir,
    { distance: 12, panX: 1.5, panY: 0.5 },
    camPos,
    camTarget,
  );
  assert.ok(Math.abs(camPos.z - 12) < 1e-4);
  assert.ok(Math.abs(camPos.x - 1.5) < 1e-4);
  assert.ok(Math.abs(camTarget.x - 1.5) < 1e-4);
  assert.ok(camPos.y > 4.8);
});

test('stepAutopilotMotion damps strong lateral velocity near target without orbiting in place', () => {
  const state = createInitialSwimState(new THREE.Vector3(0, 3, 0), Math.PI, 0);
  // Strong perpendicular momentum close to target — previously risked circling outside arrivalRadius
  state.velocity.set(8.5, 0, 0);
  const target = new THREE.Vector3(0, 3, -1.5);
  const noseScratch = new THREE.Vector3();

  let arrived = false;
  let maxExcursionX = 0;
  for (let i = 0; i < 40; i++) {
    const res = stepAutopilotMotion(state, target, 0, 0, 1.0, 0.04, undefined, 0.85, noseScratch);
    state.position.set(
      res.candidatePosition.x,
      res.candidatePosition.y,
      res.candidatePosition.z,
    );
    maxExcursionX = Math.max(maxExcursionX, Math.abs(state.position.x));
    if (res.arrived) {
      arrived = true;
      break;
    }
  }

  assert.ok(arrived, 'Fish should quickly damp lateral velocity and arrive without orbiting');
  assert.ok(maxExcursionX < 1.2, `Expected tight lateral damping (<1.2m), drifted x=${maxExcursionX}`);
  assert.equal(state.velocity.length(), 0);
});

