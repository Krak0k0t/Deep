import { ChapterId } from './campaign';
import type { Vec3 } from './npc';

export interface TrawlerWindow {
  x: number;
  y: number;
  halfWidth: number;
  halfHeight: number;
}

export interface CoralShelter {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface PearlPickup {
  id: string;
  x: number;
  y: number;
  z: number;
}

export type SquidState = 'patrol' | 'telegraph' | 'dash' | 'recover' | 'stunned';

export interface SquidEntity {
  position: Vec3;
  velocity: Vec3;
  headingYaw: number;
  state: SquidState;
  stateTimer: number;
  patrolPhase: number;
  dashDir: Vec3;
  stunTimer: number;
  distractedUntil: number;
  distractTarget: Vec3 | null;
}

// Smooth deterministic 2D value-noise + FBM for sandy reef seabed
function hash2(ix: number, iz: number): number {
  const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise2(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);

  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function fbm2D(x: number, z: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    value += amp * (smoothNoise2(x * freq, z * freq) * 2 - 1);
    freq *= 2.04;
    amp *= 0.5;
  }
  return value;
}

/**
 * Computes seafloor height for Chapter 1 "Тихий риф".
 * Uses ultra-gentle low-frequency Perlin/FBM bathymetry (zero sinusoidal ridges)
 * so fine surface relief comes cleanly from the tiled sand Normal Map rather than jagged vertices.
 */
export function getReefFloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.026, z * 0.026) * 0.34;
  // Gentle descent slope toward negative Z
  const slope = Math.max(-9, Math.min(2, (z + 10) * 0.085));
  // Natural reef canyon shoulders along +/- X
  const absX = Math.abs(x);
  const canyonWall = absX > 15 ? Math.pow((absX - 15) * 0.36, 1.55) : 0;
  // Deepen the final abyssal crevice near z = -88
  const creviceDip = z < -76 ? -Math.min(5.5, (-76 - z) * 0.38) : 0;
  return -2.4 + broadPerlinSwell + slope + canyonWall + creviceDip;
}

export const CHAPTER_1_SHELTERS: CoralShelter[] = [
  { id: 'shelter_tutorial', x: 5.5, y: 1.5, z: -32, radius: 3.1 },
  { id: 'shelter_mid', x: -6.2, y: 0.4, z: -49, radius: 3.0 },
  { id: 'shelter_pre_net', x: 4.2, y: -0.3, z: -55, radius: 2.8 },
];

export const CHAPTER_1_PEARLS: PearlPickup[] = [
  { id: 'ch1_pearl_1', x: 7.4, y: 2.6, z: -14 },
  { id: 'ch1_pearl_2', x: -8.5, y: 1.8, z: -36 },
  { id: 'ch1_pearl_3', x: 8.2, y: 0.2, z: -52 },
  { id: 'ch1_pearl_4', x: 0.0, y: -1.8, z: -74 },
];

export const CHAPTER_1_NET_Z = -62;

export const CHAPTER_1_NET_WINDOWS: TrawlerWindow[] = [
  { x: -7.5, y: 1.4, halfWidth: 2.5, halfHeight: 2.2 },
  { x: 0.0, y: 3.1, halfWidth: 2.7, halfHeight: 2.2 },
  { x: 7.8, y: 0.9, halfWidth: 2.5, halfHeight: 2.2 },
];

// --- Chapter 2: «Поющий кит» (50–140 m · Sunken Liner & Twilight Reef) ---

export function getChapter2FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.024 + 4.3, z * 0.024 - 2.1) * 0.36;
  const slope = Math.max(-10.5, Math.min(1.5, (z + 8) * 0.095));
  const absX = Math.abs(x);
  const hullWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.38, 1.55) : 0;
  const kelpTrenchDip = z < -76 ? -Math.min(6.0, (-76 - z) * 0.4) : 0;
  return -2.7 + broadPerlinSwell + slope + hullWall + kelpTrenchDip;
}

// --- Chapter 3: «Мёртвый шёпот» (140–280 m · Kelp Forest & Hermit Crab Outpost) ---

export function getChapter3FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.022 - 3.1, z * 0.022 + 5.7) * 0.38;
  const slope = Math.max(-11.8, Math.min(1.2, (z + 8) * 0.105));
  const absX = Math.abs(x);
  const kelpRidgeWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.4, 1.55) : 0;
  const graveTrenchDip = z < -76 ? -Math.min(6.5, (-76 - z) * 0.42) : 0;
  return -3.0 + broadPerlinSwell + slope + kelpRidgeWall + graveTrenchDip;
}

// --- Chapter 4: «Кладбище левиафанов» (280–480 m · Whale Skeletons & Charybdis Crane) ---

export function getChapter4FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.02 + 7.4, z * 0.02 - 4.8) * 0.42;
  const slope = Math.max(-13.4, Math.min(1.0, (z + 8) * 0.115));
  const absX = Math.abs(x);
  const ribTrenchWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.42, 1.55) : 0;
  const abyssalVentDip = z < -76 ? -Math.min(7.0, (-76 - z) * 0.44) : 0;
  return -3.4 + broadPerlinSwell + slope + ribTrenchWall + abyssalVentDip;
}

// --- Chapter 5: «Чёрные курильщики» (480–720 m · Hadal Thermal Vents) ---

export function getChapter5FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.02 + 11.2, z * 0.02 + 3.4) * 0.44;
  const slope = Math.max(-14.2, Math.min(0.8, (z + 8) * 0.12));
  const absX = Math.abs(x);
  const basaltWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.44, 1.55) : 0;
  const heartDip = z < -76 ? -Math.min(7.4, (-76 - z) * 0.46) : 0;
  return -3.8 + broadPerlinSwell + slope + basaltWall + heartDip;
}

// --- Chapter 6: «Бирюзовое сердце» (720–820 m · Abyssal Floor Inflection) ---

