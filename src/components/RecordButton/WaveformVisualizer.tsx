import { useEffect, useRef } from 'react';
import type { WaveformData } from '@/types/audio';

type WaveformVisualizerProps = {
  waveformData: WaveformData | null;
  width?: number;
  height?: number;
  color?: string;
};

export const WaveformVisualizer = ({
  waveformData,
  width = 300,
  height = 60,
  color = '#228be6',
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { dataArray, bufferLength } = waveformData;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set line style
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0; // Normalize to 0-2
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [waveformData, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        borderRadius: '4px',
        backgroundColor: 'rgba(34, 139, 230, 0.1)',
      }}
    />
  );
};
