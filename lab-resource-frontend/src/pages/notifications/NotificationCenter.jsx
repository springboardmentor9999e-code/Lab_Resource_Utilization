import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../api/api';

const typeConfig = {
  'BOOKING_CREATED': { color: 'bg-blue-100 text-blue-600' },
  'BOOKING_APPROVED': { color: 'bg-green-100 text-green-600' },
  'BOOKING_REJECTED': { color: 'bg-red-100 text-red-600' },
  'BOOKING_CANCELLED': { color: 'bg-orange-100 text-orange-600' },
  'BOOKING_REMINDER': { color: 'bg-yellow-100 text-yellow-600' },
  'MAINTENANCE_SCHEDULED': { color: 'bg-purple-100 text-purple-600' },
  'MAINTENANCE_COMPLETED': { color: 'bg-green-100 text-green-600' },
  'CALIBRATION_DUE': { color: 'bg-yellow-100 text-yellow-600' },
  'EQUIPMENT_AVAILABLE': { color: 'bg-green-100 text-green-600' },
  'WAITLIST_PROMOTED': { color: 'bg-blue-100 text-blue-600' },
  'ANNOUNCEMENT': { color: 'bg-indigo-100 text-indigo-600' },
  'GENERAL': { color: 'bg-gray-100 text-gray-600' },
};

export default function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.getAll();
      return res.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={markAllReadMutation.isLoading}
          >
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const typeStyle = typeConfig[notif.notificationType] || typeConfig['GENERAL'];
            return (
              <div
                key={notif.id}
                className={`card flex items-start gap-4 ${notif.status === 'UNREAD' ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className={`p-2 rounded-lg ${notif.status === 'UNREAD' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Bell size={18} className={notif.status === 'UNREAD' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${notif.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle.color}`}>
                      {notif.notificationType?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatTime(notif.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {notif.status === 'UNREAD' && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notif.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Mark as read"
                    >
                      <Check size={16} className="text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this notification?')) {
                        deleteMutation.mutate(notif.id);
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
