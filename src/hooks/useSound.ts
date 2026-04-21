import { useCallback, useRef } from 'react';

/**
 * Custom hook for playing UI sound effects using Web Audio API. 
 * Provides a "ticking" sound consistent with the Ruina Atlas aesthetic.
 */
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = useCallback((options?: { pitch?: number; volume?: number; duration?: number }) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const pitch = options?.pitch ?? 1200;
      const volume = options?.volume ?? 0.05;
      const duration = options?.duration ?? 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, []);

  const playClink = useCallback(() => {
    playTick({ pitch: 1800, volume: 0.03, duration: 0.06 });
  }, [playTick]);

  const playThump = useCallback(() => {
    playTick({ pitch: 150, volume: 0.1, duration: 0.1 });
  }, [playTick]);

  return { playTick, playClink, playThump };
}
