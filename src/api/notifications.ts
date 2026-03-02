import { api } from "./client";

export type AppNotification = {
  id: number;
  recipient_email: string;
  recipient_role: string;
  request_id: number;
  type: string;
  title: string;
  message: string;
  triggered_by_email: string;
  triggered_by_name: string;
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUserNotifications(userEmail: string) {
  const { data } = await api.get(`/api/notifications/user/${encodeURIComponent(userEmail)}`);
  return data as AppNotification[];
}

export async function getUnreadCount(userEmail: string) {
  const { data } = await api.get(`/api/notifications/user/${encodeURIComponent(userEmail)}/unread`);
  return Number(data?.unread_count ?? 0);
}

export async function markNotificationAsRead(notificationId: number) {
  await api.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(userEmail: string) {
  await api.patch(`/api/notifications/user/${encodeURIComponent(userEmail)}/read-all`);
}
