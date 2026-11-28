/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadControlSettings } from './game/controlSettings';
import {
  loadGameSettings,
  shouldShowTouchControls,
} from './game/gameSettings';
import {
  getLocale,
  isRtlLanguage,
  SUPPORTED_LANGUAGE_IDS,
} from './game/i18n';
import { HUDSnapshot, UnderwaterEngine } from './game/UnderwaterEngine';
import { useDeviceType } from './hooks/useDeviceType';
import { TitleOverlay } from './components/TitleOverlay';
import { HUD } from './components/HUD';
import { PauseVictoryModal } from './components/PauseVictoryModal';
import { ControlsSettingsModal } from './components/ControlsSettingsModal';
import { PearlShopModal } from './components/PearlShopModal';
import { LoreJournalModal } from './components/LoreJournalModal';

const INITIAL_GAME_SETTINGS = loadGameSettings(undefined, SUPPORTED_LANGUAGE_IDS);
const INITIAL_LOCALE = getLocale(INITIAL_GAME_SETTINGS.language);

const INITIAL_HUD: HUDSnapshot = {
  screenState: 'title',
  chapter: 1,
  chapterTitle: INITIAL_LOCALE.chapter1Title,
  phase: 'DESCENT',
  health: 100,
  maxHealth: 100,
  pearls: 0,
  depthMeters: 12,
  isHidden: false,
  callCooldownRemaining: 0,
  callCooldownTotal: 2.5,
  hasDashMutation: false,
  dashCooldownRemaining: 0,
  activeSkin: 'turquoise',
  unlockedSkins: ['turquoise'],
  upgrades: [],
  quests: {
    borisMug: false,
    crabDebris: false,
    whaleContainer: false,
  },
  borisMugCarried: false,
  pelicanGateOpen: false,
  pafnutiyInflated: false,
  crabScrapsCollected: 0,
  crabDebrisOpen: false,
  whaleContainerCarried: false,
  charybdisGateOpen: false,
  ch5LureCarried: false,
  ch5GateOpen: false,
  ch6EggReclaimed: false,
  ch7WhaleFreed: false,
  ch8ShortcutOpen: false,
  ch9BulkheadOpen: false,
  hatchlingBorn: false,
  objectiveText: INITIAL_LOCALE.objCh1Start,
  toastText: null,
  eggEchoText: null,
  outcome: null,
  elapsedSec: 0,
  totalDeaths: 0,
  npcsMetCount: 0,
  npcsTotal: 2,
  styleDodges: 0,
  muted: false,
  bubbles: [],
  squidAlert: 'calm',
  savedHighestChapter: 1,
  savedPearls: 0,
  completionLabel: null,
  controlSettings: loadControlSettings(),
  gameSettings: INITIAL_GAME_SETTINGS,
  autopilotActive: false,
  hoverInteractLabel: null,
  collectedRelicIds: [],
  bestRankByChapter: {},
  npcsMet: [],
  lastChapterRank: null,
  awardedSRankBonus: false,
  eggResonanceActive: false,
  objectiveBearingDeg: 0,
  objectiveDistMeters: 92,
  titleLaunchActive: false,
};

