import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob } from './download';

describe('downloadBlob', () => {
  const mockUrl = 'blob:http://localhost/test-blob-url';
  let mockAnchor: HTMLAnchorElement;

  beforeEach(() => {
    mockAnchor = document.createElement('a');
    vi.spyOn(mockAnchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates object URL from blob', () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    downloadBlob(blob, 'test.webm');

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('sets correct href and download attributes', () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    downloadBlob(blob, 'my-audio.webm');

    expect(mockAnchor.href).toBe(mockUrl);
    expect(mockAnchor.download).toBe('my-audio.webm');
  });

  it('appends anchor to body, clicks it, then removes it', () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    downloadBlob(blob, 'test.webm');

    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
  });

  it('revokes object URL after download', () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    downloadBlob(blob, 'test.webm');

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
});
