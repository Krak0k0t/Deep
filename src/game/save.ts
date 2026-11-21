import {
  CampaignState,
  ChapterId,
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

  const payload: SaveData = {
    version: 1,
    highestChapter,
    currentChapter: state.chapter,
    pearls: state.pearls,
    collectedPearlIds: [...state.collectedPearlIds],
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
    activeSkin: save.activeSkin,
    unlockedSkins: [...save.unlockedSkins],
    upgrades: [...save.upgrades],
    hasDashMutation: save.hasDashMutation,
    quests: { ...save.quests },
  };
}
