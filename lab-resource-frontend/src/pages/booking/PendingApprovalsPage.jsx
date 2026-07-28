import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../api/api';

export default function PendingApprovalsPage() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  const { data: pendingBookings = [], isLoading, error } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async () => {
      const res = await bookingApi.getPendingApprovals();
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }) => bookingApi.approve(id, { remarks: remarks || 'Approved' }),
    onSuccess: () => {
      toast.success('Booking approved');
      queryClient.invalidateQueries(['pendingApprovals']);
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve booking');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }) => bookingApi.reject(id, { remarks: remarks || 'Rejected' }),
    onSuccess: () => {
      toast.success('Booking rejected');
      queryClient.invalidateQueries(['pendingApprovals']);
      queryClient.invalidateQueries(['myBookings']);
      setRejectModal(null);
      setRemarks('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject booking');
    },
  });

  const handleApprove = (id) => {
    if (window.confirm('Approve this booking request?')) {
      approveMutation.mutate({ id });
    }
  };

  const handleReject = (id) => {
    rejectMutation.mutate({ id, remarks });
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
        <p className="text-danger-600">Failed to load pending approvals. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Pending Approvals</h1>
      <p className="text-gray-600 mb-6">Review and approve equipment booking requests</p>

      {pendingBookings.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{booking.equipmentName || 'Unknown Equipment'}</h3>
                    <span className="badge-warning flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Requested by: <span className="font-medium">{booking.userFullName}</span>
                  </p>
                  {booking.userRole && (
                    <p className="text-sm text-gray-600">
                      Role: <span className="font-medium">{booking.userRole.replace(/_/g, ' ')}</span>
                    </p>
                  )}
                  {booking.userInstitutionName && (
                    <p className="text-sm text-gray-600">
                      Institution: <span className="font-medium">{booking.userInstitutionName}</span>
                    </p>
                  )}
                  {booking.userDepartmentName && (
                    <p className="text-sm text-gray-600">
                      Department: <span className="font-medium">{booking.userDepartmentName}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Date: {booking.bookingDate} | Time: {booking.startTime} - {booking.endTime}
                  </p>
                  {booking.purpose && (
                    <p className="text-sm text-gray-500">Purpose: {booking.purpose}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    className="btn-success flex items-center gap-2"
                    disabled={approveMutation.isLoading}
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(booking.id)}
                    className="btn-danger flex items-center gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Booking</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Enter reason for rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRemarks(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModal)}
                className="btn-danger"
                disabled={rejectMutation.isLoading}
              >
                {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
