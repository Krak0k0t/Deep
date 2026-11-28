import { GameAction, MouseBinding } from './controlSettings';

export type LanguageId =
  | 'en'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'zh'
  | 'ar'
  | 'uk'
  | 'ru'
  | 'ja'
  | 'pl'
  | 'it'
  | 'vi'
  | 'fa'
  | 'elvish'
  | 'orcish';

export interface LanguageMeta {
  id: LanguageId;
  nativeName: string;
  englishName: string;
  rtl: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { id: 'en', nativeName: 'English', englishName: 'English', rtl: false },
  { id: 'fr', nativeName: 'Français', englishName: 'French', rtl: false },
  { id: 'de', nativeName: 'Deutsch', englishName: 'German', rtl: false },
  { id: 'es', nativeName: 'Español', englishName: 'Spanish', rtl: false },
  { id: 'pt', nativeName: 'Português', englishName: 'Portuguese', rtl: false },
  { id: 'zh', nativeName: '中文', englishName: 'Chinese', rtl: false },
  { id: 'ar', nativeName: 'العربية', englishName: 'Arabic', rtl: true },
  { id: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', rtl: false },
  { id: 'ru', nativeName: 'Русский', englishName: 'Russian', rtl: false },
  { id: 'ja', nativeName: '日本語', englishName: 'Japanese', rtl: false },
  { id: 'pl', nativeName: 'Polski', englishName: 'Polish', rtl: false },
  { id: 'it', nativeName: 'Italiano', englishName: 'Italian', rtl: false },
  { id: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', rtl: false },
  { id: 'fa', nativeName: 'فارسی', englishName: 'Persian', rtl: true },
  { id: 'elvish', nativeName: 'Edhellen (Elvish)', englishName: 'Elvish', rtl: false },
  { id: 'orcish', nativeName: 'Bûrzum (Orcish)', englishName: 'Orcish', rtl: false },
];

export const SUPPORTED_LANGUAGE_IDS: LanguageId[] = SUPPORTED_LANGUAGES.map((l) => l.id);

export function isRtlLanguage(lang: string): boolean {
  return lang === 'ar' || lang === 'fa';
}

export function resolveLanguageId(raw: string | null | undefined): LanguageId {
  if (raw && SUPPORTED_LANGUAGE_IDS.includes(raw as LanguageId)) {
    return raw as LanguageId;
  }
  return 'en';
}

export interface LocaleStrings {
  // Game Title & Meta
  gameTitleLine1: string;
  gameTitleLine2: string;
  metaDescription: string;
  titleTagline: string;
  saveBadge: string; // {chapter}, {pearls}
  chapter1Short: string;
  chapter1Title: string;
  chapter1Sub: string;
  chapter2Short: string;
  chapter2Title: string;
  chapter2Sub: string;
  chapter3Short: string;
  chapter3Title: string;
  chapter3Sub: string;
  chapter4Short: string;
  chapter4Title: string;
  chapter4Sub: string;
  chapter5Short: string;
  chapter5Title: string;
  chapter5Sub: string;
  chapter6Short: string;
  chapter6Title: string;
  chapter6Sub: string;
  chapter7Short: string;
  chapter7Title: string;
  chapter7Sub: string;
  chapter8Short: string;
  chapter8Title: string;
  chapter8Sub: string;
  chapter9Short: string;
  chapter9Title: string;
  chapter9Sub: string;
  chapter10Short: string;
  chapter10Title: string;
  chapter10Sub: string;
  btnContinueDive: string;
  btnStartDive: string;
  btnShop: string; // {pearls}
  btnNewGame: string;
  btnSettings: string;
  btnFullscreen: string;
  btnExitFullscreen: string;
  btnWindowedShort: string;
  btnMainMenu: string;
  btnChaptersToggle: string; // {count}
  titleTapSquidHint: string;
  titleHintHeroClick: string;
  titleControlLine: string;

  // HUD
  hudChapterPrefix: string; // e.g. "CH."
  hudMetersUnit: string;
  hudOxygen: string;
  hudPearls: string;
  hudHidden: string;
  hudBorisMug: string;
  hudCrabScraps: string; // {count}, {total}
  hudWhaleContainer: string;
  hudLurePearl: string;
  hudEggCarried: string;
  hudAscentStun: string;
  hudDash: string;
  hudCall: string;
  hudReady: string;
  hudSecUnit: string;
  hudActionSuffix: string;
  hudMuteLabel: string;
  hudUnmuteLabel: string;
  hudRestartLabel: string;
  hudPauseLabel: string;
  hudMenuLabel: string;
  hudHoverInteract: string; // {target}
  touchSwim: string;
  touchBoost: string;
  touchCall: string;
  touchInteract: string;
  touchStop: string;

  // Objectives
  objCh1Start: string;
  objCh1Squid: string;
  objCh1Net: string;
  objCh1Exit: string;
  objCh2MugCarried: string;
  objCh2TalkBoris: string;
  objCh2Pafnutiy: string;
  objCh2Exit: string;
  objCh2ReturnBoris: string;
  objCh3TalkCrabs: string;
  objCh3CollectScraps: string; // {count}, {total}
  objCh3ReturnCrabs: string;
  objCh3PassGate: string;
  objCh3Exit: string;
  objCh4TalkCrabs: string;
  objCh4FindContainer: string;
  objCh4ReturnCrabs: string;
  objCh4PassGate: string;
  objCh4Exit: string;
  objCh5TalkQueen: string;
  objCh5FindLure: string;
  objCh5ReturnQueen: string;
  objCh5PassGate: string;
  objCh5Exit: string;
  objCh6ReachAltar: string;
  objCh6EscapeAscent: string;
  objCh7FreeWhale: string;
  objCh7EscapeUpdraft: string;
  objCh8Shortcut: string;
  objCh8Exit: string;
  objCh9KeshaAlert: string;
  objCh9PassBulkhead: string;
  objCh10SurfaceSprint: string;
  objCh10Sanctuary: string;

  // Toasts & Echoes
  toastAutopilot: string;
  toastPathBlocked: string;
  toastFishStopped: string;
  toastHitNet: string;
  toastPelicanLocked: string;
  toastDashLocked: string;
  toastInsufficientPearls: string;
  toastSkinEquipped: string; // {name}
  toastUpgradeActive: string;
  toastPearlCollected: string; // {pearls}
  toastBorisGateOpened: string;
  toastBorisQuestComplete: string;
  toastRightClickHint: string;
  toastGoingToPearl: string;
  toastMugFound: string;
  toastGoingToMug: string;
  toastGateOpenedWithDash: string;
  toastGateOpening: string;
  toastGateAlreadyOpen: string;
  toastGoingToLever: string;
  toastShrimpsDistract: string;
  toastShrimpsHidden: string;
  toastNpcGoing: string; // {name}
  toastNpcHint: string; // {name}
  toastAlreadyHidden: string;
  toastGoingToCrate: string;
  toastGoingToCoral: string;
  toastGoingToKelpPortal: string;
  toastGoingToCrevicePortal: string;
  toastEggCallsBelow: string;
  toastNetHint: string;
  toastStyleDodge: string;
  toastPafnutiySwell: string;
  toastHurtCrate: string;
  toastHurtCoral: string;
  toastRespawn: string;
  toastCh1Intro: string;
  toastCh2Intro: string;
  toastCh2NextIntro: string;
  toastCh3Intro: string;
  toastCh3NextIntro: string;
  toastDebrisLocked: string;
  toastCrabQuestCompleteBonus: string;
  toastCrabDebrisCleared: string;
  toastScrapAllFound: string;
  toastScrapFound: string; // {count}, {total}
  toastGoingToScrap: string;
  toastGoingToKelpShelter: string;
  toastGoingToGraveyardPortal: string;
  toastHurtKelp: string;
  toastCh4Intro: string;
  toastCh4NextIntro: string;
  toastWhaleContainerFound: string;
  toastGoingToWhaleContainer: string;
  toastCharybdisLocked: string;
  toastCriticQuestCompleteBonus: string;
  toastCharybdisOpened: string;
  toastGoingToVertebraShelter: string;
  toastGoingToVentPortal: string;
  toastHurtVertebra: string;
  toastCameraReset: string;
  toastCh5Intro: string;
  toastCh5LureFound: string;
  toastQueenEscortStart: string;
  toastCh5GateOpened: string;
  toastCh5GateLocked: string;
  toastVentHit: string;
  toastCh6Intro: string;
  toastEggReclaimed: string;
  toastAscentStunHit: string;
  toastCh6PortalLocked: string;
  toastCh7Intro: string;
  toastWhaleRescued: string;
  toastCh7GateLocked: string;
  toastCh8Intro: string;
  toastBorisShortcutOpen: string;
  toastCh8GateLocked: string;
  toastCh9Intro: string;
  toastKeshaStunBlast: string;
  toastCh9GateOpened: string;
  toastCh9GateLocked: string;
  toastCh10Intro: string;
  toastHatchlingBorn: string;
  echoNear: string;
  echoDeep: string; // {dist}
  echoCh1End: string;
  echoCh2End: string;
  echoCh3End: string;
  echoCh4End: string;
  echoCh5End: string;
  echoCh6End: string;
  echoCh7End: string;
  echoCh8End: string;
  echoCh9End: string;
  echoCh10End: string;
  ch1CompleteLabel: string;
  ch2CompleteLabel: string;
  ch3CompleteLabel: string;
  ch4CompleteLabel: string;
  ch5CompleteLabel: string;
  ch6CompleteLabel: string;
  ch7CompleteLabel: string;
  ch8CompleteLabel: string;
  ch9CompleteLabel: string;
  ch10CompleteLabel: string;

  // Interactable labels
  labelEgg: string;
  labelCoralShelter: string;
  labelCrateShelter: string;
  labelKelpShelter: string;
  labelVertebraShelter: string;
  labelPearl: string;
  labelNet: string;
  labelCrevicePortal: string;
  labelKelpPortal: string;
  labelGraveyardPortal: string;
  labelVentPortal: string;
  labelHeartPortal: string;
  labelAscentPortal: string;
  labelRebellionPortal: string;
  labelLinerPortal: string;
  labelSurfacePortal: string;
  labelHatchlingSanctuary: string;
  labelGateLever: string;
  labelCraneLever: string;
  labelCharybdisLever: string;
  labelVentGateLever: string;
  labelWhaleValve: string;
  labelShortcutLever: string;
  labelBulkheadLever: string;
  labelBorisMug: string;
  labelScrapShard: string;
  labelWhaleContainer: string;
  labelLuminaryPearl: string;
  labelEggAltar: string;

  // Pause / Victory / Defeat Modal
  modalVictoryTitleCh1: string;
  modalVictoryTitleCh2: string;
  modalVictoryTitleCh3: string;
  modalVictoryTitleCh4: string;
  modalVictoryTitleCh5: string;
  modalVictoryTitleCh6: string;
  modalVictoryTitleCh7: string;
  modalVictoryTitleCh8: string;
  modalVictoryTitleCh9: string;
  modalVictoryTitleCh10: string;
  modalVictoryDescCh1: string;
  modalVictoryDescCh2: string;
  modalVictoryDescCh3: string;
  modalVictoryDescCh4: string;
  modalVictoryDescCh5: string;
  modalVictoryDescCh6: string;
  modalVictoryDescCh7: string;
  modalVictoryDescCh8: string;
  modalVictoryDescCh9: string;
  modalVictoryDescCh10: string;
  modalDefeatEyebrow: string;
  modalDefeatTitle: string; // {chapter}
  modalDefeatDesc: string;
  modalPauseEyebrow: string;
  modalPauseDesc: string;
  statTime: string;
  statMet: string;
  statDeaths: string;
  btnResume: string;
  btnPearlShop: string; // {pearls}
  btnNextChapter2: string;
  btnNextChapter3: string;
  btnNextChapter4: string;
  btnNextChapter5: string;
  btnNextChapter6: string;
  btnNextChapter7: string;
  btnNextChapter8: string;
  btnNextChapter9: string;
  btnNextChapter10: string;
  btnRespawn: string;
  btnPlayAgain: string;
  btnRestartChapter: string;
  btnReturnMenu: string;

  // Settings Modal
  settingsEyebrow: string;
  settingsTitle: string;
  tabGeneral: string;
  tabControls: string;
  labelLanguage: string;
  labelDifficulty: string;
  diffCalmName: string;
  diffCalmDesc: string;
  diffStandardName: string;
  diffStandardDesc: string;
  diffAbyssalName: string;
  diffAbyssalDesc: string;
  labelQuality: string;
  qualVeryLow: string;
  qualLow: string;
  qualMedium: string;
  qualHigh: string;
  qualUltra: string;
  labelTouchControls: string;
  touchAuto: string;
  touchOn: string;
  touchOff: string;
  labelMusicVol: string;
  labelSfxVol: string;
  sectionKeyboard: string;
  kbEnabledLabel: string;
  kbEnabledHint: string;
  kbTurnSpeedLabel: string;
  kbRebindTitle: string;
  pressKeyPrompt: string;
  sectionMouse: string;
  mouseEnabledLabel: string;
  mouseEnabledHint: string;
  mouseLookModeLabel: string;
  mouseModeAlways: string;
  mouseModeDrag: string;
  mouseModeLock: string;
  mouseRebindTitle: string;
  mouseInvertYLabel: string;
  mouseSensLabel: string;
  mouseCameraTip: string; // {fsKey}
  btnReset: string;
  btnDone: string;
  btnNext: string;
  btnBack: string;
  sectionAccessibility: string;
  labelUiScale: string;
  labelReducedEffects: string;
  labelReducedEffectsHint: string;
  labelHighContrastSymbols: string;
  labelHighContrastSymbolsHint: string;
  hudCompassObjective: string;
  mobileRadialActions: string;
  toastSanctuaryBlessing: string;

  // Key & Mouse actions
  actForward: string;
  actBackward: string;
  actTurnLeft: string;
  actTurnRight: string;
  actAscend: string;
  actDescend: string;
  actCall: string;
  actDash: string;
  actStopFish: string;
  actPause: string;
  actRestart: string;
  actMute: string;
  actFullscreen: string;
  mActMoveToPoint: string;
  mActHoldSwim: string;
  mActInteract: string;
  mBindLMB: string;
  mBindDBL: string;
  mBindRMB: string;
  mBindMMB: string;
  mBindNONE: string;
  keySpace: string;

  // Pearl Shop
  shopEyebrow: string;
  shopTitle: string;
  shopSkinsTitle: string;
  shopUpgradesTitle: string;
  shopActive: string;
  shopEquip: string;
  shopUnlock: string; // {cost}
  shopOwned: string;
  shopBuy: string; // {cost}
  skinTurquoiseName: string;
  skinTurquoiseDesc: string;
  skinPearlName: string;
  skinPearlDesc: string;
  skinCharcoalName: string;
  skinCharcoalDesc: string;
  upgCoralName: string;
  upgCoralDesc: string;
  upgFinsName: string;
  upgFinsDesc: string;

  // NPCs
  npcMildredName: string;
  npcMildredL1: string;
  npcMildredL2: string;
  npcShrimpsName: string;
  npcShrimpsL1: string;
  npcShrimpsL2: string;
  npcShrimpsPanic1: string;
  npcShrimpsPanic2: string;
  npcBorisName: string;
  npcBorisL1: string;
  npcBorisL2: string;
  npcBorisDone1: string;
  npcBorisDone2: string;
  npcPafnutiyName: string;
  npcPafnutiyL1: string;
  npcPafnutiyL2: string;
  npcPafnutiyPanic1: string;
  npcPafnutiyPanic2: string;
  npcHermitCrabsName: string;
  npcHermitCrabsL1: string;
  npcHermitCrabsL2: string;
  npcHermitCrabsDone1: string;
  npcHermitCrabsDone2: string;
  npcCriticCrabsName: string;
  npcCriticCrabsL1: string;
  npcCriticCrabsL2: string;
  npcCriticCrabsDone1: string;
  npcCriticCrabsDone2: string;
  npcGlafiraName: string;
  npcGlafiraL1: string;
  npcGlafiraL2: string;
  npcQueenName: string;
  npcQueenL1: string;
  npcQueenL2: string;
  npcQueenDone1: string;
  npcQueenDone2: string;
  npcYoungWhaleName: string;
  npcYoungWhaleL1: string;
  npcYoungWhaleL2: string;
  npcYoungWhaleDone1: string;
  npcYoungWhaleDone2: string;
  npcKeshaName: string;
  npcKeshaL1: string;
  npcKeshaL2: string;
  npcKeshaDone1: string;
  npcKeshaDone2: string;

  // Lore Journal, Egg Resonance & Chapter Mastery
  btnJournal: string;
  journalEyebrow: string;
  journalTitle: string;
  journalTabRelics: string;
  journalTabCodex: string;
  journalLockedRelic: string;
  journalLockedCodex: string;
  journalCollectedCount: string; // {count}/{total}
  statRank: string;
  rankSBonus: string;
  hudEggResonance: string;
  labelLoreRelic: string;
  toastLoreRelicCollected: string; // {title}
  toastEggResonance: string;
}

const EN: LocaleStrings = {
  gameTitleLine1: 'Abyssal',
  gameTitleLine2: 'Lullaby',
  metaDescription: 'A cinematic 3D underwater stealth tale of a mother fish and her lost egg.',
  titleTagline:
    'The trawler net is dragging across the reef edge. Follow the turquoise Call, shelter inside living corals, and never lose your egg in the abyss.',
  saveBadge: 'Saved · Chapter {chapter} · {pearls} pearls',
  chapter1Short: 'Chapter 1',
  chapter1Title: 'Quiet Reef',
  chapter1Sub: 'Shallows · Prologue',
  chapter2Short: 'Chapter 2',
  chapter2Title: 'The Singing Whale',
  chapter2Sub: 'Twilight Reef & Sunken Liner',
  chapter3Short: 'Chapter 3',
  chapter3Title: 'Dead Whisper',
  chapter3Sub: 'Giant Kelp Forest',
  chapter4Short: 'Chapter 4',
  chapter4Title: 'Leviathan Graveyard',
  chapter4Sub: 'Whale Bones & Charybdis Crane',
  chapter5Short: 'Chapter 5',
  chapter5Title: 'Black Smokers',
  chapter5Sub: 'Hadal Vents & Queen Anglerfish',
  chapter6Short: 'Chapter 6',
  chapter6Title: 'Turquoise Heart',
  chapter6Sub: 'Abyss Floor · Turning Point',
  chapter7Short: 'Chapter 7',
  chapter7Title: 'Abyssal Breakout',
  chapter7Sub: 'Ascent Updrafts & Young Whale',
  chapter8Short: 'Chapter 8',
  chapter8Title: 'Kelp Rebellion',
  chapter8Sub: 'Egg Glow Through Giant Kelp',
  chapter9Short: 'Chapter 9',
  chapter9Title: 'Singing Whale Alert',
  chapter9Sub: 'Searchlights & Kesha the Parrotfish',
  chapter10Short: 'Chapter 10',
  chapter10Title: 'Homeward Reef',
  chapter10Sub: 'Sunlit Sprint & Hatchling Dawn',
  btnContinueDive: 'Continue Dive',
  btnStartDive: 'Begin Dive',
  btnShop: 'Sanctuary ({pearls})',
  btnNewGame: 'New Game',
  btnSettings: 'Settings & Controls',
  btnFullscreen: 'Fullscreen',
  btnExitFullscreen: 'Exit Fullscreen',
  btnWindowedShort: 'Windowed',
  btnMainMenu: 'Main Menu',
  titleTapSquidHint: 'Click squid to dive',
  titleHintHeroClick: 'Click the fish in the reef',
  titleControlLine:
    'Mouse / A D Turn · W / Hold LMB Swim · Scroll Zoom · MMB Pan · Dbl-Click Move · RMB Interact · E Call · F Fullscreen · Esc Stop / Pause',

  hudChapterPrefix: 'CH.',
  hudMetersUnit: 'M',
  hudOxygen: 'O₂',
  hudPearls: 'Pearls',
  hudHidden: 'Hidden · Undetected',
  hudBorisMug: "Boris's Mug",
  hudCrabScraps: 'Shells {count}/{total}',
  hudWhaleContainer: 'Resonance Container',
  hudLurePearl: 'Luminary Pearl',
  hudEggCarried: 'Egg Safe · Ascent',
  hudAscentStun: 'Stun Wave',
  hudDash: 'Dash',
  hudCall: 'Call',
  hudReady: 'Ready',
  hudSecUnit: 's',
  hudActionSuffix: 'interact',
  hudMuteLabel: 'Mute audio',
  hudUnmuteLabel: 'Unmute audio',
  hudRestartLabel: 'Restart chapter',
  hudPauseLabel: 'Pause',
  hudMenuLabel: 'Main Menu',
  hudHoverInteract: 'Interact: {target}',
  touchSwim: 'Swim',
  touchBoost: 'Dash',
  touchCall: 'Call',
  touchInteract: 'Use',
  touchStop: 'Stop',

  objCh1Start: 'Swim deeper into the reef and press E (Call) to sense your egg',
  objCh1Squid: 'Slip past the rocket squid (hide inside pink coral domes)',
  objCh1Net: 'Swim through one of the 3 sunlit openings in the trawler net',
  objCh1Exit: 'Descend into the bioluminescent sanctuary below',
  objCh2MugCarried: "Mug found! Return it to Boris or turn the hatch wheel",
  objCh2TalkBoris: "Speak with Boris and recover his warm lantern mug in the galley",
  objCh2Pafnutiy: "Glide softly past Pafnutiy and open the Pelican bulkhead",
  objCh2Exit: 'Bulkhead open! Descend toward the Kelp Trench sanctuary',
  objCh2ReturnBoris: 'Return to Boris or swim through the Pelican bulkhead',
  objCh3TalkCrabs: 'Speak with the Hermit Crab Guard near the crane winch',
  objCh3CollectScraps: 'Gather glowing nautilus shells ({count}/{total}) for the crab crane',
  objCh3ReturnCrabs: 'Return to the Hermit Crabs or pull the crane winch lever (RMB)',
  objCh3PassGate: 'Barricade cleared! Slip past the kelp stalker to the abyssal graveyard',
  objCh3Exit: 'Descend into the bioluminescent Leviathan Graveyard sanctuary',
  objCh4TalkCrabs: 'Speak with the Critic Crabs atop the whale vertebra perch',
  objCh4FindContainer: 'Recover the Whale Resonance Container by the sunken Sperm Whale skull',
  objCh4ReturnCrabs: 'Deliver the container to the Critic Crabs or pull the Charybdis Crane lever (RMB)',
  objCh4PassGate: 'Charybdis Crane lifted! Slip past the bone stalker to the hydrothermal vents',
  objCh4Exit: 'Descend into the luminous Hydrothermal Vent sanctuary',
  objCh5TalkQueen: 'Meet Queen Anglerfish and time your swim around erupting thermal vents',
  objCh5FindLure: 'Pick up the Deep Luminary Pearl near the smoking magma vents',
  objCh5ReturnQueen: 'Deliver the Luminary Pearl to Queen Anglerfish or open the Thermal Sluice (RMB)',
  objCh5PassGate: 'Thermal Sluice open! Follow Queen Anglerfish to the Turquoise Heart',
  objCh5Exit: 'Descend into the Turquoise Heart — your egg awaits at the abyssal floor',
  objCh6ReachAltar: 'Reach the Abyssal Crystal Altar and reclaim your glowing Egg (RMB)',
  objCh6EscapeAscent: 'Egg reclaimed! Swim up to the Ascent Rift — press E to shockwave stun predators',
  objCh7FreeWhale: 'Ride the glowing updraft rings and turn the release valve to free Young Whale',
  objCh7EscapeUpdraft: 'Young Whale is free! Follow the singing currents to the Kelp Rebellion',
  objCh8Shortcut: "Awaken spore lanterns with Call [E] and open Boris's secret hull hatch",
  objCh8Exit: 'Secret hatch open! Ascend into the Singing Whale wreck',
  objCh9KeshaAlert: 'Press Call [E] near Parrotfish Kesha and open the Alarm Bulkhead (RMB)',
  objCh9PassBulkhead: 'Bulkhead open! Glide past Pafnutiy and climb toward the sunlit reef',
  objCh10SurfaceSprint: 'Ride the golden updrafts past the final stalker back to Quiet Reef',
  objCh10Sanctuary: 'Enter the sunlit Hatchling Coral Nursery to welcome your baby fish!',

  toastAutopilot: 'Swimming to point · Esc to stop',
  toastPathBlocked: 'Path blocked — fish stopped',
  toastFishStopped: 'Fish stopped',
  toastHitNet: 'Trawler net! Pass through one of the 3 sunlit windows',
  toastPelicanLocked: "Pelican bulkhead locked! Bring Boris's mug or turn the hatch wheel (RMB)",
  toastDashLocked: "Dash mutation unlocks after Octopus Boris's quest",
  toastInsufficientPearls: 'Not enough pearls for this glow form',
  toastSkinEquipped: 'Equipped glow: {name}',
  toastUpgradeActive: 'Shelter upgrade activated!',
  toastPearlCollected: 'Pearl gathered! Total: {pearls}',
  toastBorisGateOpened: 'Boris opened the Pelican bulkhead!',
  toastBorisQuestComplete: 'Mug returned to Boris! Unlocked Dash [Shift] & Pelican bulkhead!',
  toastRightClickHint: 'Right-click a pearl, creature, shelter, or sanctuary portal',
  toastGoingToPearl: 'Swimming to pearl',
  toastMugFound: "Picked up Boris's glowing mug! Return it to Boris or turn the wheel",
  toastGoingToMug: "Swimming to Boris's mug",
  toastGateOpenedWithDash: 'Wheel turned! Pelican bulkhead open & Dash [Shift] unlocked',
  toastGateOpening: 'Wheel turned — Pelican bulkhead is opening!',
  toastGateAlreadyOpen: 'Pelican bulkhead is already open',
  toastGoingToLever: 'Swimming to Pelican hatch wheel',
  toastShrimpsDistract: 'The shrimps panicked and distracted the squid!',
  toastShrimpsHidden: 'The shrimps are hiding in the crevice',
  toastNpcGoing: '{name}: swimming closer',
  toastNpcHint: '{name} shares a clue',
  toastAlreadyHidden: 'Already sheltered — predators cannot spot you',
  toastGoingToCrate: 'Swimming into cargo crate shelter',
  toastGoingToCoral: 'Swimming into coral shelter',
  toastGoingToKelpPortal: 'Swimming to the Kelp Trench sanctuary',
  toastGoingToCrevicePortal: 'Swimming to the bioluminescent crevice sanctuary',
  toastEggCallsBelow: 'Your egg calls from the sanctuary below',
  toastNetHint: 'Trawler net — pass through one of the 3 bright openings',
  toastStyleDodge: 'Stylish dodge ×3! Crabs cheer: +1 pearl',
  toastPafnutiySwell: 'Pafnutiy puffed up from the noise! Swim slower nearby',
  toastHurtCrate: 'Watch out! Shelter inside cargo crates',
  toastHurtCoral: 'Watch out! Shelter inside pink coral domes',
  toastRespawn: 'Returned to zone entrance · Pearls kept',
  toastCh1Intro: 'Trawler net ahead! Your egg drifts down the abyss — press E (Call)',
  toastCh2Intro: "Chapter 2: The Singing Whale — find Boris's mug & open the Pelican gate",
  toastCh2NextIntro: 'Chapter 2: The Singing Whale — glide through the sunken liner',
  toastCh3Intro: 'Chapter 3: Dead Whisper — gather 3 luminous nautilus shells for the Hermit Crabs',
  toastCh3NextIntro: 'Chapter 3: Dead Whisper — enter the swaying Giant Kelp Forest',
  toastDebrisLocked: 'The sunken crane barricade is locked! Gather 3 luminous shells or pull the winch lever (RMB)',
  toastCrabQuestCompleteBonus: 'Shells delivered! Hermit Crabs cleared the barricade (+2 pearls)',
  toastCrabDebrisCleared: 'Crane winch engaged — the debris barricade is lifted!',
  toastScrapAllFound: 'All 3 luminous shells gathered! Return to the Hermit Crabs or pull the winch lever',
  toastScrapFound: 'Luminous nautilus shell gathered ({count}/{total})',
  toastGoingToScrap: 'Swimming to luminous nautilus shell',
  toastGoingToKelpShelter: 'Swimming into kelp root canopy shelter',
  toastGoingToGraveyardPortal: 'Swimming to the Leviathan Graveyard sanctuary',
  toastHurtKelp: 'Watch out! Hide inside the luminous kelp root canopies',
  toastCh4Intro: 'Chapter 4: Leviathan Graveyard — recover the Whale Resonance Container',
  toastCh4NextIntro: 'Chapter 4: Leviathan Graveyard — descend among the towering whale bones',
  toastWhaleContainerFound: 'Whale Resonance Container recovered! Return to the Critic Crabs or pull the lever',
  toastGoingToWhaleContainer: 'Swimming to the Whale Resonance Container',
  toastCharybdisLocked: 'Charybdis Crane sluice is locked! Recover the Resonance Container or pull the lever (RMB)',
  toastCriticQuestCompleteBonus: 'Container tuned! Critic Crabs lifted the Charybdis Crane (+2 pearls)',
  toastCharybdisOpened: 'Charybdis Crane lever pulled — the bone sluice gate is opening!',
  toastGoingToVertebraShelter: 'Swimming into whale vertebra shelter',
  toastGoingToVentPortal: 'Swimming to the Hydrothermal Vent sanctuary',
  toastHurtVertebra: 'Watch out! Hide inside the hollow whale-vertebra arches',
  toastCameraReset: 'Camera view centered',
  toastCh5Intro: 'Chapter 5: Black Smokers — dodge erupting magma plumes & find the Luminary Pearl',
  toastCh5LureFound: 'Deep Luminary Pearl gathered! Bring it to Queen Anglerfish or pull the sluice lever',
  toastQueenEscortStart: 'Queen Anglerfish lit her escort lure & opened the Thermal Sluice! (+2 pearls)',
  toastCh5GateOpened: 'Thermal Sluice wheel turned — gate opening!',
  toastCh5GateLocked: 'Thermal Sluice locked! Bring the Luminary Pearl to Queen Anglerfish or turn the lever',
  toastVentHit: 'Scalding thermal vent blast! Watch for the dark rumble before eruption',
  toastCh6Intro: 'Chapter 6: Turquoise Heart — your egg glows on the abyssal altar ahead!',
  toastEggReclaimed: 'Egg reclaimed! ASCENT BEGINS — Call [E] now emits a 2s predator Stun Wave!',
  toastAscentStunHit: 'Turquoise Stun Wave! Abyssal predator stunned for 2 seconds!',
  toastCh6PortalLocked: 'Reclaim your Egg from the Abyssal Heart Altar before ascending!',
  toastCh7Intro: 'Chapter 7: Abyssal Breakout — ride updraft rings & free Young Whale!',
  toastWhaleRescued: 'Young Whale freed! His song stuns predators & lifts the Ascent Gate (+2 pearls)',
  toastCh7GateLocked: 'Ascent Gate locked! Turn the whale release valve or pull the gate wheel (RMB)',
  toastCh8Intro: 'Chapter 8: Kelp Rebellion — awaken spore lanterns with Call [E] and meet Boris!',
  toastBorisShortcutOpen: "Boris unbolted the secret liner hatch! Slip inside 'Singing Whale'",
  toastCh8GateLocked: "Secret hatch locked! Reach Boris or turn the hatch wheel (RMB)",
  toastCh9Intro: 'Chapter 9: Singing Whale Alert — link Call [E] with Kesha & stay quiet near Pafnutiy!',
  toastKeshaStunBlast: "Kesha echoed your Call across the hold! Stalker stunned & Bulkhead unlocked!",
  toastCh9GateOpened: 'Alarm Bulkhead unlocked — sunlight awaits above!',
  toastCh9GateLocked: 'Alarm Bulkhead locked! Trigger Call near Kesha or pull the bulkhead lever',
  toastCh10Intro: 'Chapter 10: Homeward Reef — ride the sunlit currents to the Coral Nursery!',
  toastHatchlingBorn: 'Your baby hatchling is born! Safe at last in Quiet Reef!',
  echoNear: 'Your egg shimmers just beyond the bioluminescent sanctuary!',
  echoDeep: 'Call echo in the depths (~{dist} m ahead)',
  echoCh1End: '"...mother?.."',
  echoCh2End: '"...beyond lies the whispering kelp..."',
  echoCh3End: '"...leviathan ribs wait below..."',
  echoCh4End: '"...warm vents sing in the deep..."',
  echoCh5End: '"...at the abyssal heart, I shine for you..."',
  echoCh6End: '"Hold tight, little spark — we rise together!"',
  echoCh7End: '"...upward currents carry the whale song..."',
  echoCh8End: '"...the kelp glows where we pass..."',
  echoCh9End: '"...sunlight shimmers just above the hull..."',
  echoCh10End: '"Welcome home to Quiet Reef, little one."',
  ch1CompleteLabel: 'Chapter 1 Complete',
  ch2CompleteLabel: 'Chapter 2 Complete',
  ch3CompleteLabel: 'Chapter 3 Complete',
  ch4CompleteLabel: 'Chapter 4 Complete',
  ch5CompleteLabel: 'Chapter 5 Complete',
  ch6CompleteLabel: 'Chapter 6 Complete',
  ch7CompleteLabel: 'Chapter 7 Complete',
  ch8CompleteLabel: 'Chapter 8 Complete',
  ch9CompleteLabel: 'Chapter 9 Complete',
  ch10CompleteLabel: 'Finale Complete',

  labelEgg: 'Egg Sanctuary',
  labelCoralShelter: 'Coral Shelter',
  labelCrateShelter: 'Cargo Crate Shelter',
  labelKelpShelter: 'Kelp Root Shelter',
  labelVertebraShelter: 'Whale Vertebra Shelter',
  labelPearl: 'Pearl',
  labelNet: 'Trawler Net',
  labelCrevicePortal: 'Bioluminescent Crevice Sanctuary',
  labelKelpPortal: 'Kelp Trench Sanctuary',
  labelGraveyardPortal: 'Leviathan Graveyard Sanctuary',
  labelVentPortal: 'Hydrothermal Vent Sanctuary',
  labelHeartPortal: 'Turquoise Heart Rift',
  labelAscentPortal: 'Abyssal Breakout Rift',
  labelRebellionPortal: 'Kelp Rebellion Updraft',
  labelLinerPortal: 'Singing Whale Hatch',
  labelSurfacePortal: 'Sunlit Reef Current',
  labelHatchlingSanctuary: 'Hatchling Coral Nursery',
  labelGateLever: 'Pelican Hatch Wheel',
  labelCraneLever: 'Crab Crane Winch Lever',
  labelCharybdisLever: 'Charybdis Crane Lever',
  labelVentGateLever: 'Thermal Sluice Wheel',
  labelWhaleValve: 'Whale Release Valve',
  labelShortcutLever: "Boris's Secret Hatch Wheel",
  labelBulkheadLever: 'Alarm Bulkhead Lever',
  labelBorisMug: "Boris's Lantern Mug",
  labelScrapShard: 'Luminous Nautilus Shell',
  labelWhaleContainer: 'Whale Resonance Container',
  labelLuminaryPearl: 'Deep Luminary Pearl',
  labelEggAltar: 'Abyssal Heart Egg Altar',

  modalVictoryTitleCh1: '"...mother?.."',
  modalVictoryTitleCh2: '"...whisper of the deep..."',
  modalVictoryTitleCh3: '"...bones of giants below..."',
  modalVictoryTitleCh4: '"...warm breath of the vents..."',
  modalVictoryTitleCh5: '"...the heart of the abyss..."',
  modalVictoryTitleCh6: '"Together we rise!"',
  modalVictoryTitleCh7: '"Song of the free whale"',
  modalVictoryTitleCh8: '"Lanterns in the kelp"',
  modalVictoryTitleCh9: '"Breakthrough to the sun"',
  modalVictoryTitleCh10: '"Welcome home, little spark"',
  modalVictoryDescCh1:
    'You slipped through the trawler net openings and reached the glowing abyssal sanctuary. Progress saved — Chapter 2: The Singing Whale is unlocked.',
  modalVictoryDescCh2:
    "You returned Boris's mug, slipped silently past Pafnutiy, and opened the Pelican bulkhead. Chapter 3: Dead Whisper is now unlocked.",
  modalVictoryDescCh3:
    'You aided the Hermit Crabs, glided through the towering kelp shadows, and unlocked Chapter 4: Leviathan Graveyard.',
  modalVictoryDescCh4:
    'You recovered the Whale Resonance Container for the Critic Crabs, passed the Charybdis Crane, and reached the warm Hydrothermal Vents.',
  modalVictoryDescCh5:
    'Guided by Queen Anglerfish through the boiling Black Smokers, you reached the threshold of the Turquoise Heart.',
  modalVictoryDescCh6:
    'You reclaimed your Egg from the Abyssal Heart! Empowered by the Ascent Stun Call, you begin the perilous climb home.',
  modalVictoryDescCh7:
    'You freed Young Whale from the abyssal tether and rode his singing updrafts toward the upper kelp forest.',
  modalVictoryDescCh8:
    "Your egg's glow awakened the spore lanterns across the Kelp Rebellion, leading you to Boris's secret liner shortcut.",
  modalVictoryDescCh9:
    "With Kesha's echoing alarm blast and Pafnutiy's tip, you cleared the Singing Whale's final bulkhead toward the surface.",
  modalVictoryDescCh10:
    'Beneath golden sunbeams in Quiet Reef, your egg hatches at last! Mother Fish and her glowing little hatchling are reunited forever.',
  modalDefeatEyebrow: 'Oxygen Depleted',
  modalDefeatTitle: '{chapter} holds fast',
  modalDefeatDesc:
    'A predator cornered you, yet all gathered pearls remain safe. Returning to the current zone entrance.',
  modalPauseEyebrow: 'Dive Paused',
  modalPauseDesc:
    'Catch your breath, visit the Pearl Sanctuary, customize controls/graphics, or restart the chapter.',
  statTime: 'Time',
  statMet: 'Met',
  statDeaths: 'Falls',
  btnResume: 'Resume Dive',
  btnPearlShop: 'Pearl Sanctuary ({pearls})',
  btnNextChapter2: 'Continue to Chapter 2: The Singing Whale',
  btnNextChapter3: 'Continue to Chapter 3: Dead Whisper',
  btnNextChapter4: 'Continue to Chapter 4: Leviathan Graveyard',
  btnNextChapter5: 'Continue to Chapter 5: Black Smokers',
  btnNextChapter6: 'Continue to Chapter 6: Turquoise Heart',
  btnNextChapter7: 'Continue to Chapter 7: Abyssal Breakout',
  btnNextChapter8: 'Continue to Chapter 8: Kelp Rebellion',
  btnNextChapter9: 'Continue to Chapter 9: Singing Whale Alert',
  btnNextChapter10: 'Continue to Chapter 10: Homeward Reef',
  btnRespawn: 'Zone Checkpoint',
  btnPlayAgain: 'Replay Chapter',
  btnRestartChapter: 'Restart Chapter',
  btnReturnMenu: 'Return to Main Menu',

  settingsEyebrow: 'Dive Configuration',
  settingsTitle: 'Settings & Controls',
  tabGeneral: 'World, Language & Graphics',
  tabControls: 'Keyboard & Mouse',
  labelLanguage: 'Language',
  labelDifficulty: 'Difficulty',
  diffCalmName: 'Calm',
  diffCalmDesc: 'Gentler predators and lower damage',
  diffStandardName: 'Standard',
  diffStandardDesc: 'Balanced abyss stealth',
  diffAbyssalName: 'Abyssal',
  diffAbyssalDesc: 'Swift predators and fierce currents',
  labelQuality: 'Graphics Quality',
  qualVeryLow: 'Very Low',
  qualLow: 'Low',
  qualMedium: 'Medium',
  qualHigh: 'High',
  qualUltra: 'Ultra',
  labelTouchControls: 'Touch Controls (Tablet / Phone)',
  touchAuto: 'Auto-detect',
  touchOn: 'Always On',
  touchOff: 'Off',
  labelMusicVol: 'Music Volume',
  labelSfxVol: 'Effects Volume',
  sectionKeyboard: 'Keyboard',
  kbEnabledLabel: 'Keyboard swimming controls',
  kbEnabledHint: 'Disable to steer purely with mouse or touch',
  kbTurnSpeedLabel: 'Keyboard turn speed',
  kbRebindTitle: 'Key bindings (click a key to rebind)',
  pressKeyPrompt: 'Press key...',
  sectionMouse: 'Mouse & Camera',
  mouseEnabledLabel: 'Mouse steering & interaction',
  mouseEnabledHint: 'Camera orbit, zoom (wheel), pan (MMB/Alt-drag), point move & interact',
  mouseLookModeLabel: 'Mouse look mode',
  mouseModeAlways: 'Free look with mouse movement',
  mouseModeDrag: 'Orbit while holding mouse button',
  mouseModeLock: 'Pointer lock (centered reticle)',
  mouseRebindTitle: 'Mouse button bindings',
  mouseInvertYLabel: 'Invert vertical mouse axis',
  mouseSensLabel: 'Mouse sensitivity',
  mouseCameraTip:
    'Scroll wheel zooms camera · Hold MMB (or Alt+Drag) pans · Double-click MMB resets view · Fullscreen key: {fsKey}.',
  btnReset: 'Reset Defaults',
  btnDone: 'Done',
  btnNext: 'Next',
  btnBack: 'Back',

  actForward: 'Swim forward',
  actBackward: 'Brake / reverse',
  actTurnLeft: 'Turn left',
  actTurnRight: 'Turn right',
  actAscend: 'Ascend',
  actDescend: 'Descend',
  actCall: 'Call (echolocation)',
  actDash: 'Dash surge (Ch. 2+)',
  actStopFish: 'Stop fish',
  actPause: 'Pause',
  actRestart: 'Restart chapter',
  actMute: 'Mute / unmute',
  actFullscreen: 'Fullscreen',
  mActMoveToPoint: 'Swim to cursor point',
  mActHoldSwim: 'Hold to swim forward',
  mActInteract: 'Interact with object',
  mBindLMB: 'LMB (Left)',
  mBindDBL: 'Double-Click LMB',
  mBindRMB: 'RMB (Right)',
  mBindMMB: 'MMB (Wheel)',
  mBindNONE: 'Disabled',
  keySpace: 'Space',

  shopEyebrow: 'Mother Fish Refuge',
  shopTitle: 'Pearl Sanctuary',
  shopSkinsTitle: 'Bioluminescent Forms',
  shopUpgradesTitle: 'Refuge Adaptations',
  shopActive: 'Active',
  shopEquip: 'Equip',
  shopUnlock: 'Unlock · {cost}',
  shopOwned: 'Acquired',
  shopBuy: 'Acquire · {cost}',
  skinTurquoiseName: 'Turquoise Call',
  skinTurquoiseDesc: 'Natural mother-fish bioluminescence.',
  skinPearlName: 'Pearl Shimmer',
  skinPearlDesc: 'Radiant light: lures deep anglers more effectively.',
  skinCharcoalName: 'Charcoal Shadow',
  skinCharcoalDesc: 'Dimmed aura: harder for deep predators to spot.',
  upgCoralName: 'Coral Veil',
  upgCoralDesc: 'Shelters dampen your glow and the egg aura much faster.',
  upgFinsName: 'Silent Fins',
  upgFinsDesc: 'Reduces swimming noise near sensitive creatures like Pafnutiy.',

  npcMildredName: 'Grandma Jellyfish Mildred',
  npcMildredL1: 'Youngsters forgot how to glide cleanly.',
  npcMildredL2: 'Lost the trail? Press E (Call) to echo your egg.',
  npcShrimpsName: 'Panicked Shrimps',
  npcShrimpsL1: 'DRILL ALARM! Hide in the coral!',
  npcShrimpsL2: 'Stay in the pink branches while the squid passes!',
  npcShrimpsPanic1: 'Hey! We are tired of hiding from you!',
  npcShrimpsPanic2: 'Ducking into the crevice for a minute!',
  npcBorisName: 'Octopus Boris',
  npcBorisL1: 'Lost my favorite lantern mug — warm as tea.',
  npcBorisL2: "Find it in the galley and I'll open the secret hatch!",
  npcBorisDone1: 'Incredible! My glowing mug is intact!',
  npcBorisDone2: 'Opening the Pelican gate and granting you Dash!',
  npcPafnutiyName: 'Pufferfish Pafnutiy',
  npcPafnutiyL1: 'Quiet! Any loud splash puffs me right up!',
  npcPafnutiyL2: 'Do not rush past or I will bounce you into the hold!',
  npcPafnutiyPanic1: 'TOO LOUD! PUFFING UP!',
  npcPafnutiyPanic2: 'Shockwave across the galley — hold tight!',
  npcHermitCrabsName: 'Hermit Crab Guard',
  npcHermitCrabsL1: 'The crane jam blocks the trench! Bring 3 luminous nautilus shells.',
  npcHermitCrabsL2: 'Or swim right up to the winch lever once you collect them!',
  npcHermitCrabsDone1: 'Clack-clack! That counterweight works wonders!',
  npcHermitCrabsDone2: 'The kelp trench barrier is lifted — glide safely!',
  npcCriticCrabsName: 'Critic Crabs',
  npcCriticCrabsL1: 'Hmph! The Charybdis Crane is locked without the Whale Resonance Container.',
  npcCriticCrabsL2: 'Fetch it from the Sperm Whale skull ridge, or turn the crane lever!',
  npcCriticCrabsDone1: 'Sublime resonance! Four stars for poise under pressure!',
  npcCriticCrabsDone2: 'The Charybdis sluice is open — swim toward the warm vents!',
  npcGlafiraName: 'Turtle Glafira',
  npcGlafiraL1: 'The giant kelp whispers when the Whisper Stalker prowls.',
  npcGlafiraL2: 'Tuck beneath the luminous kelp roots until its violet eye fades.',
  npcQueenName: 'Queen Anglerfish',
  npcQueenL1: 'A brave turquoise spark all the way down by the Black Smokers!',
  npcQueenL2: 'Bring me the Deep Luminary Pearl and I will escort you to the Heart.',
  npcQueenDone1: 'Splendid! Stay behind my lantern while I distract the stalker!',
  npcQueenDone2: 'The Thermal Sluice is open — swim down to your egg!',
  npcYoungWhaleName: 'Young Whale',
  npcYoungWhaleL1: 'Hoooom... A rusted cable snagged my fin beside the gate!',
  npcYoungWhaleL2: 'Turn the release valve to free me and open the Ascent path!',
  npcYoungWhaleDone1: 'HOOOOM! Free at last! My song scatters the abyssal squid!',
  npcYoungWhaleDone2: 'Follow the warm updrafts toward the Kelp Rebellion!',
  npcKeshaName: 'Parrotfish Kesha',
  npcKeshaL1: 'SQUAWK! Alarm lights in the hold! Who glows so bright?!',
  npcKeshaL2: 'Sound your Call [E] beside me and I will blast the bulkhead open!',
  npcKeshaDone1: 'SQUAWK-BOOM! That echoed all the way to the hull!',
  npcKeshaDone2: 'Bulkhead open — ride the sunlight back to Quiet Reef!',

  btnJournal: 'Deep Journal',
  journalEyebrow: 'Abyssal Chronicle',
  journalTitle: 'Relics & Deep Codex',
  journalTabRelics: 'Lore Relics',
  journalTabCodex: 'Deep Codex',
  journalLockedRelic: 'Unclaimed relic — explore this chapter with Call [E] to uncover it.',
  journalLockedCodex: 'Undiscovered creature — encounter it or reach its chapter depth.',
  journalCollectedCount: '{count}/{total} found',
  statRank: 'Rank',
  rankSBonus: 'First S-Rank Bonus: +2 pearls!',
  hudEggResonance: 'Egg Resonance',
  labelLoreRelic: 'Chronicle Relic',
  toastLoreRelicCollected: 'Relic discovered: {title} (+2 pearls)!',
  toastEggResonance: 'Egg Resonance awakened — shelter O₂ ×2 & softer aura!',
  btnChaptersToggle: 'Chapters ({count})',
  sectionAccessibility: 'Accessibility & HUD',
  labelUiScale: 'Interface scale',
  labelReducedEffects: 'Reduce camera shake & flash effects',
  labelReducedEffectsHint: 'Keeps telegraphs crisp while softening screen motion',
  labelHighContrastSymbols: 'High-contrast shape indicators',
  labelHighContrastSymbolsHint: 'Adds distinct symbols alongside color status cues',
  hudCompassObjective: 'Echo bearing',
  mobileRadialActions: 'Actions',
  toastSanctuaryBlessing: 'Relic Sanctuary Blessing: O₂ restored & Call ready!',
};

const RU: LocaleStrings = {
  ...EN,
  gameTitleLine1: 'Глубоководная',
  gameTitleLine2: 'рыбка',
  metaDescription: 'Кинематографичная 3D-стелс-история о маме-рыбке и её потерянной икринке.',
  titleTagline:
    'Сеть траулера вот-вот оборвётся на край рифа. Следуй за бирюзовым Зовом, прячься в живых кораллах и не потеряй свою икринку в бездне.',
  saveBadge: 'Сохранение · Глава {chapter} · {pearls} жемч.',
  chapter1Short: 'Глава 1',
  chapter1Title: 'Тихий риф',
  chapter1Sub: 'Мелководье · Пролог',
  chapter2Short: 'Глава 2',
  chapter2Title: 'Поющий кит',
  chapter2Sub: 'Сумеречный риф и затонувший лайнер',
  chapter3Short: 'Глава 3',
  chapter3Title: 'Мёртвый шёпот',
  chapter3Sub: 'Лес гигантских водорослей',
  chapter4Short: 'Глава 4',
  chapter4Title: 'Кладбище левиафанов',
  chapter4Sub: 'Китовые рёбра и кран Харибда',
  chapter5Short: 'Глава 5',
  chapter5Title: 'Чёрные курильщики',
  chapter5Sub: 'Хадальная зона и Королева-удильщица',
  chapter6Short: 'Глава 6',
  chapter6Title: 'Бирюзовое сердце',
  chapter6Sub: 'Дно бездны · Перелом',
  chapter7Short: 'Глава 7',
  chapter7Title: 'Прорыв из бездны',
  chapter7Sub: 'Восходящие течения и Китёнок',
  chapter8Short: 'Глава 8',
  chapter8Title: 'Ламинариевый мятеж',
  chapter8Sub: 'Свет икринки и тайник Бориса',
  chapter9Short: 'Глава 9',
  chapter9Title: '«Поющий кит». Тревога',
  chapter9Sub: 'Прожекторы и попугай Кеша',
  chapter10Short: 'Глава 10',
  chapter10Title: 'Наверх. Тихий риф',
  chapter10Sub: 'Вылупление малька и свет поверхности',
  btnContinueDive: 'Продолжить погружение',
  btnStartDive: 'Начать погружение',
  btnShop: 'Магазин ({pearls})',
  btnNewGame: 'Новая игра',
  btnSettings: 'Настройки и управление',
  btnFullscreen: 'На весь экран',
  btnExitFullscreen: 'Выйти из полного экрана',
  btnWindowedShort: 'Окно',
  btnMainMenu: 'Главное меню',
  btnChaptersToggle: 'Главы ({count})',
  titleTapSquidHint: 'Нажми на кальмара',
  titleHintHeroClick: 'Нажмите на рыбку в рифе',
  titleControlLine:
    'Мышь / A D — поворот · W / ЛКМ — плыть · Колесо — зум · E — Зов · F — полный экран · Esc — пауза',

  hudChapterPrefix: 'ГЛ.',
  hudMetersUnit: 'М',
  hudOxygen: 'O₂',
  hudPearls: 'Жемчуг',
  hudHidden: 'В укрытии · Незаметна',
  hudBorisMug: 'Кружка Бориса',
  hudCrabScraps: 'Раковины {count}/{total}',
  hudWhaleContainer: 'Контейнер резонанса',
  hudLurePearl: 'Люминар-жемчужина',
  hudEggCarried: 'Икринка с мамой · Подъём',
  hudAscentStun: 'Оглушение',
  hudDash: 'Рывок',
  hudCall: 'Зов',
  hudReady: 'Готов',
  hudSecUnit: 'с',
  hudActionSuffix: 'действие',
  hudMuteLabel: 'Выключить звук',
  hudUnmuteLabel: 'Включить звук',
  hudRestartLabel: 'Начать заново',
  hudPauseLabel: 'Пауза',
  hudMenuLabel: 'В главное меню',
  hudHoverInteract: 'Взаимодействие: {target}',
  touchSwim: 'Плыть',
  touchBoost: 'Рывок',
  touchCall: 'Зов',
  touchInteract: 'Действ.',
  touchStop: 'Стоп',

  objCh1Start: 'Плыви вглубь рифа и жми E (Зов), чтобы чуять икринку',
  objCh1Squid: 'Проскочи мимо кальмара-ракеты (прячься в розовых кораллах)',
  objCh1Net: 'Пролети через одно из 3 светлых окон в сети траулера',
  objCh1Exit: 'Спускайся к биолюминесцентной расщелине внизу',
  objCh2MugCarried: 'Кружка найдена! Отнеси её Борису или поверни штурвал створки',
  objCh2TalkBoris: 'Поговори с Борисом и отыщи его ламповую кружку на камбузе',
  objCh2Pafnutiy: 'Проплыви тихо мимо Пафнутия и открой створку «Пеликан»',
  objCh2Exit: 'Створка открыта! Спускайся к святилищу Ламинариевого леса',
  objCh2ReturnBoris: 'Возвращайся к Борису или проходи через створку «Пеликан»',
  objCh3TalkCrabs: 'Поговори с Крабами-отшельниками у заваленного крана',
  objCh3CollectScraps: 'Собери светящиеся раковины ({count}/{total}) для противовеса крана',
  objCh3ReturnCrabs: 'Вернись к Крабам-отшельникам или потяни рычаг крана (ПКМ)',
  objCh3PassGate: 'Завал расчищен! Проскочи мимо хищника ламинарий к Кладбищу левиафанов',
  objCh3Exit: 'Спускайся в биолюминесцентный разлом Кладбища левиафанов',
  objCh4TalkCrabs: 'Поговори с Крабами-критиками на костяной трибуне',
  objCh4FindContainer: 'Найди Контейнер резонанса китов у остова кашалота',
  objCh4ReturnCrabs: 'Принеси контейнер Крабам-критикам или потяни рычаг крана Харибда (ПКМ)',
  objCh4PassGate: 'Кран Харибда поднят! Проскользни мимо стража костей к термальным источникам',
  objCh4Exit: 'Спускайся в тёплый разлом гидротермальных источников',
  objCh5TalkQueen: 'Поговори с Королевой-удильщицей и обходи извержения чёрных курильщиков',
  objCh5FindLure: 'Добудь Глубинную люминар-жемчужину у светящихся магматических столбов',
  objCh5ReturnQueen: 'Отнеси жемчужину Королеве-удильщице или поверни штурвал шлюза (ПКМ)',
  objCh5PassGate: 'Термальный шлюз открыт! Плыви за Королевой к Бирюзовому сердцу',
  objCh5Exit: 'Спускайся в Бирюзовое сердце — твоя икринка сияет на самом дне',
  objCh6ReachAltar: 'Доберись до кристального алтаря Бездны и забери свою Икринку (ПКМ)',
  objCh6EscapeAscent: 'Икринка с тобой! Всплывай к разлому — Зов [E] оглушает хищников!',
  objCh7FreeWhale: 'Лови восходящие кольца и поверни клапан сброса, чтобы освободить Китёнка',
  objCh7EscapeUpdraft: 'Китёнок свободен! Плыви по поющим течениям в Ламинариевый мятеж',
  objCh8Shortcut: 'Зажги споровые фонари Зовом [E] и открой тайный люк Бориса',
  objCh8Exit: 'Тайный люк открыт! Поднимайся внутрь лайнера «Поющий кит»',
  objCh9KeshaAlert: 'Подай Зов [E] рядом с попугаем Кешей и открой переборку тревоги (ПКМ)',
  objCh9PassBulkhead: 'Переборка открыта! Тихо минуй Пафнутия и всплывай к солнцу',
  objCh10SurfaceSprint: 'Мчись по золотым потокам мимо последнего хищника к Тихому рифу',
  objCh10Sanctuary: 'Заплывай в солнечную колыбель кораллов, чтобы встретить своего малька!',

  toastAutopilot: 'Плыву к точке · Esc — стоп',
  toastPathBlocked: 'Путь перекрыт — рыбка остановлена',
  toastFishStopped: 'Рыбка остановлена',
  toastHitNet: 'Сеть траулера! Проплывай сквозь одно из 3 светлых окон',
  toastPelicanLocked: 'Створка «Пеликан» заперта! Принеси кружку Борису или поверни штурвал ПКМ',
  toastDashLocked: 'Мутация «Рывок» открывается после квеста Осьминога Бориса',
  toastInsufficientPearls: 'Недостаточно жемчужин для этого облика',
  toastSkinEquipped: 'Выбран облик: {name}',
  toastUpgradeActive: 'Улучшение укрытий активировано!',
  toastPearlCollected: 'Найдена жемчужина! Всего: {pearls}',
  toastBorisGateOpened: 'Борис открыл створку «Пеликан»!',
  toastBorisQuestComplete: 'Кружка возвращена Борису! Открыт Рывок [Shift] и створка «Пеликан»!',
  toastRightClickHint: 'Наведите ПКМ на жемчужину, существо, укрытие или портал',
  toastGoingToPearl: 'Плыву к жемчужине',
  toastMugFound: 'Ламповая кружка Бориса взята! Верните её Борису или поверните штурвал',
  toastGoingToMug: 'Плыву к кружке Бориса',
  toastGateOpenedWithDash: 'Штурвал повёрнут! Створка «Пеликан» открыта и получен Рывок [Shift]',
  toastGateOpening: 'Штурвал повёрнут — створка «Пеликан» открывается!',
  toastGateAlreadyOpen: 'Створка «Пеликан» уже открыта',
  toastGoingToLever: 'Плыву к штурвалу «Пеликан»',
  toastShrimpsDistract: 'Креветки всполошились и отвлекли кальмара!',
  toastShrimpsHidden: 'Креветки уже спрятались в щели',
  toastNpcGoing: '{name}: плыву ближе',
  toastNpcHint: '{name} делится подсказкой',
  toastAlreadyHidden: 'Вы уже в укрытии — хищник вас не видит',
  toastGoingToCrate: 'Плыву в трюмный ящик',
  toastGoingToCoral: 'Плыву в коралловое укрытие',
  toastGoingToKelpPortal: 'Плыву в святилище Ламинариевого леса',
  toastGoingToCrevicePortal: 'Плыву к биолюминесцентной расщелине',
  toastEggCallsBelow: 'Икринка зовёт из расщелины внизу',
  toastNetHint: 'Сеть траулера — проплывай через одно из 3 светлых окон',
  toastStyleDodge: 'Красивый уворот ×3! Крабы оценили: +1 жемчужина',
  toastPafnutiySwell: 'Пафнутий раздулся от шума! Проплывай медленнее',
  toastHurtCrate: 'Осторожнее! Прячься в трюмных ящиках',
  toastHurtCoral: 'Осторожнее! Прячься в розовых кораллах',
  toastRespawn: 'Возврат ко входу в зону · Жемчуг сохранён',
  toastCh1Intro: 'Сеть траулера! Икринку уносит в расщелину — жми E (Зов)',
  toastCh2Intro: 'Глава 2: «Поющий кит» — найди кружку Бориса и открой створку «Пеликан»',
  toastCh2NextIntro: 'Глава 2: «Поющий кит» — плыви через затонувший лайнер',
  toastCh3Intro: 'Глава 3: «Мёртвый шёпот» — собери 3 светящиеся раковины для Краба-крановщика',
  toastCh3NextIntro: 'Глава 3: «Мёртвый шёпот» — добро пожаловать в лес гигантских водорослей',
  toastDebrisLocked: 'Завал крана перекрывает путь! Принеси 3 раковины крабам или потяни рычаг ПКМ',
  toastCrabQuestCompleteBonus: 'Раковины доставлены! Крабы расчистили завал (+2 жемчужины)',
  toastCrabDebrisCleared: 'Рычаг крана сработал — завал расчищен!',
  toastScrapAllFound: 'Все 3 раковины собраны! Вернись к Крабам-отшельникам или потяни рычаг',
  toastScrapFound: 'Найдена светящаяся раковина ({count}/{total})',
  toastGoingToScrap: 'Плыву к светящейся раковине',
  toastGoingToKelpShelter: 'Плыву в укрытие под корнями ламинарии',
  toastGoingToGraveyardPortal: 'Плыву к порталу Кладбища левиафанов',
  toastHurtKelp: 'Осторожнее! Прячься под светящимися корнями ламинарий',
  toastCh4Intro: 'Глава 4: «Кладбище левиафанов» — отыщи Контейнер резонанса китов',
  toastCh4NextIntro: 'Глава 4: «Кладбище левиафанов» — добро пожаловать в долину исполинских рёбер',
  toastWhaleContainerFound: 'Контейнер резонанса китов взят! Неси его Крабам-критикам или потяни рычаг',
  toastGoingToWhaleContainer: 'Плыву к Контейнеру резонанса китов',
  toastCharybdisLocked: 'Шлюз крана Харибда заперт! Принеси Контейнер резонанса или потяни рычаг ПКМ',
  toastCriticQuestCompleteBonus: 'Контейнер настроен! Крабы-критики подняли шлюз Харибда (+2 жемчужины)',
  toastCharybdisOpened: 'Рычаг крана Харибда сработал — костяные створки открываются!',
  toastGoingToVertebraShelter: 'Плыву в укрытие под китовым позвонком',
  toastGoingToVentPortal: 'Плыву в святилище гидротермальных источников',
  toastHurtVertebra: 'Осторожнее! Прячься внутри полых китовых позвонков',
  toastCameraReset: 'Вид камеры сброшен',
  toastCh5Intro: 'Глава 5: «Чёрные курильщики» — берегись выбросов магмы и найди люминар-жемчужину',
  toastCh5LureFound: 'Глубинная люминар-жемчужина взята! Отнеси её Королеве или поверни штурвал шлюза',
  toastQueenEscortStart: 'Королева зажгла приманку эскорта и открыла Термальный шлюз! (+2 жемчужины)',
  toastCh5GateOpened: 'Штурвал Термального шлюза повёрнут — путь свободен!',
  toastCh5GateLocked: 'Термальный шлюз заперт! Принеси жемчужину Королеве или поверни штурвал ПКМ',
  toastVentHit: 'Обжигающий выброс курильщика! Следи за тёмным гулом перед извержением',
  toastCh6Intro: 'Глава 6: «Бирюзовое сердце» — твоя икринка ждёт на кристальном алтаре впереди!',
  toastEggReclaimed: 'Икринка спасена! НАЧИНАЕТСЯ ПОДЪЁМ — Зов [E] теперь оглушает хищников на 2с!',
  toastAscentStunHit: 'Бирюзовая ударная волна! Хищник оглушён на 2 секунды!',
  toastCh6PortalLocked: 'Сначала забери свою Икринку с алтаря Бирюзового сердца!',
  toastCh7Intro: 'Глава 7: «Прорыв из бездны» — входи в восходящие потоки и освободи Китёнка!',
  toastWhaleRescued: 'Китёнок свободен! Его песня оглушает кальмаров и открывает шлюз (+2 жемчужины)',
  toastCh7GateLocked: 'Шлюз подъёма заперт! Поверни клапан китёнка или штурвал у ворот (ПКМ)',
  toastCh8Intro: 'Глава 8: «Ламинариевый мятеж» — зажигай споровые фонари Зовом [E] и найди Бориса!',
  toastBorisShortcutOpen: 'Борис открутил тайный люк! Проплывай в трюм «Поющего кита»',
  toastCh8GateLocked: 'Тайный люк заперт! Поговори с Борисом или поверни штурвал люка (ПКМ)',
  toastCh9Intro: 'Глава 9: «Поющий кит. Тревога» — кричи Зовом [E] у Кеши и не шуми у Пафнутия!',
  toastKeshaStunBlast: 'Кеша усилил твой Зов на весь трюм! Хищник оглушён, переборка открыта!',
  toastCh9GateOpened: 'Переборка тревоги открыта — над корпусом уже видно солнце!',
  toastCh9GateLocked: 'Переборка тревоги заперта! Подай Зов [E] у Кеши или потяни рычаг ПКМ',
  toastCh10Intro: 'Глава 10: «Наверх. Тихий риф» — лови золотые потоки домой к колыбели кораллов!',
  toastHatchlingBorn: 'Малыш вылупился! Вы наконец-то вернулись в родной Тихий риф!',
  echoNear: 'Икринка совсем рядом за расщелиной!',
  echoDeep: 'Эхо Зова в глубине (~{dist} м вперёд)',
  echoCh1End: '«...мама?..»',
  echoCh2End: '«...дальше — шёпот водорослей...»',
  echoCh3End: '«...впереди кости древних китов...»',
  echoCh4End: '«...тёплые ключи поют на дне...»',
  echoCh5End: '«...в самом сердце бездны я свечу тебе...»',
  echoCh6End: '«Держись крепче, искорка — мы поднимаемся вместе!»',
  echoCh7End: '«...восходящие струи несут песню кита...»',
  echoCh8End: '«...водоросли вспыхивают там, где мы плывём...»',
  echoCh9End: '«...над палубой уже переливается солнце...»',
  echoCh10End: '«С возвращением на Тихий риф, малыш.»',
  ch1CompleteLabel: 'Глава 1 завершена',
  ch2CompleteLabel: 'Глава 2 завершена',
  ch3CompleteLabel: 'Глава 3 завершена',
  ch4CompleteLabel: 'Глава 4 завершена',
  ch5CompleteLabel: 'Глава 5 завершена',
  ch6CompleteLabel: 'Глава 6 завершена',
  ch7CompleteLabel: 'Глава 7 завершена',
  ch8CompleteLabel: 'Глава 8 завершена',
  ch9CompleteLabel: 'Глава 9 завершена',
  ch10CompleteLabel: 'Финал пройден',

  labelEgg: 'Икринка',
  labelCoralShelter: 'Коралловое укрытие',
  labelCrateShelter: 'Трюмный ящик-укрытие',
  labelKelpShelter: 'Укрытие в корнях ламинарии',
  labelVertebraShelter: 'Укрытие в китовом позвонке',
  labelPearl: 'Жемчужина',
  labelNet: 'Сеть траулера',
  labelCrevicePortal: 'Святилище бирюзовой расщелины',
  labelKelpPortal: 'Святилище Ламинариевого леса',
  labelGraveyardPortal: 'Портал Кладбища левиафанов',
  labelVentPortal: 'Святилище термальных источников',
  labelHeartPortal: 'Разлом Бирюзового сердца',
  labelAscentPortal: 'Поток Прорыва из бездны',
  labelRebellionPortal: 'Поток Ламинариевого мятежа',
  labelLinerPortal: 'Тайный люк «Поющего кита»',
  labelSurfacePortal: 'Солнечное течение рифа',
  labelHatchlingSanctuary: 'Коралловая колыбель малька',
  labelGateLever: 'Штурвал створки «Пеликан»',
  labelCraneLever: 'Рычаг лебёдки крана',
  labelCharybdisLever: 'Рычаг крана Харибда',
  labelVentGateLever: 'Штурвал Термального шлюза',
  labelWhaleValve: 'Клапан освобождения китёнка',
  labelShortcutLever: 'Штурвал люка Бориса',
  labelBulkheadLever: 'Рычаг переборки тревоги',
  labelBorisMug: 'Ламповая кружка Бориса',
  labelScrapShard: 'Светящаяся раковина',
  labelWhaleContainer: 'Контейнер резонанса китов',
  labelLuminaryPearl: 'Глубинная люминар-жемчужина',
  labelEggAltar: 'Алтарь Бирюзового сердца',

  modalVictoryTitleCh1: '«...мама?..»',
  modalVictoryTitleCh2: '«...шёпот глубин...»',
  modalVictoryTitleCh3: '«...кости гигантов внизу...»',
  modalVictoryTitleCh4: '«...тёплое дыхание бездны...»',
  modalVictoryTitleCh5: '«...у самого сердца бездны...»',
  modalVictoryTitleCh6: '«Вместе наверх!»',
  modalVictoryTitleCh7: '«Песнь свободного кита»',
  modalVictoryTitleCh8: '«Споры в темноте»',
  modalVictoryTitleCh9: '«Прорыв к солнцу»',
  modalVictoryTitleCh10: '«С возвращением домой, искорка»',
  modalVictoryDescCh1:
    'Вы проскользнули сквозь окна сети траулера и вышли к биолюминесцентной расщелине. Прогресс сохранён — открыта Глава 2: «Поющий кит».',
  modalVictoryDescCh2:
    'Вы вернули кружку Борису, минули Пафнутия и открыли створку «Пеликан». Затонувший лайнер позади — открыта Глава 3: «Мёртвый шёпот».',
  modalVictoryDescCh3:
    'Вы помогли Крабам-отшельникам поднять завал, миновали тени гигантских водорослей и открыли Главу 4: «Кладбище левиафанов».',
  modalVictoryDescCh4:
    'Вы добыли Контейнер резонанса для Крабов-критиков, открыли кран Харибда и вышли к тёплым гидротермальным источникам.',
  modalVictoryDescCh5:
    'Под защитой Королевы-удильщицы вы прошли мимо извергающихся Чёрных курильщиков прямо к порогу Бирюзового сердца.',
  modalVictoryDescCh6:
    'Икринка снова с вами! Оглушающий Зов подъёма открыт — начинается стремительный путь из бездны домой.',
  modalVictoryDescCh7:
    'Вы освободили Китёнка от старого троса и поднялись на его поющих течениях к верхнему лесу ламинарий.',
  modalVictoryDescCh8:
    'Сияние вашей икринки зажгло споровые фонари ламинарий и вывело к тайному люку Осьминога Бориса.',
  modalVictoryDescCh9:
    'Крик попугая Кеши сбил погоню с толку, а Пафнутий подсказал выход к солнечным лучам над обшивкой лайнера.',
  modalVictoryDescCh10:
    'Под золотыми лучами Тихого рифа икринка раскрывается — мама-рыбка и её сияющий малыш наконец дома!',
  modalDefeatEyebrow: 'Кислород иссяк',
  modalDefeatTitle: '{chapter} не отпускает',
  modalDefeatDesc:
    'Хищник загнал вас в угол, но весь собранный жемчуг остался при вас. Возвращаемся ко входу в текущую зону.',
  modalPauseEyebrow: 'Погружение на паузе',
  modalPauseDesc:
    'Вы всегда можете перевести дыхание, заглянуть в магазин жемчужин, настроить графику и управление или начать главу заново.',
  statTime: 'Время',
  statMet: 'Знакомства',
  statDeaths: 'Смертей',
  btnResume: 'Продолжить',
  btnPearlShop: 'Магазин жемчужин ({pearls})',
  btnNextChapter2: 'Перейти к Главе 2: «Поющий кит»',
  btnNextChapter3: 'Перейти к Главе 3: «Мёртвый шёпот»',
  btnNextChapter4: 'Перейти к Главе 4: «Кладбище левиафанов»',
  btnNextChapter5: 'Перейти к Главе 5: «Чёрные курильщики»',
  btnNextChapter6: 'Перейти к Главе 6: «Бирюзовое сердце»',
  btnNextChapter7: 'Перейти к Главе 7: «Прорыв из бездны»',
  btnNextChapter8: 'Перейти к Главе 8: «Ламинариевый мятеж»',
  btnNextChapter9: 'Перейти к Главе 9: «Поющий кит. Тревога»',
  btnNextChapter10: 'Перейти к Главе 10: «Наверх. Тихий риф»',
  btnRespawn: 'К чек-поинту зоны',
  btnPlayAgain: 'Пройти главу заново',
  btnRestartChapter: 'Начать главу сначала',
  btnReturnMenu: 'В главное меню',

  settingsEyebrow: 'Параметры погружения',
  settingsTitle: 'Настройки и управление',
  tabGeneral: 'Язык, сложность и графика',
  tabControls: 'Клавиатура и мышь',
  labelLanguage: 'Язык игры',
  labelDifficulty: 'Уровень сложности',
  diffCalmName: 'Спокойный',
  diffCalmDesc: 'Мягкие хищники и меньше урона',
  diffStandardName: 'Обычный',
  diffStandardDesc: 'Сбалансированный глубоководный стелс',
  diffAbyssalName: 'Бездна',
  diffAbyssalDesc: 'Быстрые хищники и суровые течения',
  labelQuality: 'Качество графики',
  qualVeryLow: 'Минимум',
  qualLow: 'Низкое',
  qualMedium: 'Среднее',
  qualHigh: 'Высокое',
  qualUltra: 'Ультра',
  labelTouchControls: 'Сенсорное управление (телефон / планшет)',
  touchAuto: 'Авто',
  touchOn: 'Всегда вкл.',
  touchOff: 'Выкл.',
  labelMusicVol: 'Громкость музыки',
  labelSfxVol: 'Громкость эффектов',
  sectionKeyboard: 'Клавиатура',
  kbEnabledLabel: 'Управление движением с клавиатуры',
  kbEnabledHint: 'Если отключено — движение только мышью или сенсором',
  kbTurnSpeedLabel: 'Скорость поворота клавиатурой',
  kbRebindTitle: 'Переназначение клавиш (нажмите и выберите новую)',
  pressKeyPrompt: 'Клавиша...',
  sectionMouse: 'Мышь и камера',
  mouseEnabledLabel: 'Управление мышью',
  mouseEnabledHint: 'Орбита камеры, зум (колесо), панорамирование (СКМ/Alt), клики',
  mouseLookModeLabel: 'Режим обзора мышью',
  mouseModeAlways: 'Свободный обзор движением мыши',
  mouseModeDrag: 'Поворот при зажатой кнопке мыши',
  mouseModeLock: 'Захват курсора (прицел в центре)',
  mouseRebindTitle: 'Переназначение кнопок мыши',
  mouseInvertYLabel: 'Инверсия мыши по вертикали',
  mouseSensLabel: 'Чувствительность мыши',
  mouseCameraTip:
    'Колесо мыши — зум · СКМ или Alt+перетаскивание — панорама · Двойной СКМ — сброс вида · Полный экран: {fsKey}.',
  btnReset: 'Сбросить',
  btnDone: 'Готово',
  btnNext: 'Далее',
  btnBack: 'Назад',

  actForward: 'Плыть вперёд',
  actBackward: 'Тормоз / назад',
  actTurnLeft: 'Поворот влево',
  actTurnRight: 'Поворот вправо',
  actAscend: 'Всплыть вверх',
  actDescend: 'Погрузиться вниз',
  actCall: 'Зов (эхолокация)',
  actDash: 'Рывок (Глава 2+)',
  actStopFish: 'Остановить рыбку',
  actPause: 'Пауза',
  actRestart: 'Начать главу заново',
  actMute: 'Звук вкл./выкл.',
  actFullscreen: 'Полный экран',
  mActMoveToPoint: 'Плыть к целеуказателю',
  mActHoldSwim: 'Удержание — плыть вперёд',
  mActInteract: 'Взаимодействие с объектом',
  mBindLMB: 'ЛКМ (левая)',
  mBindDBL: 'Двойной клик ЛКМ',
  mBindRMB: 'ПКМ (правая)',
  mBindMMB: 'СКМ (колёсико)',
  mBindNONE: 'Отключено',
  keySpace: 'Пробел',

  shopEyebrow: 'Убежище мамы-рыбки',
  shopTitle: 'Магазин жемчужин',
  shopSkinsTitle: 'Облики биолюминесценции',
  shopUpgradesTitle: 'Улучшения и навыки укрытия',
  shopActive: 'Активен',
  shopEquip: 'Надеть',
  shopUnlock: 'Открыть · {cost}',
  shopOwned: 'Куплено',
  shopBuy: 'Купить · {cost}',
  skinTurquoiseName: 'Бирюзовый Зов',
  skinTurquoiseDesc: 'Родное свечение мамы-рыбки.',
  skinPearlName: 'Жемчужный блик',
  skinPearlDesc: 'Яркий свет: удильщики охотнее ведутся на приманку.',
  skinCharcoalName: 'Угольная тень',
  skinCharcoalDesc: 'Приглушённое свечение: хищники хуже замечают вас в темноте.',
  upgCoralName: 'Коралловая вуаль',
  upgCoralDesc: 'Укрытия быстрее гасят свечение мамы и икринки.',
  upgFinsName: 'Бесшумные плавники',
  upgFinsDesc: 'Снижает шум плавания рядом со спящими существами и Пафнутием.',

  npcMildredName: 'Медуза Милдред',
  npcMildredL1: 'Молодёжь совсем летать разучилась.',
  npcMildredL2: 'Аккуратнее! Разучишься чуять — жми E (Зов).',
  npcShrimpsName: 'Креветки-паникёры',
  npcShrimpsL1: 'УЧЕБНАЯ ТРЕВОГА! Прячьтесь в коралл!',
  npcShrimpsL2: 'Держись в розовых ветвях, пока кальмар мимо пройдёт!',
  npcShrimpsPanic1: 'Эй, хулиганка! Мы устали прятаться!',
  npcShrimpsPanic2: 'Уходим в щель на минутку!',
  npcBorisName: 'Осьминог Борис',
  npcBorisL1: 'Потерял любимую кружку, она ламповая.',
  npcBorisL2: 'Найдёшь на камбузе — покажу тайный ход!',
  npcBorisDone1: 'Вот это да! Моя ламповая кружка цела!',
  npcBorisDone2: 'Открываю створку «Пеликан» и дарю тебе Рывок!',
  npcPafnutiyName: 'Рыба-шар Пафнутий',
  npcPafnutiyL1: 'Тише! Я от любого шума раздуваюсь!',
  npcPafnutiyL2: 'Не гони мимо, а то вышибу в соседний трюм!',
  npcPafnutiyPanic1: 'СЛИШКОМ БЫСТРО! РАЗДУВАЮСЬ!',
  npcPafnutiyPanic2: 'Шум разнёсся по камбузу — держись!',
  npcHermitCrabsName: 'Крабы-отшельники',
  npcHermitCrabsL1: 'Старый кран завалил проход! Собери 3 светящиеся раковины.',
  npcHermitCrabsL2: 'Отдай их нам или сразу потяни рычаг лебёдки крана!',
  npcHermitCrabsDone1: 'Щёлк-щёлк! Противовес встал как родной!',
  npcHermitCrabsDone2: 'Завал поднят — плыви вглубь ламинариевого леса!',
  npcCriticCrabsName: 'Крабы-критики',
  npcCriticCrabsL1: 'Хм! Кран «Харибда» не сдвинется без Контейнера резонанса китов!',
  npcCriticCrabsL2: 'Принеси его со склона черепа кашалота или потяни рычаг крана!',
  npcCriticCrabsDone1: 'Изумительный тембр! Пять звёзд за бесшумный проплыв!',
  npcCriticCrabsDone2: 'Шлюз «Харибда» открыт — плыви к тёплым термальным источникам!',
  npcGlafiraName: 'Черепаха Глафира',
  npcGlafiraL1: 'Гигантские водоросли шепчут, когда рядом рыщет Шёпотный хищник.',
  npcGlafiraL2: 'Прячься под светящимися корнями ламинарии, пока его взгляд не угаснет.',
  npcQueenName: 'Королева-удильщица',
  npcQueenL1: 'Смелая бирюзовая искорка у самых Чёрных курильщиков!',
  npcQueenL2: 'Принеси Глубинную люминар-жемчужину — провожу к Бирюзовому сердцу.',
  npcQueenDone1: 'Умница! Держись позади моего фонаря — я отвлеку хищника!',
  npcQueenDone2: 'Термальный шлюз открыт — плыви прямо к своей икринке!',
  npcYoungWhaleName: 'Китёнок Поющий',
  npcYoungWhaleL1: 'У-у-у... Старый трос зацепил мой плавник у засова!',
  npcYoungWhaleL2: 'Поверни клапан сброса и освободи меня — я открою путь наверх!',
  npcYoungWhaleDone1: 'У-У-У! На свободе! Моя песня разгоняет кальмаров!',
  npcYoungWhaleDone2: 'Держись восходящих струй к Ламинариевому мятежу!',
  npcKeshaName: 'Рыба-попугай Кеша',
  npcKeshaL1: 'КР-Р-РА! Тревога в трюме! Кто так ярко светится?!',
  npcKeshaL2: 'Подай Зов [E] рядом со мной — крикну так, что переборка откроется!',
  npcKeshaDone1: 'КР-Р-РА-БАХ! Моё эхо потрясло весь трюм!',
  npcKeshaDone2: 'Переборка открыта — лети к солнцу Тихого рифа!',

  btnJournal: 'Дневник глубин',
  journalEyebrow: 'Хроника Бездны',
  journalTitle: 'Реликвии и Бестиарий',
  journalTabRelics: 'Реликвии лора',
  journalTabCodex: 'Бестиарий глубин',
  journalLockedRelic: 'Реликвия не найдена — подай Зов [E] в главе, чтобы уловить отблеск.',
  journalLockedCodex: 'Запись закрыта — встреть существо или доплыви до его глубины.',
  journalCollectedCount: 'Найдено {count}/{total}',
  statRank: 'Ранг',
  rankSBonus: 'Бонус за первый ранг S: +2 жемчужины!',
  hudEggResonance: 'Резонанс икринки',
  labelLoreRelic: 'Реликвия хроники',
  toastLoreRelicCollected: 'Найдена реликвия: {title} (+2 жемч.)!',
  toastEggResonance: 'Резонанс икринки: восстановление O₂ ×2 и мягкая аура!',
  sectionAccessibility: 'Доступность и интерфейс',
  labelUiScale: 'Масштаб интерфейса',
  labelReducedEffects: 'Уменьшить тряску камеры и вспышки',
  labelReducedEffectsHint: 'Сохраняет все подсказки без резких движений и блеска',
  labelHighContrastSymbols: 'Контрастные символы (для дальтоников)',
  labelHighContrastSymbolsHint: 'Добавляет чёткие формы к цветовым индикаторам',
  hudCompassObjective: 'Эхо-курс',
  mobileRadialActions: 'Навыки',
  toastSanctuaryBlessing: 'Дар реликвии: O₂ восполнен и Зов готов!',
};

function makeLocale(overrides: Partial<LocaleStrings>): LocaleStrings {
  return { ...EN, ...overrides };
}

const FR = makeLocale({
  gameTitleLine1: 'Berceuse',
  gameTitleLine2: 'Abyssale',
  titleTagline: 'Le filet du chalutier racle le récif. Suivez l’Appel turquoise, cachez-vous dans les coraux et ne perdez pas votre œuf.',
  saveBadge: 'Sauvegarde · Chapitre {chapter} · {pearls} perles',
  chapter1Short: 'Chapitre 1',
  chapter1Title: 'Récif Calme',
  chapter1Sub: 'Haut-fonds · Prologue',
  chapter2Short: 'Chapitre 2',
  chapter2Title: 'La Baleine Chantante',
  chapter2Sub: 'Récif crépusculaire et paquebot coulé',
  chapter3Short: 'Chapitre 3',
  chapter3Title: 'Murmure Morte',
  chapter3Sub: 'Forêt de Laminaires Géantes',
  chapter4Short: 'Chapitre 4',
  chapter4Title: 'Cimetière des Léviathans',
  chapter4Sub: 'Os de baleines et Grue Charybde',
  btnContinueDive: 'Continuer la plongée',
  btnStartDive: 'Plonger',
  btnShop: 'Sanctuaire ({pearls})',
  btnNewGame: 'Nouvelle partie',
  btnSettings: 'Paramètres et contrôles',
  btnFullscreen: 'Plein écran',
  btnExitFullscreen: 'Quitter le plein écran',
  btnWindowedShort: 'Fenêtre',
  btnMainMenu: 'Menu principal',
  hudChapterPrefix: 'CH.',
  hudPearls: 'Perles',
  hudHidden: 'Cachée · Indétectée',
  hudDash: 'Élan',
  hudCall: 'Appel',
  hudReady: 'Prêt',
  hudPauseLabel: 'Pause',
  btnResume: 'Reprendre',
  btnRestartChapter: 'Recommencer le chapitre',
  btnReturnMenu: 'Retour au menu',
  settingsTitle: 'Paramètres et contrôles',
  tabGeneral: 'Langue, Difficulté & Graphismes',
  tabControls: 'Clavier et Souris',
  labelLanguage: 'Langue',
  labelDifficulty: 'Difficulté',
  diffCalmName: 'Calme',
  diffStandardName: 'Normal',
  diffAbyssalName: 'Abyssal',
  labelQuality: 'Qualité graphique',
  qualVeryLow: 'Très bas',
  qualLow: 'Bas',
  qualMedium: 'Moyen',
  qualHigh: 'Élevé',
  qualUltra: 'Ultra',
  btnDone: 'Terminer',
  btnNext: 'Suivant',
  btnBack: 'Retour',
  btnReset: 'Réinitialiser',
  keySpace: 'Espace',
});

const DE = makeLocale({
  gameTitleLine1: 'Abgrund',
  gameTitleLine2: 'Wiegenlied',
  titleTagline: 'Das Schleppnetz zieht über das Riff. Folge dem türkisen Ruf, verbirg dich in Korallen und verliere dein Ei nicht.',
  saveBadge: 'Speicherstand · Kapitel {chapter} · {pearls} Perlen',
  chapter1Short: 'Kapitel 1',
  chapter1Title: 'Stilles Riff',
  chapter1Sub: 'Flachwasser · Prolog',
  chapter2Short: 'Kapitel 2',
  chapter2Title: 'Der Singende Wal',
  chapter2Sub: 'Dämmerungsriff & Gesunkener Liner',
  chapter3Short: 'Kapitel 3',
  chapter3Title: 'Totes Flüstern',
  chapter3Sub: 'Riesentangwald',
  chapter4Short: 'Kapitel 4',
  chapter4Title: 'Friedhof der Leviathane',
  chapter4Sub: 'Walknochen & Charybdis-Kran',
  btnContinueDive: 'Tauchgang fortsetzen',
  btnStartDive: 'Tauchgang starten',
  btnShop: 'Perlenhort ({pearls})',
  btnNewGame: 'Neues Spiel',
  btnSettings: 'Einstellungen & Steuerung',
  btnFullscreen: 'Vollbild',
  btnExitFullscreen: 'Vollbild verlassen',
  btnWindowedShort: 'Fenster',
  btnMainMenu: 'Hauptmenü',
  hudChapterPrefix: 'KAP.',
  hudPearls: 'Perlen',
  hudHidden: 'Versteckt · Unentdeckt',
  hudDash: 'Stoß',
  hudCall: 'Ruf',
  hudReady: 'Bereit',
  hudPauseLabel: 'Pause',
  btnResume: 'Fortsetzen',
  btnRestartChapter: 'Kapitel neu starten',
  btnReturnMenu: 'Zurück zum Hauptmenü',
  settingsTitle: 'Einstellungen & Steuerung',
  tabGeneral: 'Sprache, Schwierigkeit & Grafik',
  tabControls: 'Tastatur & Maus',
  labelLanguage: 'Sprache',
  labelDifficulty: 'Schwierigkeit',
  diffCalmName: 'Ruhig',
  diffStandardName: 'Standard',
  diffAbyssalName: 'Abyssal',
  labelQuality: 'Grafikqualität',
  qualVeryLow: 'Sehr niedrig',
  qualLow: 'Niedrig',
  qualMedium: 'Mittel',
  qualHigh: 'Hoch',
  qualUltra: 'Ultra',
  btnDone: 'Fertig',
  btnNext: 'Weiter',
  btnBack: 'Zurück',
  btnReset: 'Zurücksetzen',
  keySpace: 'Leertaste',
});

const ES = makeLocale({
  gameTitleLine1: 'Arrullo',
  gameTitleLine2: 'Abisal',
  titleTagline: 'La red del arrastrero roza el arrecife. Sigue la Llamada turquesa, escóndete en los corales y protege tu huevo en el abismo.',
  saveBadge: 'Guardado · Capítulo {chapter} · {pearls} perlas',
  chapter1Short: 'Capítulo 1',
  chapter1Title: 'Arrecife Sereno',
  chapter2Short: 'Capítulo 2',
  chapter2Title: 'La Ballena Cantora',
  chapter3Short: 'Capítulo 3',
  chapter3Title: 'Susurro Muerto',
  chapter4Short: 'Capítulo 4',
  chapter4Title: 'Cementerio de Leviatanes',
  btnContinueDive: 'Continuar inmersión',
  btnStartDive: 'Iniciar inmersión',
  btnShop: 'Santuario ({pearls})',
  btnNewGame: 'Nueva partida',
  btnSettings: 'Ajustes y controles',
  btnFullscreen: 'Pantalla completa',
  btnExitFullscreen: 'Salir de pantalla completa',
  btnMainMenu: 'Menú principal',
  hudChapterPrefix: 'CAP.',
  hudPearls: 'Perlas',
  hudHidden: 'Oculta · Sin rastro',
  hudDash: 'Impulso',
  hudCall: 'Llamada',
  hudReady: 'Listo',
  btnResume: 'Reanudar',
  btnRestartChapter: 'Reiniciar capítulo',
  btnReturnMenu: 'Volver al menú principal',
  settingsTitle: 'Ajustes y controles',
  tabGeneral: 'Idioma, Dificultad y Gráficos',
  tabControls: 'Teclado y Ratón',
  labelLanguage: 'Idioma',
  labelDifficulty: 'Dificultad',
  diffCalmName: 'Calma',
  diffStandardName: 'Estándar',
  diffAbyssalName: 'Abisal',
  labelQuality: 'Calidad gráfica',
  qualVeryLow: 'Muy baja',
  qualLow: 'Baja',
  qualMedium: 'Media',
  qualHigh: 'Alta',
  qualUltra: 'Ultra',
  btnDone: 'Listo',
  btnNext: 'Siguiente',
  btnBack: 'Atrás',
  btnReset: 'Restablecer',
  keySpace: 'Espacio',
});

const PT = makeLocale({
  gameTitleLine1: 'Canção',
  gameTitleLine2: 'Abissal',
  titleTagline: 'A rede de arrasto ameaça o recife. Siga o Chamado turquesa, esconda-se nos corais e proteja seu ovo no abismo.',
  saveBadge: 'Salvo · Capítulo {chapter} · {pearls} pérolas',
  chapter1Short: 'Capítulo 1',
  chapter1Title: 'Recife Silencioso',
  chapter2Short: 'Capítulo 2',
  chapter2Title: 'A Baleia Cantora',
  chapter3Short: 'Capítulo 3',
  chapter3Title: 'Sussurro Morto',
  chapter4Short: 'Capítulo 4',
  chapter4Title: 'Cemitério dos Leviatãs',
  btnContinueDive: 'Continuar mergulho',
  btnStartDive: 'Iniciar mergulho',
  btnShop: 'Santuário ({pearls})',
  btnNewGame: 'Novo jogo',
  btnSettings: 'Configurações e controles',
  btnFullscreen: 'Tela cheia',
  btnExitFullscreen: 'Sair da tela cheia',
  btnMainMenu: 'Menu principal',
  hudChapterPrefix: 'CAP.',
  hudPearls: 'Pérolas',
  hudHidden: 'Oculta · Invisível',
  hudDash: 'Impulso',
  hudCall: 'Chamado',
  hudReady: 'Pronto',
  btnResume: 'Continuar',
  btnRestartChapter: 'Reiniciar capítulo',
  btnReturnMenu: 'Voltar ao menu',
  settingsTitle: 'Configurações e controles',
  tabGeneral: 'Idioma, Dificuldade e Gráficos',
  tabControls: 'Teclado e Mouse',
  labelLanguage: 'Idioma',
  labelDifficulty: 'Dificuldade',
  diffCalmName: 'Calmo',
  diffStandardName: 'Padrão',
  diffAbyssalName: 'Abissal',
  labelQuality: 'Qualidade gráfica',
  qualVeryLow: 'Muito baixa',
  qualLow: 'Baixa',
  qualMedium: 'Média',
  qualHigh: 'Alta',
  qualUltra: 'Ultra',
  btnDone: 'Concluir',
  btnNext: 'Próximo',
  btnBack: 'Voltar',
  btnReset: 'Redefinir',
  keySpace: 'Espaço',
});

const ZH = makeLocale({
  gameTitleLine1: '深渊',
  gameTitleLine2: '摇篮曲',
  titleTagline: '拖网正逼近珊瑚礁边缘。追随青绿呼唤，藏身活珊瑚丛中，在深海护住失落的鱼卵。',
  saveBadge: '存档 · 第 {chapter} 章 · {pearls} 颗珍珠',
  chapter1Short: '第 1 章',
  chapter1Title: '静谧珊瑚礁',
  chapter1Sub: '浅海 · 序章',
  chapter2Short: '第 2 章',
  chapter2Title: '吟唱巨鲸',
  chapter2Sub: '暮光礁石与沉没邮轮',
  chapter3Short: '第 3 章',
  chapter3Title: '死寂低语',
  chapter3Sub: '巨藻森林',
  chapter4Short: '第 4 章',
  chapter4Title: '利维坦墓地',
  chapter4Sub: '巨鲸骸骨与卡律布狄斯起重机',
  btnContinueDive: '继续潜行',
  btnStartDive: '开始潜行',
  btnShop: '珍珠圣所 ({pearls})',
  btnNewGame: '新游戏',
  btnSettings: '设置与控制',
  btnFullscreen: '全屏',
  btnExitFullscreen: '退出全屏',
  btnWindowedShort: '窗口',
  btnMainMenu: '主菜单',
  hudChapterPrefix: '第',
  hudMetersUnit: '米',
  hudPearls: '珍珠',
  hudHidden: '已隐蔽 · 未被察觉',
  hudDash: '冲刺',
  hudCall: '呼唤',
  hudReady: '就绪',
  hudSecUnit: '秒',
  btnResume: '继续游戏',
  btnRestartChapter: '重开本章',
  btnReturnMenu: '返回主菜单',
  settingsTitle: '设置与控制',
  tabGeneral: '语言、难度与画质',
  tabControls: '键盘与鼠标',
  labelLanguage: '语言',
  labelDifficulty: '难度',
  diffCalmName: '宁静',
  diffStandardName: '标准',
  diffAbyssalName: '深渊',
  labelQuality: '画质预设',
  qualVeryLow: '极低',
  qualLow: '低',
  qualMedium: '中',
  qualHigh: '高',
  qualUltra: '极致',
  btnDone: '完成',
  btnNext: '下一页',
  btnBack: '上一页',
  btnReset: '重置默认',
  keySpace: '空格',
});

const AR = makeLocale({
  gameTitleLine1: 'تهويدة',
  gameTitleLine2: 'الأعماق',
  titleTagline: 'شبكة الجرف تقترب من حافة الشعاب. اتبع النداء الفيروزي، واختبئ داخل المرجان الحي ولا تفقد بيضتك في الهاوية.',
  saveBadge: 'حفظ · الفصل {chapter} · {pearls} لؤلؤة',
  chapter1Short: 'الفصل 1',
  chapter1Title: 'الشعاب الهادئة',
  chapter1Sub: 'المياه الضحلة · المقدمة',
  chapter2Short: 'الفصل 2',
  chapter2Title: 'الحوت المغني',
  chapter2Sub: 'شعاب الشفق والسفينة الغارقة',
  chapter3Short: 'الفصل 3',
  chapter3Title: 'الهمس الميت',
  chapter3Sub: 'غابة عشب البحر العملاق',
  chapter4Short: 'الفصل 4',
  chapter4Title: 'مقبرة اللوياثان',
  chapter4Sub: 'عظام الحيتان ورافعة خاريبديس',
  btnContinueDive: 'متابعة الغوص',
  btnStartDive: 'بدء الغوص',
  btnShop: 'ملاذ اللؤلؤ ({pearls})',
  btnNewGame: 'لعبة جديدة',
  btnSettings: 'الإعدادات والتحكم',
  btnFullscreen: 'ملء الشاشة',
  btnExitFullscreen: 'إنهاء ملء الشاشة',
  btnWindowedShort: 'نافذة',
  btnMainMenu: 'القائمة الرئيسية',
  hudChapterPrefix: 'فصل',
  hudMetersUnit: 'م',
  hudPearls: 'اللآلئ',
  hudHidden: 'مختبئة · غير مرئية',
  hudDash: 'اندفاع',
  hudCall: 'نداء',
  hudReady: 'جاهز',
  hudSecUnit: 'ث',
  btnResume: 'استئناف',
  btnRestartChapter: 'إعادة الفصل',
  btnReturnMenu: 'العودة للقائمة الرئيسية',
  settingsTitle: 'الإعدادات والتحكم',
  tabGeneral: 'اللغة والصعوبة والرسومات',
  tabControls: 'لوحة المفاتيح والفأرة',
  labelLanguage: 'اللغة',
  labelDifficulty: 'مستوى الصعوبة',
  diffCalmName: 'هادئ',
  diffStandardName: 'قياسي',
  diffAbyssalName: 'سحيق',
  labelQuality: 'جودة الرسومات',
  qualVeryLow: 'منخفضة جداً',
  qualLow: 'منخفضة',
  qualMedium: 'متوسطة',
  qualHigh: 'عالية',
  qualUltra: 'فائقة',
  btnDone: 'تم',
  btnNext: 'التالي',
  btnBack: 'رجوع',
  btnReset: 'استعادة الافتراضي',
  keySpace: 'مسافة',
});

const UK = makeLocale({
  gameTitleLine1: 'Глибоководна',
  gameTitleLine2: 'рибка',
  titleTagline: 'Сітка траулера ось-ось зірветься з краю рифу. Прямуй за бірюзовим Покликом, ховайся в коралах і не втрать ікринку в безодні.',
  saveBadge: 'Збереження · Розділ {chapter} · {pearls} перл.',
  chapter1Short: 'Розділ 1',
  chapter1Title: 'Тихий риф',
  chapter1Sub: 'Мілководдя · Пролог',
  chapter2Short: 'Розділ 2',
  chapter2Title: 'Співочий кит',
  chapter2Sub: 'Сутінковий риф і затонулий лайнер',
  chapter3Short: 'Розділ 3',
  chapter3Title: 'Мертвий шепіт',
  chapter3Sub: 'Ліс гігантських водоростей',
  chapter4Short: 'Розділ 4',
  chapter4Title: 'Кладовище левіафанів',
  chapter4Sub: 'Китові ребра та кран Харибда',
  btnContinueDive: 'Продовжити занурення',
  btnStartDive: 'Почати занурення',
  btnShop: 'Сховок ({pearls})',
  btnNewGame: 'Нова гра',
  btnSettings: 'Налаштування й керування',
  btnFullscreen: 'На весь екран',
  btnExitFullscreen: 'Вийти з повного екрана',
  btnWindowedShort: 'Вікно',
  btnMainMenu: 'Головне меню',
  hudChapterPrefix: 'РЗД.',
  hudMetersUnit: 'М',
  hudPearls: 'Перлини',
  hudHidden: 'У схованці · Непомітна',
  hudDash: 'Ривок',
  hudCall: 'Поклик',
  hudReady: 'Готовий',
  hudSecUnit: 'с',
  btnResume: 'Продовжити',
  btnRestartChapter: 'Перезапустити розділ',
  btnReturnMenu: 'До головного меню',
  settingsTitle: 'Налаштування й керування',
  tabGeneral: 'Мова, складність і графіка',
  tabControls: 'Клавіатура й миша',
  labelLanguage: 'Мова',
  labelDifficulty: 'Складність',
  diffCalmName: 'Спокійна',
  diffStandardName: 'Звичайна',
  diffAbyssalName: 'Безодня',
  labelQuality: 'Якість графіки',
  qualVeryLow: 'Мінімум',
  qualLow: 'Низька',
  qualMedium: 'Середня',
  qualHigh: 'Висока',
  qualUltra: 'Ультра',
  btnDone: 'Готово',
  btnNext: 'Далі',
  btnBack: 'Назад',
  btnReset: 'Скинути',
  keySpace: 'Пробіл',
});

const JA = makeLocale({
  gameTitleLine1: '深海の',
  gameTitleLine2: '子守唄',
  titleTagline: 'トロール網が珊瑚礁の縁に迫る。碧い「呼び声」を辿り、珊瑚に身を潜め、深淵で卵を守り抜け。',
  saveBadge: 'セーブ · 第{chapter}章 · 真珠 {pearls}',
  chapter1Short: '第1章',
  chapter1Title: '静かな珊瑚礁',
  chapter2Short: '第2章',
  chapter2Title: '歌うクジラ',
  chapter3Short: '第3章',
  chapter3Title: '死者の囁き',
  chapter4Short: '第4章',
  chapter4Title: 'リヴァイアサンの墓場',
  btnContinueDive: '潜水を続ける',
  btnStartDive: '潜水を始める',
  btnShop: '真珠の聖域 ({pearls})',
  btnNewGame: 'ニューゲーム',
  btnSettings: '設定・操作',
  btnFullscreen: '全画面',
  btnExitFullscreen: '全画面解除',
  btnMainMenu: 'メインメニュー',
  hudChapterPrefix: 'CH.',
  hudPearls: '真珠',
  hudHidden: '隠密中',
  hudDash: 'ダッシュ',
  hudCall: '呼び声',
  hudReady: '準備完了',
  btnResume: '再開',
  btnRestartChapter: '章をやり直す',
  btnReturnMenu: 'メインメニューへ',
  settingsTitle: '設定と操作',
  tabGeneral: '言語・難易度・画質',
  tabControls: 'キーボードとマウス',
  labelLanguage: '言語',
  labelDifficulty: '難易度',
  diffCalmName: '穏やか',
  diffStandardName: '標準',
  diffAbyssalName: '深淵',
  labelQuality: '画質プリセット',
  qualVeryLow: '最低',
  qualLow: '低',
  qualMedium: '中',
  qualHigh: '高',
  qualUltra: '最高',
  btnDone: '完了',
  btnNext: '次へ',
  btnBack: '戻る',
  btnReset: 'リセット',
  keySpace: 'Space',
});

const PL = makeLocale({
  gameTitleLine1: 'Głębinowa',
  gameTitleLine2: 'Kołysanka',
  titleTagline: 'Sieć trawlera sunie po krawędzi rafy. Podążaj za turkusowym Zewem, kryj się w koralowcach i ocal swoją ikrę.',
  saveBadge: 'Zapis · Rozdział {chapter} · {pearls} pereł',
  chapter1Short: 'Rozdział 1',
  chapter1Title: 'Cicha Rafa',
  chapter2Short: 'Rozdział 2',
  chapter2Title: 'Śpiewający Wieloryb',
  chapter3Short: 'Rozdział 3',
  chapter3Title: 'Martwy Szept',
  chapter4Short: 'Rozdział 4',
  chapter4Title: 'Cmentarzysko Lewiatanów',
  btnContinueDive: 'Kontynuuj nurkowanie',
  btnStartDive: 'Rozpocznij nurkowanie',
  btnShop: 'Sanktuarium ({pearls})',
  btnNewGame: 'Nowa gra',
  btnSettings: 'Ustawienia i sterowanie',
  btnFullscreen: 'Pełny ekran',
  btnExitFullscreen: 'Opuść pełny ekran',
  btnMainMenu: 'Menu główne',
  hudChapterPrefix: 'ROZ.',
  hudPearls: 'Perły',
  hudHidden: 'Ukryta · Niewykryta',
  hudDash: 'Zryw',
  hudCall: 'Zew',
  hudReady: 'Gotowy',
  btnResume: 'Wznów',
  btnRestartChapter: 'Zacznij rozdział od nowa',
  btnReturnMenu: 'Wróć do menu głównego',
  settingsTitle: 'Ustawienia i sterowanie',
  tabGeneral: 'Język, Poziom i Grafika',
  tabControls: 'Klawiatura i Mysz',
  labelLanguage: 'Język',
  labelDifficulty: 'Poziom trudności',
  diffCalmName: 'Spokojny',
  diffStandardName: 'Standardowy',
  diffAbyssalName: 'Otchłań',
  labelQuality: 'Jakość grafiki',
  qualVeryLow: 'Bardzo niska',
  qualLow: 'Niska',
  qualMedium: 'Średnia',
  qualHigh: 'Wysoka',
  qualUltra: 'Ultra',
  btnDone: 'Gotowe',
  btnNext: 'Dalej',
  btnBack: 'Wstecz',
  btnReset: 'Resetuj',
  keySpace: 'Spacja',
});

const IT = makeLocale({
  gameTitleLine1: 'Ninna Nanna',
  gameTitleLine2: 'Abissale',
  titleTagline: 'La rete a strascico sfiora la barriera. Segui il Richiamo turchese, ripararti tra i coralli e proteggi il tuo uovo nell’abisso.',
  saveBadge: 'Salvataggio · Capitolo {chapter} · {pearls} perle',
  chapter1Short: 'Capitolo 1',
  chapter1Title: 'Barriera Silenziosa',
  chapter2Short: 'Capitolo 2',
  chapter2Title: 'La Balena Cantante',
  chapter3Short: 'Capitolo 3',
  chapter3Title: 'Sussurro Morto',
  chapter4Short: 'Capitolo 4',
  chapter4Title: 'Cimitero dei Leviatani',
  btnContinueDive: 'Continua immersione',
  btnStartDive: 'Inizia immersione',
  btnShop: 'Santuario ({pearls})',
  btnNewGame: 'Nuova partita',
  btnSettings: 'Impostazioni e comandi',
  btnFullscreen: 'Schermo intero',
  btnExitFullscreen: 'Esci da schermo intero',
  btnMainMenu: 'Menu principale',
  hudChapterPrefix: 'CAP.',
  hudPearls: 'Perle',
  hudHidden: 'Nascosta',
  hudDash: 'Scatto',
  hudCall: 'Richiamo',
  hudReady: 'Pronto',
  btnResume: 'Riprendi',
  btnRestartChapter: 'Ricomincia capitolo',
  btnReturnMenu: 'Torna al menu principale',
  settingsTitle: 'Impostazioni e comandi',
  tabGeneral: 'Lingua, Difficoltà e Grafica',
  tabControls: 'Tastiera e Mouse',
  labelLanguage: 'Lingua',
  labelDifficulty: 'Difficoltà',
  diffCalmName: 'Calma',
  diffStandardName: 'Standard',
  diffAbyssalName: 'Abissale',
  labelQuality: 'Qualità grafica',
  qualVeryLow: 'Molto bassa',
  qualLow: 'Bassa',
  qualMedium: 'Media',
  qualHigh: 'Alta',
  qualUltra: 'Ultra',
  btnDone: 'Fatto',
  btnNext: 'Avanti',
  btnBack: 'Indietro',
  btnReset: 'Ripristina',
  keySpace: 'Spazio',
});

const VI = makeLocale({
  gameTitleLine1: 'Khúc Hát Ru',
  gameTitleLine2: 'Vực Thẳm',
  titleTagline: 'Lưới tàu đánh cá sắp quét qua rạn san hô. Hãy lần theo Tiếng Gọi ngọc lam, ẩn mình trong san hô sống và giữ an toàn cho trứng cá.',
  saveBadge: 'Đã lưu · Chương {chapter} · {pearls} ngọc trai',
  chapter1Short: 'Chương 1',
  chapter1Title: 'Rạn San Hô Tĩnh Lặng',
  chapter2Short: 'Chương 2',
  chapter2Title: 'Cá Voi Ngân Vang',
  chapter3Short: 'Chương 3',
  chapter3Title: 'Lời Thì Thầm Chết',
  chapter4Short: 'Chương 4',
  chapter4Title: 'Nghĩa Địa Leviathan',
  btnContinueDive: 'Tiếp tục lặn',
  btnStartDive: 'Bắt đầu lặn',
  btnShop: 'Thánh Đường ({pearls})',
  btnNewGame: 'Trò chơi mới',
  btnSettings: 'Cài đặt & Điều khiển',
  btnFullscreen: 'Toàn màn hình',
  btnExitFullscreen: 'Thoát toàn màn hình',
  btnMainMenu: 'Menu chính',
  hudChapterPrefix: 'CH.',
  hudPearls: 'Ngọc trai',
  hudHidden: 'Đang ẩn nấp',
  hudDash: 'Lướt',
  hudCall: 'Tiếng Gọi',
  hudReady: 'Sẵn sàng',
  btnResume: 'Tiếp tục',
  btnRestartChapter: 'Chơi lại chương',
  btnReturnMenu: 'Về Menu chính',
  settingsTitle: 'Cài đặt & Điều khiển',
  tabGeneral: 'Ngôn ngữ, Độ khó & Đồ họa',
  tabControls: 'Bàn phím & Chuột',
  labelLanguage: 'Ngôn ngữ',
  labelDifficulty: 'Độ khó',
  diffCalmName: 'Êm dịu',
  diffStandardName: 'Chuẩn',
  diffAbyssalName: 'Vực thẳm',
  labelQuality: 'Chất lượng đồ họa',
  qualVeryLow: 'Rất thấp',
  qualLow: 'Thấp',
  qualMedium: 'Trung bình',
  qualHigh: 'Cao',
  qualUltra: 'Cực cao',
  btnDone: 'Xong',
  btnNext: 'Tiếp',
  btnBack: 'Quay lại',
  btnReset: 'Đặt lại',
  keySpace: 'Cách',
});

const FA = makeLocale({
  gameTitleLine1: 'لالایی',
  gameTitleLine2: 'ژرفا',
  titleTagline: 'تور صیادان در آستانه صخره‌های مرجانی است. ندای فیروزه‌ای را دنبال کن، در مرجان‌ها پنهان شو و تخم خود را در ژرفا گم نکن.',
  saveBadge: 'ذخیره · فصل {chapter} · {pearls} مروارید',
  chapter1Short: 'فصل ۱',
  chapter1Title: 'صخره خاموش',
  chapter2Short: 'فصل ۲',
  chapter2Title: 'نهنگ آوازه‌خوان',
  chapter3Short: 'فصل ۳',
  chapter3Title: 'زمزمه خاموش',
  chapter4Short: 'فصل ۴',
  chapter4Title: 'گورستان لویاتان‌ها',
  btnContinueDive: 'ادامه غوص',
  btnStartDive: 'آغاز غوص',
  btnShop: 'پناهگاه مروارید ({pearls})',
  btnNewGame: 'بازی جدید',
  btnSettings: 'تنظیمات و کنترل‌ها',
  btnFullscreen: 'تمام‌صفحه',
  btnExitFullscreen: 'خروج از تمام‌صفحه',
  btnMainMenu: 'منوی اصلی',
  hudChapterPrefix: 'فصل',
  hudMetersUnit: 'م',
  hudPearls: 'مروارید',
  hudHidden: 'پنهان · ناپیدا',
  hudDash: 'جهش',
  hudCall: 'ندا',
  hudReady: 'آماده',
  btnResume: 'ادامه',
  btnRestartChapter: 'شروع مجدد فصل',
  btnReturnMenu: 'بازگشت به منوی اصلی',
  settingsTitle: 'تنظیمات و کنترل‌ها',
  tabGeneral: 'زبان، سختی و گرافیک',
  tabControls: 'صفحه‌کلید و ماوس',
  labelLanguage: 'زبان',
  labelDifficulty: 'درجه سختی',
  diffCalmName: 'آرام',
  diffStandardName: 'عادی',
  diffAbyssalName: 'ژرف',
  labelQuality: 'کیفیت گرافیک',
  qualVeryLow: 'بسیار پایین',
  qualLow: 'پایین',
  qualMedium: 'متوسط',
  qualHigh: 'بالا',
  qualUltra: 'فوق‌العاده',
  btnDone: 'تایید',
  btnNext: 'بعدی',
  btnBack: 'قبلی',
  btnReset: 'بازنشانی',
  keySpace: 'فاصله',
});

const ELVISH = makeLocale({
  gameTitleLine1: 'Lirulin',
  gameTitleLine2: 'Númenear',
  titleTagline:
    'I rem en-chîr nathla na i gwaun. Aphado i Canu luin, delio vi erin galad-gorof a ú-chosto i chên lîn vi nûr.',
  saveBadge: 'Pent · Lîn {chapter} · {pearls} maril',
  chapter1Short: 'Lîn I',
  chapter1Title: 'Gorof Dínen',
  chapter1Sub: 'Nén-vorn · Yestë',
  chapter2Short: 'Lîn II',
  chapter2Title: 'I Lingwë Liriel',
  chapter2Sub: 'Tinnu-gorof a Cair Dannen',
  chapter3Short: 'Lîn III',
  chapter3Title: 'Lóme-Lhos',
  chapter3Sub: 'Taur Galad-Rond',
  chapter4Short: 'Lîn IV',
  chapter4Title: 'Haudh-in-Gylf',
  chapter4Sub: 'Ossar Galad-Lim',
  btnContinueDive: 'Brona i Núro',
  btnStartDive: 'Herio i Núro',
  btnShop: 'Iavas Maril ({pearls})',
  btnNewGame: 'Tyalië Vinë',
  btnSettings: 'Tengwesta & Cant',
  btnFullscreen: 'Pann-cened',
  btnExitFullscreen: 'Gwaitho pann-cened',
  btnWindowedShort: 'Henneth',
  btnMainMenu: 'Ost Yestë',
  hudChapterPrefix: 'LÎN',
  hudPearls: 'Maril',
  hudHidden: 'Delian · Ú-gennen',
  hudBorisMug: 'Yulma Boris',
  hudDash: 'Lim',
  hudCall: 'Canu',
  hudReady: 'Tulu',
  btnResume: 'Brona',
  btnRestartChapter: 'Yesto i Lîn',
  btnReturnMenu: 'Ego na Ost Yestë',
  settingsTitle: 'Tengwesta & Cant',
  tabGeneral: 'Lambe, Caun & Calad',
  tabControls: 'Tengwar & Nîr',
  labelLanguage: 'Lambe (Tongue)',
  labelDifficulty: 'Caun (Trial)',
  diffCalmName: 'Sîdh (Calm)',
  diffStandardName: 'Taer (True)',
  diffAbyssalName: 'Udûn (Abyss)',
  labelQuality: 'Calad (LightCraft)',
  qualVeryLow: 'Pítë',
  qualLow: 'Niben',
  qualMedium: 'Ened',
  qualHigh: 'Hall',
  qualUltra: 'Anor-Calad',
  btnDone: 'Mâra',
  btnNext: 'Ad-',
  btnBack: 'Nan',
  btnReset: 'Atha',
  keySpace: 'Lhaw',
});

const ORCISH = makeLocale({
  gameTitleLine1: 'Gûl-Zagh',
  gameTitleLine2: 'Bûrz-Nûl',
  titleTagline:
    'Trawl-snaga net scrapes da reef-edge! Follow da green-glow Yell, skulk in coral-huts, an’ don’t drop yer spawn-egg in da black pit!',
  saveBadge: 'Mark · Raid {chapter} · {pearls} shinies',
  chapter1Short: 'Raid 1',
  chapter1Title: 'Quiet Krag',
  chapter1Sub: 'Shallows · First Hunt',
  chapter2Short: 'Raid 2',
  chapter2Title: 'Howlin’ Leviathan',
  chapter2Sub: 'Dusk Krag & Sunk Iron-Hulk',
  chapter3Short: 'Raid 3',
  chapter3Title: 'Dead Whisper',
  chapter3Sub: 'Big-Weed Jungle',
  chapter4Short: 'Raid 4',
  chapter4Title: 'Bone-Pit o’ Giants',
  chapter4Sub: 'Skull-Ridge & Iron-Claw',
  btnContinueDive: 'Keep Plungin’',
  btnStartDive: 'Plunge In!',
  btnShop: 'Shiny Hoard ({pearls})',
  btnNewGame: 'Fresh Meat',
  btnSettings: 'Wargear & Binds',
  btnFullscreen: 'Big Screen',
  btnExitFullscreen: 'Shrink Screen',
  btnWindowedShort: 'Boxed',
  btnMainMenu: 'War-Camp',
  hudChapterPrefix: 'RAID',
  hudPearls: 'Shinies',
  hudHidden: 'Skulkin’ · Unseen',
  hudBorisMug: 'Boris Groggin’ Mug',
  hudDash: 'Lunge',
  hudCall: 'Holler',
  hudReady: 'Ready!',
  btnResume: 'Back to Hunt',
  btnRestartChapter: 'Do Raid Over',
  btnReturnMenu: 'Retreat to War-Camp',
  settingsTitle: 'Wargear & Binds',
  tabGeneral: 'Tongue, Grit & Forge',
  tabControls: 'Claws & Pointer',
  labelLanguage: 'Clan Tongue',
  labelDifficulty: 'Brutality',
  diffCalmName: 'Grunt',
  diffStandardName: 'Raider',
  diffAbyssalName: 'Warchief',
  labelQuality: 'Forge Shine',
  qualVeryLow: 'Mud',
  qualLow: 'Scrap',
  qualMedium: 'Iron',
  qualHigh: 'Steel',
  qualUltra: 'Mithril-Glow',
  btnDone: 'Waaagh!',
  btnNext: 'Next!',
  btnBack: 'Bak!',
  btnReset: 'Smash Binds',
  keySpace: 'Jump-Slam',
});

export const LOCALES: Record<LanguageId, LocaleStrings> = {
  en: EN,
  fr: FR,
  de: DE,
  es: ES,
  pt: PT,
  zh: ZH,
  ar: AR,
  uk: UK,
  ru: RU,
  ja: JA,
  pl: PL,
  it: IT,
  vi: VI,
  fa: FA,
  elvish: ELVISH,
  orcish: ORCISH,
};

export function getLocale(lang: string): LocaleStrings {
  return LOCALES[resolveLanguageId(lang)];
}

export function t(
  lang: string,
  key: keyof LocaleStrings,
  vars?: Record<string, string | number>,
): string {
  const dict = getLocale(lang);
  let text = dict[key] ?? EN[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function formatLocalizedKeyCode(code: string, lang: string): string {
  if (code.startsWith('Key') && code.length === 4) {
    return code.slice(3).toUpperCase();
  }
  if (code.startsWith('Digit') && code.length === 6) {
    return code.slice(5);
  }
  switch (code) {
    case 'Space':
      return getLocale(lang).keySpace;
    case 'Escape':
      return 'Esc';
    case 'ArrowUp':
      return '↑';
    case 'ArrowDown':
      return '↓';
    case 'ArrowLeft':
      return '←';
    case 'ArrowRight':
      return '→';
    case 'ShiftLeft':
    case 'ShiftRight':
      return 'Shift';
    case 'ControlLeft':
    case 'ControlRight':
      return 'Ctrl';
    case 'AltLeft':
    case 'AltRight':
      return 'Alt';
    case 'Enter':
      return 'Enter';
    case 'Tab':
      return 'Tab';
    default:
      return code;
  }
}

export function formatLocalizedMouseBinding(binding: MouseBinding, lang: string): string {
  const dict = getLocale(lang);
  switch (binding) {
    case 'LMB':
      return dict.mBindLMB;
    case 'DBL_LMB':
      return dict.mBindDBL;
    case 'RMB':
      return dict.mBindRMB;
    case 'MMB':
      return dict.mBindMMB;
    case 'NONE':
      return dict.mBindNONE;
  }
}

export function getLocalizedActionLabel(action: GameAction, lang: string): string {
  const d = getLocale(lang);
  switch (action) {
    case 'forward':
      return d.actForward;
    case 'backward':
      return d.actBackward;
    case 'turnLeft':
      return d.actTurnLeft;
    case 'turnRight':
      return d.actTurnRight;
    case 'ascend':
      return d.actAscend;
    case 'descend':
      return d.actDescend;
    case 'call':
      return d.actCall;
    case 'dash':
      return d.actDash;
    case 'stopFish':
      return d.actStopFish;
    case 'pause':
      return d.actPause;
    case 'restart':
      return d.actRestart;
    case 'mute':
      return d.actMute;
    case 'fullscreen':
      return d.actFullscreen;
  }
}
