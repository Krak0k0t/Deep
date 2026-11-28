import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_LORE_RELICS,
  CODEX_ENTRIES,
  getCodexEntryText,
  getLoreRelicText,
  isCodexEntryUnlocked,
  LORE_RELIC_LIST,
} from './lore';
import {
  createCampaignFromSave,
  loadSaveData,
  saveCampaignProgress,
  StorageLike,
} from './save';
import { collectLoreRelic, completeChapterMastery, createCampaignState } from './campaign';

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

test('lore defines 10 unique chapter relics and 10 codex entries with localized text', () => {
  assert.equal(LORE_RELIC_LIST.length, 10);
  const seenIds = new Set<string>();
  for (let ch = 1; ch <= 10; ch++) {
    const relic = CHAPTER_LORE_RELICS[ch as 1];
    assert.ok(relic, `Missing relic for chapter ${ch}`);
    assert.equal(seenIds.has(relic.id), false);
    seenIds.add(relic.id);
    const ru = getLoreRelicText(relic, 'ru');
    const en = getLoreRelicText(relic, 'en');
    assert.ok(ru.title.length > 0 && ru.body.length > 0);
    assert.ok(en.title.length > 0 && en.body.length > 0);
  }

  assert.equal(CODEX_ENTRIES.length, 10);
  const queenEntry = CODEX_ENTRIES.find((e) => e.id === 'codex_queen')!;
  assert.equal(isCodexEntryUnlocked(queenEntry, 1, []), false);
  assert.equal(isCodexEntryUnlocked(queenEntry, 1, ['queen_angler']), true);
  assert.equal(isCodexEntryUnlocked(queenEntry, 5, []), true);
  assert.ok(getCodexEntryText(queenEntry, 'ru').title.includes('Королева'));
  assert.ok(getCodexEntryText(queenEntry, 'en').title.includes('Queen'));
});

test('save persistence preserves collected relics, best chapter ranks, and met NPCs across loads', () => {
  const storage = createMemoryStorage();
  let state = createCampaignState(3);
  const relicRes = collectLoreRelic(state, CHAPTER_LORE_RELICS[3].id);
  assert.equal(relicRes.isNew, true);
  state = { ...relicRes.state, npcsMet: ['mildred', 'boris'] };
  const mastery = completeChapterMastery(state);
  assert.equal(mastery.rank, 'S');
  assert.equal(mastery.awardedSRankBonus, true);

  saveCampaignProgress(mastery.state, 4, storage);

  // Saving an A rank later must NOT downgrade existing S rank
  let lowerRank = createCampaignState(3);
  lowerRank = { ...lowerRank, chapterHitsTaken: 1 };
  const lowerMastery = completeChapterMastery(lowerRank);
  assert.equal(lowerMastery.rank, 'A');
  saveCampaignProgress(lowerMastery.state, 4, storage);

  const loaded = loadSaveData(storage);
  assert.ok(loaded);
  assert.deepEqual(loaded.collectedRelicIds, ['relic_ch3_amber']);
  assert.equal(loaded.bestRankByChapter[3], 'S');
  assert.ok(loaded.npcsMet.includes('mildred'));
  assert.ok(loaded.npcsMet.includes('boris'));

  const restored = createCampaignFromSave(loaded, 3);
  assert.deepEqual(restored.collectedRelicIds, ['relic_ch3_amber']);
  assert.equal(restored.bestRankByChapter[3], 'S');
});
