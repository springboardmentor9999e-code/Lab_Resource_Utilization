import type { AxiosError } from "axios";

/**
 * NOT IMPLEMENTED IN BACKEND.
 * Backend has no /api/notifications endpoint yet.
 * TODO(backend): add NotificationController + Notification entity/service.
 *   Suggested endpoints:
 *     GET  /api/notifications           -> List<NotificationDTO>
 *     GET  /api/notifications/unread    -> List<NotificationDTO>
 *     PUT  /api/notifications/{id}/read
 *     PUT  /api/notifications/read-all
 */

export interface Notification {
  id: string | number;
  title: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
  type?: string;
}

export const listNotifications = async (): Promise<Notification[]> => [];
export const markNotificationRead = async (_id: string | number): Promise<void> => {
  void _id;
};
export const isNotificationsMissing = (_err: AxiosError | unknown): boolean => true;
