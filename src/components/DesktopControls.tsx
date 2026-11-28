import React from 'react';
import {
  formatLocalizedKeyCode,
  formatLocalizedMouseBinding,
  getLocale,
  t,
} from '../game/i18n';
import { HUDSnapshot } from '../game/UnderwaterEngine';

export interface DesktopControlsProps {
  hud: HUDSnapshot;
  onEmitCall: () => void;
  onTriggerDash: () => void;
  onHoverSound?: () => void;
  onClickSound?: () => void;
}

export const DesktopControls: React.FC<DesktopControlsProps> = ({
  hud,
  onEmitCall,
  onTriggerDash,
  onHoverSound,
  onClickSound,
}) => {
  const lang = hud.gameSettings.language;
  const dict = getLocale(lang);
  const hc = hud.gameSettings.highContrastSymbols;

  const callReady = hud.callCooldownRemaining <= 0.05;
  const dashReady = hud.dashCooldownRemaining <= 0.05;
  const kb = hud.controlSettings.keyBindings;
  const mb = hud.controlSettings.mouseBindings;
  const callKey = formatLocalizedKeyCode(kb.call, lang);
  const dashKey = formatLocalizedKeyCode(kb.dash, lang);
  const interactLabel = formatLocalizedMouseBinding(mb.interact, lang);

  return (
    <div
      data-testid="desktop-controls-bar"
      className="flex items-end justify-between gap-3 w-full pointer-events-none"
    >
      {/* Organic Kelp-Filament Objective Whisper */}
      <div className="shell-panel px-3.5 py-2 text-xs text-[#bdebf2] max-w-xl truncate pointer-events-auto">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#26e8d4] me-2 align-middle" aria-hidden="true" />
        <span>{hud.objectiveText}</span>
        {mb.interact !== 'NONE' && (
          <span className="hidden lg:inline text-[#7ec9d4]">
            {' '}
            · {interactLabel} — {dict.hudActionSuffix}
          </span>
        )}
      </div>

      {/* Right Ability & Living Status Cluster */}
      <div className="flex items-center gap-2 pointer-events-auto shrink-0">
        {hud.borisMugCarried && (
          <div
            data-testid="hud-mug-badge"
            className="shell-panel px-3 py-2 border-[#f2b857]/55 text-xs font-semibold uppercase tracking-wider text-[#f7dca1]"
            style={{ backgroundColor: 'rgba(42, 28, 12, 0.88)' }}
          >
            {hc && <span className="me-1">◆</span>}
            {dict.hudBorisMug}
          </div>
        )}

        {hud.chapter === 3 && !hud.crabDebrisOpen && hud.crabScrapsCollected > 0 && (
          <div
            data-testid="hud-scrap-badge"
            className="shell-panel px-3 py-2 border-[#42e695]/55 text-xs font-semibold uppercase tracking-wider text-[#b7ffe0] tabular-nums"
            style={{ backgroundColor: 'rgba(12, 38, 28, 0.88)' }}
          >
            {hc && <span className="me-1">●</span>}
            {t(lang, 'hudCrabScraps', {
              count: hud.crabScrapsCollected,
              total: 3,
            })}
          </div>
        )}

        {hud.chapter === 4 && hud.whaleContainerCarried && !hud.charybdisGateOpen && (
          <div
            data-testid="hud-container-badge"
            className="shell-panel px-3 py-2 border-[#3cf5e2]/55 text-xs font-semibold uppercase tracking-wider text-[#c4fff8]"
            style={{ backgroundColor: 'rgba(10, 34, 42, 0.88)' }}
          >
            {hc && <span className="me-1">◆</span>}
            {dict.hudWhaleContainer}
          </div>
        )}

        {hud.chapter === 5 && hud.ch5LureCarried && !hud.ch5GateOpen && (
          <div
            data-testid="hud-lure-badge"
            className="shell-panel px-3 py-2 border-[#ffad59]/55 text-xs font-semibold uppercase tracking-wider text-[#ffe3bd]"
            style={{ backgroundColor: 'rgba(42, 24, 12, 0.88)' }}
          >
            {hc && <span className="me-1">●</span>}
            {dict.hudLurePearl}
          </div>
        )}

        {(hud.phase === 'ASCENT' || hud.ch6EggReclaimed) && !hud.hatchlingBorn && (
          <div
            data-testid="hud-egg-badge"
            className="shell-panel px-3 py-2 border-[#26e8d4]/60 text-xs font-semibold uppercase tracking-wider text-[#b5fff7]"
            style={{ backgroundColor: 'rgba(8, 36, 46, 0.88)' }}
          >
            {hc && <span className="me-1">◈</span>}
            {dict.hudEggCarried} · {dict.hudAscentStun}
          </div>
        )}

        {hud.eggResonanceActive && !hud.isHidden && (
          <div
            data-testid="hud-resonance-badge"
            className="shell-panel px-3 py-2 border-[#26e8d4]/65 text-xs font-semibold uppercase tracking-wider text-[#99fff4]"
            style={{ backgroundColor: 'rgba(8, 36, 46, 0.88)' }}
          >
            {hc && <span className="me-1">✦</span>}
            {dict.hudEggResonance}
          </div>
        )}

        {hud.isHidden && (
          <div
            className="shell-panel px-3 py-2 border-[#e86f8b]/55 text-xs font-semibold uppercase tracking-wider text-[#ffc2d1]"
            style={{ backgroundColor: 'rgba(42, 14, 30, 0.88)' }}
          >
            {hc && <span className="me-1">▲</span>}
            {dict.hudHidden}
          </div>
        )}

        {hud.hasDashMutation && (
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-dash-btn"
            onMouseEnter={() => onHoverSound?.()}
            onClick={(e) => {
              e.currentTarget.blur();
              onClickSound?.();
              onTriggerDash();
            }}
            className={`shell-panel ui-jelly px-3.5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
              dashReady
                ? 'border-[#f2b857] text-[#ffe8ad] hover:bg-[#3b2f13]/80'
                : 'border-[#4a4532] text-[#9e9478]'
            }`}
          >
            <span className="tabular-nums flex items-center gap-1.5">
              {hc && <span>»</span>}
              <span>
                {dict.hudDash} [{dashKey}] ·{' '}
                {dashReady
                  ? dict.hudReady
                  : `${hud.dashCooldownRemaining.toFixed(1)}${dict.hudSecUnit}`}
              </span>
            </span>
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          data-testid="hud-call-btn"
          onMouseEnter={() => onHoverSound?.()}
          onClick={(e) => {
            e.currentTarget.blur();
            onClickSound?.();
            onEmitCall();
          }}
          className={`shell-panel ui-jelly px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            callReady
              ? 'border-[#26e8d4] text-[#99fff4] shadow-[0_0_18px_rgba(38,232,212,0.28)]'
              : 'border-[#2a5468] text-[#7ca8b8]'
          }`}
        >
          <span className="tabular-nums flex items-center gap-1.5">
            {hc && <span>◉</span>}
            <span>
              {dict.hudCall} [{callKey}] ·{' '}
              {callReady
                ? dict.hudReady
                : `${hud.callCooldownRemaining.toFixed(1)}${dict.hudSecUnit}`}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
