/**
 * Audio Engine - Native Low-Latency Audio Controller & Smooth Crossfade
 * Does not hijack HTMLAudioElement with createMediaElementSource to prevent CORS silence on remote streams.
 */
import { PlayerSettings } from "./playerSettings";

class AudioEngine {
  private fadeInterval: any = null;

  public init(_audioElement: HTMLAudioElement) {
    // Media plays natively via HTMLAudioElement to avoid CORS buffer silence on cross-origin archive streams
  }

  public resume() {
    // No-op for direct HTML5 audio playback
  }

  public updateSettings(_settings: PlayerSettings) {
    // Settings applied directly to native player
  }

  public fadeIn(audioElement: HTMLAudioElement, targetVolume: number, durationSeconds: number) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (durationSeconds <= 0 || targetVolume <= 0) {
      audioElement.volume = Math.max(0, Math.min(1, targetVolume));
      return;
    }

    audioElement.volume = 0;
    const steps = 20;
    const stepTime = (durationSeconds * 1000) / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const currentVol = (targetVolume * currentStep) / steps;
      audioElement.volume = Math.max(0, Math.min(1, currentVol));
      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        audioElement.volume = targetVolume;
      }
    }, stepTime);
  }

  public fadeOut(
    audioElement: HTMLAudioElement,
    durationSeconds: number,
    onComplete?: () => void
  ) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (durationSeconds <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const initialVol = audioElement.volume;
    const steps = 15;
    const stepTime = (durationSeconds * 1000) / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const vol = initialVol * (1 - currentStep / steps);
      audioElement.volume = Math.max(0, Math.min(1, vol));
      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        audioElement.volume = 0;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }
}

export const audioEngine = new AudioEngine();

