import React, { useEffect, useState } from 'react';
import {
  ControlSettings,
  GameAction,
  MouseAction,
  MouseBinding,
  MouseLookMode,
  rebindKey,
} from '../game/controlSettings';
import {
  DifficultyId,
  GameSettings,
  GraphicsQualityId,
  TouchControlsMode,
} from '../game/gameSettings';
import {
  formatLocalizedKeyCode,
  formatLocalizedMouseBinding,
  getLocale,
  getLocalizedActionLabel,
  SUPPORTED_LANGUAGES,
  t,
} from '../game/i18n';
import { useCompactViewport } from '../hooks/useCompactViewport';

interface ControlsSettingsModalProps {
  open: boolean;
  controlSettings: ControlSettings;
  gameSettings: GameSettings;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onUpdateControls: (patch: Partial<ControlSettings>) => void;
  onUpdateGameSettings: (patch: Partial<GameSettings>) => void;
  onResetControls: () => void;
  onClose: () => void;
  onHoverSound?: () => void;
  onClickSound?: () => void;
}

const KEY_ACTIONS: GameAction[] = [
  'forward',
  'backward',
  'turnLeft',
  'turnRight',
  'ascend',
  'descend',
  'call',
  'dash',
  'stopFish',
  'pause',
  'restart',
  'mute',
  'fullscreen',
];

const MOUSE_ACTIONS: MouseAction[] = ['moveToPoint', 'holdSwim', 'interact'];
const MOUSE_BINDING_VALUES: MouseBinding[] = [
  'LMB',
  'DBL_LMB',
  'RMB',
  'MMB',
  'NONE',
];
const DIFFICULTIES: DifficultyId[] = ['calm', 'standard', 'abyssal'];
const QUALITIES: GraphicsQualityId[] = ['very_low', 'low', 'medium', 'high', 'ultra'];
const TOUCH_MODES: TouchControlsMode[] = ['auto', 'on', 'off'];

