import { useState } from 'react';
import { Card, Stack, Group, ActionIcon, Text, TextInput, Badge } from '@mantine/core';
import {
  IconPlayerPlay,
  IconTrash,
  IconDownload,
  IconEdit,
  IconCheck,
  IconX,
  IconStar,
} from '@tabler/icons-react';
import type { Recording } from '@/types/audio';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { formatDuration } from '@/utils/time';

type SoundButtonProps = {
  recording: Recording;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownload: (id: string) => void;
};

export const SoundButton = ({
  recording,
  onDelete,
  onRename,
  onDownload,
}: SoundButtonProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(recording.name);
  const { play, isPlaying } = useAudioPlayback(recording.blob);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(recording.name);
  };

  const handleSaveEdit = () => {
    if (editedName.trim() && editedName !== recording.name) {
      onRename(recording.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(recording.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        cursor: isEditing ? 'default' : 'pointer',
        backgroundColor: isPlaying ? 'rgba(34, 139, 230, 0.05)' : undefined,
        transition: 'all 0.2s ease',
      }}
      onClick={!isEditing ? play : undefined}
    >
      <Stack gap="sm">
        {isEditing ? (
          <Group gap="xs">
            <TextInput
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre del audio"
              size="sm"
              style={{ flex: 1 }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <ActionIcon
              color="green"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
            >
              <IconCheck size={16} />
            </ActionIcon>
            <ActionIcon
              color="gray"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={500} size="sm" truncate style={{ flex: 1 }}>
                {recording.name}
              </Text>
              {!recording.isPreset && (
                <ActionIcon
                  color="blue"
                  variant="subtle"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
            </Group>
            {recording.isPreset && (
              <Badge
                size="xs"
                variant="light"
                color="violet"
                leftSection={<IconStar size={12} />}
              >
                Predefinido
              </Badge>
            )}
          </Stack>
        )}

        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed">
            {formatDuration(recording.duration)}
          </Text>

          <Group gap="xs" onClick={(e) => e.stopPropagation()}>
            <ActionIcon
              color={isPlaying ? 'blue' : 'gray'}
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                play();
              }}
            >
              <IconPlayerPlay size={18} />
            </ActionIcon>

            {!recording.isPreset && (
              <>
                <ActionIcon
                  color="blue"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(recording.id);
                  }}
                >
                  <IconDownload size={18} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(recording.id);
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};
