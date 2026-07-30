import { useState, useEffect } from 'react';
import {
  MdSwapHoriz, MdCheckCircle, MdCancel, MdPending,
  MdExpandMore, MdSend, MdHistory, MdAdminPanelSettings
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { roleRequestService } from '../services/services';

const ROLES = [
  { value: 'LAB_TECHNICIAN',  label: 'Lab Technician' },
  { value: 'LAB_MANAGER',     label: 'Lab Manager' },
  { value: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
];

const STATUS_STYLE = {
  PENDING:  'text-amber-600 bg-amber-50 border-amber-250/60',
  APPROVED: 'text-emerald-600 bg-emerald-50 border-emerald-250/60',
  REJECTED: 'text-rose-600 bg-rose-50 border-rose-250/60',
};

const STATUS_ICON = {
  PENDING:  MdPending,
  APPROVED: MdCheckCircle,
  REJECTED: MdCancel,
};

function Badge({ status }) {
  const cls = STATUS_STYLE[status] || STATUS_STYLE.PENDING;
  const Icon = STATUS_ICON[status] || MdPending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cls}`}>
      <Icon className="text-sm" /> {status}
    </span>
  );
}

function RequestCard({ req, isAdmin, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="bg-white border border-slate-100/95 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-slate-800 font-bold text-sm">
              {isAdmin ? `${req.userFirstName} ${req.userLastName}` : `Request #${req.id?.slice(0, 8)}`}
            </h4>
            <Badge status={req.status} />
          </div>
          {isAdmin && <p className="text-slate-500 text-xs mt-0.5">{req.userEmail}</p>}
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-slate-550 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 font-medium">
              {req.currentRole?.replace(/_/g, ' ')}
            </span>
            <MdSwapHoriz className="text-purple-500 text-lg flex-shrink-0" />
            <span className="text-purple-700 px-2.5 py-1 bg-purple-50/70 rounded-lg border border-purple-100 font-bold">
              {req.requestedRole?.replace(/_/g, ' ')}
            </span>
          </div>
          {req.reason && (
            <p className="text-slate-650 text-sm mt-3 bg-slate-50/50 rounded-xl px-3.5 py-2.5 border border-slate-100/60">
              "{req.reason}"
            </p>
          )}
          <div className="flex items-center gap-3 mt-3.5 text-xs text-slate-400 border-t border-slate-50 pt-3">
            <span>Submitted: {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '-'}</span>
            {req.reviewedAt && <span>Reviewed: {new Date(req.reviewedAt).toLocaleDateString()}</span>}
            {req.reviewedByEmail && <span>By: {req.reviewedByEmail}</span>}
          </div>
        </div>
      </div>

      {isAdmin && req.status === 'PENDING' && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onApprove(req.id)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250/50 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <MdCheckCircle className="text-base" /> Approve
          </button>
          {!showReject ? (
            <button
              onClick={() => setShowReject(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250/50 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              <MdCancel className="text-base" /> Reject
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="flex-1 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10"
              />
              <button
                onClick={() => { onReject(req.id, rejectReason); setShowReject(false); }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Confirm
              </button>
              <button onClick={() => setShowReject(false)} className="text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoleRequests() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('SYSTEM_ADMIN');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my');
  const [toast, setToast] = useState(null);

  // Submit form state
  const [form, setForm] = useState({ requestedRole: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRequests = () => {
    setLoading(true);
    const fn = isAdmin && activeTab === 'all' ? roleRequestService.getAll : roleRequestService.getMy;
    fn()
      .then(r => setRequests(r.data?.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.requestedRole || !form.reason.trim()) return;
    setSubmitting(true);
    try {
      await roleRequestService.submit({ requestedRole: form.requestedRole, reason: form.reason });
      setForm({ requestedRole: '', reason: '' });
      showToast('Role request submitted successfully!');
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await roleRequestService.approve(id);
      showToast('Request approved — user role updated!');
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await roleRequestService.reject(id, reason);
      showToast('Request rejected.');
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  const filteredRequests = activeTab === 'pending'
    ? requests.filter(r => r.status === 'PENDING')
    : activeTab === 'reviewed'
    ? requests.filter(r => r.status !== 'PENDING')
    : requests;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in
          ${toast.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Role Requests</h1>
        <p className="text-slate-550 text-sm mt-1">
          {isAdmin ? 'Review and manage role upgrade requests' : 'Request a role change for additional capabilities'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submit form (non-admins) or Stats (admins) */}
        <div className="lg:col-span-1 space-y-4">
          {!isAdmin && (
            <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
              <h3 className="text-slate-800 font-bold text-base mb-4 flex items-center gap-2">
                <MdSwapHoriz className="text-purple-600 text-xl" />
                Request Role Upgrade
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Requested Role</label>
                  <div className="relative">
                    <MdAdminPanelSettings className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none z-10" />
                    <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none z-10" />
                    <select
                      value={form.requestedRole}
                      onChange={e => setForm(p => ({ ...p, requestedRole: e.target.value }))}
                      required
                      className="form-input pl-10 pr-9 cursor-pointer appearance-none"
                    >
                      <option value="">Select Role</option>
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Reason</label>
                  <textarea
                    value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Explain why you need this role..."
                    rows={4} required
                    className="form-input resize-none"
                  />
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSend className="text-base" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          )}

          {/* Current role info */}
          <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
            <h4 className="text-slate-850 text-sm font-bold mb-3">Your Current Role</h4>
            <div className="flex items-center gap-3 p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
              <MdAdminPanelSettings className="text-purple-600 text-2xl" />
              <div>
                <p className="text-slate-800 font-bold text-sm">
                  {user?.roles?.[0]?.replace(/_/g, ' ') || 'Researcher'}
                </p>
                <p className="text-slate-500 text-xs">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Requests list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100/60 border border-slate-200/40 rounded-xl p-1 w-fit">
            {isAdmin && (
              <button onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15' : 'text-slate-550 hover:text-slate-850'}`}>
                All Requests
              </button>
            )}
            <button onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15' : 'text-slate-550 hover:text-slate-850'}`}>
              Pending
            </button>
            <button onClick={() => setActiveTab('reviewed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reviewed' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15' : 'text-slate-550 hover:text-slate-850'}`}>
              <span className="flex items-center gap-1.5"><MdHistory className="text-sm" /> History</span>
            </button>
            {!isAdmin && (
              <button onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15' : 'text-slate-550 hover:text-slate-850'}`}>
                My Requests
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-100/60 rounded-2xl border border-slate-200/40 animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100/90 rounded-2xl shadow-sm">
              <MdSwapHoriz className="text-slate-300 text-5xl mx-auto mb-3" />
              <p className="text-slate-700 font-semibold">No requests found</p>
              <p className="text-slate-450 text-sm mt-1">
                {activeTab === 'pending' ? 'No pending role requests' : 'No request history yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => (
                <RequestCard
                  key={req.id} req={req} isAdmin={isAdmin}
                  onApprove={handleApprove} onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
