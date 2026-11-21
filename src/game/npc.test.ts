import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPAIGN_NPC_BLUEPRINTS,
  createChapter1NPCs,
  triggerShrimpPanic,
  updateNPCProximity,
} from './npc';

test('all 8 campaign NPC blueprints have 2-line speech bubbles and valid behaviors', () => {
  assert.equal(CAMPAIGN_NPC_BLUEPRINTS.length, 8);
  for (const npc of CAMPAIGN_NPC_BLUEPRINTS) {
    assert.equal(npc.lines.length, 2);
    assert.ok(['static', 'patrol', 'flock', 'escort'].includes(npc.behavior));
  }
});

test('NPC speech bubble stays hidden until player swims close', () => {
  const [mildred] = createChapter1NPCs();
  assert.equal(mildred.revealed, false);

  const far = updateNPCProximity(mildred, { x: 0, y: 3, z: 10 }, 0.1, 1);
  assert.equal(far.npc.revealed, false);
  assert.equal(far.justMet, false);

  const near = updateNPCProximity(
    far.npc,
    { x: mildred.position.x + 1, y: mildred.position.y, z: mildred.position.z },
    0.1,
    2,
  );
  assert.equal(near.npc.revealed, true);
  assert.equal(near.justMet, true);
});

test('panic shrimps distract predator 4 times and hide for 60s on 5th panic', () => {
  const [, shrimps] = createChapter1NPCs();
  let cur = shrimps;
  for (let i = 1; i <= 4; i++) {
    const res = triggerShrimpPanic(cur, i * 2);
    assert.equal(res.distractedPredator, true);
    assert.equal(res.wentHiding, false);
    cur = res.npc;
  }

  const fifth = triggerShrimpPanic(cur, 10);
  assert.equal(fifth.wentHiding, true);
  assert.equal(fifth.distractedPredator, false);
  assert.equal(fifth.npc.hiddenUntilSec, 70);

  // While hidden, cannot panic again
  const whileHidden = triggerShrimpPanic(fifth.npc, 20);
  assert.equal(whileHidden.distractedPredator, false);
});
