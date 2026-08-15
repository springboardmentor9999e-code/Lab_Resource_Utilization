import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, CheckSquare, Download, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi, reportApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import useConfirm from '../../hooks/useConfirm';

const statusConfig = {
  'DRAFT': { color: 'badge-info', icon: Clock, label: 'Draft' },
  'PENDING_APPROVAL': { color: 'badge-warning', icon: Clock, label: 'Pending Approval' },
  'APPROVED': { color: 'badge-success', icon: CheckCircle, label: 'Approved' },
  'REJECTED': { color: 'badge-danger', icon: XCircle, label: 'Rejected' },
  'CONFIRMED': { color: 'badge-success', icon: CheckCircle, label: 'Confirmed' },
  'IN_USE': { color: 'badge-info', icon: Clock, label: 'In Use' },
  'COMPLETED': { color: 'badge-info', icon: CheckCircle, label: 'Completed' },
  'CANCELLED': { color: 'badge-danger', icon: XCircle, label: 'Cancelled' },
  'EXPIRED': { color: 'badge-danger', icon: AlertTriangle, label: 'Expired' },
  'NO_SHOW': { color: 'badge-danger', icon: XCircle, label: 'No Show' },
};

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await bookingApi.getMyBookings();
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingApi.cancel(id),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => bookingApi.complete(id),
    onSuccess: () => {
      toast.success('Booking completed! Invoice generated.');
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    },
  });

  const startUsageMutation = useMutation({
    mutationFn: (id) => bookingApi.startUsage(id),
    onSuccess: () => {
      toast.success('Usage started');
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start usage');
    },
  });

  const endUsageMutation = useMutation({
    mutationFn: (id) => bookingApi.endUsage(id),
    onSuccess: () => {
      toast.success('Usage ended! Invoice generated.');
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to end usage');
    },
  });

  const handleExportExcel = async () => {
    try {
      const res = await reportApi.generate({ reportType: 'BOOKING_HISTORY', format: 'EXCEL' });
      const reportId = res.data?.id;
      if (reportId) {
        const downloadRes = await reportApi.download(reportId);
        const url = URL.createObjectURL(new Blob([downloadRes.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.fileName || 'booking_history.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Booking history exported');
      }
    } catch (err) {
      toast.error('Failed to export bookings');
    }
  };

  const { confirm, confirmModal } = useConfirm();

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Yes, Cancel Booking',
      variant: 'danger',
    });
    if (ok) cancelMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-danger-600">Failed to load bookings. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        {bookings.length > 0 && (
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export Excel
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig['DRAFT'];
            const Icon = config.icon;
            return (
              <div key={booking.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.equipmentName || 'Unknown Equipment'}</p>
                      <p className="text-sm text-gray-500">
                        {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                      </p>
                      {booking.purpose && (
                        <p className="text-sm text-gray-500">Purpose: {booking.purpose}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={config.color}>{config.label}</span>
                    {(isManager && (booking.status === 'APPROVED' || booking.status === 'CONFIRMED')) && (
                      <button
                        onClick={() => startUsageMutation.mutate(booking.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        disabled={startUsageMutation.isLoading}
                      >
                        <Play size={14} /> Start Usage
                      </button>
                    )}
                    {(isManager && booking.status === 'IN_USE') && (
                      <button
                        onClick={() => endUsageMutation.mutate(booking.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        disabled={endUsageMutation.isLoading}
                      >
                        <Square size={14} /> End Usage
                      </button>
                    )}
                    {(isManager && (booking.status === 'APPROVED' || booking.status === 'CONFIRMED' || booking.status === 'IN_USE')) && (
                      <button
                        onClick={() => completeMutation.mutate(booking.id)}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                        disabled={completeMutation.isLoading}
                      >
                        <CheckSquare size={14} /> Complete
                      </button>
                    )}
                    {(booking.status === 'PENDING_APPROVAL' || booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                        disabled={cancelMutation.isLoading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {confirmModal}
    </div>
  );
}
