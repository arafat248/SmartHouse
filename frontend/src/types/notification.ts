export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
}

export interface NotificationInput {
  user: number;
  title: string;
  message: string;
  notification_type?: string;
}
