import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../notifications/NotificationsContext";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";

const TYPE_STYLE = {
  "Idle Equipment": { dot: "bg-[var(--color-status-booked)]", label: "Idle" },
  "Maintenance Due": { dot: "bg-[var(--color-status-maintenance)]", label: "Maintenance" },
  "Calibration Due": { dot: "bg-[var(--color-status-maintenance)]", label: "Calibration" },
};

export default function NotificationsPage() {
  // Shared with AppLayout's sidebar badge via NotificationsContext - marking
  // read/all-read here updates that badge immediately, rather than each
  // keeping its own separate copy of the list out of sync with the other.
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications();
  const [actionError, setActionError] = useState(null);

  async function handleMarkRead(id) {
    try {
      await markRead(id);
    } catch (err) {
      setActionError(err.response?.data?.message || "Couldn't update this notification.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
    } catch (err) {
      setActionError(err.response?.data?.message || "Couldn't mark all as read.");
    }
  }

  if (loading) return <LoadingState label="Loading notifications…" />;

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Idle equipment, maintenance due, and calibration renewal alerts, generated daily."
        action={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              Mark all as read ({unreadCount})
            </button>
          )
        }
      />

      {(error || actionError) && <ErrorState message={actionError || error} />}

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            title="No notifications"
            description="You'll see alerts here when equipment sits idle for a week, maintenance comes due, or a calibration is about to expire."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-paper-200)]">
            {notifications.map((n) => {
              const style = TYPE_STYLE[n.type] || { dot: "bg-[var(--color-ink-600)]", label: n.type };
              return (
                <li
                  key={n.notificationId}
                  className={`px-5 py-4 flex items-start gap-3 ${n.isRead ? "" : "bg-[var(--color-paper-100)]"}`}
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-600)]">
                        {style.label}
                      </span>
                      <span className="text-xs text-[var(--color-ink-600)]">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-ink-900)] mt-0.5">{n.message}</p>
                    {n.equipment && (
                      <Link
                        to="/equipment"
                        className="text-xs font-medium text-[var(--color-brass-600)] hover:underline"
                      >
                        View equipment →
                      </Link>
                    )}
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.notificationId)}
                      className="text-xs font-medium text-[var(--color-brass-600)] hover:underline shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
