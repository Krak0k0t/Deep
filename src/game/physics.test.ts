import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_1_NET_WINDOWS,
  CHAPTER_1_NET_Z,
  CHAPTER_1_SHELTERS,
  clampPlayerPosition,
  createInitialSquid,
  getReefFloorHeight,
  isInsideCoralShelter,
  isPointInTrawlerWindows,
  resolveTrawlerNetCollision,
  stepSquidAI,
} from './physics';

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
