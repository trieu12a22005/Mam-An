import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { Notification } from '../types/notification.type';

export const useNotifications = () => {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    staleTime: 60_000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: (_, id) => {
      qc.setQueryData<Notification[]>(['notifications'], (prev = []) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    },
  });

  const { mutateAsync: markAllAsRead } = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      qc.setQueryData<Notification[]>(['notifications'], (prev = []) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    refetch,
    markAsRead,
    markAllAsRead,
  };
};
