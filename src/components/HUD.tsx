import React, { useEffect, useRef, useState } from 'react';
import {
  formatLocalizedKeyCode,
  getLocale,
  t,
} from '../game/i18n';
import { HUDSnapshot } from '../game/UnderwaterEngine';
import { DesktopControls } from './DesktopControls';
import { MobileControls } from './MobileControls';

interface HUDProps {
  hud: HUDSnapshot;
  isMobileLayout: boolean;
  showMobileControls: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onReturnToMenu: () => void;
  onPause: () => void;
  onRestart: () => void;
  onEmitCall: () => void;
  onEchoScan: () => void;
  onTriggerDash: () => void;
  onVirtualMoveInput: (x: number, y: number, ascend: boolean, descend: boolean) => void;
  onInteract: () => void;
  onStopFish: () => void;
  onHoverSound?: () => void;
  onClickSound?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hud,
  isMobileLayout,
  showMobileControls,
  isFullscreen,
  onToggleFullscreen,
  onToggleMute,
  onReturnToMenu,
  onPause,
  onRestart,
  onEmitCall,
  onEchoScan,
  onTriggerDash,
  onVirtualMoveInput,
  onInteract,
  onStopFish,
  onHoverSound,
  onClickSound,
}) => {
  const [mobileMenuDrawerOpen, setMobileMenuDrawerOpen] = useState(false);
  const [pearlPopKey, setPearlPopKey] = useState(0);
  const [hudIdle, setHudIdle] = useState(false);

  const prevPearlsRef = useRef(hud.pearls);
  const prevHealthRef = useRef(hud.health);
  const idleTimerRef = useRef<number | null>(null);

  const lang = hud.gameSettings.language;
  const dict = getLocale(lang);
  const uiScale = hud.gameSettings.uiScale ?? 1;
  const hc = hud.gameSettings.highContrastSymbols;
  const reducedEffects = hud.gameSettings.reducedEffects;

  // Pearl collection pop animation
  useEffect(() => {
    if (hud.pearls > prevPearlsRef.current) {
      setPearlPopKey((k) => k + 1);
    }
    prevPearlsRef.current = hud.pearls;
  }, [hud.pearls]);

  // Damage & critical O2 haptic feedback
  useEffect(() => {
    if (hud.screenState === 'playing' && !reducedEffects) {
      const tookDamage = hud.health < prevHealthRef.current;
      const enteredCritical = hud.health < 20 && prevHealthRef.current >= 20;
      if (tookDamage || enteredCritical) {
        try {
          navigator.vibrate?.([35, 25, 45]);
        } catch {
          // Ignore browsers blocking vibrate
        }
      }
    }
    prevHealthRef.current = hud.health;
  }, [hud.health, hud.screenState, reducedEffects]);

  // 5-second idle auto-fade (restores immediately on any input, danger, hover, or bubble)
  const hasVisibleBubble = hud.bubbles.some((b) => b.visible);
  useEffect(() => {
    if (hud.screenState !== 'playing') {
      setHudIdle(false);
      return;
    }

    const wakeHud = () => {
      setHudIdle(false);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setHudIdle(true);
      }, 5000);
    };

    wakeHud();
    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'keydown',
      'touchstart',
    ];
    events.forEach((evt) => window.addEventListener(evt, wakeHud, { passive: true }));
    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      events.forEach((evt) => window.removeEventListener(evt, wakeHud));
    };
  }, [hud.screenState]);

  const shouldFadeIdle =
    hudIdle &&
    hud.screenState === 'playing' &&
    !mobileMenuDrawerOpen &&
    !hud.hoverInteractLabel &&
    hud.squidAlert === 'calm' &&
    hud.health >= 25 &&
    !hasVisibleBubble;

  const idleOpacityClass = shouldFadeIdle
    ? 'opacity-20 transition-opacity duration-500'
    : 'opacity-100 transition-opacity duration-150';

  // Oxygen progress bar color bands
  const o2Pct = Math.max(0, Math.min(100, hud.health));
  const o2Critical = o2Pct < 20;
  const o2Color =
    o2Pct >= 50 ? '#26e8d4' : o2Pct >= 20 ? '#f2b857' : '#ff4c2a';

  const callReady = hud.callCooldownRemaining <= 0.05;
  const dashReady = hud.dashCooldownRemaining <= 0.05;
  const kb = hud.controlSettings.keyBindings;
  const muteKey = formatLocalizedKeyCode(kb.mute, lang);
  const restartKey = formatLocalizedKeyCode(kb.restart, lang);
  const pauseKey = formatLocalizedKeyCode(kb.pause, lang);
  const fsKey = formatLocalizedKeyCode(kb.fullscreen, lang);

  return (
    <div
      data-autopilot={hud.autopilotActive ? '1' : '0'}
      data-ui-mode={isMobileLayout ? 'mobile' : 'desktop'}
      data-hud-idle={shouldFadeIdle ? '1' : '0'}
      className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))] sm:p-4 md:p-6"
    >
      {/* Subtle Center Swim Sightline Reticle & Contextual Hover Prompt */}
      {hud.controlSettings.mouseEnabled && !showMobileControls && (
        <div
          aria-hidden="true"
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
        >
          <div
            className={`rounded-full border transition-all ${
              hud.hoverInteractLabel
                ? 'w-3.5 h-3.5 border-[#5ef7e6] scale-110'
                : 'w-2 h-2 border-[#99fff4]/55'
            }`}
            style={{
              backgroundColor: hud.hoverInteractLabel
                ? 'rgba(94, 247, 230, 0.45)'
                : 'rgba(38, 232, 212, 0.24)',
            }}
          />
          {hud.hoverInteractLabel && (
            <div className="shell-panel mt-2 px-3 py-0.5 text-[11px] font-medium text-[#dff6f7] whitespace-nowrap">
              {hc && <span className="me-1">◆</span>}
              {t(lang, 'hudHoverInteract', { target: hud.hoverInteractLabel })}
            </div>
          )}
        </div>
      )}

      {/* Peripheral Danger Bio-Vignette when predator telegraphs or dashes */}
      {hud.squidAlert !== 'calm' && !hud.isHidden && (
        <div
          className="fixed inset-0 pointer-events-none ui-danger-pulse"
          style={{
            boxShadow:
              hud.squidAlert === 'dash'
                ? 'inset 0 0 115px rgba(255, 76, 42, 0.44)'
                : 'inset 0 0 88px rgba(242, 168, 62, 0.28)',
          }}
        />
      )}

      {/* Top Perimeter Cluster (fades smoothly to 20% after 5s idle) */}
      <div
        className={`flex items-start justify-between gap-2 sm:gap-4 origin-top-left ${idleOpacityClass}`}
        style={
          uiScale !== 1
            ? { transform: `scale(${uiScale})`, transformOrigin: 'top center' }
            : undefined
        }
      >
        {/* Top-Left: Compact Location + Horizontal O2 Progress Bar + Pearl Counter */}
        <div
          title={hud.chapterTitle}
          className="shell-panel px-2.5 py-1.5 sm:px-3.5 sm:py-2 min-w-0 max-w-[186px] sm:max-w-none"
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#7ed6ce] whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-[#26e8d4]" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
              <circle cx="12" cy="11" r="2" fill="currentColor" stroke="none" />
            </svg>
            <span className="tabular-nums font-semibold">
              {dict.hudChapterPrefix} {hud.chapter} · -{hud.depthMeters} {dict.hudMetersUnit}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2.5 sm:gap-3.5">
            {/* Horizontal O2 Progress Bar + Percentage */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                role="progressbar"
                aria-label={dict.hudOxygen}
                aria-valuenow={o2Pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-16 sm:w-28 h-2.5 rounded-full overflow-hidden border border-[#1d4e63] bg-[#041724]"
              >
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-200 ${
                    o2Critical ? 'ui-danger-pulse' : ''
                  }`}
                  style={{
                    width: `${o2Pct}%`,
                    backgroundColor: o2Color,
                  }}
                />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold tabular-nums leading-none ${
                  o2Critical ? 'text-[#ff836b]' : 'text-[#dff6f7]'
                }`}
                data-testid="hud-health"
              >
                {hc ? '♥ ' : ''}
                {o2Pct}%
              </span>
            </div>

            <div className="h-4 w-px bg-[#26e8d4]/22 shrink-0" />

            {/* Pearl Counter with collect bounce */}
            <div
              key={pearlPopKey}
              className={`flex items-center gap-1 shrink-0 ${pearlPopKey > 0 ? 'pearl-pop' : ''}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="#f2e9cf" stroke="#7c6d49" strokeWidth="1.5" />
                <circle cx="9.5" cy="9.5" r="2.2" fill="#dff6f7" />
              </svg>
              <span
                className="text-xs sm:text-sm font-bold tabular-nums leading-none text-[#f2e9cf]"
                data-testid="hud-pearls"
              >
                {hud.pearls}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Interactive Bioluminescent Echo Compass (tap/click scans path!) */}
        <button
          type="button"
          tabIndex={-1}
          data-testid="hud-echo-compass"
          aria-label={`${dict.hudCompassObjective}: ${hud.objectiveDistMeters}${dict.hudMetersUnit}`}
          title={dict.hudCompassObjective}
          onMouseEnter={() => onHoverSound?.()}
          onClick={(e) => {
            e.currentTarget.blur();
            onClickSound?.();
            if (!reducedEffects) {
              try {
                navigator.vibrate?.(14);
              } catch {
                // Ignore vibration restrictions
              }
            }
            onEchoScan();
          }}
          className="shell-panel ui-jelly pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 shrink-0 hover:border-[#26e8d4] cursor-pointer"
        >
          <div className="relative w-5 h-5 rounded-full border border-[#26e8d4]/50 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{ transform: `rotate(${hud.objectiveBearingDeg}deg)` }}
              aria-hidden="true"
            >
              <path d="M12 3l4 13-4-3-4 3 4-13z" fill="#26e8d4" />
            </svg>
          </div>
          <span className="text-xs font-bold tabular-nums text-[#dff6f7]">
            {hud.objectiveDistMeters} {dict.hudMetersUnit}
          </span>
        </button>

        {/* Top-Right: Compact 40x40px Utility Controls (50% resting opacity, full opacity on interaction) */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {isMobileLayout ? (
            <>
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-pause-btn"
                aria-label={`${dict.hudPauseLabel} (${pauseKey})`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onPause();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-50 hover:opacity-100 active:opacity-100 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-expanded={mobileMenuDrawerOpen}
                aria-label={dict.btnSettings}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  setMobileMenuDrawerOpen((v) => !v);
                }}
                className={`shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] cursor-pointer text-sm font-bold ${
                  mobileMenuDrawerOpen ? 'opacity-100 border-[#26e8d4]' : 'opacity-50 hover:opacity-100 active:opacity-100'
                }`}
              >
                ⋯
              </button>
              {mobileMenuDrawerOpen && (
                <div className="shell-panel absolute right-3 top-14 p-1.5 flex items-center gap-1.5 z-30">
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="fullscreen-btn"
                    aria-label={isFullscreen ? dict.btnExitFullscreen : dict.btnFullscreen}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onClickSound?.();
                      onToggleFullscreen();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#26e8d4]/30 text-[#c9f7f2]"
                  >
                    ⛶
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={hud.muted ? dict.hudUnmuteLabel : dict.hudMuteLabel}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onClickSound?.();
                      onToggleMute();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#26e8d4]/30 text-[#c9f7f2]"
                  >
                    {hud.muted ? '🔇' : '🔊'}
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={dict.hudRestartLabel}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onClickSound?.();
                      onRestart();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#26e8d4]/30 text-[#c9f7f2]"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-menu-btn"
                    aria-label={dict.hudMenuLabel}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onClickSound?.();
                      onReturnToMenu();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#26e8d4]/30 text-[#c9f7f2]"
                  >
                    ⌂
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                tabIndex={-1}
                data-testid="fullscreen-btn"
                aria-label={
                  isFullscreen
                    ? `${dict.btnExitFullscreen} (${fsKey})`
                    : `${dict.btnFullscreen} (${fsKey})`
                }
                title={
                  isFullscreen
                    ? `${dict.btnExitFullscreen} [${fsKey}]`
                    : `${dict.btnFullscreen} [${fsKey}]`
                }
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onToggleFullscreen();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-55 hover:opacity-100 hover:border-[#26e8d4] cursor-pointer"
              >
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label={
                  hud.muted
                    ? `${dict.hudUnmuteLabel} (${muteKey})`
                    : `${dict.hudMuteLabel} (${muteKey})`
                }
                title={
                  hud.muted
                    ? `${dict.hudUnmuteLabel} [${muteKey}]`
                    : `${dict.hudMuteLabel} [${muteKey}]`
                }
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onToggleMute();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-55 hover:opacity-100 hover:border-[#26e8d4] cursor-pointer"
              >
                {hud.muted ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M22 9l-6 6M16 9l6 6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-menu-btn"
                aria-label={dict.hudMenuLabel}
                title={dict.hudMenuLabel}
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onReturnToMenu();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-55 hover:opacity-100 hover:border-[#26e8d4] cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
                </svg>
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label={`${dict.hudRestartLabel} (${restartKey})`}
                title={`${dict.hudRestartLabel} [${restartKey}]`}
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onRestart();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-55 hover:opacity-100 hover:border-[#26e8d4] cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-pause-btn"
                aria-label={`${dict.hudPauseLabel} (${pauseKey})`}
                title={`${dict.hudPauseLabel} [Esc / ${pauseKey}]`}
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onPause();
                }}
                className="shell-panel ui-jelly w-10 h-10 flex items-center justify-center text-[#c9f7f2] opacity-55 hover:opacity-100 hover:border-[#26e8d4] cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* World-Anchored Organic 2-Line Speech Bubbles */}
      {hud.bubbles.map(
        (b) =>
          b.visible && (
            <div
              key={b.id}
              className="shell-bubble fixed z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3.5 py-2 max-w-xs text-center"
              style={{
                left: `${b.screenX}px`,
                top: `${b.screenY}px`,
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#26e8d4]">
                {b.speaker}
              </div>
              <div className="mt-0.5 text-xs md:text-sm text-[#dff6f7] leading-snug">
                <div>{b.line1}</div>
                <div>{b.line2}</div>
              </div>
            </div>
          ),
      )}

      {/* Fleeting Egg Echo or Toast Whisper */}
      {(hud.eggEchoText || hud.toastText) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none max-w-[92vw]">
          {hud.eggEchoText && (
            <div className="shell-panel px-4 py-1.5 border-[#26e8d4]/50 text-xs md:text-sm font-medium text-[#99fff4] text-center">
              {hud.eggEchoText}
            </div>
          )}
          {hud.toastText && (
            <div className="shell-panel px-4 py-1.5 border-[#5ba1b8]/40 text-xs text-[#d6f4fa] text-center">
              {hud.toastText}
            </div>
          )}
        </div>
      )}

      {/* Adaptive Input Layer: MobileControls vs DesktopControls (respects 5s idle fade) */}
      <div
        className={`w-full ${idleOpacityClass}`}
        style={
          uiScale !== 1 && !showMobileControls
            ? { transform: `scale(${uiScale})`, transformOrigin: 'bottom center' }
            : undefined
        }
      >
        {showMobileControls ? (
          <MobileControls
            visible={hud.screenState === 'playing'}
            language={lang}
            hasDashMutation={hud.hasDashMutation}
            callReady={callReady}
            dashReady={dashReady}
            highContrastSymbols={hc}
            reducedEffects={reducedEffects}
            onMoveVector={onVirtualMoveInput}
            onEmitCall={onEmitCall}
            onTriggerDash={onTriggerDash}
            onInteract={onInteract}
            onStopFish={onStopFish}
          />
        ) : (
          <DesktopControls
            hud={hud}
            onEmitCall={onEmitCall}
            onTriggerDash={onTriggerDash}
            onHoverSound={onHoverSound}
            onClickSound={onClickSound}
          />
        )}
      </div>
    </div>
  );
};
