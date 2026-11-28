import {
  CampaignState,
  ChapterId,
  ChapterRank,
  CHAPTERS,
  createCampaignState,
  GlowSkinId,
  QuestStatus,
} from './campaign';

export const SAVE_STORAGE_KEY = 'deep_fish_campaign_save_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveData {
  version: 1;
  highestChapter: ChapterId;
  currentChapter: ChapterId;
  pearls: number;
  collectedPearlIds: string[];
  collectedRelicIds: string[];
  bestRankByChapter: Partial<Record<ChapterId, ChapterRank>>;
  npcsMet: string[];
  activeSkin: GlowSkinId;
  unlockedSkins: GlowSkinId[];
  upgrades: string[];
  hasDashMutation: boolean;
  quests: QuestStatus;
  savedAtIso: string;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function clampChapter(ch: unknown): ChapterId {
  const num = Number(ch);
  if (Number.isInteger(num) && num >= 1 && num <= 10) {
    return num as ChapterId;
  }
  return 1;
}

function sanitizeBestRanks(
  raw: unknown,
): Partial<Record<ChapterId, ChapterRank>> {
  const result: Partial<Record<ChapterId, ChapterRank>> = {};
  if (!raw || typeof raw !== 'object') return result;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const ch = Number(k);
    if (
      Number.isInteger(ch) &&
      ch >= 1 &&
      ch <= 10 &&
      (v === 'S' || v === 'A' || v === 'B')
    ) {
      result[ch as ChapterId] = v;
    }
  }
  return result;
}

export function loadSaveData(
  storage: StorageLike | null = getDefaultStorage(),
): SaveData | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (!parsed || parsed.version !== 1) return null;

    return {
      version: 1,
      highestChapter: clampChapter(parsed.highestChapter),
      currentChapter: clampChapter(parsed.currentChapter),
      pearls: Math.max(0, Math.floor(Number(parsed.pearls) || 0)),
      collectedPearlIds: Array.isArray(parsed.collectedPearlIds)
        ? parsed.collectedPearlIds.filter((x): x is string => typeof x === 'string')
        : [],
      collectedRelicIds: Array.isArray(parsed.collectedRelicIds)
        ? parsed.collectedRelicIds.filter((x): x is string => typeof x === 'string')
        : [],
      bestRankByChapter: sanitizeBestRanks(parsed.bestRankByChapter),
      npcsMet: Array.isArray(parsed.npcsMet)
        ? parsed.npcsMet.filter((x): x is string => typeof x === 'string')
        : [],
      activeSkin:
        parsed.activeSkin === 'pearl' || parsed.activeSkin === 'charcoal'
          ? parsed.activeSkin
          : 'turquoise',
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? parsed.unlockedSkins.filter(
            (x): x is GlowSkinId =>
              x === 'turquoise' || x === 'pearl' || x === 'charcoal',
          )
        : ['turquoise'],
      upgrades: Array.isArray(parsed.upgrades)
        ? parsed.upgrades.filter((x): x is string => typeof x === 'string')
        : [],
      hasDashMutation: Boolean(parsed.hasDashMutation),
      quests: {
        borisMug: Boolean(parsed.quests?.borisMug),
        crabDebris: Boolean(parsed.quests?.crabDebris),
        whaleContainer: Boolean(parsed.quests?.whaleContainer),
        queenEscort: Boolean(parsed.quests?.queenEscort),
        eggReclaimed: Boolean(parsed.quests?.eggReclaimed),
        whaleRescued: Boolean(parsed.quests?.whaleRescued),
        borisShortcut: Boolean(parsed.quests?.borisShortcut),
        keshaAlert: Boolean(parsed.quests?.keshaAlert),
        hatchlingBorn: Boolean(parsed.quests?.hatchlingBorn),
      },
      savedAtIso:
        typeof parsed.savedAtIso === 'string'
          ? parsed.savedAtIso
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCampaignProgress(
  state: CampaignState,
  highestChapterReached: ChapterId,
  storage: StorageLike | null = getDefaultStorage(),
): SaveData {
  const existing = loadSaveData(storage);
  const highestChapter = Math.max(
    highestChapterReached,
    existing?.highestChapter ?? 1,
    state.chapter,
  ) as ChapterId;

  const mergedNpcsMet = Array.from(
    new Set([...(existing?.npcsMet ?? []), ...state.npcsMet]),
  );
  const mergedRelics = Array.from(
    new Set([...(existing?.collectedRelicIds ?? []), ...state.collectedRelicIds]),
  );

  const rankOrder: Record<ChapterRank, number> = { B: 1, A: 2, S: 3 };
  const mergedRanks: Partial<Record<ChapterId, ChapterRank>> = {
    ...(existing?.bestRankByChapter ?? {}),
  };
  for (const [k, v] of Object.entries(state.bestRankByChapter)) {
    const ch = Number(k) as ChapterId;
    const rank = v as ChapterRank;
    const prev = mergedRanks[ch];
    if (!prev || rankOrder[rank] > rankOrder[prev]) {
      mergedRanks[ch] = rank;
    }
  }

  const payload: SaveData = {
    version: 1,
    highestChapter,
    currentChapter: state.chapter,
    pearls: state.pearls,
    collectedPearlIds: [...state.collectedPearlIds],
    collectedRelicIds: mergedRelics,
    bestRankByChapter: mergedRanks,
    npcsMet: mergedNpcsMet,
    activeSkin: state.activeSkin,
    unlockedSkins: state.unlockedSkins.includes('turquoise')
      ? [...state.unlockedSkins]
      : ['turquoise', ...state.unlockedSkins],
    upgrades: [...state.upgrades],
    hasDashMutation: state.hasDashMutation,
    quests: { ...state.quests },
    savedAtIso: new Date().toISOString(),
  };

  if (storage) {
    try {
      storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/private mode errors
    }
  }
  return payload;
}

export function clearSaveData(
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function createCampaignFromSave(
  save: SaveData,
  targetChapter?: ChapterId,
): CampaignState {
  const ch = targetChapter ?? save.highestChapter;
  const playableChapter: ChapterId = CHAPTERS[ch]?.implemented ? ch : 1;
  const base = createCampaignState(playableChapter);
  return {
    ...base,
    pearls: save.pearls,
    collectedPearlIds: [...save.collectedPearlIds],
    collectedRelicIds: [...save.collectedRelicIds],
    bestRankByChapter: { ...save.bestRankByChapter },
    npcsMet: [...save.npcsMet],
    activeSkin: save.activeSkin,
    unlockedSkins: [...save.unlockedSkins],
    upgrades: [...save.upgrades],
    hasDashMutation: save.hasDashMutation,
    quests: { ...save.quests },
  };
}
