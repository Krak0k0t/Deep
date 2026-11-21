export type GamePhase = 'DESCENT' | 'ASCENT';

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type GlowSkinId = 'turquoise' | 'pearl' | 'charcoal';

export interface GlowSkinConfig {
  id: GlowSkinId;
  name: string;
  color: string;
  cost: number;
  anglerLureMultiplier: number;
  chauliodusVisibilityMultiplier: number;
  description: string;
}

export interface ChapterConfig {
  id: ChapterId;
  title: string;
  subtitle: string;
  phase: GamePhase;
  depthRangeMeters: [number, number];
  fogColor: string;
  fogDensity: number;
  ambientColor: string;
  spotColor: string;
  rooms: string[];
  implemented: boolean;
}

export const GLOW_SKINS: Record<GlowSkinId, GlowSkinConfig> = {
  turquoise: {
    id: 'turquoise',
    name: 'Бирюзовый Зов',
    color: '#26e8d4',
    cost: 0,
    anglerLureMultiplier: 1.0,
    chauliodusVisibilityMultiplier: 1.0,
    description: 'Родное свечение мамы-рыбки.',
  },
  pearl: {
    id: 'pearl',
    name: 'Жемчужный блик',
    color: '#f5e7c4',
    cost: 5,
    anglerLureMultiplier: 1.35,
    chauliodusVisibilityMultiplier: 1.1,
    description: 'Яркий свет: удильщики охотнее ведутся на приманку.',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Угольная тень',
    color: '#3f7c85',
    cost: 8,
    anglerLureMultiplier: 0.85,
    chauliodusVisibilityMultiplier: 0.65,
    description: 'Приглушённое свечение: хаулиоды хуже замечают вас в темноте.',
  },
};

export interface HideoutUpgrade {
  id: 'coral_veil' | 'silent_fins';
  name: string;
  cost: number;
  description: string;
}

export const HIDEOUT_UPGRADES: HideoutUpgrade[] = [
  {
    id: 'coral_veil',
    name: 'Коралловая вуаль',
    cost: 4,
    description: 'Укрытия быстрее гасят свечение мамы и икринки.',
  },
  {
    id: 'silent_fins',
    name: 'Бесшумные плавники',
    cost: 6,
    description: 'Снижает шум плавания рядом со спящими хищниками.',
  },
];

