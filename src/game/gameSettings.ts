export type DifficultyId = 'calm' | 'standard' | 'abyssal';
export type GraphicsQualityId = 'very_low' | 'low' | 'medium' | 'high' | 'ultra';
export type TouchControlsMode = 'auto' | 'on' | 'off';

export interface DifficultyConfig {
  id: DifficultyId;
  predatorSpeedMult: number;
  predatorDetectMult: number;
  damagePerHit: number;
  callCooldownMult: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyId, DifficultyConfig> = {
  calm: {
    id: 'calm',
    predatorSpeedMult: 0.78,
    predatorDetectMult: 0.8,
    damagePerHit: 25,
    callCooldownMult: 0.8,
  },
  standard: {
    id: 'standard',
    predatorSpeedMult: 1.0,
    predatorDetectMult: 1.0,
    damagePerHit: 34,
    callCooldownMult: 1.0,
  },
  abyssal: {
    id: 'abyssal',
    predatorSpeedMult: 1.24,
    predatorDetectMult: 1.22,
    damagePerHit: 50,
    callCooldownMult: 1.15,
  },
};

export interface GraphicsQualityConfig {
  id: GraphicsQualityId;
  pixelRatioCap: number;
  shadows: boolean;
  shadowMapSize: 1024 | 2048;
  postProcessing: boolean;
  foliageDensity: number;
  planktonCount: number;
  ambientActorFraction: number;
  causticsEnabled: boolean;
  envMapIntensity: number;
  extraPointLights: boolean;
  seabedSegments: [number, number];
  cameraFar: number;
  animThrottleStride: number;
}

export const GRAPHICS_PRESETS: Record<GraphicsQualityId, GraphicsQualityConfig> = {
  very_low: {
    id: 'very_low',
    pixelRatioCap: 0.6,
    shadows: false,
    shadowMapSize: 1024,
    postProcessing: false,
    foliageDensity: 0.14,
    planktonCount: 32,
    ambientActorFraction: 0.0,
    causticsEnabled: false,
    envMapIntensity: 0.0,
    extraPointLights: false,
    seabedSegments: [20, 32],
    cameraFar: 70,
    animThrottleStride: 2,
  },
  low: {
    id: 'low',
    pixelRatioCap: 0.8,
    shadows: false,
    shadowMapSize: 1024,
    postProcessing: false,
    foliageDensity: 0.28,
    planktonCount: 70,
    ambientActorFraction: 0.25,
    causticsEnabled: false,
    envMapIntensity: 0.0,
    extraPointLights: false,
    seabedSegments: [26, 40],
    cameraFar: 82,
    animThrottleStride: 2,
  },
  medium: {
    id: 'medium',
    pixelRatioCap: 1.15,
    shadows: true,
    shadowMapSize: 1024,
    postProcessing: false,
    foliageDensity: 0.7,
    planktonCount: 260,
    ambientActorFraction: 0.75,
    causticsEnabled: true,
    envMapIntensity: 0.28,
    extraPointLights: true,
    seabedSegments: [44, 64],
    cameraFar: 120,
    animThrottleStride: 1,
  },
  high: {
    id: 'high',
    pixelRatioCap: 1.6,
    shadows: true,
    shadowMapSize: 1024,
    postProcessing: true,
    foliageDensity: 1.0,
    planktonCount: 440,
    ambientActorFraction: 1.0,
    causticsEnabled: true,
    envMapIntensity: 0.42,
    extraPointLights: true,
    seabedSegments: [52, 76],
    cameraFar: 140,
    animThrottleStride: 1,
  },
  ultra: {
    id: 'ultra',
    pixelRatioCap: 2.0,
    shadows: true,
    shadowMapSize: 2048,
    postProcessing: true,
    foliageDensity: 1.35,
    planktonCount: 680,
    ambientActorFraction: 1.0,
    causticsEnabled: true,
    envMapIntensity: 0.5,
    extraPointLights: true,
    seabedSegments: [56, 84],
    cameraFar: 145,
    animThrottleStride: 1,
  },
};

export interface GameSettings {
  language: string;
  difficulty: DifficultyId;
  graphicsQuality: GraphicsQualityId;
  touchControls: TouchControlsMode;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  uiScale: number; // 0.85..1.2
  reducedEffects: boolean;
  highContrastSymbols: boolean;
}

export const GAME_SETTINGS_STORAGE_KEY = 'deep_fish_game_settings_v1';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  language: 'en',
  difficulty: 'standard',
  graphicsQuality: 'high',
  touchControls: 'auto',
  musicVolume: 0.75,
  sfxVolume: 0.85,
  uiScale: 1,
  reducedEffects: false,
  highContrastSymbols: false,
};

