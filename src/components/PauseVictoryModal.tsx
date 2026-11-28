import React from 'react';
import { getLocale, t } from '../game/i18n';
import { HUDSnapshot } from '../game/UnderwaterEngine';

interface PauseVictoryModalProps {
  hud: HUDSnapshot;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResume: () => void;
  onNextChapter: () => void;
  onOpenControls: () => void;
  onOpenShop: () => void;
  onOpenJournal: () => void;
  onRespawn: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onHoverSound?: () => void;
  onClickSound?: () => void;
}

export const PauseVictoryModal: React.FC<PauseVictoryModalProps> = ({
  hud,
  isFullscreen,
  onToggleFullscreen,
  onResume,
  onNextChapter,
  onOpenControls,
  onOpenShop,
  onOpenJournal,
  onRespawn,
  onRestart,
  onTitle,
  onHoverSound,
  onClickSound,
}) => {
  if (hud.screenState !== 'paused' && hud.screenState !== 'gameover') {
    return null;
  }

  const lang = hud.gameSettings.language;
  const dict = getLocale(lang);
  const isVictory = hud.screenState === 'gameover' && hud.outcome === 'victory';
  const isDefeat = hud.screenState === 'gameover' && hud.outcome === 'defeat';
  const hasNextChapter = isVictory && hud.chapter >= 1 && hud.chapter < 10;

  const eyebrow = isVictory
    ? (dict[`ch${hud.chapter}CompleteLabel` as keyof typeof dict] ?? dict.ch1CompleteLabel)
    : isDefeat
      ? dict.modalDefeatEyebrow
      : dict.modalPauseEyebrow;

  const heading = isVictory
    ? (dict[`modalVictoryTitleCh${hud.chapter}` as keyof typeof dict] ?? dict.modalVictoryTitleCh1)
    : isDefeat
      ? t(lang, 'modalDefeatTitle', { chapter: hud.chapterTitle })
      : hud.chapterTitle;

  const desc = isVictory
    ? (dict[`modalVictoryDescCh${hud.chapter}` as keyof typeof dict] ?? dict.modalVictoryDescCh1)
    : isDefeat
      ? dict.modalDefeatDesc
      : dict.modalPauseDesc;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(2, 12, 20, 0.74)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        data-testid="pause-victory-dialog"
        className="w-full max-w-md rounded border border-[#26e8d4]/30 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.75)] overflow-hidden"
        style={{ backgroundColor: 'rgba(5, 24, 37, 0.96)' }}
      >
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#26e8d4] truncate">
            {eyebrow}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#f0fffd] truncate leading-tight">
            {heading}
          </h2>
        </div>

        <p className="mt-1 text-xs text-[#a8d5e0] leading-snug line-clamp-2">
          {desc}
        </p>

        {/* Compact Mastery / Progress Metrics */}
        <div
          className={`mt-2 grid gap-1.5 ${
            isVictory && hud.lastChapterRank ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          <div
            className="px-2 py-1.5 rounded border border-[#183d52]/80 flex items-baseline justify-between gap-1"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <span className="text-[10px] uppercase tracking-wide text-[#73a8b8] truncate">
              {dict.statTime}
            </span>
            <span className="text-sm font-bold tabular-nums text-[#ebfffe] shrink-0">
              {hud.elapsedSec}
              {dict.hudSecUnit}
            </span>
          </div>
          <div
            className="px-2 py-1.5 rounded border border-[#183d52]/80 flex items-baseline justify-between gap-1"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <span className="text-[10px] uppercase tracking-wide text-[#c9b78a] truncate">
              {dict.hudPearls}
            </span>
            <span className="text-sm font-bold tabular-nums text-[#fff5d9] shrink-0">
              {hud.pearls}
            </span>
          </div>
          <div
            className="px-2 py-1.5 rounded border border-[#183d52]/80 flex items-baseline justify-between gap-1"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <span className="text-[10px] uppercase tracking-wide text-[#73a8b8] truncate">
              {isVictory ? dict.statMet : dict.statDeaths}
            </span>
            <span className="text-sm font-bold tabular-nums text-[#ebfffe] shrink-0">
              {isVictory ? `${hud.npcsMetCount}/${hud.npcsTotal}` : hud.totalDeaths}
            </span>
          </div>
          {isVictory && hud.lastChapterRank && (
            <div
              data-testid="victory-rank-card"
              className={`px-2 py-1.5 rounded border flex items-baseline justify-between gap-1 ${
                hud.lastChapterRank === 'S'
                  ? 'border-[#f5cf6e]/50'
                  : hud.lastChapterRank === 'A'
                    ? 'border-[#26e8d4]/40'
                    : 'border-[#183d52]/80'
              }`}
              style={{ backgroundColor: 'rgba(4, 18, 29, 0.9)' }}
            >
              <span className="text-[10px] uppercase tracking-wide text-[#73a8b8] truncate">
                {dict.statRank}
              </span>
              <span
                className={`text-sm font-bold tabular-nums shrink-0 ${
                  hud.lastChapterRank === 'S'
                    ? 'text-[#f5cf6e]'
                    : hud.lastChapterRank === 'A'
                      ? 'text-[#5ef7e6]'
                      : 'text-[#ebfffe]'
                }`}
              >
                {hud.lastChapterRank}
              </span>
            </div>
          )}
        </div>

        {isVictory && hud.awardedSRankBonus && (
          <div
            data-testid="victory-s-rank-bonus"
            className="mt-1.5 px-2.5 py-1 rounded border border-[#f5cf6e]/40 text-[11px] font-semibold text-[#ffe8ad] text-center"
            style={{ backgroundColor: 'rgba(38, 29, 10, 0.88)' }}
          >
            {dict.rankSBonus}
          </div>
        )}

        {/* Primary CTA + Compact Multi-Column Secondary Grid */}
        <div className="mt-2.5 space-y-1.5">
          {hud.screenState === 'paused' && (
            <button
              type="button"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onResume();
              }}
              className="w-full py-2 rounded font-semibold text-xs sm:text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              {dict.btnResume}
            </button>
          )}

          {hasNextChapter && (
            <button
              type="button"
              data-start="true"
              data-testid="next-chapter-btn"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onNextChapter();
              }}
              className="w-full py-2 rounded font-semibold text-xs sm:text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              {dict[`btnNextChapter${hud.chapter + 1}` as keyof typeof dict] ?? dict.btnNextChapter2}
            </button>
          )}

          {isDefeat && (
            <button
              type="button"
              data-start="true"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onRespawn();
              }}
              className="w-full py-2 rounded font-semibold text-xs sm:text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              {dict.btnRespawn}
            </button>
          )}

          {isVictory && !hasNextChapter && (
            <button
              type="button"
              data-start="true"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onRestart();
              }}
              className="w-full py-2 rounded font-semibold text-xs sm:text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              {dict.btnPlayAgain}
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {(hud.screenState === 'paused' || isVictory) && (
              <>
                <button
                  type="button"
                  data-testid={hud.screenState === 'paused' ? 'open-shop-pause-btn' : 'open-shop-victory-btn'}
                  onMouseEnter={() => onHoverSound?.()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onClickSound?.();
                    onOpenShop();
                  }}
                  className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#fff5d9] border border-[#c9b78a]/30 hover:border-[#f5df9f] cursor-pointer truncate"
                  style={{ backgroundColor: 'rgba(18, 28, 36, 0.9)' }}
                >
                  {t(lang, 'btnPearlShop', { pearls: hud.pearls })}
                </button>
                <button
                  type="button"
                  data-testid={hud.screenState === 'paused' ? 'open-journal-pause-btn' : 'open-journal-victory-btn'}
                  onMouseEnter={() => onHoverSound?.()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onClickSound?.();
                    onOpenJournal();
                  }}
                  className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#d4f7f4] border border-[#183d52]/80 hover:border-[#26e8d4] cursor-pointer truncate"
                  style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
                >
                  {dict.btnJournal}
                </button>
              </>
            )}

            {hud.screenState === 'paused' && (
              <button
                type="button"
                data-testid="open-controls-pause-btn"
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onOpenControls();
                }}
                className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#d4f7f4] border border-[#183d52]/80 hover:border-[#26e8d4] cursor-pointer truncate"
                style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
              >
                {dict.btnSettings}
              </button>
            )}

            <button
              type="button"
              data-testid="pause-fullscreen-btn"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onToggleFullscreen();
              }}
              className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#d4f7f4] border border-[#183d52]/80 hover:border-[#26e8d4] cursor-pointer truncate"
              style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
            >
              {isFullscreen ? dict.btnExitFullscreen : dict.btnFullscreen}
            </button>

            {(!isVictory || hasNextChapter) && (
              <button
                type="button"
                onMouseEnter={() => onHoverSound?.()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClickSound?.();
                  onRestart();
                }}
                className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#d4f7f4] border border-[#183d52]/80 hover:border-[#26e8d4] cursor-pointer truncate"
                style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
              >
                {isVictory ? dict.btnPlayAgain : dict.btnRestartChapter}
              </button>
            )}

            <button
              type="button"
              data-testid="pause-menu-btn"
              onMouseEnter={() => onHoverSound?.()}
              onClick={(e) => {
                e.currentTarget.blur();
                onClickSound?.();
                onTitle();
              }}
              className="py-1.5 px-2 rounded font-semibold text-[11px] sm:text-xs text-[#9ecad4] border border-[#183d52]/70 hover:border-[#26e8d4]/55 hover:text-[#ebfffe] cursor-pointer truncate"
              style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
            >
              {dict.btnReturnMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
