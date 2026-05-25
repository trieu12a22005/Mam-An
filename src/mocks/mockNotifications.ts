import { Notification } from '../types/notification.type';

export const mockNotifications: Notification[] = [
  {
    id: 'n_1',
    title: 'Cây của bạn đã lớn thêm chút!',
    body: 'Nhà vườn vừa cập nhật hình ảnh mới cho Sunny.',
    type: 'plant_update',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n_2',
    title: 'Nhắc nhở uống nước',
    body: 'Đã đến giờ uống nước rồi, vào làm nhiệm vụ để nhận tài nguyên nhé!',
    type: 'task_reminder',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
