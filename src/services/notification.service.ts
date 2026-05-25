import axiosClient from '../api/axiosClient';
import { Notification } from '../types/notification.type';

export const notificationService = {
  /** GET /notifications/my */
  getNotifications: async (): Promise<Notification[]> => {
    const res = await axiosClient.get<{ data: Notification[] }>('/notifications/my');
    return res.data.data;
  },

  /** PATCH /notifications/:id/read */
  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  /** PATCH /notifications/read-all */
  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch('/notifications/read-all');
  },
};