export function getChapter6FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.019 - 6.1, z * 0.019 + 9.2) * 0.36;
  const bowlSlope = -Math.sin(THREE_CLAMP01((4 - z) / 90) * Math.PI) * 3.8;
  const absX = Math.abs(x);
  const chasmWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.44, 1.55) : 0;
  const altarPlateau =
    Math.hypot(x, z + 48) < 9 ? (1 - Math.hypot(x, z + 48) / 9) * 1.15 : 0;
  return -5.2 + broadPerlinSwell + bowlSlope + chasmWall + altarPlateau;
}

function THREE_CLAMP01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// --- Chapter 7: «Прорыв из бездны» (820–480 m · Ascent Updraft & Squid Waves) ---

export function getChapter7FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.022 + 2.7, z * 0.022 - 8.3) * 0.4;
  const ascentSlope = Math.min(2.0, Math.max(-9.0, (4 - z) * 0.065 - 7.5));
  const absX = Math.abs(x);
  const riftWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.42, 1.55) : 0;
  return -3.2 + broadPerlinSwell + ascentSlope + riftWall;
}

// --- Chapter 8: «Ламинариевый мятеж» (480–200 m · Ascent Glowing Kelp) ---

export function getChapter8FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.023 - 5.4, z * 0.023 + 1.9) * 0.38;
  const ascentSlope = Math.min(2.2, Math.max(-6.5, (4 - z) * 0.055 - 5.2));
  const absX = Math.abs(x);
  const kelpWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.4, 1.55) : 0;
  return -2.8 + broadPerlinSwell + ascentSlope + kelpWall;
}

// --- Chapter 9: «Поющий кит. Тревога» (200–60 m · Ascent Sunken Liner Alert) ---

export function getChapter9FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.024 + 8.1, z * 0.024 - 4.4) * 0.32;
  const ascentSlope = Math.min(2.4, Math.max(-5.2, (4 - z) * 0.048 - 4.0));
  const absX = Math.abs(x);
  const hullWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.38, 1.55) : 0;
  return -2.5 + broadPerlinSwell + ascentSlope + hullWall;
}

// --- Chapter 10: «Наверх. Тихий риф» (60–4 m · Surface Sprint & Hatchling Reef) ---

export function getChapter10FloorHeight(x: number, z: number): number {
  const broadPerlinSwell = fbm2D(x * 0.026 - 1.5, z * 0.026 + 4.2) * 0.3;
  const surfaceClimb = THREE_CLAMP01((4 - z) / 88) * 3.4 - 2.6;
  const absX = Math.abs(x);
  const reefWall = absX > 15.5 ? Math.pow((absX - 15.5) * 0.35, 1.55) : 0;
  return surfaceClimb + broadPerlinSwell + reefWall;
}

export function getChapterFloorHeight(
  chapter: ChapterId,
  x: number,
  z: number,
): number {
  switch (chapter) {
    case 10:
      return getChapter10FloorHeight(x, z);
    case 9:
      return getChapter9FloorHeight(x, z);
    case 8:
      return getChapter8FloorHeight(x, z);
    case 7:
      return getChapter7FloorHeight(x, z);
    case 6:
      return getChapter6FloorHeight(x, z);
    case 5:
      return getChapter5FloorHeight(x, z);
    case 4:
      return getChapter4FloorHeight(x, z);
    case 3:
      return getChapter3FloorHeight(x, z);
    case 2:
      return getChapter2FloorHeight(x, z);
    default:
      return getReefFloorHeight(x, z);
  }
}

export const CHAPTER_2_SHELTERS: CoralShelter[] = [
  { id: 'ch2_crate_1', x: 6.2, y: 0.5, z: -26, radius: 3.2 },
  { id: 'ch2_crate_2', x: -6.0, y: -0.7, z: -44, radius: 3.1 },
  { id: 'ch2_crate_3', x: 5.2, y: -2.0, z: -68, radius: 3.0 },
];

export const CHAPTER_2_PEARLS: PearlPickup[] = [
  { id: 'ch2_pearl_1', x: -8.5, y: 2.2, z: -12 },
  { id: 'ch2_pearl_2', x: 8.6, y: 1.0, z: -34 },
  { id: 'ch2_pearl_3', x: -7.8, y: -0.3, z: -55 },
  { id: 'ch2_pearl_4', x: 7.4, y: -2.2, z: -74 },
];

export const CHAPTER_2_BORIS_MUG_POS: Vec3 = { x: 7.2, y: 0.2, z: -42 };
export const CHAPTER_2_PELICAN_GATE_Z = -62;
export const CHAPTER_2_PELICAN_LEVER_POS: Vec3 = { x: -3.2, y: -1.4, z: -59.5 };
export const CHAPTER_2_PAFNUTIY_POS: Vec3 = { x: 0.4, y: -0.8, z: -48 };

export const CHAPTER_3_SHELTERS: CoralShelter[] = [
  { id: 'ch3_kelp_refuge_1', x: 5.8, y: getChapter3FloorHeight(5.8, -26) + 1.15, z: -26, radius: 3.3 },
  { id: 'ch3_kelp_refuge_2', x: -6.2, y: getChapter3FloorHeight(-6.2, -46) + 1.15, z: -46, radius: 3.3 },
  { id: 'ch3_kelp_refuge_3', x: 5.4, y: getChapter3FloorHeight(5.4, -68) + 1.15, z: -68, radius: 3.2 },
];

export const CHAPTER_3_PEARLS: PearlPickup[] = [
  { id: 'ch3_pearl_1', x: -8.2, y: getChapter3FloorHeight(-8.2, -13) + 0.42, z: -13 },
  { id: 'ch3_pearl_2', x: 8.4, y: getChapter3FloorHeight(8.4, -33) + 0.42, z: -33 },
  { id: 'ch3_pearl_3', x: -8.0, y: getChapter3FloorHeight(-8.0, -53) + 0.42, z: -53 },
  { id: 'ch3_pearl_4', x: 7.2, y: getChapter3FloorHeight(7.2, -74) + 0.42, z: -74 },
];

