import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_1_NET_WINDOWS,
  CHAPTER_1_NET_Z,
  CHAPTER_1_SHELTERS,
  CHAPTER_2_PAFNUTIY_POS,
  CHAPTER_2_PELICAN_GATE_Z,
  CHAPTER_2_SHELTERS,
  CHAPTER_3_DEBRIS_GATE_Z,
  CHAPTER_3_SCRAPS,
  CHAPTER_3_SHELTERS,
  CHAPTER_4_CHARYBDIS_GATE_Z,
  CHAPTER_4_PEARLS,
  CHAPTER_4_SHELTERS,
  CHAPTER_4_WHALE_CONTAINER_POS,
  CHAPTER_SIDE_CURRENTS,
  clampPlayerPosition,
  clampPlayerPositionForChapter,
  createInitialChapter3Predator,
  createInitialChapter4Predator,
  createInitialSquid,
  getChapter2FloorHeight,
  getChapter3FloorHeight,
  getChapter4FloorHeight,
  getReefFloorHeight,
  getRoomIdForZChapter3,
  getRoomIdForZChapter4,
  isInsideCoralShelter,
  isPointInTrawlerWindows,
  resolveCharybdisGateCollision,
  resolveCrabDebrisCollision,
  resolvePelicanGateCollision,
  resolveTrawlerNetCollision,
  sampleSideCurrent,
  stepPafnutiyNoiseCheck,
  stepShelterOxygenRecovery,
  stepSquidAI,
} from './physics';
import { clampVelocityAgainstBounds, createInitialSwimState } from './swimControls';

test('trawler net blocks solid sections and lets player pass through all 3 open windows', () => {
  assert.equal(CHAPTER_1_NET_WINDOWS.length, 3);

  for (const w of CHAPTER_1_NET_WINDOWS) {
    assert.equal(isPointInTrawlerWindows(w.x, w.y), true);
    const res = resolveTrawlerNetCollision(
      { x: w.x, y: w.y, z: CHAPTER_1_NET_Z + 1.4 },
      { x: w.x, y: w.y, z: CHAPTER_1_NET_Z - 1.4 },
    );
    assert.equal(res.hitNet, false);
    assert.equal(res.position.z, CHAPTER_1_NET_Z - 1.4);
  }

  // Blocked rope section between windows
  const blocked = resolveTrawlerNetCollision(
    { x: -3.6, y: 2.0, z: CHAPTER_1_NET_Z + 1.4 },
    { x: -3.6, y: 2.0, z: CHAPTER_1_NET_Z - 1.4 },
  );
  assert.equal(blocked.hitNet, true);
  assert.ok(blocked.position.z > CHAPTER_1_NET_Z);
});

test('coral shelter detects stealth hiding and floor clamping keeps fish above sand', () => {
  const s = CHAPTER_1_SHELTERS[0];
  assert.equal(isInsideCoralShelter({ x: s.x, y: s.y, z: s.z }), true);
  assert.equal(isInsideCoralShelter({ x: 0, y: 4, z: 0 }), false);

  const floor = getReefFloorHeight(0, -10);
  const clamped = clampPlayerPosition({ x: 0, y: floor - 5, z: -10 });
  assert.ok(clamped.y >= floor + 1.0);

  // Verify seabed corridor stays smooth locally without sinusoidal washboard spikes
  let maxStepDelta = 0;
  for (let x = -8; x <= 7; x += 1) {
    const h0 = getReefFloorHeight(x, -20);
    const h1 = getReefFloorHeight(x + 1, -20);
    maxStepDelta = Math.max(maxStepDelta, Math.abs(h1 - h0));
  }
  assert.ok(maxStepDelta < 0.08, `Expected smooth floor, got maxStepDelta=${maxStepDelta}`);
});

