// KHAOS // SOUL TERMINAL — Procedural Machine Audio Engine
// Generates all sound diegetically via Web Audio API without external soundtrack files.

class MachineAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private startingDrone: boolean = false;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private cachedNoiseBuffer: AudioBuffer | null = null;
  private lastHoverTime: number = 0;

  // For Transmission BPM synthesizer
  private transmissionTimer: number | null = null;
  private activeTransmissionId: string | null = null;
  private stepIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (ctx && ctx.state === 'running' && !this.humOsc1) {
          this.startAmbientDrone();
        }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx
        .resume()
        .then(() => {
          if (this.enabled && !this.humOsc1 && !this.startingDrone) {
            this.startAmbientDrone();
          }
        })
        .catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  public enable(): void {
    this.enabled = true;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'running' && !this.humOsc1 && !this.startingDrone) {
      this.startAmbientDrone();
    }
  }

  public disable(): void {
    this.enabled = false;
    this.stopAmbientDrone();
    this.stopTransmission();
  }

  private startAmbientDrone(): void {
    if (this.startingDrone || !this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    this.startingDrone = true;
    this.stopAmbientDrone();

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.038, ctx.currentTime + 1.2);
      masterGain.connect(ctx.destination);
      this.humGain = masterGain;

      // 54Hz deep electrical reactor hum
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(54, ctx.currentTime);

      // 27Hz sub-harmonic pulse
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(27.05, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(115, ctx.currentTime);
      filter.Q.setValueAtTime(4.5, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      this.humOsc1 = osc1;
      this.humOsc2 = osc2;

      // Subtle terminal room static (cached buffer)
      if (!this.cachedNoiseBuffer) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.5);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        this.cachedNoiseBuffer = buffer;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = this.cachedNoiseBuffer;
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1800, ctx.currentTime);
      bandpass.Q.setValueAtTime(2.0, ctx.currentTime);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.006, ctx.currentTime);

      noise.connect(bandpass);
      bandpass.connect(nGain);
      nGain.connect(ctx.destination);

      noise.start();
      this.noiseNode = noise;
      this.noiseGain = nGain;
    } catch {
      // Ignore audio errors on restricted autoplay
    } finally {
      this.startingDrone = false;
    }
  }

  private stopAmbientDrone(): void {
    try {
      if (this.humOsc1) {
        this.humOsc1.stop();
        this.humOsc1.disconnect();
        this.humOsc1 = null;
      }
      if (this.humOsc2) {
        this.humOsc2.stop();
        this.humOsc2.disconnect();
        this.humOsc2 = null;
      }
      if (this.humGain) {
        this.humGain.disconnect();
        this.humGain = null;
      }
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.noiseGain) {
        this.noiseGain.disconnect();
        this.noiseGain = null;
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  // Mechanical relay click
  public playClick(freq = 1200): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Subtle hover micro-tick
  public playHover(): void {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverTime < 45) return;
    this.lastHoverTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.009);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.012);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Digital glitch / static burst
  public playGlitch(intensity = 1): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const duration = 0.08 * Math.min(2.5, Math.max(0.4, intensity));
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() > 0.5 ? 1 : -1) * Math.random();
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400 + Math.random() * 2600, now);
      filter.Q.setValueAtTime(6, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Deep Vendex interference sub-pulse
  public playVendexPulse(): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(92, now);
      osc.frequency.exponentialRampToValueAtTime(41, now + 0.45);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(46, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.5);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(75, now + 0.45);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.55);
      sub.stop(now + 0.55);
      this.playGlitch(0.8);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Industrial alarm klaxon
  public playAlarm(): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Disharmonic industrial interval
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.setValueAtTime(311, now + 0.18);
      osc2.frequency.setValueAtTime(466.16, now);
      osc2.frequency.setValueAtTime(329.63, now + 0.18);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.44);
      osc2.stop(now + 0.44);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Progress tick for Mask Synchronization
  public playMaskSyncTick(progress: number): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 180 + progress * 6.5;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Monumental Connection Restored chord followed by silence
  public playConnectionRestored(): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const freqs = [55, 110, 164.81, 220, 329.63];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx < 2 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 2.6);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.055 / (idx + 1), now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.9);
      });
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Procedural Hard-Techno / Industrial Transmission Signal Synthesizer
  public startTransmission(id: string, bpm: number, seed: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.enabled) {
      this.enable();
    }

    this.stopTransmission();
    this.activeTransmissionId = id;
    this.stepIndex = 0;

    // 16th note interval in ms
    const stepMs = (60 / bpm / 4) * 1000;

    const triggerStep = () => {
      if (!this.ctx || !this.activeTransmissionId) return;
      const now = this.ctx.currentTime;
      const step = this.stepIndex % 16;

      // 4x4 Industrial Kick on 0, 4, 8, 12
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.09);
        kickOsc.frequency.exponentialRampToValueAtTime(24, now + 0.24);

        kickGain.gain.setValueAtTime(0.26, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.27);
      }

      // Off-beat industrial rumble bass on 2, 3, 6, 7, 10, 11, 14, 15
      if (step % 4 === 2 || step % 4 === 3) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        subOsc.type = 'sawtooth';
        const rootNote = 41.2 + (seed % 4) * 2.5;
        subOsc.frequency.setValueAtTime(rootNote, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(130, now);

        subGain.gain.setValueAtTime(0.11, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        subOsc.connect(filter);
        filter.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.12);
      }

      // Metallic industrial hi-hat on offbeats (2, 6, 10, 14)
      if (step % 4 === 2) {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const hat = this.ctx.createBufferSource();
        hat.buffer = buffer;

        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(5500, now);

        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.045, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        hat.connect(hp);
        hp.connect(hatGain);
        hatGain.connect(this.ctx.destination);
        hat.start(now);
      }

      // Acid / Modular telemetry sequence
      const pattern = [110, 0, 116.5, 110, 0, 130.8, 110, 146.8, 110, 0, 116.5, 0, 164.8, 110, 116.5, 98];
      const note = pattern[(step + seed) % pattern.length];
      if (note > 0) {
        const synth = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        const sFilter = this.ctx.createBiquadFilter();

        synth.type = 'sawtooth';
        synth.frequency.setValueAtTime(note * (1 + (seed % 3) * 0.25), now);

        sFilter.type = 'bandpass';
        sFilter.frequency.setValueAtTime(600 + (step % 5) * 280, now);
        sFilter.Q.setValueAtTime(5.5, now);

        sGain.gain.setValueAtTime(0.05, now);
        sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        synth.connect(sFilter);
        sFilter.connect(sGain);
        sGain.connect(this.ctx.destination);

        synth.start(now);
        synth.stop(now + 0.1);
      }

      this.stepIndex++;
    };

    triggerStep();
    this.transmissionTimer = window.setInterval(triggerStep, stepMs);
  }

  public stopTransmission(): void {
    if (this.transmissionTimer !== null) {
      clearInterval(this.transmissionTimer);
      this.transmissionTimer = null;
    }
    this.activeTransmissionId = null;
  }

  public getActiveTransmissionId(): string | null {
    return this.activeTransmissionId;
  }
}

export const soundEngine = new MachineAudioEngine();