export const CHAPTER_3_SCRAPS: PearlPickup[] = [
  { id: 'ch3_scrap_1', x: -6.8, y: getChapter3FloorHeight(-6.8, -22) + 1.15, z: -22 },
  { id: 'ch3_scrap_2', x: 7.4, y: getChapter3FloorHeight(7.4, -38) + 1.15, z: -38 },
  { id: 'ch3_scrap_3', x: -5.4, y: getChapter3FloorHeight(-5.4, -53) + 1.15, z: -53 },
];

export const CHAPTER_3_DEBRIS_GATE_Z = -62;
export const CHAPTER_3_CRANE_LEVER_POS: Vec3 = {
  x: 3.6,
  y: getChapter3FloorHeight(3.6, -59.5) + 1.2,
  z: -59.5,
};

export const CHAPTER_4_SHELTERS: CoralShelter[] = [
  { id: 'ch4_vertebra_1', x: 5.6, y: getChapter4FloorHeight(5.6, -24) + 1.15, z: -24, radius: 3.4 },
  { id: 'ch4_vertebra_2', x: -5.8, y: getChapter4FloorHeight(-5.8, -45) + 1.15, z: -45, radius: 3.4 },
  { id: 'ch4_vertebra_3', x: 5.2, y: getChapter4FloorHeight(5.2, -68) + 1.15, z: -68, radius: 3.3 },
];

export const CHAPTER_4_PEARLS: PearlPickup[] = [
  { id: 'ch4_pearl_1', x: -8.0, y: getChapter4FloorHeight(-8.0, -14) + 0.45, z: -14 },
  { id: 'ch4_pearl_2', x: 8.4, y: getChapter4FloorHeight(8.4, -34) + 0.45, z: -34 },
  { id: 'ch4_pearl_3', x: -7.8, y: getChapter4FloorHeight(-7.8, -54) + 0.45, z: -54 },
  { id: 'ch4_pearl_4', x: 7.0, y: getChapter4FloorHeight(7.0, -75) + 0.45, z: -75 },
];

export const CHAPTER_4_WHALE_CONTAINER_POS: Vec3 = {
  x: -6.8,
  y: getChapter4FloorHeight(-6.8, -43) + 1.15,
  z: -43,
};

export const CHAPTER_4_CHARYBDIS_GATE_Z = -62;
export const CHAPTER_4_CHARYBDIS_LEVER_POS: Vec3 = {
  x: 4.2,
  y: getChapter4FloorHeight(4.2, -59.2) + 1.25,
  z: -59.2,
};

// --- Chapter 5: Black Smokers & Queen Anglerfish ---
export const CHAPTER_5_SHELTERS: CoralShelter[] = [
  { id: 'ch5_basalt_1', x: 5.8, y: getChapter5FloorHeight(5.8, -24) + 1.2, z: -24, radius: 3.4 },
  { id: 'ch5_basalt_2', x: -6.0, y: getChapter5FloorHeight(-6.0, -45) + 1.2, z: -45, radius: 3.4 },
  { id: 'ch5_basalt_3', x: 5.4, y: getChapter5FloorHeight(5.4, -68) + 1.2, z: -68, radius: 3.3 },
];

export const CHAPTER_5_PEARLS: PearlPickup[] = [
  { id: 'ch5_pearl_1', x: -8.2, y: getChapter5FloorHeight(-8.2, -14) + 0.5, z: -14 },
  { id: 'ch5_pearl_2', x: 8.6, y: getChapter5FloorHeight(8.6, -34) + 0.5, z: -34 },
  { id: 'ch5_pearl_3', x: -7.6, y: getChapter5FloorHeight(-7.6, -54) + 0.5, z: -54 },
  { id: 'ch5_pearl_4', x: 7.2, y: getChapter5FloorHeight(7.2, -75) + 0.5, z: -75 },
];

export const CHAPTER_5_LURE_POS: Vec3 = {
  x: -6.4,
  y: getChapter5FloorHeight(-6.4, -36) + 1.2,
  z: -36,
};

export const CHAPTER_5_GATE_Z = -62;
export const CHAPTER_5_GATE_LEVER_POS: Vec3 = {
  x: 3.8,
  y: getChapter5FloorHeight(3.8, -59.2) + 1.25,
  z: -59.2,
};

export interface ThermalVent {
  id: string;
  x: number;
  z: number;
  radius: number;
  phaseOffset: number;
}

export const CHAPTER_5_THERMAL_VENTS: ThermalVent[] = [
  { id: 'ch5_vent_1', x: -2.4, z: -22, radius: 2.3, phaseOffset: 0.0 },
  { id: 'ch5_vent_2', x: 3.2, z: -34, radius: 2.4, phaseOffset: 2.1 },
  { id: 'ch5_vent_3', x: -2.8, z: -47, radius: 2.4, phaseOffset: 4.2 },
  { id: 'ch5_vent_4', x: 2.2, z: -72, radius: 2.3, phaseOffset: 1.4 },
];

export function sampleThermalVentHazard(
  playerPos: Vec3,
  vents: ThermalVent[],
  simTimeSec: number,
  invulnTimer: number,
): {
  eruptingVentId: string | null;
  warningVentId: string | null;
  pushY: number;
  hitPlayer: boolean;
} {
  const cycleSec = 6.5;
  let eruptingVentId: string | null = null;
  let warningVentId: string | null = null;
  let pushY = 0;
  let hitPlayer = false;

  for (const v of vents) {
    const t = ((simTimeSec + v.phaseOffset) % cycleSec + cycleSec) % cycleSec;
    const isWarning = t >= 3.6 && t < 4.9;
    const isErupting = t >= 4.9;
    const horizDistSq = (playerPos.x - v.x) ** 2 + (playerPos.z - v.z) ** 2;
    if (horizDistSq <= v.radius * v.radius) {
      if (isErupting) {
        eruptingVentId = v.id;
        pushY = 7.5;
        if (invulnTimer <= 0) {
          hitPlayer = true;
        }
      } else if (isWarning) {
        warningVentId = v.id;
      }
    }
  }
  return { eruptingVentId, warningVentId, pushY, hitPlayer };
}

