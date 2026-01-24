import { notifications } from '@mantine/notifications';

export function showErrorToast(message: string): void {
  notifications.show({
    title: 'Error',
    message,
    color: 'red',
  });
}

export function showSuccessToast(message: string): void {
  notifications.show({
    title: 'Éxito',
    message,
    color: 'green',
  });
}
