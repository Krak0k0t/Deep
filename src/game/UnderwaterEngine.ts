import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {
  advanceToRoom,
  buildBalanceTelemetry,
  CampaignState,
  ChapterId,
  ChapterRank,
  CHAPTERS,
  collectLoreRelic,
  collectPearl,
  completeBorisMugQuest,
  completeBorisShortcutQuest,
  completeChapterMastery,
  completeCrabDebrisQuest,
  completeHatchlingQuest,
  completeKeshaAlertQuest,
  completeQueenEscortQuest,
  completeWhaleContainerQuest,
  completeWhaleRescueQuest,
  createCampaignState,
  emitCall,
  getCallCooldownSec,
  getPlayerSpeedMultiplier,
  getPredatorSpeedMultiplier,
  GLOW_SKINS,
  GlowSkinId,
  purchaseGlowSkin,
  purchaseHideoutUpgrade,
  QuestStatus,
  recordChapterHit,
  recordPredatorSpot,
  recordRoomDeath,
  registerStyleDodge,
  triggerEggPickupAscent,
} from './campaign';
import {
  createChapter1NPCs,
  createChapter2NPCs,
  createChapter3NPCs,
  createChapter4NPCs,
  createChapter5NPCs,
  createChapter6NPCs,
  createChapter7NPCs,
  createChapter8NPCs,
  createChapter9NPCs,
  createChapter10NPCs,
  createNPCsForChapter,
  distanceSq3,
  NPCData,
  triggerShrimpPanic,
  updateNPCProximity,
} from './npc';
import {
  CHAPTER_1_NET_WINDOWS,
  CHAPTER_1_NET_Z,
  CHAPTER_1_PEARLS,
  CHAPTER_1_SHELTERS,
  CHAPTER_2_BORIS_MUG_POS,
  CHAPTER_2_PEARLS,
  CHAPTER_2_PELICAN_GATE_Z,
  CHAPTER_2_PELICAN_LEVER_POS,
  CHAPTER_2_SHELTERS,
  CHAPTER_3_CRANE_LEVER_POS,
  CHAPTER_3_DEBRIS_GATE_Z,
  CHAPTER_3_PEARLS,
  CHAPTER_3_SCRAPS,
  CHAPTER_3_SHELTERS,
  CHAPTER_4_CHARYBDIS_GATE_Z,
  CHAPTER_4_CHARYBDIS_LEVER_POS,
  CHAPTER_4_PEARLS,
  CHAPTER_4_SHELTERS,
  CHAPTER_4_WHALE_CONTAINER_POS,
  CHAPTER_5_GATE_LEVER_POS,
  CHAPTER_5_GATE_Z,
  CHAPTER_5_LURE_POS,
  CHAPTER_5_PEARLS,
  CHAPTER_5_SHELTERS,
  CHAPTER_5_THERMAL_VENTS,
  CHAPTER_6_EGG_ALTAR_POS,
  CHAPTER_6_PEARLS,
  CHAPTER_6_SHELTERS,
  CHAPTER_7_PEARLS,
  CHAPTER_7_SHELTERS,
  CHAPTER_7_UPDRAFT_ZONES,
  CHAPTER_7_WHALE_GATE_Z,
  CHAPTER_7_WHALE_LEVER_POS,
  CHAPTER_8_BORIS_LEVER_POS,
  CHAPTER_8_PEARLS,
  CHAPTER_8_SHELTERS,
  CHAPTER_8_SHORTCUT_GATE_Z,
  CHAPTER_9_BULKHEAD_LEVER_POS,
  CHAPTER_9_BULKHEAD_Z,
  CHAPTER_9_PEARLS,
  CHAPTER_9_SHELTERS,
  CHAPTER_10_PEARLS,
  CHAPTER_10_SHELTERS,
  CHAPTER_10_UPDRAFT_ZONES,
  CHAPTER_SIDE_CURRENTS,
  clampPlayerPositionForChapter,
  CoralShelter,
  createInitialPredatorForChapter,
  getChapterFloorHeight,
  getPearlsForChapter,
  getRoomIdForChapter,
  getSheltersForChapter,
  isInsideCoralShelter,
  PearlPickup,
  resolveCharybdisGateCollision,
  resolveCrabDebrisCollision,
  resolvePelicanGateCollision,
  resolveTrawlerNetCollision,
  sampleSideCurrent,
  sampleThermalVentHazard,
  sampleUpdraftCurrent,
  SquidEntity,
  stepPafnutiyNoiseCheck,
  stepShelterOxygenRecovery,
  stepSquidAI,
} from './physics';
import {
  CoralTextures,
  createCoralTextures,
  createNacreTextures,
  createParticleGlowTexture,
  createRustedHullTextures,
  createSandTextures,
  createTrawlerNetTexture,
  createUnderwaterEnvironmentScene,
  createWeatheredWoodTextures,
  PBRSurfaceTextures,
  SandTextures,
} from './textures';
import {
  BorisRig,
  CharybdisGateRig,
  createBoneShelterRig,
  createBorisRig,
  createCargoCrateShelterRig,
  createCharybdisGateRig,
  createCoralShelterRig,
  createCriticCrabsRig,
  createDebrisScrapRig,
  createEggMesh,
  createGlafiraTurtleRig,
  createGlowingMugRig,
  createGodRayBeams,
  createHermitCrabSquadRig,
  createKelpDebrisBarricadeRig,
  createKelpShelterRig,
  createLeviathanSkeletonSet,
  createMantaFallbackRig,
  createMildredRig,
  createPafnutiyRig,
  createPearlPickupRig,
  createPelicanGateRig,
  createPlayerFishRig,
  createShrimpFlockRig,
  createSquidRig,
  createSunkenLinerSet,
  createWhaleContainerRig,
  createWhaleSilhouetteRig,
  CriticCrabsRig,
  GlafiraTurtleRig,
  HermitCrabSquadRig,
  KelpDebrisBarricadeRig,
  MildredRig,
  PafnutiyRig,
  PelicanGateRig,
  PlayerFishRig,
  SquidRig,
} from './meshes';
import {
  AbyssalGateRig,
  AbyssalHeartAltarRig,
  BabyHatchlingRig,
  BlackSmokerVentRig,
  createAbyssalGateRig,
  createAbyssalHeartAltarRig,
  createBabyHatchlingRig,
  createBlackSmokerVentRig,
  createContactShadowDisc,
  createHatchlingCoralSanctuaryRig,
  createKelpSporeLanternRig,
  createKeshaParrotfishRig,
  createLinerSearchlightRig,
  createLoreRelicRig,
  createLurePearlPickupRig,
  createQueenAnglerRig,
  createUpdraftCurrentRig,
  createYoungWhaleRescueRig,
  KelpSporeLanternRig,
  KeshaParrotfishRig,
  LinerSearchlightRig,
  QueenAnglerRig,
  UpdraftCurrentRig,
  YoungWhaleRescueRig,
} from './meshesExtended';
import { CHAPTER_LORE_RELICS, getLoreRelicText } from './lore';
import {
  clearSaveData,
  createCampaignFromSave,
  loadSaveData,
  saveCampaignProgress,
} from './save';
import { CHAPTER_TRANSITIONS, isInsideTransitionTrigger } from './transition';
import {
  extractInstancedMeshParts,
  FishSwimHandle,
  GITHUB_MODEL_CATALOG,
  loadCachedGLTF,
  loadTropicalFishFromZip,
  prepareNormalizedModel,
  resolveAssetUrls,
  stripGiantBackdropMeshes,
  tuneCoralMaterial,
  tuneFireflySquidMaterial,
  tuneFishMaterial,
  tuneGlassOctopusMaterial,
  tuneJellyfishMaterial,
  tunePufferfishMaterial,
  tuneSquidPredatorMaterial,
} from './gltfAssets';
import {
  clampVelocityAgainstBounds,
  computeFishTargetQuaternion,
  computeOrbitCameraVectors,
  computeSwimForward,
  createDefaultCameraOffset,
  createInitialSwimState,
  applyCameraPanDelta,
  CameraRigOffset,
  clampCameraZoom,
  isHoldButtonSynced,
  shouldAbortStalledAutopilot,
  stepAutopilotMotion,
  stepSwimMotion,
  stopSwimMotion,
  SwimState,
  SwimTuningOptions,
  triggerSwimDash,
} from './swimControls';
import {
  ControlSettings,
  GameAction,
  loadControlSettings,
  MouseBinding,
  resetControlSettings as resetStoredControlSettings,
  saveControlSettings,
} from './controlSettings';
import {
  computeCompassBearing,
  DIFFICULTY_PRESETS,
  GameSettings,
  GRAPHICS_PRESETS,
  loadGameSettings,
  saveGameSettings,
} from './gameSettings';
import { getLocale, resolveLanguageId, SUPPORTED_LANGUAGE_IDS, t } from './i18n';
import {
  BioluminescentPortalRig,
  createBioluminescentSanctuaryPortalRig,
} from './environment/BioluminescentPortals';
import {
  buildNatureField,
  createSculptedBoulderGeometry,
} from './environment/NatureField';
import { MusicContext, UnderwaterAudio } from './audio';
import {
  computeTitleSquidFlightFrame,
  computeTitleSquidIdleFrame,
  TITLE_SQUID_FLEE_DURATION_SEC,
} from './titleSquidFlight';

interface InteractableMeta {
  type:
    | 'pearl'
    | 'lore_relic'
    | 'npc'
    | 'shelter'
    | 'egg'
    | 'net'
    | 'mug'
    | 'gate_lever'
    | 'scrap'
    | 'crane_lever'
    | 'whale_container'
    | 'charybdis_lever'
    | 'lure_pearl'
    | 'ch5_lever'
    | 'egg_altar'
    | 'whale_valve'
    | 'ch7_lever'
    | 'ch8_lever'
    | 'ch9_lever';
  id?: string;
  label: string;
  targetPos?: { x: number; y: number; z: number };
}

export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export interface FloatingBubble {
  id: string;
  speaker: string;
  line1: string;
  line2: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export interface HUDSnapshot {
  screenState: GameScreenState;
  chapter: number;
  chapterTitle: string;
  phase: 'DESCENT' | 'ASCENT';
  health: number;
  maxHealth: number;
  pearls: number;
  depthMeters: number;
  isHidden: boolean;
  callCooldownRemaining: number;
  callCooldownTotal: number;
  hasDashMutation: boolean;
  dashCooldownRemaining: number;
  activeSkin: GlowSkinId;
  unlockedSkins: GlowSkinId[];
  upgrades: string[];
  quests: QuestStatus;
  borisMugCarried: boolean;
  pelicanGateOpen: boolean;
  pafnutiyInflated: boolean;
  crabScrapsCollected: number;
  crabDebrisOpen: boolean;
  whaleContainerCarried: boolean;
  charybdisGateOpen: boolean;
  ch5LureCarried: boolean;
  ch5GateOpen: boolean;
  ch6EggReclaimed: boolean;
  ch7WhaleFreed: boolean;
  ch8ShortcutOpen: boolean;
  ch9BulkheadOpen: boolean;
  hatchlingBorn: boolean;
  objectiveText: string;
  toastText: string | null;
  eggEchoText: string | null;
  outcome: 'victory' | 'defeat' | null;
  elapsedSec: number;
  totalDeaths: number;
  npcsMetCount: number;
  npcsTotal: number;
  styleDodges: number;
  muted: boolean;
  bubbles: FloatingBubble[];
  squidAlert: 'calm' | 'telegraph' | 'dash';
  savedHighestChapter: number;
  savedPearls: number;
  completionLabel: string | null;
  controlSettings: ControlSettings;
  gameSettings: GameSettings;
  autopilotActive: boolean;
  hoverInteractLabel: string | null;
  collectedRelicIds: string[];
  bestRankByChapter: Partial<Record<ChapterId, ChapterRank>>;
  npcsMet: string[];
  lastChapterRank: ChapterRank | null;
  awardedSRankBonus: boolean;
  eggResonanceActive: boolean;
  objectiveBearingDeg: number;
  objectiveDistMeters: number;
  titleLaunchActive: boolean;
}

const _vec3 = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _squidCamRight = new THREE.Vector3();
const _squidCamUp = new THREE.Vector3();
const _squidCamFwd = new THREE.Vector3();
const _squidHomePos = new THREE.Vector3();
const _squidAttackPos = new THREE.Vector3();
const _squidTargetAim = new THREE.Vector3();
const _squidArmDirWorld = new THREE.Vector3();
const _squidMantlePos = new THREE.Vector3();
const _squidMouthCenter = new THREE.Vector3();
const _squidTentacleFwd = new THREE.Vector3();
const _squidBonePos0 = new THREE.Vector3();
const _squidBonePos1 = new THREE.Vector3();
const _squidBoneDir = new THREE.Vector3();
const _squidRadialOut = new THREE.Vector3();
const _squidRotAxis = new THREE.Vector3();
const _squidIdleQuat = new THREE.Quaternion();
const _squidAttackQuat = new THREE.Quaternion();
const _squidDeltaQuat = new THREE.Quaternion();
const _squidParentInvQuat = new THREE.Quaternion();
const _squidEuler = new THREE.Euler();
const _squidFluoroCyan = new THREE.Color('#00fff2');
const _squidFluoroViolet = new THREE.Color('#7464ff');
const _squidFluoroBlended = new THREE.Color('#00fff2');
const _titleSquidBox = new THREE.Box3();
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _rollQuat = new THREE.Quaternion();
const _zAxis = new THREE.Vector3(0, 0, 1);
const _lookFwd = new THREE.Vector3();
const _swimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _planeHit = new THREE.Vector3();

export class UnderwaterEngine {
  private container: HTMLElement;
  private onHUDUpdate: (snapshot: HUDSnapshot) => void;
  private audio = new UnderwaterAudio();

  private isSoftwareGl = false;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private opticalPass: ShaderPass | null = null;
  private godRays!: THREE.Group;
  private godRayMat: THREE.ShaderMaterial | null = null;

  private playerRig!: PlayerFishRig;
  private glbFishPivot: THREE.Group | null = null;
  private glbFishSwim: FishSwimHandle | null = null;
  private glbFishYawOffset = 0;
  private eggMesh!: THREE.Group;

  // Per-chapter scene container & disposables
  private activeSceneChapter: ChapterId = 1;
  private chapterGroup = new THREE.Group();
  private chapterDisposables: Array<{ dispose: () => void }> = [];
  private activeShelters: CoralShelter[] = CHAPTER_1_SHELTERS;
  private activePearls: PearlPickup[] = CHAPTER_1_PEARLS;

  // Chapter 1 actors
  private mildredRig: MildredRig | null = null;
  private mildredMixer: THREE.AnimationMixer | null = null;
  private mildredUsingExternalModel = false;
  private shrimpRig: THREE.Group | null = null;

  // Chapter 2 actors & setpieces
  private borisRig: BorisRig | null = null;
  private borisMixer: THREE.AnimationMixer | null = null;
  private borisUsingExternalModel = false;
  private pafnutiyRig: PafnutiyRig | null = null;
  private pafnutiyMixer: THREE.AnimationMixer | null = null;
  private mugMesh: THREE.Group | null = null;
  private pelicanGateRig: PelicanGateRig | null = null;
  private whaleRig: THREE.Group | null = null;
  private whaleSongCooldown = 8;

  // Chapter 3 actors & setpieces
  private hermitCrabRig: HermitCrabSquadRig | null = null;
  private glafiraRig: GlafiraTurtleRig | null = null;
  private glafiraMixer: THREE.AnimationMixer | null = null;
  private glafiraUsingExternalModel = false;
  private mantaRig: THREE.Group | null = null;
  private mantaMixer: THREE.AnimationMixer | null = null;
  private ch3DebrisRig: KelpDebrisBarricadeRig | null = null;
  private scrapMeshes = new Map<string, THREE.Group>();

  // Chapter 4 actors & setpieces
  private criticCrabsRig: CriticCrabsRig | null = null;
  private ch4GateRig: CharybdisGateRig | null = null;
  private whaleContainerMesh: THREE.Group | null = null;

  // Chapters 5-10 actors & setpieces
  private queenAnglerRig: QueenAnglerRig | null = null;
  private ventRigs: BlackSmokerVentRig[] = [];
  private ch5LureMesh: THREE.Group | null = null;
  private ch5GateRig: AbyssalGateRig | null = null;
  private ch6AltarRig: AbyssalHeartAltarRig | null = null;
  private updraftRigs: UpdraftCurrentRig[] = [];
  private youngWhaleRig: YoungWhaleRescueRig | null = null;
  private ch7GateRig: AbyssalGateRig | null = null;
  private ch8SporeLanterns: KelpSporeLanternRig[] = [];
  private ch8GateRig: AbyssalGateRig | null = null;
  private keshaRig: KeshaParrotfishRig | null = null;
  private ch9Searchlights: LinerSearchlightRig[] = [];
  private ch9GateRig: AbyssalGateRig | null = null;
  private babyHatchlingRig: BabyHatchlingRig | null = null;
  private carriedEggRig!: THREE.Group;
  private playerShadow!: THREE.Mesh;

  // Cached secondary lights + zero-GC scratch structs (Pass 1 Performance)
  private secondaryLights: THREE.PointLight[] = [];
  private _prevPosScratch = { x: 0, y: 0, z: 0 };
  private _squidOptsScratch = {
    chapter: 1 as ChapterId,
    patrolCenterZ: -44,
    patrolCenterY: 2.0,
    zMin: -62,
    zMax: -24,
    detectionMultiplier: 1.0,
  };

  private squidRig!: SquidRig;
  private squidPredatorMixer: THREE.AnimationMixer | null = null;
  private squidPredatorActions: Record<
    'patrol' | 'telegraph' | 'dash' | 'stun',
    THREE.AnimationAction | null
  > = { patrol: null, telegraph: null, dash: null, stun: null };
  private squidPredatorActiveState: 'patrol' | 'telegraph' | 'dash' | 'stun' | null = null;
  private squidPredatorEyeMats: THREE.MeshStandardMaterial[] = [];
  private fireflySquidSchool: Array<{
    group: THREE.Group;
    mixer: THREE.AnimationMixer | null;
    glowLight: THREE.PointLight | null;
    anchorX: number;
    anchorY: number;
    anchorZ: number;
    radiusX: number;
    radiusZ: number;
    speed: number;
    phase: number;
  }> = [];
  private ambientFishSchool: Array<{
    group: THREE.Group;
    swimHandle: FishSwimHandle;
    anchorX: number;
    anchorY: number;
    anchorZ: number;
    radiusX: number;
    radiusZ: number;
    speed: number;
    phase: number;
  }> = [];
  private pearlMeshes = new Map<string, THREE.Group>();
  private loreRelicMesh: THREE.Group | null = null;
  private callWaveRing!: THREE.Mesh;
  private callWaveMat!: THREE.MeshBasicMaterial;
  private callWaveActive = 0;

  private coralContainer = new THREE.Group();
  private rockContainer = new THREE.Group();
  private coralMatrices: THREE.Matrix4[] = [];
  private rockMatrices: THREE.Matrix4[] = [];
  private coralTex!: CoralTextures;
  private seagrassTimeUniform = { value: 0 };
  private causticTimeUniform = { value: 0 };
  private causticStrengthUniform = { value: 0.135 };
  private ambientAnimFrameCounter = 0;
  private ambientAnimAccumDt = 0;

  private planktonPoints!: THREE.Points;
  private planktonMat: THREE.ShaderMaterial | null = null;
  private planktonCount = 680;

  private readonly maxBubbles = 84;
  private bubbleInstMesh!: THREE.InstancedMesh;
  private bubblePos = new Float32Array(84 * 3);
  private bubbleVel = new Float32Array(84 * 3);
  private bubbleLife = new Float32Array(84);
  private bubbleMaxLife = new Float32Array(84);
  private bubbleScale = new Float32Array(84);
  private bubbleZeroed = new Uint8Array(84).fill(1);
  private bubbleCursor = 0;
  private bubbleSpawnAccum = 0;
  private bubbleHadActive = false;

  private disposables: Array<{ dispose: () => void }> = [];
  private frameId = 0;
  private disposed = false;
  private lastTimeMs = performance.now();
  private frameTimeEmaMs = 16.6;
  private adaptiveDprScale = 1.0;
  private adaptiveDprCounter = 0;

  // Simulation state
  private screenState: GameScreenState = 'title';
  private outcome: 'victory' | 'defeat' | null = null;
  private campaign: CampaignState = createCampaignState(1);
  private npcs: NPCData[] = createNPCsForChapter(1);
  private squid: SquidEntity = createInitialPredatorForChapter(1);

  // Chapter 2-10 & Dash/Input-buffering state
  private dashBoostTimer = 0;
  private dashCooldownTimer = 0;
  private bufferedCallTimer = 0;
  private bufferedDashTimer = 0;
  private borisMugCarried = false;
  private pelicanGateOpen = false;
  private pelicanGateAnim01 = 0;
  private pafnutiySwellTimer = 0;
  private pafnutiyScale = 1.0;
  private collectedScrapIds: string[] = [];
  private ch3DebrisOpen = false;
  private ch3DebrisAnim01 = 0;
  private whaleContainerCarried = false;
  private ch4GateOpen = false;
  private ch4GateAnim01 = 0;
  private ch5LureCarried = false;
  private ch5GateOpen = false;
  private ch5GateAnim01 = 0;
  private ch6EggReclaimed = false;
  private ch7WhaleFreed = false;
  private ch7GateAnim01 = 0;
  private ch8ShortcutOpen = false;
  private ch8GateAnim01 = 0;
  private ch8SporeFlareTimer = 0;
  private ch9BulkheadOpen = false;
  private ch9GateAnim01 = 0;
  private hatchlingBorn = false;
  private queenEscortReady = false;
  private keshaStunUsed = false;

  private swimState: SwimState = createInitialSwimState(
    new THREE.Vector3(0, 3.0, 4),
    Math.PI,
    -0.06,
  );
  private playerPos = this.swimState.position;
  private playerVel = this.swimState.velocity;
  private _stepNoseDir = new THREE.Vector3();
  private swimDistance = 0;
  private callSonarTimer = 0;
  private eggResonanceTimer = 0;
  private lastChapterRank: ChapterRank | null = null;
  private lastAwardedSRankBonus = false;
  private inUpdraftCurrent = false;
  private fovCurrent = 58;

  private health = 100;
  private maxHealth = 100;
  private hurtInvulnTimer = 0;
  private mildredBumpCooldown = 0;
  private shrimpPanicCooldown = 0;
  private trauma = 0;
  private hitstopTimer = 0;

  private simTimeSec = 0;
  private playElapsedSec = 0;
  private introBeatTimer = 0;
  private eggEchoTimer = 0;
  private eggEchoText: string | null = null;
  private toastTimer = 0;
  private toastText: string | null = null;
  private lastHudEmitMs = 0;
  private savedHighestChapter = 1;
  private savedPearls = 0;
  private completionLabel: string | null = null;

  // Input, control settings & world settings state
  private onToggleFullscreen?: () => void;
  private controlSettings: ControlSettings = loadControlSettings();
  private gameSettings: GameSettings = loadGameSettings(undefined, SUPPORTED_LANGUAGE_IDS);
  private keys = new Set<string>();
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private hasLastPointer = false;
  private pointerDown = false;
  private holdSwimButton: number | null = null;
  private pointerDragButtonDown = false;
  private pointerDownTimeMs = 0;
  private panDragActive = false;
  private lastMmbDownMs = 0;
  private viewportWidth = 1280;
  private viewportHeight = 720;

  // Orbit / Zoom / Pan camera & Menu Cinema state
  private cameraOffset: CameraRigOffset = createDefaultCameraOffset();
  private titleParallaxX = 0;
  private titleParallaxY = 0;
  private heroPlayfulTimer = 0;
  private startFlythroughTimer = 0;
  private flythroughStartPos = new THREE.Vector3(0, 5.2, 11.5);
  private flythroughStartLook = new THREE.Vector3(0.5, 2.8, -4);

  // Title screen interactive 3D Squid button & escape sequence
  private titleSquidGroup!: THREE.Group;
  private titleSquidFallbackRig!: SquidRig;
  private titleSquidModelPivot: THREE.Group | null = null;
  private titleSquidGlowMats: Array<{ mat: THREE.MeshStandardMaterial; baseEmissive: number }> = [];
  private titleSquidFluoroUniforms: Array<{
    uFluoroFlash: { value: number };
    uFluoroColor: { value: THREE.Color };
    uFluoroPhase: { value: number };
  }> = [];
  private titleSquidAttackBurstFired = false;
  private titleSquidTentacleChains: Array<{
    b0: THREE.Object3D;
    b1: THREE.Object3D;
    b2: THREE.Object3D | null;
  }> = [];
  private titleSquidMantleBone: THREE.Object3D | null = null;
  private titleSquidArmForwardLocal = new THREE.Vector3(0.45, -0.35, 0.82).normalize();
  private titleSquidMixer: THREE.AnimationMixer | null = null;
  private titleSquidLight!: THREE.PointLight;
  private titleSquidHaloSprite!: THREE.Sprite;
  private titleSquidHaloMat!: THREE.SpriteMaterial;
  private titleSquidCoreSprite!: THREE.Sprite;
  private titleSquidCoreMat!: THREE.SpriteMaterial;
  private titleSquidClockSec = 0;
  private titleSquidInkMesh!: THREE.Mesh;
  private titleSquidInkMat!: THREE.MeshBasicMaterial;
  private titleSquidAnchorNdc = { x: -0.52, y: -0.45 };
  private titleSquidHovered = false;
  private titleSquidFleeing = false;
  private titleSquidFleeTimer = 0;
  private titleSquidPendingChapter: ChapterId | undefined = undefined;
  private titleSquidPendingNewGame = false;
  private titleSquidFleeOrigin = new THREE.Vector3();
  private titleSquidFleeRight = new THREE.Vector3(1, 0, 0);
  private titleSquidFleeUp = new THREE.Vector3(0, 1, 0);
  private titleSquidFleeFwd = new THREE.Vector3(0, 0, -1);
  private titleSquidFleeBubbleAccum = 0;
  private titleSquidHoverScale = 1.0;

  // Touch & Virtual Joystick state + Adaptive External UI state
  private externalMobileMode = false;
  private activeInputMode: 'touch' | 'keyboard' = 'keyboard';
  private externalReducedEffects = false;
  private _compassTargetScratch = { x: 0, y: 0, z: -88 };
  private virtualStickX = 0;
  private virtualStickY = 0;
  private virtualAscend = false;
  private virtualDescend = false;
  private activeTouches = new Map<number, { x: number; y: number }>();
  private lastPinchDist = 0;

  // Double-click target swimming, right-click interaction, hover highlight & beacon
  private clickTargetMeshes: THREE.Object3D[] = [];
  private interactiveObjects: THREE.Object3D[] = [];
  private activePortalRig: BioluminescentPortalRig | null = null;
  private isPortalHovered = false;
  private hoveredInteractLabel: string | null = null;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private swimTargetBuf = new THREE.Vector3();
  private swimTarget: THREE.Vector3 | null = null;
  private autopilotBestDistSq = Infinity;
  private autopilotStallSec = 0;
  private targetBeaconGroup!: THREE.Group;
  private targetBeaconRing!: THREE.Mesh;
  private targetBeaconCore!: THREE.Mesh;
  private targetBeaconBeam!: THREE.Mesh;
  private lastHoverCheckMs = 0;
  private lastTitleHoverMs = 0;

  constructor(
    container: HTMLElement,
    onHUDUpdate: (snapshot: HUDSnapshot) => void,
    autostart = false,
    onToggleFullscreen?: () => void,
  ) {
    this.container = container;
    this.onHUDUpdate = onHUDUpdate;
    this.onToggleFullscreen = onToggleFullscreen;

    const saved = loadSaveData();
    if (saved) {
      this.campaign = createCampaignFromSave(saved, 1);
      this.savedHighestChapter = saved.highestChapter;
      this.savedPearls = saved.pearls;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam) {
        this.gameSettings = {
          ...this.gameSettings,
          language: resolveLanguageId(langParam),
        };
      }
    }

    this.initThree();
    this.initPersistentCore();
    this.applyGraphicsQualitySettings(false);
    this.audio.setVolumes(this.gameSettings.musicVolume, this.gameSettings.sfxVolume);
    this.buildChapterScene(1);
    this.applyActiveSkinVisuals();
    this.bindEvents();
    this.syncSavedSummary();

    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const startChParam = Number(params.get('chapter'));

    if (autostart) {
      const targetCh: ChapterId =
        Number.isInteger(startChParam) && startChParam >= 1 && startChParam <= 10
          ? (startChParam as ChapterId)
          : 1;
      this.startGame(false, targetCh);
    } else {
      this.syncBodyState('title');
      this.audio.setMusicContext('menu', 0);
      this.emitHUD(true);
    }

    this.lastTimeMs = performance.now();
    this.tick();
  }

  private detectSoftwareGl(): boolean {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initThree(): void {
    this.isSoftwareGl = this.detectSoftwareGl();
    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = Math.max(320, rect.width || window.innerWidth);
    this.viewportHeight = Math.max(240, rect.height || window.innerHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setSize(this.viewportWidth, this.viewportHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    const ch1 = CHAPTERS[1];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(ch1.fogColor);
    // Methodology requirement: <fogExp2 attach="fog" args={['#052236', 0.015]} />
    this.scene.fog = new THREE.FogExp2(ch1.fogColor, ch1.fogDensity);

    // Aquatic HDRI environment dome for wet scales, brass, and glass reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = createUnderwaterEnvironmentScene();
    const envRT = pmrem.fromScene(envScene, 0.04);
    this.scene.environment = envRT.texture;
    this.scene.environmentIntensity = 0.42;
    this.disposables.push(envRT);
    envScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material.dispose();
        }
      }
    });
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(
      58,
      this.viewportWidth / this.viewportHeight,
      0.2,
      140,
    );
    this.camera.position.set(0, 5.2, 11.5);

    // Post-processing: Selective Bloom + Subtle Optical Underwater Grading/Chromatic Edge + ACES_FILMIC
    // Skipped on Software WebGL to prevent SwiftShader stalls while keeping identical lighting
    if (!this.isSoftwareGl) {
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(
          Math.max(160, Math.floor(this.viewportWidth * 0.5)),
          Math.max(120, Math.floor(this.viewportHeight * 0.5)),
        ),
        0.42,
        0.48,
        0.83,
      );
      composer.addPass(bloom);
      this.bloomPass = bloom;

      const opticalPass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uDepth01: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float uDepth01;
          varying vec2 vUv;
          void main() {
            vec2 centered = vUv - 0.5;
            float distSq = dot(centered, centered);
            // Subtle peripheral underwater water-lens dispersion
            vec2 shift = centered * distSq * 0.0042;
            float r = texture2D(tDiffuse, vUv + shift).r;
            float g = texture2D(tDiffuse, vUv).g;
            float b = texture2D(tDiffuse, vUv - shift).b;
            vec3 col = vec3(r, g, b);
            // Gentle oceanic S-curve & depth-aware teal-abyssal atmosphere
            col = mix(col, col * col * (3.0 - 2.0 * col), 0.14);
            vec3 depthTint = mix(vec3(0.95, 1.03, 1.04), vec3(0.86, 0.99, 1.06), uDepth01);
            col *= depthTint;
            float vig = smoothstep(0.96, 0.24, distSq * 1.42);
            col *= mix(0.68, 1.0, vig);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      });
      composer.addPass(opticalPass);
      this.opticalPass = opticalPass;

      composer.addPass(new OutputPass());
      this.composer = composer;
    }
  }

  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private spotLight!: THREE.SpotLight;
  private sunDirLight!: THREE.DirectionalLight;
  private rimDirLight!: THREE.DirectionalLight;
  private sandTex!: SandTextures;
  private rustedHullTex!: PBRSurfaceTextures;
  private weatheredWoodTex!: PBRSurfaceTextures;
  private nacreTex!: SandTextures;
  private ambientFishGroup = new THREE.Group();

  private initPersistentCore(): void {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const ch1 = CHAPTERS[1];

    // 1. Persistent 3-point + rim lighting updated per chapter
    this.ambientLight = new THREE.AmbientLight('#143a4d', 0.52);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight('#52a8cc', '#0a1f2b', 0.6);
    this.scene.add(this.hemiLight);

    this.spotLight = new THREE.SpotLight(
      ch1.spotColor,
      62,
      98,
      Math.PI / 2.7,
      0.95,
      1.32,
    );
    this.spotLight.position.set(0, 32, -16);
    this.spotLight.target.position.set(0, -2, -26);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);

    this.sunDirLight = new THREE.DirectionalLight('#74cff2', 0.78);
    this.sunDirLight.position.set(12, 28, 10);
    if (!this.isSoftwareGl) {
      this.sunDirLight.castShadow = true;
      this.sunDirLight.shadow.mapSize.set(2048, 2048);
      this.sunDirLight.shadow.radius = 3.0;
      this.sunDirLight.shadow.camera.left = -22;
      this.sunDirLight.shadow.camera.right = 22;
      this.sunDirLight.shadow.camera.top = 22;
      this.sunDirLight.shadow.camera.bottom = -22;
      this.sunDirLight.shadow.camera.near = 2;
      this.sunDirLight.shadow.camera.far = 72;
      this.sunDirLight.shadow.bias = -0.0004;
      this.sunDirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunDirLight);
    this.scene.add(this.sunDirLight.target);

    this.rimDirLight = new THREE.DirectionalLight('#3899b8', 0.44);
    this.rimDirLight.position.set(-16, 12, -32);
    this.scene.add(this.rimDirLight);

    // Volumetric God Rays (material cached on group.userData for O(1) uniform updates)
    this.godRays = createGodRayBeams();
    this.godRayMat = (this.godRays.userData.beamMaterial as THREE.ShaderMaterial) ?? null;
    this.scene.add(this.godRays);

    // Shared procedural PBR textures
    this.sandTex = createSandTextures(maxAniso);
    this.disposables.push(this.sandTex.map, this.sandTex.normalMap);

    this.coralTex = createCoralTextures(maxAniso);
    this.disposables.push(this.coralTex.map, this.coralTex.bumpMap);

    this.rustedHullTex = createRustedHullTextures(maxAniso);
    this.disposables.push(
      this.rustedHullTex.map,
      this.rustedHullTex.normalMap,
      this.rustedHullTex.roughnessMap,
    );

    this.weatheredWoodTex = createWeatheredWoodTextures(maxAniso);
    this.disposables.push(
      this.weatheredWoodTex.map,
      this.weatheredWoodTex.normalMap,
      this.weatheredWoodTex.roughnessMap,
    );

    this.nacreTex = createNacreTextures(maxAniso);
    this.disposables.push(this.nacreTex.map, this.nacreTex.normalMap);

    // GPU-animated Bioluminescent Plankton & Marine Snow Bokeh (0 CPU updates per frame)
    const pTex = createParticleGlowTexture();
    this.disposables.push(pTex);
    this.planktonCount = 680;
    const planktonPos = new Float32Array(this.planktonCount * 3);
    const planktonColors = new Float32Array(this.planktonCount * 3);
    const planktonPhase = new Float32Array(this.planktonCount);
    const planktonScale = new Float32Array(this.planktonCount);
    const tintCyan = new THREE.Color('#7cf5ff');
    const tintPale = new THREE.Color('#ccf7ff');
    const tintGold = new THREE.Color('#ffd98a');
    for (let i = 0; i < this.planktonCount; i++) {
      planktonPos[i * 3] = (Math.random() - 0.5) * 40;
      planktonPos[i * 3 + 1] = -4.5 + Math.random() * 15.5;
      planktonPos[i * 3 + 2] = 16 - Math.random() * 114;
      planktonPhase[i] = Math.random() * Math.PI * 2;
      planktonScale[i] = 0.72 + Math.random() * 0.85;
      const col = i % 7 === 0 ? tintGold : i % 3 === 0 ? tintPale : tintCyan;
      planktonColors[i * 3] = col.r;
      planktonColors[i * 3 + 1] = col.g;
      planktonColors[i * 3 + 2] = col.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(planktonPos, 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(planktonColors, 3));
    pGeo.setAttribute('aPhase', new THREE.BufferAttribute(planktonPhase, 1));
    pGeo.setAttribute('aScale', new THREE.BufferAttribute(planktonScale, 1));

    const pMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uMap: { value: pTex },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aPhase;
        attribute float aScale;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec3 p = position;
          float driftSpeed = 0.14 + fract(aPhase * 1.37) * 0.14;
          p.y = -4.0 + mod(p.y + 4.0 + uTime * driftSpeed, 15.0);
          p.x += sin(uTime * 0.55 + aPhase) * 0.42;
          p.z += cos(uTime * 0.42 + aPhase * 1.3) * 0.35;
          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          float dist = max(1.0, -mvPos.z);
          gl_PointSize = clamp((92.0 * aScale * uPixelRatio) / dist, 1.5, 22.0);
          vColor = aColor;
          vTwinkle = 0.52 + 0.48 * sin(uTime * 1.9 + aPhase * 3.1);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec4 tex = texture2D(uMap, gl_PointCoord);
          float alpha = tex.a * (0.45 + 0.42 * vTwinkle);
          if (alpha < 0.02) discard;
          gl_FragColor = vec4(vColor * (0.85 + 0.35 * vTwinkle), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.planktonMat = pMat;
    this.planktonPoints = new THREE.Points(pGeo, pMat);
    this.planktonPoints.frustumCulled = false;
    this.scene.add(this.planktonPoints);
    this.disposables.push(pGeo, pMat);

    // Pre-allocated pooled swim & pickup bubble stream (InstancedMesh, zero GC)
    const bubbleGeo = new THREE.SphereGeometry(0.042, 7, 7);
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: '#9cf8ff',
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.bubbleInstMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, this.maxBubbles);
    this.bubbleInstMesh.frustumCulled = false;
    _dummy.scale.setScalar(0);
    _dummy.updateMatrix();
    for (let i = 0; i < this.maxBubbles; i++) {
      this.bubbleInstMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.bubbleInstMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.bubbleInstMesh);
    this.disposables.push(bubbleGeo, bubbleMat);

    this.playerRig = createPlayerFishRig();
    this.playerRig.group.position.copy(this.playerPos);
    this.scene.add(this.playerRig.group);

    this.playerShadow = createContactShadowDisc();
    this.playerShadow.position.set(this.playerPos.x, 0.04, this.playerPos.z);
    this.scene.add(this.playerShadow);

    const qualInit = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQualInit = qualInit.id === 'very_low' || qualInit.id === 'low';
    this.eggMesh = createEggMesh(isLowQualInit, qualInit.extraPointLights);
    this.eggMesh.position.set(1.2, 3.2, 2.2);
    this.eggMesh.userData.interactable = {
      type: 'egg',
      label: t(this.gameSettings.language, 'labelEgg'),
    } satisfies InteractableMeta;
    this.scene.add(this.eggMesh);

    this.carriedEggRig = createEggMesh(true, false);
    this.carriedEggRig.scale.setScalar(0.52);
    this.carriedEggRig.visible = false;
    this.scene.add(this.carriedEggRig);

    this.babyHatchlingRig = createBabyHatchlingRig();
    this.babyHatchlingRig.group.visible = false;
    this.scene.add(this.babyHatchlingRig.group);

    this.squidRig = createSquidRig();
    this.squidRig.group.position.set(
      this.squid.position.x,
      this.squid.position.y,
      this.squid.position.z,
    );
    this.scene.add(this.squidRig.group);

    this.scene.add(this.ambientFishGroup);

    // Expanding Call Sonar Wave Ring
    const waveGeo = new THREE.RingGeometry(0.955, 1.0, 64);
    this.callWaveMat = new THREE.MeshBasicMaterial({
      color: '#5ef7e6',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.callWaveRing = new THREE.Mesh(waveGeo, this.callWaveMat);
    this.scene.add(this.callWaveRing);
    this.disposables.push(waveGeo, this.callWaveMat);

    // Double-click target beacon
    this.targetBeaconGroup = new THREE.Group();
    this.targetBeaconGroup.visible = false;
    const targetRingGeo = new THREE.RingGeometry(0.45, 0.62, 32);
    targetRingGeo.rotateX(-Math.PI / 2);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: '#5ef7e6',
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.targetBeaconRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    const targetCoreGeo = new THREE.OctahedronGeometry(0.22, 0);
    const targetCoreMat = new THREE.MeshBasicMaterial({
      color: '#99fff4',
      transparent: true,
      opacity: 0.9,
    });
    this.targetBeaconCore = new THREE.Mesh(targetCoreGeo, targetCoreMat);
    this.targetBeaconCore.position.y = 0.28;
    const targetBeamGeo = new THREE.CylinderGeometry(0.06, 0.24, 2.8, 12, 1, true);
    targetBeamGeo.translate(0, 1.4, 0);
    const targetBeamMat = new THREE.MeshBasicMaterial({
      color: '#5ef7e6',
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.targetBeaconBeam = new THREE.Mesh(targetBeamGeo, targetBeamMat);
    this.targetBeaconGroup.add(this.targetBeaconRing, this.targetBeaconCore, this.targetBeaconBeam);
    this.scene.add(this.targetBeaconGroup);
    this.disposables.push(
      targetRingGeo,
      targetRingMat,
      targetCoreGeo,
      targetCoreMat,
      targetBeamGeo,
      targetBeamMat,
    );

    // Interactive Title Screen Squid (library firefly-squid-glowing.glb + instant procedural fallback)
    this.titleSquidGroup = new THREE.Group();
    this.titleSquidFallbackRig = createSquidRig();
    this.titleSquidFallbackRig.group.scale.setScalar(0.46);
    this.titleSquidFallbackRig.group.rotation.set(0.18, Math.PI * 0.3, 0);
    this.titleSquidLight = new THREE.PointLight('#64fff7', 6.5, 16, 1.0);
    this.scene.add(this.titleSquidLight);

    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const hCtx = haloCanvas.getContext('2d');
    if (hCtx) {
      const grad = hCtx.createRadialGradient(64, 64, 0, 64, 64, 54);
      grad.addColorStop(0, 'rgba(32, 255, 244, 0.88)');
      grad.addColorStop(0.24, 'rgba(0, 238, 255, 0.62)');
      grad.addColorStop(0.52, 'rgba(122, 62, 255, 0.28)');
      grad.addColorStop(0.8, 'rgba(30, 125, 240, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      hCtx.fillStyle = grad;
      hCtx.fillRect(0, 0, 128, 128);
    }
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    haloTex.colorSpace = THREE.SRGBColorSpace;
    this.titleSquidHaloMat = new THREE.SpriteMaterial({
      map: haloTex,
      color: '#00ffe8',
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    });
    this.titleSquidHaloSprite = new THREE.Sprite(this.titleSquidHaloMat);
    this.titleSquidHaloSprite.scale.set(2.8, 2.8, 1);

    this.titleSquidCoreMat = new THREE.SpriteMaterial({
      map: haloTex,
      color: '#48fff4',
      transparent: true,
      opacity: 0.56,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    });
    this.titleSquidCoreSprite = new THREE.Sprite(this.titleSquidCoreMat);
    this.titleSquidCoreSprite.scale.set(1.4, 1.4, 1);
    this.disposables.push(haloTex, this.titleSquidHaloMat, this.titleSquidCoreMat);

    this.titleSquidGroup.add(
      this.titleSquidFallbackRig.group,
      this.titleSquidHaloSprite,
      this.titleSquidCoreSprite,
    );
    this.scene.add(this.titleSquidGroup);

    const inkGeo = new THREE.SphereGeometry(0.46, 16, 12);
    this.titleSquidInkMat = new THREE.MeshBasicMaterial({
      color: '#184b73',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.titleSquidInkMesh = new THREE.Mesh(inkGeo, this.titleSquidInkMat);
    this.titleSquidInkMesh.visible = false;
    this.scene.add(this.titleSquidInkMesh);
    this.disposables.push(inkGeo, this.titleSquidInkMat);

    this.scene.add(this.chapterGroup);

    void this.loadPersistentHeroAndSchool();
    void this.loadPersistentSquidPredator();
    void this.loadPersistentTitleSquid();
  }

  private clearChapterScene(): void {
    this.chapterGroup.clear();
    this.chapterDisposables.forEach((d) => d.dispose());
    this.chapterDisposables = [];
    this.clickTargetMeshes = [];
    this.interactiveObjects = [this.eggMesh];
    this.pearlMeshes.clear();
    this.coralMatrices = [];
    this.rockMatrices = [];
    this.coralContainer.clear();
    this.rockContainer.clear();

    this.mildredMixer = null;
    this.mildredRig = null;
    this.mildredUsingExternalModel = false;
    this.shrimpRig = null;
    this.borisRig = null;
    this.borisMixer = null;
    this.borisUsingExternalModel = false;
    this.pafnutiyRig = null;
    this.pafnutiyMixer = null;
    this.mugMesh = null;
    this.pelicanGateRig = null;
    this.whaleRig = null;
    this.hermitCrabRig = null;
    this.glafiraRig = null;
    this.glafiraMixer = null;
    this.glafiraUsingExternalModel = false;
    this.mantaRig = null;
    this.mantaMixer = null;
    this.ch3DebrisRig = null;
    this.scrapMeshes.clear();
    this.criticCrabsRig = null;
    this.ch4GateRig = null;
    this.whaleContainerMesh = null;
    this.queenAnglerRig = null;
    this.ventRigs = [];
    this.ch5LureMesh = null;
    this.ch5GateRig = null;
    this.ch6AltarRig = null;
    this.updraftRigs = [];
    this.youngWhaleRig = null;
    this.ch7GateRig = null;
    this.ch8SporeLanterns = [];
    this.ch8GateRig = null;
    this.keshaRig = null;
    this.ch9Searchlights = [];
    this.ch9GateRig = null;
    this.loreRelicMesh = null;
    this.secondaryLights = [];
    this.fireflySquidSchool = [];
    if (this.activePortalRig) {
      this.activePortalRig.dispose();
      this.activePortalRig = null;
    }
    this.isPortalHovered = false;
    this.hoveredInteractLabel = null;
  }

  private collectSecondaryLights(root: THREE.Object3D): void {
    root.traverse((obj) => {
      if (obj instanceof THREE.PointLight && obj.userData?.isSecondaryLight === true) {
        this.secondaryLights.push(obj);
      }
    });
  }

  private getLightingForChapter(chapterId: ChapterId): {
    spot: number;
    hemi: number;
    sun: number;
    rim: number;
    caustic: number;
    floorTint: number;
    ridgeTint: number;
  } {
    switch (chapterId) {
      case 1:
        return { spot: 62, hemi: 0.6, sun: 0.78, rim: 0.46, caustic: 0.135, floorTint: 0xffffff, ridgeTint: 0x153545 };
      case 2:
        return { spot: 48, hemi: 0.46, sun: 0.52, rim: 0.34, caustic: 0.045, floorTint: 0xb4cad6, ridgeTint: 0x102430 };
      case 3:
        return { spot: 44, hemi: 0.44, sun: 0.46, rim: 0.36, caustic: 0.055, floorTint: 0x8dbab0, ridgeTint: 0x0c2b26 };
      case 4:
        return { spot: 38, hemi: 0.38, sun: 0.36, rim: 0.34, caustic: 0.032, floorTint: 0x738e9c, ridgeTint: 0x0b1a28 };
      case 5:
        return { spot: 44, hemi: 0.42, sun: 0.34, rim: 0.42, caustic: 0.025, floorTint: 0x7a6263, ridgeTint: 0x1e151c };
      case 6:
        return { spot: 48, hemi: 0.40, sun: 0.30, rim: 0.48, caustic: 0.032, floorTint: 0x578796, ridgeTint: 0x0d2130 };
      case 7:
        return { spot: 40, hemi: 0.36, sun: 0.34, rim: 0.38, caustic: 0.03, floorTint: 0x5d7a8f, ridgeTint: 0x0e1d2e };
      case 8:
        return { spot: 46, hemi: 0.46, sun: 0.48, rim: 0.38, caustic: 0.05, floorTint: 0x7cb5a6, ridgeTint: 0x0c2b26 };
      case 9:
        return { spot: 50, hemi: 0.48, sun: 0.54, rim: 0.38, caustic: 0.06, floorTint: 0x9fc2d4, ridgeTint: 0x102636 };
      case 10:
        return { spot: 68, hemi: 0.66, sun: 0.88, rim: 0.5, caustic: 0.16, floorTint: 0xf0fcff, ridgeTint: 0x184254 };
    }
  }

  private buildChapterScene(chapterId: ChapterId): void {
    this.clearChapterScene();
    this.activeSceneChapter = chapterId;

    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const shadowsEnabled = qual.shadows && !this.isSoftwareGl;
    const cfg = CHAPTERS[chapterId];
    const lgt = this.getLightingForChapter(chapterId);

    this.scene.background = new THREE.Color(cfg.fogColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.set(cfg.fogColor);
      this.scene.fog.density = cfg.fogDensity;
    } else {
      this.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);
    }

    this.ambientLight.color.set(cfg.ambientColor);
    this.spotLight.color.set(cfg.spotColor);
    this.spotLight.intensity = lgt.spot;
    this.hemiLight.intensity = lgt.hemi;
    this.sunDirLight.intensity = lgt.sun;
    this.rimDirLight.intensity = lgt.rim;
    this.applyGodRaysForChapter(chapterId, qual.causticsEnabled);
    this.ambientFishGroup.visible = chapterId === 1 || chapterId === 10;

    // Sandy/silty seabed contoured per chapter + optional animated underwater sun caustics shader
    const [segX, segZ] = this.isSoftwareGl ? [28, 42] : qual.seabedSegments;
    const floorGeo = new THREE.PlaneGeometry(86, 158, segX, segZ);
    floorGeo.rotateX(-Math.PI / 2);
    const posAttr = floorGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i) - 40;
      posAttr.setZ(i, z);
      posAttr.setY(i, getChapterFloorHeight(chapterId, x, z));
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: lgt.floorTint,
      map: this.sandTex.map,
      normalMap: qual.id === 'very_low' ? null : this.sandTex.normalMap,
      normalScale: new THREE.Vector2(0.62, 0.62),
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: qual.envMapIntensity * 0.4,
    });
    this.causticStrengthUniform.value = qual.causticsEnabled ? lgt.caustic : 0;
    if (qual.causticsEnabled) {
      const causticTime = this.causticTimeUniform;
      const causticStrengthUni = this.causticStrengthUniform;
      floorMat.onBeforeCompile = (shader) => {
        shader.uniforms.uCausticTime = causticTime;
        shader.uniforms.uCausticStrength = causticStrengthUni;
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
            varying vec2 vCausticXZ;
            varying float vCausticUp;`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vec4 cWPos = modelMatrix * vec4(transformed, 1.0);
            vCausticXZ = cWPos.xz;
            vCausticUp = clamp(normal.y, 0.0, 1.0);`,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
            uniform float uCausticTime;
            uniform float uCausticStrength;
            varying vec2 vCausticXZ;
            varying float vCausticUp;`,
          )
          .replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            if (uCausticStrength > 0.001) {
              float floorMask = smoothstep(0.62, 0.92, vCausticUp) * smoothstep(22.0, 12.0, abs(vCausticXZ.x));
              vec2 p1 = vCausticXZ * 0.34;
              vec2 p2 = vec2(p1.x * 0.82 - p1.y * 0.57, p1.x * 0.57 + p1.y * 0.82) * 1.18;
              float a = sin(p1.x * 2.1 + uCausticTime * 0.72 + sin(p1.y * 1.8 - uCausticTime * 0.55));
              float b = cos(p1.y * 2.4 - uCausticTime * 0.64 + cos(p1.x * 1.9 + uCausticTime * 0.48));
              float c = sin(p2.x * 2.6 + uCausticTime * 0.58 - cos(p2.y * 2.2 + uCausticTime * 0.42));
              float ridge1 = 1.0 - smoothstep(0.0, 0.45, abs(a + b * 0.7));
              float ridge2 = 1.0 - smoothstep(0.0, 0.42, abs(c - a * 0.6));
              float cNet = pow(clamp(ridge1 * 0.6 + ridge2 * 0.55, 0.0, 1.0), 2.8);
              vec3 cTint = mix(vec3(0.18, 0.75, 0.88), vec3(0.45, 0.92, 0.96), clamp(ridge2, 0.0, 1.0));
              totalEmissiveRadiance += cTint * cNet * floorMask * uCausticStrength;
            }`,
          );
      };
      floorMat.customProgramCacheKey = () => `seabed-caustics-v3-ch${chapterId}`;
    } else {
      floorMat.customProgramCacheKey = () => `seabed-flat-v3-ch${chapterId}`;
    }

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = shadowsEnabled;
    floorMesh.castShadow = false;
    floorMesh.matrixAutoUpdate = false;
    floorMesh.updateMatrix();
    this.chapterGroup.add(floorMesh);
    this.clickTargetMeshes.push(floorMesh);
    this.chapterDisposables.push(floorGeo, floorMat);

    this.buildHorizonSilhouettes(chapterId, lgt.ridgeTint);

    const natureField = buildNatureField({
      chapterId,
      densityScale: qual.foliageDensity,
      isSoftwareGl: this.isSoftwareGl,
      seagrassTimeUniform: this.seagrassTimeUniform,
      coralMap: this.coralTex.map,
      coralBumpMap: isLowQual ? undefined : this.coralTex.bumpMap,
      shadowsEnabled,
      envMapIntensity: qual.envMapIntensity * 0.4,
    });
    this.chapterGroup.add(natureField.group);
    this.chapterDisposables.push(...natureField.disposables);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    switch (chapterId) {
      case 10:
        this.buildChapter10Props();
        break;
      case 9:
        this.buildChapter9Props();
        break;
      case 8:
        this.buildChapter8Props();
        break;
      case 7:
        this.buildChapter7Props();
        break;
      case 6:
        this.buildChapter6Props();
        break;
      case 5:
        this.buildChapter5Props();
        break;
      case 4:
        this.buildChapter4Props();
        break;
      case 3:
        this.buildChapter3Props();
        break;
      case 2:
        this.buildChapter2Props();
        break;
      default:
        this.buildChapter1Props(maxAniso);
        break;
    }

    this.spawnChapterLoreRelic(chapterId, isLowQual, qual.extraPointLights);

    this.collectSecondaryLights(this.chapterGroup);
    if (this.eggMesh) {
      this.collectSecondaryLights(this.eggMesh);
    }

    // Pass 1 Performance: skip synchronous full-scene shader compile on low-end presets
    if (!this.isSoftwareGl && !isLowQual) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private applyGodRaysForChapter(chapterId: ChapterId, causticsEnabled: boolean): void {
    if (!this.godRays) return;
    const enabledChapters =
      chapterId === 1 ||
      chapterId === 2 ||
      chapterId === 3 ||
      chapterId === 8 ||
      chapterId === 9 ||
      chapterId === 10;
    this.godRays.visible = enabledChapters && causticsEnabled;
    if (!enabledChapters || !this.godRayMat) return;
    const colorMap: Partial<Record<ChapterId, [string, number]>> = {
      1: ['#6ee2ff', 1.0],
      2: ['#4896b8', 0.55],
      3: ['#56c4a4', 0.65],
      8: ['#66d8b4', 0.72],
      9: ['#7ac4e6', 0.78],
      10: ['#ffe89e', 1.15],
    };
    const pair = colorMap[chapterId] ?? ['#6ee2ff', 0.8];
    this.godRayMat.uniforms.uColor?.value.set(pair[0]);
    if (this.godRayMat.uniforms.uIntensity) {
      this.godRayMat.uniforms.uIntensity.value = pair[1];
    }
  }

  private spawnChapterLoreRelic(
    chapterId: ChapterId,
    isLowQual: boolean,
    extraPointLights: boolean,
  ): void {
    const relic = CHAPTER_LORE_RELICS[chapterId];
    if (!relic) return;
    const rig = createLoreRelicRig(relic.tintHex, isLowQual, extraPointLights);
    const y = getChapterFloorHeight(chapterId, relic.x, relic.z) + relic.yOffset;
    rig.position.set(relic.x, y, relic.z);
    rig.visible = !this.campaign.collectedRelicIds.includes(relic.id);
    rig.userData.interactable = {
      type: 'lore_relic',
      id: relic.id,
      label: t(this.gameSettings.language, 'labelLoreRelic'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(rig);
    this.interactiveObjects.push(rig);
    this.loreRelicMesh = rig;
    rig.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        this.chapterDisposables.push(m.geometry);
        if (Array.isArray(m.material)) {
          this.chapterDisposables.push(...m.material);
        } else {
          this.chapterDisposables.push(m.material);
        }
      }
    });
  }

  /**
   * Distant perimeter rock canyon monoliths & abyssal ridges that dissolve naturally
   * into the exponential fog so technical world edges never show.
   */
  private buildHorizonSilhouettes(chapterId: ChapterId, ridgeColorHex: number): void {
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const baseCount = this.isSoftwareGl ? 16 : 34;
    const count = Math.max(10, Math.round(baseCount * Math.min(1, qual.foliageDensity + 0.2)));
    const ridgeGeo = new THREE.DodecahedronGeometry(3.8, qual.id === 'very_low' ? 0 : 1);
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: ridgeColorHex,
      map: this.coralTex.map,
      bumpMap: qual.id === 'very_low' ? null : this.coralTex.bumpMap,
      bumpScale: 0.7,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const inst = new THREE.InstancedMesh(ridgeGeo, ridgeMat, count);
    inst.receiveShadow = qual.shadows && !this.isSoftwareGl;

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const isFarBack = i >= count - 4;
      const x = isFarBack
        ? (i - (count - 2.5)) * 12
        : side * (22 + ((i * 19) % 11));
      const z = isFarBack ? -102 - (i % 3) * 4 : 14 - i * 3.8;
      const y = getChapterFloorHeight(chapterId, Math.max(-16, Math.min(16, x)), Math.max(-92, z)) - 1.5;

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(
        (((i * 7) % 10) - 5) * 0.04,
        ((i * 43) % 360) * (Math.PI / 180),
        (((i * 11) % 10) - 5) * 0.04,
      );
      const sx = 1.3 + ((i * 23) % 10) * 0.14;
      const sy = 1.9 + ((i * 17) % 10) * 0.24;
      _dummy.scale.set(sx, sy, sx * 1.15);
      _dummy.updateMatrix();
      inst.setMatrixAt(i, _dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.matrixAutoUpdate = false;
    inst.updateMatrix();
    this.chapterGroup.add(inst);
    this.chapterDisposables.push(ridgeGeo, ridgeMat);
  }

  private buildChapter1Props(maxAniso: number): void {
    this.activeShelters = CHAPTER_1_SHELTERS;
    this.activePearls = CHAPTER_1_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const shadowsEnabled = qual.shadows && !this.isSoftwareGl;

    const coralMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.coralTex.map,
      bumpMap: qual.id === 'very_low' ? null : this.coralTex.bumpMap,
      bumpScale: 0.65,
      roughness: 0.85,
      metalness: 0.0,
      envMapIntensity: qual.envMapIntensity * 0.25,
      emissiveIntensity: 0,
    });

    // Variety A: Porous muted dark plum / underwater coral pillars
    const coralBase = this.isSoftwareGl ? 36 : 92;
    const coralCount = Math.max(10, Math.round(coralBase * qual.foliageDensity));
    const stalkGeo = new THREE.CylinderGeometry(0.14, 0.36, 2.3, qual.id === 'very_low' ? 6 : 10, 1);
    stalkGeo.translate(0, 1.0, 0);
    const coralInst = new THREE.InstancedMesh(stalkGeo, coralMat, coralCount);
    coralInst.castShadow = shadowsEnabled;
    coralInst.receiveShadow = shadowsEnabled;

    const coralPalette = [
      '#4f2839',
      '#422540',
      '#38223b',
      '#572d40',
      '#45283d',
      '#492a43',
    ];

    for (let i = 0; i < coralCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const laneRand = ((i * 37.7) % 100) / 100;
      let x = side * (7.2 + laneRand * 15.5);
      const z = 12 - ((i * 23.1) % 102);
      if (z > -2 && x < 2) {
        x = 7.5 + laneRand * 10;
      }
      const y = getChapterFloorHeight(1, x, z) - 0.25;

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(
        (((i * 13) % 10) - 5) * 0.06,
        ((i * 47) % 360) * (Math.PI / 180),
        (((i * 19) % 10) - 5) * 0.06,
      );
      const s = 0.7 + (((i * 29) % 100) / 100) * 1.05;
      _dummy.scale.set(s, s * (0.75 + ((i * 7) % 5) * 0.22), s);
      _dummy.updateMatrix();
      coralInst.setMatrixAt(i, _dummy.matrix);
      this.coralMatrices.push(_dummy.matrix.clone());

      _color.set(coralPalette[i % coralPalette.length]);
      coralInst.setColorAt(i, _color);
    }
    coralInst.instanceMatrix.needsUpdate = true;
    if (coralInst.instanceColor) coralInst.instanceColor.needsUpdate = true;
    coralInst.frustumCulled = true;
    coralInst.computeBoundingSphere();
    coralInst.matrixAutoUpdate = false;
    coralInst.updateMatrix();
    this.coralContainer.add(coralInst);
    this.chapterGroup.add(this.coralContainer);

    // Variety B: Eroded vertex-colored reef boulders
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 28 : 58) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.15, qual.id === 'very_low' ? 1 : 2);
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: this.coralTex.map,
      bumpMap: qual.id === 'very_low' ? null : this.coralTex.bumpMap,
      bumpScale: 0.65,
      roughness: 0.86,
      metalness: 0.03,
      envMapIntensity: qual.envMapIntensity * 0.35,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, boulderMat, rockCount);
    rockInst.castShadow = shadowsEnabled;
    rockInst.receiveShadow = shadowsEnabled;

    const rockPalette = ['#5c7f8f', '#6d8f9c', '#7c939b', '#4d6f80', '#7c8f96'];
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 53.3) % 100) / 100;
      let x = side * (6.0 + laneRand * 17.0);
      const z = 12 - ((i * 31.7) % 104);
      if (z > -3 && x < 2.5) x = 6.5 + laneRand * 11;
      const y = getChapterFloorHeight(1, x, z) - 0.52;

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(
        (((i * 17) % 10) - 5) * 0.03,
        ((i * 41) % 360) * (Math.PI / 180),
        (((i * 13) % 10) - 5) * 0.03,
      );
      const sx = 0.85 + (((i * 19) % 100) / 100) * 1.1;
      const sy = 0.55 + (((i * 23) % 100) / 100) * 0.65;
      _dummy.scale.set(sx, sy, sx * 0.9);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
      this.rockMatrices.push(_dummy.matrix.clone());

      _color.set(rockPalette[i % rockPalette.length]);
      rockInst.setColorAt(i, _color);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
    rockInst.frustumCulled = true;
    rockInst.computeBoundingSphere();
    rockInst.matrixAutoUpdate = false;
    rockInst.updateMatrix();
    this.rockContainer.add(rockInst);
    this.chapterGroup.add(this.rockContainer);
    this.clickTargetMeshes.push(this.coralContainer, this.rockContainer);

    this.chapterDisposables.push(stalkGeo, rockGeo, coralMat, boulderMat);

    const qual1 = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual1 = qual1.id === 'very_low' || qual1.id === 'low';

    // Coral Shelters
    for (const shelter of CHAPTER_1_SHELTERS) {
      const rig = createCoralShelterRig(this.coralTex, qual1.extraPointLights);
      const floorY = getChapterFloorHeight(1, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.5, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(this.gameSettings.language, 'labelCoralShelter'),
        targetPos: { x: shelter.x, y: floorY + 1.15, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(1);

    // Collectible Pearls
    for (const p of CHAPTER_1_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual1, qual1.extraPointLights);
      const floorY = getChapterFloorHeight(1, p.x, p.z);
      const pearlY = Math.max(p.y, floorY + 0.65);
      rig.position.set(p.x, pearlY, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(this.gameSettings.language, 'labelPearl'),
        targetPos: { x: p.x, y: Math.max(pearlY, floorY + 1.05), z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    this.buildTrawlerNetBarricade(maxAniso);

    // Abyssal Crevice Bioluminescent Dew/Spore Sanctuary (End of Chapter 1 — zero flat rings)
    const portalFloorY = getChapterFloorHeight(1, 0, -86);
    const crevicePortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#26e8d4',
      sporeAccentColor: '#99fff4',
      scale: 1.25,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual1,
      allowTransmission: !this.isSoftwareGl && !isLowQual1,
      extraPointLights: qual1.extraPointLights,
    });
    crevicePortal.group.position.set(0, portalFloorY + 0.65, -86);
    crevicePortal.group.userData.interactable = {
      type: 'egg',
      label: t(this.gameSettings.language, 'labelCrevicePortal'),
      targetPos: { x: 0, y: portalFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(crevicePortal.group);
    this.interactiveObjects.push(crevicePortal.group);
    this.activePortalRig = crevicePortal;

    // Chapter 1 NPCs: Mildred & Shrimps
    const ch1Npcs = createChapter1NPCs();
    if (this.campaign.chapter === 1) {
      this.npcs = ch1Npcs;
    }
    this.mildredRig = createMildredRig(this.isSoftwareGl, isLowQual1, qual1.extraPointLights);
    const mildredData = ch1Npcs[0];
    this.mildredRig.group.position.set(
      mildredData.position.x,
      mildredData.position.y,
      mildredData.position.z,
    );
    this.mildredRig.group.userData.interactable = {
      type: 'npc',
      id: 'mildred',
      label: t(this.gameSettings.language, 'npcMildredName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.mildredRig.group);
    this.interactiveObjects.push(this.mildredRig.group);

    this.shrimpRig = createShrimpFlockRig();
    const shrimpData = ch1Npcs[1];
    this.shrimpRig.position.set(
      shrimpData.position.x,
      shrimpData.position.y,
      shrimpData.position.z,
    );
    this.shrimpRig.userData.interactable = {
      type: 'npc',
      id: 'panic_shrimps',
      label: t(this.gameSettings.language, 'npcShrimpsName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.shrimpRig);
    this.interactiveObjects.push(this.shrimpRig);

    void this.applyChapterExternalModels(1);
  }

  private buildChapter2Props(): void {
    this.activeShelters = CHAPTER_2_SHELTERS;
    this.activePearls = CHAPTER_2_PEARLS;
    const qual2 = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual2 = qual2.id === 'very_low' || qual2.id === 'low';

    // 1. Sunken Liner Architecture (rusting ribs, porthole plates, galley counter)
    const linerSet = createSunkenLinerSet(
      this.rustedHullTex,
      this.weatheredWoodTex,
      isLowQual2,
      qual2.extraPointLights,
    );
    this.chapterGroup.add(linerSet);
    this.clickTargetMeshes.push(linerSet);

    // 2. Cargo Crate Hideout Shelters (wood/iron sanctuary cages)
    for (const shelter of CHAPTER_2_SHELTERS) {
      const rig = createCargoCrateShelterRig(
        this.weatheredWoodTex,
        this.rustedHullTex,
        qual2.extraPointLights,
      );
      const floorY = getChapterFloorHeight(2, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 1.0, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(this.gameSettings.language, 'labelCrateShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(2);

    // 3. Collectible Pearls for Chapter 2
    for (const p of CHAPTER_2_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual2, qual2.extraPointLights);
      const floorY = getChapterFloorHeight(2, p.x, p.z);
      const pearlY = Math.max(p.y, floorY + 0.7);
      rig.position.set(p.x, pearlY, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(this.gameSettings.language, 'labelPearl'),
        targetPos: { x: p.x, y: Math.max(pearlY, floorY + 1.1), z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Pelican Gate Cargo Bulkhead + Hatch Lever at z = -62
    const gateFloorY = getChapterFloorHeight(2, 0, CHAPTER_2_PELICAN_GATE_Z);
    this.pelicanGateRig = createPelicanGateRig(
      this.rustedHullTex,
      isLowQual2,
      qual2.extraPointLights,
    );
    this.pelicanGateRig.group.position.set(
      0,
      gateFloorY + 1.8,
      CHAPTER_2_PELICAN_GATE_Z,
    );
    this.pelicanGateRig.leverGroup.userData.interactable = {
      type: 'gate_lever',
      label: t(this.gameSettings.language, 'labelGateLever'),
      targetPos: {
        x: CHAPTER_2_PELICAN_LEVER_POS.x,
        y: gateFloorY + 1.2,
        z: CHAPTER_2_PELICAN_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.pelicanGateRig.group);
    this.interactiveObjects.push(this.pelicanGateRig.leverGroup);

    // 5. Boris's Glowing Lamp Mug in the sunken galley (if quest not already done)
    this.mugMesh = createGlowingMugRig(isLowQual2, qual2.extraPointLights);
    this.mugMesh.position.set(
      CHAPTER_2_BORIS_MUG_POS.x,
      CHAPTER_2_BORIS_MUG_POS.y,
      CHAPTER_2_BORIS_MUG_POS.z,
    );
    this.mugMesh.visible = !this.campaign.quests.borisMug && !this.borisMugCarried;
    this.mugMesh.userData.interactable = {
      type: 'mug',
      label: t(this.gameSettings.language, 'labelBorisMug'),
      targetPos: {
        x: CHAPTER_2_BORIS_MUG_POS.x,
        y: CHAPTER_2_BORIS_MUG_POS.y + 0.5,
        z: CHAPTER_2_BORIS_MUG_POS.z,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.mugMesh);
    this.interactiveObjects.push(this.mugMesh);

    // 6. Chapter 2 NPCs: Octopus Boris & Pufferfish Pafnutiy
    const ch2Npcs = createChapter2NPCs();
    this.borisRig = createBorisRig(isLowQual2, qual2.extraPointLights);
    const borisData = ch2Npcs[0];
    this.borisRig.group.position.set(
      borisData.position.x,
      borisData.position.y,
      borisData.position.z,
    );
    this.borisRig.group.userData.interactable = {
      type: 'npc',
      id: 'boris',
      label: t(this.gameSettings.language, 'npcBorisName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.borisRig.group);
    this.interactiveObjects.push(this.borisRig.group);

    this.pafnutiyRig = createPafnutiyRig(isLowQual2, qual2.extraPointLights);
    const pafData = ch2Npcs[1];
    this.pafnutiyRig.group.position.set(
      pafData.position.x,
      pafData.position.y,
      pafData.position.z,
    );
    this.pafnutiyRig.group.userData.interactable = {
      type: 'npc',
      id: 'pafnutiy',
      label: t(this.gameSettings.language, 'npcPafnutiyName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.pafnutiyRig.group);
    this.interactiveObjects.push(this.pafnutiyRig.group);

    // 7. Distant Singing Whale Silhouette gliding high above the sunken liner
    this.whaleRig = createWhaleSilhouetteRig(isLowQual2);
    this.whaleRig.position.set(16, 15, -52);
    this.whaleRig.rotation.y = -Math.PI * 0.42;
    this.chapterGroup.add(this.whaleRig);

    // 8. Kelp-Trench Bioluminescent Dew/Spore Sanctuary (End of Chapter 2 — zero flat rings)
    const exitFloorY = getChapterFloorHeight(2, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#36e8c8',
      sporeAccentColor: '#a6fff0',
      scale: 1.3,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual2,
      allowTransmission: !this.isSoftwareGl && !isLowQual2,
      extraPointLights: qual2.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(this.gameSettings.language, 'labelKelpPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(2);
  }

  private buildChapter3Props(): void {
    this.activeShelters = CHAPTER_3_SHELTERS;
    this.activePearls = CHAPTER_3_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];

    // 1. Kelp Canyon Boulders along flanks
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 24 : 46) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.2, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3b6156,
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.02,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 47.1) % 100) / 100;
      const x = side * (6.5 + laneRand * 15.0);
      const z = 10 - ((i * 27.3) % 98);
      const y = getChapterFloorHeight(3, x, z) - 0.5;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 53) % 360) * (Math.PI / 180), 0);
      const sx = 0.9 + ((i * 19) % 100) / 100 * 1.1;
      const sy = 0.6 + ((i * 23) % 100) / 100 * 0.7;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Kelp Root Canopy Refuge Shelters
    for (const shelter of CHAPTER_3_SHELTERS) {
      const rig = createKelpShelterRig();
      const floorY = getChapterFloorHeight(3, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.7, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(this.gameSettings.language, 'labelKelpShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(3);

    // 3. Collectible Pearls for Chapter 3
    const isLowQual3 = qual.id === 'very_low' || qual.id === 'low';
    for (const p of CHAPTER_3_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual3, qual.extraPointLights);
      const floorY = getChapterFloorHeight(3, p.x, p.z);
      const pearlY = floorY + 0.42;
      rig.position.set(p.x, pearlY, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(this.gameSettings.language, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.05, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Organic Luminous Nautilus Shells (3 quest collectibles for Hermit Crabs)
    for (const s of CHAPTER_3_SCRAPS) {
      const rig = createDebrisScrapRig(isLowQual3, qual.extraPointLights);
      const floorY = getChapterFloorHeight(3, s.x, s.z);
      const scrapY = floorY + 1.15;
      rig.position.set(s.x, scrapY, s.z);
      rig.visible = !this.collectedScrapIds.includes(s.id) && !this.campaign.quests.crabDebris;
      rig.userData.interactable = {
        type: 'scrap',
        id: s.id,
        label: t(this.gameSettings.language, 'labelScrapShard'),
        targetPos: { x: s.x, y: scrapY, z: s.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.scrapMeshes.set(s.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 5. Crab Outpost Crane & Rubble Barricade at z = -62
    const gateFloorY = getChapterFloorHeight(3, 0, CHAPTER_3_DEBRIS_GATE_Z);
    this.ch3DebrisRig = createKelpDebrisBarricadeRig(
      this.rustedHullTex,
      this.weatheredWoodTex,
      qual.extraPointLights,
    );
    this.ch3DebrisRig.group.position.set(
      0,
      gateFloorY + 1.8,
      CHAPTER_3_DEBRIS_GATE_Z,
    );
    this.ch3DebrisRig.leverLight.visible = qual.extraPointLights;
    this.ch3DebrisRig.leverGroup.userData.interactable = {
      type: 'crane_lever',
      label: t(this.gameSettings.language, 'labelCraneLever'),
      targetPos: {
        x: CHAPTER_3_CRANE_LEVER_POS.x,
        y: gateFloorY + 1.2,
        z: CHAPTER_3_DEBRIS_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch3DebrisRig.group);
    this.interactiveObjects.push(this.ch3DebrisRig.leverGroup);

    // 6. Chapter 3 NPCs: Hermit Crab Guard & Turtle Glafira
    const ch3Npcs = createChapter3NPCs();
    this.hermitCrabRig = createHermitCrabSquadRig(qual.extraPointLights);
    const crabsData = ch3Npcs[0];
    this.hermitCrabRig.group.position.set(
      crabsData.position.x,
      crabsData.position.y,
      crabsData.position.z,
    );
    this.hermitCrabRig.beaconLight.visible = qual.extraPointLights;
    this.hermitCrabRig.group.userData.interactable = {
      type: 'npc',
      id: 'hermit_crabs',
      label: t(this.gameSettings.language, 'npcHermitCrabsName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.hermitCrabRig.group);
    this.interactiveObjects.push(this.hermitCrabRig.group);

    this.glafiraRig = createGlafiraTurtleRig();
    const glafiraData = ch3Npcs[1];
    this.glafiraRig.group.position.set(
      glafiraData.position.x,
      glafiraData.position.y,
      glafiraData.position.z,
    );
    this.glafiraRig.group.userData.interactable = {
      type: 'npc',
      id: 'glafira',
      label: t(this.gameSettings.language, 'npcGlafiraName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.glafiraRig.group);
    this.interactiveObjects.push(this.glafiraRig.group);

    // 7. Distant Manta Ray gliding smoothly through upper kelp canopy
    this.mantaRig = createMantaFallbackRig();
    this.mantaRig.position.set(-10, 9.5, -48);
    this.chapterGroup.add(this.mantaRig);

    // 8. Leviathan Graveyard Bioluminescent Portal (End of Chapter 3)
    const exitFloorY = getChapterFloorHeight(3, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#20f0b4',
      sporeAccentColor: '#9cffde',
      scale: 1.32,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual3,
      allowTransmission: !this.isSoftwareGl && !isLowQual3,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(this.gameSettings.language, 'labelGraveyardPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(3);
  }

  private buildChapter4Props(): void {
    this.activeShelters = CHAPTER_4_SHELTERS;
    this.activePearls = CHAPTER_4_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';

    // 1. Deep-trench basalt & bone canyon boulders along flanks
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 20 : 42) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.25, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3b4d5c,
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.03,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 51.3) % 100) / 100;
      const x = side * (6.6 + laneRand * 15.0);
      const z = 10 - ((i * 29.1) % 98);
      const y = getChapterFloorHeight(4, x, z) - 0.55;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 61) % 360) * (Math.PI / 180), 0);
      const sx = 0.95 + ((i * 17) % 100) / 100 * 1.15;
      const sy = 0.65 + ((i * 23) % 100) / 100 * 0.75;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Colossal Leviathan Whale Ribcages & Sunken Sperm Whale Skull
    const skeletonSet = createLeviathanSkeletonSet(isLowQual);
    this.chapterGroup.add(skeletonSet);
    this.clickTargetMeshes.push(skeletonSet);

    // 3. Hollow Whale-Vertebra Bone Sanctuary Shelters
    for (const shelter of CHAPTER_4_SHELTERS) {
      const rig = createBoneShelterRig(isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(4, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.7, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(this.gameSettings.language, 'labelVertebraShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(4);

    // 4. Collectible Pearls for Chapter 4
    for (const p of CHAPTER_4_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(4, p.x, p.z);
      const pearlY = floorY + 0.45;
      rig.position.set(p.x, pearlY, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(this.gameSettings.language, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.1, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 5. Whale Resonance Container near the Sperm Whale Skull
    this.whaleContainerMesh = createWhaleContainerRig(isLowQual, qual.extraPointLights);
    this.whaleContainerMesh.position.set(
      CHAPTER_4_WHALE_CONTAINER_POS.x,
      CHAPTER_4_WHALE_CONTAINER_POS.y,
      CHAPTER_4_WHALE_CONTAINER_POS.z,
    );
    this.whaleContainerMesh.visible =
      !this.campaign.quests.whaleContainer && !this.whaleContainerCarried;
    this.whaleContainerMesh.userData.interactable = {
      type: 'whale_container',
      label: t(this.gameSettings.language, 'labelWhaleContainer'),
      targetPos: {
        x: CHAPTER_4_WHALE_CONTAINER_POS.x,
        y: CHAPTER_4_WHALE_CONTAINER_POS.y + 0.4,
        z: CHAPTER_4_WHALE_CONTAINER_POS.z,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.whaleContainerMesh);
    this.interactiveObjects.push(this.whaleContainerMesh);

    // 6. Charybdis Crane & Bone-Sluice Gate at z = -62
    const gateFloorY = getChapterFloorHeight(4, 0, CHAPTER_4_CHARYBDIS_GATE_Z);
    this.ch4GateRig = createCharybdisGateRig(
      this.rustedHullTex,
      this.weatheredWoodTex,
      qual.extraPointLights,
    );
    this.ch4GateRig.group.position.set(
      0,
      gateFloorY + 1.8,
      CHAPTER_4_CHARYBDIS_GATE_Z,
    );
    this.ch4GateRig.leverGroup.userData.interactable = {
      type: 'charybdis_lever',
      label: t(this.gameSettings.language, 'labelCharybdisLever'),
      targetPos: {
        x: CHAPTER_4_CHARYBDIS_LEVER_POS.x,
        y: gateFloorY + 1.25,
        z: CHAPTER_4_CHARYBDIS_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch4GateRig.group);
    this.interactiveObjects.push(this.ch4GateRig.leverGroup);

    // 7. Chapter 4 NPCs: Critic Crabs & Turtle Glafira
    const ch4Npcs = createChapter4NPCs();
    this.criticCrabsRig = createCriticCrabsRig(qual.extraPointLights);
    const criticsData = ch4Npcs[0];
    this.criticCrabsRig.group.position.set(
      criticsData.position.x,
      criticsData.position.y,
      criticsData.position.z,
    );
    this.criticCrabsRig.group.userData.interactable = {
      type: 'npc',
      id: 'critic_crabs',
      label: t(this.gameSettings.language, 'npcCriticCrabsName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.criticCrabsRig.group);
    this.interactiveObjects.push(this.criticCrabsRig.group);

    this.glafiraRig = createGlafiraTurtleRig();
    const glafiraData = ch4Npcs[1];
    this.glafiraRig.group.position.set(
      glafiraData.position.x,
      glafiraData.position.y,
      glafiraData.position.z,
    );
    this.glafiraRig.group.userData.interactable = {
      type: 'npc',
      id: 'glafira',
      label: t(this.gameSettings.language, 'npcGlafiraName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.glafiraRig.group);
    this.interactiveObjects.push(this.glafiraRig.group);

    // 8. Distant Manta Ray gliding high over the bone valley
    this.mantaRig = createMantaFallbackRig();
    this.mantaRig.position.set(-11, 9.8, -46);
    this.chapterGroup.add(this.mantaRig);

    // 9. Hydrothermal Vents Bioluminescent Portal (End of Chapter 4)
    const exitFloorY = getChapterFloorHeight(4, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#36f5e0',
      sporeAccentColor: '#b0fffa',
      scale: 1.35,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(this.gameSettings.language, 'labelVentPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(4);
  }

  private buildChapter5Props(): void {
    this.activeShelters = CHAPTER_5_SHELTERS;
    this.activePearls = CHAPTER_5_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const lang = this.gameSettings.language;

    // 1. Volcanic basalt trench boulders along flanks
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 20 : 40) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.3, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x2c2026,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.08,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 49.7) % 100) / 100;
      const x = side * (6.8 + laneRand * 15.0);
      const z = 10 - ((i * 28.3) % 98);
      const y = getChapterFloorHeight(5, x, z) - 0.55;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 61) % 360) * (Math.PI / 180), 0);
      const sx = 1.0 + ((i * 19) % 100) / 100 * 1.15;
      const sy = 0.7 + ((i * 23) % 100) / 100 * 0.85;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Basalt Arch Shelters
    for (const shelter of CHAPTER_5_SHELTERS) {
      const rig = createBoneShelterRig(isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(5, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.7, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelVertebraShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(5);

    // 3. Collectible Pearls
    for (const p of CHAPTER_5_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(5, p.x, p.z);
      rig.position.set(p.x, floorY + 0.5, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.15, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Black Smoker Hydrothermal Chimneys
    for (const vent of CHAPTER_5_THERMAL_VENTS) {
      const ventRig = createBlackSmokerVentRig(isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(5, vent.x, vent.z);
      ventRig.group.position.set(vent.x, floorY - 0.35, vent.z);
      this.chapterGroup.add(ventRig.group);
      this.clickTargetMeshes.push(ventRig.group);
      this.ventRigs.push(ventRig);
    }

    // 5. Deep Luminary Pearl Pickup for Queen Anglerfish
    this.ch5LureMesh = createLurePearlPickupRig(isLowQual, qual.extraPointLights);
    const lureFloorY = getChapterFloorHeight(5, CHAPTER_5_LURE_POS.x, CHAPTER_5_LURE_POS.z);
    this.ch5LureMesh.position.set(
      CHAPTER_5_LURE_POS.x,
      lureFloorY + 0.55,
      CHAPTER_5_LURE_POS.z,
    );
    this.ch5LureMesh.visible = !this.campaign.quests.queenEscort && !this.ch5LureCarried;
    this.ch5LureMesh.userData.interactable = {
      type: 'lure_pearl',
      label: t(lang, 'labelLuminaryPearl'),
      targetPos: {
        x: CHAPTER_5_LURE_POS.x,
        y: lureFloorY + 1.15,
        z: CHAPTER_5_LURE_POS.z,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch5LureMesh);
    this.interactiveObjects.push(this.ch5LureMesh);

    // 6. Thermal Sluice Gate at z = -62
    const gateFloorY = getChapterFloorHeight(5, 0, CHAPTER_5_GATE_Z);
    this.ch5GateRig = createAbyssalGateRig(
      0x3b262d,
      '#ff8e52',
      this.rustedHullTex,
      new THREE.Vector3(CHAPTER_5_GATE_LEVER_POS.x, -1.6, 2.8),
      qual.extraPointLights,
    );
    this.ch5GateRig.group.position.set(0, gateFloorY + 1.8, CHAPTER_5_GATE_Z);
    this.ch5GateRig.leverGroup.userData.interactable = {
      type: 'ch5_lever',
      label: t(lang, 'labelVentGateLever'),
      targetPos: {
        x: CHAPTER_5_GATE_LEVER_POS.x,
        y: gateFloorY + 1.25,
        z: CHAPTER_5_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch5GateRig.group);
    this.interactiveObjects.push(this.ch5GateRig.leverGroup);

    // 7. NPCs: Queen Anglerfish & Critic Crabs
    const ch5Npcs = createChapter5NPCs();
    this.queenAnglerRig = createQueenAnglerRig(isLowQual, qual.extraPointLights);
    const queenData = ch5Npcs[0];
    this.queenAnglerRig.group.position.set(
      queenData.position.x,
      queenData.position.y,
      queenData.position.z,
    );
    this.queenAnglerRig.group.userData.interactable = {
      type: 'npc',
      id: 'queen_angler',
      label: t(lang, 'npcQueenName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.queenAnglerRig.group);
    this.interactiveObjects.push(this.queenAnglerRig.group);

    this.criticCrabsRig = createCriticCrabsRig(qual.extraPointLights);
    const crabsData = ch5Npcs[1];
    this.criticCrabsRig.group.position.set(
      crabsData.position.x,
      crabsData.position.y,
      crabsData.position.z,
    );
    this.criticCrabsRig.group.userData.interactable = {
      type: 'npc',
      id: 'critic_crabs',
      label: t(lang, 'npcCriticCrabsName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.criticCrabsRig.group);
    this.interactiveObjects.push(this.criticCrabsRig.group);

    // 8. Turquoise Heart Rift Portal
    const exitFloorY = getChapterFloorHeight(5, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#26e8d4',
      sporeAccentColor: '#9effef',
      scale: 1.38,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelHeartPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(5);
  }

  private buildChapter6Props(): void {
    this.activeShelters = CHAPTER_6_SHELTERS;
    this.activePearls = CHAPTER_6_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const lang = this.gameSettings.language;

    // 1. Abyssal trench crystal boulders
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 18 : 36) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.35, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x1a2e3d,
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.08,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 53.1) % 100) / 100;
      const x = side * (7.0 + laneRand * 15.0);
      const z = 10 - ((i * 27.9) % 98);
      const y = getChapterFloorHeight(6, x, z) - 0.55;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 61) % 360) * (Math.PI / 180), 0);
      const sx = 1.0 + ((i * 17) % 100) / 100 * 1.15;
      const sy = 0.7 + ((i * 23) % 100) / 100 * 0.85;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Crystal Canopy Shelters
    for (const shelter of CHAPTER_6_SHELTERS) {
      const rig = createCoralShelterRig(this.coralTex, qual.extraPointLights);
      const floorY = getChapterFloorHeight(6, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.55, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelCoralShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(6);

    // 3. Collectible Pearls
    for (const p of CHAPTER_6_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(6, p.x, p.z);
      rig.position.set(p.x, floorY + 0.5, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.15, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Abyssal Heart Egg Altar at center (-48)
    const altarFloorY = getChapterFloorHeight(
      6,
      CHAPTER_6_EGG_ALTAR_POS.x,
      CHAPTER_6_EGG_ALTAR_POS.z,
    );
    this.ch6AltarRig = createAbyssalHeartAltarRig(isLowQual, qual.extraPointLights);
    this.ch6AltarRig.group.position.set(
      CHAPTER_6_EGG_ALTAR_POS.x,
      altarFloorY - 0.1,
      CHAPTER_6_EGG_ALTAR_POS.z,
    );
    this.ch6AltarRig.group.userData.interactable = {
      type: 'egg_altar',
      label: t(lang, 'labelEggAltar'),
      targetPos: {
        x: CHAPTER_6_EGG_ALTAR_POS.x,
        y: altarFloorY + 1.85,
        z: CHAPTER_6_EGG_ALTAR_POS.z,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch6AltarRig.group);
    this.interactiveObjects.push(this.ch6AltarRig.group);

    // 5. Queen Anglerfish guiding from the Heart rim
    const ch6Npcs = createChapter6NPCs();
    this.queenAnglerRig = createQueenAnglerRig(isLowQual, qual.extraPointLights);
    const queenData = ch6Npcs[0];
    this.queenAnglerRig.group.position.set(
      queenData.position.x,
      queenData.position.y,
      queenData.position.z,
    );
    this.queenAnglerRig.group.userData.interactable = {
      type: 'npc',
      id: 'queen_angler',
      label: t(lang, 'npcQueenName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.queenAnglerRig.group);
    this.interactiveObjects.push(this.queenAnglerRig.group);

    // 6. Abyssal Breakout Rift Portal (locked until Egg reclaimed)
    const exitFloorY = getChapterFloorHeight(6, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#52e8ff',
      sporeAccentColor: '#d2fbff',
      scale: 1.42,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelAscentPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(6);
  }

  private buildChapter7Props(): void {
    this.activeShelters = CHAPTER_7_SHELTERS;
    this.activePearls = CHAPTER_7_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const lang = this.gameSettings.language;

    // 1. Ascending rift boulders
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 20 : 40) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.25, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x263f54,
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 44.3) % 100) / 100;
      const x = side * (6.8 + laneRand * 15.0);
      const z = 10 - ((i * 28.5) % 98);
      const y = getChapterFloorHeight(7, x, z) - 0.55;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 61) % 360) * (Math.PI / 180), 0);
      const sx = 0.95 + ((i * 19) % 100) / 100 * 1.1;
      const sy = 0.65 + ((i * 23) % 100) / 100 * 0.8;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Ridge Shelters
    for (const shelter of CHAPTER_7_SHELTERS) {
      const rig = createBoneShelterRig(isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(7, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.7, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelVertebraShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(7);

    // 3. Collectible Pearls
    for (const p of CHAPTER_7_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(7, p.x, p.z);
      rig.position.set(p.x, floorY + 0.5, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.15, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Thermal Updraft Currents
    for (const upd of CHAPTER_7_UPDRAFT_ZONES) {
      const rig = createUpdraftCurrentRig(upd.radius, 9.5, '#52e8ff', isLowQual);
      const floorY = getChapterFloorHeight(7, upd.x, upd.z);
      rig.group.position.set(upd.x, floorY - 0.3, upd.z);
      this.chapterGroup.add(rig.group);
      this.updraftRigs.push(rig);
    }

    // 5. Ascent Sluice Gate at z = -62
    const gateFloorY = getChapterFloorHeight(7, 0, CHAPTER_7_WHALE_GATE_Z);
    this.ch7GateRig = createAbyssalGateRig(
      0x29465c,
      '#5ee8ff',
      this.rustedHullTex,
      new THREE.Vector3(CHAPTER_7_WHALE_LEVER_POS.x, -1.6, 2.8),
      qual.extraPointLights,
    );
    this.ch7GateRig.group.position.set(0, gateFloorY + 1.8, CHAPTER_7_WHALE_GATE_Z);
    this.ch7GateRig.leverGroup.userData.interactable = {
      type: 'ch7_lever',
      label: t(lang, 'labelVentGateLever'),
      targetPos: {
        x: CHAPTER_7_WHALE_LEVER_POS.x,
        y: gateFloorY + 1.25,
        z: CHAPTER_7_WHALE_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch7GateRig.group);
    this.interactiveObjects.push(this.ch7GateRig.leverGroup);

    // 6. NPCs: Turtle Glafira & Young Singing Whale
    const ch7Npcs = createChapter7NPCs();
    this.glafiraRig = createGlafiraTurtleRig();
    const glafiraData = ch7Npcs[0];
    this.glafiraRig.group.position.set(
      glafiraData.position.x,
      glafiraData.position.y,
      glafiraData.position.z,
    );
    this.glafiraRig.group.userData.interactable = {
      type: 'npc',
      id: 'glafira',
      label: t(lang, 'npcGlafiraName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.glafiraRig.group);
    this.interactiveObjects.push(this.glafiraRig.group);

    this.youngWhaleRig = createYoungWhaleRescueRig(isLowQual, qual.extraPointLights);
    const whaleData = ch7Npcs[1];
    this.youngWhaleRig.group.position.set(
      whaleData.position.x,
      whaleData.position.y,
      whaleData.position.z,
    );
    this.youngWhaleRig.cableGroup.visible = !this.ch7WhaleFreed;
    this.youngWhaleRig.whaleGroup.userData.interactable = {
      type: 'npc',
      id: 'young_whale',
      label: t(lang, 'npcYoungWhaleName'),
    } satisfies InteractableMeta;
    this.youngWhaleRig.valveGroup.userData.interactable = {
      type: 'whale_valve',
      label: t(lang, 'labelWhaleValve'),
      targetPos: {
        x: whaleData.position.x + 2.4,
        y: whaleData.position.y - 0.6,
        z: whaleData.position.z + 1.5,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.youngWhaleRig.group);
    this.interactiveObjects.push(
      this.youngWhaleRig.whaleGroup,
      this.youngWhaleRig.valveGroup,
    );

    // 7. Kelp Rebellion Updraft Portal
    const exitFloorY = getChapterFloorHeight(7, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#48f2c2',
      sporeAccentColor: '#b5ffe9',
      scale: 1.35,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelRebellionPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(7);
  }

  private buildChapter8Props(): void {
    this.activeShelters = CHAPTER_8_SHELTERS;
    this.activePearls = CHAPTER_8_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const lang = this.gameSettings.language;

    // 1. Kelp Rebellion boulders
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 22 : 42) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.2, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x244f46,
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.02,
      envMapIntensity: qual.envMapIntensity * 0.25,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.receiveShadow = qual.shadows && !this.isSoftwareGl;
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 46.1) % 100) / 100;
      const x = side * (6.6 + laneRand * 15.0);
      const z = 10 - ((i * 27.1) % 98);
      const y = getChapterFloorHeight(8, x, z) - 0.5;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 53) % 360) * (Math.PI / 180), 0);
      const sx = 0.9 + ((i * 19) % 100) / 100 * 1.1;
      const sy = 0.6 + ((i * 23) % 100) / 100 * 0.7;
      _dummy.scale.set(sx, sy, sx * 0.95);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Kelp Root Shelters
    for (const shelter of CHAPTER_8_SHELTERS) {
      const rig = createKelpShelterRig();
      const floorY = getChapterFloorHeight(8, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.7, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelKelpShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(8);

    // 3. Collectible Pearls
    for (const p of CHAPTER_8_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(8, p.x, p.z);
      rig.position.set(p.x, floorY + 0.5, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.1, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Bioluminescent Spore Lanterns ignited by Call [E]
    const lanternCoords = [
      { x: -4.2, z: -18 },
      { x: 4.4, z: -32 },
      { x: -4.6, z: -45 },
      { x: 3.6, z: -58 },
      { x: -3.4, z: -74 },
    ];
    for (const lc of lanternCoords) {
      const lantern = createKelpSporeLanternRig(qual.extraPointLights);
      const floorY = getChapterFloorHeight(8, lc.x, lc.z);
      lantern.group.position.set(lc.x, floorY - 0.1, lc.z);
      this.chapterGroup.add(lantern.group);
      this.ch8SporeLanterns.push(lantern);
    }

    // 5. Boris's Secret Liner Hatch at z = -62
    const gateFloorY = getChapterFloorHeight(8, 0, CHAPTER_8_SHORTCUT_GATE_Z);
    this.ch8GateRig = createAbyssalGateRig(
      0x1f4f42,
      '#48f2b8',
      this.weatheredWoodTex,
      new THREE.Vector3(CHAPTER_8_BORIS_LEVER_POS.x, -1.6, 2.8),
      qual.extraPointLights,
    );
    this.ch8GateRig.group.position.set(0, gateFloorY + 1.8, CHAPTER_8_SHORTCUT_GATE_Z);
    this.ch8GateRig.leverGroup.userData.interactable = {
      type: 'ch8_lever',
      label: t(lang, 'labelShortcutLever'),
      targetPos: {
        x: CHAPTER_8_BORIS_LEVER_POS.x,
        y: gateFloorY + 1.25,
        z: CHAPTER_8_SHORTCUT_GATE_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch8GateRig.group);
    this.interactiveObjects.push(this.ch8GateRig.leverGroup);

    // 6. NPCs: Turtle Glafira & Octopus Boris
    const ch8Npcs = createChapter8NPCs();
    this.glafiraRig = createGlafiraTurtleRig();
    const glafData = ch8Npcs[0];
    this.glafiraRig.group.position.set(
      glafData.position.x,
      glafData.position.y,
      glafData.position.z,
    );
    this.glafiraRig.group.userData.interactable = {
      type: 'npc',
      id: 'glafira',
      label: t(lang, 'npcGlafiraName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.glafiraRig.group);
    this.interactiveObjects.push(this.glafiraRig.group);

    this.borisRig = createBorisRig(isLowQual, qual.extraPointLights);
    const borisData = ch8Npcs[1];
    this.borisRig.group.position.set(
      borisData.position.x,
      borisData.position.y,
      borisData.position.z,
    );
    this.borisRig.group.userData.interactable = {
      type: 'npc',
      id: 'boris',
      label: t(lang, 'npcBorisName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.borisRig.group);
    this.interactiveObjects.push(this.borisRig.group);

    this.mantaRig = createMantaFallbackRig();
    this.mantaRig.position.set(-10, 9.5, -48);
    this.chapterGroup.add(this.mantaRig);

    // 7. Singing Whale Hatch Portal
    const exitFloorY = getChapterFloorHeight(8, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#48b8ff',
      sporeAccentColor: '#b5e8ff',
      scale: 1.32,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelLinerPortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(8);
  }

  private buildChapter9Props(): void {
    this.activeShelters = CHAPTER_9_SHELTERS;
    this.activePearls = CHAPTER_9_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const lang = this.gameSettings.language;

    // 1. Sunken Liner Architecture (upper hold return)
    const linerSet = createSunkenLinerSet(
      this.rustedHullTex,
      this.weatheredWoodTex,
      isLowQual,
      qual.extraPointLights,
    );
    this.chapterGroup.add(linerSet);
    this.clickTargetMeshes.push(linerSet);

    // 2. Cargo Crate Shelters
    for (const shelter of CHAPTER_9_SHELTERS) {
      const rig = createCargoCrateShelterRig(
        this.weatheredWoodTex,
        this.rustedHullTex,
        qual.extraPointLights,
      );
      const floorY = getChapterFloorHeight(9, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 1.0, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelCrateShelter'),
        targetPos: { x: shelter.x, y: shelter.y, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(9);

    // 3. Collectible Pearls
    for (const p of CHAPTER_9_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(9, p.x, p.z);
      rig.position.set(p.x, floorY + 0.55, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.15, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Sweeping Liner Alarm Searchlights
    const lightAnchors = [
      { x: -7.5, z: -20 },
      { x: 7.5, z: -38 },
      { x: -7.0, z: -54 },
    ];
    for (const la of lightAnchors) {
      const sLight = createLinerSearchlightRig(isLowQual);
      const floorY = getChapterFloorHeight(9, la.x, la.z);
      sLight.group.position.set(la.x, floorY + 4.4, la.z);
      this.chapterGroup.add(sLight.group);
      this.ch9Searchlights.push(sLight);
    }

    // 5. Alarm Bulkhead Gate at z = -62
    const gateFloorY = getChapterFloorHeight(9, 0, CHAPTER_9_BULKHEAD_Z);
    this.ch9GateRig = createAbyssalGateRig(
      0x3d4d59,
      '#ffb347',
      this.rustedHullTex,
      new THREE.Vector3(CHAPTER_9_BULKHEAD_LEVER_POS.x, -1.6, 2.8),
      qual.extraPointLights,
    );
    this.ch9GateRig.group.position.set(0, gateFloorY + 1.8, CHAPTER_9_BULKHEAD_Z);
    this.ch9GateRig.leverGroup.userData.interactable = {
      type: 'ch9_lever',
      label: t(lang, 'labelBulkheadLever'),
      targetPos: {
        x: CHAPTER_9_BULKHEAD_LEVER_POS.x,
        y: gateFloorY + 1.25,
        z: CHAPTER_9_BULKHEAD_Z + 3.0,
      },
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.ch9GateRig.group);
    this.interactiveObjects.push(this.ch9GateRig.leverGroup);

    // 6. NPCs: Parrotfish Kesha & Pufferfish Pafnutiy
    const ch9Npcs = createChapter9NPCs();
    this.keshaRig = createKeshaParrotfishRig(isLowQual, qual.extraPointLights);
    const keshaData = ch9Npcs[0];
    this.keshaRig.group.position.set(
      keshaData.position.x,
      keshaData.position.y,
      keshaData.position.z,
    );
    this.keshaRig.group.userData.interactable = {
      type: 'npc',
      id: 'kesha',
      label: t(lang, 'npcKeshaName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.keshaRig.group);
    this.interactiveObjects.push(this.keshaRig.group);

    this.pafnutiyRig = createPafnutiyRig(isLowQual, qual.extraPointLights);
    const pafData = ch9Npcs[1];
    this.pafnutiyRig.group.position.set(
      pafData.position.x,
      pafData.position.y,
      pafData.position.z,
    );
    this.pafnutiyRig.group.userData.interactable = {
      type: 'npc',
      id: 'pafnutiy',
      label: t(lang, 'npcPafnutiyName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.pafnutiyRig.group);
    this.interactiveObjects.push(this.pafnutiyRig.group);

    // 7. Singing Whale Silhouette above
    this.whaleRig = createWhaleSilhouetteRig(isLowQual);
    this.whaleRig.position.set(16, 15, -52);
    this.whaleRig.rotation.y = -Math.PI * 0.42;
    this.chapterGroup.add(this.whaleRig);

    // 8. Sunlit Reef Current Portal
    const exitFloorY = getChapterFloorHeight(9, 0, -86);
    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#66e6ff',
      sporeAccentColor: '#d9fbff',
      scale: 1.34,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.65, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelSurfacePortal'),
      targetPos: { x: 0, y: exitFloorY + 1.4, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    void this.applyChapterExternalModels(9);
  }

  private buildChapter10Props(): void {
    this.activeShelters = CHAPTER_10_SHELTERS;
    this.activePearls = CHAPTER_10_PEARLS;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';
    const shadowsEnabled = qual.shadows && !this.isSoftwareGl;
    const lang = this.gameSettings.language;

    // 1. Sunlit Coral Reef Boulders along flanks
    const rockCount = Math.max(8, Math.round((this.isSoftwareGl ? 24 : 52) * qual.foliageDensity));
    const rockGeo = createSculptedBoulderGeometry(1.15, qual.id === 'very_low' ? 1 : 2);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: this.coralTex.map,
      bumpMap: qual.id === 'very_low' ? null : this.coralTex.bumpMap,
      bumpScale: 0.65,
      roughness: 0.84,
      metalness: 0.03,
      envMapIntensity: qual.envMapIntensity * 0.35,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.castShadow = shadowsEnabled;
    rockInst.receiveShadow = shadowsEnabled;
    const rockPalette = ['#5c7f8f', '#6d8f9c', '#7c939b', '#4d6f80', '#7c8f96'];
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 53.3) % 100) / 100;
      const x = side * (6.2 + laneRand * 16.5);
      const z = 12 - ((i * 31.7) % 104);
      const y = getChapterFloorHeight(10, x, z) - 0.5;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, ((i * 41) % 360) * (Math.PI / 180), 0);
      const sx = 0.85 + (((i * 19) % 100) / 100) * 1.1;
      const sy = 0.55 + (((i * 23) % 100) / 100) * 0.65;
      _dummy.scale.set(sx, sy, sx * 0.9);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);
      _color.set(rockPalette[i % rockPalette.length]);
      rockInst.setColorAt(i, _color);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.chapterGroup.add(rockInst);
    this.clickTargetMeshes.push(rockInst);
    this.chapterDisposables.push(rockGeo, rockMat);

    // 2. Pink Coral Shelters
    for (const shelter of CHAPTER_10_SHELTERS) {
      const rig = createCoralShelterRig(this.coralTex, qual.extraPointLights);
      const floorY = getChapterFloorHeight(10, shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.5, shelter.z);
      rig.userData.interactable = {
        type: 'shelter',
        id: shelter.id,
        label: t(lang, 'labelCoralShelter'),
        targetPos: { x: shelter.x, y: floorY + 1.15, z: shelter.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.interactiveObjects.push(rig);
    }

    this.buildSeabedDetails(10);

    // 3. Collectible Pearls
    for (const p of CHAPTER_10_PEARLS) {
      const rig = createPearlPickupRig(this.nacreTex, isLowQual, qual.extraPointLights);
      const floorY = getChapterFloorHeight(10, p.x, p.z);
      rig.position.set(p.x, floorY + 0.6, p.z);
      rig.visible = !this.campaign.collectedPearlIds.includes(p.id);
      rig.userData.interactable = {
        type: 'pearl',
        id: p.id,
        label: t(lang, 'labelPearl'),
        targetPos: { x: p.x, y: floorY + 1.15, z: p.z },
      } satisfies InteractableMeta;
      this.chapterGroup.add(rig);
      this.pearlMeshes.set(p.id, rig);
      this.interactiveObjects.push(rig);
    }

    // 4. Golden-Turquoise Sunlit Updrafts propelling home
    for (const upd of CHAPTER_10_UPDRAFT_ZONES) {
      const rig = createUpdraftCurrentRig(upd.radius, 10.5, '#7bf5ff', isLowQual);
      const floorY = getChapterFloorHeight(10, upd.x, upd.z);
      rig.group.position.set(upd.x, floorY - 0.3, upd.z);
      this.chapterGroup.add(rig.group);
      this.updraftRigs.push(rig);
    }

    // 5. Hatchling Coral Nursery Cradle + Sanctuary Portal at z = -86
    const exitFloorY = getChapterFloorHeight(10, 0, -86);
    const cradle = createHatchlingCoralSanctuaryRig(isLowQual, qual.extraPointLights);
    cradle.position.set(0, exitFloorY + 0.1, -86);
    this.chapterGroup.add(cradle);

    const exitPortal = createBioluminescentSanctuaryPortalRig({
      primaryColor: '#7bfcf0',
      sporeAccentColor: '#fff6c2',
      scale: 1.4,
      isSoftwareGl: this.isSoftwareGl,
      lowQuality: isLowQual,
      allowTransmission: !this.isSoftwareGl && !isLowQual,
      extraPointLights: qual.extraPointLights,
    });
    exitPortal.group.position.set(0, exitFloorY + 0.75, -86);
    exitPortal.group.userData.interactable = {
      type: 'egg',
      label: t(lang, 'labelHatchlingSanctuary'),
      targetPos: { x: 0, y: exitFloorY + 1.5, z: -87 },
    } satisfies InteractableMeta;
    this.chapterGroup.add(exitPortal.group);
    this.interactiveObjects.push(exitPortal.group);
    this.activePortalRig = exitPortal;

    // 6. Chapter 10 NPCs: Grandma Mildred & Celebration Shrimps
    const ch10Npcs = createChapter10NPCs();
    this.mildredRig = createMildredRig(this.isSoftwareGl, isLowQual, qual.extraPointLights);
    const mildredData = ch10Npcs[0];
    this.mildredRig.group.position.set(
      mildredData.position.x,
      mildredData.position.y,
      mildredData.position.z,
    );
    this.mildredRig.group.userData.interactable = {
      type: 'npc',
      id: 'mildred',
      label: t(lang, 'npcMildredName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.mildredRig.group);
    this.interactiveObjects.push(this.mildredRig.group);

    this.shrimpRig = createShrimpFlockRig();
    const shrimpData = ch10Npcs[1];
    this.shrimpRig.position.set(
      shrimpData.position.x,
      shrimpData.position.y,
      shrimpData.position.z,
    );
    this.shrimpRig.userData.interactable = {
      type: 'npc',
      id: 'panic_shrimps',
      label: t(lang, 'npcShrimpsName'),
    } satisfies InteractableMeta;
    this.chapterGroup.add(this.shrimpRig);
    this.interactiveObjects.push(this.shrimpRig);

    void this.applyChapterExternalModels(10);
  }

  private async loadPersistentHeroAndSchool(): Promise<void> {
    const urls = resolveAssetUrls();
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';

    // Player Fish: explicit GLB override or TropicalFish_FBX.zip hero species
    if (urls.fish) {
      try {
        const gltf = await loadCachedGLTF(urls.fish);
        if (this.disposed) return;
        const normalizedFish = prepareNormalizedModel(gltf.scene.clone(), {
          targetSize: 2.55,
          alignBottomToZero: false,
          yawOffsetRad: Math.PI / 2,
        });
        this.glbFishYawOffset = Math.PI / 2;
        this.glbFishSwim = tuneFishMaterial(normalizedFish, 'x', isLowQual);
        this.playerRig.group.children.forEach((child) => {
          if (!(child instanceof THREE.Light)) {
            child.visible = false;
          }
        });
        this.glbFishPivot = normalizedFish;
        this.playerRig.group.add(normalizedFish);
        this.applyActiveSkinVisuals();
      } catch (err) {
        console.warn('[GLB] Не удалось загрузить модель рыбки, остаётся процедурная:', err);
      }
    } else if (urls.tropicalFishPack) {
      const packUrl = urls.tropicalFishPack;
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
      const speciesId =
        params.get('fishSpecies') || GITHUB_MODEL_CATALOG.heroFishSpecies;

      try {
        const loaded = await loadTropicalFishFromZip(packUrl, speciesId, 2.55, isLowQual);
        if (this.disposed) return;
        this.glbFishYawOffset = 0;
        this.glbFishSwim = loaded.swimHandle;
        this.playerRig.group.children.forEach((child) => {
          if (!(child instanceof THREE.Light)) {
            child.visible = false;
          }
        });
        this.glbFishPivot = loaded.group;
        this.playerRig.group.add(loaded.group);
        this.applyActiveSkinVisuals();
      } catch (err) {
        console.warn('[FBX] Не удалось загрузить TropicalFish из архива, остаётся процедурная:', err);
      }

      void this.populateAmbientFishSchool(packUrl);
    }
  }

  private async loadPersistentSquidPredator(): Promise<void> {
    const urls = resolveAssetUrls();
    if (!urls.squidPredator) return;

    try {
      const gltf = await loadCachedGLTF(urls.squidPredator);
      if (this.disposed) return;

      const lurkerClone = SkeletonUtils.clone(gltf.scene);
      const mixer = new THREE.AnimationMixer(lurkerClone);
      const findClip = (patterns: string[]) =>
        gltf.animations.find((a) =>
          patterns.some((p) => a.name.toLowerCase().includes(p)),
        ) ?? gltf.animations[0];

      const patrolClip = findClip(['swim_forward', 'swim']);
      const telegraphClip = findClip(['dash_back', 'idle_2']);
      const dashClip = findClip(['attack_heavy', 'attack']);
      const stunClip = findClip(['idle_1', 'idle']);

      const patrolAction = patrolClip ? mixer.clipAction(patrolClip) : null;
      const telegraphAction = telegraphClip ? mixer.clipAction(telegraphClip) : null;
      const dashAction = dashClip ? mixer.clipAction(dashClip) : null;
      const stunAction = stunClip ? mixer.clipAction(stunClip) : null;

      if (patrolAction) {
        patrolAction.play();
        mixer.update(0);
      }

      const normalized = prepareNormalizedModel(lurkerClone, {
        targetSize: 5.4,
        alignBottomToZero: false,
      });
      const tuned = tuneSquidPredatorMaterial(normalized);

      this.squidRig.group.children.forEach((child) => {
        if (!(child instanceof THREE.Light)) {
          child.visible = false;
        }
      });
      this.squidRig.group.add(normalized);

      this.squidPredatorMixer = mixer;
      this.squidPredatorActions = {
        patrol: patrolAction,
        telegraph: telegraphAction,
        dash: dashAction,
        stun: stunAction,
      };
      this.squidPredatorActiveState = patrolAction ? 'patrol' : null;
      this.squidPredatorEyeMats = tuned.eyeMaterials;
    } catch (err) {
      console.warn('[GLB] Не удалось загрузить lurker_-_rigged_and_animated.glb, остаётся процедурный кальмар:', err);
    }
  }

  private async loadPersistentTitleSquid(): Promise<void> {
    const urls = resolveAssetUrls();
    const squidUrl = urls.fireflySquid ?? urls.squidPredator;
    if (!squidUrl) return;

    try {
      const gltf = await loadCachedGLTF(squidUrl);
      if (this.disposed) return;

      const clone = SkeletonUtils.clone(gltf.scene);
      let mixer: THREE.AnimationMixer | null = null;
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(clone);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        mixer.update(0);
      }

      const normalized = prepareNormalizedModel(clone, {
        targetSize: 1.48,
        alignBottomToZero: false,
      });
      if (urls.fireflySquid && squidUrl === urls.fireflySquid) {
        tuneFireflySquidMaterial(normalized);
      } else {
        tuneSquidPredatorMaterial(normalized);
      }
      const glowMats: Array<{ mat: THREE.MeshStandardMaterial; baseEmissive: number }> = [];
      const fluoroUniforms: Array<{
        uFluoroFlash: { value: number };
        uFluoroColor: { value: THREE.Color };
        uFluoroPhase: { value: number };
      }> = [];
      normalized.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const srcMats = Array.isArray(mesh.material)
            ? (mesh.material as THREE.Material[])
            : [mesh.material as THREE.Material];
          const clonedMats = srcMats.map((m) => m.clone());
          mesh.material = Array.isArray(mesh.material)
            ? clonedMats
            : clonedMats[0];
          this.disposables.push(...clonedMats);

          for (const mat of clonedMats) {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Preserve the GLB bioluminescent photophore emissiveMap while adding
              // saturated Fresnel rim + traveling neon cyan/UV-violet bio-waves
              mat.emissive.set('#00fff2');
              const baseEmissive = 0.85;
              mat.emissiveIntensity = baseEmissive;
              mat.color.set('#0c4f75');
              mat.roughness = 0.22;
              mat.metalness = 0.06;
              mat.envMapIntensity = 0.25;
              mat.toneMapped = false;

              const uFluoroFlash = { value: 0.35 };
              const uFluoroColor = { value: new THREE.Color('#00fff2') };
              const uFluoroPhase = { value: 0 };
              mat.onBeforeCompile = (shader) => {
                shader.uniforms.uFluoroFlash = uFluoroFlash;
                shader.uniforms.uFluoroColor = uFluoroColor;
                shader.uniforms.uFluoroPhase = uFluoroPhase;
                shader.vertexShader = shader.vertexShader
                  .replace(
                    '#include <common>',
                    `#include <common>
                    varying vec3 vFluoroLocalPos;`,
                  )
                  .replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>
                    vFluoroLocalPos = position;`,
                  );
                shader.fragmentShader = shader.fragmentShader
                  .replace(
                    '#include <common>',
                    `#include <common>
                    uniform float uFluoroFlash;
                    uniform vec3 uFluoroColor;
                    uniform float uFluoroPhase;
                    varying vec3 vFluoroLocalPos;`,
                  )
                  .replace(
                    '#include <emissivemap_fragment>',
                    `#include <emissivemap_fragment>
                    float fluoroRim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 1.55);
                    float bioBand = 0.5 + 0.5 * sin(vFluoroLocalPos.y * 0.28 + vFluoroLocalPos.z * 0.24 - uFluoroPhase);
                    float bioSpark = pow(bioBand, 2.1);
                    vec3 neonViolet = vec3(0.58, 0.12, 1.0);
                    vec3 pulseHue = mix(uFluoroColor, neonViolet, 0.42 * (1.0 - bioBand));
                    vec3 spotBoost = totalEmissiveRadiance * (1.35 + uFluoroFlash * 0.95);
                    vec3 bioGlow = pulseHue * uFluoroFlash * (0.09 + 0.72 * fluoroRim + 0.58 * bioSpark);
                    totalEmissiveRadiance = spotBoost + bioGlow;
                    float fluoroPeak = max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b));
                    if (fluoroPeak > 0.001) {
                      float softCap = 0.96 * (1.0 - exp(-fluoroPeak * 0.92));
                      totalEmissiveRadiance *= min(fluoroPeak, softCap) / fluoroPeak;
                    }`,
                  );
              };
              mat.customProgramCacheKey = () => 'title-squid-fluoro-v5';
              mat.needsUpdate = true;
              glowMats.push({ mat, baseEmissive });
              fluoroUniforms.push({ uFluoroFlash, uFluoroColor, uFluoroPhase });
            }
          }
        }
      });
      normalized.rotation.set(0.28, Math.PI * 0.22, -0.28);

      // Discover articulated tentacle chains + natural arm forward vector for attack lunges
      const tentacleChains: Array<{
        b0: THREE.Object3D;
        b1: THREE.Object3D;
        b2: THREE.Object3D | null;
      }> = [];
      const headJoint =
        normalized.getObjectByName('joint1_00_8') ??
        normalized.getObjectByName('Front_04');
      const mantleJoint =
        normalized.getObjectByName('joint51_073_58') ??
        normalized.getObjectByName('Back_03') ??
        null;

      if (headJoint) {
        for (const child of headJoint.children) {
          if (child === mantleJoint) continue;
          const lower = child.name.toLowerCase();
          if (lower.includes('curve') || lower.includes('back') || lower.includes('forehead')) {
            continue;
          }
          const b1 = child.children.find((c) => c.type === 'Bone') ?? child.children[0];
          if (b1) {
            const b2 = b1.children.find((c) => c.type === 'Bone') ?? b1.children[0] ?? null;
            tentacleChains.push({ b0: child, b1, b2 });
          }
        }
      }
      if (tentacleChains.length === 0) {
        normalized.traverse((obj) => {
          if (/tentacle.*_1_/i.test(obj.name) && obj.children.length > 0) {
            const b1 = obj.children[0];
            const b2 = b1.children[0] ?? null;
            tentacleChains.push({ b0: obj, b1, b2 });
          }
        });
      }

      normalized.updateMatrixWorld(true);
      _titleSquidBox.setFromObject(normalized, true);
      if (!_titleSquidBox.isEmpty()) {
        _titleSquidBox.getCenter(_vec3B);
        normalized.position.sub(_vec3B);
        normalized.updateMatrixWorld(true);
      }
      if (tentacleChains.length > 0) {
        _squidMouthCenter.set(0, 0, 0);
        for (const chain of tentacleChains) {
          chain.b0.getWorldPosition(_squidBonePos0);
          _squidMouthCenter.add(_squidBonePos0);
        }
        _squidMouthCenter.divideScalar(tentacleChains.length);
        if (mantleJoint) {
          mantleJoint.getWorldPosition(_squidMantlePos);
        } else {
          _squidMantlePos.set(0, 0, 0);
        }
        _squidTentacleFwd.copy(_squidMouthCenter).sub(_squidMantlePos);
        if (_squidTentacleFwd.lengthSq() > 0.001) {
          this.titleSquidArmForwardLocal.copy(_squidTentacleFwd).normalize();
        }
      }

      this.titleSquidFallbackRig.group.visible = false;
      this.titleSquidModelPivot = normalized;
      this.titleSquidGlowMats = glowMats;
      this.titleSquidFluoroUniforms = fluoroUniforms;
      this.titleSquidTentacleChains = tentacleChains;
      this.titleSquidMantleBone = mantleJoint;
      this.titleSquidMixer = mixer;
      this.titleSquidGroup.add(normalized);
    } catch (err) {
      console.warn('[GLB] Не удалось загрузить кальмара для стартового экрана, остаётся процедурный:', err);
    }
  }

  private async populateFireflySquids(
    chapterId: ChapterId,
    fireflyUrl: string | null,
  ): Promise<void> {
    if (!fireflyUrl) return;
    try {
      const gltf = await loadCachedGLTF(fireflyUrl);
      if (this.disposed || this.activeSceneChapter !== chapterId) return;

      const placements =
        chapterId === 1 || chapterId === 10
          ? [
              { x: -6.5, y: 2.6, z: -26, rx: 3.2, rz: 4.5, spd: 0.44, size: 1.9 },
              { x: 7.2, y: 3.1, z: -38, rx: 3.0, rz: 4.2, spd: -0.48, size: 2.1 },
              { x: -7.8, y: 2.4, z: -52, rx: 3.4, rz: 4.8, spd: 0.41, size: 1.85 },
              { x: 6.4, y: 2.0, z: -74, rx: 2.8, rz: 4.0, spd: -0.45, size: 2.05 },
            ]
          : chapterId >= 4 && chapterId <= 7
            ? [
                { x: -5.4, y: 0.8, z: -20, rx: 2.5, rz: 3.5, spd: 0.42, size: 1.95 },
                { x: 5.6, y: 0.4, z: -36, rx: 2.6, rz: 3.8, spd: -0.41, size: 2.05 },
                { x: -5.2, y: -0.8, z: -54, rx: 2.4, rz: 3.4, spd: 0.44, size: 1.9 },
                { x: 4.8, y: -1.4, z: -75, rx: 2.3, rz: 3.5, spd: -0.45, size: 2.0 },
              ]
            : chapterId === 3 || chapterId === 8
              ? [
                  { x: -5.2, y: 1.6, z: -20, rx: 2.5, rz: 3.6, spd: 0.44, size: 1.9 },
                  { x: 5.8, y: 1.8, z: -36, rx: 2.6, rz: 3.8, spd: -0.43, size: 2.05 },
                  { x: -5.6, y: 0.8, z: -56, rx: 2.4, rz: 3.5, spd: 0.42, size: 1.85 },
                  { x: 5.0, y: 0.4, z: -76, rx: 2.3, rz: 3.6, spd: -0.46, size: 1.95 },
                ]
              : [
                  { x: -5.5, y: 1.8, z: -18, rx: 2.6, rz: 3.8, spd: 0.46, size: 1.95 },
                  { x: 5.8, y: 2.2, z: -34, rx: 2.8, rz: 4.0, spd: -0.42, size: 2.1 },
                  { x: -5.2, y: 1.4, z: -56, rx: 2.6, rz: 3.6, spd: 0.44, size: 1.9 },
                  { x: 5.4, y: 1.2, z: -76, rx: 2.5, rz: 3.8, spd: -0.47, size: 2.0 },
                ];

      const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
      const maxVisible = Math.round(placements.length * qual.ambientActorFraction);

      for (let i = 0; i < placements.length; i++) {
        const p = placements[i];
        const clone = SkeletonUtils.clone(gltf.scene);
        let mixer: THREE.AnimationMixer | null = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(clone);
          const action = mixer.clipAction(gltf.animations[0]);
          action.time = i * 0.65;
          action.play();
          mixer.update(0);
        }

        const normalized = prepareNormalizedModel(clone, {
          targetSize: p.size,
          alignBottomToZero: false,
        });
        tuneFireflySquidMaterial(normalized);

        const container = new THREE.Group();
        container.add(normalized);
        const glow = new THREE.PointLight('#2ee6ff', 1.35, 9, 1.5);
        glow.visible = qual.extraPointLights;
        glow.userData.isSecondaryLight = true;
        container.add(glow);
        container.visible = i < maxVisible;

        this.chapterGroup.add(container);
        this.fireflySquidSchool.push({
          group: container,
          mixer,
          glowLight: glow,
          anchorX: p.x,
          anchorY: p.y,
          anchorZ: p.z,
          radiusX: p.rx,
          radiusZ: p.rz,
          speed: p.spd,
          phase: i * 1.45,
        });
      }
    } catch (err) {
      console.warn('[GLB] Не удалось загрузить firefly-squid-glowing.glb:', err);
    }
  }

  private async applyChapterExternalModels(chapterId: ChapterId): Promise<void> {
    const urls = resolveAssetUrls();
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const isLowQual = qual.id === 'very_low' || qual.id === 'low';

    // Glowing firefly squids present in deep zones of all implemented chapters
    void this.populateFireflySquids(chapterId, urls.fireflySquid);

    // Chapters 3, 4, 7, 8: Turtle Glafira (loggerhead_turtle.glb) & Manta Ray (manta_low_poly.glb)
    if (chapterId === 3 || chapterId === 4 || chapterId === 7 || chapterId === 8) {
      const tasks: Promise<void>[] = [];

      if (urls.turtle && this.activeSceneChapter === chapterId && this.glafiraRig) {
        tasks.push(
          (async () => {
            try {
              const gltf = await loadCachedGLTF(urls.turtle!);
              if (this.disposed || this.activeSceneChapter !== chapterId || !this.glafiraRig) return;

              const clone = SkeletonUtils.clone(gltf.scene);
              let mixer: THREE.AnimationMixer | null = null;
              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(clone);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.update(0);
              }
              const normalized = prepareNormalizedModel(clone, {
                targetSize: 3.6,
                alignBottomToZero: false,
              });
              this.glafiraRig.bodyGroup.children.forEach((child) => {
                child.visible = false;
              });
              this.glafiraRig.bodyGroup.add(normalized);
              this.glafiraUsingExternalModel = true;
              this.glafiraMixer = mixer;
            } catch (err) {
              console.warn('[GLB] Не удалось загрузить loggerhead_turtle.glb:', err);
            }
          })(),
        );
      }

      if (urls.manta && this.activeSceneChapter === chapterId && this.mantaRig) {
        tasks.push(
          (async () => {
            try {
              const gltf = await loadCachedGLTF(urls.manta!);
              if (this.disposed || this.activeSceneChapter !== chapterId || !this.mantaRig) return;
              const clone = SkeletonUtils.clone(gltf.scene);
              let mixer: THREE.AnimationMixer | null = null;
              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(clone);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.update(0);
              }
              const normalized = prepareNormalizedModel(clone, {
                targetSize: 7.5,
                alignBottomToZero: false,
              });
              this.mantaRig.children.forEach((child) => {
                child.visible = false;
              });
              this.mantaRig.add(normalized);
              this.mantaMixer = mixer;
            } catch (err) {
              console.warn('[GLB] Не удалось загрузить manta_low_poly.glb:', err);
            }
          })(),
        );
      }

      // Chapter 8 also hosts Octopus Boris (glass_octopus.glb)
      if (chapterId === 8 && urls.octopus && this.activeSceneChapter === 8 && this.borisRig) {
        tasks.push(
          (async () => {
            try {
              const gltf = await loadCachedGLTF(urls.octopus!);
              if (this.disposed || this.activeSceneChapter !== 8 || !this.borisRig) return;
              const borisClone = SkeletonUtils.clone(gltf.scene);
              stripGiantBackdropMeshes(borisClone);
              let mixer: THREE.AnimationMixer | null = null;
              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(borisClone);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.update(0);
              }
              const normalizedBoris = prepareNormalizedModel(borisClone, {
                targetSize: 4.5,
                alignBottomToZero: false,
              });
              tuneGlassOctopusMaterial(normalizedBoris, this.isSoftwareGl, isLowQual);
              this.borisRig.group.children.forEach((child) => {
                if (!(child instanceof THREE.Light)) {
                  child.visible = false;
                }
              });
              this.borisRig.group.add(normalizedBoris);
              this.borisUsingExternalModel = true;
              this.borisMixer = mixer;
            } catch (err) {
              console.warn('[GLB] Не удалось загрузить glass_octopus.glb:', err);
            }
          })(),
        );
      }

      await Promise.all(tasks);
      return;
    }

    // Chapter 2 & 9: Octopus Boris (glass_octopus.glb) & Pufferfish Pafnutiy (diodon_holocanthus_pufferfish.glb)
    if (chapterId === 2 || chapterId === 9) {
      const tasks: Promise<void>[] = [];

      if (chapterId === 2 && urls.octopus && this.activeSceneChapter === 2 && this.borisRig) {
        tasks.push(
          (async () => {
            try {
              const gltf = await loadCachedGLTF(urls.octopus!);
              if (this.disposed || this.activeSceneChapter !== 2 || !this.borisRig) return;

              const borisClone = SkeletonUtils.clone(gltf.scene);
              stripGiantBackdropMeshes(borisClone);
              let mixer: THREE.AnimationMixer | null = null;
              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(borisClone);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.update(0);
              }

              const normalizedBoris = prepareNormalizedModel(borisClone, {
                targetSize: 4.5,
                alignBottomToZero: false,
              });
              tuneGlassOctopusMaterial(normalizedBoris, this.isSoftwareGl, isLowQual);

              this.borisRig.group.children.forEach((child) => {
                if (!(child instanceof THREE.Light)) {
                  child.visible = false;
                }
              });
              this.borisRig.group.add(normalizedBoris);
              this.borisUsingExternalModel = true;
              this.borisMixer = mixer;
            } catch (err) {
              console.warn('[GLB] Не удалось загрузить glass_octopus.glb:', err);
            }
          })(),
        );
      }

      if (urls.pufferfish && this.activeSceneChapter === chapterId && this.pafnutiyRig) {
        tasks.push(
          (async () => {
            try {
              const gltf = await loadCachedGLTF(urls.pufferfish!);
              if (this.disposed || this.activeSceneChapter !== chapterId || !this.pafnutiyRig) return;

              const pafClone = SkeletonUtils.clone(gltf.scene);
              let mixer: THREE.AnimationMixer | null = null;
              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(pafClone);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.update(0);
              }

              const normalizedPaf = prepareNormalizedModel(pafClone, {
                targetSize: 2.35,
                alignBottomToZero: false,
              });
              tunePufferfishMaterial(normalizedPaf, isLowQual);

              this.pafnutiyRig.bodyGroup.children.forEach((child) => {
                child.visible = false;
              });
              this.pafnutiyRig.bodyGroup.add(normalizedPaf);
              this.pafnutiyMixer = mixer;
            } catch (err) {
              console.warn('[GLB] Не удалось загрузить diodon_holocanthus_pufferfish.glb:', err);
            }
          })(),
        );
      }

      await Promise.all(tasks);
      return;
    }

    // Grandma Mildred Jellyfish: crystal_jellyfish_leptomedusae.glb (Chapters 1 & 10)
    if (
      urls.jellyfish &&
      (this.activeSceneChapter === 1 || this.activeSceneChapter === 10) &&
      this.mildredRig
    ) {
      const targetChapter = this.activeSceneChapter;
      try {
        const gltf = await loadCachedGLTF(urls.jellyfish);
        if (this.disposed || this.activeSceneChapter !== targetChapter || !this.mildredRig) return;
        const jellyClone = SkeletonUtils.clone(gltf.scene);
        const normalizedJelly = prepareNormalizedModel(jellyClone, {
          targetSize: 5.8,
          alignBottomToZero: false,
        });
        tuneJellyfishMaterial(normalizedJelly, this.isSoftwareGl, isLowQual);
        normalizedJelly.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
          }
        });
        normalizedJelly.rotation.z = Math.PI / 2;
        this.mildredRig.group.children.forEach((child) => {
          if (!(child instanceof THREE.Light)) {
            child.visible = false;
          }
        });
        this.mildredRig.group.add(normalizedJelly);
        this.mildredUsingExternalModel = true;

        if (gltf.animations && gltf.animations.length > 0) {
          this.mildredMixer = new THREE.AnimationMixer(jellyClone);
          const action = this.mildredMixer.clipAction(gltf.animations[0]);
          action.play();
        }
      } catch (err) {
        console.warn('[GLB] Не удалось загрузить crystal_jellyfish_leptomedusae.glb:', err);
      }
    }

    if (!isLowQual && urls.corals.length > 0 && this.activeSceneChapter === 1) {
      try {
        const settled = await Promise.allSettled(
          urls.corals.map(async (coralUrl) => {
            const gltf = await loadCachedGLTF(coralUrl);
            const normalized = prepareNormalizedModel(gltf.scene.clone(), {
              targetSize: 2.6,
              alignBottomToZero: true,
            });
            return extractInstancedMeshParts(normalized);
          }),
        );
        if (this.disposed || this.activeSceneChapter !== 1) return;

        const validVariants = settled
          .filter(
            (r): r is PromiseFulfilledResult<ReturnType<typeof extractInstancedMeshParts>> =>
              r.status === 'fulfilled' && r.value.length > 0,
          )
          .map((r) => r.value);

        if (validVariants.length > 0) {
          this.coralContainer.clear();
          validVariants.forEach((parts, variantIdx) => {
            const subsetMatrices = this.coralMatrices.filter(
              (_, i) => i % validVariants.length === variantIdx,
            );
            if (subsetMatrices.length === 0) return;

            for (const part of parts) {
              tuneCoralMaterial(part.material, this.coralTex);
              const inst = new THREE.InstancedMesh(
                part.geometry,
                part.material,
                subsetMatrices.length,
              );
              inst.castShadow = !this.isSoftwareGl && qual.shadows;
              inst.receiveShadow = qual.shadows;
              inst.frustumCulled = true;
              subsetMatrices.forEach((mat, idx) => inst.setMatrixAt(idx, mat));
              inst.instanceMatrix.needsUpdate = true;
              inst.computeBoundingSphere();
              this.coralContainer.add(inst);
              this.chapterDisposables.push(part.geometry);
            }
          });
        }
      } catch (err) {
        console.warn('[GLB] Не удалось загрузить модели кораллов, остаётся процедурная:', err);
      }
    }

    if (!isLowQual && urls.rocks.length > 0 && this.activeSceneChapter === 1) {
      try {
        const loadedVariants = await Promise.all(
          urls.rocks.map(async (rockUrl) => {
            const gltf = await loadCachedGLTF(rockUrl);
            const normalized = prepareNormalizedModel(gltf.scene.clone(), {
              targetSize: 2.2,
              alignBottomToZero: true,
            });
            return extractInstancedMeshParts(normalized);
          }),
        );
        if (this.disposed || this.activeSceneChapter !== 1) return;
        const validVariants = loadedVariants.filter((parts) => parts.length > 0);
        if (validVariants.length > 0) {
          this.rockContainer.clear();
          validVariants.forEach((parts, variantIdx) => {
            const subsetMatrices = this.rockMatrices.filter(
              (_, i) => i % validVariants.length === variantIdx,
            );
            if (subsetMatrices.length === 0) return;
            for (const part of parts) {
              const inst = new THREE.InstancedMesh(
                part.geometry,
                part.material,
                subsetMatrices.length,
              );
              inst.castShadow = !this.isSoftwareGl;
              inst.receiveShadow = true;
              inst.frustumCulled = true;
              subsetMatrices.forEach((mat, idx) => inst.setMatrixAt(idx, mat));
              inst.instanceMatrix.needsUpdate = true;
              inst.computeBoundingSphere();
              this.rockContainer.add(inst);
              this.chapterDisposables.push(part.geometry);
            }
          });
        }
      } catch (err) {
        console.warn('[GLB] Не удалось загрузить модели камней, остаются процедурные:', err);
      }
    }

    if (urls.stoneEntrance && this.activeSceneChapter === 1) {
      try {
        const gltf = await loadCachedGLTF(urls.stoneEntrance);
        if (this.disposed || this.activeSceneChapter !== 1) return;
        const entrance = prepareNormalizedModel(gltf.scene.clone(), {
          targetSize: 11.5,
          alignBottomToZero: true,
        });
        const floorY = getChapterFloorHeight(1, 0, -86.5);
        entrance.position.set(0, floorY - 0.35, -86.5);
        this.chapterGroup.add(entrance);
      } catch (err) {
        console.warn('[GLB] Не удалось загрузить stone_entrance.glb:', err);
      }
    }
  }

  private async populateAmbientFishSchool(packUrl: string): Promise<void> {
    const speciesList = GITHUB_MODEL_CATALOG.ambientFishSpecies;
    const placements = [
      { x: -7.5, y: 2.2, z: -12, rx: 2.6, rz: 4.0, spd: 0.48 },
      { x: 8.2, y: 2.6, z: -16, rx: 2.4, rz: 3.6, spd: -0.42 },
      { x: -9.0, y: 1.8, z: -32, rx: 2.8, rz: 4.4, spd: 0.52 },
      { x: 9.2, y: 3.0, z: -38, rx: 2.2, rz: 3.8, spd: -0.46 },
      { x: -6.5, y: 2.4, z: -48, rx: 2.5, rz: 3.5, spd: 0.44 },
      { x: 7.4, y: 2.1, z: -52, rx: 2.4, rz: 4.1, spd: -0.5 },
      { x: -8.5, y: 1.6, z: -70, rx: 2.3, rz: 3.6, spd: 0.4 },
      { x: 8.6, y: 1.9, z: -74, rx: 2.5, rz: 3.9, spd: -0.45 },
    ];

    try {
      const results = await Promise.all(
        placements.map(async (p, idx) => {
          const sp = speciesList[idx % speciesList.length];
          const size = 1.05 + (idx % 3) * 0.18;
          const qualFish = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
          const isLowFish = qualFish.id === 'very_low' || qualFish.id === 'low';
          const loaded = await loadTropicalFishFromZip(packUrl, sp, size, isLowFish);
          return { p, loaded, phase: idx * 1.15 };
        }),
      );
      if (this.disposed) return;

      const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
      const maxVisibleFish = Math.round(results.length * qual.ambientActorFraction);
      results.forEach((item, idx) => {
        item.loaded.group.visible = idx < maxVisibleFish;
        this.ambientFishGroup.add(item.loaded.group);
        this.ambientFishSchool.push({
          group: item.loaded.group,
          swimHandle: item.loaded.swimHandle,
          anchorX: item.p.x,
          anchorY: item.p.y,
          anchorZ: item.p.z,
          radiusX: item.p.rx,
          radiusZ: item.p.rz,
          speed: item.p.spd,
          phase: item.phase,
        });
      });
    } catch (err) {
      console.warn('[FBX] Фоновые рифовые рыбки не загрузились:', err);
    }
  }

  private buildSeabedDetails(chapterId: ChapterId): void {
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const density = this.isSoftwareGl ? Math.min(0.45, qual.foliageDensity) : qual.foliageDensity;
    const shadowsEnabled = qual.shadows && !this.isSoftwareGl;

    // Skip micro-clutter (pebbles & shells) on very_low & low quality presets for peak FPS
    if (density > 0.35) {
      // 1. River/seafloor pebbles scattered across the sandy floor
      const pebbleCount = Math.max(16, Math.round(180 * density));
      const pebbleGeo = new THREE.DodecahedronGeometry(0.18, density < 0.5 ? 0 : 1);
      const pebbleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.74,
        metalness: 0.04,
        envMapIntensity: qual.envMapIntensity * 0.3,
      });
      const pebbleInst = new THREE.InstancedMesh(pebbleGeo, pebbleMat, pebbleCount);
      pebbleInst.receiveShadow = shadowsEnabled;
      const pebblePalette = ['#314c59', '#3f5b66', '#4c6269', '#2b404c', '#576366'];

      for (let i = 0; i < pebbleCount; i++) {
        const rx = Math.sin(i * 19.37) * 15.5;
        const rz = 9 - ((i * 11.73 + (i % 7) * 2.3) % 96);
        const ry = getChapterFloorHeight(chapterId, rx, rz) - 0.02;
        _dummy.position.set(rx, ry, rz);
        _dummy.rotation.set(
          ((i * 13) % 10) * 0.04,
          ((i * 53) % 360) * (Math.PI / 180),
          ((i * 17) % 10) * 0.04,
        );
        const s = 0.7 + ((i * 29) % 100) / 100 * 1.35;
        _dummy.scale.set(s * 1.25, s * 0.5, s * 0.95);
        _dummy.updateMatrix();
        pebbleInst.setMatrixAt(i, _dummy.matrix);
        _color.set(pebblePalette[i % pebblePalette.length]);
        pebbleInst.setColorAt(i, _color);
      }
      pebbleInst.instanceMatrix.needsUpdate = true;
      if (pebbleInst.instanceColor) pebbleInst.instanceColor.needsUpdate = true;
      pebbleInst.computeBoundingSphere();
      pebbleInst.matrixAutoUpdate = false;
      pebbleInst.updateMatrix();
      this.chapterGroup.add(pebbleInst);
      this.chapterDisposables.push(pebbleGeo, pebbleMat);

      // 2. Small seashells scattered along sand ripples
      const shellCount = Math.max(12, Math.round(110 * density));
      const shellGeo = new THREE.SphereGeometry(
        0.14,
        density < 0.5 ? 6 : 10,
        density < 0.5 ? 4 : 6,
        0,
        Math.PI,
        0,
        Math.PI * 0.55,
      );
      shellGeo.rotateX(-Math.PI / 2);
      const shellMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.52,
        metalness: 0.06,
        envMapIntensity: qual.envMapIntensity * 0.3,
        side: THREE.DoubleSide,
      });
      const shellInst = new THREE.InstancedMesh(shellGeo, shellMat, shellCount);
      shellInst.receiveShadow = shadowsEnabled;
      const shellPalette = ['#6b777c', '#7a756f', '#606d73', '#82776e'];

      for (let i = 0; i < shellCount; i++) {
        const rx = Math.cos(i * 27.13) * 14.5;
        const rz = 8 - ((i * 17.89 + (i % 5) * 3.1) % 94);
        const ry = getChapterFloorHeight(chapterId, rx, rz) + 0.01;
        _dummy.position.set(rx, ry, rz);
        _dummy.rotation.set(
          (((i * 7) % 5) - 2) * 0.06,
          ((i * 71) % 360) * (Math.PI / 180),
          (((i * 11) % 5) - 2) * 0.06,
        );
        const s = 0.75 + ((i * 23) % 100) / 100 * 0.9;
        _dummy.scale.set(s * 1.15, s * 0.6, s);
        _dummy.updateMatrix();
        shellInst.setMatrixAt(i, _dummy.matrix);
        _color.set(shellPalette[i % shellPalette.length]);
        shellInst.setColorAt(i, _color);
      }
      shellInst.instanceMatrix.needsUpdate = true;
      if (shellInst.instanceColor) shellInst.instanceColor.needsUpdate = true;
      shellInst.computeBoundingSphere();
      shellInst.matrixAutoUpdate = false;
      shellInst.updateMatrix();
      this.chapterGroup.add(shellInst);
      this.chapterDisposables.push(shellGeo, shellMat);
    }

    // 3. Small swaying seagrass / kelp tufts on the reef seabed
    const grassCount = Math.max(16, Math.round(160 * density));
    const grassGeo = new THREE.PlaneGeometry(0.13, 0.95, 1, density < 0.3 ? 3 : 5);
    grassGeo.translate(0, 0.46, 0);
    const gPos = grassGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const y = gPos.getY(i);
      const h01 = Math.max(0, y / 0.95);
      gPos.setX(i, gPos.getX(i) * (1 - h01 * 0.82));
      gPos.setZ(i, Math.pow(h01, 2) * 0.14);
    }
    grassGeo.computeVertexNormals();

    const grassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.0,
      envMapIntensity: qual.envMapIntensity * 0.25,
      side: THREE.DoubleSide,
    });
    const timeUniform = this.seagrassTimeUniform;
    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uSeagrassTime = timeUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uSeagrassTime;`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float bladeH = clamp(position.y, 0.0, 1.0);
          #ifdef USE_INSTANCING
            float instPhase = instanceMatrix[3][0] * 0.7 + instanceMatrix[3][2] * 0.5;
          #else
            float instPhase = 0.0;
          #endif
          transformed.x += sin(uSeagrassTime * 1.45 + instPhase + bladeH * 2.2) * bladeH * 0.16;`,
        );
    };
    grassMat.customProgramCacheKey = () => 'seabed-seagrass-sway';

    const grassInst = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    const grassPalette =
      chapterId === 5
        ? ['#2a1b24', '#38222a', '#1d141a', '#42282d']
        : chapterId === 6
          ? ['#0d2b36', '#143c4a', '#091f29', '#194d5c']
          : chapterId === 7
            ? ['#153242', '#1c4254', '#0f2736', '#245266']
            : chapterId === 4
              ? ['#14333d', '#1c444d', '#0f2832', '#204d52']
              : chapterId === 3 || chapterId === 8
                ? ['#154a3e', '#1c5e4e', '#103b34', '#236954']
                : ['#1f4b48', '#26574b', '#1b4044', '#2c5442'];
    for (let i = 0; i < grassCount; i++) {
      const rx = Math.sin(i * 13.71) * 15.2;
      const rz = 9 - ((i * 14.37 + (i % 9) * 1.9) % 95);
      const ry = getChapterFloorHeight(chapterId, rx, rz) - 0.04;
      _dummy.position.set(rx, ry, rz);
      _dummy.rotation.set(
        (((i * 7) % 7) - 3) * 0.04,
        ((i * 67) % 360) * (Math.PI / 180),
        (((i * 11) % 7) - 3) * 0.04,
      );
      const s = 0.65 + ((i * 31) % 100) / 100 * 1.05;
      _dummy.scale.set(s, s * (0.8 + ((i * 5) % 4) * 0.25), s);
      _dummy.updateMatrix();
      grassInst.setMatrixAt(i, _dummy.matrix);
      _color.set(grassPalette[i % grassPalette.length]);
      grassInst.setColorAt(i, _color);
    }
    grassInst.instanceMatrix.needsUpdate = true;
    if (grassInst.instanceColor) grassInst.instanceColor.needsUpdate = true;
    grassInst.computeBoundingSphere();
    grassInst.matrixAutoUpdate = false;
    grassInst.updateMatrix();
    this.chapterGroup.add(grassInst);
    this.chapterDisposables.push(grassGeo, grassMat);
  }

  private buildTrawlerNetBarricade(maxAniso: number): void {
    const netTex = createTrawlerNetTexture(maxAniso);
    this.chapterDisposables.push(netTex.map, netTex.alphaMap, netTex.bumpMap);

    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: netTex.map,
      alphaMap: netTex.alphaMap,
      bumpMap: netTex.bumpMap,
      bumpScale: 0.45,
      transparent: true,
      alphaTest: 0.14,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: 0.1,
    });
    this.chapterDisposables.push(netMat);

    const minX = -17;
    const maxX = 17;
    const minY = -3.5;
    const maxY = 11.5;

    const addPanel = (x1: number, x2: number, y1: number, y2: number, zOffset = 0) => {
      const w = x2 - x1;
      const h = y2 - y1;
      if (w <= 0.1 || h <= 0.1) return;
      const geo = new THREE.PlaneGeometry(w, h);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * (w / 4.2), uv.getY(i) * (h / 4.2));
      }
      const mesh = new THREE.Mesh(geo, netMat);
      mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, CHAPTER_1_NET_Z + zOffset);
      mesh.userData.interactable = {
        type: 'net',
        label: t(this.gameSettings.language, 'labelNet'),
      } satisfies InteractableMeta;
      this.chapterGroup.add(mesh);
      this.interactiveObjects.push(mesh);
      this.chapterDisposables.push(geo);
    };

    const sortedWins = [...CHAPTER_1_NET_WINDOWS].sort((a, b) => a.x - b.x);
    let cursorX = minX;

    const ropeTrimMat = new THREE.MeshStandardMaterial({
      color: 0x3b4449,
      bumpMap: netTex.bumpMap,
      bumpScale: 0.35,
      roughness: 0.9,
      metalness: 0.02,
      envMapIntensity: 0.08,
    });
    this.chapterDisposables.push(ropeTrimMat);

    for (const win of sortedWins) {
      const wx1 = win.x - win.halfWidth;
      const wx2 = win.x + win.halfWidth;
      const wy1 = win.y - win.halfHeight;
      const wy2 = win.y + win.halfHeight;

      addPanel(cursorX, wx1, minY, maxY);
      addPanel(wx1, wx2, wy2, maxY);
      addPanel(wx1, wx2, minY, wy1);

      const topBarGeo = new THREE.CylinderGeometry(0.055, 0.055, win.halfWidth * 2, 6);
      topBarGeo.rotateZ(Math.PI / 2);
      const sideBarGeo = new THREE.CylinderGeometry(0.055, 0.055, win.halfHeight * 2, 6);

      const topRope = new THREE.Mesh(topBarGeo, ropeTrimMat);
      topRope.position.set(win.x, wy2, CHAPTER_1_NET_Z);
      const botRope = new THREE.Mesh(topBarGeo, ropeTrimMat);
      botRope.position.set(win.x, wy1, CHAPTER_1_NET_Z);
      const leftRope = new THREE.Mesh(sideBarGeo, ropeTrimMat);
      leftRope.position.set(wx1, win.y, CHAPTER_1_NET_Z);
      const rightRope = new THREE.Mesh(sideBarGeo, ropeTrimMat);
      rightRope.position.set(wx2, win.y, CHAPTER_1_NET_Z);

      this.chapterGroup.add(topRope, botRope, leftRope, rightRope);
      this.chapterDisposables.push(topBarGeo, sideBarGeo);

      cursorX = wx2;
    }
    addPanel(cursorX, maxX, minY, maxY);
    addPanel(-16, 16, 6.2, 12.0, 1.3);
  }

  private applyActiveSkinVisuals(): void {
    const skin = GLOW_SKINS[this.campaign.activeSkin];
    this.playerRig.pointLight.color.set(skin.color);
    this.playerRig.lureMat.emissive.set(skin.color);
    this.playerRig.lureMat.color.set(skin.color);
    this.callWaveMat.color.set(skin.color);
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp, { capture: true });
    window.addEventListener('pointerup', this.handlePointerUp, { capture: true });
    window.addEventListener('pointercancel', this.handlePointerCancel, { capture: true });
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('mouseleave', this.handleDocumentMouseLeave);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('resize', this.handleResize);
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    this.container.addEventListener('pointermove', this.handlePointerMove);
    this.container.addEventListener('pointerleave', this.handlePointerLeave);
    this.container.addEventListener('dblclick', this.handleDoubleClick);
    this.container.addEventListener('contextmenu', this.handleContextMenu);
    this.container.addEventListener('wheel', this.handleWheel, { passive: false });
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd);
    this.container.addEventListener('touchcancel', this.handleTouchEnd);
  }

  private normalizeMoveCode(e: KeyboardEvent): string {
    if (e.code) return e.code;
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'ц') return 'KeyW';
    if (k === 's' || k === 'ы') return 'KeyS';
    if (k === 'a' || k === 'ф') return 'KeyA';
    if (k === 'd' || k === 'в') return 'KeyD';
    if (k === 'c' || k === 'с') return 'KeyC';
    if (k === 'e' || k === 'у') return 'KeyE';
    return e.key;
  }

  private isMovementKey(code: string): boolean {
    const kb = this.controlSettings.keyBindings;
    if (
      code === kb.forward ||
      code === kb.backward ||
      code === kb.turnLeft ||
      code === kb.turnRight ||
      code === kb.ascend ||
      code === kb.descend ||
      code === kb.dash
    ) {
      return true;
    }
    return (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'ShiftLeft' ||
      code === 'ControlLeft'
    );
  }

  private isBoundMovementDown(action: GameAction, secondary?: string): boolean {
    const primary = this.controlSettings.keyBindings[action];
    if (this.keys.has(primary)) return true;
    if (!secondary) return false;
    const allBound = Object.values(this.controlSettings.keyBindings);
    if (!allBound.includes(secondary) && this.keys.has(secondary)) {
      return true;
    }
    return false;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.metaKey) return;
    this.audio.unlock();
    const code = this.normalizeMoveCode(e);
    const kb = this.controlSettings.keyBindings;

    if (code === kb.fullscreen && !e.repeat) {
      const activeTag = document.activeElement?.tagName;
      if (activeTag !== 'INPUT' && activeTag !== 'SELECT') {
        e.preventDefault();
        this.clearTransientInputs();
        this.onToggleFullscreen?.();
        return;
      }
    }

    if (this.screenState === 'title') {
      if (code === 'Enter' || code === 'Space') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'BUTTON') {
          return;
        }
        e.preventDefault();
        this.startGame();
      }
      return;
    }

    if (code === kb.stopFish) {
      if (this.screenState === 'playing') {
        e.preventDefault();
        if (
          this.swimTarget !== null ||
          this.playerVel.lengthSq() > 0.005 ||
          this.pointerDown ||
          this.hasActiveMovementKey()
        ) {
          this.stopFish(true);
          return;
        }
        if (kb.stopFish === 'Escape' || kb.stopFish === kb.pause) {
          this.pauseGame();
          return;
        }
        return;
      } else if (
        this.screenState === 'paused' &&
        (kb.stopFish === 'Escape' || kb.stopFish === kb.pause)
      ) {
        e.preventDefault();
        this.resumeGame();
        return;
      }
    }

    if (code === kb.pause) {
      if (this.screenState === 'playing') {
        e.preventDefault();
        this.pauseGame();
        return;
      } else if (this.screenState === 'paused') {
        e.preventDefault();
        this.resumeGame();
        return;
      }
    }

    if (code === kb.mute && !e.repeat) {
      this.toggleMute();
      return;
    }

    if (this.screenState !== 'playing') return;

    if (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'Space'
    ) {
      e.preventDefault();
    }

    if (code === kb.restart && !e.repeat) {
      this.restartChapter();
      return;
    }

    if (code === kb.call && !e.repeat) {
      this.triggerCall();
      return;
    }

    if (code === kb.dash && !e.repeat) {
      this.triggerDash();
      return;
    }

    if (this.isMovementKey(code)) {
      if (!this.controlSettings.keyboardEnabled) return;
      if (this.swimTarget !== null) {
        this.clearSwimTarget();
      }
    }

    this.keys.add(code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(this.normalizeMoveCode(e));
  };

  private hasActiveMovementKey(): boolean {
    if (!this.controlSettings.keyboardEnabled) return false;
    return (
      this.isBoundMovementDown('forward', 'ArrowUp') ||
      this.isBoundMovementDown('backward', 'ArrowDown') ||
      this.isBoundMovementDown('turnLeft', 'ArrowLeft') ||
      this.isBoundMovementDown('turnRight', 'ArrowRight') ||
      this.isBoundMovementDown('ascend') ||
      this.isBoundMovementDown('descend') ||
      this.keys.has('ShiftLeft') ||
      this.keys.has('ControlLeft')
    );
  }

  private clearTransientInputs(): void {
    this.keys.clear();
    this.hasLastPointer = false;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.pointerDown = false;
    this.holdSwimButton = null;
    this.pointerDragButtonDown = false;
    this.panDragActive = false;
    this.virtualStickX = 0;
    this.virtualStickY = 0;
    this.virtualAscend = false;
    this.virtualDescend = false;
    this.bufferedCallTimer = 0;
    this.bufferedDashTimer = 0;
  }

  private handleBlur = (): void => {
    this.clearTransientInputs();
  };

  private handleDocumentMouseLeave = (e: MouseEvent): void => {
    if (e.buttons === 0) {
      this.pointerDown = false;
      this.holdSwimButton = null;
      this.pointerDragButtonDown = false;
      this.panDragActive = false;
      this.hasLastPointer = false;
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.clearTransientInputs();
    } else {
      this.lastTimeMs = performance.now();
    }
  };

  private handlePointerCancel = (): void => {
    this.pointerDown = false;
    this.holdSwimButton = null;
    this.pointerDragButtonDown = false;
    this.panDragActive = false;
    this.hasLastPointer = false;
  };

  private handlePointerLockChange = (): void => {
    if (document.pointerLockElement !== this.renderer.domElement) {
      this.clearTransientInputs();
    }
  };

  private handleFullscreenChange = (): void => {
    this.clearTransientInputs();
  };

  private handleContextMenu = (e: MouseEvent): void => {
    this.pointerDown = false;
    this.holdSwimButton = null;
    this.pointerDragButtonDown = false;
    if (this.screenState === 'playing') {
      e.preventDefault();
    }
  };

  private eventButtonToMouseBinding(button: number): MouseBinding {
    if (button === 0) return 'LMB';
    if (button === 1) return 'MMB';
    if (button === 2) return 'RMB';
    return 'NONE';
  }

  private setRaycasterFromScreenPoint(clientX: number, clientY: number): boolean {
    if (document.pointerLockElement === this.renderer.domElement) {
      this.pointerNdc.set(0, 0);
    } else {
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      this.pointerNdc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
    }
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    return true;
  }

  private setAutopilotDestination(
    x: number,
    y: number,
    z: number,
    toastMessage = t(this.gameSettings.language, 'toastAutopilot'),
  ): void {
    const safeX = Math.max(-14.6, Math.min(14.6, x));
    const lockedGateZ =
      this.activeSceneChapter === 2 && !this.pelicanGateOpen
        ? CHAPTER_2_PELICAN_GATE_Z
        : this.activeSceneChapter === 3 && !this.ch3DebrisOpen
          ? CHAPTER_3_DEBRIS_GATE_Z
          : this.activeSceneChapter === 4 && !this.ch4GateOpen
            ? CHAPTER_4_CHARYBDIS_GATE_Z
            : this.activeSceneChapter === 5 && !this.ch5GateOpen
              ? CHAPTER_5_GATE_Z
              : this.activeSceneChapter === 7 && !this.ch7WhaleFreed
                ? CHAPTER_7_WHALE_GATE_Z
                : this.activeSceneChapter === 8 && !this.ch8ShortcutOpen
                  ? CHAPTER_8_SHORTCUT_GATE_Z
                  : this.activeSceneChapter === 9 && !this.ch9BulkheadOpen
                    ? CHAPTER_9_BULKHEAD_Z
                    : null;
    const minSafeZ = lockedGateZ !== null ? lockedGateZ + 1.8 : -91.0;
    const safeZ = Math.max(minSafeZ, Math.min(13.0, z));
    const floorY = getChapterFloorHeight(this.activeSceneChapter, safeX, safeZ);
    const clamped = clampPlayerPositionForChapter(this.activeSceneChapter, {
      x: safeX,
      y: Math.min(9.8, Math.max(y, floorY + 1.25)),
      z: safeZ,
    });
    this.swimTargetBuf.set(clamped.x, clamped.y, clamped.z);
    this.swimTarget = this.swimTargetBuf;
    this.autopilotBestDistSq = Infinity;
    this.autopilotStallSec = 0;
    this.targetBeaconGroup.position.copy(this.swimTargetBuf);
    this.targetBeaconGroup.visible = true;
    this.showToast(toastMessage);
    this.emitHUD(true);
  }

  private moveToScreenPoint(clientX: number, clientY: number): void {
    if (!this.setRaycasterFromScreenPoint(clientX, clientY)) return;
    const hits = this.raycaster.intersectObjects(this.clickTargetMeshes, true);
    const validHit = hits.find((h) => h.distance >= 1.8 && h.distance <= 58);

    if (validHit) {
      _vec3.copy(validHit.point);
      const floorY = getChapterFloorHeight(
        this.activeSceneChapter,
        _vec3.x,
        _vec3.z,
      );
      _vec3.y = Math.max(_vec3.y + 0.9, floorY + 1.15);
    } else {
      // Intersect horizontal swim plane at player height so double-clicks near open water stay predictable
      _swimPlane.constant = -this.playerPos.y;
      const hitPlane = this.raycaster.ray.intersectPlane(_swimPlane, _planeHit);
      if (hitPlane && _planeHit.distanceToSquared(this.camera.position) < 62 * 62) {
        _vec3.copy(_planeHit);
        const distFromPlayer = _vec3.distanceTo(this.playerPos);
        if (distFromPlayer > 26) {
          _vec3.sub(this.playerPos).setLength(26).add(this.playerPos);
        }
      } else {
        _vec3
          .copy(this.playerPos)
          .addScaledVector(this.raycaster.ray.direction, 14);
      }
      const floorY = getChapterFloorHeight(
        this.activeSceneChapter,
        _vec3.x,
        _vec3.z,
      );
      _vec3.y = Math.max(_vec3.y, floorY + 1.15);
    }
    this.setAutopilotDestination(_vec3.x, _vec3.y, _vec3.z);
  }

  private isObjectTreeVisible(obj: THREE.Object3D): boolean {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if (!cur.visible) return false;
      cur = cur.parent;
    }
    return true;
  }

  private findInteractableMeta(obj: THREE.Object3D): {
    root: THREE.Object3D;
    meta: InteractableMeta;
  } | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if (cur.userData?.interactable) {
        return { root: cur, meta: cur.userData.interactable as InteractableMeta };
      }
      cur = cur.parent;
    }
    return null;
  }

  private persistCampaignSnapshot(): void {
    const saved = saveCampaignProgress(
      this.campaign,
      this.savedHighestChapter as ChapterId,
    );
    this.savedHighestChapter = saved.highestChapter;
    this.savedPearls = saved.pearls;
  }

  private completeBorisQuestAndOpenGate(): void {
    this.borisMugCarried = false;
    this.pelicanGateOpen = true;
    const wasDone = this.campaign.quests.borisMug;
    this.campaign = completeBorisMugQuest(this.campaign);
    this.audio.playGateOpen();
    this.persistCampaignSnapshot();

    const borisIdx = this.npcs.findIndex((n) => n.id === 'boris');
    if (borisIdx !== -1) {
      const boris = this.npcs[borisIdx];
      this.npcs[borisIdx] = {
        ...boris,
        revealed: true,
        talkTimer: 6.0,
        activeText: boris.panicLines ?? boris.lines,
      };
    }

    const lang = this.gameSettings.language;
    this.showToast(
      wasDone
        ? t(lang, 'toastBorisGateOpened')
        : t(lang, 'toastBorisQuestComplete'),
    );
    this.emitHUD(true);
  }

  private completeCrabQuestAndClearDebris(fromCrabsTurnIn: boolean): void {
    const wasDone = this.campaign.quests.crabDebris;
    this.ch3DebrisOpen = true;
    this.audio.playGateOpen();

    if (fromCrabsTurnIn && !wasDone) {
      this.campaign = completeCrabDebrisQuest(this.campaign);
      this.campaign = {
        ...this.campaign,
        pearls: this.campaign.pearls + 2,
      };
      this.persistCampaignSnapshot();
    } else if (!wasDone && this.collectedScrapIds.length >= CHAPTER_3_SCRAPS.length) {
      this.campaign = completeCrabDebrisQuest(this.campaign);
      this.persistCampaignSnapshot();
    }

    const crabIdx = this.npcs.findIndex((n) => n.id === 'hermit_crabs');
    if (crabIdx !== -1) {
      const crabs = this.npcs[crabIdx];
      this.npcs[crabIdx] = {
        ...crabs,
        revealed: true,
        talkTimer: 6.0,
        activeText: crabs.panicLines ?? crabs.lines,
      };
    }

    const lang = this.gameSettings.language;
    this.showToast(
      fromCrabsTurnIn && !wasDone
        ? t(lang, 'toastCrabQuestCompleteBonus')
        : t(lang, 'toastCrabDebrisCleared'),
    );
    this.emitHUD(true);
  }

  private completeWhaleQuestAndOpenGate(fromCrabsTurnIn: boolean): void {
    const wasDone = this.campaign.quests.whaleContainer;
    this.ch4GateOpen = true;
    this.whaleContainerCarried = false;
    this.audio.playGateOpen();

    if (fromCrabsTurnIn && !wasDone) {
      this.campaign = completeWhaleContainerQuest(this.campaign);
      this.campaign = {
        ...this.campaign,
        pearls: this.campaign.pearls + 2,
      };
      this.persistCampaignSnapshot();
    } else if (!wasDone) {
      this.campaign = completeWhaleContainerQuest(this.campaign);
      this.persistCampaignSnapshot();
    }

    const criticIdx = this.npcs.findIndex((n) => n.id === 'critic_crabs');
    if (criticIdx !== -1) {
      const critics = this.npcs[criticIdx];
      this.npcs[criticIdx] = {
        ...critics,
        revealed: true,
        talkTimer: 6.0,
        activeText: critics.panicLines ?? critics.lines,
      };
    }

    const lang = this.gameSettings.language;
    this.showToast(
      fromCrabsTurnIn && !wasDone
        ? t(lang, 'toastCriticQuestCompleteBonus')
        : t(lang, 'toastCharybdisOpened'),
    );
    this.emitHUD(true);
  }

  private completeQueenQuestAndOpenGate(fromQueenTurnIn: boolean): void {
    const wasDone = !!this.campaign.quests.queenEscort;
    this.ch5GateOpen = true;
    this.ch5LureCarried = false;
    this.queenEscortReady = true;
    if (this.ch5LureMesh) {
      this.ch5LureMesh.visible = false;
    }
    this.audio.playGateOpen();

    if (fromQueenTurnIn && !wasDone) {
      this.campaign = completeQueenEscortQuest(this.campaign);
      this.campaign = {
        ...this.campaign,
        pearls: this.campaign.pearls + 2,
      };
      this.persistCampaignSnapshot();
    } else if (!wasDone) {
      this.campaign = completeQueenEscortQuest(this.campaign);
      this.persistCampaignSnapshot();
    }

    const queenIdx = this.npcs.findIndex((n) => n.id === 'queen_angler');
    if (queenIdx !== -1) {
      const queen = this.npcs[queenIdx];
      this.npcs[queenIdx] = {
        ...queen,
        revealed: true,
        talkTimer: 6.0,
        activeText: queen.panicLines ?? queen.lines,
      };
    }

    const lang = this.gameSettings.language;
    this.showToast(
      fromQueenTurnIn && !wasDone
        ? t(lang, 'toastQueenEscortStart')
        : t(lang, 'toastCh5GateOpened'),
    );
    this.emitHUD(true);
  }

  private reclaimEggAtAltar(): void {
    if (this.ch6EggReclaimed) return;
    this.ch6EggReclaimed = true;
    this.campaign = triggerEggPickupAscent(this.campaign);
    this.eggMesh.visible = false;
    this.carriedEggRig.visible = true;
    this.spawnBubbleBurst(this.eggMesh.position, 22, 1.35);
    this.audio.playLullabyMotif();
    this.persistCampaignSnapshot();

    const queenIdx = this.npcs.findIndex((n) => n.id === 'queen_angler');
    if (queenIdx !== -1) {
      const queen = this.npcs[queenIdx];
      this.npcs[queenIdx] = {
        ...queen,
        revealed: true,
        talkTimer: 6.5,
        activeText: queen.panicLines ?? queen.lines,
      };
    }

    this.showToast(t(this.gameSettings.language, 'toastEggReclaimed'));
    this.emitHUD(true);
  }

  private completeWhaleRescueAndOpenGate(): void {
    const wasDone = !!this.campaign.quests.whaleRescued;
    this.ch7WhaleFreed = true;
    if (this.youngWhaleRig) {
      this.youngWhaleRig.cableGroup.visible = false;
    }
    this.squid.stunTimer = Math.max(this.squid.stunTimer, 4.0);
    this.audio.playWhaleSong();
    this.audio.playGateOpen();

    if (!wasDone) {
      this.campaign = completeWhaleRescueQuest(this.campaign);
      this.campaign = {
        ...this.campaign,
        pearls: this.campaign.pearls + 2,
      };
      this.persistCampaignSnapshot();
    }

    const whaleIdx = this.npcs.findIndex((n) => n.id === 'young_whale');
    if (whaleIdx !== -1) {
      const whale = this.npcs[whaleIdx];
      this.npcs[whaleIdx] = {
        ...whale,
        revealed: true,
        talkTimer: 6.5,
        activeText: whale.panicLines ?? whale.lines,
      };
    }

    this.showToast(t(this.gameSettings.language, 'toastWhaleRescued'));
    this.emitHUD(true);
  }

  private completeBorisShortcutAndOpenGate(): void {
    const wasDone = !!this.campaign.quests.borisShortcut;
    this.ch8ShortcutOpen = true;
    this.audio.playGateOpen();

    if (!wasDone) {
      this.campaign = completeBorisShortcutQuest(this.campaign);
      this.persistCampaignSnapshot();
    }

    const borisIdx = this.npcs.findIndex((n) => n.id === 'boris');
    if (borisIdx !== -1) {
      const boris = this.npcs[borisIdx];
      this.npcs[borisIdx] = {
        ...boris,
        revealed: true,
        talkTimer: 6.0,
        activeText: boris.panicLines ?? boris.lines,
      };
    }

    this.showToast(t(this.gameSettings.language, 'toastBorisShortcutOpen'));
    this.emitHUD(true);
  }

  private completeKeshaAlertAndOpenGate(fromBlast: boolean): void {
    const wasDone = !!this.campaign.quests.keshaAlert;
    this.ch9BulkheadOpen = true;
    this.audio.playGateOpen();

    if (!wasDone) {
      this.campaign = completeKeshaAlertQuest(this.campaign);
      this.persistCampaignSnapshot();
    }

    const keshaIdx = this.npcs.findIndex((n) => n.id === 'kesha');
    if (keshaIdx !== -1) {
      const kesha = this.npcs[keshaIdx];
      this.npcs[keshaIdx] = {
        ...kesha,
        revealed: true,
        talkTimer: 6.0,
        activeText: kesha.panicLines ?? kesha.lines,
      };
    }

    const lang = this.gameSettings.language;
    this.showToast(
      fromBlast ? t(lang, 'toastKeshaStunBlast') : t(lang, 'toastCh9GateOpened'),
    );
    this.emitHUD(true);
  }

  private interactAtScreenPoint(clientX: number, clientY: number): void {
    if (!this.setRaycasterFromScreenPoint(clientX, clientY)) return;
    const lang = this.gameSettings.language;

    const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);
    let picked: { root: THREE.Object3D; meta: InteractableMeta; dist: number } | null =
      null;

    for (const h of hits) {
      if (h.distance < 1.5 || h.distance > 65) continue;
      if (!this.isObjectTreeVisible(h.object)) continue;
      const found = this.findInteractableMeta(h.object);
      if (found) {
        picked = { ...found, dist: h.distance };
        break;
      }
    }

    if (!picked) {
      let bestRayDist = 2.4;
      for (const obj of this.interactiveObjects) {
        if (!this.isObjectTreeVisible(obj)) continue;
        const meta = obj.userData?.interactable as InteractableMeta | undefined;
        if (!meta || meta.type === 'net') continue;
        obj.getWorldPosition(_vec3);
        const camDist = _vec3.distanceTo(this.camera.position);
        if (camDist < 2 || camDist > 52) continue;
        const perpDist = this.raycaster.ray.distanceToPoint(_vec3);
        if (perpDist < bestRayDist) {
          bestRayDist = perpDist;
          picked = { root: obj, meta, dist: camDist };
        }
      }
    }

    if (!picked) {
      this.showToast(t(lang, 'toastRightClickHint'));
      this.emitHUD(true);
      return;
    }

    const { root, meta } = picked;

    if (meta.type === 'pearl' && meta.id) {
      if (this.campaign.collectedPearlIds.includes(meta.id)) return;
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 8.5) {
        this.campaign = collectPearl(this.campaign, meta.id);
        root.visible = false;
        this.audio.playPearlPickup();
        this.persistCampaignSnapshot();
        this.showToast(t(lang, 'toastPearlCollected', { pearls: this.campaign.pearls }));
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.35,
          _vec3.z,
          t(lang, 'toastGoingToPearl'),
        );
      }
      return;
    }

    if (meta.type === 'lore_relic' && meta.id) {
      if (this.campaign.collectedRelicIds.includes(meta.id)) return;
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 9.0) {
        const res = collectLoreRelic(this.campaign, meta.id);
        this.campaign = res.state;
        root.visible = false;
        this.spawnBubbleBurst(_vec3, 14, 1.25);
        this.audio.playPearlPickup();
        this.persistCampaignSnapshot();
        const relic = CHAPTER_LORE_RELICS[this.activeSceneChapter];
        const relicTitle = relic ? getLoreRelicText(relic, lang).title : meta.label;
        this.showToast(
          t(lang, 'toastLoreRelicCollected', { title: relicTitle }),
        );
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.35,
          _vec3.z,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'mug') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 8.5) {
        this.borisMugCarried = true;
        root.visible = false;
        this.audio.playPearlPickup();
        this.showToast(t(lang, 'toastMugFound'));
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.35,
          _vec3.z,
          t(lang, 'toastGoingToMug'),
        );
      }
      return;
    }

    if (meta.type === 'gate_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.pelicanGateOpen) {
          this.pelicanGateOpen = true;
          this.audio.playGateOpen();
          if (this.borisMugCarried && !this.campaign.quests.borisMug) {
            this.campaign = completeBorisMugQuest(this.campaign);
            this.borisMugCarried = false;
            this.persistCampaignSnapshot();
            this.showToast(t(lang, 'toastGateOpenedWithDash'));
          } else {
            this.showToast(t(lang, 'toastGateOpening'));
          }
          this.emitHUD(true);
        } else {
          this.showToast(t(lang, 'toastGateAlreadyOpen'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastGoingToLever'),
        );
      }
      return;
    }

    if (meta.type === 'scrap' && meta.id) {
      if (this.collectedScrapIds.includes(meta.id)) return;
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 8.5) {
        this.collectedScrapIds.push(meta.id);
        root.visible = false;
        this.audio.playPearlPickup();
        const count = this.collectedScrapIds.length;
        this.showToast(
          count >= CHAPTER_3_SCRAPS.length
            ? t(lang, 'toastScrapAllFound')
            : t(lang, 'toastScrapFound', { count, total: CHAPTER_3_SCRAPS.length }),
        );
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.35,
          _vec3.z,
          t(lang, 'toastGoingToScrap'),
        );
      }
      return;
    }

    if (meta.type === 'crane_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.ch3DebrisOpen) {
          this.completeCrabQuestAndClearDebris(false);
        } else {
          this.showToast(t(lang, 'toastGateAlreadyOpen'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastGoingToLever'),
        );
      }
      return;
    }

    if (meta.type === 'whale_container') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 8.5) {
        this.whaleContainerCarried = true;
        root.visible = false;
        this.audio.playPearlPickup();
        this.showToast(t(lang, 'toastWhaleContainerFound'));
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.35,
          _vec3.z,
          t(lang, 'toastGoingToWhaleContainer'),
        );
      }
      return;
    }

    if (meta.type === 'charybdis_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.ch4GateOpen) {
          this.completeWhaleQuestAndOpenGate(false);
        } else {
          this.showToast(t(lang, 'toastGateAlreadyOpen'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastGoingToLever'),
        );
      }
      return;
    }

    if (meta.type === 'lure_pearl') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 8.5) {
        this.ch5LureCarried = true;
        root.visible = false;
        this.audio.playPearlPickup();
        this.showToast(t(lang, 'toastCh5LureFound'));
        this.emitHUD(true);
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 0.4,
          _vec3.z,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'ch5_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.ch5GateOpen) {
          this.completeQueenQuestAndOpenGate(false);
        } else {
          this.showToast(t(lang, 'toastCh5GateOpened'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'egg_altar') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10.5) {
        this.reclaimEggAtAltar();
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.8,
          _vec3.z + 2.6,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'whale_valve' || meta.type === 'ch7_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10.5) {
        if (!this.ch7WhaleFreed) {
          this.completeWhaleRescueAndOpenGate();
        } else {
          this.showToast(t(lang, 'toastWhaleRescued'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'ch8_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.ch8ShortcutOpen) {
          this.completeBorisShortcutAndOpenGate();
        } else {
          this.showToast(t(lang, 'toastBorisShortcutOpen'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'ch9_lever') {
      root.getWorldPosition(_vec3);
      const playerDist = this.playerPos.distanceTo(_vec3);
      if (playerDist <= 10) {
        if (!this.ch9BulkheadOpen) {
          this.completeKeshaAlertAndOpenGate(false);
        } else {
          this.showToast(t(lang, 'toastCh9GateOpened'));
          this.emitHUD(true);
        }
      } else {
        this.setAutopilotDestination(
          _vec3.x,
          _vec3.y + 1.2,
          _vec3.z + 2.4,
          t(lang, 'toastNpcGoing', { name: meta.label }),
        );
      }
      return;
    }

    if (meta.type === 'npc' && meta.id) {
      const idx = this.npcs.findIndex((n) => n.id === meta.id);
      if (idx === -1) return;
      const npc = this.npcs[idx];
      const playerDist = Math.sqrt(distanceSq3(this.playerPos, npc.position));

      if (meta.id === 'panic_shrimps' && this.activeSceneChapter === 1) {
        const panicRes = triggerShrimpPanic(npc, this.simTimeSec);
        this.npcs[idx] = panicRes.npc;
        if (!this.campaign.npcsMet.includes(npc.id)) {
          this.campaign.npcsMet.push(npc.id);
        }
        if (panicRes.distractedPredator) {
          this.squid.distractedUntil = this.simTimeSec + 4.5;
          this.squid.distractTarget = { ...CHAPTER_1_SHELTERS[0] };
          this.showToast(t(lang, 'toastShrimpsDistract'));
        } else {
          this.showToast(t(lang, 'toastShrimpsHidden'));
        }
        this.emitHUD(true);
        return;
      }

      if (
        meta.id === 'boris' &&
        this.activeSceneChapter === 2 &&
        this.borisMugCarried &&
        playerDist <= 10
      ) {
        this.completeBorisQuestAndOpenGate();
        return;
      }

      if (
        meta.id === 'boris' &&
        this.activeSceneChapter === 8 &&
        playerDist <= 11 &&
        !this.ch8ShortcutOpen
      ) {
        this.completeBorisShortcutAndOpenGate();
        return;
      }

      if (
        meta.id === 'hermit_crabs' &&
        this.collectedScrapIds.length >= CHAPTER_3_SCRAPS.length &&
        playerDist <= 10 &&
        !this.ch3DebrisOpen
      ) {
        this.completeCrabQuestAndClearDebris(true);
        return;
      }

      if (
        meta.id === 'critic_crabs' &&
        this.activeSceneChapter === 4 &&
        this.whaleContainerCarried &&
        playerDist <= 10 &&
        !this.ch4GateOpen
      ) {
        this.completeWhaleQuestAndOpenGate(true);
        return;
      }

      if (
        meta.id === 'queen_angler' &&
        this.activeSceneChapter === 5 &&
        this.ch5LureCarried &&
        playerDist <= 11 &&
        !this.ch5GateOpen
      ) {
        this.completeQueenQuestAndOpenGate(true);
        return;
      }

      if (
        meta.id === 'young_whale' &&
        this.activeSceneChapter === 7 &&
        playerDist <= 11 &&
        !this.ch7WhaleFreed
      ) {
        this.completeWhaleRescueAndOpenGate();
        return;
      }

      this.npcs[idx] = {
        ...npc,
        revealed: true,
        talkTimer: 5.5,
        activeText: npc.lines,
      };
      if (!this.campaign.npcsMet.includes(npc.id)) {
        this.campaign.npcsMet.push(npc.id);
      }
      this.audio.playMildredBump();
      const locName = this.getLocalizedNpcName(npc.id, npc.name);
      if (playerDist > 14) {
        this.setAutopilotDestination(
          npc.position.x,
          npc.position.y,
          npc.position.z + 3.2,
          t(lang, 'toastNpcGoing', { name: locName }),
        );
      } else {
        this.showToast(t(lang, 'toastNpcHint', { name: locName }));
        this.emitHUD(true);
      }
      return;
    }

    if (meta.type === 'shelter') {
      if (isInsideCoralShelter(this.playerPos, this.activeShelters)) {
        this.showToast(t(lang, 'toastAlreadyHidden'));
        this.emitHUD(true);
        return;
      }
      const pos = meta.targetPos;
      if (pos) {
        const ch = this.activeSceneChapter;
        const shelterToastKey =
          ch === 4 || ch === 5 || ch === 7
            ? 'toastGoingToVertebraShelter'
            : ch === 3 || ch === 8
              ? 'toastGoingToKelpShelter'
              : ch === 2 || ch === 9
                ? 'toastGoingToCrate'
                : 'toastGoingToCoral';
        this.setAutopilotDestination(pos.x, pos.y, pos.z, t(lang, shelterToastKey));
      }
      return;
    }

    if (meta.type === 'egg') {
      if (this.activeSceneChapter === 6 && root === this.eggMesh && !this.ch6EggReclaimed) {
        root.getWorldPosition(_vec3);
        if (this.playerPos.distanceTo(_vec3) <= 10.5) {
          this.reclaimEggAtAltar();
        } else {
          this.setAutopilotDestination(
            _vec3.x,
            _vec3.y + 0.5,
            _vec3.z + 2.4,
            t(lang, 'toastNpcGoing', { name: t(lang, 'labelEggAltar') }),
          );
        }
        return;
      }

      this.triggerCall();
      if (meta.targetPos) {
        const d = Math.hypot(
          this.playerPos.x - meta.targetPos.x,
          this.playerPos.z - meta.targetPos.z,
        );
        if (d < 34) {
          const ch = this.activeSceneChapter;
          const portalToast =
            ch === 4
              ? t(lang, 'toastGoingToVentPortal')
              : ch === 3
                ? t(lang, 'toastGoingToGraveyardPortal')
                : ch === 2
                  ? t(lang, 'toastGoingToKelpPortal')
                  : ch === 1
                    ? t(lang, 'toastGoingToCrevicePortal')
                    : t(lang, 'toastNpcGoing', { name: meta.label });
          this.setAutopilotDestination(
            meta.targetPos.x,
            meta.targetPos.y,
            meta.targetPos.z,
            portalToast,
          );
          return;
        }
      }
      this.showToast(t(lang, 'toastEggCallsBelow'));
      this.emitHUD(true);
      return;
    }

    if (meta.type === 'net') {
      this.showToast(t(lang, 'toastNetHint'));
      this.emitHUD(true);
    }
  }

  private handlePointerDown = (e: PointerEvent): void => {
    window.focus();
    this.audio.unlock();

    // Title screen interactive 3D Squid button & hero fish reaction
    if (this.screenState === 'title') {
      if (e.button === 0 && this.setRaycasterFromScreenPoint(e.clientX, e.clientY)) {
        if (this.titleSquidGroup?.visible && !this.titleSquidFleeing) {
          const squidHits = this.raycaster.intersectObject(this.titleSquidGroup, true);
          if (squidHits.length > 0) {
            this.startGame(true);
            return;
          }
        }
        const hits = this.raycaster.intersectObject(this.playerRig.group, true);
        if (hits.length > 0) {
          this.heroPlayfulTimer = 1.05;
          this.callWaveActive = 0.85;
          this.callWaveRing.position.copy(this.playerPos);
          this.callWaveRing.scale.setScalar(0.5);
          this.audio.playHeroPlayful();
        }
      }
      return;
    }

    if (this.screenState !== 'playing') return;
    if (!this.controlSettings.mouseEnabled) return;

    this.pointerDragButtonDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.hasLastPointer = true;

    const btnBinding = this.eventButtonToMouseBinding(e.button);
    const mb = this.controlSettings.mouseBindings;

    // Middle mouse or Alt+Left pan camera (unless MMB is explicitly bound to interact/moveToPoint)
    const isPanGesture =
      (e.button === 1 && mb.interact !== 'MMB' && mb.moveToPoint !== 'MMB') ||
      (e.button === 0 && e.altKey);
    if (isPanGesture) {
      e.preventDefault();
      if (e.button === 1) {
        const now = performance.now();
        if (now - this.lastMmbDownMs < 320) {
          this.cameraOffset = createDefaultCameraOffset();
          this.showToast(t(this.gameSettings.language, 'toastCameraReset'));
          this.emitHUD(true);
          this.lastMmbDownMs = 0;
          return;
        }
        this.lastMmbDownMs = now;
      }
      this.panDragActive = true;
      return;
    }

    if (btnBinding !== 'NONE' && btnBinding === mb.interact) {
      e.preventDefault();
      this.pointerDown = false;
      this.holdSwimButton = null;
      this.pointerDragButtonDown = false;
      this.interactAtScreenPoint(e.clientX, e.clientY);
      return;
    }

    if (btnBinding !== 'NONE' && btnBinding === mb.moveToPoint) {
      e.preventDefault();
      this.pointerDown = false;
      this.holdSwimButton = null;
      this.pointerDragButtonDown = false;
      this.moveToScreenPoint(e.clientX, e.clientY);
      return;
    }

    if (
      this.controlSettings.lmbHoldToSwim &&
      btnBinding !== 'NONE' &&
      btnBinding === mb.holdSwim
    ) {
      this.pointerDown = true;
      this.holdSwimButton = e.button;
      this.pointerDownTimeMs = performance.now();
    }

    if (
      e.button === 0 &&
      this.controlSettings.mouseLookMode === 'pointerLock' &&
      document.pointerLockElement !== this.renderer.domElement
    ) {
      try {
        const maybePromise = this.renderer.domElement.requestPointerLock?.() as unknown as
          | Promise<void>
          | undefined;
        maybePromise?.catch?.(() => {});
      } catch {
        // Ignore sandbox pointer lock rejection
      }
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (this.holdSwimButton === null || e.button === this.holdSwimButton) {
      this.pointerDown = false;
      this.holdSwimButton = null;
    }
    this.pointerDragButtonDown = false;
    this.panDragActive = false;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const nowMs = performance.now();
    if (this.screenState === 'title') {
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.titleParallaxX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        this.titleParallaxY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        if (
          nowMs - this.lastTitleHoverMs >= 85 &&
          this.setRaycasterFromScreenPoint(e.clientX, e.clientY)
        ) {
          this.lastTitleHoverMs = nowMs;
          const squidHits =
            this.titleSquidGroup?.visible && !this.titleSquidFleeing
              ? this.raycaster.intersectObject(this.titleSquidGroup, true)
              : [];
          this.titleSquidHovered = squidHits.length > 0;
          const hits = this.raycaster.intersectObject(this.playerRig.group, true);
          this.renderer.domElement.style.cursor =
            squidHits.length > 0 || hits.length > 0 ? 'pointer' : '';
        }
      }
      return;
    }

    if (this.screenState !== 'playing') return;
    if (!this.controlSettings.mouseEnabled) return;

    const isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    if (
      this.pointerDown &&
      !isHoldButtonSynced(this.holdSwimButton, e.buttons, isPointerLocked)
    ) {
      this.pointerDown = false;
      this.holdSwimButton = null;
      this.pointerDragButtonDown = false;
    }
    if (!isPointerLocked && this.pointerDragButtonDown && e.buttons === 0) {
      this.pointerDragButtonDown = false;
      this.panDragActive = false;
    }

    if (isPointerLocked) {
      this.mouseDeltaX += e.movementX || 0;
      this.mouseDeltaY += e.movementY || 0;
      return;
    }

    // Never spin camera when cursor is hovering/interacting over HUD or non-canvas elements
    if (
      e.target !== this.renderer.domElement &&
      !this.pointerDragButtonDown &&
      !this.panDragActive
    ) {
      this.hasLastPointer = false;
      return;
    }

    if (this.hasLastPointer) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      if (this.panDragActive) {
        this.cameraOffset = applyCameraPanDelta(this.cameraOffset, dx, dy);
      } else {
        const canOrbit =
          this.controlSettings.mouseLookMode === 'always' ||
          this.pointerDragButtonDown;
        const maxStep = this.controlSettings.mouseLookMode === 'always' ? 85 : 160;
        if (canOrbit && Math.hypot(dx, dy) < maxStep) {
          this.mouseDeltaX += dx;
          this.mouseDeltaY += dy;
        }
      }
    }
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.hasLastPointer = true;

    if (
      !this.pointerDragButtonDown &&
      !this.panDragActive &&
      nowMs - this.lastHoverCheckMs >= 90
    ) {
      this.lastHoverCheckMs = nowMs;
      this.updatePointerHoverState(e.clientX, e.clientY);
    }
  };

  private updatePointerHoverState(clientX: number, clientY: number): void {
    if (!this.setRaycasterFromScreenPoint(clientX, clientY)) {
      this.isPortalHovered = false;
      this.hoveredInteractLabel = null;
      return;
    }
    let nextPortalHover = false;
    let nextLabel: string | null = null;

    const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);
    for (const h of hits) {
      if (h.distance < 1.5 || h.distance > 65) continue;
      if (!this.isObjectTreeVisible(h.object)) continue;
      const found = this.findInteractableMeta(h.object);
      if (found) {
        nextLabel = found.meta.label;
        if (this.activePortalRig && found.root === this.activePortalRig.group) {
          nextPortalHover = true;
        }
        break;
      }
    }

    this.isPortalHovered = nextPortalHover;
    this.hoveredInteractLabel = nextLabel;
    this.renderer.domElement.style.cursor = nextLabel ? 'pointer' : '';
  }

  private handleWheel = (e: WheelEvent): void => {
    if (this.screenState !== 'playing') return;
    if (!this.controlSettings.mouseEnabled) return;
    e.preventDefault();
    this.cameraOffset = {
      ...this.cameraOffset,
      distance: clampCameraZoom(this.cameraOffset.distance + e.deltaY * 0.008),
    };
  };

  private handleTouchStart = (e: TouchEvent): void => {
    this.audio.unlock();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
    if (this.activeTouches.size === 2) {
      const pts = Array.from(this.activeTouches.values());
      this.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.screenState !== 'playing') return;
    e.preventDefault();
    if (this.activeTouches.size === 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const prev = this.activeTouches.get(touch.identifier);
      if (prev) {
        this.mouseDeltaX += (touch.clientX - prev.x) * 1.35;
        this.mouseDeltaY += (touch.clientY - prev.y) * 1.35;
        this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
    } else if (this.activeTouches.size >= 2) {
      const prevPts = Array.from(this.activeTouches.entries());
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
      const nextPts = Array.from(this.activeTouches.values());
      if (nextPts.length >= 2) {
        const dist = Math.hypot(nextPts[0].x - nextPts[1].x, nextPts[0].y - nextPts[1].y);
        if (this.lastPinchDist > 0) {
          const delta = this.lastPinchDist - dist;
          this.cameraOffset = {
            ...this.cameraOffset,
            distance: clampCameraZoom(this.cameraOffset.distance + delta * 0.03),
          };
        }
        this.lastPinchDist = dist;

        if (prevPts.length >= 2) {
          const prevMidX = (prevPts[0][1].x + prevPts[1][1].x) * 0.5;
          const prevMidY = (prevPts[0][1].y + prevPts[1][1].y) * 0.5;
          const nextMidX = (nextPts[0].x + nextPts[1].x) * 0.5;
          const nextMidY = (nextPts[0].y + nextPts[1].y) * 0.5;
          this.cameraOffset = applyCameraPanDelta(
            this.cameraOffset,
            nextMidX - prevMidX,
            nextMidY - prevMidY,
          );
        }
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      this.activeTouches.delete(e.changedTouches[i].identifier);
    }
    if (this.activeTouches.size < 2) {
      this.lastPinchDist = 0;
    }
  };

  private handleDoubleClick = (e: MouseEvent): void => {
    if (this.screenState !== 'playing') return;
    if (!this.controlSettings.mouseEnabled) return;
    if (e.button !== 0) return;

    this.audio.unlock();
    this.pointerDown = false;
    this.holdSwimButton = null;

    const mb = this.controlSettings.mouseBindings;
    if (mb.interact === 'DBL_LMB') {
      this.interactAtScreenPoint(e.clientX, e.clientY);
      return;
    }
    if (this.controlSettings.doubleClickMove && mb.moveToPoint === 'DBL_LMB') {
      this.moveToScreenPoint(e.clientX, e.clientY);
    }
  };

  private handlePointerLeave = (): void => {
    this.hasLastPointer = false;
    this.isPortalHovered = false;
    this.hoveredInteractLabel = null;
  };

  private handleResize = (): void => {
    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = Math.max(320, rect.width || window.innerWidth);
    this.viewportHeight = Math.max(240, rect.height || window.innerHeight);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewportWidth, this.viewportHeight);
    if (this.composer) {
      this.composer.setSize(this.viewportWidth, this.viewportHeight);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(
        Math.max(160, Math.floor(this.viewportWidth * 0.5)),
        Math.max(120, Math.floor(this.viewportHeight * 0.5)),
      );
    }
    if (this.planktonMat?.uniforms.uPixelRatio) {
      this.planktonMat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
    this.renderer.render(this.scene, this.camera);
  };

  private syncBodyState(state: GameScreenState): void {
    this.screenState = state;
    document.body.dataset.state = state;
    if (state !== 'title') {
      delete document.body.dataset.titleSquidPhase;
    }
    if (this.titleSquidGroup) {
      this.titleSquidGroup.visible = state === 'title';
    }
    if (this.titleSquidLight) {
      this.titleSquidLight.visible = state === 'title';
    }
    if (this.titleSquidInkMesh && state !== 'title') {
      this.titleSquidInkMesh.visible = false;
    }
  }

  public setTitleSquidAnchor(ndcX: number, ndcY: number): void {
    this.titleSquidAnchorNdc.x = Math.max(-0.92, Math.min(0.92, ndcX));
    this.titleSquidAnchorNdc.y = Math.max(-0.92, Math.min(0.92, ndcY));
  }

  public setTitleSquidHovered(hovered: boolean): void {
    this.titleSquidHovered = hovered;
  }

  private triggerTitleSquidEscape(
    isNewGame: boolean,
    targetChapter?: ChapterId,
  ): void {
    if (this.titleSquidFleeing) return;
    this.audio.unlock();
    this.audio.playUiClick();
    this.audio.playSquidTelegraph();
    this.audio.playDashSurge();
    window.focus();

    this.camera.updateMatrixWorld();
    this.titleSquidFleeOrigin.copy(this.titleSquidGroup.position);
    this.titleSquidFleeFwd
      .set(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .normalize();
    this.titleSquidFleeRight
      .set(1, 0, 0)
      .applyQuaternion(this.camera.quaternion)
      .normalize();
    this.titleSquidFleeUp
      .set(0, 1, 0)
      .applyQuaternion(this.camera.quaternion)
      .normalize();

    this.titleSquidFleeing = true;
    this.titleSquidFleeTimer = TITLE_SQUID_FLEE_DURATION_SEC;
    this.titleSquidFleeBubbleAccum = 0;
    this.titleSquidPendingNewGame = isNewGame;
    this.titleSquidPendingChapter = targetChapter;
    this.titleSquidHovered = false;
    this.renderer.domElement.style.cursor = '';

    this.titleSquidInkMesh.visible = true;
    this.titleSquidInkMesh.position.copy(this.titleSquidFleeOrigin);
    this.titleSquidInkMesh.scale.setScalar(0.3);
    this.titleSquidInkMat.opacity = 0.72;
    this.spawnBubbleBurst(this.titleSquidFleeOrigin, 22, 1.75);
    this.emitHUD(true);
  }

  private syncSavedSummary(): void {
    const saved = loadSaveData();
    this.savedHighestChapter = saved?.highestChapter ?? 1;
    this.savedPearls = saved?.pearls ?? 0;
  }

  public startGame(fromUserGesture = true, targetChapter?: ChapterId): void {
    if (this.screenState === 'title' && fromUserGesture) {
      this.triggerTitleSquidEscape(false, targetChapter);
      return;
    }
    this.executeStartGameNow(fromUserGesture, targetChapter, false);
  }

  private executeStartGameNow(
    fromUserGesture: boolean,
    targetChapter: ChapterId | undefined,
    fromSquidLaunch: boolean,
  ): void {
    if (fromUserGesture) {
      this.audio.unlock();
      this.audio.playUiClick();
      window.focus();
    }
    const saved = loadSaveData();
    const resolvedChapter: ChapterId =
      targetChapter ??
      (saved && CHAPTERS[saved.highestChapter]?.implemented
        ? saved.highestChapter
        : 1);

    const wasOnTitle = this.screenState === 'title';
    if (wasOnTitle && (fromUserGesture || fromSquidLaunch)) {
      this.flythroughStartPos.copy(this.camera.position);
      this.flythroughStartLook.set(0.5, 2.8, -4);
      this.startFlythroughTimer = 0.85;
    } else {
      this.startFlythroughTimer = 0;
    }

    if (resolvedChapter !== this.activeSceneChapter) {
      this.buildChapterScene(resolvedChapter);
    }

    const restored = saved
      ? createCampaignFromSave(saved, resolvedChapter)
      : createCampaignState(resolvedChapter);
    this.resetChapterState(false, restored, resolvedChapter);
    this.applyActiveSkinVisuals();

    const lang = this.gameSettings.language;
    this.introBeatTimer = resolvedChapter === 1 ? 2.4 : 0;
    this.showToast(t(lang, `toastCh${resolvedChapter}Intro` as 'toastCh1Intro'));

    this.syncBodyState('playing');
    this.audio.setMusicContext(`ch${resolvedChapter}` as MusicContext, 0);
    if (fromUserGesture || fromSquidLaunch) {
      this.audio.setPaused(false);
    }
    this.emitHUD(true);
  }

  public startNewGame(): void {
    if (this.screenState === 'title') {
      this.triggerTitleSquidEscape(true, 1);
      return;
    }
    this.executeStartNewGameNow(false);
  }

  private executeStartNewGameNow(fromSquidLaunch: boolean): void {
    if (!fromSquidLaunch) {
      this.audio.unlock();
      this.audio.playUiClick();
      window.focus();
    }
    const wasOnTitle = this.screenState === 'title';
    if (wasOnTitle) {
      this.flythroughStartPos.copy(this.camera.position);
      this.flythroughStartLook.set(0.5, 2.8, -4);
      this.startFlythroughTimer = 0.85;
    }
    clearSaveData();
    this.savedHighestChapter = 1;
    this.savedPearls = 0;
    if (this.activeSceneChapter !== 1) {
      this.buildChapterScene(1);
    }
    this.resetChapterState(false, undefined, 1);
    this.applyActiveSkinVisuals();
    this.introBeatTimer = 2.4;
    this.showToast(t(this.gameSettings.language, 'toastCh1Intro'));
    this.syncBodyState('playing');
    this.audio.setMusicContext('ch1', 0);
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public advanceToNextChapter(): void {
    this.audio.unlock();
    this.audio.playUiClick();
    window.focus();
    const nextChapter: ChapterId = (
      this.activeSceneChapter < 10 ? this.activeSceneChapter + 1 : 1
    ) as ChapterId;
    if (!CHAPTERS[nextChapter]?.implemented) return;

    const saved = loadSaveData();
    const restored = saved
      ? createCampaignFromSave(saved, nextChapter)
      : {
          ...createCampaignState(nextChapter),
          pearls: this.campaign.pearls,
          collectedPearlIds: [...this.campaign.collectedPearlIds],
          activeSkin: this.campaign.activeSkin,
          unlockedSkins: [...this.campaign.unlockedSkins],
          upgrades: [...this.campaign.upgrades],
          hasDashMutation: this.campaign.hasDashMutation,
          quests: { ...this.campaign.quests },
        };

    this.buildChapterScene(nextChapter);
    this.resetChapterState(true, restored, nextChapter);
    this.applyActiveSkinVisuals();
    this.introBeatTimer = 0;
    this.startFlythroughTimer = 0;
    const nextToastKey =
      nextChapter === 2 || nextChapter === 3 || nextChapter === 4
        ? (`toastCh${nextChapter}NextIntro` as 'toastCh2NextIntro')
        : (`toastCh${nextChapter}Intro` as 'toastCh5Intro');
    this.showToast(t(this.gameSettings.language, nextToastKey));
    this.syncBodyState('playing');
    this.audio.setMusicContext(`ch${nextChapter}` as MusicContext, 0);
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public restartChapter(): void {
    this.audio.unlock();
    this.audio.playUiClick();
    this.resetChapterState(true, undefined, this.activeSceneChapter);
    this.introBeatTimer = this.activeSceneChapter === 1 ? 1.6 : 0;
    this.startFlythroughTimer = 0;
    this.syncBodyState('playing');
    this.audio.setMusicContext(`ch${this.activeSceneChapter}` as MusicContext, 0);
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  private resetSwimOrientation(yaw = Math.PI, pitch = -0.06): void {
    this.swimState.camYaw = yaw;
    this.swimState.camPitch = pitch;
    const fwd = computeSwimForward(yaw, pitch, _lookFwd);
    computeFishTargetQuaternion(fwd, this.swimState.fishQuat);
    this.swimState.fishRoll = 0;
    this.swimState.turnFlex = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.hasLastPointer = false;
  }

  public respawnAtCheckpoint(): void {
    const room = this.campaign.checkpointRoomId;
    const ch = this.activeSceneChapter;
    if (ch === 10) {
      const z = room === 'ch10_hatchling_coral' ? -58 : 4;
      this.playerPos.set(0, getChapterFloorHeight(10, 0, z) + 2.2, z);
    } else if (ch === 9) {
      const z = room === 'ch9_kesha_atrium' ? -46 : 4;
      this.playerPos.set(0, getChapterFloorHeight(9, 0, z) + 2.2, z);
      this.pafnutiySwellTimer = 0;
      this.pafnutiyScale = 1.0;
    } else if (ch === 8) {
      const z = room === 'ch8_boris_shortcut' ? -48 : 4;
      this.playerPos.set(0, getChapterFloorHeight(8, 0, z) + 2.2, z);
    } else if (ch === 7) {
      const z = room === 'ch7_whale_rescue' ? -46 : 4;
      this.playerPos.set(0, getChapterFloorHeight(7, 0, z) + 2.2, z);
    } else if (ch === 6) {
      this.playerPos.set(0, getChapterFloorHeight(6, 0, 4) + 2.2, 4);
    } else if (ch === 5) {
      const z = room === 'ch5_queen_nest' ? -46 : 4;
      this.playerPos.set(0, getChapterFloorHeight(5, 0, z) + 2.2, z);
    } else if (ch === 4) {
      const z =
        room === 'ch4_charybdis_gate'
          ? -64
          : room === 'ch4_sperm_whale'
            ? -34
            : 4;
      this.playerPos.set(0, getChapterFloorHeight(4, 0, z) + 2.0, z);
    } else if (ch === 3) {
      if (room === 'ch3_crab_outpost') {
        this.playerPos.set(0, -0.4, -64);
      } else if (room === 'ch3_whisper_corridor') {
        this.playerPos.set(0, 0.8, -32);
      } else {
        this.playerPos.set(0, 1.8, 4);
      }
    } else if (ch === 2) {
      if (room === 'ch2_pelican_gate') {
        this.playerPos.set(0, 0.2, -64);
      } else if (room === 'ch2_galley') {
        this.playerPos.set(0, 1.2, -34);
      } else {
        this.playerPos.set(0, 2.2, 4);
      }
      this.pafnutiySwellTimer = 0;
      this.pafnutiyScale = 1.0;
    } else {
      if (room === 'ch1_trawler_net') {
        this.playerPos.set(0, 2.2, -55);
      } else if (room === 'ch1_squid_patrol') {
        this.playerPos.set(0, 2.6, -28);
      } else {
        this.playerPos.set(0, 3.0, 4);
      }
    }
    this.squid = createInitialPredatorForChapter(ch);

    this.playerVel.set(0, 0, 0);
    this.clearSwimTarget();
    this.clearTransientInputs();
    this.resetSwimOrientation(Math.PI, -0.06);
    this.health = this.maxHealth;
    this.hurtInvulnTimer = 1.5;
    this.dashBoostTimer = 0;
    this.outcome = null;
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.showToast(t(this.gameSettings.language, 'toastRespawn'));
    this.emitHUD(true);
  }

  private resetChapterState(
    keepPearls: boolean,
    restoredCampaign?: CampaignState,
    chapterOverride?: ChapterId,
  ): void {
    const ch = chapterOverride ?? restoredCampaign?.chapter ?? this.activeSceneChapter;
    if (restoredCampaign) {
      this.campaign = restoredCampaign;
    } else {
      const prevPearls = keepPearls ? this.campaign.pearls : 0;
      const prevIds = keepPearls ? [...this.campaign.collectedPearlIds] : [];
      const prevSkin = keepPearls ? this.campaign.activeSkin : 'turquoise';
      const prevUnlocked = keepPearls ? [...this.campaign.unlockedSkins] : ['turquoise' as GlowSkinId];
      const prevUpgrades = keepPearls ? [...this.campaign.upgrades] : [];
      const prevDash = keepPearls ? this.campaign.hasDashMutation : false;
      const prevQuests: QuestStatus = keepPearls
        ? { ...this.campaign.quests }
        : {
            borisMug: false,
            crabDebris: false,
            whaleContainer: false,
            queenEscort: false,
            eggReclaimed: ch >= 7,
            whaleRescued: false,
            borisShortcut: false,
            keshaAlert: false,
            hatchlingBorn: false,
          };

      this.campaign = createCampaignState(ch);
      this.campaign.pearls = prevPearls;
      this.campaign.collectedPearlIds = prevIds;
      this.campaign.activeSkin = prevSkin;
      this.campaign.unlockedSkins = prevUnlocked;
      this.campaign.upgrades = prevUpgrades;
      this.campaign.hasDashMutation = prevDash;
      this.campaign.quests = prevQuests;
    }

    this.activeShelters = getSheltersForChapter(ch);
    this.activePearls = getPearlsForChapter(ch);
    this.npcs = createNPCsForChapter(ch);
    this.squid = createInitialPredatorForChapter(ch);
    this.completionLabel = null;

    this.borisMugCarried = false;
    this.pelicanGateOpen = ch === 2 && this.campaign.quests.borisMug;
    this.pelicanGateAnim01 = this.pelicanGateOpen ? 1 : 0;
    this.pafnutiySwellTimer = 0;
    this.pafnutiyScale = 1.0;
    this.collectedScrapIds = [];
    this.ch3DebrisOpen = ch === 3 && this.campaign.quests.crabDebris;
    this.ch3DebrisAnim01 = this.ch3DebrisOpen ? 1 : 0;
    this.whaleContainerCarried = false;
    this.ch4GateOpen = ch === 4 && this.campaign.quests.whaleContainer;
    this.ch4GateAnim01 = this.ch4GateOpen ? 1 : 0;
    this.ch5LureCarried = false;
    this.ch5GateOpen = ch === 5 && !!this.campaign.quests.queenEscort;
    this.ch5GateAnim01 = this.ch5GateOpen ? 1 : 0;
    this.queenEscortReady = this.ch5GateOpen;
    this.ch6EggReclaimed = ch >= 7 || !!this.campaign.quests.eggReclaimed;
    this.ch7WhaleFreed = ch === 7 && !!this.campaign.quests.whaleRescued;
    this.ch7GateAnim01 = this.ch7WhaleFreed ? 1 : 0;
    this.ch8ShortcutOpen = ch === 8 && !!this.campaign.quests.borisShortcut;
    this.ch8GateAnim01 = this.ch8ShortcutOpen ? 1 : 0;
    this.ch8SporeFlareTimer = 0;
    this.ch9BulkheadOpen = ch === 9 && !!this.campaign.quests.keshaAlert;
    this.ch9GateAnim01 = this.ch9BulkheadOpen ? 1 : 0;
    this.keshaStunUsed = this.ch9BulkheadOpen;
    this.hatchlingBorn = ch === 10 && !!this.campaign.quests.hatchlingBorn;
    this.dashBoostTimer = 0;
    this.dashCooldownTimer = 0;
    this.whaleSongCooldown = 6;

    const startY =
      ch === 1
        ? 3.0
        : ch === 2
          ? 2.2
          : getChapterFloorHeight(ch, 0, 4) + 2.2;
    this.playerPos.set(0, startY, 4);
    this.playerVel.set(0, 0, 0);
    this.clearSwimTarget();
    this.resetSwimOrientation(Math.PI, -0.06);
    this.health = this.maxHealth;
    this.hurtInvulnTimer = 0;
    this.playElapsedSec = 0;
    this.outcome = null;
    this.lastChapterRank = null;
    this.lastAwardedSRankBonus = false;
    this.eggResonanceTimer = 0;
    this.inUpdraftCurrent = false;
    this.eggEchoText = null;
    this.eggEchoTimer = 0;
    this.clearTransientInputs();

    if (this.mugMesh) {
      this.mugMesh.visible = !this.campaign.quests.borisMug;
    }

    for (const s of CHAPTER_3_SCRAPS) {
      const m = this.scrapMeshes.get(s.id);
      if (m) m.visible = !this.campaign.quests.crabDebris;
    }

    if (this.whaleContainerMesh) {
      this.whaleContainerMesh.visible = !this.campaign.quests.whaleContainer;
    }

    if (this.ch5LureMesh) {
      this.ch5LureMesh.visible = !this.campaign.quests.queenEscort;
    }

    if (this.youngWhaleRig) {
      this.youngWhaleRig.cableGroup.visible = !this.ch7WhaleFreed;
    }

    this.eggMesh.visible = ch < 6 || (ch === 6 && !this.ch6EggReclaimed);
    this.carriedEggRig.visible = (ch >= 7 || this.ch6EggReclaimed) && !this.hatchlingBorn;
    if (this.babyHatchlingRig) {
      this.babyHatchlingRig.group.visible = ch === 10 && this.hatchlingBorn;
    }

    for (const p of this.activePearls) {
      const m = this.pearlMeshes.get(p.id);
      if (m) m.visible = !this.campaign.collectedPearlIds.includes(p.id);
    }
    if (this.loreRelicMesh) {
      const relic = CHAPTER_LORE_RELICS[ch];
      this.loreRelicMesh.visible = !this.campaign.collectedRelicIds.includes(relic.id);
    }
  }

  public triggerDash(): void {
    if (this.screenState !== 'playing') return;
    if (!this.campaign.hasDashMutation) {
      this.showToast(t(this.gameSettings.language, 'toastDashLocked'));
      this.emitHUD(true);
      return;
    }
    if (this.dashCooldownTimer > 0) return;

    this.audio.unlock();
    this.clearSwimTarget();
    triggerSwimDash(this.swimState, 20.5, this._stepNoseDir);
    this.dashBoostTimer = 0.55;
    this.dashCooldownTimer = 2.4;
    this.spawnBubbleBurst(this.playerPos, 22, 1.45);
    this.audio.playDashSurge();
    this.emitHUD(true);
  }

  public buyOrEquipSkin(skinId: GlowSkinId): { ok: boolean } {
    const lang = this.gameSettings.language;
    const res = purchaseGlowSkin(this.campaign, skinId);
    if (!res.ok) {
      this.showToast(t(lang, 'toastInsufficientPearls'));
      this.emitHUD(true);
      return { ok: false };
    }
    this.campaign = res.state;
    this.applyActiveSkinVisuals();
    this.persistCampaignSnapshot();
    this.audio.playPearlPickup();
    const skinKey =
      skinId === 'pearl'
        ? 'skinPearlName'
        : skinId === 'charcoal'
          ? 'skinCharcoalName'
          : 'skinTurquoiseName';
    this.showToast(t(lang, 'toastSkinEquipped', { name: t(lang, skinKey) }));
    this.emitHUD(true);
    return { ok: true };
  }

  public buyHideoutUpgrade(upgradeId: 'coral_veil' | 'silent_fins'): { ok: boolean } {
    const lang = this.gameSettings.language;
    const res = purchaseHideoutUpgrade(this.campaign, upgradeId);
    if (!res.ok) {
      this.showToast(t(lang, 'toastInsufficientPearls'));
      this.emitHUD(true);
      return { ok: false };
    }
    this.campaign = res.state;
    this.persistCampaignSnapshot();
    this.audio.playPearlPickup();
    this.showToast(t(lang, 'toastUpgradeActive'));
    this.emitHUD(true);
    return { ok: true };
  }

  private clearSwimTarget(): void {
    this.swimTarget = null;
    this.autopilotBestDistSq = Infinity;
    this.autopilotStallSec = 0;
    if (this.targetBeaconGroup) {
      this.targetBeaconGroup.visible = false;
    }
  }

  public stopFish(showNotice = true): void {
    stopSwimMotion(this.swimState);
    this.clearSwimTarget();
    this.clearTransientInputs();
    if (showNotice && this.screenState === 'playing') {
      this.showToast(t(this.gameSettings.language, 'toastFishStopped'));
    }
    this.emitHUD(true);
  }

  public getControlSettings(): ControlSettings {
    return { ...this.controlSettings };
  }

  public updateControlSettings(patch: Partial<ControlSettings>): ControlSettings {
    this.controlSettings = saveControlSettings({
      ...this.controlSettings,
      ...patch,
    });
    if (!this.controlSettings.keyboardEnabled) {
      this.keys.clear();
    }
    if (!this.controlSettings.mouseEnabled) {
      this.pointerDown = false;
      this.pointerDragButtonDown = false;
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
      if (document.pointerLockElement === this.renderer.domElement) {
        document.exitPointerLock?.();
      }
    }
    if (
      this.controlSettings.mouseLookMode !== 'pointerLock' &&
      document.pointerLockElement === this.renderer.domElement
    ) {
      document.exitPointerLock?.();
    }
    if (!this.controlSettings.doubleClickMove || !this.controlSettings.mouseEnabled) {
      this.clearSwimTarget();
    }
    this.emitHUD(true);
    return { ...this.controlSettings };
  }

  public resetControlSettingsToDefault(): ControlSettings {
    this.controlSettings = resetStoredControlSettings();
    this.emitHUD(true);
    return { ...this.controlSettings };
  }

  public pauseGame(): void {
    if (this.screenState !== 'playing') return;
    this.keys.clear();
    this.pointerDown = false;
    this.pointerDragButtonDown = false;
    this.hasLastPointer = false;
    this.clearSwimTarget();
    stopSwimMotion(this.swimState);
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.syncBodyState('paused');
    this.audio.setPaused(true);
    this.emitHUD(true);
  }

  public resumeGame(): void {
    if (this.screenState !== 'paused') return;
    window.focus();
    this.lastTimeMs = performance.now();
    this.clearTransientInputs();
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public returnToTitle(): void {
    if (this.activeSceneChapter !== 1) {
      this.buildChapterScene(1);
    }
    const saved = loadSaveData();
    const restored = saved ? createCampaignFromSave(saved, 1) : createCampaignState(1);
    this.resetChapterState(false, restored, 1);
    this.applyActiveSkinVisuals();
    this.cameraOffset = createDefaultCameraOffset();
    this.startFlythroughTimer = 0;
    this.heroPlayfulTimer = 0;
    this.titleSquidFleeing = false;
    this.titleSquidFleeTimer = 0;
    this.titleSquidHovered = false;
    this.titleSquidHoverScale = 1.0;
    if (this.titleSquidGroup) {
      this.titleSquidGroup.visible = true;
      this.titleSquidGroup.scale.setScalar(1);
    }
    if (this.titleSquidInkMesh) {
      this.titleSquidInkMesh.visible = false;
    }
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.syncBodyState('title');
    this.audio.setMusicContext('menu', 0);
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public toggleMute(): void {
    this.audio.unlock();
    this.audio.setMuted(!this.audio.isMuted());
    this.emitHUD(true);
  }

  public playUiHover(): void {
    this.audio.playUiHover();
  }

  public playUiClick(): void {
    this.audio.playUiClick();
  }

  public syncExternalState(state: {
    isMobile?: boolean;
    inputMode?: 'touch' | 'keyboard';
    reducedEffects?: boolean;
  }): void {
    if (typeof state.isMobile === 'boolean') {
      this.externalMobileMode = state.isMobile;
    }
    if (state.inputMode === 'touch' || state.inputMode === 'keyboard') {
      this.activeInputMode = state.inputMode;
      if (state.inputMode === 'touch') {
        this.clearTransientInputs();
      }
    }
    if (typeof state.reducedEffects === 'boolean') {
      this.externalReducedEffects = state.reducedEffects;
    }
  }

  public setVirtualMoveInput(
    x: number,
    y: number,
    ascend = false,
    descend = false,
  ): void {
    this.virtualStickX = Math.max(-1, Math.min(1, x));
    this.virtualStickY = Math.max(-1, Math.min(1, y));
    this.virtualAscend = ascend;
    this.virtualDescend = descend;
    if ((Math.abs(x) > 0.1 || Math.abs(y) > 0.1) && this.swimTarget !== null) {
      this.clearSwimTarget();
    }
  }

  public interactNearestObject(): void {
    if (this.screenState !== 'playing') return;
    this.audio.unlock();
    // Look ahead from center reticle for touch "Interact" button
    const rect = this.renderer.domElement.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    this.interactAtScreenPoint(cx, cy);
  }

  public updateGameSettings(patch: Partial<GameSettings>): GameSettings {
    const prevQuality = this.gameSettings.graphicsQuality;
    const prevLang = this.gameSettings.language;
    this.gameSettings = saveGameSettings(
      { ...this.gameSettings, ...patch },
      undefined,
      SUPPORTED_LANGUAGE_IDS,
    );
    this.audio.setVolumes(this.gameSettings.musicVolume, this.gameSettings.sfxVolume);

    if (patch.graphicsQuality && patch.graphicsQuality !== prevQuality) {
      this.applyGraphicsQualitySettings(true);
    } else if (patch.language && patch.language !== prevLang) {
      this.refreshInteractableLabels();
    }
    this.emitHUD(true);
    return { ...this.gameSettings };
  }

  private applyGraphicsQualitySettings(rebuildChapter: boolean): void {
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    if (this.renderer) {
      this.renderer.setPixelRatio(
        this.isSoftwareGl
          ? 1
          : Math.min(window.devicePixelRatio, qual.pixelRatioCap) * this.adaptiveDprScale,
      );
      const shadowsOn = !this.isSoftwareGl && qual.shadows;
      this.renderer.shadowMap.enabled = shadowsOn;
      this.renderer.shadowMap.autoUpdate = shadowsOn;
      if (this.sunDirLight && !this.isSoftwareGl) {
        this.sunDirLight.castShadow = qual.shadows;
        this.sunDirLight.shadow.radius = qual.id === 'ultra' ? 3.0 : 1.5;
        if (this.sunDirLight.shadow.mapSize.width !== qual.shadowMapSize) {
          this.sunDirLight.shadow.mapSize.set(qual.shadowMapSize, qual.shadowMapSize);
          this.sunDirLight.shadow.map?.dispose();
          this.sunDirLight.shadow.map = null;
        }
      }
    }
    if (this.scene) {
      this.scene.environmentIntensity = qual.envMapIntensity;
      for (let i = 0; i < this.secondaryLights.length; i++) {
        this.secondaryLights[i].visible = qual.extraPointLights;
      }
    }
    if (this.camera) {
      this.camera.far = qual.cameraFar;
      this.camera.updateProjectionMatrix();
    }
    const baseCausticStrength = this.getLightingForChapter(this.activeSceneChapter).caustic;
    this.causticStrengthUniform.value = qual.causticsEnabled ? baseCausticStrength : 0;
    this.applyGodRaysForChapter(this.activeSceneChapter, qual.causticsEnabled);
    if (this.fireflySquidSchool.length > 0) {
      const maxSq = Math.round(this.fireflySquidSchool.length * qual.ambientActorFraction);
      this.fireflySquidSchool.forEach((sq, i) => {
        sq.group.visible = i < maxSq;
        if (sq.glowLight) sq.glowLight.visible = qual.extraPointLights;
      });
    }
    if (this.ambientFishSchool.length > 0) {
      const maxFish = Math.round(this.ambientFishSchool.length * qual.ambientActorFraction);
      this.ambientFishSchool.forEach((f, i) => {
        f.group.visible = i < maxFish;
      });
    }
    if (this.planktonPoints?.geometry) {
      const count = this.isSoftwareGl ? Math.min(200, qual.planktonCount) : qual.planktonCount;
      this.planktonPoints.geometry.setDrawRange(0, count);
    }
    if (this.planktonMat?.uniforms.uPixelRatio && this.renderer) {
      this.planktonMat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
    if (rebuildChapter) {
      this.buildChapterScene(this.activeSceneChapter);
      this.applyActiveSkinVisuals();
    }
  }

  private refreshInteractableLabels(): void {
    const lang = this.gameSettings.language;
    const ch = this.activeSceneChapter;
    for (const obj of this.interactiveObjects) {
      const meta = obj.userData?.interactable as InteractableMeta | undefined;
      if (!meta) continue;
      if (meta.type === 'pearl') meta.label = t(lang, 'labelPearl');
      else if (meta.type === 'lore_relic') meta.label = t(lang, 'labelLoreRelic');
      else if (meta.type === 'mug') meta.label = t(lang, 'labelBorisMug');
      else if (meta.type === 'scrap') meta.label = t(lang, 'labelScrapShard');
      else if (meta.type === 'whale_container') meta.label = t(lang, 'labelWhaleContainer');
      else if (meta.type === 'gate_lever') meta.label = t(lang, 'labelGateLever');
      else if (meta.type === 'crane_lever') meta.label = t(lang, 'labelCraneLever');
      else if (meta.type === 'charybdis_lever') meta.label = t(lang, 'labelCharybdisLever');
      else if (meta.type === 'lure_pearl') meta.label = t(lang, 'labelLuminaryPearl');
      else if (meta.type === 'ch5_lever' || meta.type === 'ch7_lever') {
        meta.label = t(lang, 'labelVentGateLever');
      } else if (meta.type === 'egg_altar') meta.label = t(lang, 'labelEggAltar');
      else if (meta.type === 'whale_valve') meta.label = t(lang, 'labelWhaleValve');
      else if (meta.type === 'ch8_lever') meta.label = t(lang, 'labelShortcutLever');
      else if (meta.type === 'ch9_lever') meta.label = t(lang, 'labelBulkheadLever');
      else if (meta.type === 'net') meta.label = t(lang, 'labelNet');
      else if (meta.type === 'shelter') {
        meta.label = t(
          lang,
          ch === 4 || ch === 5 || ch === 7
            ? 'labelVertebraShelter'
            : ch === 3 || ch === 8
              ? 'labelKelpShelter'
              : ch === 2 || ch === 9
                ? 'labelCrateShelter'
                : 'labelCoralShelter',
        );
      } else if (meta.type === 'egg') {
        meta.label =
          obj === this.eggMesh
            ? t(lang, 'labelEgg')
            : t(
                lang,
                ch === 10
                  ? 'labelHatchlingSanctuary'
                  : ch === 9
                    ? 'labelSurfacePortal'
                    : ch === 8
                      ? 'labelLinerPortal'
                      : ch === 7
                        ? 'labelRebellionPortal'
                        : ch === 6
                          ? 'labelAscentPortal'
                          : ch === 5
                            ? 'labelHeartPortal'
                            : ch === 4
                              ? 'labelVentPortal'
                              : ch === 3
                                ? 'labelGraveyardPortal'
                                : ch === 2
                                  ? 'labelKelpPortal'
                                  : 'labelCrevicePortal',
              );
      } else if (meta.type === 'npc' && meta.id) {
        meta.label = this.getLocalizedNpcName(meta.id, meta.label);
      }
    }
  }

  private getLocalizedNpcName(id: string, fallback: string): string {
    const lang = this.gameSettings.language;
    if (id === 'mildred') return t(lang, 'npcMildredName');
    if (id === 'panic_shrimps') return t(lang, 'npcShrimpsName');
    if (id === 'boris') return t(lang, 'npcBorisName');
    if (id === 'pafnutiy') return t(lang, 'npcPafnutiyName');
    if (id === 'hermit_crabs') return t(lang, 'npcHermitCrabsName');
    if (id === 'critic_crabs') return t(lang, 'npcCriticCrabsName');
    if (id === 'glafira') return t(lang, 'npcGlafiraName');
    if (id === 'queen_angler') return t(lang, 'npcQueenName');
    if (id === 'young_whale') return t(lang, 'npcYoungWhaleName');
    if (id === 'kesha') return t(lang, 'npcKeshaName');
    return fallback;
  }

  private getLocalizedNpcLines(npc: NPCData): [string, string] {
    const lang = this.gameSettings.language;
    // Chapters 5-10 recurring characters carry chapter-specific Russian lines in npc.ts
    if (lang === 'ru' && npc.chapter >= 5) {
      return npc.activeText;
    }
    if (npc.id === 'mildred') {
      return [t(lang, 'npcMildredL1'), t(lang, 'npcMildredL2')];
    }
    if (npc.id === 'panic_shrimps') {
      const isPanic = this.simTimeSec < npc.hiddenUntilSec;
      return isPanic
        ? [t(lang, 'npcShrimpsPanic1'), t(lang, 'npcShrimpsPanic2')]
        : [t(lang, 'npcShrimpsL1'), t(lang, 'npcShrimpsL2')];
    }
    if (npc.id === 'boris') {
      const isDone =
        this.activeSceneChapter === 8 ? this.ch8ShortcutOpen : this.campaign.quests.borisMug;
      return isDone
        ? [t(lang, 'npcBorisDone1'), t(lang, 'npcBorisDone2')]
        : [t(lang, 'npcBorisL1'), t(lang, 'npcBorisL2')];
    }
    if (npc.id === 'pafnutiy') {
      return this.pafnutiySwellTimer > 0
        ? [t(lang, 'npcPafnutiyPanic1'), t(lang, 'npcPafnutiyPanic2')]
        : [t(lang, 'npcPafnutiyL1'), t(lang, 'npcPafnutiyL2')];
    }
    if (npc.id === 'hermit_crabs') {
      return this.ch3DebrisOpen
        ? [t(lang, 'npcHermitCrabsDone1'), t(lang, 'npcHermitCrabsDone2')]
        : [t(lang, 'npcHermitCrabsL1'), t(lang, 'npcHermitCrabsL2')];
    }
    if (npc.id === 'critic_crabs') {
      return this.ch4GateOpen
        ? [t(lang, 'npcCriticCrabsDone1'), t(lang, 'npcCriticCrabsDone2')]
        : [t(lang, 'npcCriticCrabsL1'), t(lang, 'npcCriticCrabsL2')];
    }
    if (npc.id === 'glafira') {
      return [t(lang, 'npcGlafiraL1'), t(lang, 'npcGlafiraL2')];
    }
    if (npc.id === 'queen_angler') {
      const done =
        this.activeSceneChapter === 6 ? this.ch6EggReclaimed : this.ch5GateOpen;
      return done
        ? [t(lang, 'npcQueenDone1'), t(lang, 'npcQueenDone2')]
        : [t(lang, 'npcQueenL1'), t(lang, 'npcQueenL2')];
    }
    if (npc.id === 'young_whale') {
      return this.ch7WhaleFreed
        ? [t(lang, 'npcYoungWhaleDone1'), t(lang, 'npcYoungWhaleDone2')]
        : [t(lang, 'npcYoungWhaleL1'), t(lang, 'npcYoungWhaleL2')];
    }
    if (npc.id === 'kesha') {
      return this.ch9BulkheadOpen
        ? [t(lang, 'npcKeshaDone1'), t(lang, 'npcKeshaDone2')]
        : [t(lang, 'npcKeshaL1'), t(lang, 'npcKeshaL2')];
    }
    return npc.activeText;
  }

  public triggerCall(): void {
    if (this.screenState !== 'playing') return;
    this.audio.unlock();
    const diffCfg = DIFFICULTY_PRESETS[this.gameSettings.difficulty];
    const baseCooldown = getCallCooldownSec(this.campaign.phase) * diffCfg.callCooldownMult;
    if (this.simTimeSec - this.campaign.lastCallTimeSec < baseCooldown) return;
    const res = emitCall(this.campaign, this.simTimeSec);
    if (!res.fired) return;
    this.campaign = res.state;
    this.audio.playCallPing(this.campaign.phase);
    this.callWaveActive = 1.0;
    this.callSonarTimer = 2.8;
    const resonanceActive = this.ch6EggReclaimed || this.activeSceneChapter >= 6;
    this.eggResonanceTimer = resonanceActive ? 4.5 : 2.5;
    if (this.callWaveMat) {
      this.callWaveMat.color.set(
        this.activeSceneChapter === 5
          ? '#ffb36b'
          : this.activeSceneChapter >= 7
            ? '#74fff0'
            : '#26e8d4',
      );
    }
    this.callWaveRing.position.copy(this.playerPos);
    this.callWaveRing.scale.setScalar(0.6);
    this.spawnBubbleBurst(this.playerPos, 14, 1.1);

    const lang = this.gameSettings.language;
    const eggTargetZ =
      this.activeSceneChapter === 6 && !this.ch6EggReclaimed
        ? CHAPTER_6_EGG_ALTAR_POS.z
        : -88;
    const dist = Math.max(0, Math.round(this.playerPos.z - eggTargetZ));
    this.eggEchoText =
      dist > 25
        ? t(lang, 'echoDeep', { dist })
        : t(lang, 'echoNear');
    this.eggEchoTimer = 3.2;

    if (this.activeSceneChapter === 8) {
      this.ch8SporeFlareTimer = 6.5;
    }

    if (this.activeSceneChapter === 9 && !this.keshaStunUsed) {
      const kesha = this.npcs.find((n) => n.id === 'kesha');
      if (kesha && distanceSq3(this.playerPos, kesha.position) < 18 * 18) {
        this.keshaStunUsed = true;
        this.squid.stunTimer = Math.max(this.squid.stunTimer, 4.0);
        this.audio.playAscentStunWave();
        this.completeKeshaAlertAndOpenGate(true);
        return;
      }
    }

    if (res.stunDurationSec > 0) {
      this.squid.stunTimer = Math.max(this.squid.stunTimer, res.stunDurationSec);
      this.audio.playAscentStunWave();
      this.showToast(t(lang, 'toastAscentStunHit'));
    } else if (resonanceActive) {
      this.showToast(t(lang, 'toastEggResonance'));
    }
    this.emitHUD(true);
  }

  public triggerEchoScan(): void {
    if (this.screenState !== 'playing') return;
    this.audio.unlock();
    const diffCfg = DIFFICULTY_PRESETS[this.gameSettings.difficulty];
    const baseCooldown = getCallCooldownSec(this.campaign.phase) * diffCfg.callCooldownMult;
    if (this.simTimeSec - this.campaign.lastCallTimeSec >= baseCooldown) {
      this.triggerCall();
      return;
    }

    // Light path scan pulse even while Call stun wave is on cooldown
    this.audio.playCallPing(this.campaign.phase);
    this.callSonarTimer = Math.max(this.callSonarTimer, 3.6);
    this.callWaveActive = Math.max(this.callWaveActive, 0.85);
    this.callWaveRing.position.copy(this.playerPos);
    this.callWaveRing.scale.setScalar(0.55);

    const lang = this.gameSettings.language;
    const targetZ =
      this.activeSceneChapter === 6 && !this.ch6EggReclaimed
        ? CHAPTER_6_EGG_ALTAR_POS.z
        : -88;
    const dist = Math.max(0, Math.round(this.playerPos.z - targetZ));
    this.eggEchoText = dist > 25 ? t(lang, 'echoDeep', { dist }) : t(lang, 'echoNear');
    this.eggEchoTimer = 2.8;
    this.emitHUD(true);
  }

  private showToast(msg: string): void {
    this.toastText = msg;
    this.toastTimer = 4.0;
  }

  private tick = (): void => {
    if (this.disposed) return;

    const nowMs = performance.now();
    const rawDt = (nowMs - this.lastTimeMs) / 1000;
    this.lastTimeMs = nowMs;
    if (this.screenState === 'title') {
      this.titleSquidClockSec += Math.min(Math.max(rawDt, 0.001), 6.0);
    }
    const maxDt =
      this.isSoftwareGl && (this.titleSquidFleeing || this.screenState === 'title')
        ? 0.5
        : 0.12;
    const totalDt = Math.min(Math.max(rawDt, 0.001), maxDt);

    if (!this.isSoftwareGl && this.screenState === 'playing') {
      const frameMs = Math.min(65, Math.max(4, rawDt * 1000));
      this.frameTimeEmaMs = this.frameTimeEmaMs * 0.92 + frameMs * 0.08;
      this.adaptiveDprCounter++;
      if (this.adaptiveDprCounter >= 45) {
        this.adaptiveDprCounter = 0;
        const nextScale =
          this.frameTimeEmaMs > 30
            ? Math.max(0.72, this.adaptiveDprScale - 0.06)
            : this.frameTimeEmaMs < 18 && this.adaptiveDprScale < 1.0
              ? Math.min(1.0, this.adaptiveDprScale + 0.04)
              : this.adaptiveDprScale;
        if (Math.abs(nextScale - this.adaptiveDprScale) > 0.01) {
          this.adaptiveDprScale = nextScale;
          const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
          this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, qual.pixelRatioCap) * this.adaptiveDprScale,
          );
          if (this.planktonMat?.uniforms.uPixelRatio) {
            this.planktonMat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
          }
        }
      }
    }

    let remaining = totalDt;
    while (remaining > 0.0001) {
      const stepDt = Math.min(remaining, 0.04);
      remaining -= stepDt;
      this.simTimeSec += stepDt;

      if (this.screenState === 'title') {
        this.updateTitleStage(stepDt);
      } else if (this.screenState === 'playing') {
        this.updatePlaying(stepDt);
      }
    }
    // Update ambient shaders, schools, plankton, and bubbles once per render frame
    this.updateAmbientVisuals(totalDt);

    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    if (this.composer && qual.postProcessing && !this.isSoftwareGl) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    if (nowMs - this.lastHudEmitMs > 100) {
      this.emitHUD(false);
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private updateTitleStage(dt: number): void {
    const tSec = this.simTimeSec;
    this.heroPlayfulTimer = Math.max(0, this.heroPlayfulTimer - dt);

    const playSpin =
      this.heroPlayfulTimer > 0
        ? Math.sin((1 - this.heroPlayfulTimer / 1.05) * Math.PI * 2) * Math.PI * 2
        : 0;
    const playHop =
      this.heroPlayfulTimer > 0
        ? Math.sin((1 - this.heroPlayfulTimer / 1.05) * Math.PI) * 0.65
        : 0;

    this.playerPos.set(
      Math.sin(tSec * 0.5) * 0.6,
      3.0 + Math.sin(tSec * 1.1) * 0.3 + playHop,
      4.0,
    );
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.set(
      0.04 * Math.sin(tSec),
      Math.PI * 0.64 + Math.sin(tSec * 0.4) * 0.18,
      playSpin,
    );
    const tailBoost = this.heroPlayfulTimer > 0 ? 11.5 : 5.2;
    this.playerRig.tailPivot.rotation.y = Math.sin(tSec * tailBoost) * 0.35;
    if (this.glbFishPivot) {
      this.glbFishPivot.position.y = Math.sin(tSec * 2.4) * 0.12;
      this.glbFishPivot.rotation.y =
        this.glbFishYawOffset + Math.sin(tSec * 3.8) * 0.1;
      this.glbFishPivot.rotation.z = Math.sin(tSec * 3.8 - 0.5) * 0.06;
    }
    this.glbFishSwim?.updateSwim(
      tSec * (this.heroPlayfulTimer > 0 ? 9.5 : 4.2),
      this.heroPlayfulTimer > 0 ? 1.1 : 0.45,
    );
    if (this.mildredRig && this.npcs[0]) {
      this.mildredRig.group.position.set(
        this.npcs[0].anchorPosition.x + Math.sin(tSec * 0.45) * 1.1,
        this.npcs[0].anchorPosition.y + Math.sin(tSec * 0.9) * 0.4,
        this.npcs[0].anchorPosition.z,
      );
    }

    this.eggMesh.position.set(
      this.playerPos.x + 1.5,
      this.playerPos.y + 0.3 + Math.cos(tSec * 1.4) * 0.25,
      this.playerPos.z - 2.1,
    );
    const pulse =
      2.6 + Math.sin(tSec * 2.6) * 0.45 + (this.heroPlayfulTimer > 0 ? 2.2 : 0);
    this.playerRig.pointLight.intensity = pulse;
    this.glbFishSwim?.updateCallGlow(this.heroPlayfulTimer > 0 ? 1.2 : 0.15);

    // Graceful orbital drift + gentle pointer parallax framing the coral arch behind
    const camX = Math.sin(tSec * 0.15) * 2.6 - 1.4 + this.titleParallaxX * 0.9;
    const camY = 4.45 + Math.sin(tSec * 0.24) * 0.38 - this.titleParallaxY * 0.55;
    const camZ = 10.6 + Math.cos(tSec * 0.13) * 1.1;
    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0.4 + this.titleParallaxX * 0.4, 2.8 - this.titleParallaxY * 0.25, -4);
    this.camera.updateMatrixWorld();

    // Update interactive 3D Library Squid button or dramatic escape trajectory
    if (this.titleSquidFleeing) {
      this.titleSquidFleeTimer = Math.max(0, this.titleSquidFleeTimer - dt);
      const elapsed = TITLE_SQUID_FLEE_DURATION_SEC - this.titleSquidFleeTimer;
      const frame = computeTitleSquidFlightFrame(elapsed, TITLE_SQUID_FLEE_DURATION_SEC);

      this.titleSquidGroup.visible = true;
      this.titleSquidGroup.position
        .copy(this.titleSquidFleeOrigin)
        .addScaledVector(this.titleSquidFleeRight, frame.offsetRight)
        .addScaledVector(this.titleSquidFleeUp, frame.offsetUp)
        .addScaledVector(this.titleSquidFleeFwd, frame.offsetForward);

      this.titleSquidGroup.rotation.set(
        frame.pitchRad,
        this.camera.rotation.y + Math.PI * 0.35 + frame.yawOffsetRad,
        frame.rollRad,
      );
      this.titleSquidGroup.scale.set(
        frame.squashRadial,
        frame.squashRadial,
        frame.stretchAxial,
      );
      this.titleSquidLight.intensity = frame.glowIntensity;

      this.titleSquidInkMesh.visible = frame.inkOpacity > 0.01;
      this.titleSquidInkMesh.scale.setScalar(frame.inkScale);
      this.titleSquidInkMat.opacity = frame.inkOpacity;

      this.titleSquidMixer?.update(dt * frame.animSpeedMult);
      this.titleSquidFallbackRig.tentacles.rotation.z += dt * 11;
      this.titleSquidFallbackRig.siphonMat.emissiveIntensity = frame.glowIntensity;

      this.titleSquidFleeBubbleAccum += dt;
      if (this.titleSquidFleeBubbleAccum >= 0.065) {
        this.titleSquidFleeBubbleAccum = 0;
        this.spawnBubbleBurst(this.titleSquidGroup.position, 4, 1.3);
      }

      if (frame.done) {
        const pendingNewGame = this.titleSquidPendingNewGame;
        const pendingChapter = this.titleSquidPendingChapter;
        this.titleSquidFleeing = false;
        this.titleSquidFleeTimer = 0;
        this.titleSquidGroup.visible = false;
        this.titleSquidInkMesh.visible = false;
        if (pendingNewGame) {
          this.executeStartNewGameNow(true);
        } else {
          this.executeStartGameNow(false, pendingChapter, true);
        }
      }
      return;
    }

    if (this.titleSquidGroup) {
      this.titleSquidGroup.visible = true;
      this.titleSquidLight.visible = true;
      const idle = computeTitleSquidIdleFrame(
        this.titleSquidClockSec,
        this.titleSquidHovered,
      );
      document.body.dataset.titleSquidPhase =
        idle.attackAdvance > 0.35
          ? 'attack'
          : idle.isAttacking
            ? 'windup'
            : idle.isSwimming
              ? 'swim'
              : 'idle';

      _vec3.set(this.titleSquidAnchorNdc.x, this.titleSquidAnchorNdc.y, 0.5).unproject(this.camera);
      _vec3.sub(this.camera.position).normalize();
      _squidCamFwd.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
      _squidCamRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize();
      _squidCamUp.set(0, 1, 0).applyQuaternion(this.camera.quaternion).normalize();

      if (idle.isAttacking && idle.attackAdvance > 0.45 && !this.titleSquidAttackBurstFired) {
        this.titleSquidAttackBurstFired = true;
        this.spawnBubbleBurst(this.titleSquidGroup.position, 14, 1.35);
      } else if (!idle.isAttacking) {
        this.titleSquidAttackBurstFired = false;
      }

      if (idle.attackAdvance > 0.6) {
        const impactJolt = (idle.attackAdvance - 0.6) * 0.055;
        this.camera.position.x += Math.sin(tSec * 42) * impactJolt;
        this.camera.position.y += Math.cos(tSec * 37) * impactJolt * 0.7;
        this.camera.updateMatrixWorld();
      }

      _squidHomePos.copy(this.camera.position).addScaledVector(_vec3, 4.9);
      if (idle.attackAdvance < 0) {
        _squidHomePos.addScaledVector(_vec3, -idle.attackAdvance * 2.4);
      } else if (idle.attackAdvance > 0) {
        _squidAttackPos
          .copy(this.camera.position)
          .addScaledVector(_squidCamFwd, 2.08)
          .addScaledVector(_squidCamRight, 0.14)
          .addScaledVector(_squidCamUp, -0.05);
        _squidHomePos.lerp(_squidAttackPos, Math.min(1, idle.attackAdvance));
      }

      const swimDamp = 1 - Math.min(1, Math.max(0, idle.attackAdvance) * 0.94);
      this.titleSquidGroup.position
        .copy(_squidHomePos)
        .addScaledVector(_squidCamRight, idle.offsetRight * swimDamp)
        .addScaledVector(_squidCamUp, idle.offsetUp * swimDamp);

      const targetScale =
        (this.titleSquidHovered ? 1.15 : 1.0) * idle.lungeScale;
      this.titleSquidHoverScale +=
        (targetScale - this.titleSquidHoverScale) * Math.min(1, dt * 12);
      this.titleSquidGroup.scale.setScalar(this.titleSquidHoverScale);

      _squidEuler.set(idle.pitchRad, idle.yawRad, idle.rollRad);
      _squidIdleQuat.setFromEuler(_squidEuler);
      if (idle.attackAimBlend > 0.001) {
        _squidTargetAim
          .copy(this.camera.position)
          .addScaledVector(_squidCamRight, 0.22)
          .addScaledVector(_squidCamUp, 0.16)
          .sub(this.titleSquidGroup.position);
        if (_squidTargetAim.lengthSq() > 0.001) {
          _squidTargetAim.normalize();
          _squidArmDirWorld
            .copy(this.titleSquidArmForwardLocal)
            .applyQuaternion(_squidIdleQuat)
            .normalize();
          _squidDeltaQuat.setFromUnitVectors(_squidArmDirWorld, _squidTargetAim);
          _squidAttackQuat.multiplyQuaternions(_squidDeltaQuat, _squidIdleQuat);
          _squidIdleQuat.slerp(_squidAttackQuat, idle.attackAimBlend);
        }
      }
      this.titleSquidGroup.quaternion.copy(_squidIdleQuat);

      _squidFluoroBlended
        .copy(_squidFluoroCyan)
        .lerp(_squidFluoroViolet, idle.fluoroHueShift);

      // Position camera-facing fluorescent light directly in front of the squid
      _vec3B
        .copy(this.camera.position)
        .sub(this.titleSquidGroup.position);
      if (_vec3B.lengthSq() > 0.001) {
        _vec3B.normalize();
      } else {
        _vec3B.set(0, 0, 1);
      }
      this.titleSquidLight.position
        .copy(this.titleSquidGroup.position)
        .addScaledVector(_vec3B, 1.35)
        .addScaledVector(_squidCamUp, 0.26);
      this.titleSquidLight.color.copy(_squidFluoroBlended);
      this.titleSquidLight.intensity = 1.4 + idle.fluoroFlash * 3.6;

      for (const entry of this.titleSquidGlowMats) {
        entry.mat.emissive.copy(_squidFluoroBlended);
        entry.mat.emissiveIntensity = 0.35 + idle.fluoroFlash * 0.55;
      }
      for (const u of this.titleSquidFluoroUniforms) {
        u.uFluoroFlash.value = idle.fluoroFlash;
        u.uFluoroColor.value.copy(_squidFluoroBlended);
        u.uFluoroPhase.value = idle.fluoroPhase;
      }

      const closeDamp = Math.max(0, idle.attackAdvance);
      const baseHalo = 2.65 + idle.phosphorPulse * 1.95;
      const haloScale =
        baseHalo * (1 - closeDamp * 0.16) * (1 + idle.tentacleFlare * 0.15);
      _vec3B.copy(this.titleSquidGroup.position).sub(this.camera.position);
      if (_vec3B.lengthSq() > 0.001) {
        _vec3B.normalize().multiplyScalar(0.16);
      } else {
        _vec3B.set(0, 0, -0.16);
      }
      this.titleSquidHaloSprite.position.copy(_vec3B).applyQuaternion(
        _squidParentInvQuat.copy(this.titleSquidGroup.quaternion).invert(),
      );
      this.titleSquidCoreSprite.position.copy(this.titleSquidHaloSprite.position);

      this.titleSquidHaloSprite.scale.set(haloScale, haloScale, 1);
      this.titleSquidHaloMat.color.copy(_squidFluoroBlended);
      this.titleSquidHaloMat.opacity = Math.min(
        0.78,
        0.22 + idle.phosphorPulse * 0.46 + (idle.isAttacking ? 0.18 : 0),
      );
      const coreScale =
        (1.35 + idle.phosphorPulse * 0.85) * (1 - closeDamp * 0.12) * (1 + idle.tentacleFlare * 0.14);
      this.titleSquidCoreSprite.scale.set(coreScale, coreScale, 1);
      this.titleSquidCoreMat.opacity = Math.min(
        0.65,
        0.16 + idle.phosphorPulse * 0.38 + (idle.isAttacking ? 0.14 : 0),
      );

      this.titleSquidMixer?.update(dt * idle.animSpeedMult);
      if (this.titleSquidModelPivot && idle.tentacleFlare > 0.005 && this.titleSquidTentacleChains.length > 0) {
        this.applyTitleSquidTentacleFlare(idle.tentacleFlare);
      }

      this.titleSquidFallbackRig.tentacles.rotation.z +=
        dt *
        (idle.isAttacking
          ? 7.5
          : idle.isSwimming
            ? 3.8
            : this.titleSquidHovered
              ? 4.8
              : 2.2);
      const fbKids = this.titleSquidFallbackRig.tentacles.children;
      for (let i = 0; i < fbKids.length; i++) {
        const a = (i / Math.max(1, fbKids.length)) * Math.PI * 2;
        const flareR = 0.22 + idle.tentacleFlare * 0.46;
        const tMesh = fbKids[i];
        tMesh.position.set(
          Math.cos(a) * flareR,
          Math.sin(a) * flareR,
          0.55 - idle.tentacleFlare * 0.14,
        );
        tMesh.rotation.set(
          -Math.sin(a) * idle.tentacleFlare * 0.88,
          Math.cos(a) * idle.tentacleFlare * 0.88,
          0,
        );
      }
      this.titleSquidFallbackRig.siphonMat.emissiveIntensity =
        2.4 + idle.glowIntensity * 1.8;
    }
  }

  private applyTitleSquidTentacleFlare(flare: number): void {
    const chains = this.titleSquidTentacleChains;
    if (chains.length === 0) return;

    this.titleSquidGroup.updateMatrixWorld(true);
    _squidMouthCenter.set(0, 0, 0);
    for (const chain of chains) {
      chain.b0.getWorldPosition(_squidBonePos0);
      _squidMouthCenter.add(_squidBonePos0);
    }
    _squidMouthCenter.divideScalar(chains.length);

    if (this.titleSquidMantleBone) {
      this.titleSquidMantleBone.getWorldPosition(_squidMantlePos);
      _squidTentacleFwd.copy(_squidMouthCenter).sub(_squidMantlePos);
    } else {
      _squidTentacleFwd
        .copy(this.titleSquidArmForwardLocal)
        .applyQuaternion(this.titleSquidGroup.quaternion);
    }
    if (_squidTentacleFwd.lengthSq() < 1e-5) {
      _squidTentacleFwd.set(0, 0, 1);
    } else {
      _squidTentacleFwd.normalize();
    }

    const angle0 = flare * 1.25;
    const angle1 = flare * 0.45;
    const angle2 = flare * -0.34;

    for (const chain of chains) {
      chain.b0.getWorldPosition(_squidBonePos0);
      chain.b1.getWorldPosition(_squidBonePos1);
      _squidBoneDir.copy(_squidBonePos1).sub(_squidBonePos0);
      if (_squidBoneDir.lengthSq() < 1e-6) continue;
      _squidBoneDir.normalize();

      _squidRadialOut.copy(_squidBonePos0).sub(_squidMouthCenter);
      const proj = _squidRadialOut.dot(_squidTentacleFwd);
      _squidRadialOut.addScaledVector(_squidTentacleFwd, -proj);
      if (_squidRadialOut.lengthSq() < 1e-5) continue;
      _squidRadialOut.normalize();

      _squidRotAxis.crossVectors(_squidBoneDir, _squidRadialOut);
      if (_squidRotAxis.lengthSq() < 1e-5) continue;
      _squidRotAxis.normalize();

      if (chain.b0.parent) {
        chain.b0.parent.getWorldQuaternion(_squidParentInvQuat).invert();
        _vec3B.copy(_squidRotAxis).applyQuaternion(_squidParentInvQuat);
        if (_vec3B.lengthSq() > 1e-6) {
          _vec3B.normalize();
          _squidDeltaQuat.setFromAxisAngle(_vec3B, angle0);
          chain.b0.quaternion.premultiply(_squidDeltaQuat);
          chain.b0.updateMatrixWorld(true);
        }
      }

      if (chain.b1.parent) {
        chain.b1.parent.getWorldQuaternion(_squidParentInvQuat).invert();
        _vec3B.copy(_squidRotAxis).applyQuaternion(_squidParentInvQuat);
        if (_vec3B.lengthSq() > 1e-6) {
          _vec3B.normalize();
          _squidDeltaQuat.setFromAxisAngle(_vec3B, angle1);
          chain.b1.quaternion.premultiply(_squidDeltaQuat);
          chain.b1.updateMatrixWorld(true);
        }
      }

      if (chain.b2 && chain.b2.parent) {
        chain.b2.parent.getWorldQuaternion(_squidParentInvQuat).invert();
        _vec3B.copy(_squidRotAxis).applyQuaternion(_squidParentInvQuat);
        if (_vec3B.lengthSq() > 1e-6) {
          _vec3B.normalize();
          _squidDeltaQuat.setFromAxisAngle(_vec3B, angle2);
          chain.b2.quaternion.premultiply(_squidDeltaQuat);
        }
      }
    }
  }

  private updatePlaying(dt: number): void {
    this.playElapsedSec += dt;
    this.hurtInvulnTimer = Math.max(0, this.hurtInvulnTimer - dt);
    this.mildredBumpCooldown = Math.max(0, this.mildredBumpCooldown - dt);
    this.shrimpPanicCooldown = Math.max(0, this.shrimpPanicCooldown - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.dashBoostTimer = Math.max(0, this.dashBoostTimer - dt);
    this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
    this.pafnutiySwellTimer = Math.max(0, this.pafnutiySwellTimer - dt);
    this.callSonarTimer = Math.max(0, this.callSonarTimer - dt);
    this.eggResonanceTimer = Math.max(0, this.eggResonanceTimer - dt);
    this.ch8SporeFlareTimer = Math.max(0, this.ch8SporeFlareTimer - dt);

    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - dt);
      if (this.toastTimer === 0) this.toastText = null;
    }
    if (this.eggEchoTimer > 0) {
      this.eggEchoTimer = Math.max(0, this.eggEchoTimer - dt);
      if (this.eggEchoTimer === 0) this.eggEchoText = null;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      this.updateCameraRig(dt);
      return;
    }

    // Egg choreography per chapter
    if (this.activeSceneChapter === 1 && this.introBeatTimer > 0) {
      this.introBeatTimer = Math.max(0, this.introBeatTimer - dt);
      const p = 1 - this.introBeatTimer / 2.4;
      this.eggMesh.visible = true;
      this.eggMesh.position.set(
        Math.sin(p * 8) * 1.5,
        THREE.MathUtils.lerp(3.2, -1.6, p),
        THREE.MathUtils.lerp(2.0, -88.0, Math.pow(p, 1.35)),
      );
    } else if (this.activeSceneChapter === 6) {
      this.eggMesh.visible = !this.ch6EggReclaimed;
      if (!this.ch6EggReclaimed) {
        this.eggMesh.position.set(
          CHAPTER_6_EGG_ALTAR_POS.x + Math.sin(this.simTimeSec * 1.5) * 0.14,
          CHAPTER_6_EGG_ALTAR_POS.y + 1.35 + Math.sin(this.simTimeSec * 2.4) * 0.22,
          CHAPTER_6_EGG_ALTAR_POS.z,
        );
      }
    } else if (this.activeSceneChapter < 6) {
      this.eggMesh.visible = true;
      const targetEggY = getChapterFloorHeight(this.activeSceneChapter, 0, -88) + 2.2;
      this.eggMesh.position.set(
        Math.sin(this.simTimeSec * 1.5) * 0.4,
        targetEggY + Math.sin(this.simTimeSec * 2.2) * 0.25,
        -88,
      );
    } else {
      this.eggMesh.visible = false;
    }

    // 1. Subnautica-style swimming OR autopilot
    const speedMult = getPlayerSpeedMultiplier(this.campaign);
    const mdx = this.controlSettings.mouseEnabled ? this.mouseDeltaX : 0;
    const mdy = this.controlSettings.mouseEnabled ? this.mouseDeltaY : 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    const tuning: SwimTuningOptions = {
      mouseSensitivityScale: this.controlSettings.mouseSensitivity,
      keyTurnSpeedScale: this.controlSettings.keyboardTurnSpeed,
      invertMouseY: this.controlSettings.invertMouseY,
    };

    const kbActive = this.controlSettings.keyboardEnabled;
    const sustainedLmbHold =
      this.controlSettings.mouseEnabled &&
      this.controlSettings.lmbHoldToSwim &&
      this.controlSettings.mouseBindings.holdSwim !== 'NONE' &&
      this.pointerDown &&
      performance.now() - this.pointerDownTimeMs >= 180;

    if (sustainedLmbHold && this.swimTarget !== null) {
      this.clearSwimTarget();
    }

    let swimStep: {
      candidatePosition: { x: number; y: number; z: number };
      noseDir: THREE.Vector3;
      speed: number;
    };

    if (this.swimTarget !== null) {
      const autoRes = stepAutopilotMotion(
        this.swimState,
        this.swimTarget,
        mdx,
        mdy,
        speedMult,
        dt,
        tuning,
        0.85,
        this._stepNoseDir,
      );
      swimStep = autoRes;
      if (autoRes.arrived) {
        this.clearSwimTarget();
        const autoToast = t(this.gameSettings.language, 'toastAutopilot');
        if (this.toastText === autoToast) {
          this.toastText = null;
          this.toastTimer = 0;
        }
        this.emitHUD(true);
      }
    } else {
      const allBound = Object.values(this.controlSettings.keyBindings);
      const allowShiftDescend = !allBound.includes('ShiftLeft');
      const stickBack = this.virtualStickY > 0.35;
      const stickLeft = this.virtualStickX < -0.25;
      const stickRight = this.virtualStickX > 0.25;
      // Pushing the touch stick laterally swims cleanly into the turn instead of spinning in place
      const stickFwd =
        this.virtualStickY < -0.2 ||
        (!stickBack && Math.abs(this.virtualStickX) > 0.25);
      swimStep = stepSwimMotion(
        this.swimState,
        {
          forward:
            (kbActive && this.isBoundMovementDown('forward', 'ArrowUp')) ||
            sustainedLmbHold ||
            stickFwd,
          backward:
            (kbActive && this.isBoundMovementDown('backward', 'ArrowDown')) ||
            stickBack,
          turnLeft:
            (kbActive && this.isBoundMovementDown('turnLeft', 'ArrowLeft')) ||
            stickLeft,
          turnRight:
            (kbActive && this.isBoundMovementDown('turnRight', 'ArrowRight')) ||
            stickRight,
          ascend:
            (kbActive && this.isBoundMovementDown('ascend')) ||
            this.virtualAscend,
          descend:
            (kbActive &&
              (this.isBoundMovementDown('descend') ||
                (allowShiftDescend && this.keys.has('ShiftLeft')) ||
                this.keys.has('ControlLeft'))) ||
            this.virtualDescend,
          mouseDeltaX: mdx,
          mouseDeltaY: mdy,
        },
        speedMult,
        dt,
        tuning,
        this.dashBoostTimer > 0,
        this._stepNoseDir,
      );
    }

    const prevPos = { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z };
    let nextPos = {
      x: swimStep.candidatePosition.x,
      y: swimStep.candidatePosition.y,
      z: swimStep.candidatePosition.z,
    };

    // Environmental forces: Ch. 5 hydrothermal vents, Ch. 7/10 updrafts, & Ch. 4/7/10 ocean side currents
    this.inUpdraftCurrent = false;
    if (this.activeSceneChapter === 5) {
      const ventCheck = sampleThermalVentHazard(
        nextPos,
        CHAPTER_5_THERMAL_VENTS,
        this.simTimeSec,
        this.hurtInvulnTimer,
      );
      if (ventCheck.pushY > 0) {
        nextPos.y += ventCheck.pushY * dt;
      }
      if (ventCheck.hitPlayer) {
        this.audio.playThermalVentBurst();
        this.handlePlayerHurt('toastVentHit');
      }
    } else if (this.activeSceneChapter === 7 || this.activeSceneChapter === 10) {
      const zones =
        this.activeSceneChapter === 7 ? CHAPTER_7_UPDRAFT_ZONES : CHAPTER_10_UPDRAFT_ZONES;
      const updraft = sampleUpdraftCurrent(nextPos, zones);
      this.inUpdraftCurrent = updraft.inUpdraft;
      if (updraft.inUpdraft) {
        nextPos.z -= updraft.boostForward * dt;
        nextPos.y += updraft.boostY * dt;
      }
    }

    const ch = this.activeSceneChapter;
    const sideCur = sampleSideCurrent(
      nextPos,
      CHAPTER_SIDE_CURRENTS[ch],
      this.simTimeSec,
    );
    if (sideCur.active) {
      nextPos.x += sideCur.forceX * dt;
      nextPos.y += sideCur.forceY * dt;
    }

    if (ch === 1) {
      const netRes = resolveTrawlerNetCollision(prevPos, nextPos);
      if (netRes.hitNet) {
        this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
        if (this.swimTarget !== null) {
          this.clearSwimTarget();
          stopSwimMotion(this.swimState);
        }
        this.showToast(t(this.gameSettings.language, 'toastHitNet'));
      }
      nextPos = netRes.position;
    } else if (ch === 2) {
      const gateRes = resolvePelicanGateCollision(prevPos, nextPos, this.pelicanGateOpen);
      if (gateRes.hitGate) {
        this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
        if (this.swimTarget !== null) {
          this.clearSwimTarget();
          stopSwimMotion(this.swimState);
        }
        this.showToast(t(this.gameSettings.language, 'toastPelicanLocked'));
      }
      nextPos = gateRes.position;
    } else if (ch === 3) {
      const debrisRes = resolveCrabDebrisCollision(prevPos, nextPos, this.ch3DebrisOpen);
      if (debrisRes.hitDebris) {
        this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
        if (this.swimTarget !== null) {
          this.clearSwimTarget();
          stopSwimMotion(this.swimState);
        }
        this.showToast(t(this.gameSettings.language, 'toastDebrisLocked'));
      }
      nextPos = debrisRes.position;
    } else if (ch === 4) {
      const gateRes = resolveCharybdisGateCollision(prevPos, nextPos, this.ch4GateOpen);
      if (gateRes.hitGate) {
        this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
        if (this.swimTarget !== null) {
          this.clearSwimTarget();
          stopSwimMotion(this.swimState);
        }
        this.showToast(t(this.gameSettings.language, 'toastCharybdisLocked'));
      }
      nextPos = gateRes.position;
    } else if (ch === 5 || ch === 7 || ch === 8 || ch === 9) {
      const gateOpen =
        ch === 5
          ? this.ch5GateOpen
          : ch === 7
            ? this.ch7WhaleFreed
            : ch === 8
              ? this.ch8ShortcutOpen
              : this.ch9BulkheadOpen;
      const gateZ =
        ch === 5
          ? CHAPTER_5_GATE_Z
          : ch === 7
            ? CHAPTER_7_WHALE_GATE_Z
            : ch === 8
              ? CHAPTER_8_SHORTCUT_GATE_Z
              : CHAPTER_9_BULKHEAD_Z;
      const lockedToastKey =
        ch === 5
          ? 'toastCh5GateLocked'
          : ch === 7
            ? 'toastCh7GateLocked'
            : ch === 8
              ? 'toastCh8GateLocked'
              : 'toastCh9GateLocked';
      const gateRes = resolvePelicanGateCollision(prevPos, nextPos, gateOpen, gateZ);
      if (gateRes.hitGate) {
        this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
        if (this.swimTarget !== null) {
          this.clearSwimTarget();
          stopSwimMotion(this.swimState);
        }
        this.showToast(t(this.gameSettings.language, lockedToastKey));
      }
      nextPos = gateRes.position;
    }

    const clamped = clampPlayerPositionForChapter(ch, nextPos);
    clampVelocityAgainstBounds(this.swimState, nextPos, clamped);
    this.playerPos.set(clamped.x, clamped.y, clamped.z);

    if (this.swimTarget !== null) {
      const distSq = this.playerPos.distanceToSquared(this.swimTarget);
      const stallCheck = shouldAbortStalledAutopilot(
        this.autopilotBestDistSq,
        distSq,
        this.autopilotStallSec,
        dt,
      );
      this.autopilotBestDistSq = stallCheck.bestDistSq;
      this.autopilotStallSec = stallCheck.stallSec;
      if (stallCheck.abort) {
        this.clearSwimTarget();
        stopSwimMotion(this.swimState);
        this.showToast(t(this.gameSettings.language, 'toastPathBlocked'));
        this.emitHUD(true);
      }
    }

    // Track room checkpoint transitions
    const roomId = getRoomIdForChapter(ch, this.playerPos.z);
    if (roomId !== this.campaign.currentRoomId) {
      this.campaign = advanceToRoom(this.campaign, roomId);
    }

    // Player visuals, carried egg, seabed shadow & shelter recovery (doubled during Egg Resonance)
    const isHidden = isInsideCoralShelter(this.playerPos, this.activeShelters);
    this.health = stepShelterOxygenRecovery(
      this.health,
      this.maxHealth,
      isHidden,
      dt,
      this.eggResonanceTimer > 0 ? 2.0 : 1.0,
    );
    const speedMag = swimStep.speed;
    this.swimDistance += speedMag * dt;

    this.playerRig.group.position.copy(this.playerPos);
    _rollQuat.setFromAxisAngle(_zAxis, this.swimState.fishRoll);
    this.playerRig.group.quaternion
      .copy(this.swimState.fishQuat)
      .multiply(_rollQuat);

    // Carried glowing egg orbits Mama Fish throughout Ascent with gentle heartbeat shimmer
    const showCarriedEgg = (ch >= 7 || this.ch6EggReclaimed) && !this.hatchlingBorn;
    this.carriedEggRig.visible = showCarriedEgg;
    if (showCarriedEgg) {
      this.carriedEggRig.position.set(
        this.playerPos.x + Math.sin(this.simTimeSec * 2.1) * 0.85,
        this.playerPos.y + 0.52 + Math.cos(this.simTimeSec * 2.7) * 0.16,
        this.playerPos.z + 0.65,
      );
      this.carriedEggRig.rotation.y += dt * 1.4;
      const hb =
        0.52 *
        (1 +
          Math.sin(this.simTimeSec * 4.2) *
            (this.eggResonanceTimer > 0 ? 0.12 : 0.055));
      this.carriedEggRig.scale.setScalar(hb);
    }

    // Seabed contact shadow beneath Mama Fish
    if (this.playerShadow) {
      const shadowFloorY = getChapterFloorHeight(ch, this.playerPos.x, this.playerPos.z);
      const hAbove = Math.max(0, this.playerPos.y - shadowFloorY);
      const sScale = Math.max(0.45, 1.15 - hAbove * 0.08);
      this.playerShadow.position.set(this.playerPos.x, shadowFloorY + 0.05, this.playerPos.z);
      this.playerShadow.scale.setScalar(sScale);
      const shadowMat = this.playerShadow.material as THREE.MeshBasicMaterial;
      shadowMat.opacity = Math.max(0.12, 0.72 - hAbove * 0.075);
    }

    const tailFreq = 3.2 + speedMag * 1.15;
    this.playerRig.tailPivot.rotation.y =
      Math.sin(this.simTimeSec * tailFreq) * 0.42 - this.swimState.turnFlex * 0.6;
    this.playerRig.leftFin.rotation.z = Math.sin(this.simTimeSec * 4.0) * 0.16;
    this.playerRig.rightFin.rotation.z = Math.PI - Math.sin(this.simTimeSec * 4.0) * 0.16;
    if (this.glbFishPivot) {
      const swimBob = Math.sin(this.simTimeSec * 2.8) * 0.1;
      this.glbFishPivot.position.y = swimBob;
      this.glbFishPivot.rotation.y =
        this.glbFishYawOffset +
        Math.sin(this.simTimeSec * tailFreq) * 0.12 +
        this.swimState.turnFlex * 0.55;
      this.glbFishPivot.rotation.z =
        Math.sin(this.simTimeSec * tailFreq - 0.6) * 0.07;
      this.glbFishPivot.rotation.x = Math.cos(this.simTimeSec * 2.8) * 0.035;
    }
    this.glbFishSwim?.updateSwim(
      this.simTimeSec * (4.2 + speedMag * 0.9),
      Math.min(1.4, speedMag / 7.5 + Math.abs(this.swimState.turnFlex) * 0.65),
    );

    const callPulse =
      this.callWaveActive > 0
        ? Math.sin(Math.min(1, this.callWaveActive) * Math.PI) * 1.15 +
          this.callWaveActive * 1.5
        : 0;
    const targetLightIntensity =
      (isHidden ? 1.1 : 3.0) + callPulse * 2.5 + (this.dashBoostTimer > 0 ? 1.8 : 0);
    const hasCoralVeil = this.campaign.upgrades.includes('coral_veil');
    const lightDampRate = isHidden && hasCoralVeil ? 18 : 10;
    this.playerRig.pointLight.intensity = THREE.MathUtils.damp(
      this.playerRig.pointLight.intensity,
      targetLightIntensity,
      lightDampRate,
      dt,
    );
    this.glbFishSwim?.updateCallGlow(callPulse);
    this.playerRig.lureMat.emissiveIntensity =
      (isHidden ? 0.55 : 1.8) + callPulse * 1.6;

    // Track sun shadow frustum along active swim Z (texel-snapped to avoid shimmer)
    if (!this.isSoftwareGl && this.sunDirLight.castShadow) {
      const snapZ = Math.round((this.playerPos.z - 8) * 2) * 0.5;
      this.sunDirLight.target.position.set(0, 0, snapZ);
      this.sunDirLight.position.set(12, 28, snapZ + 18);
      this.sunDirLight.target.updateMatrixWorld();
    }

    // Subtle depth-dependent optical grading across all 10 chapters
    if (this.opticalPass?.uniforms.uDepth01) {
      const zProgress = Math.max(0, Math.min(1, (4 - this.playerPos.z) / 92));
      const baseOptical =
        ch === 6
          ? 0.92
          : ch === 5
            ? 0.82
            : ch === 7
              ? 0.78 - zProgress * 0.22
              : ch === 4
                ? 0.72 + zProgress * 0.24
                : ch === 8
                  ? 0.6 - zProgress * 0.22
                  : ch === 3
                    ? 0.55 + zProgress * 0.3
                    : ch === 9
                      ? 0.44 - zProgress * 0.2
                      : ch === 2
                        ? 0.42 + zProgress * 0.35
                        : ch === 10
                          ? 0.26 - zProgress * 0.2
                          : zProgress * 0.45;
      this.opticalPass.uniforms.uDepth01.value = Math.max(0, Math.min(1, baseOptical));
    }

    // Emit delicate swim wake bubbles behind the fish tail proportional to swim speed
    if (speedMag > 2.4 && this.gameSettings.graphicsQuality !== 'very_low') {
      this.bubbleSpawnAccum += dt * (speedMag * 1.15 + (this.dashBoostTimer > 0 ? 14 : 0));
      while (this.bubbleSpawnAccum >= 1) {
        this.bubbleSpawnAccum -= 1;
        _vec3B
          .copy(this.playerPos)
          .addScaledVector(swimStep.noseDir, -1.05);
        this.spawnBubble(
          _vec3B.x + (Math.random() - 0.5) * 0.42,
          _vec3B.y + (Math.random() - 0.5) * 0.25,
          _vec3B.z + (Math.random() - 0.5) * 0.42,
          0.48 + Math.random() * 0.52,
        );
      }
    }

    // 2. Chapter NPCs & Mechanics
    if (ch === 10) {
      this.updateChapter10Actors(dt);
    } else if (ch === 9) {
      this.updateChapter9Actors(dt, isHidden, speedMag);
    } else if (ch === 8) {
      this.updateChapter8Actors(dt);
    } else if (ch === 7) {
      this.updateChapter7Actors(dt);
    } else if (ch === 6) {
      this.updateChapter6Actors(dt);
    } else if (ch === 5) {
      this.updateChapter5Actors(dt);
    } else if (ch === 4) {
      this.updateChapter4Actors(dt);
    } else if (ch === 3) {
      this.updateChapter3Actors(dt);
    } else if (ch === 2) {
      this.updateChapter2Actors(dt, isHidden, speedMag);
    } else {
      this.updateChapter1NPCs(dt, isHidden);
    }

    // 3. Collectible Pearls & Chapter Lore Relic (+ sonar highlight pulse on Call)
    const sonarActive = this.callSonarTimer > 0;
    for (const p of this.activePearls) {
      if (this.campaign.collectedPearlIds.includes(p.id)) continue;
      const mesh = this.pearlMeshes.get(p.id);
      if (!mesh) continue;
      mesh.rotation.y += dt * (sonarActive ? 2.6 : 1.1);
      if (sonarActive && distanceSq3(this.playerPos, mesh.position) < 1300) {
        const pulse = 1 + Math.sin(this.simTimeSec * 9.0) * 0.22;
        mesh.scale.setScalar(pulse);
      } else {
        mesh.scale.setScalar(1);
      }
      if (distanceSq3(this.playerPos, mesh.position) < 4.5) {
        this.campaign = collectPearl(this.campaign, p.id);
        mesh.visible = false;
        this.spawnBubbleBurst(mesh.position, 10, 1.15);
        this.audio.playPearlPickup();
        this.persistCampaignSnapshot();
        this.showToast(
          t(this.gameSettings.language, 'toastPearlCollected', {
            pearls: this.campaign.pearls,
          }),
        );
      }
    }

    if (this.loreRelicMesh && this.loreRelicMesh.visible) {
      const relic = CHAPTER_LORE_RELICS[ch];
      if (relic && !this.campaign.collectedRelicIds.includes(relic.id)) {
        this.loreRelicMesh.rotation.y += dt * (sonarActive ? 2.8 : 1.25);
        const halo = this.loreRelicMesh.userData.relicHalo as THREE.Mesh | undefined;
        if (halo) {
          halo.rotation.z += dt * 1.8;
        }
        if (sonarActive && distanceSq3(this.playerPos, this.loreRelicMesh.position) < 1800) {
          this.loreRelicMesh.scale.setScalar(1 + Math.sin(this.simTimeSec * 9.0) * 0.24);
        } else {
          this.loreRelicMesh.scale.setScalar(1);
        }
        if (distanceSq3(this.playerPos, this.loreRelicMesh.position) < 5.0) {
          const pick = collectLoreRelic(this.campaign, relic.id);
          this.campaign = pick.state;
          // Sanctuary Blessing micro-boon: restore O2, reset Call cooldown, emit soft ripple
          this.health = Math.min(this.maxHealth, this.health + 22);
          this.campaign.lastCallTimeSec = -999;
          this.callWaveActive = Math.max(this.callWaveActive, 0.75);
          this.callWaveRing.position.copy(this.playerPos);
          this.loreRelicMesh.visible = false;
          this.spawnBubbleBurst(this.loreRelicMesh.position, 16, 1.25);
          this.audio.playPearlPickup();
          this.persistCampaignSnapshot();
          const lang = this.gameSettings.language;
          const title = getLoreRelicText(relic, lang).title;
          this.showToast(
            `${t(lang, 'toastLoreRelicCollected', { title })} ${t(lang, 'toastSanctuaryBlessing')}`,
          );
          this.emitHUD(true);
        }
      }
    }

    // 4. Predator AI & Proximity Heartbeat scaled by Difficulty preset & Egg Resonance
    const diffCfg = DIFFICULTY_PRESETS[this.gameSettings.difficulty];
    const predatorSpeedMult =
      getPredatorSpeedMultiplier(this.campaign) * diffCfg.predatorSpeedMult;
    const activeSkin = GLOW_SKINS[this.campaign.activeSkin];
    const resonanceMult = this.eggResonanceTimer > 0 ? 0.84 : 1.0;
    const baseDetect =
      activeSkin.chauliodusVisibilityMultiplier * diffCfg.predatorDetectMult * resonanceMult;
    const squidOpts =
      ch === 10
        ? {
            chapter: 10 as ChapterId,
            patrolCenterZ: -48,
            patrolCenterY: getChapterFloorHeight(10, 0, -48) + 2.4,
            zMin: -76,
            zMax: -22,
            detectionMultiplier: baseDetect * 1.02,
          }
        : ch === 9
          ? {
              chapter: 9 as ChapterId,
              patrolCenterZ: -46,
              patrolCenterY: getChapterFloorHeight(9, 0, -46) + 2.2,
              zMin: -74,
              zMax: -20,
              detectionMultiplier: baseDetect * 1.08,
            }
          : ch === 8
            ? {
                chapter: 8 as ChapterId,
                patrolCenterZ: -46,
                patrolCenterY: getChapterFloorHeight(8, 0, -46) + 2.2,
                zMin: -74,
                zMax: -20,
                detectionMultiplier: baseDetect * (this.ch8SporeFlareTimer > 0 ? 0.72 : 1.1),
              }
            : ch === 7
              ? {
                  chapter: 7 as ChapterId,
                  patrolCenterZ: -45,
                  patrolCenterY: getChapterFloorHeight(7, 0, -45) + 2.2,
                  zMin: -74,
                  zMax: -20,
                  detectionMultiplier: baseDetect * (this.ch7WhaleFreed ? 0.65 : 1.14),
                }
              : ch === 6
                ? {
                    chapter: 6 as ChapterId,
                    patrolCenterZ: -52,
                    patrolCenterY: getChapterFloorHeight(6, 0, -52) + 2.2,
                    zMin: -76,
                    zMax: -24,
                    detectionMultiplier: baseDetect * 1.16,
                  }
                : ch === 5
                  ? {
                      chapter: 5 as ChapterId,
                      patrolCenterZ: -45,
                      patrolCenterY: getChapterFloorHeight(5, 0, -45) + 2.2,
                      zMin: -72,
                      zMax: -20,
                      detectionMultiplier: baseDetect * (this.queenEscortReady ? 0.55 : 1.15),
                    }
                  : ch === 4
                    ? {
                        chapter: 4 as ChapterId,
                        patrolCenterZ: -44,
                        patrolCenterY: -1.4,
                        zMin: -72,
                        zMax: -20,
                        detectionMultiplier: baseDetect * 1.12,
                      }
                    : ch === 3
                      ? {
                          chapter: 3 as ChapterId,
                          patrolCenterZ: -45,
                          patrolCenterY: -0.2,
                          zMin: -72,
                          zMax: -22,
                          detectionMultiplier: baseDetect * 1.06,
                        }
                      : ch === 2
                        ? {
                            chapter: 2 as ChapterId,
                            patrolCenterZ: -46,
                            patrolCenterY: 0.4,
                            zMin: -72,
                            zMax: -22,
                            detectionMultiplier: baseDetect,
                          }
                        : {
                            chapter: 1 as ChapterId,
                            detectionMultiplier: baseDetect,
                          };
    const squidStep = stepSquidAI(
      this.squid,
      this.playerPos,
      isHidden,
      predatorSpeedMult,
      dt,
      this.simTimeSec,
      squidOpts,
    );
    this.squid = squidStep.squid;

    if (squidStep.telegraphStarted) {
      this.campaign = recordPredatorSpot(this.campaign);
      this.audio.playSquidTelegraph();
    }
    if (squidStep.dodgedDash) {
      const styleRes = registerStyleDodge(this.campaign);
      this.campaign = styleRes.state;
      if (styleRes.awardedPearl) {
        this.audio.playPearlPickup();
        this.persistCampaignSnapshot();
        this.showToast(t(this.gameSettings.language, 'toastStyleDodge'));
      }
    }
    if (squidStep.hitPlayer && this.hurtInvulnTimer <= 0) {
      this.handlePlayerHurt();
    }

    this.squidRig.group.position.set(
      this.squid.position.x,
      this.squid.position.y,
      this.squid.position.z,
    );
    this.squidRig.group.rotation.y = this.squid.headingYaw;
    const isTelegraph = this.squid.state === 'telegraph';
    const isDash = this.squid.state === 'dash';
    const isStun = this.squid.stunTimer > 0;
    this.squidRig.siphonMat.emissiveIntensity = isTelegraph ? 3.5 : isDash ? 2.6 : 0.9;
    this.squidRig.warnLight.intensity = isTelegraph ? 3.8 : isDash ? 2.8 : 1.0;
    this.squidRig.tentacles.rotation.z += dt * (isDash ? 8 : 2);
    for (const eyeMat of this.squidPredatorEyeMats) {
      eyeMat.emissiveIntensity = isTelegraph ? 3.4 : isDash ? 2.8 : isStun ? 0.5 : 1.25;
    }
    if (this.squidPredatorMixer) {
      const targetAnimState: 'patrol' | 'telegraph' | 'dash' | 'stun' = isStun
        ? 'stun'
        : isDash
          ? 'dash'
          : isTelegraph
            ? 'telegraph'
            : 'patrol';
      if (this.squidPredatorActiveState !== targetAnimState) {
        const prevAction = this.squidPredatorActiveState
          ? this.squidPredatorActions[this.squidPredatorActiveState]
          : null;
        const nextAction =
          this.squidPredatorActions[targetAnimState] ??
          this.squidPredatorActions.patrol;
        if (nextAction && nextAction !== prevAction) {
          nextAction.reset().play();
          if (prevAction) {
            prevAction.crossFadeTo(nextAction, 0.2, true);
          }
        }
        this.squidPredatorActiveState = targetAnimState;
      }
      this.squidPredatorMixer.update(
        dt * (isDash ? 1.4 : isTelegraph ? 1.15 : 1.0),
      );
    }

    const distToSquid = Math.sqrt(distanceSq3(this.playerPos, this.squid.position));
    const proximity01 = Math.max(0, Math.min(1, 1 - (distToSquid - 3) / 18));
    if (!isHidden && proximity01 > 0.15) {
      this.audio.maybePlayHeartbeat(proximity01);
    }

    // Update adaptive music biome & tension layer
    this.audio.setMusicContext(
      `ch${ch}` as MusicContext,
      isHidden ? 0 : Math.max(proximity01, isDash ? 1 : isTelegraph ? 0.7 : 0),
    );

    // Update audio depth hum across Descent & Ascent depth ranges
    const [startDepth, endDepth] = CHAPTERS[ch].depthRangeMeters;
    const zProgress = Math.max(0, Math.min(1, (4 - this.playerPos.z) / 90));
    const depth = Math.round(startDepth + (endDepth - startDepth) * zProgress);
    this.audio.updateDepthAmbience(depth);

    // 5. Check Chapter Transition Trigger (Ch. 6 requires Egg Reclaim first)
    const chTrigger = CHAPTER_TRANSITIONS[ch];
    if (chTrigger && isInsideTransitionTrigger(this.playerPos, chTrigger)) {
      if (ch === 6 && !this.ch6EggReclaimed) {
        this.playerPos.z = Math.max(this.playerPos.z, -82.5);
        stopSwimMotion(this.swimState);
        this.clearSwimTarget();
        this.showToast(t(this.gameSettings.language, 'toastCh6PortalLocked'));
        this.emitHUD(true);
      } else {
        this.completeCurrentChapter(chTrigger.completionLabel);
        return;
      }
    }

    this.updateCameraRig(dt);
  }

  private updateChapter1NPCs(dt: number, playerHidden: boolean): void {
    const t = this.simTimeSec;

    if (this.mildredRig && this.npcs[0]) {
      const m = this.npcs[0];
      m.position.x = m.anchorPosition.x + Math.sin(t * 0.45) * 1.8;
      m.position.y = m.anchorPosition.y + Math.sin(t * 0.9) * 0.55;
      this.mildredRig.group.position.set(m.position.x, m.position.y, m.position.z);
      if (!this.mildredUsingExternalModel) {
        this.mildredRig.bell.scale.set(
          1 + Math.sin(t * 2.1) * 0.08,
          1 - Math.sin(t * 2.1) * 0.08,
          1 + Math.sin(t * 2.1) * 0.08,
        );
        this.mildredRig.tentacles.forEach((ten, idx) => {
          ten.rotation.z = Math.sin(t * 2.0 + idx) * 0.14;
        });
      }

      if (
        this.mildredBumpCooldown <= 0 &&
        distanceSq3(this.playerPos, m.position) < 4.4
      ) {
        this.mildredBumpCooldown = 2.0;
        _vec3
          .set(
            this.playerPos.x - m.position.x,
            this.playerPos.y - m.position.y,
            this.playerPos.z - m.position.z,
          )
          .normalize();
        this.playerVel.addScaledVector(_vec3, 7.5);
        this.audio.playMildredBump();
      }
    }

    if (this.shrimpRig && this.npcs[1]) {
      const s = this.npcs[1];
      const hidden = t < s.hiddenUntilSec;
      this.shrimpRig.visible = !hidden;
      if (!hidden) {
        s.position.x = s.anchorPosition.x + Math.cos(t * 1.4) * 1.4;
        s.position.y = s.anchorPosition.y + Math.sin(t * 2.0) * 0.35;
        s.position.z = s.anchorPosition.z + Math.sin(t * 1.2) * 1.4;
        this.shrimpRig.position.set(s.position.x, s.position.y, s.position.z);
        this.shrimpRig.rotation.y = t * 1.3;

        const distSq = distanceSq3(this.playerPos, s.position);
        if (
          this.shrimpPanicCooldown <= 0 &&
          distSq < 28 &&
          !playerHidden &&
          this.playerVel.length() > 3.2
        ) {
          this.shrimpPanicCooldown = 4.5;
          const panicRes = triggerShrimpPanic(s, t);
          this.npcs[1] = panicRes.npc;
          if (panicRes.distractedPredator) {
            this.squid.distractedUntil = t + 4.5;
            this.squid.distractTarget = { ...CHAPTER_1_SHELTERS[0] };
          }
        }
      }
    }

    for (let i = 0; i < this.npcs.length; i++) {
      const res = updateNPCProximity(this.npcs[i], this.playerPos, dt, t);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter2Actors(
    dt: number,
    playerHidden: boolean,
    playerSpeed: number,
  ): void {
    const simT = this.simTimeSec;

    // 1. Octopus Boris subtle idle motion + mug turn-in proximity
    if (this.borisRig && this.npcs[0]) {
      const boris = this.npcs[0];
      boris.position.y = boris.anchorPosition.y + Math.sin(simT * 1.3) * 0.25;
      this.borisRig.group.position.set(
        boris.position.x,
        boris.position.y,
        boris.position.z,
      );
      if (!this.borisUsingExternalModel) {
        this.borisRig.tentacles.forEach((ten, idx) => {
          ten.rotation.y = Math.sin(simT * 1.8 + idx * 0.7) * 0.14;
        });
      }

      if (
        this.borisMugCarried &&
        distanceSq3(this.playerPos, boris.position) < 25
      ) {
        this.completeBorisQuestAndOpenGate();
      }
    }

    // 2. Boris's Glowing Mug pickup on proximity
    if (this.mugMesh && this.mugMesh.visible && !this.borisMugCarried) {
      this.mugMesh.rotation.y += dt * 1.1;
      this.mugMesh.position.y =
        CHAPTER_2_BORIS_MUG_POS.y + Math.sin(simT * 2.2) * 0.15;
      if (distanceSq3(this.playerPos, this.mugMesh.position) < 5.5) {
        this.borisMugCarried = true;
        this.mugMesh.visible = false;
        this.audio.playPearlPickup();
        this.showToast(t(this.gameSettings.language, 'toastMugFound'));
      }
    }

    // 3. Pelican Hatch Lever proximity fallback + sliding bulkhead door animation
    if (this.pelicanGateRig) {
      this.pelicanGateRig.leverGroup.getWorldPosition(_vec3);
      if (
        !this.pelicanGateOpen &&
        distanceSq3(this.playerPos, _vec3) < 6.5
      ) {
        this.pelicanGateOpen = true;
        this.audio.playGateOpen();
        const lang = this.gameSettings.language;
        if (this.borisMugCarried && !this.campaign.quests.borisMug) {
          this.campaign = completeBorisMugQuest(this.campaign);
          this.borisMugCarried = false;
          this.persistCampaignSnapshot();
          this.showToast(t(lang, 'toastGateOpenedWithDash'));
        } else {
          this.showToast(t(lang, 'toastGateOpening'));
        }
      }

      const targetGate = this.pelicanGateOpen ? 1 : 0;
      this.pelicanGateAnim01 = THREE.MathUtils.damp(
        this.pelicanGateAnim01,
        targetGate,
        4.5,
        dt,
      );
      const slideOffset = this.pelicanGateAnim01 * 4.4;
      this.pelicanGateRig.doorLeft.position.x = -2.55 - slideOffset;
      this.pelicanGateRig.doorRight.position.x = 2.55 + slideOffset;
      this.pelicanGateRig.leverMat.emissive.set(
        this.pelicanGateOpen ? '#5ef799' : '#26e8d4',
      );
      this.pelicanGateRig.leverLight.color.set(
        this.pelicanGateOpen ? '#5ef799' : '#26e8d4',
      );
    }

    // 4. Pufferfish Pafnutiy noise & inflation hazard
    if (this.pafnutiyRig && this.npcs[1]) {
      const paf = this.npcs[1];
      paf.position.y = paf.anchorPosition.y + Math.sin(simT * 1.6) * 0.22;
      this.pafnutiyRig.group.position.set(
        paf.position.x,
        paf.position.y,
        paf.position.z,
      );

      const hasSilentFins = this.campaign.upgrades.includes('silent_fins');
      const alreadyInflated = this.pafnutiySwellTimer > 0;
      const noiseCheck = stepPafnutiyNoiseCheck(
        this.playerPos,
        playerSpeed,
        paf.position,
        hasSilentFins,
        playerHidden,
        alreadyInflated,
      );
      if (noiseCheck.triggered) {
        this.pafnutiySwellTimer = 3.2;
        this.audio.playPafnutiySwell();
        this.playerVel.x += noiseCheck.knockbackDir.x * 11;
        this.playerVel.y += noiseCheck.knockbackDir.y * 5;
        this.playerVel.z += noiseCheck.knockbackDir.z * 11;
        this.trauma = Math.max(this.trauma, 0.5);
        this.npcs[1] = {
          ...paf,
          revealed: true,
          talkTimer: 4.5,
          activeText: paf.panicLines ?? paf.lines,
        };
        this.showToast(t(this.gameSettings.language, 'toastPafnutiySwell'));
      }

      const targetScale = this.pafnutiySwellTimer > 0 ? 2.45 : 1.0;
      this.pafnutiyScale = THREE.MathUtils.damp(
        this.pafnutiyScale,
        targetScale,
        8,
        dt,
      );
      this.pafnutiyRig.bodyGroup.scale.setScalar(this.pafnutiyScale);
      this.pafnutiyRig.warnLight.intensity =
        this.pafnutiySwellTimer > 0 ? 3.2 : 1.1;
      this.pafnutiyMixer?.update(
        dt * (this.pafnutiySwellTimer > 0 ? 1.85 : 0.72),
      );
    }

    // 5. Distant Singing Whale gentle glide & ambient bass vocalization
    if (this.whaleRig) {
      this.whaleRig.position.x = Math.sin(simT * 0.08) * 18;
      this.whaleRig.position.y = 14.5 + Math.cos(simT * 0.14) * 1.4;
      this.whaleRig.position.z = -52 + Math.sin(simT * 0.05) * 12;
      this.whaleRig.rotation.y =
        Math.cos(simT * 0.08) >= 0 ? -Math.PI * 0.42 : Math.PI * 0.42;

      this.whaleSongCooldown -= dt;
      if (this.whaleSongCooldown <= 0) {
        this.whaleSongCooldown = 14;
        this.audio.playWhaleSong();
      }
    }

    // 6. NPC Proximity Bubbles (do not overwrite active turn-in / panic quotes while still showing)
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'boris' && this.campaign.quests.borisMug && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      if (npc.id === 'pafnutiy' && this.pafnutiySwellTimer > 0 && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter3Actors(dt: number): void {
    const simT = this.simTimeSec;
    const sonarActive = this.callSonarTimer > 0;

    // 1. Hermit Crab Brotherhood idle claw sway + quest turn-in proximity
    if (this.hermitCrabRig && this.npcs[0]) {
      const crabs = this.npcs[0];
      this.hermitCrabRig.claws.forEach((claw, idx) => {
        claw.rotation.y = Math.sin(simT * 2.4 + idx * 0.9) * 0.18;
      });
      if (
        this.collectedScrapIds.length >= CHAPTER_3_SCRAPS.length &&
        !this.ch3DebrisOpen &&
        distanceSq3(this.playerPos, crabs.position) < 25
      ) {
        this.completeCrabQuestAndClearDebris(true);
      }
    }

    // 2. Glafira Loggerhead Turtle graceful patrol
    if (this.glafiraRig && this.npcs[1]) {
      const glaf = this.npcs[1];
      const ang = simT * 0.28;
      const nx = glaf.anchorPosition.x + Math.sin(ang) * glaf.patrolRadius;
      const nz = glaf.anchorPosition.z + Math.cos(ang * 0.7) * 2.6;
      const ny = glaf.anchorPosition.y + Math.sin(simT * 1.1) * 0.3;
      const vx = Math.cos(ang) * glaf.patrolRadius * 0.28;
      const vz = -Math.sin(ang * 0.7) * 2.6 * 0.7 * 0.28;
      glaf.position.x = nx;
      glaf.position.y = ny;
      glaf.position.z = nz;
      this.glafiraRig.group.position.set(nx, ny, nz);
      this.glafiraRig.group.rotation.y = Math.atan2(vx, vz);

      if (!this.glafiraUsingExternalModel) {
        this.glafiraRig.flippers.forEach((flip, idx) => {
          const sign = idx % 2 === 0 ? 1 : -1;
          flip.rotation.z = sign * Math.sin(simT * 2.8 + (idx > 1 ? 0.8 : 0)) * 0.22;
        });
      }
      this.glafiraMixer?.update(dt * 0.85);
    }

    // 3. Distant Manta Ray canopy glide
    if (this.mantaRig) {
      this.mantaRig.position.x = Math.sin(simT * 0.14) * 14;
      this.mantaRig.position.y = 9.2 + Math.sin(simT * 0.35) * 0.75;
      this.mantaRig.position.z = -46 + Math.cos(simT * 0.11) * 16;
      this.mantaRig.rotation.y = Math.atan2(
        Math.cos(simT * 0.14) * 14 * 0.14,
        -Math.sin(simT * 0.11) * 16 * 0.11,
      );
      this.mantaMixer?.update(dt);
    }

    // 4. Shiny Shipwreck Scrap Shards pickup on swim-by
    for (const s of CHAPTER_3_SCRAPS) {
      if (this.collectedScrapIds.includes(s.id) || this.ch3DebrisOpen) continue;
      const mesh = this.scrapMeshes.get(s.id);
      if (!mesh || !mesh.visible) continue;
      mesh.rotation.y += dt * (sonarActive ? 3.2 : 1.5);
      mesh.rotation.z = Math.sin(simT * 2.0) * 0.18;
      if (sonarActive && distanceSq3(this.playerPos, mesh.position) < 1300) {
        mesh.scale.setScalar(1 + Math.sin(simT * 9.0) * 0.24);
      } else {
        mesh.scale.setScalar(1);
      }
      if (distanceSq3(this.playerPos, mesh.position) < 5.0) {
        this.collectedScrapIds.push(s.id);
        mesh.visible = false;
        this.spawnBubbleBurst(mesh.position, 10, 1.15);
        this.audio.playPearlPickup();
        const lang = this.gameSettings.language;
        const count = this.collectedScrapIds.length;
        this.showToast(
          count >= CHAPTER_3_SCRAPS.length
            ? t(lang, 'toastScrapAllFound')
            : t(lang, 'toastScrapFound', { count, total: CHAPTER_3_SCRAPS.length }),
        );
      }
    }

    // 5. Crab Outpost Crane Winch proximity activation & animated debris parting
    if (this.ch3DebrisRig) {
      this.ch3DebrisRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch3DebrisOpen && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeCrabQuestAndClearDebris(false);
      }

      const targetOpen = this.ch3DebrisOpen ? 1 : 0;
      this.ch3DebrisAnim01 = THREE.MathUtils.damp(
        this.ch3DebrisAnim01,
        targetOpen,
        4.2,
        dt,
      );
      const slideOffset = this.ch3DebrisAnim01 * 4.5;
      this.ch3DebrisRig.doorLeft.position.x = -2.55 - slideOffset;
      this.ch3DebrisRig.doorRight.position.x = 2.55 + slideOffset;
      this.ch3DebrisRig.leverMat.emissive.set(
        this.ch3DebrisOpen ? '#5ef799' : '#28e8b6',
      );
      this.ch3DebrisRig.leverLight.color.set(
        this.ch3DebrisOpen ? '#5ef799' : '#28e8b6',
      );
    }

    // 6. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'hermit_crabs' && this.ch3DebrisOpen && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter4Actors(dt: number): void {
    const simT = this.simTimeSec;
    const sonarActive = this.callSonarTimer > 0;

    // 1. Critic Crabs claw sway & whale container turn-in proximity
    if (this.criticCrabsRig && this.npcs[0]) {
      const critics = this.npcs[0];
      this.criticCrabsRig.claws.forEach((claw, idx) => {
        claw.rotation.y = Math.sin(simT * 2.2 + idx * 0.85) * 0.18;
      });
      if (
        this.whaleContainerCarried &&
        !this.ch4GateOpen &&
        distanceSq3(this.playerPos, critics.position) < 25
      ) {
        this.completeWhaleQuestAndOpenGate(true);
      }
    }

    // 2. Glafira Loggerhead Turtle graceful patrol
    if (this.glafiraRig && this.npcs[1]) {
      const glaf = this.npcs[1];
      const ang = simT * 0.26;
      const nx = glaf.anchorPosition.x + Math.sin(ang) * glaf.patrolRadius;
      const nz = glaf.anchorPosition.z + Math.cos(ang * 0.7) * 2.6;
      const ny = glaf.anchorPosition.y + Math.sin(simT * 1.1) * 0.3;
      const vx = Math.cos(ang) * glaf.patrolRadius * 0.26;
      const vz = -Math.sin(ang * 0.7) * 2.6 * 0.7 * 0.26;
      glaf.position.x = nx;
      glaf.position.y = ny;
      glaf.position.z = nz;
      this.glafiraRig.group.position.set(nx, ny, nz);
      this.glafiraRig.group.rotation.y = Math.atan2(vx, vz);

      if (!this.glafiraUsingExternalModel) {
        this.glafiraRig.flippers.forEach((flip, idx) => {
          const sign = idx % 2 === 0 ? 1 : -1;
          flip.rotation.z = sign * Math.sin(simT * 2.8 + (idx > 1 ? 0.8 : 0)) * 0.22;
        });
      }
      this.glafiraMixer?.update(dt * 0.85);
    }

    // 3. Distant Manta Ray glide above the bone valley
    if (this.mantaRig) {
      this.mantaRig.position.x = Math.sin(simT * 0.13) * 14.5;
      this.mantaRig.position.y = 9.5 + Math.sin(simT * 0.32) * 0.75;
      this.mantaRig.position.z = -46 + Math.cos(simT * 0.1) * 16;
      this.mantaRig.rotation.y = Math.atan2(
        Math.cos(simT * 0.13) * 14.5 * 0.13,
        -Math.sin(simT * 0.1) * 16 * 0.1,
      );
      this.mantaMixer?.update(dt);
    }

    // 4. Whale Resonance Container pickup near Sperm Whale Skull
    if (
      this.whaleContainerMesh &&
      this.whaleContainerMesh.visible &&
      !this.whaleContainerCarried &&
      !this.ch4GateOpen
    ) {
      this.whaleContainerMesh.rotation.y += dt * (sonarActive ? 2.8 : 1.2);
      this.whaleContainerMesh.position.y =
        CHAPTER_4_WHALE_CONTAINER_POS.y + Math.sin(simT * 2.1) * 0.16;
      if (sonarActive && distanceSq3(this.playerPos, this.whaleContainerMesh.position) < 1300) {
        this.whaleContainerMesh.scale.setScalar(1 + Math.sin(simT * 8.5) * 0.2);
      } else {
        this.whaleContainerMesh.scale.setScalar(1);
      }
      if (distanceSq3(this.playerPos, this.whaleContainerMesh.position) < 5.5) {
        this.whaleContainerCarried = true;
        this.whaleContainerMesh.visible = false;
        this.spawnBubbleBurst(this.whaleContainerMesh.position, 12, 1.2);
        this.audio.playPearlPickup();
        this.showToast(t(this.gameSettings.language, 'toastWhaleContainerFound'));
      }
    }

    // 5. Charybdis Crane Lever proximity fallback + sliding bone-sluice gate animation
    if (this.ch4GateRig) {
      this.ch4GateRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch4GateOpen && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeWhaleQuestAndOpenGate(false);
      }

      const targetOpen = this.ch4GateOpen ? 1 : 0;
      this.ch4GateAnim01 = THREE.MathUtils.damp(
        this.ch4GateAnim01,
        targetOpen,
        4.2,
        dt,
      );
      const slideOffset = this.ch4GateAnim01 * 4.5;
      this.ch4GateRig.doorLeft.position.x = -2.55 - slideOffset;
      this.ch4GateRig.doorRight.position.x = 2.55 + slideOffset;
      this.ch4GateRig.leverMat.emissive.set(
        this.ch4GateOpen ? '#5ef799' : '#2ef0dc',
      );
      this.ch4GateRig.leverLight.color.set(
        this.ch4GateOpen ? '#5ef799' : '#2ef0dc',
      );
    }

    // 6. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'critic_crabs' && this.ch4GateOpen && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter5Actors(dt: number): void {
    const simT = this.simTimeSec;
    const sonarActive = this.callSonarTimer > 0;

    // 1. Black Smoker Hydrothermal Vents cycle visual warning/eruption
    const cycleSec = 6.5;
    for (let i = 0; i < this.ventRigs.length; i++) {
      const rig = this.ventRigs[i];
      const vent = CHAPTER_5_THERMAL_VENTS[i];
      if (!rig || !vent) continue;
      const phase = ((simT + vent.phaseOffset) % cycleSec + cycleSec) % cycleSec;
      const isWarning = phase >= 3.6 && phase < 4.9;
      const isErupting = phase >= 4.9;

      rig.rimMat.emissiveIntensity = isErupting
        ? 3.2
        : isWarning
          ? 1.6 + Math.sin(simT * 18) * 0.7
          : 0.75;
      rig.glowLight.intensity = isErupting ? 4.2 : isWarning ? 2.6 : 1.4;

      for (let r = 0; r < rig.plumeRings.length; r++) {
        const ring = rig.plumeRings[r];
        const riseSpeed = isErupting ? 5.2 : isWarning ? 1.8 : 0.75;
        const offset = ((simT * riseSpeed + r * 1.6) % 4.8);
        ring.position.y = 4.6 + offset;
        const s = (isErupting ? 1.35 : 0.9) + offset * 0.14;
        ring.scale.setScalar(s);
      }
    }

    // 2. Queen Anglerfish escort & lure turn-in
    if (this.queenAnglerRig && this.npcs[0]) {
      const queen = this.npcs[0];
      if (this.queenEscortReady) {
        const targetX = THREE.MathUtils.clamp(this.playerPos.x - 3.2, -11, 11);
        const targetZ = Math.max(-78, Math.min(queen.anchorPosition.z, this.playerPos.z - 5.5));
        const targetY =
          getChapterFloorHeight(5, targetX, targetZ) + 2.4 + Math.sin(simT * 1.8) * 0.3;
        queen.position.x = THREE.MathUtils.damp(queen.position.x, targetX, 2.2, dt);
        queen.position.y = THREE.MathUtils.damp(queen.position.y, targetY, 2.2, dt);
        queen.position.z = THREE.MathUtils.damp(queen.position.z, targetZ, 2.2, dt);
        this.queenAnglerRig.group.rotation.y = Math.PI;
      } else {
        queen.position.y = queen.anchorPosition.y + Math.sin(simT * 1.4) * 0.25;
      }
      this.queenAnglerRig.group.position.set(queen.position.x, queen.position.y, queen.position.z);
      this.queenAnglerRig.tailPivot.rotation.y = Math.sin(simT * 4.2) * 0.35;
      this.queenAnglerRig.escaMat.emissiveIntensity =
        (this.queenEscortReady ? 3.2 : 2.1) + Math.sin(simT * 3.5) * 0.35;

      if (
        this.ch5LureCarried &&
        !this.ch5GateOpen &&
        distanceSq3(this.playerPos, queen.position) < 25
      ) {
        this.completeQueenQuestAndOpenGate(true);
      }
    }

    // 3. Critic Crabs idle claw sway
    if (this.criticCrabsRig) {
      this.criticCrabsRig.claws.forEach((claw, idx) => {
        claw.rotation.y = Math.sin(simT * 2.2 + idx * 0.85) * 0.18;
      });
    }

    // 4. Deep Luminary Pearl pickup
    if (this.ch5LureMesh && this.ch5LureMesh.visible && !this.ch5LureCarried && !this.ch5GateOpen) {
      this.ch5LureMesh.rotation.y += dt * (sonarActive ? 3.0 : 1.4);
      const baseY = getChapterFloorHeight(5, CHAPTER_5_LURE_POS.x, CHAPTER_5_LURE_POS.z) + 0.55;
      this.ch5LureMesh.position.y = baseY + Math.sin(simT * 2.2) * 0.16;
      if (sonarActive && distanceSq3(this.playerPos, this.ch5LureMesh.position) < 1300) {
        this.ch5LureMesh.scale.setScalar(1 + Math.sin(simT * 8.5) * 0.2);
      } else {
        this.ch5LureMesh.scale.setScalar(1);
      }
      if (distanceSq3(this.playerPos, this.ch5LureMesh.position) < 5.5) {
        this.ch5LureCarried = true;
        this.ch5LureMesh.visible = false;
        this.spawnBubbleBurst(this.ch5LureMesh.position, 12, 1.2);
        this.audio.playPearlPickup();
        this.showToast(t(this.gameSettings.language, 'toastCh5LureFound'));
      }
    }

    // 5. Thermal Sluice Gate proximity lever + sliding doors
    if (this.ch5GateRig) {
      this.ch5GateRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch5GateOpen && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeQueenQuestAndOpenGate(false);
      }
      const targetOpen = this.ch5GateOpen ? 1 : 0;
      this.ch5GateAnim01 = THREE.MathUtils.damp(this.ch5GateAnim01, targetOpen, 4.2, dt);
      const slideOffset = this.ch5GateAnim01 * 4.5;
      this.ch5GateRig.doorLeft.position.x = -2.65 - slideOffset;
      this.ch5GateRig.doorRight.position.x = 2.65 + slideOffset;
      this.ch5GateRig.leverMat.emissive.set(this.ch5GateOpen ? '#5ef799' : '#ff8e52');
      this.ch5GateRig.leverLight.color.set(this.ch5GateOpen ? '#5ef799' : '#ff8e52');
    }

    // 6. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'queen_angler' && this.ch5GateOpen && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter6Actors(dt: number): void {
    const simT = this.simTimeSec;

    // 1. Abyssal Heart Egg Altar pulse & reclaim proximity
    if (this.ch6AltarRig) {
      this.ch6AltarRig.ringMesh.rotation.y += dt * 0.9;
      this.ch6AltarRig.ringMesh.rotation.x = Math.sin(simT * 0.7) * 0.35;
      this.ch6AltarRig.beaconLight.intensity = this.ch6EggReclaimed
        ? 1.8
        : 3.2 + Math.sin(simT * 2.5) * 0.7;
    }

    if (!this.ch6EggReclaimed && distanceSq3(this.playerPos, CHAPTER_6_EGG_ALTAR_POS) < 8.5) {
      this.reclaimEggAtAltar();
    }

    // 2. Queen Anglerfish gentle guard hover
    if (this.queenAnglerRig && this.npcs[0]) {
      const queen = this.npcs[0];
      queen.position.y = queen.anchorPosition.y + Math.sin(simT * 1.4) * 0.28;
      this.queenAnglerRig.group.position.set(queen.position.x, queen.position.y, queen.position.z);
      this.queenAnglerRig.tailPivot.rotation.y = Math.sin(simT * 4.0) * 0.32;
    }

    // 3. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'queen_angler' && this.ch6EggReclaimed && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter7Actors(dt: number): void {
    const simT = this.simTimeSec;

    // 1. Rising Thermal Updraft Current vortex rings
    for (const upd of this.updraftRigs) {
      for (const ring of upd.rings) {
        ring.position.y = (ring.position.y + dt * 3.0) % 9.5;
        const scale = 0.88 + Math.sin(simT * 3.5 + ring.position.y) * 0.12;
        ring.scale.setScalar(scale);
      }
    }

    // 2. Turtle Glafira patrol
    if (this.glafiraRig && this.npcs[0]) {
      const glaf = this.npcs[0];
      const ang = simT * 0.28;
      const nx = glaf.anchorPosition.x + Math.sin(ang) * glaf.patrolRadius;
      const nz = glaf.anchorPosition.z + Math.cos(ang * 0.7) * 2.4;
      const ny = glaf.anchorPosition.y + Math.sin(simT * 1.1) * 0.3;
      const vx = Math.cos(ang) * glaf.patrolRadius * 0.28;
      const vz = -Math.sin(ang * 0.7) * 2.4 * 0.7 * 0.28;
      glaf.position.x = nx;
      glaf.position.y = ny;
      glaf.position.z = nz;
      this.glafiraRig.group.position.set(nx, ny, nz);
      this.glafiraRig.group.rotation.y = Math.atan2(vx, vz);
      if (!this.glafiraUsingExternalModel) {
        this.glafiraRig.flippers.forEach((flip, idx) => {
          const sign = idx % 2 === 0 ? 1 : -1;
          flip.rotation.z = sign * Math.sin(simT * 2.8 + (idx > 1 ? 0.8 : 0)) * 0.22;
        });
      }
      this.glafiraMixer?.update(dt * 0.85);
    }

    // 3. Young Whale rescue & valve proximity
    if (this.youngWhaleRig && this.npcs[1]) {
      this.youngWhaleRig.whaleGroup.position.y = Math.sin(simT * 1.4) * 0.28;
      this.youngWhaleRig.whaleGroup.rotation.z = Math.sin(simT * 0.9) * 0.06;

      this.youngWhaleRig.valveGroup.getWorldPosition(_vec3);
      if (!this.ch7WhaleFreed && distanceSq3(this.playerPos, _vec3) < 7.5) {
        this.completeWhaleRescueAndOpenGate();
      }
      this.youngWhaleRig.valveMat.emissive.set(this.ch7WhaleFreed ? '#5ef799' : '#26e8d4');

      if (this.ch7WhaleFreed) {
        this.whaleSongCooldown -= dt;
        if (this.whaleSongCooldown <= 0) {
          this.whaleSongCooldown = 11;
          this.audio.playWhaleSong();
        }
      }
    }

    // 4. Ascent Sluice Gate lever proximity & sliding doors
    if (this.ch7GateRig) {
      this.ch7GateRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch7WhaleFreed && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeWhaleRescueAndOpenGate();
      }
      const targetOpen = this.ch7WhaleFreed ? 1 : 0;
      this.ch7GateAnim01 = THREE.MathUtils.damp(this.ch7GateAnim01, targetOpen, 4.2, dt);
      const slideOffset = this.ch7GateAnim01 * 4.5;
      this.ch7GateRig.doorLeft.position.x = -2.65 - slideOffset;
      this.ch7GateRig.doorRight.position.x = 2.65 + slideOffset;
      this.ch7GateRig.leverMat.emissive.set(this.ch7WhaleFreed ? '#5ef799' : '#5ee8ff');
      this.ch7GateRig.leverLight.color.set(this.ch7WhaleFreed ? '#5ef799' : '#5ee8ff');
    }

    // 5. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'young_whale' && this.ch7WhaleFreed && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter8Actors(dt: number): void {
    const simT = this.simTimeSec;

    // 1. Kelp Spore Lanterns flare up brightly after Call [E]
    const flare01 = Math.min(1, this.ch8SporeFlareTimer / 6.5);
    for (let i = 0; i < this.ch8SporeLanterns.length; i++) {
      const l = this.ch8SporeLanterns[i];
      const pulse = 0.9 + Math.sin(simT * 2.2 + i * 0.9) * 0.25;
      l.bulbMat.emissiveIntensity = pulse + flare01 * 2.4;
      l.light.intensity = 1.4 + flare01 * 2.6;
    }

    // 2. Turtle Glafira patrol
    if (this.glafiraRig && this.npcs[0]) {
      const glaf = this.npcs[0];
      const ang = simT * 0.28;
      const nx = glaf.anchorPosition.x + Math.sin(ang) * glaf.patrolRadius;
      const nz = glaf.anchorPosition.z + Math.cos(ang * 0.7) * 2.4;
      const ny = glaf.anchorPosition.y + Math.sin(simT * 1.1) * 0.3;
      const vx = Math.cos(ang) * glaf.patrolRadius * 0.28;
      const vz = -Math.sin(ang * 0.7) * 2.4 * 0.7 * 0.28;
      glaf.position.x = nx;
      glaf.position.y = ny;
      glaf.position.z = nz;
      this.glafiraRig.group.position.set(nx, ny, nz);
      this.glafiraRig.group.rotation.y = Math.atan2(vx, vz);
      if (!this.glafiraUsingExternalModel) {
        this.glafiraRig.flippers.forEach((flip, idx) => {
          const sign = idx % 2 === 0 ? 1 : -1;
          flip.rotation.z = sign * Math.sin(simT * 2.8 + (idx > 1 ? 0.8 : 0)) * 0.22;
        });
      }
      this.glafiraMixer?.update(dt * 0.85);
    }

    // 3. Octopus Boris secret shortcut turn-in proximity
    if (this.borisRig && this.npcs[1]) {
      const boris = this.npcs[1];
      boris.position.y = boris.anchorPosition.y + Math.sin(simT * 1.3) * 0.24;
      this.borisRig.group.position.set(boris.position.x, boris.position.y, boris.position.z);
      if (!this.borisUsingExternalModel) {
        this.borisRig.tentacles.forEach((ten, idx) => {
          ten.rotation.y = Math.sin(simT * 1.8 + idx * 0.7) * 0.14;
        });
      }
      if (!this.ch8ShortcutOpen && distanceSq3(this.playerPos, boris.position) < 16) {
        this.completeBorisShortcutAndOpenGate();
      }
    }

    // 4. Distant Manta Ray glide
    if (this.mantaRig) {
      this.mantaRig.position.x = Math.sin(simT * 0.14) * 14;
      this.mantaRig.position.y = 9.4 + Math.sin(simT * 0.34) * 0.75;
      this.mantaRig.position.z = -48 + Math.cos(simT * 0.11) * 16;
      this.mantaRig.rotation.y = Math.atan2(
        Math.cos(simT * 0.14) * 14 * 0.14,
        -Math.sin(simT * 0.11) * 16 * 0.11,
      );
      this.mantaMixer?.update(dt);
    }

    // 5. Boris's Secret Liner Hatch proximity lever & sliding doors
    if (this.ch8GateRig) {
      this.ch8GateRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch8ShortcutOpen && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeBorisShortcutAndOpenGate();
      }
      const targetOpen = this.ch8ShortcutOpen ? 1 : 0;
      this.ch8GateAnim01 = THREE.MathUtils.damp(this.ch8GateAnim01, targetOpen, 4.2, dt);
      const slideOffset = this.ch8GateAnim01 * 4.5;
      this.ch8GateRig.doorLeft.position.x = -2.65 - slideOffset;
      this.ch8GateRig.doorRight.position.x = 2.65 + slideOffset;
      this.ch8GateRig.leverMat.emissive.set(this.ch8ShortcutOpen ? '#5ef799' : '#48f2b8');
      this.ch8GateRig.leverLight.color.set(this.ch8ShortcutOpen ? '#5ef799' : '#48f2b8');
    }

    // 6. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'boris' && this.ch8ShortcutOpen && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter9Actors(
    dt: number,
    playerHidden: boolean,
    playerSpeed: number,
  ): void {
    const simT = this.simTimeSec;

    // 1. Sweeping Emergency Searchlights
    for (let i = 0; i < this.ch9Searchlights.length; i++) {
      const sl = this.ch9Searchlights[i];
      sl.group.rotation.y = Math.sin(simT * 0.9 + i * 1.7) * 0.72;
      sl.beamMat.opacity = this.ch9BulkheadOpen
        ? 0.06 + Math.abs(Math.sin(simT * 6)) * 0.05
        : 0.14;
    }

    // 2. Parrotfish Kesha patrol
    if (this.keshaRig && this.npcs[0]) {
      const kesha = this.npcs[0];
      const ang = simT * 0.85;
      const nx = kesha.anchorPosition.x + Math.sin(ang) * kesha.patrolRadius;
      const nz = kesha.anchorPosition.z + Math.sin(ang * 2) * 1.2;
      const ny = kesha.anchorPosition.y + Math.cos(simT * 2.2) * 0.25;
      const vx = Math.cos(ang) * kesha.patrolRadius * 0.85;
      const vz = Math.cos(ang * 2) * 1.2 * 2 * 0.85;
      kesha.position.x = nx;
      kesha.position.y = ny;
      kesha.position.z = nz;
      this.keshaRig.group.position.set(nx, ny, nz);
      this.keshaRig.group.rotation.y = Math.atan2(vx, vz);
      this.keshaRig.tailPivot.rotation.y = Math.sin(simT * 8.0) * 0.35;
      this.keshaRig.leftWing.rotation.z = 1.25 + Math.sin(simT * 6.5) * 0.28;
      this.keshaRig.rightWing.rotation.z = -1.25 - Math.sin(simT * 6.5) * 0.28;
    }

    // 3. Pufferfish Pafnutiy noise check & swell
    if (this.pafnutiyRig && this.npcs[1]) {
      const paf = this.npcs[1];
      paf.position.y = paf.anchorPosition.y + Math.sin(simT * 1.6) * 0.22;
      this.pafnutiyRig.group.position.set(paf.position.x, paf.position.y, paf.position.z);

      const hasSilentFins = this.campaign.upgrades.includes('silent_fins');
      const alreadyInflated = this.pafnutiySwellTimer > 0;
      const noiseCheck = stepPafnutiyNoiseCheck(
        this.playerPos,
        playerSpeed,
        paf.position,
        hasSilentFins,
        playerHidden,
        alreadyInflated,
      );
      if (noiseCheck.triggered) {
        this.pafnutiySwellTimer = 3.2;
        this.audio.playPafnutiySwell();
        this.playerVel.x += noiseCheck.knockbackDir.x * 11;
        this.playerVel.y += noiseCheck.knockbackDir.y * 5;
        this.playerVel.z += noiseCheck.knockbackDir.z * 11;
        this.trauma = Math.max(this.trauma, 0.5);
        this.npcs[1] = {
          ...paf,
          revealed: true,
          talkTimer: 4.5,
          activeText: paf.panicLines ?? paf.lines,
        };
        this.showToast(t(this.gameSettings.language, 'toastPafnutiySwell'));
      }

      const targetScale = this.pafnutiySwellTimer > 0 ? 2.45 : 1.0;
      this.pafnutiyScale = THREE.MathUtils.damp(this.pafnutiyScale, targetScale, 8, dt);
      this.pafnutiyRig.bodyGroup.scale.setScalar(this.pafnutiyScale);
      this.pafnutiyRig.warnLight.intensity = this.pafnutiySwellTimer > 0 ? 3.2 : 1.1;
      this.pafnutiyMixer?.update(dt * (this.pafnutiySwellTimer > 0 ? 1.85 : 0.72));
    }

    // 4. Distant Singing Whale silhouette above
    if (this.whaleRig) {
      this.whaleRig.position.x = Math.sin(simT * 0.08) * 18;
      this.whaleRig.position.y = 14.5 + Math.cos(simT * 0.14) * 1.4;
      this.whaleRig.position.z = -52 + Math.sin(simT * 0.05) * 12;
      this.whaleRig.rotation.y =
        Math.cos(simT * 0.08) >= 0 ? -Math.PI * 0.42 : Math.PI * 0.42;
      this.whaleSongCooldown -= dt;
      if (this.whaleSongCooldown <= 0) {
        this.whaleSongCooldown = 14;
        this.audio.playWhaleSong();
      }
    }

    // 5. Alarm Bulkhead lever proximity & sliding doors
    if (this.ch9GateRig) {
      this.ch9GateRig.leverGroup.getWorldPosition(_vec3);
      if (!this.ch9BulkheadOpen && distanceSq3(this.playerPos, _vec3) < 6.8) {
        this.completeKeshaAlertAndOpenGate(false);
      }
      const targetOpen = this.ch9BulkheadOpen ? 1 : 0;
      this.ch9GateAnim01 = THREE.MathUtils.damp(this.ch9GateAnim01, targetOpen, 4.2, dt);
      const slideOffset = this.ch9GateAnim01 * 4.5;
      this.ch9GateRig.doorLeft.position.x = -2.65 - slideOffset;
      this.ch9GateRig.doorRight.position.x = 2.65 + slideOffset;
      this.ch9GateRig.leverMat.emissive.set(this.ch9BulkheadOpen ? '#5ef799' : '#ffb347');
      this.ch9GateRig.leverLight.color.set(this.ch9BulkheadOpen ? '#5ef799' : '#ffb347');
    }

    // 6. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.id === 'kesha' && this.ch9BulkheadOpen && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      if (npc.id === 'pafnutiy' && this.pafnutiySwellTimer > 0 && npc.talkTimer > 0) {
        this.npcs[i] = { ...npc, talkTimer: Math.max(0, npc.talkTimer - dt) };
        continue;
      }
      const res = updateNPCProximity(npc, this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private updateChapter10Actors(dt: number): void {
    const simT = this.simTimeSec;

    // 1. Sunlit Updraft Vortex Rings
    for (const upd of this.updraftRigs) {
      for (const ring of upd.rings) {
        ring.position.y = (ring.position.y + dt * 3.4) % 10.5;
        const scale = 0.88 + Math.sin(simT * 3.8 + ring.position.y) * 0.12;
        ring.scale.setScalar(scale);
      }
    }

    // 2. Grandma Mildred joyful greeting
    if (this.mildredRig && this.npcs[0]) {
      const m = this.npcs[0];
      m.position.x = m.anchorPosition.x + Math.sin(simT * 0.5) * 1.6;
      m.position.y = m.anchorPosition.y + Math.sin(simT * 1.0) * 0.5;
      this.mildredRig.group.position.set(m.position.x, m.position.y, m.position.z);
      if (!this.mildredUsingExternalModel) {
        this.mildredRig.bell.scale.set(
          1 + Math.sin(simT * 2.2) * 0.08,
          1 - Math.sin(simT * 2.2) * 0.08,
          1 + Math.sin(simT * 2.2) * 0.08,
        );
        this.mildredRig.tentacles.forEach((ten, idx) => {
          ten.rotation.z = Math.sin(simT * 2.2 + idx) * 0.14;
        });
      }
    }

    // 3. Celebration Shrimps circling above the Coral Nursery
    if (this.shrimpRig && this.npcs[1]) {
      const s = this.npcs[1];
      s.position.x = s.anchorPosition.x + Math.cos(simT * 1.5) * 1.5;
      s.position.y = s.anchorPosition.y + Math.sin(simT * 2.2) * 0.35;
      s.position.z = s.anchorPosition.z + Math.sin(simT * 1.3) * 1.5;
      this.shrimpRig.position.set(s.position.x, s.position.y, s.position.z);
      this.shrimpRig.rotation.y = simT * 1.6;
    }

    // 4. Baby Hatchling celebratory swim once hatched
    if (this.babyHatchlingRig && this.hatchlingBorn) {
      this.babyHatchlingRig.group.visible = true;
      this.babyHatchlingRig.group.position.set(
        this.playerPos.x + Math.cos(simT * 2.2) * 1.15,
        this.playerPos.y + 0.38 + Math.sin(simT * 3.1) * 0.22,
        this.playerPos.z + Math.sin(simT * 2.2) * 1.15,
      );
      this.babyHatchlingRig.group.rotation.y = Math.atan2(
        -Math.sin(simT * 2.2),
        Math.cos(simT * 2.2),
      );
      this.babyHatchlingRig.tailPivot.rotation.y = Math.sin(simT * 10) * 0.48;
    }

    // 5. NPC Proximity Bubbles
    for (let i = 0; i < this.npcs.length; i++) {
      const res = updateNPCProximity(this.npcs[i], this.playerPos, dt, simT);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private handlePlayerHurt(overrideToastKey?: 'toastVentHit'): void {
    const damage = DIFFICULTY_PRESETS[this.gameSettings.difficulty].damagePerHit;
    this.campaign = recordChapterHit(this.campaign);
    this.health = Math.max(0, this.health - damage);
    this.hurtInvulnTimer = 1.6;
    this.hitstopTimer = 0.055;
    this.trauma = 0.85;
    this.audio.playHurt();

    const lang = this.gameSettings.language;
    if (this.health <= 0) {
      this.campaign = recordRoomDeath(this.campaign);
      this.outcome = 'defeat';
      this.clearTransientInputs();
      this.clearSwimTarget();
      stopSwimMotion(this.swimState);
      if (document.pointerLockElement === this.renderer.domElement) {
        document.exitPointerLock?.();
      }
      this.syncBodyState('gameover');
      this.audio.setPaused(true);
      this.emitHUD(true);
    } else {
      const ch = this.activeSceneChapter;
      const hurtToastKey =
        overrideToastKey ??
        (ch === 4 || ch === 5 || ch === 7
          ? 'toastHurtVertebra'
          : ch === 3 || ch === 8
            ? 'toastHurtKelp'
            : ch === 2 || ch === 9
              ? 'toastHurtCrate'
              : 'toastHurtCoral');
      this.showToast(t(lang, hurtToastKey));
    }
  }

  private completeCurrentChapter(_completionLabel: string): void {
    const lang = this.gameSettings.language;
    const ch = this.activeSceneChapter;
    this.outcome = 'victory';
    this.completionLabel = t(lang, `ch${ch}CompleteLabel` as 'ch1CompleteLabel');
    this.eggEchoText = t(lang, `echoCh${ch}End` as 'echoCh1End');

    if (ch === 10) {
      this.hatchlingBorn = true;
      this.campaign = completeHatchlingQuest(this.campaign);
      this.carriedEggRig.visible = false;
      if (this.babyHatchlingRig) {
        this.babyHatchlingRig.group.visible = true;
        this.babyHatchlingRig.group.position.set(
          this.playerPos.x + 1.0,
          this.playerPos.y + 0.35,
          this.playerPos.z - 0.6,
        );
      }
      this.callWaveActive = 1.0;
      this.callWaveMat.color.set('#ffe594');
      this.callWaveRing.position.copy(this.playerPos);
      this.callWaveRing.scale.setScalar(0.8);
      this.spawnBubbleBurst(this.playerPos, 24, 1.4);
      this.audio.playHatchlingCelebration();
      this.showToast(t(lang, 'toastHatchlingBorn'));
    } else {
      this.audio.playLullabyMotif();
    }

    const mastery = completeChapterMastery(this.campaign, ch);
    this.campaign = mastery.state;
    this.lastChapterRank = mastery.rank;
    this.lastAwardedSRankBonus = mastery.awardedSRankBonus;

    const highestNext = Math.min(10, ch + 1) as ChapterId;
    const saved = saveCampaignProgress(this.campaign, highestNext);
    this.savedHighestChapter = saved.highestChapter;
    this.savedPearls = saved.pearls;

    const telemetry = buildBalanceTelemetry(this.campaign, this.playElapsedSec);
    console.log(
      `[Abyssal Lullaby] Telemetry (Ch.${ch}, Rank ${mastery.rank}):`,
      telemetry,
    );

    this.clearTransientInputs();
    this.clearSwimTarget();
    stopSwimMotion(this.swimState);
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.syncBodyState('gameover');
    this.audio.setPaused(true);
    this.emitHUD(true);
  }

  private updateCameraRig(dt: number): void {
    const lookDir = computeSwimForward(
      this.swimState.camYaw,
      this.swimState.camPitch,
      _lookFwd,
    );

    computeOrbitCameraVectors(
      this.playerPos,
      lookDir,
      this.cameraOffset,
      _camDesired,
      _camTarget,
    );
    const floorAtCam = getChapterFloorHeight(
      this.activeSceneChapter,
      _camDesired.x,
      _camDesired.z,
    );
    _camDesired.y = Math.max(floorAtCam + 1.0, _camDesired.y);

    // Smooth cinematic fly-through swoop on transitioning from Main Menu into Play
    if (this.startFlythroughTimer > 0) {
      this.startFlythroughTimer = Math.max(0, this.startFlythroughTimer - dt);
      const p = 1 - this.startFlythroughTimer / 0.85;
      const ease = 1 - Math.pow(1 - p, 3);
      this.camera.position.lerpVectors(this.flythroughStartPos, _camDesired, ease);
      _vec3.lerpVectors(this.flythroughStartLook, _camTarget, ease);
      this.camera.lookAt(_vec3);
      return;
    }

    const dampFactor = 1 - Math.exp(-9.5 * dt);
    this.camera.position.lerp(_camDesired, dampFactor);

    const reducedFx = this.gameSettings.reducedEffects || this.externalReducedEffects;
    if (this.trauma > 0.01 && !reducedFx) {
      const shake = this.trauma * this.trauma * 0.45;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
    }

    const targetFov =
      this.dashBoostTimer > 0 ? 64 : this.inUpdraftCurrent ? 61.5 : 58;
    this.fovCurrent = THREE.MathUtils.damp(this.fovCurrent, targetFov, 7.5, dt);
    if (Math.abs(this.fovCurrent - this.camera.fov) > 0.02) {
      this.camera.fov = this.fovCurrent;
      this.camera.updateProjectionMatrix();
    }

    this.camera.lookAt(_camTarget);
  }

  private updateAmbientVisuals(dt: number): void {
    const t = this.simTimeSec;
    const qual = GRAPHICS_PRESETS[this.gameSettings.graphicsQuality];
    const reducedFx = this.gameSettings.reducedEffects || this.externalReducedEffects;

    if (this.activePortalRig) {
      this.activePortalRig.update(t, dt, this.isPortalHovered);
    }

    const npcAnimCullSq = (qual.cameraFar * 0.72) * (qual.cameraFar * 0.72);
    if (
      this.mildredMixer &&
      this.mildredRig &&
      (this.activeSceneChapter === 1 || this.activeSceneChapter === 10) &&
      distanceSq3(this.camera.position, this.mildredRig.group.position) < npcAnimCullSq
    ) {
      this.mildredMixer.update(dt);
    }

    if (
      this.borisMixer &&
      this.borisRig &&
      (this.activeSceneChapter === 2 || this.activeSceneChapter === 8) &&
      distanceSq3(this.camera.position, this.borisRig.group.position) < npcAnimCullSq
    ) {
      this.borisMixer.update(dt);
    }

    this.ambientAnimFrameCounter++;
    this.ambientAnimAccumDt += dt;
    const shouldStepAmbientSchools =
      qual.animThrottleStride <= 1 || this.ambientAnimFrameCounter % qual.animThrottleStride === 0;

    if (shouldStepAmbientSchools) {
      const stepDt = this.ambientAnimAccumDt;
      this.ambientAnimAccumDt = 0;
      const cullDist = qual.cameraFar * 0.85;
      const cullDistSq = cullDist * cullDist;
      const camX = this.camera.position.x;
      const camY = this.camera.position.y;
      const camZ = this.camera.position.z;

      for (const sq of this.fireflySquidSchool) {
        if (!sq.group.visible) continue;
        const ang = t * sq.speed + sq.phase;
        const x = sq.anchorX + Math.cos(ang) * sq.radiusX;
        const z = sq.anchorZ + Math.sin(ang) * sq.radiusZ;
        const y = sq.anchorY + Math.sin(t * 1.5 + sq.phase) * 0.4;
        const dx = x - camX;
        const dy = y - camY;
        const dz = z - camZ;
        if (dx * dx + dy * dy + dz * dz > cullDistSq) continue;
        const vx = -Math.sin(ang) * sq.radiusX * sq.speed;
        const vz = Math.cos(ang) * sq.radiusZ * sq.speed;
        sq.group.position.set(x, y, z);
        sq.group.rotation.y = Math.atan2(vx, vz);
        sq.mixer?.update(stepDt);
      }

      if (this.ambientFishGroup.visible) {
        for (const f of this.ambientFishSchool) {
          if (!f.group.visible) continue;
          const ang = t * f.speed + f.phase;
          const x = f.anchorX + Math.cos(ang) * f.radiusX;
          const z = f.anchorZ + Math.sin(ang) * f.radiusZ;
          const y = f.anchorY + Math.sin(t * 1.7 + f.phase) * 0.28;
          const dx = x - camX;
          const dy = y - camY;
          const dz = z - camZ;
          if (dx * dx + dy * dy + dz * dz > cullDistSq) continue;
          const vx = -Math.sin(ang) * f.radiusX * f.speed;
          const vz = Math.cos(ang) * f.radiusZ * f.speed;
          f.group.position.set(x, y, z);
          f.group.rotation.y = Math.atan2(vx, vz);
          f.group.rotation.z = Math.sin(t * 4.5 + f.phase) * 0.07;
          f.swimHandle.updateSwim(t * 5.2 + f.phase, 0.75);
        }
      }
    }

    this.seagrassTimeUniform.value = t;
    this.causticTimeUniform.value = t;

    if (this.targetBeaconGroup && this.targetBeaconGroup.visible) {
      const pulse = 1 + Math.sin(t * 5.0) * 0.14;
      this.targetBeaconRing.scale.setScalar(pulse);
      this.targetBeaconCore.rotation.y = t * 2.2;
      this.targetBeaconCore.position.y = 0.28 + Math.sin(t * 4.0) * 0.08;
      this.targetBeaconBeam.scale.set(1, 0.9 + Math.sin(t * 3.5) * 0.12, 1);
    }

    if (this.godRays.visible && this.godRayMat?.uniforms.uTime) {
      this.godRayMat.uniforms.uTime.value = t;
    }

    if (this.callWaveActive > 0) {
      this.callWaveActive = Math.max(0, this.callWaveActive - dt * 0.85);
      const scale = 1.1 + (1 - this.callWaveActive) * 14;
      this.callWaveRing.scale.setScalar(scale);
      this.callWaveMat.opacity = this.callWaveActive * 0.32;
      this.callWaveRing.lookAt(this.camera.position);

      if (this.bloomPass) {
        if (reducedFx) {
          this.bloomPass.strength = 0.42;
          this.bloomPass.threshold = 0.83;
          this.bloomPass.radius = 0.48;
        } else {
          const bloomSurge = Math.pow(this.callWaveActive, 0.72);
          this.bloomPass.strength = 0.42 + bloomSurge * 1.35;
          this.bloomPass.threshold = 0.83 - bloomSurge * 0.38;
          this.bloomPass.radius = 0.48 + bloomSurge * 0.32;
        }
      }
    } else {
      this.callWaveMat.opacity = 0;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.42;
        this.bloomPass.threshold = 0.83;
        this.bloomPass.radius = 0.48;
      }
    }

    if (this.planktonMat?.uniforms.uTime) {
      this.planktonMat.uniforms.uTime.value = t;
    }

    this.updateBubbles(dt, t);
  }

  private spawnBubble(x: number, y: number, z: number, sizeScale = 1): void {
    const idx = this.bubbleCursor;
    this.bubbleCursor = (this.bubbleCursor + 1) % this.maxBubbles;
    const i3 = idx * 3;
    this.bubblePos[i3] = x;
    this.bubblePos[i3 + 1] = y;
    this.bubblePos[i3 + 2] = z;
    this.bubbleVel[i3] = (Math.random() - 0.5) * 0.55;
    this.bubbleVel[i3 + 1] = 0.95 + Math.random() * 1.15;
    this.bubbleVel[i3 + 2] = (Math.random() - 0.5) * 0.55;
    const maxL = 0.85 + Math.random() * 0.85;
    this.bubbleLife[idx] = maxL;
    this.bubbleMaxLife[idx] = maxL;
    this.bubbleScale[idx] = sizeScale;
    this.bubbleZeroed[idx] = 0;
  }

  private spawnBubbleBurst(center: THREE.Vector3, count: number, sizeScale = 1.1): void {
    for (let i = 0; i < count; i++) {
      this.spawnBubble(
        center.x + (Math.random() - 0.5) * 0.9,
        center.y + (Math.random() - 0.5) * 0.7,
        center.z + (Math.random() - 0.5) * 0.9,
        sizeScale * (0.7 + Math.random() * 0.65),
      );
    }
  }

  private updateBubbles(dt: number, t: number): void {
    if (!this.bubbleInstMesh) return;
    let anyActive = false;
    for (let i = 0; i < this.maxBubbles; i++) {
      if (this.bubbleLife[i] > 0) {
        anyActive = true;
        break;
      }
    }
    if (!anyActive && !this.bubbleHadActive) {
      return;
    }

    let dirty = false;
    for (let i = 0; i < this.maxBubbles; i++) {
      const life = this.bubbleLife[i];
      if (life <= 0) {
        if (this.bubbleZeroed[i] === 0) {
          _dummy.scale.setScalar(0);
          _dummy.updateMatrix();
          this.bubbleInstMesh.setMatrixAt(i, _dummy.matrix);
          this.bubbleZeroed[i] = 1;
          dirty = true;
        }
        continue;
      }
      const nextLife = Math.max(0, life - dt);
      this.bubbleLife[i] = nextLife;
      const i3 = i * 3;
      this.bubblePos[i3] += (this.bubbleVel[i3] + Math.sin(t * 4.5 + i) * 0.22) * dt;
      this.bubblePos[i3 + 1] += this.bubbleVel[i3 + 1] * dt;
      this.bubblePos[i3 + 2] += (this.bubbleVel[i3 + 2] + Math.cos(t * 3.8 + i) * 0.22) * dt;
      this.bubbleVel[i3] *= Math.exp(-2.5 * dt);
      this.bubbleVel[i3 + 2] *= Math.exp(-2.5 * dt);

      const age01 = 1 - nextLife / Math.max(0.01, this.bubbleMaxLife[i]);
      const env = age01 < 0.15 ? age01 / 0.15 : 1 - (age01 - 0.15) / 0.85;
      _dummy.position.set(this.bubblePos[i3], this.bubblePos[i3 + 1], this.bubblePos[i3 + 2]);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(Math.max(0, env) * this.bubbleScale[i]);
      _dummy.updateMatrix();
      this.bubbleInstMesh.setMatrixAt(i, _dummy.matrix);
      dirty = true;
    }
    if (dirty) {
      this.bubbleInstMesh.instanceMatrix.needsUpdate = true;
    }
    this.bubbleHadActive = anyActive;
  }

  private projectWorldToScreen(pos: { x: number; y: number; z: number }): {
    x: number;
    y: number;
    visible: boolean;
  } {
    _vec3B.set(pos.x, pos.y + 2.0, pos.z);
    _vec3B.project(this.camera);
    const visible = _vec3B.z >= -1 && _vec3B.z <= 1;
    return {
      x: (_vec3B.x * 0.5 + 0.5) * this.viewportWidth,
      y: (-_vec3B.y * 0.5 + 0.5) * this.viewportHeight,
      visible,
    };
  }

  private emitHUD(force: boolean): void {
    const now = performance.now();
    if (!force && now - this.lastHudEmitMs < 95) return;
    this.lastHudEmitMs = now;

    const lang = this.gameSettings.language;
    const dict = getLocale(lang);
    const diffCfg = DIFFICULTY_PRESETS[this.gameSettings.difficulty];
    const callTotal =
      Math.round(getCallCooldownSec(this.campaign.phase) * diffCfg.callCooldownMult * 10) /
      10;
    const callElapsed = this.simTimeSec - this.campaign.lastCallTimeSec;
    const callRemaining = Math.max(0, callTotal - callElapsed);

    const ch = this.activeSceneChapter;
    let objectiveText = dict.objCh1Start;
    if (ch === 10) {
      objectiveText =
        this.playerPos.z <= -62 ? dict.objCh10Sanctuary : dict.objCh10SurfaceSprint;
    } else if (ch === 9) {
      objectiveText = this.ch9BulkheadOpen ? dict.objCh9PassBulkhead : dict.objCh9KeshaAlert;
    } else if (ch === 8) {
      objectiveText = this.ch8ShortcutOpen ? dict.objCh8Exit : dict.objCh8Shortcut;
    } else if (ch === 7) {
      objectiveText = this.ch7WhaleFreed ? dict.objCh7EscapeUpdraft : dict.objCh7FreeWhale;
    } else if (ch === 6) {
      objectiveText = this.ch6EggReclaimed ? dict.objCh6EscapeAscent : dict.objCh6ReachAltar;
    } else if (ch === 5) {
      if (this.ch5GateOpen && this.playerPos.z <= -62) {
        objectiveText = dict.objCh5Exit;
      } else if (this.ch5GateOpen) {
        objectiveText = dict.objCh5PassGate;
      } else if (this.ch5LureCarried) {
        objectiveText = dict.objCh5ReturnQueen;
      } else if (this.playerPos.z > -28 && !this.campaign.npcsMet.includes('queen_angler')) {
        objectiveText = dict.objCh5TalkQueen;
      } else {
        objectiveText = dict.objCh5FindLure;
      }
    } else if (ch === 4) {
      if (this.ch4GateOpen && this.playerPos.z <= -62) {
        objectiveText = dict.objCh4Exit;
      } else if (this.ch4GateOpen) {
        objectiveText = dict.objCh4PassGate;
      } else if (this.whaleContainerCarried) {
        objectiveText = dict.objCh4ReturnCrabs;
      } else if (this.playerPos.z > -28 && !this.campaign.npcsMet.includes('critic_crabs')) {
        objectiveText = dict.objCh4TalkCrabs;
      } else {
        objectiveText = dict.objCh4FindContainer;
      }
    } else if (ch === 3) {
      if (this.ch3DebrisOpen && this.playerPos.z <= -62) {
        objectiveText = dict.objCh3Exit;
      } else if (this.ch3DebrisOpen) {
        objectiveText = dict.objCh3PassGate;
      } else if (this.collectedScrapIds.length >= CHAPTER_3_SCRAPS.length) {
        objectiveText = dict.objCh3ReturnCrabs;
      } else if (this.playerPos.z > -28 && !this.campaign.npcsMet.includes('hermit_crabs')) {
        objectiveText = dict.objCh3TalkCrabs;
      } else {
        objectiveText = t(lang, 'objCh3CollectScraps', {
          count: this.collectedScrapIds.length,
          total: CHAPTER_3_SCRAPS.length,
        });
      }
    } else if (ch === 2) {
      if (this.borisMugCarried && !this.pelicanGateOpen) {
        objectiveText = dict.objCh2MugCarried;
      } else if (!this.pelicanGateOpen && this.playerPos.z > -32) {
        objectiveText = dict.objCh2TalkBoris;
      } else if (!this.pelicanGateOpen) {
        objectiveText = dict.objCh2Pafnutiy;
      } else if (this.playerPos.z <= -62) {
        objectiveText = dict.objCh2Exit;
      } else {
        objectiveText = dict.objCh2ReturnBoris;
      }
    } else {
      if (this.playerPos.z < -26 && this.playerPos.z > -56) {
        objectiveText = dict.objCh1Squid;
      } else if (this.playerPos.z <= -56 && this.playerPos.z > -66) {
        objectiveText = dict.objCh1Net;
      } else if (this.playerPos.z <= -66) {
        objectiveText = dict.objCh1Exit;
      }
    }

    const bubbles: FloatingBubble[] = this.npcs
      .filter((npc) => npc.revealed && npc.talkTimer > 0)
      .map((npc) => {
        const proj = this.projectWorldToScreen(npc.position);
        const [line1, line2] = this.getLocalizedNpcLines(npc);
        return {
          id: npc.id,
          speaker: this.getLocalizedNpcName(npc.id, npc.name),
          line1,
          line2,
          screenX: Math.max(150, Math.min(this.viewportWidth - 150, proj.x)),
          screenY: Math.max(90, Math.min(this.viewportHeight - 130, proj.y)),
          visible: proj.visible,
        };
      });

    const totalDeaths = Object.values(this.campaign.deathsByRoom).reduce(
      (a, b) => a + b,
      0,
    );

    const squidAlert: 'calm' | 'telegraph' | 'dash' =
      this.squid.state === 'telegraph'
        ? 'telegraph'
        : this.squid.state === 'dash'
          ? 'dash'
          : 'calm';

    const [startDepth, endDepth] = CHAPTERS[ch].depthRangeMeters;
    const zProgress = Math.max(0, Math.min(1, (4 - this.playerPos.z) / 90));
    const currentDepthMeters = Math.round(startDepth + (endDepth - startDepth) * zProgress);

    // Zero-GC Echo Compass target selection based on active chapter objective
    this._compassTargetScratch.x = 0;
    this._compassTargetScratch.y = 0;
    this._compassTargetScratch.z = -87;
    if (ch === 2 && !this.pelicanGateOpen) {
      if (this.borisMugCarried && this.borisRig) {
        this._compassTargetScratch.x = this.borisRig.group.position.x;
        this._compassTargetScratch.y = this.borisRig.group.position.y;
        this._compassTargetScratch.z = this.borisRig.group.position.z;
      } else if (this.mugMesh?.visible) {
        this._compassTargetScratch.x = CHAPTER_2_BORIS_MUG_POS.x;
        this._compassTargetScratch.y = CHAPTER_2_BORIS_MUG_POS.y;
        this._compassTargetScratch.z = CHAPTER_2_BORIS_MUG_POS.z;
      } else {
        this._compassTargetScratch.x = CHAPTER_2_PELICAN_LEVER_POS.x;
        this._compassTargetScratch.y = CHAPTER_2_PELICAN_LEVER_POS.y;
        this._compassTargetScratch.z = CHAPTER_2_PELICAN_LEVER_POS.z;
      }
    } else if (ch === 6 && !this.ch6EggReclaimed) {
      this._compassTargetScratch.x = CHAPTER_6_EGG_ALTAR_POS.x;
      this._compassTargetScratch.y = CHAPTER_6_EGG_ALTAR_POS.y;
      this._compassTargetScratch.z = CHAPTER_6_EGG_ALTAR_POS.z;
    } else if (ch === 7 && !this.ch7WhaleFreed) {
      this._compassTargetScratch.x = CHAPTER_7_WHALE_LEVER_POS.x;
      this._compassTargetScratch.y = CHAPTER_7_WHALE_LEVER_POS.y;
      this._compassTargetScratch.z = CHAPTER_7_WHALE_LEVER_POS.z;
    } else if (ch === 8 && !this.ch8ShortcutOpen) {
      this._compassTargetScratch.x = CHAPTER_8_BORIS_LEVER_POS.x;
      this._compassTargetScratch.y = CHAPTER_8_BORIS_LEVER_POS.y;
      this._compassTargetScratch.z = CHAPTER_8_BORIS_LEVER_POS.z;
    } else if (ch === 9 && !this.ch9BulkheadOpen) {
      this._compassTargetScratch.x = CHAPTER_9_BULKHEAD_LEVER_POS.x;
      this._compassTargetScratch.y = CHAPTER_9_BULKHEAD_LEVER_POS.y;
      this._compassTargetScratch.z = CHAPTER_9_BULKHEAD_LEVER_POS.z;
    }
    const compass = computeCompassBearing(
      this.playerPos,
      this.swimState.camYaw,
      this._compassTargetScratch,
    );

    this.onHUDUpdate({
      screenState: this.screenState,
      chapter: ch,
      chapterTitle: dict[`chapter${ch}Title` as 'chapter1Title'],
      phase: this.campaign.phase,
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      pearls: this.campaign.pearls,
      depthMeters: currentDepthMeters,
      isHidden: isInsideCoralShelter(this.playerPos, this.activeShelters),
      callCooldownRemaining: Math.round(callRemaining * 10) / 10,
      callCooldownTotal: callTotal,
      hasDashMutation: this.campaign.hasDashMutation,
      dashCooldownRemaining: Math.round(this.dashCooldownTimer * 10) / 10,
      activeSkin: this.campaign.activeSkin,
      unlockedSkins: [...this.campaign.unlockedSkins],
      upgrades: [...this.campaign.upgrades],
      quests: { ...this.campaign.quests },
      borisMugCarried: this.borisMugCarried,
      pelicanGateOpen: this.pelicanGateOpen,
      pafnutiyInflated: this.pafnutiySwellTimer > 0,
      crabScrapsCollected: this.collectedScrapIds.length,
      crabDebrisOpen: this.ch3DebrisOpen,
      whaleContainerCarried: this.whaleContainerCarried,
      charybdisGateOpen: this.ch4GateOpen,
      ch5LureCarried: this.ch5LureCarried,
      ch5GateOpen: this.ch5GateOpen,
      ch6EggReclaimed: this.ch6EggReclaimed,
      ch7WhaleFreed: this.ch7WhaleFreed,
      ch8ShortcutOpen: this.ch8ShortcutOpen,
      ch9BulkheadOpen: this.ch9BulkheadOpen,
      hatchlingBorn: this.hatchlingBorn,
      objectiveText,
      toastText: this.toastText,
      eggEchoText: this.eggEchoText,
      outcome: this.outcome,
      elapsedSec: Math.round(this.playElapsedSec),
      totalDeaths,
      npcsMetCount: this.campaign.npcsMet.length,
      npcsTotal: this.npcs.length || 2,
      styleDodges: this.campaign.totalStyleDodges,
      muted: this.audio.isMuted(),
      bubbles,
      squidAlert,
      savedHighestChapter: this.savedHighestChapter,
      savedPearls: this.savedPearls,
      completionLabel: this.completionLabel,
      controlSettings: { ...this.controlSettings },
      gameSettings: { ...this.gameSettings },
      autopilotActive: this.swimTarget !== null,
      hoverInteractLabel: this.hoveredInteractLabel,
      collectedRelicIds: [...this.campaign.collectedRelicIds],
      bestRankByChapter: { ...this.campaign.bestRankByChapter },
      npcsMet: [...this.campaign.npcsMet],
      lastChapterRank: this.lastChapterRank,
      awardedSRankBonus: this.lastAwardedSRankBonus,
      eggResonanceActive: this.eggResonanceTimer > 0,
      objectiveBearingDeg: compass.bearingDeg,
      objectiveDistMeters: compass.distMeters,
      titleLaunchActive: this.titleSquidFleeing,
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp, { capture: true });
    window.removeEventListener('pointerup', this.handlePointerUp, { capture: true });
    window.removeEventListener('pointercancel', this.handlePointerCancel, { capture: true });
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('mouseleave', this.handleDocumentMouseLeave);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('resize', this.handleResize);
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    this.container.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerleave', this.handlePointerLeave);
    this.container.removeEventListener('dblclick', this.handleDoubleClick);
    this.container.removeEventListener('contextmenu', this.handleContextMenu);
    this.container.removeEventListener('wheel', this.handleWheel);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    this.container.removeEventListener('touchcancel', this.handleTouchEnd);

    if (this.activePortalRig) {
      this.activePortalRig.dispose();
      this.activePortalRig = null;
    }
    this.audio.dispose();
    this.composer?.dispose();
    this.chapterDisposables.forEach((d) => d.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
