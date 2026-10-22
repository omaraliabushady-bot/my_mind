// Web Audio API Synthesized Audio Engine (Zero external dependencies)
import type { AmbientSoundType } from '../types';

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Ensures AudioContext is safely unlocked on the first user gesture
 * (prevents "AudioContext was not allowed to start" warnings)
 */
export function initAudioOnUserGesture(): void {
  if (isAudioUnlocked || typeof window === 'undefined') return;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      isAudioUnlocked = true;
    } catch {
      // ignore
    } finally {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    }
  };

  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

/**
 * Instant, crisp, satisfying accomplishment sound on completing a task.
 * Synthesizes a multi-harmonic crystalline chime (A5, E6, C#7, E7).
 */
export function playTaskCompletionSound(volume = 0.5): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.45, now);
    masterGain.connect(ctx.destination);

    // Chime notes: A5 (880Hz), E6 (1318.5Hz), C#7 (2217.4Hz), E7 (2637Hz)
    const notes = [
      { freq: 880, delay: 0, duration: 0.85, gain: 0.6 },
      { freq: 1318.5, delay: 0.04, duration: 0.9, gain: 0.5 },
      { freq: 2217.4, delay: 0.08, duration: 1.1, gain: 0.35 },
      { freq: 2637.0, delay: 0.12, duration: 1.25, gain: 0.25 }
    ];

    notes.forEach(({ freq, delay, duration, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(noteGain, now + delay + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Deep meditative Zen gong / singing bowl for Pomodoro finish
 */
export function playPomodoroFinishSound(volume = 0.6): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.5, now);
    masterGain.connect(ctx.destination);

    const harmonics = [
      { freq: 293.66, gain: 0.7, duration: 3.5 }, // D4
      { freq: 440.00, gain: 0.4, duration: 3.2 }, // A4
      { freq: 587.33, gain: 0.25, duration: 2.8 }, // D5
      { freq: 880.00, gain: 0.15, duration: 2.2 }, // A5
      { freq: 1174.66, gain: 0.08, duration: 1.5 }  // D6
    ];

    harmonics.forEach(({ freq, gain: hGain, duration }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(hGain, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  } catch (err) {
    console.warn('Gong playback error:', err);
  }
}

/**
 * Subtle tactile UI micro-click
 */
export function playClickSound(volume = 0.3): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;

    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {
    // ignore
  }
}

/**
 * Soft subtle clock tick for Pomodoro timer
 */
export function playClockTickSound(volume = 0.15): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

    filter.type = 'bandpass';
    filter.frequency.value = 1400;

    gain.gain.setValueAtTime(volume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {
    // ignore
  }
}

// Ambient Sound Synthesizer Singleton
class AmbientEngine {
  private currentType: AmbientSoundType = 'none';
  private nodes: {
    sources: (AudioNode | AudioScheduledSourceNode)[];
    masterGain: GainNode | null;
  } | null = null;
  private volume = 0.5;

  public setVolume(vol: number): void {
    this.volume = vol;
    if (this.nodes?.masterGain && audioCtx) {
      this.nodes.masterGain.gain.setValueAtTime(vol * 0.25, audioCtx.currentTime);
    }
  }

  public play(type: AmbientSoundType, vol?: number): void {
    if (vol !== undefined) this.volume = vol;
    if (this.currentType === type && this.nodes) return;
    this.stop();

    if (type === 'none') return;
    this.currentType = type;

    try {
      const ctx = getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const sources: (AudioNode | AudioScheduledSourceNode)[] = [];

      if (type === 'brown') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        sources.push(whiteNoise);
      } else if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 900;
        bandpass.Q.value = 0.6;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1600;

        noise.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(masterGain);
        noise.start();
        sources.push(noise);
      } else if (type === 'binaural') {
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();

        leftOsc.type = 'sine';
        leftOsc.frequency.value = 432;
        rightOsc.type = 'sine';
        rightOsc.frequency.value = 440;

        if (ctx.createStereoPanner) {
          const leftPan = ctx.createStereoPanner();
          leftPan.pan.value = -0.8;
          const rightPan = ctx.createStereoPanner();
          rightPan.pan.value = 0.8;

          leftOsc.connect(leftPan);
          leftPan.connect(masterGain);

          rightOsc.connect(rightPan);
          rightPan.connect(masterGain);
        } else {
          leftOsc.connect(masterGain);
          rightOsc.connect(masterGain);
        }

        leftOsc.start();
        rightOsc.start();
        sources.push(leftOsc, rightOsc);
      }

      this.nodes = { sources, masterGain };
    } catch (e) {
      console.warn('Ambient engine failed to initialize:', e);
    }
  }

  public stop(): void {
    if (this.nodes) {
      this.nodes.sources.forEach(src => {
        if ('stop' in src && typeof src.stop === 'function') {
          try {
            src.stop();
          } catch {
            // ignore
          }
        }
      });
      this.nodes = null;
    }
    this.currentType = 'none';
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }
}

export const ambientEngine = new AmbientEngine();