test('rocket squid telegraphs before dashing and ignores hidden player', () => {
  let squid = createInitialSquid();
  // Player hidden inside shelter nearby -> squid stays in patrol
  const hiddenStep = stepSquidAI(
    squid,
    { x: squid.position.x + 2, y: squid.position.y, z: squid.position.z },
    true,
    1.0,
    0.05,
    1,
  );
  assert.equal(hiddenStep.telegraphStarted, false);
  assert.equal(hiddenStep.squid.state, 'patrol');

  // Visible player nearby -> triggers telegraph first, never instant teleport damage
  const alertStep = stepSquidAI(
    squid,
    { x: squid.position.x + 4, y: squid.position.y, z: squid.position.z },
    false,
    1.0,
    0.05,
    2,
  );
  assert.equal(alertStep.telegraphStarted, true);
  assert.equal(alertStep.squid.state, 'telegraph');
  assert.equal(alertStep.hitPlayer, false);
});

test('Chapter 2 Pelican Gate blocks until opened and bathymetry remains smooth', () => {
  const closed = resolvePelicanGateCollision(
    { x: 0, y: 0, z: CHAPTER_2_PELICAN_GATE_Z + 1.8 },
    { x: 0, y: 0, z: CHAPTER_2_PELICAN_GATE_Z - 1.5 },
    false,
  );
  assert.equal(closed.hitGate, true);
  assert.ok(closed.position.z > CHAPTER_2_PELICAN_GATE_Z);

  const opened = resolvePelicanGateCollision(
    { x: 0, y: 0, z: CHAPTER_2_PELICAN_GATE_Z + 1.8 },
    { x: 0, y: 0, z: CHAPTER_2_PELICAN_GATE_Z - 1.5 },
    true,
  );
  assert.equal(opened.hitGate, false);
  assert.equal(opened.position.z, CHAPTER_2_PELICAN_GATE_Z - 1.5);

  const f2 = getChapter2FloorHeight(0, -40);
  const clamped = clampPlayerPositionForChapter(2, { x: 0, y: f2 - 6, z: -40 });
  assert.ok(clamped.y >= f2 + 1.0);
  assert.equal(
    isInsideCoralShelter({ ...CHAPTER_2_SHELTERS[0] }, CHAPTER_2_SHELTERS),
    true,
  );
});

test('Pafnutiy noise check triggers on fast swimming and respects Silent Fins upgrade', () => {
  const near = {
    x: CHAPTER_2_PAFNUTIY_POS.x + 2,
    y: CHAPTER_2_PAFNUTIY_POS.y,
    z: CHAPTER_2_PAFNUTIY_POS.z + 2,
  };
  const quiet = stepPafnutiyNoiseCheck(near, 3.0, CHAPTER_2_PAFNUTIY_POS, false, false, false);
  assert.equal(quiet.triggered, false);

  const loud = stepPafnutiyNoiseCheck(near, 6.2, CHAPTER_2_PAFNUTIY_POS, false, false, false);
  assert.equal(loud.triggered, true);

  const silenced = stepPafnutiyNoiseCheck(near, 6.2, CHAPTER_2_PAFNUTIY_POS, true, false, false);
  assert.equal(silenced.triggered, false);
});

test('Chapter 3 Kelp Forest rubble gate, shelters, scraps, and bathymetry work cleanly', () => {
  assert.equal(CHAPTER_3_SCRAPS.length, 3);
  const closed = resolveCrabDebrisCollision(
    { x: 0, y: -2, z: CHAPTER_3_DEBRIS_GATE_Z + 1.8 },
    { x: 0, y: -2, z: CHAPTER_3_DEBRIS_GATE_Z - 1.5 },
    false,
  );
  assert.equal(closed.hitDebris, true);
  assert.ok(closed.position.z > CHAPTER_3_DEBRIS_GATE_Z);

  const opened = resolveCrabDebrisCollision(
    { x: 0, y: -2, z: CHAPTER_3_DEBRIS_GATE_Z + 1.8 },
    { x: 0, y: -2, z: CHAPTER_3_DEBRIS_GATE_Z - 1.5 },
    true,
  );
  assert.equal(opened.hitDebris, false);
  assert.equal(opened.position.z, CHAPTER_3_DEBRIS_GATE_Z - 1.5);

  const f3 = getChapter3FloorHeight(0, -45);
  const clamped = clampPlayerPositionForChapter(3, { x: 0, y: f3 - 5, z: -45 });
  assert.ok(clamped.y >= f3 + 1.0);
  assert.equal(
    isInsideCoralShelter({ ...CHAPTER_3_SHELTERS[1] }, CHAPTER_3_SHELTERS),
    true,
  );
  const pred = createInitialChapter3Predator();
  assert.equal(pred.state, 'patrol');
  assert.equal(getRoomIdForZChapter3(-15), 'ch3_kelp_edge');
  assert.equal(getRoomIdForZChapter3(-45), 'ch3_whisper_corridor');
  assert.equal(getRoomIdForZChapter3(-75), 'ch3_crab_outpost');
});

