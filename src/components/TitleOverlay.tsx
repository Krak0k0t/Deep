import React, { useLayoutEffect, useRef } from 'react';
import { ChapterId, ChapterRank } from '../game/campaign';
import { GameSettings } from '../game/gameSettings';
import { getLocale, t } from '../game/i18n';

interface TitleOverlayProps {
  visible: boolean;
  savedHighestChapter: number;
  savedPearls: number;
  bestRankByChapter: Partial<Record<ChapterId, ChapterRank>>;
  gameSettings: GameSettings;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onUpdateGameSettings?: (patch: Partial<GameSettings>) => void;
  onStart: () => void;
  onStartChapter: (chapter: ChapterId) => void;
  onNewGame: () => void;
  onSquidAnchorChange?: (ndcX: number, ndcY: number) => void;
  onSquidHoverChange?: (hovered: boolean) => void;
  onOpenControls: () => void;
  onOpenShop: () => void;
  onOpenJournal: () => void;
  onHoverSound?: () => void;
  onClickSound?: () => void;
}

const CHAPTER_ACCENTS: Record<ChapterId, { border: string; text: string; bg: string }> = {
  1: { border: 'border-[#26e8d4]/40 hover:border-[#26e8d4]', text: 'text-[#7ed6ce]', bg: 'rgba(6, 26, 40, 0.86)' },
  2: { border: 'border-[#26e8d4]/50 hover:border-[#26e8d4]', text: 'text-[#26e8d4]', bg: 'rgba(8, 34, 52, 0.88)' },
  3: { border: 'border-[#42e695]/55 hover:border-[#42e695]', text: 'text-[#42e695]', bg: 'rgba(9, 38, 36, 0.88)' },
  4: { border: 'border-[#61d5ff]/55 hover:border-[#61d5ff]', text: 'text-[#61d5ff]', bg: 'rgba(10, 28, 46, 0.88)' },
  5: { border: 'border-[#ff8a47]/55 hover:border-[#ff8a47]', text: 'text-[#ff9c59]', bg: 'rgba(30, 18, 22, 0.88)' },
  6: { border: 'border-[#3cf5e2]/55 hover:border-[#3cf5e2]', text: 'text-[#5cfcf0]', bg: 'rgba(7, 26, 38, 0.88)' },
  7: { border: 'border-[#74b9ff]/55 hover:border-[#74b9ff]', text: 'text-[#89c4ff]', bg: 'rgba(12, 26, 46, 0.88)' },
  8: { border: 'border-[#38f2b8]/55 hover:border-[#38f2b8]', text: 'text-[#61ffd0]', bg: 'rgba(8, 36, 34, 0.88)' },
  9: { border: 'border-[#ffb86c]/55 hover:border-[#ffb86c]', text: 'text-[#ffc885]', bg: 'rgba(26, 24, 38, 0.88)' },
  10: { border: 'border-[#99fff4]/60 hover:border-[#99fff4]', text: 'text-[#b5fff7]', bg: 'rgba(10, 42, 56, 0.88)' },
};