function clampUnit(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, Math.round(value * 100) / 100));
}

function clampUiScale(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1.2, Math.max(0.85, Math.round(value * 100) / 100));
}

export function sanitizeGameSettings(
  raw: Partial<GameSettings> | null | undefined,
  supportedLanguages?: ReadonlyArray<string>,
): GameSettings {
  const src = raw ?? {};
  const diff: DifficultyId =
    src.difficulty === 'calm' ||
    src.difficulty === 'standard' ||
    src.difficulty === 'abyssal'
      ? src.difficulty
      : DEFAULT_GAME_SETTINGS.difficulty;

  const quality: GraphicsQualityId =
    src.graphicsQuality === 'very_low' ||
    src.graphicsQuality === 'low' ||
    src.graphicsQuality === 'medium' ||
    src.graphicsQuality === 'high' ||
    src.graphicsQuality === 'ultra'
      ? src.graphicsQuality
      : DEFAULT_GAME_SETTINGS.graphicsQuality;

  const touch: TouchControlsMode =
    src.touchControls === 'auto' ||
    src.touchControls === 'on' ||
    src.touchControls === 'off'
      ? src.touchControls
      : DEFAULT_GAME_SETTINGS.touchControls;

  let language = DEFAULT_GAME_SETTINGS.language;
  if (typeof src.language === 'string' && src.language.trim().length > 0) {
    const candidate = src.language.trim();
    if (!supportedLanguages || supportedLanguages.includes(candidate)) {
      language = candidate;
    }
  }

  return {
    language,
    difficulty: diff,
    graphicsQuality: quality,
    touchControls: touch,
    musicVolume: clampUnit(src.musicVolume, DEFAULT_GAME_SETTINGS.musicVolume),
    sfxVolume: clampUnit(src.sfxVolume, DEFAULT_GAME_SETTINGS.sfxVolume),
    uiScale: clampUiScale(src.uiScale, DEFAULT_GAME_SETTINGS.uiScale),
    reducedEffects:
      typeof src.reducedEffects === 'boolean'
        ? src.reducedEffects
        : DEFAULT_GAME_SETTINGS.reducedEffects,
    highContrastSymbols:
      typeof src.highContrastSymbols === 'boolean'
        ? src.highContrastSymbols
        : DEFAULT_GAME_SETTINGS.highContrastSymbols,
  };
}

export function loadGameSettings(
  storage?: Storage,
  supportedLanguages?: ReadonlyArray<string>,
): GameSettings {
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) return { ...DEFAULT_GAME_SETTINGS };
    const raw = store.getItem(GAME_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GAME_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return sanitizeGameSettings(parsed, supportedLanguages);
  } catch {
    return { ...DEFAULT_GAME_SETTINGS };
  }
}

export function saveGameSettings(
  settings: Partial<GameSettings>,
  storage?: Storage,
  supportedLanguages?: ReadonlyArray<string>,
): GameSettings {
  const clean = sanitizeGameSettings(settings, supportedLanguages);
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    store?.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // ignore private browsing quota errors
  }
  return clean;
}

export function shouldShowTouchControls(
  mode: TouchControlsMode,
  isTouchDevice: boolean,
): boolean {
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  return isTouchDevice;
}

/**
 * Computes relative screen-top compass bearing (in degrees: 0 = straight ahead,
 * +90 = right, -90 = left) and rounded distance in meters toward an objective.
 */
export function computeCompassBearing(
  playerPos: { x: number; y?: number; z: number },
  camYawRad: number,
  targetPos: { x: number; y?: number; z: number },
): { bearingDeg: number; distMeters: number } {
  const dx = targetPos.x - playerPos.x;
  const dz = targetPos.z - playerPos.z;
  const dy = (targetPos.y ?? 0) - (playerPos.y ?? 0);
  const distMeters = Math.max(0, Math.round(Math.hypot(dx, dy, dz)));
  if (dx * dx + dz * dz < 0.04) {
    return { bearingDeg: 0, distMeters };
  }
  const worldAngle = Math.atan2(dx, dz);
  let relRad = worldAngle - camYawRad;
  while (relRad > Math.PI) relRad -= Math.PI * 2;
  while (relRad < -Math.PI) relRad += Math.PI * 2;
  // Positive relative yaw in Three.js rotates counter-clockwise (left of forward), so invert for clock bearing
  const bearingDeg = Math.round((-relRad * 180) / Math.PI) || 0;
  return { bearingDeg, distMeters };
}

