import React, { useRef, useState } from 'react';
import { getLocale } from '../game/i18n';

export interface MobileControlsProps {
  visible?: boolean;
  language: string;
  hasDashMutation: boolean;
  callReady: boolean;
  dashReady: boolean;
  highContrastSymbols?: boolean;
  reducedEffects?: boolean;
  onMoveVector: (x: number, y: number, ascend: boolean, descend: boolean) => void;
  onEmitCall: () => void;
  onTriggerDash: () => void;
  onInteract: () => void;
  onStopFish: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  visible = true,
  language,
  hasDashMutation,
  callReady,
  dashReady,
  highContrastSymbols = false,
  reducedEffects = false,
  onMoveVector,
  onEmitCall,
  onTriggerDash,
  onInteract,
  onStopFish,
}) => {
  const dict = getLocale(language);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const padRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const vecRef = useRef({ x: 0, y: 0 });
  const elevRef = useRef({ ascend: false, descend: false });

  const [dynamicOrigin, setDynamicOrigin] = useState<{ x: number; y: number } | null>(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [ascendHeld, setAscendHeld] = useState(false);
  const [descendHeld, setDescendHeld] = useState(false);
  const [radialOpen, setRadialOpen] = useState(false);

  if (!visible) return null;

  const MAX_RADIUS = 38;

  const triggerHaptic = (ms: number) => {
    if (reducedEffects) return;
    try {
      navigator.vibrate?.(ms);
    } catch {
      // Ignore browsers without vibration permission
    }
  };

  const pushUpdate = (nx: number, ny: number, ascend: boolean, descend: boolean) => {
    vecRef.current = { x: nx, y: ny };
    elevRef.current = { ascend, descend };
    onMoveVector(nx, ny, ascend, descend);
  };

  const updateStickFromPointer = (clientX: number, clientY: number) => {
    const origin = originRef.current;
    let cx = origin?.x ?? 0;
    let cy = origin?.y ?? 0;
    if (!origin) {
      const el = padRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      cx = rect.left + rect.width * 0.5;
      cy = rect.top + rect.height * 0.5;
    }

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }
    setKnobOffset({ x: dx, y: dy });
    pushUpdate(dx / MAX_RADIUS, dy / MAX_RADIUS, elevRef.current.ascend, elevRef.current.descend);
  };

  const resetStick = () => {
    activePointerId.current = null;
    originRef.current = null;
    setDynamicOrigin(null);
    setKnobOffset({ x: 0, y: 0 });
    pushUpdate(0, 0, elevRef.current.ascend, elevRef.current.descend);
  };

  const handleZonePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);

    const vw = window.innerWidth || 800;
    const vh = window.innerHeight || 600;
    const clampedX = Math.max(66, Math.min(vw * 0.46, e.clientX));
    const clampedY = Math.max(110, Math.min(vh - 66, e.clientY));
    const origin = { x: clampedX, y: clampedY };
    originRef.current = origin;
    setDynamicOrigin(origin);
    setKnobOffset({ x: 0, y: 0 });
    pushUpdate(0, 0, elevRef.current.ascend, elevRef.current.descend);
  };

  return (
    <div
      data-testid="touch-controls-overlay"
      className="fixed inset-0 z-20 pointer-events-none select-none"
      dir="ltr"
    >
      {/* Left Half: Dynamic Floating Virtual Swim Joystick Zone */}
      <div
        ref={zoneRef}
        data-testid="touch-joystick-zone"
        onPointerDown={handleZonePointerDown}
        onPointerMove={(e) => {
          if (activePointerId.current !== e.pointerId) return;
          e.stopPropagation();
          updateStickFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (activePointerId.current !== e.pointerId) return;
          e.stopPropagation();
          resetStick();
        }}
        onPointerCancel={() => {
          resetStick();
        }}
        className="pointer-events-auto fixed left-0 top-16 bottom-0 w-1/2 touch-none"
      >
        <div
          ref={padRef}
          data-testid="touch-joystick"
          className={`fixed w-24 h-24 rounded-full border flex items-center justify-center pointer-events-none transition-opacity duration-150 ${
            dynamicOrigin
              ? 'border-[#5ef7e6]/80 opacity-100'
              : 'border-[#26e8d4]/40 opacity-55 left-[max(20px,env(safe-area-inset-left))] bottom-[max(20px,env(safe-area-inset-bottom))]'
          }`}
          style={{
            ...(dynamicOrigin
              ? {
                  left: `${dynamicOrigin.x - 48}px`,
                  top: `${dynamicOrigin.y - 48}px`,
                }
              : {}),
            background:
              'radial-gradient(circle at 50% 45%, rgba(14, 54, 74, 0.56) 0%, rgba(5, 22, 34, 0.78) 100%)',
            boxShadow: '0 8px 24px rgba(3, 14, 22, 0.55)',
          }}
        >
          <div
            className="w-11 h-11 rounded-full border border-[#99fff4]/75 shadow-[0_0_16px_rgba(38,232,212,0.4)] transition-transform duration-75"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, rgba(148, 255, 244, 0.7), rgba(38, 232, 212, 0.34))',
              transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            }}
          />
          <span className="absolute top-1.5 text-[9px] uppercase tracking-wider text-[#9ad5e0]/85 font-semibold">
            {dict.touchSwim}
          </span>
        </div>
      </div>

      {/* Right Thumb Zone (>= 20px Safe-Area Margin) */}
      <div className="pointer-events-auto fixed bottom-[max(20px,env(safe-area-inset-bottom))] right-[max(20px,env(safe-area-inset-right))] flex items-end gap-3 touch-none">
        {/* Radial Depth / Interact / Brake Wheel Anchor */}
        <div className="relative flex items-center justify-center">
          {/* Ascend */}
          <button
            type="button"
            aria-label={dict.actAscend}
            data-testid="mobile-radial-ascend"
            onPointerDown={(e) => {
              e.stopPropagation();
              setAscendHeld(true);
              pushUpdate(vecRef.current.x, vecRef.current.y, true, elevRef.current.descend);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setAscendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, false, elevRef.current.descend);
            }}
            onPointerLeave={() => {
              if (!ascendHeld) return;
              setAscendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, false, elevRef.current.descend);
            }}
            onPointerCancel={() => {
              setAscendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, false, elevRef.current.descend);
            }}
            className={`absolute w-11 h-11 rounded-full border text-sm font-bold flex items-center justify-center transition-transform duration-200 ease-out ${
              radialOpen
                ? '-translate-x-[74px] -translate-y-[54px] scale-100 opacity-100 pointer-events-auto'
                : 'translate-x-0 translate-y-0 scale-0 opacity-0 pointer-events-none'
            } ${
              ascendHeld
                ? 'border-[#26e8d4] bg-[#165363] text-[#ffffff]'
                : 'border-[#26e8d4]/45 text-[#99fff4]'
            }`}
            style={{ backgroundColor: ascendHeld ? undefined : 'rgba(6, 28, 44, 0.9)' }}
          >
            ↑
          </button>

          {/* Interact */}
          <button
            type="button"
            data-testid="touch-interact-btn"
            aria-label={dict.touchInteract}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(12);
              onInteract();
            }}
            className={`ui-jelly absolute px-3 h-11 rounded-full border border-[#99fff4]/60 text-[11px] font-bold uppercase tracking-wider text-[#dff6f7] flex items-center justify-center transition-transform duration-200 ease-out whitespace-nowrap ${
              radialOpen
                ? '-translate-x-[42px] -translate-y-[104px] scale-100 opacity-100 pointer-events-auto'
                : 'translate-x-0 translate-y-0 scale-0 opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: 'rgba(8, 38, 56, 0.92)' }}
          >
            {highContrastSymbols ? '◆ ' : ''}
            {dict.touchInteract}
          </button>

          {/* Descend */}
          <button
            type="button"
            aria-label={dict.actDescend}
            data-testid="mobile-radial-descend"
            onPointerDown={(e) => {
              e.stopPropagation();
              setDescendHeld(true);
              pushUpdate(vecRef.current.x, vecRef.current.y, elevRef.current.ascend, true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setDescendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, elevRef.current.ascend, false);
            }}
            onPointerLeave={() => {
              if (!descendHeld) return;
              setDescendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, elevRef.current.ascend, false);
            }}
            onPointerCancel={() => {
              setDescendHeld(false);
              pushUpdate(vecRef.current.x, vecRef.current.y, elevRef.current.ascend, false);
            }}
            className={`absolute w-11 h-11 rounded-full border text-sm font-bold flex items-center justify-center transition-transform duration-200 ease-out ${
              radialOpen
                ? 'translate-x-[20px] -translate-y-[112px] scale-100 opacity-100 pointer-events-auto'
                : 'translate-x-0 translate-y-0 scale-0 opacity-0 pointer-events-none'
            } ${
              descendHeld
                ? 'border-[#26e8d4] bg-[#165363] text-[#ffffff]'
                : 'border-[#26e8d4]/45 text-[#99fff4]'
            }`}
            style={{ backgroundColor: descendHeld ? undefined : 'rgba(6, 28, 44, 0.9)' }}
          >
            ↓
          </button>

          {/* Stop */}
          <button
            type="button"
            data-testid="touch-stop-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStopFish();
            }}
            className={`ui-jelly absolute px-2.5 h-10 rounded-full border border-[#5ba1b8]/55 text-[11px] font-semibold text-[#d6f4fa] flex items-center justify-center transition-transform duration-200 ease-out whitespace-nowrap ${
              radialOpen
                ? '-translate-x-[76px] -translate-y-[6px] scale-100 opacity-100 pointer-events-auto'
                : 'translate-x-0 translate-y-0 scale-0 opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: 'rgba(5, 24, 38, 0.9)' }}
          >
            {dict.touchStop}
          </button>

          {/* Radial Wheel Toggle */}
          <button
            type="button"
            data-testid="mobile-radial-toggle"
            aria-expanded={radialOpen}
            aria-label={dict.mobileRadialActions}
            onClick={(e) => {
              e.stopPropagation();
              setRadialOpen((prev) => !prev);
            }}
            className={`ui-jelly w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold shadow-[0_6px_18px_rgba(3,14,22,0.68)] cursor-pointer ${
              radialOpen
                ? 'border-[#99fff4] text-[#04202e] bg-[#5ef7e6]'
                : 'border-[#26e8d4]/45 text-[#99fff4] opacity-85 hover:opacity-100'
            }`}
            style={
              radialOpen
                ? undefined
                : {
                    background:
                      'radial-gradient(circle at 35% 35%, rgba(16, 62, 82, 0.88), rgba(5, 24, 38, 0.9))',
                  }
            }
          >
            <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform duration-200 ${radialOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
              <path d="M12 4v3M12 17v3M4 12h3M17 12h3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Dash (Boost): Positioned directly above-left of Call with double-arrow speed icon */}
        {hasDashMutation && (
          <button
            type="button"
            data-testid="touch-dash-btn"
            aria-label={dict.touchBoost}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(18);
              onTriggerDash();
            }}
            className={`ui-jelly absolute right-14 bottom-16 w-12 h-12 rounded-full border flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(3,14,22,0.68)] cursor-pointer ${
              dashReady
                ? 'border-[#f2b857] text-[#ffe8ad] opacity-100'
                : 'border-[#4a4532] text-[#8f856b] opacity-75'
            }`}
            style={{ backgroundColor: 'rgba(18, 28, 36, 0.88)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 17l5-5-5-5" />
              <path d="M13 17l5-5-5-5" />
            </svg>
          </button>
        )}

        {/* Primary Call / Echo Button: reduced ~15% (w-14 h-14), opacity 80% on cooldown, pulsing 100% when ready */}
        <button
          type="button"
          data-testid="touch-call-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic(18);
            onEmitCall();
          }}
          className={`ui-jelly w-14 h-14 rounded-full border text-[11px] font-bold uppercase tracking-wider flex flex-col items-center justify-center cursor-pointer ${
            callReady
              ? 'border-[#99fff4] text-[#04202e] bg-gradient-to-br from-[#26e8d4] to-[#68fff0] opacity-100 ui-breathe shadow-[0_8px_24px_rgba(38,232,212,0.42)]'
              : 'border-[#2a5468] text-[#9ec4d1] opacity-80'
          }`}
          style={callReady ? undefined : { backgroundColor: 'rgba(5, 24, 38, 0.86)' }}
        >
          {highContrastSymbols && <span className="text-[9px] leading-none">◉</span>}
          <span>{dict.touchCall}</span>
        </button>
      </div>
    </div>
  );
};
