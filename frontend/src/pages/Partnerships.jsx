import { useState, useEffect } from 'react';
import {
  MdHandshake, MdAdd, MdCheckCircle, MdCancel, MdSearch, MdBusiness,
  MdRefresh, MdCheck, MdClose
} from 'react-icons/md';
import { partnershipService, institutionService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Partnerships() {
  const { user } = useAuth();
  const toast = useToast();

  const [partnerships, setPartnerships] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [targetInstId, setTargetInstId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const res = await partnershipService.getAll();
      setPartnerships(res.data.data || []);
    } catch {
      toast.showError('Failed to load partnerships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
    institutionService.getApproved()
      .then(r => setInstitutions(r.data.data || []))
      .catch(() => setInstitutions([]));
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!targetInstId) {
      toast.showError('Please select a target institution');
      return;
    }
    setSubmitting(true);
    try {
      await partnershipService.request(targetInstId, notes);
      toast.showSuccess('Partnership request sent successfully');
      setShowModal(false);
      setTargetInstId('');
      setNotes('');
      fetchPartnerships();
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Failed to send partnership request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await partnershipService.updateStatus(id, status);
      toast.showSuccess(`Partnership status set to ${status}`);
      fetchPartnerships();
    } catch {
      toast.showError('Failed to update partnership status');
    }
  };

  const isSystemOrInstAdmin = user?.roles?.some(r => r === 'SYSTEM_ADMIN' || r === 'INSTITUTION_ADMIN');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdHandshake className="text-purple-600 text-3xl" />
            Inter-Institution Partnerships
          </h1>
          <p className="page-subtitle">Establish official lab sharing agreements with partner institutions</p>
        </div>

        {isSystemOrInstAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <MdAdd className="text-lg" /> Send Partnership Request
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requesting Institution</th>
                <th>Target Institution</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Date</th>
                {isSystemOrInstAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">Loading partnerships...</td>
                </tr>
              ) : partnerships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No partnerships found.</td>
                </tr>
              ) : (
                partnerships.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-slate-900">{p.requesterInstitutionName}</td>
                    <td className="font-bold text-slate-900">{p.targetInstitutionName}</td>
                    <td>
                      <span className={`badge ${
                        p.status === 'ACTIVE' ? 'badge-confirmed' :
                        p.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-slate-600 text-xs">{p.notes || '—'}</td>
                    <td className="text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    {isSystemOrInstAdmin && (
                      <td className="text-right">
                        {p.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'ACTIVE')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scale-in">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MdHandshake className="text-purple-600" /> Send Partnership Request
            </h2>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Target Institution *</label>
                <select
                  value={targetInstId}
                  onChange={(e) => setTargetInstId(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">-- Select Institution --</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Proposal Details</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe purpose of equipment sharing agreement..."
                  className="form-input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
