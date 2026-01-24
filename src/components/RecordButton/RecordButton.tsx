import { useEffect, useState, useRef } from 'react';
import { Button, Stack, Text, Group, RingProgress, Alert } from '@mantine/core';
import { IconMicrophone, IconPlayerStop, IconInfoCircle } from '@tabler/icons-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { WaveformVisualizer } from './WaveformVisualizer';

type RecordButtonProps = {
  onRecordingComplete: (blob: Blob, duration: number) => void;
};

const MAX_DURATION = 30;

export const RecordButton = ({ onRecordingComplete }: RecordButtonProps) => {
  const {
    isRecording,
    recordingState,
    startRecording,
    stopRecording,
    audioBlob,
    duration,
    error,
    waveformData,
  } = useAudioRecorder();

  const [elapsedTime, setElapsedTime] = useState(0);
  const processedBlobRef = useRef<Blob | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = performance.now();
      lastUpdateRef.current = 0;
      setElapsedTime(0);

      const updateTimer = (currentTime: number) => {
        const elapsed = (currentTime - startTimeRef.current) / 1000;
        const clampedElapsed = Math.min(elapsed, MAX_DURATION);

        // Only update state every ~200ms to reduce re-renders (5 updates/sec vs 10)
        const roundedElapsed = Math.floor(clampedElapsed * 5) / 5;
        if (roundedElapsed !== lastUpdateRef.current) {
          lastUpdateRef.current = roundedElapsed;
          setElapsedTime(roundedElapsed);
        }

        if (clampedElapsed < MAX_DURATION) {
          rafIdRef.current = requestAnimationFrame(updateTimer);
        }
      };

      rafIdRef.current = requestAnimationFrame(updateTimer);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // Only process if we have a new blob that hasn't been processed yet
    if (audioBlob && duration > 0 && audioBlob !== processedBlobRef.current) {
      processedBlobRef.current = audioBlob;
      onRecordingComplete(audioBlob, duration);
    }
  }, [audioBlob, duration, onRecordingComplete]);

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const progress = (elapsedTime / MAX_DURATION) * 100;

  return (
    <Stack gap="md" align="center">
      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      )}

      <Group gap="lg" align="center">
        {isRecording && (
          <RingProgress
            size={120}
            thickness={8}
            sections={[{ value: progress, color: 'red' }]}
            label={
              <Stack gap={0} align="center">
                <Button
                  onClick={handleButtonClick}
                  color="red"
                  variant="filled"
                  size="md"
                  radius="xl"
                  leftSection={<IconPlayerStop size={20} />}
                  loading={recordingState === 'processing'}
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                >
                  Detener
                </Button>
              </Stack>
            }
          />
        )}

        {!isRecording && (
          <Button
            onClick={handleButtonClick}
            color="blue"
            variant="filled"
            size="xl"
            radius="xl"
            leftSection={<IconMicrophone size={24} />}
            loading={recordingState === 'processing'}
          >
            Grabar Audio
          </Button>
        )}
      </Group>

      {isRecording && (
        <Stack gap="xs" align="center">
          <Text size="sm" c="dimmed">
            Tiempo: {elapsedTime.toFixed(1)}s / {MAX_DURATION}s
          </Text>
          <WaveformVisualizer waveformData={waveformData} width={300} height={60} />
        </Stack>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Stack>
  );
};
