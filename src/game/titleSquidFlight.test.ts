import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTitleSquidFlightFrame,
  computeTitleSquidIdleFrame,
  TITLE_SQUID_ATTACK_CYCLE_SEC,
  TITLE_SQUID_FLEE_DURATION_SEC,
  TITLE_SQUID_PULSE_PERIOD_SEC,
  TITLE_SQUID_SWIM_CYCLE_SEC,
} from './titleSquidFlight.ts';

test('computeTitleSquidFlightFrame recoils first, then jets far off-screen with fading ink cloud', () => {
  const recoil = computeTitleSquidFlightFrame(0.08);
  assert.equal(recoil.done, false);
  assert.ok(recoil.offsetForward < 0, 'squid recoils slightly before jetting forward');
  assert.ok(recoil.squashRadial > 1, 'mantle widens briefly during anticipation');
  assert.ok(recoil.inkOpacity > 0.3, 'ink cloud blooms on activation');

  const mid = computeTitleSquidFlightFrame(TITLE_SQUID_FLEE_DURATION_SEC * 0.6);
  assert.equal(mid.done, false);
  assert.ok(mid.offsetRight > 1.5, 'squid accelerates diagonally right');
  assert.ok(mid.offsetUp > 0.8, 'squid rises gracefully while darting away');
  assert.ok(mid.stretchAxial > 1.15, 'squid streamlines during high-speed jet');

  const end = computeTitleSquidFlightFrame(TITLE_SQUID_FLEE_DURATION_SEC);
  assert.equal(end.done, true);
  assert.ok(end.offsetRight > 15, 'squid exits completely outside screen horizontal frustum');
  assert.ok(end.offsetUp > 6, 'squid clears upper-right screen arc');
  assert.equal(end.inkOpacity, 0, 'ink cloud dissolves by end of escape');
});

test('computeTitleSquidIdleFrame pulses brightly, swims right and back, and lunges at the screen every 8-10s with flared tentacles', () => {
  const flashPeak = computeTitleSquidIdleFrame(TITLE_SQUID_PULSE_PERIOD_SEC * 0.16);
  const flashRest = computeTitleSquidIdleFrame(TITLE_SQUID_PULSE_PERIOD_SEC * 0.72);
  assert.ok(flashPeak.phosphorPulse > 0.9, 'phosphorescence flashes brightly during pulse peak');
  assert.ok(flashRest.phosphorPulse < 0.1, 'phosphorescence pulse envelope resets between flashes');
  assert.ok(flashRest.glowIntensity >= 1.1, 'steady bioluminescence remains visible between flashes');
  assert.ok(flashPeak.glowIntensity >= 4.5, 'pulse peak drives strong luminous bloom');
  assert.ok(flashPeak.fluoroFlash > flashRest.fluoroFlash * 5, 'fluorescent flash creates unmistakable high-contrast strobe');
  assert.ok(flashPeak.fluoroPhase > 0, 'traveling photophore phase advances over time');

  const home = computeTitleSquidIdleFrame(TITLE_SQUID_SWIM_CYCLE_SEC * 0.06);
  const outbound = computeTitleSquidIdleFrame(TITLE_SQUID_SWIM_CYCLE_SEC * 0.22);
  const farRight = computeTitleSquidIdleFrame(TITLE_SQUID_SWIM_CYCLE_SEC * 0.32);
  const inbound = computeTitleSquidIdleFrame(TITLE_SQUID_SWIM_CYCLE_SEC * 0.43);
  const returned = computeTitleSquidIdleFrame(TITLE_SQUID_SWIM_CYCLE_SEC * 0.56);

  assert.equal(home.isSwimming, false);
  assert.equal(outbound.isSwimming, true);
  assert.ok(outbound.yawRad > 0.2, 'squid turns right while swimming outbound');
  assert.ok(farRight.offsetRight > 2.1, 'squid glides significantly to the right');
  assert.ok(inbound.yawRad < -0.2, 'squid turns back left while returning');
  assert.equal(returned.isSwimming, false);
  assert.ok(Math.abs(returned.offsetRight) < 0.1, 'squid returns cleanly to its home position');

  const windup = computeTitleSquidIdleFrame(TITLE_SQUID_ATTACK_CYCLE_SEC * 0.62);
  const strike = computeTitleSquidIdleFrame(TITLE_SQUID_ATTACK_CYCLE_SEC * 0.78);
  const recovered = computeTitleSquidIdleFrame(TITLE_SQUID_ATTACK_CYCLE_SEC * 0.98);

  assert.equal(windup.isAttacking, true);
  assert.ok(windup.attackAdvance < 0, 'squid coils back slightly before lunging at the screen');
  assert.ok(windup.attackAimBlend > 0.3, 'squid aims toward the player during windup');
  assert.ok(windup.fluoroHueShift > 0.2, 'squid shifts toward UV-violet telegraph glow during windup');

  assert.equal(strike.isAttacking, true);
  assert.ok(strike.attackAdvance > 0.9, 'squid lunges aggressively toward the camera/screen');
  assert.ok(strike.tentacleFlare > 0.88, 'squid flings tentacles wide open during attack strike');
  assert.ok(strike.lungeScale > 1.2, 'squid scales forward dramatically during lunge');
  assert.ok(strike.glowIntensity > 4.5 && strike.fluoroFlash > 2.2, 'squid blazes with fluorescent flashes during attack');

  assert.equal(recovered.isAttacking, false);
  assert.equal(recovered.tentacleFlare, 0, 'tentacles relax cleanly after lunge recovery');
  assert.ok(Math.abs(recovered.attackAdvance) < 0.01);
});

