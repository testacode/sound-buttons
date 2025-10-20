import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SoundGrid } from './SoundGrid';
import type { Recording } from '@/types/audio';
import { MantineProvider } from '@mantine/core';

const mockRecordings: Recording[] = [
  {
    id: '1',
    name: 'Test Audio 1',
    blob: new Blob(['test'], { type: 'audio/webm' }),
    createdAt: new Date(),
    duration: 5.5,
  },
  {
    id: '2',
    name: 'Test Audio 2',
    blob: new Blob(['test'], { type: 'audio/webm' }),
    createdAt: new Date(),
    duration: 10.2,
  },
];

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('SoundGrid', () => {
  it('should render empty state when no recordings', () => {
    const { getByText } = renderWithMantine(
      <SoundGrid
        recordings={[]}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onDownload={vi.fn()}
      />
    );

    expect(getByText(/No hay grabaciones todavía/i)).toBeInTheDocument();
  });

  it('should render recordings when provided', () => {
    const { getByText } = renderWithMantine(
      <SoundGrid
        recordings={mockRecordings}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onDownload={vi.fn()}
      />
    );

    expect(getByText('Test Audio 1')).toBeInTheDocument();
    expect(getByText('Test Audio 2')).toBeInTheDocument();
  });

  it('should render correct number of SoundButtons', () => {
    const { container } = renderWithMantine(
      <SoundGrid
        recordings={mockRecordings}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onDownload={vi.fn()}
      />
    );

    const cards = container.querySelectorAll('[class*="mantine-Card"]');
    expect(cards.length).toBe(mockRecordings.length);
  });
});
