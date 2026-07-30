import { useState, useEffect } from 'react';
import {
  MdSwapHoriz, MdAdd, MdCheckCircle, MdCancel, MdScience, MdBusiness,
  MdFilterList, MdShare
} from 'react-icons/md';
import { equipmentSharingService, equipmentService, institutionService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EquipmentImage from '../components/EquipmentImage';

export default function EquipmentSharing() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('shared');
  const [sharedList, setSharedList] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [targetInstId, setTargetInstId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, inRes, outRes] = await Promise.all([
        equipmentSharingService.getSharedEquipment(),
        equipmentSharingService.getIncoming(),
        equipmentSharingService.getOutgoing()
      ]);
      setSharedList(sRes.data.data || []);
      setIncoming(inRes.data.data || []);
      setOutgoing(outRes.data.data || []);
    } catch {
      toast.showError('Failed to load equipment sharing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    equipmentService.getAll()
      .then(r => setEquipmentList(r.data.data?.content || r.data.data || []))
      .catch(() => setEquipmentList([]));

    institutionService.getApproved()
      .then(r => setInstitutions(r.data.data || []))
      .catch(() => setInstitutions([]));
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedEquipmentId || !targetInstId) {
      toast.showError('Please select equipment and requesting institution');
      return;
    }
    setSubmitting(true);
    try {
      await equipmentSharingService.request({
        equipmentId: selectedEquipmentId,
        requestingInstitutionId: targetInstId,
        notes
      });
      toast.showSuccess('Equipment sharing request submitted successfully');
      setShowModal(false);
      setSelectedEquipmentId('');
      setTargetInstId('');
      setNotes('');
      fetchData();
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Failed to submit equipment sharing request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await equipmentSharingService.updateStatus(id, status);
      toast.showSuccess(`Sharing status updated to ${status}`);
      fetchData();
    } catch {
      toast.showError('Failed to update equipment sharing status');
    }
  };

  const isManagerOrAdmin = user?.roles?.some(r => r === 'SYSTEM_ADMIN' || r === 'INSTITUTION_ADMIN' || r === 'LAB_MANAGER');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdSwapHoriz className="text-purple-600 text-3xl" />
            Inter-Institution Resource Sharing
          </h1>
          <p className="page-subtitle">Share laboratory equipment with external partnered institutions</p>
        </div>

        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <MdAdd className="text-lg" /> Share Equipment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'shared' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Shared Equipment ({sharedList.length})
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'incoming' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Incoming Sharing Requests ({incoming.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'outgoing' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Outgoing Sharing Requests ({outgoing.length})
        </button>
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Owning Institution</th>
                <th>Requesting Institution</th>
                <th>Status</th>
                <th>Date</th>
                {isManagerOrAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">Loading sharing records...</td>
                </tr>
              ) : (
                (activeTab === 'shared' ? sharedList : activeTab === 'incoming' ? incoming : outgoing).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No records found.</td>
                  </tr>
                ) : (
                  (activeTab === 'shared' ? sharedList : activeTab === 'incoming' ? incoming : outgoing).map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                            <EquipmentImage equipment={{ name: s.equipmentName, model: s.equipmentModel }} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{s.equipmentName}</div>
                            <div className="text-xs text-slate-500">{s.equipmentModel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-semibold text-slate-800">{s.owningInstitutionName}</td>
                      <td className="font-semibold text-slate-800">{s.requestingInstitutionName}</td>
                      <td>
                        <span className={`badge ${
                          s.status === 'APPROVED' ? 'badge-confirmed' :
                          s.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      {isManagerOrAdmin && (
                        <td className="text-right">
                          {s.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(s.id, 'APPROVED')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(s.id, 'REJECTED')}
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
                )
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
              <MdShare className="text-purple-600" /> Share Equipment Externally
            </h2>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Equipment *</label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">-- Select Equipment --</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grant External Access to Institution *</label>
                <select
                  value={targetInstId}
                  onChange={(e) => setTargetInstId(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">-- Select Partner Institution --</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Access Conditions / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Specify external usage hours or guidelines..."
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
                  {submitting ? 'Sharing...' : 'Share Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
