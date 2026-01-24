import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { useAudioPlayback } from './useAudioPlayback';

describe('useAudioPlayback', () => {
  const mockUrl = 'blob:http://localhost/test-blob-url';
  let onEndedCallback: (() => void) | null = null;
  let onErrorCallback: (() => void) | null = null;
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;
  let currentTimeValue: number;

  beforeEach(() => {
    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();
    currentTimeValue = 0;
    onEndedCallback = null;
    onErrorCallback = null;

    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(window, 'Audio').mockImplementation(() => {
      const audio = {
        get currentTime() {
          return currentTimeValue;
        },
        set currentTime(val: number) {
          currentTimeValue = val;
        },
        play: playMock,
        pause: pauseMock,
        set onended(cb: () => void) {
          onEndedCallback = cb;
        },
        set onerror(cb: () => void) {
          onErrorCallback = cb;
        },
      };
      return audio as unknown as HTMLAudioElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('returns initial state with null blob', () => {
    const { result } = renderHook(() => useAudioPlayback(null));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('plays audio from the beginning', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result } = renderHook(() => useAudioPlayback(blob));

    // Wait for URL to be set
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    act(() => {
      result.current.play();
    });

    expect(currentTimeValue).toBe(0);
    expect(playMock).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
  });

  it('sets isPlaying to false when audio ends', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result } = renderHook(() => useAudioPlayback(blob));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      onEndedCallback?.();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('sets error when audio fails to play', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result } = renderHook(() => useAudioPlayback(blob));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    act(() => {
      result.current.play();
    });

    act(() => {
      onErrorCallback?.();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.error).toBe('Error al reproducir audio');
  });

  it('does nothing when play is called with null blob', () => {
    const { result } = renderHook(() => useAudioPlayback(null));

    act(() => {
      result.current.play();
    });

    expect(window.Audio).not.toHaveBeenCalled();
  });

  it('pauses and cleans up on unmount', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result, unmount } = renderHook(() => useAudioPlayback(blob));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    act(() => {
      result.current.play();
    });

    unmount();

    expect(pauseMock).toHaveBeenCalled();
  });
});
