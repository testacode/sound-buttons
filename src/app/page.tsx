'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack, Title, Text, Divider, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import { RecordButton } from '@/components/RecordButton/RecordButton';
import { SoundGrid } from '@/components/SoundGrid/SoundGrid';
import { audioStorage } from '@/services/audioStorage';
import type { Recording } from '@/types/audio';

export default function Home() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recordings from IndexedDB on mount
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        const stored = await audioStorage.getRecordings();
        setRecordings(stored);
      } catch (error) {
        console.error('Error loading recordings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, []);

  const handleRecordingComplete = useCallback(async (blob: Blob, duration: number) => {
    try {
      // Get current count from state to calculate name without dependency
      const allRecordings = await audioStorage.getRecordings();
      const newRecording: Recording = {
        id: crypto.randomUUID(),
        name: `Audio ${allRecordings.length + 1}`,
        blob,
        createdAt: new Date(),
        duration,
      };

      await audioStorage.saveRecording(newRecording);
      setRecordings((prev) => [newRecording, ...prev]);
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await audioStorage.deleteRecording(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  }, []);

  const handleRename = useCallback(async (id: string, newName: string) => {
    try {
      await audioStorage.updateRecording(id, { name: newName });
      setRecordings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
      );
    } catch (error) {
      console.error('Error renaming recording:', error);
    }
  }, []);

  const handleDownload = useCallback((id: string) => {
    const recording = recordings.find((r) => r.id === id);
    if (!recording) return;

    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordings]);

  const handleDeleteAll = useCallback(() => {
    modals.openConfirmModal({
      title: '⚠️ Borrar todas las grabaciones',
      children: (
        <Text size="sm">
          ¿Estás seguro que quieres eliminar TODAS las grabaciones? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Borrar todo', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await audioStorage.deleteAllRecordings();
          setRecordings([]);
        } catch (error) {
          console.error('Error deleting all recordings:', error);
        }
      },
    });
  }, []);

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Text c="dimmed">Cargando...</Text>
        </Stack>
      </Container>
    );
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="sm" align="center">
          <Title order={1}>Botonera de Sonidos</Title>
          <Text c="dimmed" size="sm" ta="center">
            Graba audios de hasta 30 segundos y crea tu propia botonera de sonidos
          </Text>
        </Stack>

        <Divider />

        <RecordButton onRecordingComplete={handleRecordingComplete} />

        <Divider />

        {isDevelopment && recordings.length > 0 && (
          <Group justify="center">
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteAll}
            >
              🔧 DEV: Borrar todos los audios
            </Button>
          </Group>
        )}

        <SoundGrid
          recordings={recordings}
          onDelete={handleDelete}
          onRename={handleRename}
          onDownload={handleDownload}
        />
      </Stack>
    </Container>
  );
}