// --- Chapter 6: Turquoise Heart ---
export const CHAPTER_6_SHELTERS: CoralShelter[] = [
  { id: 'ch6_crystal_1', x: 5.6, y: getChapter6FloorHeight(5.6, -24) + 1.25, z: -24, radius: 3.4 },
  { id: 'ch6_crystal_2', x: -5.8, y: getChapter6FloorHeight(-5.8, -56) + 1.25, z: -56, radius: 3.4 },
];

export const CHAPTER_6_PEARLS: PearlPickup[] = [
  { id: 'ch6_pearl_1', x: -7.8, y: getChapter6FloorHeight(-7.8, -16) + 0.5, z: -16 },
  { id: 'ch6_pearl_2', x: 8.2, y: getChapter6FloorHeight(8.2, -38) + 0.5, z: -38 },
  { id: 'ch6_pearl_3', x: -8.0, y: getChapter6FloorHeight(-8.0, -68) + 0.5, z: -68 },
  { id: 'ch6_pearl_4', x: 6.8, y: getChapter6FloorHeight(6.8, -76) + 0.5, z: -76 },
];

export const CHAPTER_6_EGG_ALTAR_POS: Vec3 = {
  x: 0,
  y: getChapter6FloorHeight(0, -48) + 1.65,
  z: -48,
};

// --- Chapter 7: Breakout from the Abyss ---
export const CHAPTER_7_SHELTERS: CoralShelter[] = [
  { id: 'ch7_ridge_1', x: -5.6, y: getChapter7FloorHeight(-5.6, -24) + 1.2, z: -24, radius: 3.3 },
  { id: 'ch7_ridge_2', x: 5.8, y: getChapter7FloorHeight(5.8, -46) + 1.2, z: -46, radius: 3.3 },
  { id: 'ch7_ridge_3', x: -5.2, y: getChapter7FloorHeight(-5.2, -68) + 1.2, z: -68, radius: 3.2 },
];

export const CHAPTER_7_PEARLS: PearlPickup[] = [
  { id: 'ch7_pearl_1', x: 8.0, y: getChapter7FloorHeight(8.0, -14) + 0.5, z: -14 },
  { id: 'ch7_pearl_2', x: -8.4, y: getChapter7FloorHeight(-8.4, -35) + 0.5, z: -35 },
  { id: 'ch7_pearl_3', x: 7.8, y: getChapter7FloorHeight(7.8, -55) + 0.5, z: -55 },
  { id: 'ch7_pearl_4', x: -7.2, y: getChapter7FloorHeight(-7.2, -75) + 0.5, z: -75 },
];

export const CHAPTER_7_WHALE_GATE_Z = -62;
export const CHAPTER_7_WHALE_LEVER_POS: Vec3 = {
  x: -3.6,
  y: getChapter7FloorHeight(-3.6, -59.2) + 1.25,
  z: -59.2,
};

export interface UpdraftZone {
  id: string;
  x: number;
  z: number;
  radius: number;
  boostForward: number;
  boostY: number;
}

export const CHAPTER_7_UPDRAFT_ZONES: UpdraftZone[] = [
  { id: 'ch7_upd_1', x: 0.5, z: -20, radius: 4.0, boostForward: 5.2, boostY: 2.4 },
  { id: 'ch7_upd_2', x: -2.0, z: -42, radius: 4.2, boostForward: 5.8, boostY: 2.8 },
  { id: 'ch7_upd_3', x: 1.5, z: -74, radius: 4.2, boostForward: 6.2, boostY: 3.2 },
];

export function sampleUpdraftCurrent(
  pos: Vec3,
  zones: UpdraftZone[],
): { inUpdraft: boolean; boostForward: number; boostY: number } {
  for (const z of zones) {
    const distSq = (pos.x - z.x) ** 2 + (pos.z - z.z) ** 2;
    if (distSq <= z.radius * z.radius) {
      return { inUpdraft: true, boostForward: z.boostForward, boostY: z.boostY };
    }
  }
  return { inUpdraft: false, boostForward: 0, boostY: 0 };
}

// --- Chapter 8: Kelp Rebellion ---
export const CHAPTER_8_SHELTERS: CoralShelter[] = [
  { id: 'ch8_kelp_1', x: 5.8, y: getChapter8FloorHeight(5.8, -25) + 1.2, z: -25, radius: 3.3 },
  { id: 'ch8_kelp_2', x: -6.0, y: getChapter8FloorHeight(-6.0, -47) + 1.2, z: -47, radius: 3.3 },
  { id: 'ch8_kelp_3', x: 5.4, y: getChapter8FloorHeight(5.4, -68) + 1.2, z: -68, radius: 3.2 },
];

export const CHAPTER_8_PEARLS: PearlPickup[] = [
  { id: 'ch8_pearl_1', x: -8.2, y: getChapter8FloorHeight(-8.2, -13) + 0.5, z: -13 },
  { id: 'ch8_pearl_2', x: 8.4, y: getChapter8FloorHeight(8.4, -34) + 0.5, z: -34 },
  { id: 'ch8_pearl_3', x: -7.6, y: getChapter8FloorHeight(-7.6, -54) + 0.5, z: -54 },
  { id: 'ch8_pearl_4', x: 7.2, y: getChapter8FloorHeight(7.2, -74) + 0.5, z: -74 },
];

export const CHAPTER_8_SHORTCUT_GATE_Z = -62;
export const CHAPTER_8_BORIS_LEVER_POS: Vec3 = {
  x: 3.4,
  y: getChapter8FloorHeight(3.4, -59.2) + 1.25,
  z: -59.2,
};