export const CHAPTERS: Record<ChapterId, ChapterConfig> = {
  1: {
    id: 1,
    title: 'Тихий риф',
    subtitle: 'Мелководье · Обучение',
    phase: 'DESCENT',
    depthRangeMeters: [12, 48],
    fogColor: '#052236',
    fogDensity: 0.015,
    ambientColor: '#164e6b',
    spotColor: '#5ec9f0',
    rooms: ['ch1_reef_entry', 'ch1_squid_patrol', 'ch1_trawler_net'],
    implemented: true,
  },
  2: {
    id: 2,
    title: 'Поющий кит',
    subtitle: 'Сумеречный риф и затонувший лайнер',
    phase: 'DESCENT',
    depthRangeMeters: [50, 140],
    fogColor: '#041b2c',
    fogDensity: 0.018,
    ambientColor: '#113c54',
    spotColor: '#3f96b8',
    rooms: ['ch2_liner_hull', 'ch2_galley', 'ch2_pelican_gate'],
    implemented: false,
  },
  3: {
    id: 3,
    title: 'Мёртвый шёпот',
    subtitle: 'Ламинариевый лес',
    phase: 'DESCENT',
    depthRangeMeters: [140, 280],
    fogColor: '#041f1c',
    fogDensity: 0.02,
    ambientColor: '#0f3d36',
    spotColor: '#2c8276',
    rooms: ['ch3_kelp_edge', 'ch3_whisper_corridor', 'ch3_crab_outpost'],
    implemented: false,
  },
  4: {
    id: 4,
    title: 'Кладбище левиафанов',
    subtitle: 'Скелеты китов и крабовий кранчик',
    phase: 'DESCENT',
    depthRangeMeters: [280, 480],
    fogColor: '#071624',
    fogDensity: 0.022,
    ambientColor: '#15293d',
    spotColor: '#3b5878',
    rooms: ['ch4_ribcage_hall', 'ch4_sperm_whale', 'ch4_charybdis_gate'],
    implemented: false,
  },
  5: {
    id: 5,
    title: 'Чёрные курильщики',
    subtitle: 'Хадальная зона и Королева-удильщица',
    phase: 'DESCENT',
    depthRangeMeters: [480, 720],
    fogColor: '#0a1019',
    fogDensity: 0.025,
    ambientColor: '#26171a',
    spotColor: '#4e2f37',
    rooms: ['ch5_thermal_vents', 'ch5_queen_nest'],
    implemented: false,
  },
  6: {
    id: 6,
    title: 'Бирюзовое сердце',
    subtitle: 'Дно бездны · Перелом',
    phase: 'DESCENT',
    depthRangeMeters: [720, 820],
    fogColor: '#030812',
    fogDensity: 0.028,
    ambientColor: '#0a2433',
    spotColor: '#26e8d4',
    rooms: ['ch6_abyss_heart'],
    implemented: false,
  },
  7: {
    id: 7,
    title: 'Прорыв из бездны',
    subtitle: 'Дорога наверх · Волны кальмаров',
    phase: 'ASCENT',
    depthRangeMeters: [820, 480],
    fogColor: '#08121f',
    fogDensity: 0.024,
    ambientColor: '#1a2d42',
    spotColor: '#3b6285',
    rooms: ['ch7_thermal_updraft', 'ch7_whale_rescue'],
    implemented: false,
  },
  8: {
    id: 8,
    title: 'Ламинариевый мятеж',
    subtitle: 'Свет икринки сквозь водоросли',
    phase: 'ASCENT',
    depthRangeMeters: [480, 200],
    fogColor: '#041f1c',
    fogDensity: 0.02,
    ambientColor: '#12423a',
    spotColor: '#369487',
    rooms: ['ch8_dark_clearings', 'ch8_boris_shortcut'],
    implemented: false,
  },
  9: {
    id: 9,
    title: '«Поющий кит». Тревога',
    subtitle: 'Ящики-укрытия и попугай Кеша',
    phase: 'ASCENT',
    depthRangeMeters: [200, 60],
    fogColor: '#051f33',
    fogDensity: 0.017,
    ambientColor: '#184461',
    spotColor: '#48a4cc',
    rooms: ['ch9_cabins', 'ch9_kesha_atrium'],
    implemented: false,
  },
  10: {
    id: 10,
    title: 'Наверх. Тихий риф',
    subtitle: 'Вылупление малька и свет поверхности',
    phase: 'ASCENT',
    depthRangeMeters: [60, 4],
    fogColor: '#08334d',
    fogDensity: 0.012,
    ambientColor: '#246d91',
    spotColor: '#7be0ff',
    rooms: ['ch10_surface_sprint', 'ch10_hatchling_coral'],
    implemented: false,
  },
};

export interface QuestStatus {
  borisMug: boolean;
  crabDebris: boolean;
  whaleContainer: boolean;
}

export interface CampaignState {
  chapter: ChapterId;
  phase: GamePhase;
  currentRoomId: string;
  checkpointRoomId: string;
  pearls: number;
  collectedPearlIds: string[];
  activeSkin: GlowSkinId;
  unlockedSkins: GlowSkinId[];
  upgrades: string[];
  hasDashMutation: boolean;
  quests: QuestStatus;
  deathsByRoom: Record<string, number>;
  consecutiveDeathsInRoom: Record<string, number>;
  lastCallTimeSec: number;
  styleDodgeCombo: number;
  totalStyleDodges: number;
  npcsMet: string[];
  startedAtMs: number;
}

export function createCampaignState(chapter: ChapterId = 1): CampaignState {
  const cfg = CHAPTERS[chapter];
  const initialRoom = cfg.rooms[0];
  return {
    chapter,
    phase: cfg.phase,
    currentRoomId: initialRoom,
    checkpointRoomId: initialRoom,
    pearls: 0,
    collectedPearlIds: [],
    activeSkin: 'turquoise',
    unlockedSkins: ['turquoise'],
    upgrades: [],
    hasDashMutation: false,
    quests: {
      borisMug: false,
      crabDebris: false,
      whaleContainer: false,
    },
    deathsByRoom: {},
    consecutiveDeathsInRoom: {},
    lastCallTimeSec: -999,
    styleDodgeCombo: 0,
    totalStyleDodges: 0,
    npcsMet: [],
    startedAtMs: Date.now(),
  };
}

export function getPredatorSpeedMultiplier(
  state: CampaignState,
  roomId: string = state.currentRoomId,
): number {
  const consecutive = state.consecutiveDeathsInRoom[roomId] ?? 0;
  return consecutive >= 2 ? 0.8 : 1.0;
}

export function getPlayerSpeedMultiplier(state: CampaignState): number {
  return state.phase === 'ASCENT' ? 0.85 : 1.0;
}

