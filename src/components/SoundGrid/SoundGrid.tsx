import { SimpleGrid, Text, Stack } from '@mantine/core';
import { SoundButton } from '@/components/SoundButton/SoundButton';
import type { Recording } from '@/types/audio';

type SoundGridProps = {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownload: (id: string) => void;
};

export const SoundGrid = ({
  recordings,
  onDelete,
  onRename,
  onDownload,
}: SoundGridProps) => {
  if (recordings.length === 0) {
    return (
      <Stack align="center" mt="xl">
        <Text c="dimmed" size="sm">
          No hay grabaciones todavía. ¡Presiona &quot;Grabar Audio&quot; para comenzar!
        </Text>
      </Stack>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }}
      spacing="md"
      verticalSpacing="md"
    >
      {recordings.map((recording) => (
        <SoundButton
          key={recording.id}
          recording={recording}
          onDelete={onDelete}
          onRename={onRename}
          onDownload={onDownload}
        />
      ))}
    </SimpleGrid>
  );
};
