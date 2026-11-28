import { GamePhase } from './campaign';

export type MusicContext =
  | 'menu'
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'ch7'
  | 'ch8'
  | 'ch9'
  | 'ch10';

const SCALE_NOTES: Record<MusicContext, number[]> = {
  // Tranquil Lydian / Major9 underwater lullaby
  menu: [261.63, 293.66, 329.63, 392.0, 493.88, 523.25, 587.33, 659.25],
  // Sunlit Coral Reef (bright pentatonic / Lydian)
  ch1: [293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99],
  // Twilight Sunken Liner (mysterious deep minor-9)
  ch2: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 493.88, 523.25],
  // Kelp Forest "Dead Whisper" (emerald Dorian resonant shimmer)
  ch3: [196.0, 233.08, 261.63, 293.66, 329.63, 392.0, 440.0, 466.16],
  // Leviathan Graveyard (deep abyssal Phrygian)
  ch4: [174.61, 185.0, 220.0, 261.63, 293.66, 329.63, 349.23, 392.0],
  // Hadal Black Smokers (warm obsidian Locrian/Phrygian rumble)
  ch5: [164.81, 174.61, 207.65, 246.94, 261.63, 311.13, 329.63, 369.99],
  // Turquoise Heart (crystallized bioluminescent harmonic minor)
  ch6: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0, 523.25],
  // Breakout from the Abyss (urgent surging Dorian)
  ch7: [207.65, 246.94, 277.18, 311.13, 369.99, 415.3, 466.16, 493.88],
  // Kelp Rebellion (hopeful luminous Mixolydian)
  ch8: [233.08, 261.63, 293.66, 349.23, 392.0, 440.0, 466.16, 523.25],
  // Singing Whale: Alert (tense maritime alarm & brass echo)
  ch9: [246.94, 293.66, 329.63, 369.99, 440.0, 493.88, 554.37, 587.33],
  // To the Surface: Quiet Reef (radiant major 9 homecoming)
  ch10: [329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99, 880.0],
};

