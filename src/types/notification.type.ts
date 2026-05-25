export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "plant_update" | "task_reminder" | "system";
  isRead: boolean;
  createdAt: string;
}
