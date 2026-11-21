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

test('chapter 1 transition trigger detects arrival at the abyssal crevice zone', () => {
  const trigger = CHAPTER_TRANSITIONS[1]!;
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: -1, z: -60 }, trigger),
    false,
  );
  assert.equal(
    isInsideTransitionTrigger({ x: 0, y: -1.5, z: -85 }, trigger),
    true,
  );
});
