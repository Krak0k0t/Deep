export const TITLE_SQUID_FLEE_DURATION_SEC = 0.95;

export interface TitleSquidFlightFrame {
  progress: number;
  offsetRight: number;
  offsetUp: number;
  offsetForward: number;
  rollRad: number;
  pitchRad: number;
  yawOffsetRad: number;
  squashRadial: number;
  stretchAxial: number;
  glowIntensity: number;
  inkScale: number;
  inkOpacity: number;
  animSpeedMult: number;
  done: boolean;
}

export function computeTitleSquidFlightFrame(
  elapsedSec: number,
  durationSec = TITLE_SQUID_FLEE_DURATION_SEC,
): TitleSquidFlightFrame {
  const safeDuration = Math.max(0.1, durationSec);
  const p = Math.max(0, Math.min(1, elapsedSec / safeDuration));

  const inkScale = 0.28 + p * 2.85;
  const inkOpacity =
    p < 0.16
      ? (p / 0.16) * 0.74
      : Math.max(0, 0.74 * (1 - (p - 0.16) / 0.72));

  if (p < 0.18) {
    const r = Math.sin((p / 0.18) * Math.PI);
    return {
      progress: p,
      offsetRight: -0.18 * r,
      offsetUp: -0.08 * r,
      offsetForward: -0.38 * r,
      rollRad: -0.18 * r,
      pitchRad: 0.14 * r,
      yawOffsetRad: -0.15 * r,
      squashRadial: 1 + 0.18 * r,
      stretchAxial: 1 - 0.14 * r,
      glowIntensity: 2.4 + 3.4 * r,
      inkScale,
      inkOpacity,
      animSpeedMult: 3.8,
      done: false,
    };
  }

  const u = (p - 0.18) / 0.82;
  const jet = u * u * (1.15 + 2.85 * u);
  const weave = Math.sin(u * Math.PI * 2.5) * 0.65 * (1 - u * 0.25);
  const stretchCurve = Math.sin(Math.min(1, u * 1.45) * Math.PI * 0.5);

  return {
    progress: p,
    offsetRight: jet * 15.8 + weave,
    offsetUp: jet * 6.5 + Math.sin(u * Math.PI) * 1.35,
    offsetForward: jet * 10.4,
    rollRad: u * Math.PI * 3.4,
    pitchRad: 0.18 * (1 - u) - 0.26 * u,
    yawOffsetRad: 0.38 + u * 0.65,
    squashRadial: 1 - 0.16 * stretchCurve,
    stretchAxial: 1 + 0.4 * stretchCurve,
    glowIntensity: Math.max(1.8, 5.5 * (1 - 0.55 * u)),
    inkScale,
    inkOpacity,
    animSpeedMult: 4.8,
    done: p >= 1,
  };
}

export const TITLE_SQUID_PULSE_PERIOD_SEC = 2.4;
export const TITLE_SQUID_SWIM_CYCLE_SEC = 9.0;
export const TITLE_SQUID_ATTACK_CYCLE_SEC = 9.0;

export interface TitleSquidIdleFrame {
  phosphorPulse: number;
  glowIntensity: number;
  fluoroFlash: number;
  fluoroHueShift: number;
  fluoroPhase: number;
  offsetRight: number;
  offsetUp: number;
  yawRad: number;
  rollRad: number;
  pitchRad: number;
  animSpeedMult: number;
  isSwimming: boolean;
  isAttacking: boolean;
  attackAdvance: number;
  attackAimBlend: number;
  tentacleFlare: number;
  lungeScale: number;
}

