'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack, Title, Text, Divider, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import { RecordButton } from '@/components/RecordButton/RecordButton';
import { SoundGrid } from '@/components/SoundGrid/SoundGrid';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { audioStorage } from '@/services/audioStorage';
import { downloadBlob } from '@/utils/download';
import { showErrorToast } from '@/utils/notifications';
import type { Recording } from '@/types/audio';

export default function Home() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecordings = async () => {
      try {
        const allRecordings = await audioStorage.getAllRecordings();
        setRecordings(allRecordings);
      } catch (error) {
        showErrorToast('Error al cargar las grabaciones');
        console.error('Error loading recordings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, []);

  const handleRecordingComplete = useCallback(async (blob: Blob, duration: number) => {
    try {
      const userRecordings = await audioStorage.getRecordings();
      const newRecording: Recording = {
        id: crypto.randomUUID(),
        name: `Audio ${userRecordings.length + 1}`,
        blob,
        createdAt: new Date(),
        duration,
        isPreset: false,
      };

      await audioStorage.saveRecording(newRecording);

      setRecordings((prev) => {
        const presets = prev.filter((r) => r.isPreset);
        const userRecs = prev.filter((r) => !r.isPreset);
        return [...presets, newRecording, ...userRecs];
      });
    } catch (error) {
      showErrorToast('Error al guardar la grabación');
      console.error('Error saving recording:', error);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const recording = recordings.find((r) => r.id === id);
    if (recording?.isPreset) {
      showErrorToast('No se pueden eliminar los sonidos predefinidos');
      return;
    }

    try {
      await audioStorage.deleteRecording(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      showErrorToast('Error al eliminar la grabación');
      console.error('Error deleting recording:', error);
    }
  }, [recordings]);

  const handleRename = useCallback(async (id: string, newName: string) => {
    const recording = recordings.find((r) => r.id === id);
    if (recording?.isPreset) {
      showErrorToast('No se pueden renombrar los sonidos predefinidos');
      return;
    }

    try {
      await audioStorage.updateRecording(id, { name: newName });
      setRecordings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
      );
    } catch (error) {
      showErrorToast('Error al renombrar la grabación');
      console.error('Error renaming recording:', error);
    }
  }, [recordings]);

  const handleDownload = useCallback((id: string) => {
    const recording = recordings.find((r) => r.id === id);
    if (!recording) return;

    downloadBlob(recording.blob, `${recording.name}.webm`);
  }, [recordings]);

  const handleDeleteAll = useCallback(() => {
    modals.openConfirmModal({
      title: '⚠️ Borrar todas las grabaciones',
      children: (
        <Text size="sm">
          ¿Estás seguro que quieres eliminar todas tus grabaciones? Los sonidos predefinidos no se eliminarán. Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Borrar todo', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await audioStorage.deleteAllRecordings();
          setRecordings((prev) => prev.filter((r) => r.isPreset));
        } catch (error) {
          showErrorToast('Error al eliminar las grabaciones');
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

  return (
    <Container size="lg" py="xl">
      <ColorSchemeToggle />
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

        {recordings.some((r) => !r.isPreset) && (
          <Group justify="center">
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteAll}
            >
              Borrar todas mis grabaciones
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
