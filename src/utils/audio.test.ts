import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAudioDuration } from './audio';

describe('getAudioDuration', () => {
  const mockUrl = 'blob:http://localhost/test-blob-url';
  let onLoadedMetadataCallback: (() => void) | null = null;
  let onErrorCallback: (() => void) | null = null;

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(window, 'Audio').mockImplementation(() => {
      const audio = {
        duration: 5.5,
        set onloadedmetadata(cb: () => void) {
          onLoadedMetadataCallback = cb;
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
    onLoadedMetadataCallback = null;
    onErrorCallback = null;
  });

  it('resolves with duration when metadata loads', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });

    const durationPromise = getAudioDuration(blob);

    onLoadedMetadataCallback?.();

    const duration = await durationPromise;
    expect(duration).toBe(5.5);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  it('rejects when audio fails to load', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });

    const durationPromise = getAudioDuration(blob);

    onErrorCallback?.();

    await expect(durationPromise).rejects.toThrow('Failed to load audio metadata');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  it('creates object URL from blob', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });

    const durationPromise = getAudioDuration(blob);
    onLoadedMetadataCallback?.();
    await durationPromise;

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });
});
