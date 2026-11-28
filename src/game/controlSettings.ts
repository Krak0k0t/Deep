export type MouseLookMode = 'always' | 'drag' | 'pointerLock';

export type GameAction =
  | 'forward'
  | 'backward'
  | 'turnLeft'
  | 'turnRight'
  | 'ascend'
  | 'descend'
  | 'call'
  | 'dash'
  | 'stopFish'
  | 'pause'
  | 'restart'
  | 'mute'
  | 'fullscreen';

export type KeyBindings = Record<GameAction, string>;

export type MouseAction = 'moveToPoint' | 'holdSwim' | 'interact';

export type MouseBinding = 'LMB' | 'DBL_LMB' | 'RMB' | 'MMB' | 'NONE';

export type MouseBindings = Record<MouseAction, MouseBinding>;

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  forward: 'KeyW',
  backward: 'KeyS',
  turnLeft: 'KeyA',
  turnRight: 'KeyD',
  ascend: 'Space',
  descend: 'KeyC',
  call: 'KeyE',
  dash: 'ShiftLeft',
  stopFish: 'Escape',
  pause: 'KeyP',
  restart: 'KeyR',
  mute: 'KeyM',
  fullscreen: 'KeyF',
};

export const DEFAULT_MOUSE_BINDINGS: MouseBindings = {
  moveToPoint: 'DBL_LMB',
  holdSwim: 'LMB',
  interact: 'RMB',
};

export interface ControlSettings {
  keyboardEnabled: boolean;
  mouseEnabled: boolean;
  mouseLookMode: MouseLookMode;
  doubleClickMove: boolean;
  lmbHoldToSwim: boolean;
  invertMouseY: boolean;
  mouseSensitivity: number; // multiplier 0.3 .. 2.5
  keyboardTurnSpeed: number; // multiplier 0.5 .. 2.0
  keyBindings: KeyBindings;
  mouseBindings: MouseBindings;
}

export const CONTROLS_STORAGE_KEY = 'deep_fish_controls_v1';

export const DEFAULT_CONTROL_SETTINGS: ControlSettings = {
  keyboardEnabled: true,
  mouseEnabled: true,
  mouseLookMode: 'drag',
  doubleClickMove: true,
  lmbHoldToSwim: true,
  invertMouseY: false,
  mouseSensitivity: 1.0,
  keyboardTurnSpeed: 1.0,
  keyBindings: { ...DEFAULT_KEY_BINDINGS },
  mouseBindings: { ...DEFAULT_MOUSE_BINDINGS },
};

const VALID_GAME_ACTIONS: GameAction[] = [
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

const VALID_MOUSE_BINDINGS = new Set<MouseBinding>([
  'LMB',
  'DBL_LMB',
  'RMB',
  'MMB',
  'NONE',
]);

function clampNum(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value * 100) / 100));
}

export function sanitizeKeyBindings(
  raw: Partial<KeyBindings> | null | undefined,
): KeyBindings {
  const out: KeyBindings = { ...DEFAULT_KEY_BINDINGS };
  if (!raw) return out;
  for (const action of VALID_GAME_ACTIONS) {
    const val = raw[action];
    if (typeof val === 'string' && val.trim().length > 0 && val.length <= 24) {
      out[action] = val.trim();
    }
  }
  return out;
}

export function sanitizeMouseBindings(
  raw: Partial<MouseBindings> | null | undefined,
): MouseBindings {
  const src = raw ?? {};
  return {
    moveToPoint:
      src.moveToPoint && VALID_MOUSE_BINDINGS.has(src.moveToPoint)
        ? src.moveToPoint
        : DEFAULT_MOUSE_BINDINGS.moveToPoint,
    holdSwim:
      src.holdSwim && VALID_MOUSE_BINDINGS.has(src.holdSwim)
        ? src.holdSwim
        : DEFAULT_MOUSE_BINDINGS.holdSwim,
    interact:
      src.interact && VALID_MOUSE_BINDINGS.has(src.interact)
        ? src.interact
        : DEFAULT_MOUSE_BINDINGS.interact,
  };
}

/**
 * Rebinds a keyboard action to `newCode`. If another action already uses `newCode`,
 * swaps their keys so bindings never silently collide.
 */
export function rebindKey(
  bindings: KeyBindings,
  action: GameAction,
  newCode: string,
): KeyBindings {
  const prevCode = bindings[action];
  const next: KeyBindings = { ...bindings };
  for (const other of VALID_GAME_ACTIONS) {
    if (other !== action && next[other] === newCode) {
      next[other] = prevCode;
    }
  }
  next[action] = newCode;
  return next;
}