test('Chapter 4 Leviathan Graveyard Charybdis gate, vertebra shelters, and bathymetry work cleanly', () => {
  assert.equal(CHAPTER_4_PEARLS.length, 4);
  assert.ok(CHAPTER_4_WHALE_CONTAINER_POS.z < -30);

  const closed = resolveCharybdisGateCollision(
    { x: 0, y: -2, z: CHAPTER_4_CHARYBDIS_GATE_Z + 1.8 },
    { x: 0, y: -2, z: CHAPTER_4_CHARYBDIS_GATE_Z - 1.5 },
    false,
  );
  assert.equal(closed.hitGate, true);
  assert.ok(closed.position.z > CHAPTER_4_CHARYBDIS_GATE_Z);

  const opened = resolveCharybdisGateCollision(
    { x: 0, y: -2, z: CHAPTER_4_CHARYBDIS_GATE_Z + 1.8 },
    { x: 0, y: -2, z: CHAPTER_4_CHARYBDIS_GATE_Z - 1.5 },
    true,
  );
  assert.equal(opened.hitGate, false);
  assert.equal(opened.position.z, CHAPTER_4_CHARYBDIS_GATE_Z - 1.5);

  const f4 = getChapter4FloorHeight(0, -45);
  const clamped = clampPlayerPositionForChapter(4, { x: 0, y: f4 - 6, z: -45 });
  assert.ok(clamped.y >= f4 + 1.0);
  assert.equal(
    isInsideCoralShelter({ ...CHAPTER_4_SHELTERS[1] }, CHAPTER_4_SHELTERS),
    true,
  );
  const pred = createInitialChapter4Predator();
  assert.equal(pred.state, 'patrol');
  assert.equal(getRoomIdForZChapter4(-15), 'ch4_ribcage_hall');
  assert.equal(getRoomIdForZChapter4(-45), 'ch4_sperm_whale');
  assert.equal(getRoomIdForZChapter4(-75), 'ch4_charybdis_gate');
});

test('side currents drift gently in Chapters 4/7/10, Egg Resonance doubles O2 recovery, and boundary clamping zeroes inward velocity', () => {
  const cur4 = sampleSideCurrent({ x: 0, y: 0, z: -40 }, CHAPTER_SIDE_CURRENTS[4], 1.2);
  assert.equal(cur4.active, true);
  assert.ok(cur4.forceX > 0);

  const outside = sampleSideCurrent({ x: 0, y: 0, z: -5 }, CHAPTER_SIDE_CURRENTS[4], 1.2);
  assert.equal(outside.active, false);
  assert.equal(outside.forceX, 0);

  const normalO2 = stepShelterOxygenRecovery(50, 100, true, 1.0, 1);
  const resonantO2 = stepShelterOxygenRecovery(50, 100, true, 1.0, 2);
  assert.equal(normalO2, 56.5);
  assert.equal(resonantO2, 63);

  const swim = createInitialSwimState();
  swim.velocity.set(-5, -4, 3);
  clampVelocityAgainstBounds(
    swim,
    { x: -16.2, y: -6.0, z: -20 },
    { x: -15.5, y: -4.2, z: -20 },
  );
  assert.equal(swim.velocity.x, 0);
  assert.equal(swim.velocity.y, 0);
  assert.equal(swim.velocity.z, 3);
});

