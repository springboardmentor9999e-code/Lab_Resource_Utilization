import { useState, useEffect } from 'react';
import {
  MdBusiness, MdSearch, MdCheckCircle, MdCancel, MdPauseCircleFilled,
  MdPlayCircleFilled, MdInfo, MdAdd, MdRefresh, MdFilterList
} from 'react-icons/md';
import { institutionService } from '../services/services';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function Institutions() {
  const toast = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInst, setSelectedInst] = useState(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await institutionService.getAll();
      setInstitutions(res.data?.data || []);
    } catch {
      toast.showError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await institutionService.updateStatus(id, status);
      toast.showSuccess(`Institution status updated to ${status}`);
      if (selectedInst?.id === id) {
        setSelectedInst(prev => prev ? { ...prev, status } : null);
      }
      fetchInstitutions();
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = institutions.filter(i => {
    const matchesSearch =
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.code?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (i.status || 'APPROVED') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    ALL: institutions.length,
    PENDING: institutions.filter(i => i.status === 'PENDING').length,
    APPROVED: institutions.filter(i => i.status === 'APPROVED' || !i.status).length,
    REJECTED: institutions.filter(i => i.status === 'REJECTED').length,
    SUSPENDED: institutions.filter(i => i.status === 'SUSPENDED').length,
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdBusiness className="text-purple-600 text-3xl" />
            Institution Management & Onboarding
          </h1>
          <p className="page-subtitle">Review, approve, suspend, and manage all platform institutions</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchInstitutions} className="btn-secondary">
            <MdRefresh className="text-lg" /> Refresh
          </button>
          <Link to="/register-institution" className="btn-primary">
            <MdAdd className="text-lg" /> Onboard Institution
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === st
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st} ({counts[st] || 0})
            </button>
          ))}
        </div>

        <div className="search-box max-w-xs w-full">
          <MdSearch className="text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution Name & Code</th>
                <th>Type</th>
                <th>Admin Contact</th>
                <th>Status</th>
                <th>Departments</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">Loading institutions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No institutions found.</td>
                </tr>
              ) : (
                filtered.map(inst => {
                  const st = inst.status || 'APPROVED';
                  return (
                    <tr key={inst.id}>
                      <td>
                        <div className="font-bold text-slate-900">{inst.name}</div>
                        <div className="text-xs text-slate-500 font-semibold">{inst.code ? `Code: ${inst.code}` : inst.address}</div>
                      </td>
                      <td className="text-xs font-bold text-slate-700">{inst.type || 'University'}</td>
                      <td>
                        <div className="text-xs font-bold text-slate-800">{inst.primaryAdminName || 'Admin'}</div>
                        <div className="text-[11px] text-slate-500">{inst.primaryAdminEmail || inst.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          st === 'APPROVED' ? 'badge-confirmed' :
                          st === 'PENDING' ? 'badge-pending' :
                          st === 'REJECTED' ? 'badge-rejected' : 'badge-maintenance'
                        }`}>
                          {st}
                        </span>
                      </td>
                      <td className="text-xs font-bold text-slate-700">{inst.departmentCount || 0} Depts</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInst(inst)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            title="View Details"
                          >
                            <MdInfo className="text-base" />
                          </button>

                          {st === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(inst.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(inst.id, 'REJECTED')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {st === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(inst.id, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm"
                            >
                              Suspend
                            </button>
                          )}

                          {(st === 'SUSPENDED' || st === 'REJECTED') && (
                            <button
                              onClick={() => handleUpdateStatus(inst.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900">{selectedInst.name}</h3>
              <span className={`badge ${
                (selectedInst.status || 'APPROVED') === 'APPROVED' ? 'badge-confirmed' :
                selectedInst.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
              }`}>
                {selectedInst.status || 'APPROVED'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p><strong>Code:</strong> {selectedInst.code || 'N/A'}</p>
              <p><strong>Type:</strong> {selectedInst.type || 'University'}</p>
              <p><strong>Official Email:</strong> {selectedInst.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedInst.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedInst.address || 'N/A'}</p>
              <p><strong>Website:</strong> {selectedInst.website || 'N/A'}</p>
              <p><strong>Primary Admin:</strong> {selectedInst.primaryAdminName} ({selectedInst.primaryAdminEmail})</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setSelectedInst(null)} className="btn-secondary text-xs">
                Close
              </button>
              {selectedInst.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus(selectedInst.id, 'APPROVED')}
                  className="btn-primary text-xs"
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
