export type RecordingState = 'idle' | 'recording' | 'processing';

export type PlaybackState = 'idle' | 'playing';

export type Recording = {
  id: string;
  name: string;
  blob: Blob;
  createdAt: Date;
  duration: number; // in seconds
};

export type RecordingData = {
  id: string;
  name: string;
  blobUrl: string;
  createdAt: string; // ISO string for IndexedDB
  duration: number;
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