const PLANKTON_SPECKS = [
  { left: '8%', size: 4, dur: '14s', delay: '-2s' },
  { left: '19%', size: 3, dur: '18s', delay: '-7s' },
  { left: '31%', size: 5, dur: '16s', delay: '-11s' },
  { left: '44%', size: 3, dur: '20s', delay: '-4s' },
  { left: '57%', size: 4, dur: '15s', delay: '-9s' },
  { left: '68%', size: 3, dur: '19s', delay: '-14s' },
  { left: '79%', size: 5, dur: '17s', delay: '-6s' },
  { left: '91%', size: 3, dur: '21s', delay: '-12s' },
];

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  visible,
  savedHighestChapter,
  savedPearls,
  bestRankByChapter,
  gameSettings,
  onStart,
  onStartChapter,
  onNewGame,
  onSquidAnchorChange,
  onSquidHoverChange,
  onOpenControls,
  onOpenShop,
  onOpenJournal,
  onHoverSound,
  onClickSound,
}) => {
  const squidWindowRef = useRef<HTMLButtonElement | null>(null);
  const anchorCbRef = useRef(onSquidAnchorChange);
  anchorCbRef.current = onSquidAnchorChange;

  const lang = gameSettings.language;
  const dict = getLocale(lang);
  const hasSave = savedHighestChapter > 1 || savedPearls > 0;
  const maxUnlocked = Math.max(1, Math.min(10, Math.floor(savedHighestChapter)));
  const unlockedChapters = Array.from({ length: maxUnlocked }, (_, i) => (i + 1) as ChapterId);

  const statusText = hasSave
    ? t(lang, 'saveBadge', { chapter: savedHighestChapter, pearls: savedPearls })
    : `${dict.chapter1Short} · ${dict.chapter1Title}`;

  useLayoutEffect(() => {
    if (!visible) return;
    const updateAnchor = () => {
      const el = squidWindowRef.current;
      if (!el || window.innerWidth <= 0 || window.innerHeight <= 0) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const ndcX = (cx / window.innerWidth) * 2 - 1;
      const ndcY = -((cy / window.innerHeight) * 2 - 1);
      anchorCbRef.current?.(ndcX, ndcY);
    };

    updateAnchor();
    const rafId = window.requestAnimationFrame(updateAnchor);
    const timerId = window.setTimeout(updateAnchor, 60);
    window.addEventListener('resize', updateAnchor);
    const observer =
      typeof ResizeObserver !== 'undefined' && squidWindowRef.current
        ? new ResizeObserver(updateAnchor)
        : null;
    if (observer && squidWindowRef.current) {
      observer.observe(squidWindowRef.current);
      observer.observe(document.documentElement);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      window.removeEventListener('resize', updateAnchor);
      observer?.disconnect();
    };
  }, [visible, maxUnlocked, lang]);

  const interactiveClass = visible ? 'pointer-events-auto' : 'pointer-events-none';

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-20 flex flex-col justify-between pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] sm:p-6 md:p-10 pointer-events-none transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Localized Left & Bottom Edge Readability Scrims (keeps center-right ocean & squid 100% vivid) */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 h-20 pointer-events-none bg-gradient-to-t from-[#03131e]/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="fixed inset-y-0 start-0 w-full md:w-[48%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 18% 46%, rgba(3, 18, 28, 0.36) 0%, rgba(3, 18, 28, 0.12) 52%, rgba(3, 18, 28, 0) 78%)',
        }}
      />

      {/* Slowly rising underwater plankton particles */}
      {visible && (
        <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
          {PLANKTON_SPECKS.map((p, idx) => (
            <span
              key={idx}
              className="plankton-speck absolute bottom-0 rounded-full bg-[#74f7e8]/55"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: p.dur,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Minimal Top-Right Utility Trio (48x48px): Shop, Journal, Settings */}
      <div className={`fixed top-[max(0.75rem,env(safe-area-inset-top))] end-[max(0.75rem,env(safe-area-inset-right))] sm:top-5 sm:end-6 z-30 flex items-center gap-2 ${interactiveClass}`}>
        <button
          type="button"
          data-testid="open-shop-title-btn"
          aria-label={t(lang, 'btnShop', { pearls: savedPearls })}
          title={t(lang, 'btnShop', { pearls: savedPearls })}
          onMouseEnter={() => onHoverSound?.()}
          onClick={(e) => {
            e.currentTarget.blur();
            onClickSound?.();
            onOpenShop();
          }}
          className="shell-panel ui-jelly relative w-12 h-12 flex items-center justify-center text-[#f2e9cf] border-[#c9b78a]/40 hover:border-[#f5df9f] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="7" fill="#f2e9cf" fillOpacity="0.22" />
            <circle cx="9.5" cy="9.5" r="1.6" fill="#fffdf6" stroke="none" />
          </svg>
          {savedPearls > 0 && (
            <span className="absolute -bottom-1 -end-1 px-1.5 min-w-[18px] h-[18px] rounded-full bg-[#082436] border border-[#f2e9cf]/60 text-[10px] font-bold tabular-nums text-[#f2e9cf] flex items-center justify-center">
              {savedPearls}
            </span>
          )}
        </button>

        <button
          type="button"
          data-testid="open-journal-title-btn"
          aria-label={dict.btnJournal}
          title={dict.btnJournal}
          onMouseEnter={() => onHoverSound?.()}
          onClick={(e) => {
            e.currentTarget.blur();
            onClickSound?.();
            onOpenJournal();
          }}
          className="shell-panel ui-jelly w-12 h-12 flex items-center justify-center text-[#bcebf2] hover:border-[#26e8d4] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
            <path d="M4 5.5v16" />
            <path d="M9 8h7M9 12h5" />
          </svg>
        </button>

        <button
          type="button"
          data-testid="open-controls-title-btn"
          aria-label={dict.btnSettings}
          title={dict.btnSettings}
          onMouseEnter={() => onHoverSound?.()}
          onClick={(e) => {
            e.currentTarget.blur();
            onClickSound?.();
            onOpenControls();
          }}
          className="shell-panel ui-jelly w-12 h-12 flex items-center justify-center text-[#99fff4] hover:border-[#26e8d4] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <div aria-hidden="true" className="hidden lg:block h-4" />

      {/* Left-Aligned Vertically Centered Hero Lockup (keeps center-right fish & arches open) */}
      <div className="relative my-auto max-w-md md:max-w-lg pointer-events-none">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 [@media(max-height:500px)]:mb-1">
          <svg viewBox="0 0 36 36" className="w-5 h-5 shrink-0 ui-breathe" aria-hidden="true">
            <circle cx="18" cy="18" r="15" fill="rgba(7, 44, 68, 0.72)" stroke="#26e8d4" strokeWidth="1.4" />
            <path d="M9 18c4-5 11-5 15 0-4 5-11 5-15 0z" fill="#26e8d4" opacity="0.92" />
            <path d="M24 18l5-4v8l-5-4z" fill="#179c91" />
          </svg>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#8ef7ec] hud-text-shadow">
            {statusText}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl [@media(max-height:500px)]:text-3xl md:text-[3.4rem] font-bold tracking-tight text-[#dff6f7] title-glow leading-[1.03]">
          {dict.gameTitleLine1}
          <span className="block text-[#26e8d4]">{dict.gameTitleLine2}</span>
        </h1>

        <p className="mt-2 [@media(max-height:500px)]:mt-1 text-sm sm:text-base [@media(max-height:500px)]:text-xs text-[#dff6f7]/90 leading-snug hud-text-shadow max-w-sm [@media(max-height:500px)]:max-w-md">
          {dict.titleTagline}
        </p>

        {/* Swipeable Horizontal Chapter Carousel directly above primary CTA */}
        {maxUnlocked >= 2 && (
          <div
            data-testid="title-chapters-carousel"
            className={`mt-4 [@media(max-height:500px)]:mt-2.5 flex items-stretch gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 max-w-full ${interactiveClass}`}
          >
            {unlockedChapters.map((ch) => {
              const accent = CHAPTER_ACCENTS[ch];
              const shortStr = dict[`chapter${ch}Short` as keyof typeof dict];
              const titleStr = dict[`chapter${ch}Title` as keyof typeof dict];
              const rank = bestRankByChapter[ch];
              const rankColor =
                rank === 'S'
                  ? 'text-[#f5cf6e] border-[#f5cf6e]/55'
                  : rank === 'A'
                    ? 'text-[#5ef7e6] border-[#5ef7e6]/45'
                    : 'text-[#9de5f5] border-[#9de5f5]/35';
              return (
                <button
                  key={ch}
                  type="button"
                  data-testid={`select-chapter-${ch}-btn`}
                  onMouseEnter={() => onHoverSound?.()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onClickSound?.();
                    onStartChapter(ch);
                  }}
                  className={`ui-jelly snap-start shrink-0 w-36 sm:w-40 px-3 py-2 [@media(max-height:500px)]:py-1.5 rounded-[14px_8px_14px_8px] text-start border ${accent.border} cursor-pointer`}
                  style={{ backgroundColor: accent.bg }}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${accent.text}`}>
                      {shortStr}
                    </span>
                    {rank && (
                      <span
                        className={`px-1.5 rounded text-[10px] font-bold border ${rankColor}`}
                        style={{ backgroundColor: 'rgba(4, 18, 28, 0.88)' }}
                      >
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-[#dff6f7] truncate">
                    {titleStr}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive Living 3D Library Squid Start Button (no ring, no Begin Dive card) + Secondary New Game */}
        <div className="mt-4 [@media(max-height:500px)]:mt-2 ml-2 sm:ml-6 flex flex-wrap items-center gap-5 pointer-events-none">
          <button
            ref={squidWindowRef as React.RefObject<HTMLButtonElement>}
            type="button"
            data-start="true"
            data-testid="title-squid-window"
            aria-label={`${hasSave ? dict.btnContinueDive : dict.btnStartDive} — ${dict.titleTapSquidHint}`}
            title={`${hasSave ? dict.btnContinueDive : dict.btnStartDive} — ${dict.titleTapSquidHint}`}
            onMouseEnter={() => {
              onHoverSound?.();
              onSquidHoverChange?.(true);
            }}
            onMouseLeave={() => {
              onSquidHoverChange?.(false);
            }}
            onFocus={() => onSquidHoverChange?.(true)}
            onBlur={() => onSquidHoverChange?.(false)}
            onClick={(e) => {
              e.currentTarget.blur();
              onSquidHoverChange?.(false);
              onClickSound?.();
              onStart();
            }}
            className={`w-24 h-24 sm:w-28 sm:h-28 [@media(max-height:500px)]:w-20 [@media(max-height:500px)]:h-20 shrink-0 rounded-full bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#99fff4]/70 ${interactiveClass}`}
          />

          {hasSave && (
            <button
              type="button"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onNewGame();
              }}
              className={`ui-jelly min-h-[44px] [@media(max-height:500px)]:min-h-[38px] px-4 py-2 rounded-[16px_8px_16px_10px] text-xs font-medium text-[#d2eff5] hover:text-[#ffffff] border border-[#26e8d4]/35 hover:border-[#26e8d4]/75 cursor-pointer whitespace-nowrap ${interactiveClass}`}
              style={{ backgroundColor: 'rgba(5, 24, 38, 0.55)' }}
            >
              {dict.btnNewGame}
            </button>
          )}
        </div>
      </div>

      {/* Subtle Desktop-Only Control Hint Line */}
      <div className="relative hidden lg:flex items-center justify-between gap-3 text-xs text-[#91c4d2] tracking-wide hud-text-shadow">
        <span className="truncate">{dict.titleControlLine}</span>
        <span className="text-[#74e9dc]/90 font-medium ms-auto whitespace-nowrap">
          {dict.titleHintHeroClick}
        </span>
      </div>
    </div>
  );
};
