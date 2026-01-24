import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, cleanup, waitFor } from '@testing-library/react';
import { useAudioUrl } from './useAudioUrl';

describe('useAudioUrl', () => {
  const mockUrl = 'blob:http://localhost/test-blob-url';

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('returns null when blob is null', () => {
    const { result } = renderHook(() => useAudioUrl(null));
    expect(result.current).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('creates object URL when blob is provided', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result } = renderHook(() => useAudioUrl(blob));

    await waitFor(() => {
      expect(result.current).toBe(mockUrl);
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('revokes object URL on unmount', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const { result, unmount } = renderHook(() => useAudioUrl(blob));

    await waitFor(() => {
      expect(result.current).toBe(mockUrl);
    });

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  it('revokes old URL and creates new one when blob changes', async () => {
    const blob1 = new Blob(['test1'], { type: 'audio/webm' });
    const blob2 = new Blob(['test2'], { type: 'audio/webm' });
    const mockUrl2 = 'blob:http://localhost/test-blob-url-2';

    const { result, rerender } = renderHook(({ blob }) => useAudioUrl(blob), {
      initialProps: { blob: blob1 },
    });

    await waitFor(() => {
      expect(result.current).toBe(mockUrl);
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob1);

    vi.mocked(URL.createObjectURL).mockReturnValue(mockUrl2);

    rerender({ blob: blob2 });

    await waitFor(() => {
      expect(result.current).toBe(mockUrl2);
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob2);
  });
});
