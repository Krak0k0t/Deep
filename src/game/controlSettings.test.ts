import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTROLS_STORAGE_KEY,
  DEFAULT_CONTROL_SETTINGS,
  DEFAULT_KEY_BINDINGS,
  DEFAULT_MOUSE_BINDINGS,
  formatKeyCode,
  loadControlSettings,
  rebindKey,
  resetControlSettings,
  sanitizeControlSettings,
  saveControlSettings,
} from './controlSettings';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test('loadControlSettings returns defaults when storage is empty or corrupt', () => {
  const store = createMemoryStorage();
  assert.deepEqual(loadControlSettings(store), DEFAULT_CONTROL_SETTINGS);

  store.setItem(CONTROLS_STORAGE_KEY, '{not-json');
  assert.deepEqual(loadControlSettings(store), DEFAULT_CONTROL_SETTINGS);
});

test('saveControlSettings persists valid values, clamps multipliers, and preserves custom key/mouse bindings', () => {
  const store = createMemoryStorage();
  const saved = saveControlSettings(
    {
      keyboardEnabled: false,
      mouseEnabled: true,
      mouseLookMode: 'drag',
      doubleClickMove: true,
      lmbHoldToSwim: false,
      invertMouseY: true,
      mouseSensitivity: 9.5,
      keyboardTurnSpeed: 0.1,
      keyBindings: { ...DEFAULT_KEY_BINDINGS, forward: 'ArrowUp', call: 'KeyQ' },
      mouseBindings: { ...DEFAULT_MOUSE_BINDINGS, interact: 'MMB' },
    },
    store,
  );

  assert.equal(saved.keyboardEnabled, false);
  assert.equal(saved.mouseLookMode, 'drag');
  assert.equal(saved.invertMouseY, true);
  assert.equal(saved.lmbHoldToSwim, false);
  assert.equal(saved.mouseSensitivity, 2.5);
  assert.equal(saved.keyboardTurnSpeed, 0.5);
  assert.equal(saved.keyBindings.forward, 'ArrowUp');
  assert.equal(saved.keyBindings.call, 'KeyQ');
  assert.equal(saved.mouseBindings.interact, 'MMB');

  const reloaded = loadControlSettings(store);
  assert.deepEqual(reloaded, saved);
});

test('rebindKey swaps conflicting keys cleanly and formatKeyCode formats labels', () => {
  const swapped = rebindKey(DEFAULT_KEY_BINDINGS, 'forward', 'KeyE');
  assert.equal(swapped.forward, 'KeyE');
  assert.equal(swapped.call, 'KeyW');

  assert.equal(formatKeyCode('KeyW'), 'W');
  assert.equal(formatKeyCode('Space'), 'Пробел');
  assert.equal(formatKeyCode('Escape'), 'Esc');
  assert.equal(formatKeyCode('ArrowUp'), '↑');
  assert.equal(DEFAULT_KEY_BINDINGS.dash, 'ShiftLeft');
  assert.equal(formatKeyCode(DEFAULT_KEY_BINDINGS.dash), 'Shift');
});

test('resetControlSettings restores defaults and sanitize falls back unknown modes/bindings', () => {
  const store = createMemoryStorage();
  saveControlSettings(
    {
      keyboardEnabled: false,
      mouseSensitivity: 2.0,
      keyBindings: { ...DEFAULT_KEY_BINDINGS, forward: 'KeyI' },
      mouseBindings: { ...DEFAULT_MOUSE_BINDINGS, interact: 'NONE' },
    },
    store,
  );
  const reset = resetControlSettings(store);
  assert.deepEqual(reset, DEFAULT_CONTROL_SETTINGS);

  const clean = sanitizeControlSettings({
    mouseLookMode: 'invalid' as 'always',
    mouseBindings: {
      moveToPoint: 'INVALID' as 'LMB',
      holdSwim: 'LMB',
      interact: 'RMB',
    },
  });
  assert.equal(clean.mouseLookMode, DEFAULT_CONTROL_SETTINGS.mouseLookMode);
  assert.equal(clean.mouseBindings.moveToPoint, DEFAULT_MOUSE_BINDINGS.moveToPoint);
});