// --- Chapter 9: Singing Whale Alert ---
export const CHAPTER_9_SHELTERS: CoralShelter[] = [
  { id: 'ch9_crate_1', x: 5.8, y: getChapter9FloorHeight(5.8, -25) + 1.15, z: -25, radius: 3.2 },
  { id: 'ch9_crate_2', x: -6.0, y: getChapter9FloorHeight(-6.0, -46) + 1.15, z: -46, radius: 3.2 },
  { id: 'ch9_crate_3', x: 5.2, y: getChapter9FloorHeight(5.2, -68) + 1.15, z: -68, radius: 3.1 },
];

export const CHAPTER_9_PEARLS: PearlPickup[] = [
  { id: 'ch9_pearl_1', x: -8.2, y: getChapter9FloorHeight(-8.2, -12) + 0.5, z: -12 },
  { id: 'ch9_pearl_2', x: 8.4, y: getChapter9FloorHeight(8.4, -34) + 0.5, z: -34 },
  { id: 'ch9_pearl_3', x: -7.8, y: getChapter9FloorHeight(-7.8, -55) + 0.5, z: -55 },
  { id: 'ch9_pearl_4', x: 7.4, y: getChapter9FloorHeight(7.4, -74) + 0.5, z: -74 },
];

export const CHAPTER_9_BULKHEAD_Z = -62;
export const CHAPTER_9_BULKHEAD_LEVER_POS: Vec3 = {
  x: -3.2,
  y: getChapter9FloorHeight(-3.2, -59.2) + 1.25,
  z: -59.2,
};

// --- Chapter 10: To the Surface. Quiet Reef ---
export const CHAPTER_10_SHELTERS: CoralShelter[] = [
  { id: 'ch10_coral_1', x: 5.5, y: getChapter10FloorHeight(5.5, -24) + 1.15, z: -24, radius: 3.2 },
  { id: 'ch10_coral_2', x: -5.8, y: getChapter10FloorHeight(-5.8, -46) + 1.15, z: -46, radius: 3.2 },
  { id: 'ch10_coral_3', x: 4.8, y: getChapter10FloorHeight(4.8, -68) + 1.15, z: -68, radius: 3.0 },
];

export const CHAPTER_10_PEARLS: PearlPickup[] = [
  { id: 'ch10_pearl_1', x: -8.0, y: getChapter10FloorHeight(-8.0, -14) + 0.6, z: -14 },
  { id: 'ch10_pearl_2', x: 8.2, y: getChapter10FloorHeight(8.2, -36) + 0.6, z: -36 },
  { id: 'ch10_pearl_3', x: -7.6, y: getChapter10FloorHeight(-7.6, -56) + 0.6, z: -56 },
  { id: 'ch10_pearl_4', x: 6.8, y: getChapter10FloorHeight(6.8, -75) + 0.6, z: -75 },
];

export const CHAPTER_10_UPDRAFT_ZONES: UpdraftZone[] = [
  { id: 'ch10_upd_1', x: 0.0, z: -18, radius: 4.2, boostForward: 5.6, boostY: 2.6 },
  { id: 'ch10_upd_2', x: 1.5, z: -48, radius: 4.4, boostForward: 6.4, boostY: 3.0 },
  { id: 'ch10_upd_3', x: -0.5, z: -72, radius: 4.5, boostForward: 7.0, boostY: 3.4 },
];

export function getSheltersForChapter(chapter: ChapterId): CoralShelter[] {
  switch (chapter) {
    case 10:
      return CHAPTER_10_SHELTERS;
    case 9:
      return CHAPTER_9_SHELTERS;
    case 8:
      return CHAPTER_8_SHELTERS;
    case 7:
      return CHAPTER_7_SHELTERS;
    case 6:
      return CHAPTER_6_SHELTERS;
    case 5:
      return CHAPTER_5_SHELTERS;
    case 4:
      return CHAPTER_4_SHELTERS;
    case 3:
      return CHAPTER_3_SHELTERS;
    case 2:
      return CHAPTER_2_SHELTERS;
    default:
      return CHAPTER_1_SHELTERS;
  }
}

export function getPearlsForChapter(chapter: ChapterId): PearlPickup[] {
  switch (chapter) {
    case 10:
      return CHAPTER_10_PEARLS;
    case 9:
      return CHAPTER_9_PEARLS;
    case 8:
      return CHAPTER_8_PEARLS;
    case 7:
      return CHAPTER_7_PEARLS;
    case 6:
      return CHAPTER_6_PEARLS;
    case 5:
      return CHAPTER_5_PEARLS;
    case 4:
      return CHAPTER_4_PEARLS;
    case 3:
      return CHAPTER_3_PEARLS;
    case 2:
      return CHAPTER_2_PEARLS;
    default:
      return CHAPTER_1_PEARLS;
  }
}

export interface SideCurrentZone {
  id: string;
  zMin: number;
  zMax: number;
  baseForceX: number;
  baseForceY: number;
  freq: number;
}

export const CHAPTER_SIDE_CURRENTS: Partial<Record<ChapterId, SideCurrentZone[]>> = {
  4: [
    { id: 'ch4_cur_1', zMin: -54, zMax: -26, baseForceX: 2.3, baseForceY: 0.15, freq: 0.65 },
  ],
  7: [
    { id: 'ch7_cur_1', zMin: -56, zMax: -16, baseForceX: -2.6, baseForceY: 0.55, freq: 0.85 },
  ],
  10: [
    { id: 'ch10_cur_1', zMin: -72, zMax: -22, baseForceX: 2.8, baseForceY: 0.7, freq: 0.95 },
  ],
};

