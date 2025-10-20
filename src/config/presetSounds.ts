import type { Recording } from '@/types/audio';

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

/**
 * Load a preset sound file and convert it to a Blob with duration
 */
async function loadPresetBlob(
  fileName: string
): Promise<{ blob: Blob; duration: number }> {
  const response = await fetch(`/sounds/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to load preset sound: ${fileName}`);
  }

  const blob = await response.blob();

  // Get audio duration
  const audio = new Audio(URL.createObjectURL(blob));
  const duration = await new Promise<number>((resolve, reject) => {
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => {
      reject(new Error(`Failed to load audio metadata for ${fileName}`));
      URL.revokeObjectURL(audio.src);
    };
  });

  return { blob, duration };
}

/**
 * Convert a preset sound definition to a Recording object
 */
export async function presetToRecording(preset: PresetSound): Promise<Recording> {
  const { blob, duration } = await loadPresetBlob(preset.fileName);

  return {
    id: preset.id,
    name: preset.name,
    blob,
    createdAt: new Date(0), // Use epoch time so presets sort first
    duration,
    isPreset: true,
  };
}

/**
 * Get all preset recordings
 */
export async function getPresetRecordings(): Promise<Recording[]> {
  return Promise.all(PRESET_SOUNDS.map(presetToRecording));
}
