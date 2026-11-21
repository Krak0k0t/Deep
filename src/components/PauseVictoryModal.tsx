import React from 'react';
import { HUDSnapshot } from '../game/UnderwaterEngine';

interface PauseVictoryModalProps {
  hud: HUDSnapshot;
  onResume: () => void;
  onRespawn: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseVictoryModal: React.FC<PauseVictoryModalProps> = ({
  hud,
  onResume,
  onRespawn,
  onRestart,
  onTitle,
}) => {
  if (hud.screenState !== 'paused' && hud.screenState !== 'gameover') {
    return null;
  }

  const isVictory = hud.screenState === 'gameover' && hud.outcome === 'victory';
  const isDefeat = hud.screenState === 'gameover' && hud.outcome === 'defeat';

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(2, 12, 20, 0.72)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-md border border-[#26e8d4]/45 p-6 md:p-7 shadow-[0_20px_56px_rgba(0,0,0,0.75)]"
        style={{ backgroundColor: 'rgba(5, 26, 40, 0.96)' }}
      >
        <div className="text-xs uppercase tracking-[0.2em] text-[#26e8d4]">
          {isVictory
            ? hud.completionLabel ?? 'Глава завершена'
            : isDefeat
              ? 'Кислород иссяк'
              : 'Погружение на паузе'}
        </div>

        <h2 className="mt-1.5 text-2xl font-bold text-[#f0fffd]">
          {isVictory
            ? '«...мама?..»'
            : isDefeat
              ? 'Тихий риф не отпускает'
              : 'Тихий риф'}
        </h2>

        <p className="mt-2 text-sm text-[#a8d5e0] leading-relaxed">
          {isVictory
            ? 'Вы проскользнули сквозь окна сети траулера и вышли к краю расщелины. Прогресс сохранён — открыта Глава 2: «Поющий кит».'
            : isDefeat
              ? 'Кальмар-ракета загнал вас в угол, но весь собранный жемчуг остался при вас. Возвращаемся ко входу в текущую зону.'
              : 'Вы всегда можете перевести дыхание или вернуться к началу рифа.'}
        </p>

        {/* Mastery / Progress Metrics */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div
            className="p-3 rounded border border-[#1d4c63]"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[#73a8b8]">
              Время
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-[#ebfffe]">
              {hud.elapsedSec}с
            </div>
          </div>
          <div
            className="p-3 rounded border border-[#1d4c63]"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[#c9b78a]">
              Жемчуг
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-[#fff5d9]">
              {hud.pearls}
            </div>
          </div>
          <div
            className="p-3 rounded border border-[#1d4c63]"
            style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[#73a8b8]">
              {isVictory ? 'Знакомства' : 'Смертей'}
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-[#ebfffe]">
              {isVictory ? `${hud.npcsMetCount}/2` : hud.totalDeaths}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          {hud.screenState === 'paused' && (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onResume();
              }}
              className="w-full py-2.5 rounded-md font-semibold text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              Продолжить
            </button>
          )}

          {isDefeat && (
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onRespawn();
              }}
              className="w-full py-2.5 rounded-md font-semibold text-sm text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              К чек-поинту зоны
            </button>
          )}

          <button
            type="button"
            data-start={isVictory ? 'true' : undefined}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className={`w-full py-2.5 rounded-md font-semibold text-sm cursor-pointer ${
              isVictory
                ? 'text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6]'
                : 'text-[#d4f7f4] border border-[#26e8d4]/35 hover:border-[#26e8d4]'
            }`}
            style={
              isVictory ? undefined : { backgroundColor: 'rgba(8, 36, 54, 0.9)' }
            }
          >
            {isVictory ? 'Пройти главу заново' : 'Начать главу сначала'}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onTitle();
            }}
            className="w-full py-2 rounded-md text-xs font-medium text-[#8dbec9] hover:text-[#ebfffe] cursor-pointer"
          >
            В главное меню
          </button>
        </div>
      </div>
    </div>
  );
};
