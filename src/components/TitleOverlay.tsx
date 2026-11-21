import React from 'react';

interface TitleOverlayProps {
  savedHighestChapter: number;
  savedPearls: number;
  onStart: () => void;
  onNewGame: () => void;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  savedHighestChapter,
  savedPearls,
  onStart,
  onNewGame,
}) => {
  const hasSave = savedHighestChapter > 1 || savedPearls > 0;

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-12 pointer-events-none">
      {/* Left negative-space hero lockup while Mama Fish & Egg float on the right */}
      <div
        className="my-auto max-w-md pointer-events-auto p-6 rounded-lg border border-[#26e8d4]/15"
        style={{ backgroundColor: 'rgba(3, 18, 29, 0.72)' }}
      >
        <div
          className="inline-flex items-center gap-3 mb-4 px-3 py-1.5 rounded-md border border-[#26e8d4]/30"
          style={{ backgroundColor: 'rgba(5, 24, 38, 0.9)' }}
        >
          <svg
            viewBox="0 0 36 36"
            className="w-7 h-7 shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="#072c44"
              stroke="#26e8d4"
              strokeWidth="1.5"
            />
            <path
              d="M9 18c4-5 11-5 15 0-4 5-11 5-15 0z"
              fill="#26e8d4"
              opacity="0.9"
            />
            <path d="M24 18l5-4v8l-5-4z" fill="#179c91" />
            <circle cx="13" cy="17" r="1.4" fill="#052236" />
            <circle cx="27" cy="11" r="2.2" fill="#99fff4" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ef7ec]">
            {hasSave
              ? `Сохранение · Глава ${savedHighestChapter} · ${savedPearls} жемч.`
              : 'Глава 1 · Тихий риф'}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#f0fffd] hud-text-shadow leading-[1.06]">
          Глубоководная
          <span className="block text-[#26e8d4]">рыбка</span>
        </h1>

        <p className="mt-4 text-sm md:text-base text-[#b6dce6] leading-relaxed hud-text-shadow max-w-sm">
          Сеть траулера вот-вот оборвётся на край рифа. Следуй за бирюзовым
          Зовом, прячься в кораллах и не потеряй свою икринку в бездне.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStart();
            }}
            className="px-7 py-3.5 rounded-md font-semibold text-base tracking-wide text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] active:bg-[#1cc8b6] transition-colors shadow-[0_8px_28px_rgba(38,232,212,0.32)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#99fff4]"
          >
            {hasSave ? 'Продолжить погружение' : 'Начать погружение'}
          </button>

          {hasSave && (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onNewGame();
              }}
              className="px-4 py-3.5 rounded-md font-medium text-sm text-[#bdebf2] border border-[#26e8d4]/30 hover:border-[#26e8d4] cursor-pointer"
              style={{ backgroundColor: 'rgba(5, 24, 38, 0.85)' }}
            >
              Новая игра
            </button>
          )}
        </div>
      </div>

      {/* Flat borderless bottom control hint */}
      <div className="text-xs md:text-sm text-[#95c6d4] tracking-wide hud-text-shadow">
        WASD / Стрелки — плыть · Мышь — курс · Space / C — глубина · E — Зов · Esc — пауза
      </div>
    </div>
  );
};
