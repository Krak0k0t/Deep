/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from './game/campaign';
import { HUDSnapshot, UnderwaterEngine } from './game/UnderwaterEngine';
import { TitleOverlay } from './components/TitleOverlay';
import { GameHUD } from './components/GameHUD';
import { PauseVictoryModal } from './components/PauseVictoryModal';

const INITIAL_HUD: HUDSnapshot = {
  screenState: 'title',
  chapter: 1,
  chapterTitle: CHAPTERS[1].title,
  phase: 'DESCENT',
  health: 100,
  maxHealth: 100,
  pearls: 0,
  depthMeters: 12,
  isHidden: false,
  callCooldownRemaining: 0,
  callCooldownTotal: 2.5,
  objectiveText: 'Плыви вглубь рифа и жми E (Зов), чтобы чуять икринку',
  toastText: null,
  eggEchoText: null,
  outcome: null,
  elapsedSec: 0,
  totalDeaths: 0,
  npcsMetCount: 0,
  styleDodges: 0,
  muted: false,
  bubbles: [],
  squidAlert: 'calm',
  savedHighestChapter: 1,
  savedPearls: 0,
  completionLabel: null,
};

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<UnderwaterEngine | null>(null);
  const [hud, setHud] = useState<HUDSnapshot>(INITIAL_HUD);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart') === '1';

    const engine = new UnderwaterEngine(
      container,
      (snapshot) => setHud(snapshot),
      autostart,
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#052236]">
      {/* Dedicated isolated WebGL canvas mount */}
      <div
        ref={mountRef}
        data-testid="underwater-canvas-mount"
        className="absolute inset-0 w-full h-full"
      />

      {hud.screenState === 'title' && (
        <TitleOverlay
          savedHighestChapter={hud.savedHighestChapter}
          savedPearls={hud.savedPearls}
          onStart={() => engineRef.current?.startGame()}
          onNewGame={() => engineRef.current?.startNewGame()}
        />
      )}

      {hud.screenState !== 'title' && (
        <GameHUD
          hud={hud}
          onToggleMute={() => engineRef.current?.toggleMute()}
          onPause={() => engineRef.current?.pauseGame()}
          onRestart={() => engineRef.current?.restartChapter()}
          onEmitCall={() => engineRef.current?.triggerCall()}
        />
      )}

      <PauseVictoryModal
        hud={hud}
        onResume={() => engineRef.current?.resumeGame()}
        onRespawn={() => engineRef.current?.respawnAtCheckpoint()}
        onRestart={() => engineRef.current?.restartChapter()}
        onTitle={() => engineRef.current?.returnToTitle()}
      />
    </main>
  );
}
