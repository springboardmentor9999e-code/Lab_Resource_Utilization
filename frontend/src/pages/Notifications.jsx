import { useState, useEffect } from 'react';
import { MdNotifications, MdDoneAll, MdCheckCircle, MdInfo, MdWarning, MdError } from 'react-icons/md';
import { notificationService } from '../services/services';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data || []);
    } catch {
      toast.showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.showError('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.showSuccess('All notifications marked as read');
    } catch {
      toast.showError('Failed to mark all notifications as read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdNotifications className="text-purple-600 text-3xl" />
            Notifications Center
          </h1>
          <p className="page-subtitle">Real-time alerts for bookings, maintenance, and inter-institution workflows</p>
        </div>

        <button onClick={handleMarkAllRead} className="btn-secondary">
          <MdDoneAll className="text-lg text-purple-600" /> Mark All as Read
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No notifications found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  !n.isRead ? 'bg-purple-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.type === 'BOOKING_APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    n.type === 'BOOKING_REJECTED' ? 'bg-rose-100 text-rose-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    <MdNotifications className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-slate-600 text-xs mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex-shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
