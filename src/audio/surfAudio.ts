/**
 * Procedural Web Audio Synthesizer for CS2 Surfing
 * Synthesizes dynamic wind rush, ramp friction, jumps, booster rings, and victory chimes.
 */

class SurfAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private rampGain: GainNode | null = null;
  private rampOsc: OscillatorNode | null = null;
  private isInitialized = false;
  private currentVolume = 0.5;
  private isMuted = false;

  private init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Wind noise generator
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = noiseBuffer;
      this.windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      this.windSource.start();

      // 2. Continuous ramp glide tone
      this.rampOsc = this.ctx.createOscillator();
      this.rampOsc.type = 'sine';
      this.rampOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.rampGain = this.ctx.createGain();
      this.rampGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.rampOsc.connect(this.rampGain);
      this.rampGain.connect(this.masterGain);
      this.rampOsc.start();

      this.isInitialized = true;
    } catch {
      // AudioContext may be blocked before user interaction
    }
  }

  public resume() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(volume: number, enabled: boolean) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.isMuted = !enabled;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public updateSpeed(speedUnits: number, isOnRamp: boolean) {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    // Scale wind whoosh by velocity (500 to 3500 u/s)
    const normalizedSpeed = Math.max(0, (speedUnits - 300) / 3200);
    const targetWindGain = Math.min(0.45, normalizedSpeed * 0.45);
    const targetFilterFreq = 200 + Math.pow(Math.min(1, normalizedSpeed), 1.5) * 1600;

    if (this.windGain && this.windFilter) {
      this.windGain.gain.setTargetAtTime(targetWindGain, this.ctx.currentTime, 0.1);
      this.windFilter.frequency.setTargetAtTime(targetFilterFreq, this.ctx.currentTime, 0.1);
    }

    // Scale ramp glide friction hum
    if (this.rampGain && this.rampOsc) {
      const targetRampGain = isOnRamp ? Math.min(0.18, 0.04 + normalizedSpeed * 0.14) : 0;
      const targetPitch = 90 + Math.min(1, normalizedSpeed) * 120;
      this.rampGain.gain.setTargetAtTime(targetRampGain, this.ctx.currentTime, 0.08);
      this.rampOsc.frequency.setTargetAtTime(targetPitch, this.ctx.currentTime, 0.08);
    }
  }

  public playJump() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playBooster() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playCheckpoint() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + index * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  public playRespawn() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playVictory() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [440, 554.37, 659.25, 880];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }
}

export const surfAudio = new SurfAudioEngine();
