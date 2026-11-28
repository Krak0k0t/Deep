import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignState, collectPearl } from './campaign';
import {
  clearSaveData,
  createCampaignFromSave,
  loadSaveData,
  saveCampaignProgress,
  StorageLike,
} from './save';
import { CHAPTER_TRANSITIONS, isInsideTransitionTrigger } from './transition';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('save system persists highest chapter reached, pearls, and quests across sessions', () => {
  const storage = createMemoryStorage();
  assert.equal(loadSaveData(storage), null);

  let state = createCampaignState(1);
  state = collectPearl(state, 'ch1_pearl_1');
  state = collectPearl(state, 'ch1_pearl_2');
  state.quests.borisMug = true;
  state.hasDashMutation = true;

  saveCampaignProgress(state, 2, storage);
  const loaded = loadSaveData(storage);
  assert.ok(loaded);
  assert.equal(loaded.highestChapter, 2);
  assert.equal(loaded.pearls, 2);
  assert.equal(loaded.quests.borisMug, true);
  assert.equal(loaded.hasDashMutation, true);

  // Even if saving later from chapter 1, highestChapter never regresses
  saveCampaignProgress(createCampaignState(1), 1, storage);
  const loadedAfter = loadSaveData(storage);
  assert.equal(loadedAfter?.highestChapter, 2);

  const restored = createCampaignFromSave(loaded!);
  assert.equal(restored.pearls, 2);
  assert.equal(restored.hasDashMutation, true);

  clearSaveData(storage);
  assert.equal(loadSaveData(storage), null);
});

test('chapter transitions and save persistence cover full 10-chapter Descent & Ascent arc', () => {
  const trigger1 = CHAPTER_TRANSITIONS[1]!;
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: -1, z: -60 }, trigger1),
    false,
  );
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: -1.5, z: -85 }, trigger1),
    true,
  );

  const trigger4 = CHAPTER_TRANSITIONS[4]!;
  assert.equal(trigger4.nextChapter, 5);
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: -4, z: -85 }, trigger4),
    true,
  );

  const trigger6 = CHAPTER_TRANSITIONS[6]!;
  assert.equal(trigger6.nextChapter, 7);

  const trigger10 = CHAPTER_TRANSITIONS[10]!;
  assert.equal(trigger10.nextChapter, null);
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: 1.5, z: -85 }, trigger10),
    true,
  );

  const storage = createMemoryStorage();
  const state10 = createCampaignState(10);
  state10.quests.whaleContainer = true;
  state10.quests.queenEscort = true;
  state10.quests.eggReclaimed = true;
  state10.quests.hatchlingBorn = true;
  saveCampaignProgress(state10, 10, storage);
  const loaded = loadSaveData(storage);
  assert.equal(loaded?.highestChapter, 10);
  assert.equal(loaded?.quests.whaleContainer, true);
  assert.equal(loaded?.quests.eggReclaimed, true);
  assert.equal(loaded?.quests.hatchlingBorn, true);
  const restored10 = createCampaignFromSave(loaded!, 10);
  assert.equal(restored10.chapter, 10);
  assert.equal(restored10.phase, 'ASCENT');
});
