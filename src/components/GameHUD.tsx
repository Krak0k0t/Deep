import React from 'react';
import { HUDSnapshot } from '../game/UnderwaterEngine';

interface GameHUDProps {
  hud: HUDSnapshot;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onEmitCall: () => void;
}

const OxygenSocket: React.FC<{ state: 'full' | 'cracked' | 'empty' }> = ({
  state,
}) => {
  const fill =
    state === 'full' ? '#26e8d4' : state === 'cracked' ? '#f5b841' : 'none';
  const stroke =
    state === 'empty' ? '#326075' : state === 'cracked' ? '#f5b841' : '#99fff4';

  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="#051c2b"
        stroke="#0a2e42"
        strokeWidth="2.5"
      />
      <circle
        cx="12"
        cy="12"
        r="7.2"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {state === 'full' && (
        <path
          d="M8.5 8.5a4.5 4.5 0 0 1 5.2-.8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {state === 'cracked' && (
        <path
          d="M9 7l3 5-2 4 4 2"
          fill="none"
          stroke="#051c2b"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  onToggleMute,
  onPause,
  onRestart,
  onEmitCall,
}) => {
  const socketStates: Array<'full' | 'cracked' | 'empty'> = [0, 1, 2].map(
    (idx) => {
      const thresholdFull = (idx + 1) * 33;
      const thresholdMin = idx * 33;
      if (hud.health >= thresholdFull) return 'full';
      if (hud.health > thresholdMin) return 'cracked';
      return 'empty';
    },
  );

  const callReady = hud.callCooldownRemaining <= 0.05;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Peripheral warning vignette when squid telegraphs or dashes */}
      {hud.squidAlert !== 'calm' && !hud.isHidden && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow:
              hud.squidAlert === 'dash'
                ? 'inset 0 0 110px rgba(255, 72, 36, 0.42)'
                : 'inset 0 0 85px rgba(255, 145, 56, 0.28)',
          }}
        />
      )}

      {/* Top Perimeter Clusters */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left: Diving-Suit / Bathysphere Status Gauge */}
        <div
          className="px-4 py-3 rounded-md border border-[#26e8d4]/35 shadow-[0_8px_24px_rgba(2,12,20,0.65)]"
          style={{ backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
        >
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#7ed6ce]">
            <span>
              ГЛ. {hud.chapter} · {hud.chapterTitle}
            </span>
            <span className="text-[#4a8599]">|</span>
            <span className="tabular-nums text-[#9de5f5]">
              -{hud.depthMeters} М
            </span>
          </div>

          <div className="mt-2 flex items-center gap-5">
            {/* Oxygen / Vitality */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {socketStates.map((st, idx) => (
                  <OxygenSocket key={idx} state={st} />
                ))}
              </div>
              <div className="leading-none">
                <div className="text-[10px] uppercase tracking-wider text-[#72a9ba]">
                  O₂
                </div>
                <div
                  className="text-lg font-bold tabular-nums text-[#ebfffe]"
                  data-testid="hud-health"
                >
                  {hud.health}%
                </div>
              </div>
            </div>

            <div className="h-7 w-px bg-[#1b495e]" />

            {/* Pearls Counter */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="#f8efd6"
                  stroke="#695c3c"
                  strokeWidth="1.6"
                />
                <circle cx="9.5" cy="9.5" r="2.2" fill="#ffffff" />
              </svg>
              <div className="leading-none">
                <div className="text-[10px] uppercase tracking-wider text-[#c9b78a]">
                  Жемчуг
                </div>
                <div
                  className="text-lg font-bold tabular-nums text-[#fff5d9]"
                  data-testid="hud-pearls"
                >
                  {hud.pearls}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Compact Utility Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            tabIndex={-1}
            aria-label={hud.muted ? 'Включить звук (M)' : 'Выключить звук (M)'}
            title={hud.muted ? 'Включить звук [M]' : 'Выключить звук [M]'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-[#26e8d4]/30 text-[#c9f7f2] hover:border-[#26e8d4] cursor-pointer"
            style={{ backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
          >
            {hud.muted ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M22 9l-6 6M16 9l6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            )}
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Заново (R)"
            title="Заново [R]"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-[#26e8d4]/30 text-[#c9f7f2] hover:border-[#26e8d4] cursor-pointer"
            style={{ backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Пауза (Esc)"
            title="Пауза [Esc / P]"
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-[#26e8d4]/30 text-[#c9f7f2] hover:border-[#26e8d4] cursor-pointer"
            style={{ backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Projected 2-line NPC Speech Bubbles */}
      {hud.bubbles.map(
        (b) =>
          b.visible && (
            <div
              key={b.id}
              className="fixed z-20 -translate-x-1/2 -translate-y-full px-3.5 py-2 rounded-md border border-[#26e8d4]/45 shadow-[0_8px_24px_rgba(2,12,20,0.85)] max-w-xs text-center"
              style={{
                left: `${b.screenX}px`,
                top: `${b.screenY}px`,
                backgroundColor: 'rgba(6, 28, 44, 0.92)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#26e8d4]">
                {b.speaker}
              </div>
              <div className="mt-0.5 text-xs md:text-sm text-[#eefcfc] leading-snug">
                <div>{b.line1}</div>
                <div>{b.line2}</div>
              </div>
            </div>
          ),
      )}

      {/* Fleeting Toast or Egg Echo pinned near top-center so center viewport remains open */}
      {(hud.eggEchoText || hud.toastText) && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none max-w-[90vw]">
          {hud.eggEchoText && (
            <div
              className="px-4 py-1.5 rounded-md border border-[#26e8d4]/50 text-xs md:text-sm font-medium text-[#99fff4] text-center"
              style={{ backgroundColor: 'rgba(5, 32, 46, 0.9)' }}
            >
              {hud.eggEchoText}
            </div>
          )}
          {hud.toastText && (
            <div
              className="px-4 py-1.5 rounded-md border border-[#5ba1b8]/40 text-xs text-[#d6f4fa] text-center"
              style={{ backgroundColor: 'rgba(5, 22, 36, 0.88)' }}
            >
              {hud.toastText}
            </div>
          )}
        </div>
      )}

      {/* Bottom Minimalist Diving-Suit Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div
          className="px-3.5 py-2 rounded-md border border-[#26e8d4]/25 text-xs text-[#bdebf2]"
          style={{ backgroundColor: 'rgba(5, 24, 38, 0.82)' }}
        >
          {hud.objectiveText}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {hud.isHidden && (
            <div
              className="px-3 py-2 rounded-md border border-[#e86f8b]/55 text-xs font-semibold uppercase tracking-wider text-[#ffc2d1]"
              style={{ backgroundColor: 'rgba(42, 14, 30, 0.88)' }}
            >
              В укрытии · Незаметна
            </div>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onEmitCall();
            }}
            className={`px-3.5 py-2 rounded-md border text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
              callReady
                ? 'border-[#26e8d4] text-[#99fff4] hover:bg-[#134e5e]'
                : 'border-[#2a5468] text-[#7ca8b8]'
            }`}
            style={{ backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
          >
            <span className="tabular-nums">
              Зов [E] ·{' '}
              {callReady
                ? 'Готов'
                : `${hud.callCooldownRemaining.toFixed(1)}с`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