export class UnderwaterAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private muted = false;
  private paused = false;
  private musicVolume = 0.75;
  private sfxVolume = 0.85;
  private initialized = false;
  private lastHeartbeatMs = 0;

  private musicContext: MusicContext = 'menu';
  private tension01 = 0;
  private musicStep = 0;
  private musicTimerId: number | null = null;

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.48;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Continuous deep-water ambient hum modulated by depth & biome
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.value = 180;

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.14;

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.value = 54;

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.value = 81;

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.musicGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.initialized = true;

      this.startAdaptiveMusicScheduler();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private startAdaptiveMusicScheduler(): void {
    if (this.musicTimerId !== null || typeof window === 'undefined') return;
    this.musicTimerId = window.setInterval(() => {
      this.triggerAdaptiveMusicNote();
    }, 920);
  }

  private triggerAdaptiveMusicNote(): void {
    if (
      !this.ctx ||
      !this.musicGain ||
      this.muted ||
      this.paused ||
      this.musicVolume <= 0.01 ||
      this.ctx.state !== 'running'
    ) {
      return;
    }

    const now = this.ctx.currentTime;
    const scale = SCALE_NOTES[this.musicContext];
    const step = this.musicStep++;

    // Gentle melodic arpeggio note
    const pattern =
      this.musicContext === 'ch5' || this.musicContext === 'ch6'
        ? [0, 3, 2, 5, 1, 6, 4, 7]
        : this.musicContext === 'ch7' || this.musicContext === 'ch9'
          ? [0, 2, 4, 3, 5, 6, 4, 7]
          : this.musicContext === 'ch4'
            ? [0, 3, 1, 5, 2, 6, 4, 1]
            : this.musicContext === 'ch3' || this.musicContext === 'ch8'
              ? [0, 4, 2, 5, 1, 6, 3, 2]
              : this.musicContext === 'ch2'
                ? [0, 3, 4, 2, 5, 1, 4, 3]
                : [0, 2, 4, 6, 4, 5, 3, 2];
    const noteIdx = pattern[step % pattern.length];
    const freq = scale[noteIdx];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type =
      this.musicContext === 'ch2' ||
      this.musicContext === 'ch3' ||
      this.musicContext === 'ch4' ||
      this.musicContext === 'ch5' ||
      this.musicContext === 'ch7'
        ? 'triangle'
        : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(
      this.musicContext === 'menu'
        ? 920
        : this.musicContext === 'ch1' || this.musicContext === 'ch10'
          ? 1240
          : this.musicContext === 'ch5' || this.musicContext === 'ch6'
            ? 520
            : this.musicContext === 'ch4'
              ? 560
              : this.musicContext === 'ch3' || this.musicContext === 'ch8'
                ? 680
                : 760,
      now,
    );

    const peak = this.musicContext === 'menu' ? 0.068 : 0.058;
    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 1.7);

    // Every 4th step, play a warm sub-pad fifth
    if (step % 4 === 0) {
      const rootFreq = scale[0] * 0.5;
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(rootFreq, now);
      padGain.gain.setValueAtTime(0.0008, now);
      padGain.gain.linearRampToValueAtTime(0.065, now + 0.55);
      padGain.gain.exponentialRampToValueAtTime(0.0008, now + 3.4);
      padOsc.connect(padGain);
      padGain.connect(this.musicGain);
      padOsc.start(now);
      padOsc.stop(now + 3.45);
    }

    // Subtle predator tension pulse when near danger
    if (this.tension01 > 0.25) {
      const pulseOsc = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      pulseOsc.type = 'triangle';
      pulseOsc.frequency.setValueAtTime(98, now + 0.45);
      pulseOsc.frequency.exponentialRampToValueAtTime(62, now + 0.72);
      const tVol = 0.045 * this.tension01;
      pulseGain.gain.setValueAtTime(0.0008, now + 0.45);
      pulseGain.gain.linearRampToValueAtTime(tVol, now + 0.48);
      pulseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.78);
      pulseOsc.connect(pulseGain);
      pulseGain.connect(this.musicGain);
      pulseOsc.start(now + 0.45);
      pulseOsc.stop(now + 0.8);
    }
  }

  public setVolumes(musicVolume: number, sfxVolume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, musicVolume));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
    if (this.ctx && this.musicGain && this.sfxGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.06);
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.06);
    }
  }

  public setMusicContext(context: MusicContext, tension01 = 0): void {
    const changed = this.musicContext !== context;
    this.musicContext = context;
    this.tension01 = Math.max(0, Math.min(1, tension01));
    if (changed && this.droneOsc1 && this.droneOsc2 && this.ctx) {
      const base =
        context === 'ch6'
          ? 34
          : context === 'ch5'
            ? 36
            : context === 'ch4' || context === 'ch7'
              ? 38
              : context === 'ch3' || context === 'ch8'
                ? 42
                : context === 'ch2' || context === 'ch9'
                  ? 46
                  : context === 'ch10'
                    ? 60
                    : context === 'menu'
                      ? 54
                      : 58;
      this.droneOsc1.frequency.setTargetAtTime(base, this.ctx.currentTime, 0.45);
      this.droneOsc2.frequency.setTargetAtTime(base * 1.5, this.ctx.currentTime, 0.45);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.48,
        this.ctx.currentTime,
        0.04,
      );
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (!this.droneGain || !this.ctx) return;
    const target = paused ? 0.025 : 0.14;
    this.droneGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
  }

  public updateDepthAmbience(depthMeters: number): void {
    if (!this.initialized || !this.ctx || !this.droneFilter || !this.droneOsc1) {
      return;
    }
    const t = Math.max(0, Math.min(1, depthMeters / 800));
    const cutoff = 210 - t * 130 + this.tension01 * 55;
    const baseFreq = (this.musicContext === 'ch2' ? 48 : 58) - t * 18;
    this.droneFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.25);
    this.droneOsc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.25);
  }

  private getSfxTarget(): AudioNode | null {
    return this.sfxGain ?? this.masterGain;
  }

  public playUiHover(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    if (this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.055);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.038, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playUiClick(): void {
    this.unlock();
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    // Soft underwater water-droplet chime (bubble pitch rise + subtle nacre overtone)
    const drop = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    drop.type = 'sine';
    drop.frequency.setValueAtTime(420, now);
    drop.frequency.exponentialRampToValueAtTime(920, now + 0.065);
    dropGain.gain.setValueAtTime(0.001, now);
    dropGain.gain.linearRampToValueAtTime(0.095, now + 0.008);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    drop.connect(dropGain);
    dropGain.connect(out);
    drop.start(now);
    drop.stop(now + 0.12);
  }

  public playHeroPlayful(): void {
    this.unlock();
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.065;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, t + 0.14);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.13, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playCallPing(phase: GamePhase): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = phase === 'ASCENT' ? 'sawtooth' : 'sine';
    const startFreq = phase === 'ASCENT' ? 320 : 520;
    const endFreq = phase === 'ASCENT' ? 110 : 780;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);
    if (phase === 'DESCENT') {
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.55);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.68);
  }

  public playSquidTelegraph(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public maybePlayHeartbeat(proximity01: number): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted || proximity01 <= 0.1) return;
    const nowMs = performance.now();
    const intervalMs = 850 - proximity01 * 480;
    if (nowMs - this.lastHeartbeatMs < intervalMs) return;
    this.lastHeartbeatMs = nowMs;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(68, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

    const vol = 0.08 + proximity01 * 0.18;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playPearlPickup(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  public playMildredBump(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playHurt(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playLullabyMotif(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const motif = [392.0, 493.88, 587.33, 523.25, 493.88, 392.0];
    motif.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.24;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.58);
    });
  }

  public playDashSurge(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.34);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playPafnutiySwell(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playGateOpen(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(86, now + 0.75);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.88);
  }

  public playWhaleSong(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 1.4);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 1.6);
  }

  public playThermalVentBurst(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(84, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.48);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playAscentStunWave(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    [340, 510, 680].forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.45, now + 0.45);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.58);
    });
  }

  public playHatchlingCelebration(): void {
    const out = this.getSfxTarget();
    if (!this.ctx || !out || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.14;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.68);
    });
  }

  public dispose(): void {
    if (this.musicTimerId !== null) {
      clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      void this.ctx?.close();
    } catch {
      // ignore cleanup errors
    }
    this.ctx = null;
  }
}