export function getCallCooldownSec(phase: GamePhase): number {
  return phase === 'ASCENT' ? 15 : 2.5;
}

export function canEmitCall(state: CampaignState, nowSec: number): boolean {
  return nowSec - state.lastCallTimeSec >= getCallCooldownSec(state.phase);
}

export function emitCall(
  state: CampaignState,
  nowSec: number,
): { state: CampaignState; fired: boolean; stunDurationSec: number } {
  if (!canEmitCall(state, nowSec)) {
    return { state, fired: false, stunDurationSec: 0 };
  }
  return {
    state: { ...state, lastCallTimeSec: nowSec },
    fired: true,
    stunDurationSec: state.phase === 'ASCENT' ? 2.0 : 0,
  };
}

export function recordRoomDeath(
  state: CampaignState,
  roomId: string = state.currentRoomId,
): CampaignState {
  return {
    ...state,
    styleDodgeCombo: 0,
    deathsByRoom: {
      ...state.deathsByRoom,
      [roomId]: (state.deathsByRoom[roomId] ?? 0) + 1,
    },
    consecutiveDeathsInRoom: {
      ...state.consecutiveDeathsInRoom,
      [roomId]: (state.consecutiveDeathsInRoom[roomId] ?? 0) + 1,
    },
  };
}

export function advanceToRoom(
  state: CampaignState,
  nextRoomId: string,
): CampaignState {
  if (state.currentRoomId === nextRoomId) return state;
  return {
    ...state,
    currentRoomId: nextRoomId,
    checkpointRoomId: nextRoomId,
    consecutiveDeathsInRoom: {
      ...state.consecutiveDeathsInRoom,
      [state.currentRoomId]: 0,
      [nextRoomId]: 0,
    },
  };
}

export function collectPearl(state: CampaignState, pearlId: string): CampaignState {
  if (state.collectedPearlIds.includes(pearlId)) return state;
  return {
    ...state,
    pearls: state.pearls + 1,
    collectedPearlIds: [...state.collectedPearlIds, pearlId],
  };
}

export function purchaseGlowSkin(
  state: CampaignState,
  skinId: GlowSkinId,
): { state: CampaignState; ok: boolean } {
  if (state.unlockedSkins.includes(skinId)) {
    return { state: { ...state, activeSkin: skinId }, ok: true };
  }
  const skin = GLOW_SKINS[skinId];
  if (state.pearls < skin.cost) {
    return { state, ok: false };
  }
  return {
    state: {
      ...state,
      pearls: state.pearls - skin.cost,
      unlockedSkins: [...state.unlockedSkins, skinId],
      activeSkin: skinId,
    },
    ok: true,
  };
}

export function registerStyleDodge(
  state: CampaignState,
): { state: CampaignState; awardedPearl: boolean } {
  const nextCombo = state.styleDodgeCombo + 1;
  const awardedPearl = nextCombo >= 3;
  return {
    state: {
      ...state,
      styleDodgeCombo: awardedPearl ? 0 : nextCombo,
      totalStyleDodges: state.totalStyleDodges + 1,
      pearls: awardedPearl ? state.pearls + 1 : state.pearls,
    },
    awardedPearl,
  };
}

export function triggerEggPickupAscent(state: CampaignState): CampaignState {
  return {
    ...state,
    chapter: 6,
    phase: 'ASCENT',
    lastCallTimeSec: -999,
  };
}

export interface BalanceTelemetry {
  chapter: ChapterId;
  phase: GamePhase;
  elapsedSec: number;
  pearlsCollected: number;
  deathsByRoom: Record<string, number>;
  totalDeaths: number;
  questsCompleted: string[];
  npcsMet: string[];
  totalStyleDodges: number;
}

export function buildBalanceTelemetry(
  state: CampaignState,
  elapsedSec: number,
): BalanceTelemetry {
  const questsCompleted: string[] = [];
  if (state.quests.borisMug) questsCompleted.push('borisMug');
  if (state.quests.crabDebris) questsCompleted.push('crabDebris');
  if (state.quests.whaleContainer) questsCompleted.push('whaleContainer');

  const totalDeaths = Object.values(state.deathsByRoom).reduce((a, b) => a + b, 0);

  return {
    chapter: state.chapter,
    phase: state.phase,
    elapsedSec: Math.round(elapsedSec * 10) / 10,
    pearlsCollected: state.pearls,
    deathsByRoom: { ...state.deathsByRoom },
    totalDeaths,
    questsCompleted,
    npcsMet: [...state.npcsMet],
    totalStyleDodges: state.totalStyleDodges,
  };
}