export function sampleSideCurrent(
  pos: Vec3,
  zones: SideCurrentZone[] | undefined,
  simTimeSec: number,
): { forceX: number; forceY: number; active: boolean } {
  if (!zones || zones.length === 0) {
    return { forceX: 0, forceY: 0, active: false };
  }
  let forceX = 0;
  let forceY = 0;
  let active = false;
  for (const z of zones) {
    if (pos.z >= z.zMin && pos.z <= z.zMax) {
      const wave = 0.55 + 0.45 * Math.sin(simTimeSec * z.freq + pos.z * 0.12);
      forceX += z.baseForceX * wave;
      forceY += z.baseForceY * wave;
      active = true;
    }
  }
  return { forceX, forceY, active };
}

export function stepShelterOxygenRecovery(
  health: number,
  maxHealth: number,
  isHidden: boolean,
  dt: number,
  rateMultiplier = 1,
): number {
  if (!isHidden || health >= maxHealth) return health;
  return Math.min(maxHealth, health + dt * 6.5 * Math.max(0.2, rateMultiplier));
}

export function isInsideCoralShelter(
  pos: Vec3,
  shelters: CoralShelter[] = CHAPTER_1_SHELTERS,
): boolean {
  for (const s of shelters) {
    const dx = pos.x - s.x;
    const dy = pos.y - s.y;
    const dz = pos.z - s.z;
    if (dx * dx + dy * dy + dz * dz <= s.radius * s.radius) {
      return true;
    }
  }
  return false;
}

