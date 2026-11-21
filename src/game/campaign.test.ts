import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS,
  createCampaignState,
  recordRoomDeath,
  advanceToRoom,
  getPredatorSpeedMultiplier,
  getPlayerSpeedMultiplier,
  emitCall,
  collectPearl,
  purchaseGlowSkin,
  registerStyleDodge,
  triggerEggPickupAscent,
  buildBalanceTelemetry,
} from './campaign';

test('campaign defines all 10 chapters across Descent (1-6) and Ascent (7-10)', () => {
  assert.equal(Object.keys(CHAPTERS).length, 10);
  assert.equal(CHAPTERS[1].phase, 'DESCENT');
  assert.equal(CHAPTERS[6].phase, 'DESCENT');
  assert.equal(CHAPTERS[7].phase, 'ASCENT');
  assert.equal(CHAPTERS[10].phase, 'ASCENT');
  assert.equal(CHAPTERS[1].fogColor, '#052236');
  assert.equal(CHAPTERS[1].fogDensity, 0.015);
});

test('kind difficulty slows predators by 20% after 2 consecutive deaths in a room and resets on advance', () => {
  let state = createCampaignState(1);
  assert.equal(getPredatorSpeedMultiplier(state), 1.0);

  state = advanceToRoom(state, 'ch1_squid_patrol');
  state = recordRoomDeath(state, 'ch1_squid_patrol');
  assert.equal(getPredatorSpeedMultiplier(state, 'ch1_squid_patrol'), 1.0);

  state = recordRoomDeath(state, 'ch1_squid_patrol');
  assert.equal(getPredatorSpeedMultiplier(state, 'ch1_squid_patrol'), 0.8);

  state = advanceToRoom(state, 'ch1_trawler_net');
  assert.equal(getPredatorSpeedMultiplier(state, 'ch1_squid_patrol'), 1.0);
  assert.equal(getPredatorSpeedMultiplier(state, 'ch1_trawler_net'), 1.0);
});

test('pearls persist across deaths and unlock gameplay-altering glow skins', () => {
  let state = createCampaignState(1);
  for (let i = 1; i <= 5; i++) {
    state = collectPearl(state, `p_${i}`);
  }
  // Duplicate pickup is ignored
  state = collectPearl(state, 'p_1');
  assert.equal(state.pearls, 5);

  state = recordRoomDeath(state, 'ch1_squid_patrol');
  assert.equal(state.pearls, 5);

  const res = purchaseGlowSkin(state, 'pearl');
  assert.equal(res.ok, true);
  assert.equal(res.state.pearls, 0);
  assert.equal(res.state.activeSkin, 'pearl');
});

test('DESCENT vs ASCENT Call mechanics and player speed modifier', () => {
  let state = createCampaignState(1);
  assert.equal(getPlayerSpeedMultiplier(state), 1.0);

  const d1 = emitCall(state, 10);
  assert.equal(d1.fired, true);
  assert.equal(d1.stunDurationSec, 0);
  // 2.5s cooldown in Descent
  assert.equal(emitCall(d1.state, 11).fired, false);
  assert.equal(emitCall(d1.state, 13).fired, true);

  state = triggerEggPickupAscent(d1.state);
  assert.equal(state.phase, 'ASCENT');
  assert.equal(getPlayerSpeedMultiplier(state), 0.85);

  const a1 = emitCall(state, 20);
  assert.equal(a1.fired, true);
  assert.equal(a1.stunDurationSec, 2.0);
  // 15s cooldown in Ascent
  assert.equal(emitCall(a1.state, 30).fired, false);
  assert.equal(emitCall(a1.state, 35.1).fired, true);
});

test('critic crabs style dodge combo awards 1 pearl on 3rd dodge and builds telemetry', () => {
  let state = createCampaignState(1);
  let r = registerStyleDodge(state);
  assert.equal(r.awardedPearl, false);
  r = registerStyleDodge(r.state);
  assert.equal(r.awardedPearl, false);
  r = registerStyleDodge(r.state);
  assert.equal(r.awardedPearl, true);
  assert.equal(r.state.pearls, 1);

  const telemetry = buildBalanceTelemetry(r.state, 42.34);
  assert.equal(telemetry.pearlsCollected, 1);
  assert.equal(telemetry.totalStyleDodges, 3);
  assert.equal(telemetry.elapsedSec, 42.3);
});
