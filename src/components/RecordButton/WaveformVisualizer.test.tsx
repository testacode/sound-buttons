import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WaveformVisualizer } from './WaveformVisualizer';
import type { WaveformData } from '@/types/audio';

describe('WaveformVisualizer', () => {
  it('should render canvas element', () => {
    const { container } = render(<WaveformVisualizer waveformData={null} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with correct dimensions', () => {
    const { container } = render(
      <WaveformVisualizer waveformData={null} width={400} height={80} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '400');
    expect(canvas).toHaveAttribute('height', '80');
  });

  it('should use default dimensions when not provided', () => {
    const { container } = render(<WaveformVisualizer waveformData={null} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '300');
    expect(canvas).toHaveAttribute('height', '60');
  });

  it('should handle waveform data', () => {
    const mockWaveformData: WaveformData = {
      dataArray: new Uint8Array([128, 130, 125, 135]),
      bufferLength: 4,
    };

    const { container } = render(
      <WaveformVisualizer waveformData={mockWaveformData} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