const ToggleRow: React.FC<{
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}> = ({ id, label, hint, checked, disabled, onChange }) => (
  <label
    htmlFor={id}
    className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded border border-[#183d52]/80 ${
      disabled
        ? 'opacity-45 cursor-not-allowed'
        : 'cursor-pointer hover:border-[#26e8d4]/45'
    }`}
    style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
  >
    <div className="min-w-0">
      <div className="text-xs font-medium text-[#e6fcfb] leading-tight truncate">
        {label}
      </div>
      {hint && (
        <div className="text-[10px] text-[#7eb2c2] mt-0.5 leading-tight line-clamp-1">
          {hint}
        </div>
      )}
    </div>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="h-3.5 w-3.5 accent-[#26e8d4] shrink-0 cursor-pointer"
    />
  </label>
);

export const ControlsSettingsModal: React.FC<ControlsSettingsModalProps> = ({
  open,
  controlSettings,
  gameSettings,
  isFullscreen,
  onToggleFullscreen,
  onUpdateControls,
  onUpdateGameSettings,
  onResetControls,
  onClose,
  onHoverSound,
  onClickSound,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'controls'>('general');
  const [page, setPage] = useState(0);
  const [listeningAction, setListeningAction] = useState<GameAction | null>(null);
  const { isCompact, isShort } = useCompactViewport();

  const lang = gameSettings.language;
  const dict = getLocale(lang);

  useEffect(() => {
    if (!open) {
      setListeningAction(null);
      setActiveTab('general');
      setPage(0);
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (listeningAction) {
        e.stopPropagation();
        e.preventDefault();
        if (e.code === 'Escape') {
          setListeningAction(null);
          return;
        }
        const code = e.code || e.key;
        if (code) {
          const updated = rebindKey(
            controlSettings.keyBindings,
            listeningAction,
            code,
          );
          onUpdateControls({ keyBindings: updated });
          setListeningAction(null);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, listeningAction, controlSettings.keyBindings, onUpdateControls, onClose]);

  if (!open) return null;

  const handleMouseBindingChange = (action: MouseAction, binding: MouseBinding) => {
    const nextMouse = {
      ...controlSettings.mouseBindings,
      [action]: binding,
    };
    const patch: Partial<ControlSettings> = { mouseBindings: nextMouse };
    if (action === 'moveToPoint') {
      patch.doubleClickMove = binding !== 'NONE';
    } else if (action === 'holdSwim') {
      patch.lmbHoldToSwim = binding !== 'NONE';
    }
    onUpdateControls(patch);
  };

  const getMouseActionLabel = (action: MouseAction) => {
    if (action === 'moveToPoint') return dict.mActMoveToPoint;
    if (action === 'holdSwim') return dict.mActHoldSwim;
    return dict.mActInteract;
  };

  const totalPages =
    activeTab === 'general'
      ? isCompact
        ? 3
        : 1
      : isCompact
        ? 4
        : 1;
  const safePage = Math.min(page, totalPages - 1);

  const renderKeyRebindCard = (action: GameAction) => {
    const isListening = listeningAction === action;
    const currentCode = controlSettings.keyBindings[action];
    return (
      <div
        key={action}
        className="flex items-center justify-between gap-1.5 px-1.5 py-1 rounded border border-[#183d52]/75"
        style={{ backgroundColor: 'rgba(6, 28, 42, 0.85)' }}
      >
        <span className="text-[11px] text-[#d9f7f6] truncate">
          {getLocalizedActionLabel(action, lang)}
        </span>
        <button
          type="button"
          data-testid={`rebind-key-${action}`}
          onClick={() => {
            onClickSound?.();
            setListeningAction(isListening ? null : action);
          }}
          className={`px-1.5 py-0.5 min-w-[46px] rounded text-[11px] font-semibold tabular-nums cursor-pointer transition-colors shrink-0 ${
            isListening
              ? 'bg-[#26e8d4] text-[#031d29]'
              : 'border border-[#26e8d4]/30 text-[#99fff4] hover:border-[#26e8d4]'
          }`}
          style={
            isListening
              ? undefined
              : { backgroundColor: 'rgba(5, 22, 34, 0.95)' }
          }
        >
          {isListening
            ? dict.pressKeyPrompt
            : formatLocalizedKeyCode(currentCode, lang)}
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(2, 12, 20, 0.82)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="controls-settings-title"
        data-testid="controls-settings-dialog"
        className={`w-full max-w-3xl overflow-hidden rounded border border-[#26e8d4]/30 shadow-[0_18px_48px_rgba(0,0,0,0.78)] ${
          isShort ? 'px-3 py-2' : 'p-3 sm:p-3.5'
        }`}
        style={{ backgroundColor: 'rgba(5, 24, 37, 0.97)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#26e8d4] leading-none">
              {dict.settingsEyebrow}
            </div>
            <h2
              id="controls-settings-title"
              className="mt-0.5 text-base sm:text-lg font-bold text-[#f0fffd] truncate leading-tight"
            >
              {dict.settingsTitle}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="settings-fullscreen-btn"
              onMouseEnter={() => onHoverSound?.()}
              onClick={() => {
                onClickSound?.();
                onToggleFullscreen();
              }}
              className="h-7 px-2 text-[11px] flex items-center justify-center rounded border border-[#183d52]/80 text-[#bdebf2] hover:border-[#26e8d4] cursor-pointer"
              style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
            >
              {isFullscreen ? dict.btnExitFullscreen : dict.btnFullscreen}
            </button>
            <button
              type="button"
              aria-label={dict.btnDone}
              onClick={() => {
                onClickSound?.();
                onClose();
              }}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#183d52]/80 text-xs text-[#bdebf2] hover:border-[#26e8d4] cursor-pointer"
              style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs + Page Indicator */}
        <div className="mt-1.5 flex items-center justify-between gap-2 border-b border-[#183d52]/70 pb-1.5">
          <div className="flex gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'general'}
              data-testid="settings-tab-general"
              onClick={() => {
                onClickSound?.();
                setActiveTab('general');
                setPage(0);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'general'
                  ? 'bg-[#26e8d4] text-[#031d29]'
                  : 'text-[#bdebf2] hover:bg-[#0d354a]'
              }`}
            >
              {dict.tabGeneral}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'controls'}
              data-testid="settings-tab-controls"
              onClick={() => {
                onClickSound?.();
                setActiveTab('controls');
                setPage(0);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'controls'
                  ? 'bg-[#26e8d4] text-[#031d29]'
                  : 'text-[#bdebf2] hover:bg-[#0d354a]'
              }`}
            >
              {dict.tabControls}
            </button>
          </div>

          {totalPages > 1 && (
            <span className="text-xs font-semibold tabular-nums text-[#8ec1cf]">
              {safePage + 1} / {totalPages}
            </span>
          )}
        </div>

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="mt-2 space-y-1.5">
            {(!isCompact || safePage === 0) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {/* Language */}
                  <div
                    className="p-2 rounded border border-[#183d52]/80"
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                  >
                    <label
                      htmlFor="settings-language-select"
                      className="block text-[11px] font-medium text-[#e6fcfb] leading-none"
                    >
                      {dict.labelLanguage}
                    </label>
                    <select
                      id="settings-language-select"
                      data-testid="settings-language-select"
                      value={lang}
                      onChange={(e) => {
                        onClickSound?.();
                        onUpdateGameSettings({ language: e.target.value });
                      }}
                      className="mt-1 w-full rounded border border-[#1d4c63] px-2 py-1 text-xs text-[#ebfffe] focus:outline-none focus:border-[#26e8d4] cursor-pointer"
                      style={{ backgroundColor: '#052236' }}
                    >
                      {SUPPORTED_LANGUAGES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nativeName} ({item.englishName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Touch Controls Mode */}
                  <div
                    className="p-2 rounded border border-[#183d52]/80"
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                  >
                    <div className="text-[11px] font-medium text-[#e6fcfb] mb-1 leading-none">
                      {dict.labelTouchControls}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {TOUCH_MODES.map((m) => {
                        const active = gameSettings.touchControls === m;
                        const label =
                          m === 'auto'
                            ? dict.touchAuto
                            : m === 'on'
                              ? dict.touchOn
                              : dict.touchOff;
                        return (
                          <button
                            key={m}
                            type="button"
                            data-testid={`settings-touch-${m}`}
                            onClick={() => {
                              onClickSound?.();
                              onUpdateGameSettings({ touchControls: m });
                            }}
                            className={`py-1 px-1.5 rounded border text-[11px] font-semibold cursor-pointer transition-colors truncate ${
                              active
                                ? 'border-[#26e8d4] bg-[#26e8d4] text-[#031d29]'
                                : 'border-[#183d52]/80 text-[#bdebf2] hover:border-[#26e8d4]/50'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {isCompact && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div
                      className="p-2 rounded border border-[#183d52]/80"
                      style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                        <label htmlFor="settings-music-vol">{dict.labelMusicVol}</label>
                        <span className="tabular-nums font-semibold text-[#26e8d4]">
                          {Math.round(gameSettings.musicVolume * 100)}%
                        </span>
                      </div>
                      <input
                        id="settings-music-vol"
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={gameSettings.musicVolume}
                        onChange={(e) =>
                          onUpdateGameSettings({ musicVolume: parseFloat(e.target.value) })
                        }
                        className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                      />
                    </div>
                    <div
                      className="p-2 rounded border border-[#183d52]/80"
                      style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                        <label htmlFor="settings-sfx-vol">{dict.labelSfxVol}</label>
                        <span className="tabular-nums font-semibold text-[#26e8d4]">
                          {Math.round(gameSettings.sfxVolume * 100)}%
                        </span>
                      </div>
                      <input
                        id="settings-sfx-vol"
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={gameSettings.sfxVolume}
                        onChange={(e) =>
                          onUpdateGameSettings({ sfxVolume: parseFloat(e.target.value) })
                        }
                        className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {(!isCompact || safePage === 1) && (
              <>
                {/* Difficulty */}
                <div
                  className="p-2 rounded border border-[#183d52]/80"
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <div className="text-[11px] font-medium text-[#e6fcfb] mb-1 leading-none">
                    {dict.labelDifficulty}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DIFFICULTIES.map((d) => {
                      const active = gameSettings.difficulty === d;
                      const name =
                        d === 'calm'
                          ? dict.diffCalmName
                          : d === 'abyssal'
                            ? dict.diffAbyssalName
                            : dict.diffStandardName;
                      const desc =
                        d === 'calm'
                          ? dict.diffCalmDesc
                          : d === 'abyssal'
                            ? dict.diffAbyssalDesc
                            : dict.diffStandardDesc;
                      return (
                        <button
                          key={d}
                          type="button"
                          data-testid={`settings-diff-${d}`}
                          onMouseEnter={() => onHoverSound?.()}
                          onClick={() => {
                            onClickSound?.();
                            onUpdateGameSettings({ difficulty: d });
                          }}
                          className={`p-1.5 rounded border text-start cursor-pointer transition-colors ${
                            active
                              ? 'border-[#26e8d4] bg-[#0d3b50]'
                              : 'border-[#183d52]/80 hover:border-[#26e8d4]/50'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#ebfffe] truncate leading-tight">
                            {name}
                          </div>
                          <div className="mt-0.5 text-[10px] text-[#8ec1cf] leading-tight line-clamp-1">
                            {desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graphics Quality */}
                <div
                  className="p-2 rounded border border-[#183d52]/80"
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <div className="text-[11px] font-medium text-[#e6fcfb] mb-1 leading-none">
                    {dict.labelQuality}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {QUALITIES.map((q) => {
                      const active = gameSettings.graphicsQuality === q;
                      const label =
                        q === 'very_low'
                          ? dict.qualVeryLow
                          : q === 'low'
                            ? dict.qualLow
                            : q === 'medium'
                              ? dict.qualMedium
                              : q === 'high'
                                ? dict.qualHigh
                                : dict.qualUltra;
                      return (
                        <button
                          key={q}
                          type="button"
                          data-testid={`settings-quality-${q}`}
                          onMouseEnter={() => onHoverSound?.()}
                          onClick={() => {
                            onClickSound?.();
                            onUpdateGameSettings({ graphicsQuality: q });
                          }}
                          className={`py-1 px-1.5 rounded border text-[11px] font-semibold cursor-pointer transition-colors truncate ${
                            active
                              ? 'border-[#26e8d4] bg-[#26e8d4] text-[#031d29]'
                              : 'border-[#183d52]/80 text-[#bdebf2] hover:border-[#26e8d4]/50'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isCompact && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div
                      className="p-2 rounded border border-[#183d52]/80"
                      style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                        <label htmlFor="settings-music-vol">{dict.labelMusicVol}</label>
                        <span className="tabular-nums font-semibold text-[#26e8d4]">
                          {Math.round(gameSettings.musicVolume * 100)}%
                        </span>
                      </div>
                      <input
                        id="settings-music-vol"
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={gameSettings.musicVolume}
                        onChange={(e) =>
                          onUpdateGameSettings({ musicVolume: parseFloat(e.target.value) })
                        }
                        className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                      />
                    </div>
                    <div
                      className="p-2 rounded border border-[#183d52]/80"
                      style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                        <label htmlFor="settings-sfx-vol">{dict.labelSfxVol}</label>
                        <span className="tabular-nums font-semibold text-[#26e8d4]">
                          {Math.round(gameSettings.sfxVolume * 100)}%
                        </span>
                      </div>
                      <input
                        id="settings-sfx-vol"
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={gameSettings.sfxVolume}
                        onChange={(e) =>
                          onUpdateGameSettings({ sfxVolume: parseFloat(e.target.value) })
                        }
                        className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {(!isCompact || safePage === 2) && (
              <div
                className="p-2 rounded border border-[#183d52]/80 space-y-1.5"
                style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#d6f4fa]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ed6ce]">
                    {dict.sectionAccessibility}
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="settings-ui-scale" className="text-[11px]">
                      {dict.labelUiScale}
                    </label>
                    <span className="tabular-nums font-semibold text-[#26e8d4]">
                      {Math.round((gameSettings.uiScale ?? 1) * 100)}%
                    </span>
                  </div>
                </div>
                <input
                  id="settings-ui-scale"
                  data-testid="settings-ui-scale"
                  type="range"
                  min={0.85}
                  max={1.2}
                  step={0.05}
                  value={gameSettings.uiScale ?? 1}
                  onChange={(e) =>
                    onUpdateGameSettings({ uiScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#26e8d4] cursor-pointer"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <ToggleRow
                    id="settings-reduced-effects"
                    label={dict.labelReducedEffects}
                    hint={isShort ? undefined : dict.labelReducedEffectsHint}
                    checked={gameSettings.reducedEffects}
                    onChange={(checked) =>
                      onUpdateGameSettings({ reducedEffects: checked })
                    }
                  />

                  <ToggleRow
                    id="settings-high-contrast"
                    label={dict.labelHighContrastSymbols}
                    hint={isShort ? undefined : dict.labelHighContrastSymbolsHint}
                    checked={gameSettings.highContrastSymbols}
                    onChange={(checked) =>
                      onUpdateGameSettings({ highContrastSymbols: checked })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTROLS TAB */}
        {activeTab === 'controls' && (
          <div className="mt-2 space-y-1.5">
            {(!isCompact || safePage === 0) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <ToggleRow
                    id="ctrl-kb-enabled"
                    label={dict.kbEnabledLabel}
                    hint={isShort ? undefined : dict.kbEnabledHint}
                    checked={controlSettings.keyboardEnabled}
                    onChange={(checked) => onUpdateControls({ keyboardEnabled: checked })}
                  />

                  <div
                    className={`py-1.5 px-2 rounded border border-[#183d52]/80 ${
                      !controlSettings.keyboardEnabled ? 'opacity-45' : ''
                    }`}
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                      <label htmlFor="ctrl-kb-turn">{dict.kbTurnSpeedLabel}</label>
                      <span className="tabular-nums font-semibold text-[#26e8d4]">
                        {controlSettings.keyboardTurnSpeed.toFixed(1)}×
                      </span>
                    </div>
                    <input
                      id="ctrl-kb-turn"
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      disabled={!controlSettings.keyboardEnabled}
                      value={controlSettings.keyboardTurnSpeed}
                      onChange={(e) =>
                        onUpdateControls({ keyboardTurnSpeed: parseFloat(e.target.value) })
                      }
                      className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                    />
                  </div>
                </div>

                <div
                  className="p-2 rounded border border-[#183d52]/80"
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <div className="text-[10px] font-medium text-[#bdebf2] mb-1 leading-none">
                    {dict.kbRebindTitle}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {(isCompact ? KEY_ACTIONS.slice(0, 6) : KEY_ACTIONS).map(
                      renderKeyRebindCard,
                    )}
                  </div>
                </div>
              </>
            )}

            {isCompact && safePage === 1 && (
              <div
                className="p-2 rounded border border-[#183d52]/80"
                style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
              >
                <div className="text-[10px] font-medium text-[#bdebf2] mb-1 leading-none">
                  {dict.kbRebindTitle} (2/2)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {KEY_ACTIONS.slice(6).map(renderKeyRebindCard)}
                </div>
              </div>
            )}

            {(!isCompact || safePage === 2) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <ToggleRow
                  id="ctrl-mouse-enabled"
                  label={dict.mouseEnabledLabel}
                  checked={controlSettings.mouseEnabled}
                  onChange={(checked) => onUpdateControls({ mouseEnabled: checked })}
                />

                <ToggleRow
                  id="ctrl-mouse-invert"
                  label={dict.mouseInvertYLabel}
                  checked={controlSettings.invertMouseY}
                  disabled={!controlSettings.mouseEnabled}
                  onChange={(checked) => onUpdateControls({ invertMouseY: checked })}
                />

                <div
                  className={`py-1.5 px-2 rounded border border-[#183d52]/80 ${
                    !controlSettings.mouseEnabled ? 'opacity-45' : ''
                  }`}
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <label
                    htmlFor="ctrl-mouse-mode"
                    className="block text-[11px] font-medium text-[#e6fcfb] leading-none"
                  >
                    {dict.mouseLookModeLabel}
                  </label>
                  <select
                    id="ctrl-mouse-mode"
                    disabled={!controlSettings.mouseEnabled}
                    value={controlSettings.mouseLookMode}
                    onChange={(e) =>
                      onUpdateControls({
                        mouseLookMode: e.target.value as MouseLookMode,
                      })
                    }
                    className="mt-1 w-full rounded border border-[#1d4c63] px-1.5 py-0.5 text-[11px] text-[#ebfffe] focus:outline-none focus:border-[#26e8d4]"
                    style={{ backgroundColor: '#052236' }}
                  >
                    <option value="always">{dict.mouseModeAlways}</option>
                    <option value="drag">{dict.mouseModeDrag}</option>
                    <option value="pointerLock">{dict.mouseModeLock}</option>
                  </select>
                </div>

                <div
                  className={`py-1.5 px-2 rounded border border-[#183d52]/80 ${
                    !controlSettings.mouseEnabled ? 'opacity-45' : ''
                  }`}
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#d6f4fa]">
                    <label htmlFor="ctrl-mouse-sens">{dict.mouseSensLabel}</label>
                    <span className="tabular-nums font-semibold text-[#26e8d4]">
                      {controlSettings.mouseSensitivity.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    id="ctrl-mouse-sens"
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.1}
                    disabled={!controlSettings.mouseEnabled}
                    value={controlSettings.mouseSensitivity}
                    onChange={(e) =>
                      onUpdateControls({ mouseSensitivity: parseFloat(e.target.value) })
                    }
                    className="mt-1 w-full accent-[#26e8d4] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {(!isCompact || safePage === 3) && (
              <>
                <div
                  className={`p-2 rounded border border-[#183d52]/80 ${
                    !controlSettings.mouseEnabled ? 'opacity-45' : ''
                  }`}
                  style={{ backgroundColor: 'rgba(4, 18, 29, 0.85)' }}
                >
                  <div className="text-[10px] font-medium text-[#bdebf2] mb-1 leading-none">
                    {dict.mouseRebindTitle}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {MOUSE_ACTIONS.map((action) => (
                      <div
                        key={action}
                        className="flex flex-col justify-between gap-1 px-2 py-1 rounded border border-[#183d52]/70"
                        style={{ backgroundColor: 'rgba(6, 28, 42, 0.85)' }}
                      >
                        <label
                          htmlFor={`rebind-mouse-${action}`}
                          className="text-[11px] text-[#d9f7f6] truncate leading-tight"
                        >
                          {getMouseActionLabel(action)}
                        </label>
                        <select
                          id={`rebind-mouse-${action}`}
                          data-testid={`rebind-mouse-${action}`}
                          disabled={!controlSettings.mouseEnabled}
                          value={controlSettings.mouseBindings[action]}
                          onChange={(e) =>
                            handleMouseBindingChange(
                              action,
                              e.target.value as MouseBinding,
                            )
                          }
                          className="rounded border border-[#1d4c63] px-1.5 py-0.5 text-[11px] text-[#ebfffe] focus:outline-none focus:border-[#26e8d4]"
                          style={{ backgroundColor: '#052236' }}
                        >
                          {MOUSE_BINDING_VALUES.map((val) => (
                            <option key={val} value={val}>
                              {formatLocalizedMouseBinding(val, lang)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-[#89bcc9] leading-tight truncate">
                  {t(lang, 'mouseCameraTip', {
                    fsKey: formatLocalizedKeyCode(controlSettings.keyBindings.fullscreen, lang),
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer with Optional Pagination (Back / Next), Reset, and Done */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          {totalPages > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="settings-back-btn"
                disabled={safePage === 0}
                onClick={() => {
                  onClickSound?.();
                  setPage((p) => Math.max(0, p - 1));
                }}
                className="px-2.5 py-1 rounded text-xs font-semibold text-[#bdebf2] border border-[#183d52]/80 hover:border-[#26e8d4] disabled:opacity-40 cursor-pointer disabled:cursor-default"
                style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
              >
                ← {dict.btnBack}
              </button>
              <button
                type="button"
                data-testid="settings-next-btn"
                disabled={safePage >= totalPages - 1}
                onClick={() => {
                  onClickSound?.();
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                }}
                className="px-3 py-1 rounded text-xs font-semibold text-[#031d29] bg-[#5ef7e6] hover:bg-[#99fff4] disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                {dict.btnNext} →
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5">
            {activeTab === 'controls' && (
              <button
                type="button"
                data-testid="controls-reset-btn"
                onClick={() => {
                  onClickSound?.();
                  setListeningAction(null);
                  onResetControls();
                }}
                className="px-2.5 py-1 rounded text-xs font-medium text-[#bdebf2] border border-[#183d52]/80 hover:border-[#26e8d4] cursor-pointer"
                style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
              >
                {dict.btnReset}
              </button>
            )}
            <button
              type="button"
              data-testid="controls-close-btn"
              onClick={() => {
                onClickSound?.();
                onClose();
              }}
              className="px-4 py-1 rounded text-xs font-semibold text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
            >
              {dict.btnDone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
