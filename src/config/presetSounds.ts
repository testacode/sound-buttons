import type { Recording } from '@/types/audio';
import { getAudioDuration } from '@/utils/audio';

export type PresetSound = {
  id: string;
  name: string;
  fileName: string;
  category: 'celebration' | 'comedy' | 'alert';
};

export const PRESET_SOUNDS: PresetSound[] = [
  {
    id: 'preset-applause',
    name: 'Applause',
    fileName: 'applause.mp3',
    category: 'celebration',
  },
  {
    id: 'preset-fireworks',
    name: 'Fireworks',
    fileName: 'fireworks.mp3',
    category: 'celebration',
  },
  {
    id: 'preset-rimshot',
    name: 'Rimshot',
    fileName: 'rimshot.mp3',
    category: 'comedy',
  },
  {
    id: 'preset-sad-trombone',
    name: 'Sad Trombone',
    fileName: 'sad-trombone.mp3',
    category: 'comedy',
  },
  {
    id: 'preset-drum-roll',
    name: 'Drum Roll',
    fileName: 'drum-roll.mp3',
    category: 'comedy',
  },
];

async function loadPresetBlob(
  fileName: string
): Promise<{ blob: Blob; duration: number }> {
  const response = await fetch(`/sounds/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to load preset sound: ${fileName}`);
  }

  const blob = await response.blob();
  const duration = await getAudioDuration(blob);

  return { blob, duration };
}

export async function presetToRecording(preset: PresetSound): Promise<Recording> {
  const { blob, duration } = await loadPresetBlob(preset.fileName);

  return {
    id: preset.id,
    name: preset.name,
    blob,
    createdAt: new Date(0),
    duration,
    isPreset: true,
  };
}

export async function getPresetRecordings(): Promise<Recording[]> {
  return Promise.all(PRESET_SOUNDS.map(presetToRecording));
}
