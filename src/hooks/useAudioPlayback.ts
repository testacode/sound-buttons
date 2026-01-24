import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioUrl } from './useAudioUrl';

type UseAudioPlaybackReturn = {
  play: () => void;
  isPlaying: boolean;
  error: string | null;
};

/**
 * Hook for audio playback with automatic cleanup.
 * Always restarts from the beginning on each play.
 */
export function useAudioPlayback(blob: Blob | null): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useAudioUrl(blob);

  const play = useCallback(() => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setError('Error al reproducir audio');
      };
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setError(null);
  }, [audioUrl]);

  // Cleanup audio element on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  return { play, isPlaying, error };
}
