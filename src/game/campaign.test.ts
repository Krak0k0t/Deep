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
  collectLoreRelic,
  purchaseGlowSkin,
  purchaseHideoutUpgrade,
  completeBorisMugQuest,
  completeCrabDebrisQuest,
  completeWhaleContainerQuest,
  completeQueenEscortQuest,
  completeWhaleRescueQuest,
  completeBorisShortcutQuest,
  completeKeshaAlertQuest,
  completeHatchlingQuest,
  recordChapterHit,
  recordPredatorSpot,
  calculateChapterRank,
  completeChapterMastery,
  registerStyleDodge,
  triggerEggPickupAscent,
  buildBalanceTelemetry,
} from './campaign';
import {
  CHAPTER_5_THERMAL_VENTS,
  CHAPTER_7_UPDRAFT_ZONES,
  sampleThermalVentHazard,
  sampleUpdraftCurrent,
} from './physics';

test('campaign defines and implements all 10 chapters across Descent (1-6) and Ascent (7-10)', () => {
  assert.equal(Object.keys(CHAPTERS).length, 10);
  for (let id = 1; id <= 10; id++) {
    assert.equal(CHAPTERS[id as 1].implemented, true, `Chapter ${id} must be implemented`);
  }
  assert.equal(CHAPTERS[2].title, 'Поющий кит');
  assert.equal(CHAPTERS[3].title, 'Мёртвый шёпот');
  assert.equal(CHAPTERS[4].title, 'Кладбище левиафанов');
  assert.equal(CHAPTERS[5].title, 'Чёрные курильщики');
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

test('hideout upgrades deduct pearls once and Chapters 2-10 quests track NPCs & rewards', () => {
  let state = createCampaignState(2);
  for (let i = 1; i <= 6; i++) {
    state = collectPearl(state, `ch2_p_${i}`);
  }
  const failRes = purchaseHideoutUpgrade({ ...state, pearls: 2 }, 'silent_fins');
  assert.equal(failRes.ok, false);

  const okRes = purchaseHideoutUpgrade(state, 'silent_fins');
  assert.equal(okRes.ok, true);
  assert.equal(okRes.state.pearls, 0);
  assert.ok(okRes.state.upgrades.includes('silent_fins'));

  // Re-purchasing owned upgrade is idempotent
  const repeatRes = purchaseHideoutUpgrade(okRes.state, 'silent_fins');
  assert.equal(repeatRes.ok, true);
  assert.equal(repeatRes.state.pearls, 0);

  const questDone = completeBorisMugQuest(repeatRes.state);
  assert.equal(questDone.quests.borisMug, true);
  assert.equal(questDone.hasDashMutation, true);
  assert.ok(questDone.npcsMet.includes('boris'));

  const ch3State = completeCrabDebrisQuest(createCampaignState(3));
  assert.equal(ch3State.quests.crabDebris, true);
  assert.ok(ch3State.npcsMet.includes('hermit_crabs'));

  const ch4State = completeWhaleContainerQuest(createCampaignState(4));
  assert.equal(ch4State.quests.whaleContainer, true);
  assert.ok(ch4State.npcsMet.includes('critic_crabs'));

  const ch5State = completeQueenEscortQuest(createCampaignState(5));
  assert.equal(ch5State.quests.queenEscort, true);
  assert.ok(ch5State.npcsMet.includes('queen_angler'));

  const ch7State = completeWhaleRescueQuest(createCampaignState(7));
  assert.equal(ch7State.quests.whaleRescued, true);
  assert.ok(ch7State.npcsMet.includes('young_whale'));

  const ch8State = completeBorisShortcutQuest(createCampaignState(8));
  assert.equal(ch8State.quests.borisShortcut, true);
  assert.ok(ch8State.npcsMet.includes('boris'));

  const ch9State = completeKeshaAlertQuest(createCampaignState(9));
  assert.equal(ch9State.quests.keshaAlert, true);
  assert.ok(ch9State.npcsMet.includes('kesha'));

  const ch10State = completeHatchlingQuest(createCampaignState(10));
  assert.equal(ch10State.quests.hatchlingBorn, true);
});

test('Chapters 5 & 7-10 thermal vent hazards and updraft currents respond accurately', () => {
  const vent = CHAPTER_5_THERMAL_VENTS[0];
  const insidePos = { x: vent.x, y: -2, z: vent.z };

  // Warning phase (t in [3.6, 4.9))
  const warn = sampleThermalVentHazard(insidePos, CHAPTER_5_THERMAL_VENTS, 4.0, 0);
  assert.equal(warn.warningVentId, vent.id);
  assert.equal(warn.eruptingVentId, null);
  assert.equal(warn.hitPlayer, false);

  // Erupting phase (t >= 4.9)
  const erupt = sampleThermalVentHazard(insidePos, CHAPTER_5_THERMAL_VENTS, 5.2, 0);
  assert.equal(erupt.eruptingVentId, vent.id);
  assert.ok(erupt.pushY > 0);
  assert.equal(erupt.hitPlayer, true);

  // Updraft zone boost
  const upd = CHAPTER_7_UPDRAFT_ZONES[0];
  const updHit = sampleUpdraftCurrent({ x: upd.x, y: 0, z: upd.z }, CHAPTER_7_UPDRAFT_ZONES);
  assert.equal(updHit.inUpdraft, true);
  assert.ok(updHit.boostForward > 0);
  assert.ok(updHit.boostY > 0);

  const updMiss = sampleUpdraftCurrent({ x: 14, y: 0, z: 0 }, CHAPTER_7_UPDRAFT_ZONES);
  assert.equal(updMiss.inUpdraft, false);
});

test('lore relic pickup grants 2 pearls once and chapter mastery computes S/A/B ranks with first-time S bonus', () => {
  let state = createCampaignState(2);
  const firstPick = collectLoreRelic(state, 'relic_ch2_bell');
  assert.equal(firstPick.isNew, true);
  state = firstPick.state;
  assert.equal(state.pearls, 2);
  assert.deepEqual(state.collectedRelicIds, ['relic_ch2_bell']);

  // Duplicate relic pickup is idempotent
  const dupPick = collectLoreRelic(state, 'relic_ch2_bell');
  assert.equal(dupPick.isNew, false);
  state = dupPick.state;
  assert.equal(state.pearls, 2);

  assert.equal(calculateChapterRank(0, 1), 'S');
  assert.equal(calculateChapterRank(1, 3), 'A');
  assert.equal(calculateChapterRank(2, 0), 'B');

  const firstS = completeChapterMastery(state);
  assert.equal(firstS.rank, 'S');
  assert.equal(firstS.awardedSRankBonus, true);
  assert.equal(firstS.state.pearls, 4);
  assert.equal(firstS.state.bestRankByChapter[2], 'S');

  // Re-earning S in the same chapter does not award bonus twice
  const secondS = completeChapterMastery(firstS.state);
  assert.equal(secondS.rank, 'S');
  assert.equal(secondS.awardedSRankBonus, false);
  assert.equal(secondS.state.pearls, 4);

  const hurt = recordPredatorSpot(recordChapterHit(secondS.state));
  const lowered = completeChapterMastery(hurt);
  assert.equal(lowered.rank, 'A');
  assert.equal(lowered.state.bestRankByChapter[2], 'S');
});

