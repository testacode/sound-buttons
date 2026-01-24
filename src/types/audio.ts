export type RecordingState = 'idle' | 'recording' | 'processing';

export type Recording = {
  id: string;
  name: string;
  blob: Blob;
  createdAt: Date;
  duration: number; // in seconds
  isPreset?: boolean; // true for predefined sounds, undefined/false for user recordings
};

export type WaveformData = {
  dataArray: Uint8Array;
  bufferLength: number;
};

export type AudioRecorderResult = {
  isRecording: boolean;
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
  waveformData: WaveformData | null;
};