export function isPointInTrawlerWindows(
  x: number,
  y: number,
  windows: TrawlerWindow[] = CHAPTER_1_NET_WINDOWS,
  padding = 0.25,
): boolean {
  for (const w of windows) {
    if (
      Math.abs(x - w.x) <= w.halfWidth - padding &&
      Math.abs(y - w.y) <= w.halfHeight - padding
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Prevents player from clipping through the trawler net mesh unless flying through one of the 3 open windows.
 */
export function resolveTrawlerNetCollision(
  prevPos: Vec3,
  nextPos: Vec3,
  netZ: number = CHAPTER_1_NET_Z,
  windows: TrawlerWindow[] = CHAPTER_1_NET_WINDOWS,
): { position: Vec3; hitNet: boolean } {
  const halfThickness = 0.85;
  const crossesFront =
    prevPos.z >= netZ + halfThickness && nextPos.z < netZ + halfThickness;
  const crossesBack =
    prevPos.z <= netZ - halfThickness && nextPos.z > netZ - halfThickness;
  const insideBand = Math.abs(nextPos.z - netZ) < halfThickness;

  if (!crossesFront && !crossesBack && !insideBand) {
    return { position: nextPos, hitNet: false };
  }

  if (isPointInTrawlerWindows(nextPos.x, nextPos.y, windows, 0.15)) {
    return { position: nextPos, hitNet: false };
  }

  const clampedZ =
    prevPos.z >= netZ ? netZ + halfThickness : netZ - halfThickness;
  return {
    position: {
      x: nextPos.x,
      y: nextPos.y,
      z: clampedZ,
    },
    hitNet: true,
  };
}

export function clampPlayerPosition(pos: Vec3): Vec3 {
  return clampPlayerPositionForChapter(1, pos);
}

export function clampPlayerPositionForChapter(
  chapter: ChapterId,
  pos: Vec3,
): Vec3 {
  const clampedX = Math.max(-15.5, Math.min(15.5, pos.x));
  const clampedZ = Math.max(-92, Math.min(14, pos.z));
  const floorY = getChapterFloorHeight(chapter, clampedX, clampedZ);
  const minY = floorY + 1.05;
  const maxY = 10.5;
  const clampedY = Math.max(minY, Math.min(maxY, pos.y));
  return { x: clampedX, y: clampedY, z: clampedZ };
}

/**
 * Blocks forward travel through the Pelican cargo bulkhead at z = -62 until opened.
 */
export function resolvePelicanGateCollision(
  prevPos: Vec3,
  nextPos: Vec3,
  gateOpen: boolean,
  gateZ: number = CHAPTER_2_PELICAN_GATE_Z,
): { position: Vec3; hitGate: boolean } {
  if (gateOpen) {
    return { position: nextPos, hitGate: false };
  }
  const halfThickness = 1.05;
  const crossesFront =
    prevPos.z >= gateZ + halfThickness && nextPos.z < gateZ + halfThickness;
  const crossesBack =
    prevPos.z <= gateZ - halfThickness && nextPos.z > gateZ - halfThickness;
  const insideBand = Math.abs(nextPos.z - gateZ) < halfThickness;

  if (!crossesFront && !crossesBack && !insideBand) {
    return { position: nextPos, hitGate: false };
  }

  const clampedZ =
    prevPos.z >= gateZ ? gateZ + halfThickness : gateZ - halfThickness;
  return {
    position: { x: nextPos.x, y: nextPos.y, z: clampedZ },
    hitGate: true,
  };
}

/**
 * Blocks forward travel through the Chapter 3 sunken crab-crane rubble barricade at z = -62 until cleared.
 */
export function resolveCrabDebrisCollision(
  prevPos: Vec3,
  nextPos: Vec3,
  debrisOpen: boolean,
  gateZ: number = CHAPTER_3_DEBRIS_GATE_Z,
): { position: Vec3; hitDebris: boolean } {
  const res = resolvePelicanGateCollision(prevPos, nextPos, debrisOpen, gateZ);
  return { position: res.position, hitDebris: res.hitGate };
}

/**
 * Blocks forward travel through the Chapter 4 Charybdis Crane Sluice Gate at z = -62 until opened.
 */
export function resolveCharybdisGateCollision(
  prevPos: Vec3,
  nextPos: Vec3,
  gateOpen: boolean,
  gateZ: number = CHAPTER_4_CHARYBDIS_GATE_Z,
): { position: Vec3; hitGate: boolean } {
  return resolvePelicanGateCollision(prevPos, nextPos, gateOpen, gateZ);
}

/**
 * Checks whether fast swimming near Pufferfish Pafnutiy triggers his inflation shockwave.
 * Moving quietly (or equipping Silent Fins) lets the player glide past safely.
 */
export function stepPafnutiyNoiseCheck(
  playerPos: Vec3,
  playerSpeed: number,
  pafnutiyPos: Vec3,
  hasSilentFins: boolean,
  playerHidden: boolean,
  alreadyInflated: boolean,
): { triggered: boolean; noiseThreshold: number; knockbackDir: Vec3 } {
  const noiseThreshold = hasSilentFins ? 8.5 : 4.2;
  if (alreadyInflated || playerHidden) {
    return {
      triggered: false,
      noiseThreshold,
      knockbackDir: { x: 0, y: 0, z: 0 },
    };
  }
  const dx = playerPos.x - pafnutiyPos.x;
  const dy = playerPos.y - pafnutiyPos.y;
  const dz = playerPos.z - pafnutiyPos.z;
  const distSq = dx * dx + dy * dy + dz * dz;
  if (distSq > 7.5 * 7.5 || playerSpeed <= noiseThreshold) {
    return {
      triggered: false,
      noiseThreshold,
      knockbackDir: { x: 0, y: 0, z: 0 },
    };
  }
  const len = Math.hypot(dx, dy, dz) || 1;
  return {
    triggered: true,
    noiseThreshold,
    knockbackDir: { x: dx / len, y: Math.max(0.2, dy / len), z: dz / len },
  };
}

export function createInitialSquid(): SquidEntity {
  return {
    position: { x: 0, y: 2.2, z: -46 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 0,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter2Predator(): SquidEntity {
  return {
    position: { x: 0, y: 0.4, z: -42 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 0.8,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter3Predator(): SquidEntity {
  return {
    position: { x: 0.6, y: -0.2, z: -43 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 1.4,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter4Predator(): SquidEntity {
  return {
    position: { x: -1.2, y: -1.4, z: -42 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 2.1,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter5Predator(): SquidEntity {
  return {
    position: { x: 1.5, y: -1.8, z: -44 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 0.4,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter6Predator(): SquidEntity {
  return {
    position: { x: -2.2, y: -2.4, z: -50 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 1.9,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter7Predator(): SquidEntity {
  return {
    position: { x: 1.8, y: -1.6, z: -44 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 1.1,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter8Predator(): SquidEntity {
  return {
    position: { x: -1.6, y: -0.8, z: -45 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 2.5,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter9Predator(): SquidEntity {
  return {
    position: { x: 1.4, y: 0.4, z: -45 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 0.7,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialChapter10Predator(): SquidEntity {
  return {
    position: { x: -0.8, y: 2.0, z: -48 },
    velocity: { x: 0, y: 0, z: 0 },
    headingYaw: 0,
    state: 'patrol',
    stateTimer: 0,
    patrolPhase: 1.6,
    dashDir: { x: 0, y: 0, z: 1 },
    stunTimer: 0,
    distractedUntil: 0,
    distractTarget: null,
  };
}

export function createInitialPredatorForChapter(chapter: ChapterId): SquidEntity {
  switch (chapter) {
    case 10:
      return createInitialChapter10Predator();
    case 9:
      return createInitialChapter9Predator();
    case 8:
      return createInitialChapter8Predator();
    case 7:
      return createInitialChapter7Predator();
    case 6:
      return createInitialChapter6Predator();
    case 5:
      return createInitialChapter5Predator();
    case 4:
      return createInitialChapter4Predator();
    case 3:
      return createInitialChapter3Predator();
    case 2:
      return createInitialChapter2Predator();
    default:
      return createInitialSquid();
  }
}

export interface SquidAIOptions {
  patrolCenterZ?: number;
  patrolCenterY?: number;
  zMin?: number;
  zMax?: number;
  detectionMultiplier?: number;
  chapter?: ChapterId;
}

export function stepSquidAI(
  squid: SquidEntity,
  playerPos: Vec3,
  playerHidden: boolean,
  predatorSpeedMult: number,
  dt: number,
  nowSec: number,
  options?: SquidAIOptions,
): {
  squid: SquidEntity;
  telegraphStarted: boolean;
  hitPlayer: boolean;
  dodgedDash: boolean;
} {
  let telegraphStarted = false;
  let hitPlayer = false;
  let dodgedDash = false;

  if (squid.stunTimer > 0) {
    const nextStun = Math.max(0, squid.stunTimer - dt);
    return {
      squid: {
        ...squid,
        stunTimer: nextStun,
        state: nextStun > 0 ? 'stunned' : 'patrol',
        velocity: { x: 0, y: 0, z: 0 },
      },
      telegraphStarted: false,
      hitPlayer: false,
      dodgedDash: false,
    };
  }

  const next = {
    ...squid,
    position: { ...squid.position },
    velocity: { ...squid.velocity },
    dashDir: { ...squid.dashDir },
  };

  const dx = playerPos.x - next.position.x;
  const dy = playerPos.y - next.position.y;
  const dz = playerPos.z - next.position.z;
  const distToPlayer = Math.hypot(dx, dy, dz);

  const isDistracted =
    nowSec < next.distractedUntil && next.distractTarget !== null;

  const patrolCenterZ = options?.patrolCenterZ ?? -47;
  const patrolCenterY = options?.patrolCenterY ?? 2.3;
  const zMin = options?.zMin ?? -59.5;
  const zMax = options?.zMax ?? -24;
  const detectRange = 13.5 * (options?.detectionMultiplier ?? 1.0);
  const chapter = options?.chapter ?? 1;

  if (next.state === 'patrol' || next.state === 'stunned') {
    next.state = 'patrol';
    next.patrolPhase += dt * 0.9 * predatorSpeedMult;
    const targetX = isDistracted && next.distractTarget
      ? next.distractTarget.x
      : Math.sin(next.patrolPhase) * 8.8;
    const targetZ = isDistracted && next.distractTarget
      ? next.distractTarget.z
      : patrolCenterZ + Math.cos(next.patrolPhase * 0.7) * 6.5;
    const targetY = isDistracted && next.distractTarget
      ? next.distractTarget.y
      : patrolCenterY + Math.sin(next.patrolPhase * 1.4) * 0.9;

    const toX = targetX - next.position.x;
    const toY = targetY - next.position.y;
    const toZ = targetZ - next.position.z;
    const len = Math.hypot(toX, toY, toZ) || 1;
    const speed = 4.5 * predatorSpeedMult;
    next.velocity.x = (toX / len) * speed;
    next.velocity.y = (toY / len) * speed;
    next.velocity.z = (toZ / len) * speed;
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;
    next.headingYaw = Math.atan2(next.velocity.x, next.velocity.z);

    if (!playerHidden && !isDistracted && distToPlayer < detectRange) {
      next.state = 'telegraph';
      next.stateTimer = 0.95; // generous telegraph
      const inv = 1 / (distToPlayer || 1);
      next.dashDir = { x: dx * inv, y: dy * inv, z: dz * inv };
      next.headingYaw = Math.atan2(next.dashDir.x, next.dashDir.z);
      telegraphStarted = true;
    }
  } else if (next.state === 'telegraph') {
    next.stateTimer -= dt;
    // Track gently during first half of telegraph so player can dodge cleanly
    if (next.stateTimer > 0.45 && !playerHidden && distToPlayer > 0.1) {
      const inv = 1 / distToPlayer;
      next.dashDir = { x: dx * inv, y: dy * inv, z: dz * inv };
      next.headingYaw = Math.atan2(next.dashDir.x, next.dashDir.z);
    }
    // Slight recoil windup
    next.position.x -= next.dashDir.x * 1.1 * dt;
    next.position.y -= next.dashDir.y * 1.1 * dt;
    next.position.z -= next.dashDir.z * 1.1 * dt;

    if (next.stateTimer <= 0) {
      next.state = 'dash';
      next.stateTimer = 0.72;
    }
  } else if (next.state === 'dash') {
    next.stateTimer -= dt;
    const dashSpeed = 16.5 * predatorSpeedMult;
    next.velocity.x = next.dashDir.x * dashSpeed;
    next.velocity.y = next.dashDir.y * dashSpeed;
    next.velocity.z = next.dashDir.z * dashSpeed;
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;

    if (!playerHidden && distToPlayer < 1.85) {
      hitPlayer = true;
      next.state = 'recover';
      next.stateTimer = 1.6;
    } else if (next.stateTimer <= 0) {
      next.state = 'recover';
      next.stateTimer = 1.4;
      if (distToPlayer < 6.5) {
        dodgedDash = true;
      }
    }
  } else if (next.state === 'recover') {
    next.stateTimer -= dt;
    next.velocity.x *= Math.exp(-3.5 * dt);
    next.velocity.y *= Math.exp(-3.5 * dt);
    next.velocity.z *= Math.exp(-3.5 * dt);
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.position.z += next.velocity.z * dt;
    if (next.stateTimer <= 0) {
      next.state = 'patrol';
      next.stateTimer = 0;
    }
  }

  // Keep predator above seafloor and inside corridor
  const floorY = getChapterFloorHeight(chapter, next.position.x, next.position.z);
  next.position.y = Math.max(floorY + 1.3, Math.min(8.5, next.position.y));
  next.position.x = Math.max(-13.5, Math.min(13.5, next.position.x));
  next.position.z = Math.max(zMin, Math.min(zMax, next.position.z));

  return { squid: next, telegraphStarted, hitPlayer, dodgedDash };
}

export function getRoomIdForZChapter1(z: number): string {
  if (z > -27) return 'ch1_reef_entry';
  if (z > -57) return 'ch1_squid_patrol';
  return 'ch1_trawler_net';
}

export function getRoomIdForZChapter2(z: number): string {
  if (z > -32) return 'ch2_liner_hull';
  if (z > -62) return 'ch2_galley';
  return 'ch2_pelican_gate';
}

export function getRoomIdForZChapter3(z: number): string {
  if (z > -30) return 'ch3_kelp_edge';
  if (z > -62) return 'ch3_whisper_corridor';
  return 'ch3_crab_outpost';
}

export function getRoomIdForZChapter4(z: number): string {
  if (z > -32) return 'ch4_ribcage_hall';
  if (z > -58) return 'ch4_sperm_whale';
  return 'ch4_charybdis_gate';
}

export function getRoomIdForZChapter5(z: number): string {
  if (z > -42) return 'ch5_thermal_vents';
  return 'ch5_queen_nest';
}

export function getRoomIdForZChapter6(_z: number): string {
  return 'ch6_abyss_heart';
}

export function getRoomIdForZChapter7(z: number): string {
  if (z > -46) return 'ch7_thermal_updraft';
  return 'ch7_whale_rescue';
}

export function getRoomIdForZChapter8(z: number): string {
  if (z > -48) return 'ch8_dark_clearings';
  return 'ch8_boris_shortcut';
}

export function getRoomIdForZChapter9(z: number): string {
  if (z > -46) return 'ch9_cabins';
  return 'ch9_kesha_atrium';
}

export function getRoomIdForZChapter10(z: number): string {
  if (z > -58) return 'ch10_surface_sprint';
  return 'ch10_hatchling_coral';
}

export function getRoomIdForChapter(chapter: ChapterId, z: number): string {
  switch (chapter) {
    case 10:
      return getRoomIdForZChapter10(z);
    case 9:
      return getRoomIdForZChapter9(z);
    case 8:
      return getRoomIdForZChapter8(z);
    case 7:
      return getRoomIdForZChapter7(z);
    case 6:
      return getRoomIdForZChapter6(z);
    case 5:
      return getRoomIdForZChapter5(z);
    case 4:
      return getRoomIdForZChapter4(z);
    case 3:
      return getRoomIdForZChapter3(z);
    case 2:
      return getRoomIdForZChapter2(z);
    default:
      return getRoomIdForZChapter1(z);
  }
}