export function formatKeyCode(code: string): string {
  if (code.startsWith('Key') && code.length === 4) {
    return code.slice(3).toUpperCase();
  }
  if (code.startsWith('Digit') && code.length === 6) {
    return code.slice(5);
  }
  switch (code) {
    case 'Space':
      return 'Пробел';
    case 'Escape':
      return 'Esc';
    case 'ArrowUp':
      return '↑';
    case 'ArrowDown':
      return '↓';
    case 'ArrowLeft':
      return '←';
    case 'ArrowRight':
      return '→';
    case 'ShiftLeft':
    case 'ShiftRight':
      return 'Shift';
    case 'ControlLeft':
    case 'ControlRight':
      return 'Ctrl';
    case 'AltLeft':
    case 'AltRight':
      return 'Alt';
    case 'Enter':
      return 'Enter';
    case 'Tab':
      return 'Tab';
    default:
      return code;
  }
}

export function formatMouseBinding(binding: MouseBinding): string {
  switch (binding) {
    case 'LMB':
      return 'ЛКМ';
    case 'DBL_LMB':
      return 'Двойной клик ЛКМ';
    case 'RMB':
      return 'ПКМ';
    case 'MMB':
      return 'СКМ (Колесо)';
    case 'NONE':
      return 'Откл.';
  }
}

export function sanitizeControlSettings(
  raw: Partial<ControlSettings> | null | undefined,
): ControlSettings {
  const src = raw ?? {};
  const mode: MouseLookMode =
    src.mouseLookMode === 'always' ||
    src.mouseLookMode === 'drag' ||
    src.mouseLookMode === 'pointerLock'
      ? src.mouseLookMode
      : DEFAULT_CONTROL_SETTINGS.mouseLookMode;

  const keyBindings = sanitizeKeyBindings(src.keyBindings);
  const mouseBindings = sanitizeMouseBindings(src.mouseBindings);

  return {
    keyboardEnabled:
      typeof src.keyboardEnabled === 'boolean'
        ? src.keyboardEnabled
        : DEFAULT_CONTROL_SETTINGS.keyboardEnabled,
    mouseEnabled:
      typeof src.mouseEnabled === 'boolean'
        ? src.mouseEnabled
        : DEFAULT_CONTROL_SETTINGS.mouseEnabled,
    mouseLookMode: mode,
    doubleClickMove:
      typeof src.doubleClickMove === 'boolean'
        ? src.doubleClickMove
        : mouseBindings.moveToPoint !== 'NONE',
    lmbHoldToSwim:
      typeof src.lmbHoldToSwim === 'boolean'
        ? src.lmbHoldToSwim
        : mouseBindings.holdSwim !== 'NONE',
    invertMouseY:
      typeof src.invertMouseY === 'boolean'
        ? src.invertMouseY
        : DEFAULT_CONTROL_SETTINGS.invertMouseY,
    mouseSensitivity: clampNum(
      src.mouseSensitivity,
      DEFAULT_CONTROL_SETTINGS.mouseSensitivity,
      0.3,
      2.5,
    ),
    keyboardTurnSpeed: clampNum(
      src.keyboardTurnSpeed,
      DEFAULT_CONTROL_SETTINGS.keyboardTurnSpeed,
      0.5,
      2.0,
    ),
    keyBindings,
    mouseBindings,
  };
}

export function loadControlSettings(storage?: Storage): ControlSettings {
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) {
      return {
        ...DEFAULT_CONTROL_SETTINGS,
        keyBindings: { ...DEFAULT_KEY_BINDINGS },
        mouseBindings: { ...DEFAULT_MOUSE_BINDINGS },
      };
    }
    const raw = store.getItem(CONTROLS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_CONTROL_SETTINGS,
        keyBindings: { ...DEFAULT_KEY_BINDINGS },
        mouseBindings: { ...DEFAULT_MOUSE_BINDINGS },
      };
    }
    const parsed = JSON.parse(raw) as Partial<ControlSettings>;
    return sanitizeControlSettings(parsed);
  } catch {
    return {
      ...DEFAULT_CONTROL_SETTINGS,
      keyBindings: { ...DEFAULT_KEY_BINDINGS },
      mouseBindings: { ...DEFAULT_MOUSE_BINDINGS },
    };
  }
}

export function saveControlSettings(
  settings: Partial<ControlSettings>,
  storage?: Storage,
): ControlSettings {
  const clean = sanitizeControlSettings(settings);
  try {
    const store =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    store?.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota / privacy errors
  }
  return clean;
}

export function resetControlSettings(storage?: Storage): ControlSettings {
  return saveControlSettings(
    {
      ...DEFAULT_CONTROL_SETTINGS,
      keyBindings: { ...DEFAULT_KEY_BINDINGS },
      mouseBindings: { ...DEFAULT_MOUSE_BINDINGS },
    },
    storage,
  );
}