export default function App() {
  const mainRef = useRef<HTMLElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<UnderwaterEngine | null>(null);
  const { isMobile } = useDeviceType();

  const [hud, setHud] = useState<HUDSnapshot>(INITIAL_HUD);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const uiFullscreenRef = useRef(false);

  const toggleFullscreen = useCallback(async () => {
    const nativeEl = document.fullscreenElement;
    if (nativeEl) {
      uiFullscreenRef.current = false;
      setIsFullscreen(false);
      try {
        await document.exitFullscreen?.();
      } catch {
        // Ignore browser exit errors
      }
      return;
    }

    if (uiFullscreenRef.current) {
      uiFullscreenRef.current = false;
      setIsFullscreen(false);
      return;
    }

    const target = mainRef.current ?? document.documentElement;
    if (typeof target?.requestFullscreen === 'function') {
      try {
        await target.requestFullscreen();
        if (document.fullscreenElement) {
          uiFullscreenRef.current = false;
          setIsFullscreen(true);
          return;
        }
      } catch {
        // Fallback to clean viewport-locked theater fullscreen if iframe/headless denies Fullscreen API
      }
    }

    uiFullscreenRef.current = true;
    setIsFullscreen(true);
  }, []);

  const toggleFullscreenRef = useRef(toggleFullscreen);
  toggleFullscreenRef.current = toggleFullscreen;

  useEffect(() => {
    const onFsChange = () => {
      const nativeFs = !!document.fullscreenElement;
      if (nativeFs) {
        uiFullscreenRef.current = false;
        setIsFullscreen(true);
      } else if (!uiFullscreenRef.current) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const lang = hud.gameSettings.language;
    const dict = getLocale(lang);
    document.documentElement.lang = lang === 'elvish' || lang === 'orcish' ? 'en' : lang;
    const chKey = `chapter${hud.chapter}` as const;
    const shortStr = dict[`${chKey}Short` as keyof typeof dict] ?? dict.chapter1Short;
    const titleStr = dict[`${chKey}Title` as keyof typeof dict] ?? dict.chapter1Title;
    document.title = `${dict.gameTitleLine1} ${dict.gameTitleLine2} — ${shortStr}: ${titleStr}`;
  }, [hud.gameSettings.language, hud.chapter]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart') === '1';

    const engine = new UnderwaterEngine(
      container,
      (snapshot) => setHud(snapshot),
      autostart,
      () => {
        void toggleFullscreenRef.current();
      },
    );
    engineRef.current = engine;
    engine.syncExternalState({
      isMobile,
      inputMode: isMobile ? 'touch' : 'keyboard',
      reducedEffects: hud.gameSettings.reducedEffects,
    });
    window.dispatchEvent(new Event('resize'));

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.syncExternalState({
      isMobile,
      inputMode: isMobile ? 'touch' : 'keyboard',
      reducedEffects: hud.gameSettings.reducedEffects,
    });
  }, [isMobile, hud.gameSettings.reducedEffects]);

  const lang = hud.gameSettings.language;
  const rtl = isRtlLanguage(lang);
  const showMobileControls =
    hud.screenState === 'playing' &&
    shouldShowTouchControls(hud.gameSettings.touchControls, isMobile);

  return (
    <main
      ref={mainRef}
      dir={rtl ? 'rtl' : 'ltr'}
      data-fullscreen={isFullscreen ? '1' : '0'}
      data-lang={lang}
      data-device={isMobile ? 'mobile' : 'desktop'}
      data-reduced-effects={hud.gameSettings.reducedEffects ? '1' : '0'}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#052236]'
          : 'relative w-screen h-screen overflow-hidden bg-[#052236]'
      }
    >
      {/* Dedicated isolated WebGL canvas mount */}
      <div
        ref={mountRef}
        data-testid="underwater-canvas-mount"
        className="absolute inset-0 w-full h-full"
      />

      <TitleOverlay
        visible={hud.screenState === 'title' && !hud.titleLaunchActive}
        savedHighestChapter={hud.savedHighestChapter}
        savedPearls={hud.savedPearls}
        bestRankByChapter={hud.bestRankByChapter}
        gameSettings={hud.gameSettings}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          void toggleFullscreen();
        }}
        onUpdateGameSettings={(patch) =>
          engineRef.current?.updateGameSettings(patch)
        }
        onStart={() => engineRef.current?.startGame(true)}
        onStartChapter={(ch) => engineRef.current?.startGame(true, ch)}
        onNewGame={() => engineRef.current?.startNewGame()}
        onSquidAnchorChange={(ndcX, ndcY) =>
          engineRef.current?.setTitleSquidAnchor(ndcX, ndcY)
        }
        onSquidHoverChange={(hovered) =>
          engineRef.current?.setTitleSquidHovered(hovered)
        }
        onOpenControls={() => setControlsOpen(true)}
        onOpenShop={() => setShopOpen(true)}
        onOpenJournal={() => setJournalOpen(true)}
        onHoverSound={() => engineRef.current?.playUiHover()}
        onClickSound={() => engineRef.current?.playUiClick()}
      />

      {hud.screenState !== 'title' && (
        <HUD
          hud={hud}
          isMobileLayout={isMobile}
          showMobileControls={showMobileControls}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => {
            void toggleFullscreen();
          }}
          onToggleMute={() => engineRef.current?.toggleMute()}
          onReturnToMenu={() => engineRef.current?.returnToTitle()}
          onPause={() => engineRef.current?.pauseGame()}
          onRestart={() => engineRef.current?.restartChapter()}
          onEmitCall={() => engineRef.current?.triggerCall()}
          onEchoScan={() => engineRef.current?.triggerEchoScan()}
          onTriggerDash={() => engineRef.current?.triggerDash()}
          onVirtualMoveInput={(x, y, ascend, descend) =>
            engineRef.current?.setVirtualMoveInput(x, y, ascend, descend)
          }
          onInteract={() => engineRef.current?.interactNearestObject()}
          onStopFish={() => engineRef.current?.stopFish()}
          onHoverSound={() => engineRef.current?.playUiHover()}
          onClickSound={() => engineRef.current?.playUiClick()}
        />
      )}

      <PauseVictoryModal
        hud={hud}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          void toggleFullscreen();
        }}
        onResume={() => engineRef.current?.resumeGame()}
        onNextChapter={() => engineRef.current?.advanceToNextChapter()}
        onOpenControls={() => setControlsOpen(true)}
        onOpenShop={() => setShopOpen(true)}
        onOpenJournal={() => setJournalOpen(true)}
        onRespawn={() => engineRef.current?.respawnAtCheckpoint()}
        onRestart={() => engineRef.current?.restartChapter()}
        onTitle={() => engineRef.current?.returnToTitle()}
        onHoverSound={() => engineRef.current?.playUiHover()}
        onClickSound={() => engineRef.current?.playUiClick()}
      />

      <ControlsSettingsModal
        open={controlsOpen}
        controlSettings={hud.controlSettings}
        gameSettings={hud.gameSettings}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          void toggleFullscreen();
        }}
        onUpdateControls={(patch) =>
          engineRef.current?.updateControlSettings(patch)
        }
        onUpdateGameSettings={(patch) =>
          engineRef.current?.updateGameSettings(patch)
        }
        onResetControls={() =>
          engineRef.current?.resetControlSettingsToDefault()
        }
        onClose={() => setControlsOpen(false)}
        onHoverSound={() => engineRef.current?.playUiHover()}
        onClickSound={() => engineRef.current?.playUiClick()}
      />

      <PearlShopModal
        open={shopOpen}
        language={lang}
        pearls={hud.pearls}
        activeSkin={hud.activeSkin}
        unlockedSkins={hud.unlockedSkins}
        upgrades={hud.upgrades}
        onSelectOrBuySkin={(skinId) => {
          engineRef.current?.buyOrEquipSkin(skinId);
        }}
        onBuyUpgrade={(upgradeId) => {
          engineRef.current?.buyHideoutUpgrade(upgradeId);
        }}
        onClose={() => setShopOpen(false)}
      />

      <LoreJournalModal
        open={journalOpen}
        language={lang}
        highestChapter={Math.max(hud.savedHighestChapter, hud.chapter)}
        collectedRelicIds={hud.collectedRelicIds}
        npcsMet={hud.npcsMet}
        onClose={() => setJournalOpen(false)}
      />
    </main>
  );
}