export function computeTitleSquidIdleFrame(
  timeSec: number,
  hovered = false,
): TitleSquidIdleFrame {
  const safeT = Number.isFinite(timeSec) ? Math.max(0, timeSec) : 0;

  // High-contrast double-beat fluorescent bioluminescence flash every ~2.4s
  const pulsePhase =
    (safeT % TITLE_SQUID_PULSE_PERIOD_SEC) / TITLE_SQUID_PULSE_PERIOD_SEC;
  const primaryFlash =
    pulsePhase < 0.32
      ? Math.pow(Math.sin((pulsePhase / 0.32) * Math.PI), 0.9)
      : 0;
  const afterFlash =
    pulsePhase >= 0.34 && pulsePhase < 0.52
      ? Math.pow(Math.sin(((pulsePhase - 0.34) / 0.18) * Math.PI), 1.1) * 0.62
      : 0;
  const flash = Math.max(primaryFlash, afterFlash);
  const ember = 0.03 * (0.5 + 0.5 * Math.sin(safeT * 2.2));
  const phosphorPulse = Math.min(1, flash * 0.97 + ember);

  // Unified 9.0s choreography:
  // - 0.12..0.52: graceful swim to the right and back
  // - 0.60..0.96: windup -> predatory lunge onto the screen glass with wide-open tentacles -> return
  const cyclePhase =
    (safeT % TITLE_SQUID_ATTACK_CYCLE_SEC) / TITLE_SQUID_ATTACK_CYCLE_SEC;

  const swimStart = 0.12;
  const swimEnd = 0.52;
  let offsetRight = 0;
  let swimExcursion = 0;
  let swimDir = 0;
  let isSwimming = false;

  if (cyclePhase >= swimStart && cyclePhase <= swimEnd) {
    isSwimming = true;
    const u = (cyclePhase - swimStart) / (swimEnd - swimStart);
    swimExcursion = Math.pow(Math.sin(u * Math.PI), 1.25);
    offsetRight = swimExcursion * 2.45;
    swimDir = Math.tanh(Math.cos(u * Math.PI) * 3.4);
  }

  let isAttacking = false;
  let attackAdvance = 0;
  let attackAimBlend = 0;
  let tentacleFlare = 0;
  let attackGlowBoost = 0;
  let fluoroHueShift = 0;

  if (cyclePhase >= 0.6 && cyclePhase <= 0.96) {
    isAttacking = true;
    if (cyclePhase < 0.64) {
      // Quick windup recoil: snap orientation toward player & charge UV-violet fluorescence
      const w = (cyclePhase - 0.6) / 0.04;
      const smoothW = w * w * (3 - 2 * w);
      attackAdvance = -0.18 * Math.sin(smoothW * Math.PI * 0.75);
      attackAimBlend = smoothW;
      tentacleFlare = 0.42 * smoothW;
      attackGlowBoost = 2.6 * smoothW;
      fluoroHueShift = 0.85 * smoothW;
    } else if (cyclePhase < 0.72) {
      // Strike lunge: rocket straight at the player behind the screen with tentacles wide open
      const s = (cyclePhase - 0.64) / 0.08;
      const burst = 1 - Math.pow(1 - s, 2.8);
      attackAdvance = -0.08 * (1 - burst) + 1.0 * burst;
      attackAimBlend = 1.0;
      tentacleFlare = 0.42 + 0.58 * Math.min(1, s * 1.5);
      attackGlowBoost = 2.6 + 3.8 * burst;
      fluoroHueShift = 0.85 * (1 - burst);
    } else if (cyclePhase < 0.88) {
      // Predatory grapple hold right on the screen glass with blazing neon fluorescent strobe
      const h = (cyclePhase - 0.72) / 0.16;
      const strobe = 0.76 + 0.24 * Math.sin(safeT * 28);
      attackAdvance = 1.0 - 0.03 * h;
      attackAimBlend = 1.0;
      tentacleFlare = 0.96 + 0.04 * Math.sin(safeT * 22);
      attackGlowBoost = 6.4 * strobe;
      fluoroHueShift = 0.45 * (0.5 + 0.5 * Math.sin(safeT * 24));
    } else {
      // Smooth glide back to bottom-left home anchor
      const r = (cyclePhase - 0.88) / 0.08;
      const easeOut = r * r * (3 - 2 * r);
      attackAdvance = 0.97 * (1 - easeOut);
      attackAimBlend = 1 - easeOut;
      tentacleFlare = 0.96 * (1 - easeOut);
      attackGlowBoost = 4.4 * (1 - easeOut);
    }
  }

  const idleSwayX =
    Math.cos(safeT * 1.35) * 0.045 * (1 - 0.5 * swimExcursion) * (1 - attackAimBlend);
  const idleBobY = Math.sin(safeT * 2.1) * 0.075 * (1 - 0.65 * attackAimBlend);
  const swimArcY = isSwimming ? Math.sin(swimExcursion * Math.PI) * 0.16 : 0;

  // Sharp contrast: calm deep-sea glow -> vivid saturated neon fluorescent burst (no whiteout)
  const flashSpike = Math.pow(phosphorPulse, 0.75);
  const fluoroFlash =
    0.3 +
    flashSpike * 2.55 +
    attackGlowBoost * 0.44 +
    (hovered ? 0.65 : 0);

  const glowIntensity =
    1.2 +
    flashSpike * 3.8 +
    attackGlowBoost * 0.85 +
    (hovered ? 0.95 : 0);

  return {
    phosphorPulse,
    glowIntensity,
    fluoroFlash,
    fluoroHueShift,
    fluoroPhase: safeT * 8.0,
    offsetRight: offsetRight + idleSwayX,
    offsetUp: idleBobY + swimArcY,
    yawRad:
      swimDir * 0.65 +
      Math.sin(safeT * 0.9) * 0.18 +
      (hovered ? 0.2 : 0),
    rollRad:
      swimDir * -0.16 +
      Math.sin(safeT * 1.4) * 0.07 +
      (isAttacking ? Math.sin(safeT * 18) * 0.15 * Math.max(0, attackAdvance) : 0),
    pitchRad:
      0.14 + Math.sin(safeT * 1.7) * 0.07 - Math.abs(swimDir) * 0.08,
    animSpeedMult:
      1.15 +
      Math.abs(swimDir) * 1.65 +
      (isAttacking ? 3.8 : 0) +
      (hovered ? 1.1 : 0),
    isSwimming,
    isAttacking,
    attackAdvance,
    attackAimBlend,
    tentacleFlare,
    lungeScale: 1 + Math.max(0, attackAdvance) * 0.28,
  };
}
