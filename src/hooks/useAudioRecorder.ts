import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioRecorderResult, RecordingState, WaveformData } from '@/types/audio';

const MAX_DURATION_SECONDS = 30;

// Detect supported audio format
const getSupportedMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
};

export const useAudioRecorder = (): AudioRecorderResult => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    setWaveformData({ dataArray, bufferLength });

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setDuration(0);
      audioChunksRef.current = [];

      // Check MediaRecorder support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta grabación de audio');
      }

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('Tu navegador no soporta ningún formato de audio compatible');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Web Audio API for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start waveform animation
      updateWaveform();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordingState('processing');

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        const endTime = Date.now();
        const recordedDuration = (endTime - startTimeRef.current) / 1000;
        setDuration(Math.min(recordedDuration, MAX_DURATION_SECONDS));

        setRecordingState('idle');
        cleanup();
      };

      mediaRecorder.onerror = () => {
        setError('Error durante la grabación');
        setRecordingState('idle');
        cleanup();
      };

      // Start recording
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setRecordingState('recording');

      // Auto-stop after 30 seconds
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_DURATION_SECONDS * 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar grabación';
      setError(errorMessage);
      setRecordingState('idle');
      cleanup();
    }
  }, [cleanup, stopRecording, updateWaveform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording: recordingState === 'recording',
    recordingState,
    startRecording,
    stopRecording,
    audioBlob,
    duration,
    error,
    waveformData,
  };
};
