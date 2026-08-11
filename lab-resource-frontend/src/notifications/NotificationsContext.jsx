import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { notificationsApi } from "../api/notifications";

const NotificationsContext = createContext(null);

// Single shared source of truth for notifications, so the sidebar's unread
// badge (in AppLayout) and the notifications list (in NotificationsPage) -
// two separate components with no parent/child relationship - stay in sync.
// Previously each had its own local state: marking something read on the
// Notifications page updated that page's list but never told AppLayout, so
// the sidebar badge kept showing the old count until its next 3-minute poll.
export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    setError(null);
    return notificationsApi
      .list()
      .then(setNotifications)
      .catch((err) => setError(err.response?.data?.message || "Couldn't load notifications."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
    // Poll periodically so newly generated alerts (from the daily backend
    // job) show up during a long session without a full page reload -
    // marking read/unread itself is handled instantly via local state below,
    // this polling is only for genuinely new notifications arriving.
    const interval = setInterval(load, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  async function markRead(id) {
    const updated = await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.notificationId === updated.notificationId ? updated : n)));
  }

  async function markAllRead() {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, error, reload: load, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}
