import { useState, useEffect, useCallback } from 'react';
import { MdAdd, MdSearch, MdFilterAlt, MdCalendarToday, MdInfo } from 'react-icons/md';
import { bookingService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookingModal from '../components/BookingModal';
import EquipmentImage from '../components/EquipmentImage';

const TABS = ['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'];

const STATUS_MAP = {
  'Upcoming': 'PENDING',
  'Active': 'IN_USE',
  'Completed': 'COMPLETED',
  'Cancelled': 'CANCELLED',
};

const StatusBadge = ({ status }) => {
  const classes = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    IN_USE: 'badge-in_use', COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled', REJECTED: 'badge-rejected',
    NO_SHOW: 'badge-no_show',
  };
  return (
    <span className={`badge ${classes[status] || 'badge-pending'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default function Bookings() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);

  const isSysAdmin = hasRole('SYSTEM_ADMIN');
  const isInstAdmin = hasRole('INSTITUTION_ADMIN');
  const isLabManager = hasRole('LAB_MANAGER');
  const isLabTech = hasRole('LAB_TECHNICIAN');
  const isResearcher = hasRole('RESEARCHER');

  const canApproveOrReject = isSysAdmin || isInstAdmin || isLabManager || isLabTech;
  const canMarkStatus = isSysAdmin || isLabManager || isLabTech;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (activeTab !== 'All' && STATUS_MAP[activeTab]) {
        params.status = STATUS_MAP[activeTab];
      }
      
      // Researchers only view their own bookings, backend enforces this securely,
      // but frontend passes user ID for consistency
      if (isResearcher) {
        params.userId = user?.id;
      }

      const res = await bookingService.getAll(params);
      const data = res.data.data;
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, isResearcher, user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id);
      toast('Booking approved successfully', 'success');
      fetchBookings();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve booking', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter rejection reason (optional):');
    if (reason !== null) {
      try {
        await bookingService.reject(id, reason);
        toast('Booking rejected', 'info');
        fetchBookings();
      } catch (err) {
        toast(err.response?.data?.message || 'Failed to reject booking', 'error');
      }
    }
  };

  const handleCancel = async (id) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancel(id);
        toast('Booking cancelled successfully', 'info');
        fetchBookings();
      } catch (err) {
        toast(err.response?.data?.message || 'Failed to cancel booking', 'error');
      }
    }
  };

  const handleMarkInUse = async (id) => {
    try {
      await bookingService.markInUse(id);
      toast('Booking is now active (In Use)', 'success');
      fetchBookings();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to mark booking in use', 'error');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await bookingService.markComplete(id);
      toast('Booking completed successfully', 'success');
      fetchBookings();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to complete booking', 'error');
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
    b.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
    b.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Manage all lab bookings and requests.</p>
        </div>
        {isResearcher && (
          <button className="btn-primary" onClick={() => setShowNewModal(true)}>
            <MdAdd className="text-lg" /> New Booking
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-slate-100 px-4 pt-3 bg-slate-50/30">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
          <div className="search-box flex-1 max-w-sm">
            <MdSearch className="text-slate-400 text-lg flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
            />
          </div>
          <button className="btn-ghost">
            <MdFilterAlt className="text-lg" /> Filter
          </button>
          <button className="btn-ghost">
            <MdCalendarToday className="text-lg" /> Calendar
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-4 w-28 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center">
              <MdCalendarToday className="text-4xl text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400">No bookings found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Equipment / Lab</th>
                  <th>Researcher</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="group">
                    <td className="font-mono text-xs text-slate-500">{b.bookingReference}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                          <EquipmentImage equipment={{ name: b.equipmentName, categoryName: b.categoryName }} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-850 text-sm">{b.equipmentName}</div>
                          <div className="text-xs text-slate-450">{b.categoryName} · {b.equipmentLocation}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-slate-800">{b.userName}</div>
                      <div className="text-xs text-slate-400">{b.userEmail}</div>
                    </td>
                    <td className="text-xs text-slate-500 font-medium">
                      {b.startTime ? new Date(b.startTime).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                    <td className="text-sm text-slate-600 max-w-[200px] truncate">{b.purpose || '—'}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve/Reject for PENDING or overrides for admins */}
                        {b.status === 'PENDING' && canApproveOrReject && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-lg font-semibold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Admin Overrides for already approved/rejected bookings */}
                        {(isSysAdmin || isInstAdmin) && b.status === 'REJECTED' && (
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-lg font-semibold transition-colors"
                          >
                            Override Approve
                          </button>
                        )}
                        {(isSysAdmin || isInstAdmin) && b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleReject(b.id)}
                            className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg font-semibold transition-colors"
                          >
                            Override Reject
                          </button>
                        )}

                        {/* Mark booking status in use */}
                        {b.status === 'CONFIRMED' && canMarkStatus && (
                          <button
                            onClick={() => handleMarkInUse(b.id)}
                            className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg font-semibold transition-colors"
                          >
                            Mark In Use
                          </button>
                        )}

                        {/* Mark booking completed */}
                        {b.status === 'IN_USE' && canMarkStatus && (
                          <button
                            onClick={() => handleMarkComplete(b.id)}
                            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {/* Cancel booking */}
                        {['PENDING', 'CONFIRMED'].includes(b.status) && (isSysAdmin || isInstAdmin || b.userEmail === user?.email) && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 rounded-lg font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500 bg-slate-50/20">
            <span>Showing {page * 10 + 1} to {Math.min((page + 1) * 10, totalElements)} of {totalElements} bookings</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    page === i ? 'bg-purple-600 text-white shadow-sm' : 'border border-slate-200 hover:bg-slate-50'
                  }`}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >›</button>
            </div>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={fetchBookings}
      />
    </div>
  );
}
