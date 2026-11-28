import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_GAME_SETTINGS,
  DIFFICULTY_PRESETS,
  GRAPHICS_PRESETS,
  loadGameSettings,
  sanitizeGameSettings,
  saveGameSettings,
  shouldShowTouchControls,
} from './gameSettings';
import {
  formatLocalizedKeyCode,
  formatLocalizedMouseBinding,
  getLocale,
  isRtlLanguage,
  resolveLanguageId,
  SUPPORTED_LANGUAGE_IDS,
  SUPPORTED_LANGUAGES,
  t,
} from './i18n';

test('default language is English and all 16 languages are registered cleanly', () => {
  assert.equal(DEFAULT_GAME_SETTINGS.language, 'en');
  assert.equal(SUPPORTED_LANGUAGES.length, 16);
  const expected = [
    'en',
    'fr',
    'de',
    'es',
    'pt',
    'zh',
    'ar',
    'uk',
    'ru',
    'ja',
    'pl',
    'it',
    'vi',
    'fa',
    'elvish',
    'orcish',
  ];
  for (const id of expected) {
    assert.ok(SUPPORTED_LANGUAGE_IDS.includes(id as any), `Missing language ${id}`);
    const loc = getLocale(id);
    assert.ok(loc.gameTitleLine1.length > 0);
    assert.ok(loc.btnStartDive.length > 0);
    assert.ok(loc.btnSettings.length > 0);
  }
});

test('Arabic and Persian are marked RTL while others remain LTR', () => {
  assert.equal(isRtlLanguage('ar'), true);
  assert.equal(isRtlLanguage('fa'), true);
  assert.equal(isRtlLanguage('en'), false);
  assert.equal(isRtlLanguage('ru'), false);
  assert.equal(isRtlLanguage('elvish'), false);
  assert.equal(isRtlLanguage('orcish'), false);
});

test('template interpolation and localized key/mouse formatting work', () => {
  assert.equal(
    t('en', 'saveBadge', { chapter: 2, pearls: 7 }),
    'Saved · Chapter 2 · 7 pearls',
  );
  assert.equal(
    t('ru', 'saveBadge', { chapter: 2, pearls: 7 }),
    'Сохранение · Глава 2 · 7 жемч.',
  );
  assert.equal(formatLocalizedKeyCode('Space', 'en'), 'Space');
  assert.equal(formatLocalizedKeyCode('Space', 'ru'), 'Пробел');
  assert.equal(formatLocalizedMouseBinding('RMB', 'en'), 'RMB (Right)');
  assert.equal(resolveLanguageId('unknown_lang'), 'en');
});

test('game settings sanitization, persistence, and touch detection work', () => {
  const sanitized = sanitizeGameSettings(
    {
      language: 'ru',
      difficulty: 'abyssal',
      graphicsQuality: 'ultra',
      touchControls: 'on',
      musicVolume: 2.5,
      sfxVolume: -1,
    },
    SUPPORTED_LANGUAGE_IDS,
  );
  assert.equal(sanitized.language, 'ru');
  assert.equal(sanitized.difficulty, 'abyssal');
  assert.equal(sanitized.graphicsQuality, 'ultra');
  assert.equal(sanitized.touchControls, 'on');
  assert.equal(sanitized.musicVolume, 1);
  assert.equal(sanitized.sfxVolume, 0);

  const memoryStore = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
  } as unknown as Storage;

  saveGameSettings(sanitized, mockStorage, SUPPORTED_LANGUAGE_IDS);
  const reloaded = loadGameSettings(mockStorage, SUPPORTED_LANGUAGE_IDS);
  assert.equal(reloaded.difficulty, 'abyssal');
  assert.equal(reloaded.graphicsQuality, 'ultra');

  assert.equal(shouldShowTouchControls('auto', true), true);
  assert.equal(shouldShowTouchControls('auto', false), false);
  assert.equal(shouldShowTouchControls('on', false), true);
  assert.equal(shouldShowTouchControls('off', true), false);

  assert.ok(DIFFICULTY_PRESETS.calm.predatorSpeedMult < DIFFICULTY_PRESETS.standard.predatorSpeedMult);
  assert.ok(DIFFICULTY_PRESETS.abyssal.predatorSpeedMult > DIFFICULTY_PRESETS.standard.predatorSpeedMult);

  const veryLowSanitized = sanitizeGameSettings({ graphicsQuality: 'very_low' });
  assert.equal(veryLowSanitized.graphicsQuality, 'very_low');
  assert.equal(Object.keys(GRAPHICS_PRESETS).length, 5);
  assert.ok(GRAPHICS_PRESETS.very_low.foliageDensity < GRAPHICS_PRESETS.low.foliageDensity);
  assert.ok(GRAPHICS_PRESETS.low.foliageDensity < GRAPHICS_PRESETS.medium.foliageDensity);
  assert.ok(GRAPHICS_PRESETS.medium.foliageDensity < GRAPHICS_PRESETS.high.foliageDensity);
  assert.ok(GRAPHICS_PRESETS.high.foliageDensity < GRAPHICS_PRESETS.ultra.foliageDensity);
  assert.ok(GRAPHICS_PRESETS.very_low.pixelRatioCap < GRAPHICS_PRESETS.low.pixelRatioCap);
  assert.equal(GRAPHICS_PRESETS.very_low.causticsEnabled, false);
  assert.equal(GRAPHICS_PRESETS.low.causticsEnabled, false);
  assert.equal(GRAPHICS_PRESETS.medium.causticsEnabled, true);
});

test('accessibility settings clamp cleanly and compass bearing resolves angles', async () => {
  const { computeCompassBearing } = await import('./gameSettings');
  const clamped = sanitizeGameSettings({
    uiScale: 2.4,
    reducedEffects: true,
    highContrastSymbols: true,
  });
  assert.equal(clamped.uiScale, 1.2);
  assert.equal(clamped.reducedEffects, true);
  assert.equal(clamped.highContrastSymbols, true);

  const clampedLow = sanitizeGameSettings({ uiScale: 0.4 });
  assert.equal(clampedLow.uiScale, 0.85);

  const ahead = computeCompassBearing(
    { x: 0, y: 0, z: 0 },
    Math.PI,
    { x: 0, y: 0, z: -40 },
  );
  assert.equal(ahead.bearingDeg, 0);
  assert.equal(ahead.distMeters, 40);

  const right = computeCompassBearing(
    { x: 0, y: 0, z: 0 },
    Math.PI,
    { x: 10, y: 0, z: 0 },
  );
  assert.equal(right.bearingDeg, 90);
});

