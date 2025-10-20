import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PRESET_SOUNDS, presetToRecording, getPresetRecordings } from './presetSounds';

// Mock fetch and Audio API
global.fetch = vi.fn();
global.Audio = vi.fn().mockImplementation(() => ({
  src: '',
  duration: 0,
  onloadedmetadata: null,
  onerror: null,
}));
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('PresetSounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should define 5 preset sounds', () => {
    expect(PRESET_SOUNDS).toHaveLength(5);
  });

  it('should have applause preset', () => {
    const applause = PRESET_SOUNDS.find((p) => p.id === 'preset-applause');
    expect(applause).toBeDefined();
    expect(applause?.name).toBe('Applause');
    expect(applause?.fileName).toBe('applause.mp3');
    expect(applause?.category).toBe('celebration');
  });

  it('should have fireworks preset', () => {
    const fireworks = PRESET_SOUNDS.find((p) => p.id === 'preset-fireworks');
    expect(fireworks).toBeDefined();
    expect(fireworks?.name).toBe('Fireworks');
    expect(fireworks?.category).toBe('celebration');
  });

  it('should have rimshot preset', () => {
    const rimshot = PRESET_SOUNDS.find((p) => p.id === 'preset-rimshot');
    expect(rimshot).toBeDefined();
    expect(rimshot?.name).toBe('Rimshot');
    expect(rimshot?.category).toBe('comedy');
  });

  it('should have sad trombone preset', () => {
    const sadTrombone = PRESET_SOUNDS.find((p) => p.id === 'preset-sad-trombone');
    expect(sadTrombone).toBeDefined();
    expect(sadTrombone?.name).toBe('Sad Trombone');
    expect(sadTrombone?.category).toBe('comedy');
  });

  it('should have drum roll preset', () => {
    const drumRoll = PRESET_SOUNDS.find((p) => p.id === 'preset-drum-roll');
    expect(drumRoll).toBeDefined();
    expect(drumRoll?.name).toBe('Drum Roll');
    expect(drumRoll?.category).toBe('comedy');
  });

  it('should convert preset to recording with isPreset flag', async () => {
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/mp3' });
    const mockDuration = 3.5;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock Audio API to call onloadedmetadata automatically
    (global.Audio as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      const mockAudio = {
        src: '',
        duration: mockDuration,
        onloadedmetadata: null as (() => void) | null,
        onerror: null,
      };
      // Auto-trigger onloadedmetadata after a microtask
      queueMicrotask(() => {
        if (mockAudio.onloadedmetadata) {
          mockAudio.onloadedmetadata();
        }
      });
      return mockAudio;
    });

    const preset = PRESET_SOUNDS[0];
    const recording = await presetToRecording(preset);

    expect(recording.id).toBe(preset.id);
    expect(recording.name).toBe(preset.name);
    expect(recording.isPreset).toBe(true);
    expect(recording.duration).toBe(mockDuration);
    expect(recording.blob).toBe(mockBlob);
  });

  it('should load all preset recordings', async () => {
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/mp3' });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock Audio API
    (global.Audio as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      const mockAudio = {
        src: '',
        duration: 2.5,
        onloadedmetadata: null as (() => void) | null,
        onerror: null,
      };
      // Auto-trigger onloadedmetadata
      setTimeout(() => {
        if (mockAudio.onloadedmetadata) {
          mockAudio.onloadedmetadata();
        }
      }, 0);
      return mockAudio;
    });

    const recordings = await getPresetRecordings();

    expect(recordings).toHaveLength(5);
    expect(recordings.every((r) => r.isPreset)).toBe(true);
    expect(recordings[0].createdAt.getTime()).toBe(0); // Epoch time for presets
  });

  it('should throw error if fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const preset = PRESET_SOUNDS[0];

    await expect(presetToRecording(preset)).rejects.toThrow(
      `Failed to load preset sound: ${preset.fileName}`
    );
  });
});
