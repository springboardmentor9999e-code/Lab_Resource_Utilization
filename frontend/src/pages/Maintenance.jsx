import { useState, useEffect } from 'react';
import { MdBuild, MdWarning, MdCheckCircle, MdSearch, MdExpandMore, MdAdd, MdHistory, MdList, MdAccessTime, MdPerson, MdCurrencyRupee, MdNotes } from 'react-icons/md';
import { equipmentService, maintenanceService, userService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import EquipmentImage from '../components/EquipmentImage';

const STATUS_STYLE = {
  AVAILABLE:        'text-emerald-800 bg-emerald-100 border-emerald-300',
  UNDER_MAINTENANCE:'text-orange-800 bg-orange-100 border-orange-300',
  BOOKED:           'text-amber-800 bg-amber-100 border-amber-300',
  RETIRED:          'text-rose-800 bg-rose-100 border-rose-300',
};

const RECORD_STATUS_STYLE = {
  SCHEDULED:        'text-blue-800 bg-blue-100 border-blue-300',
  IN_PROGRESS:      'text-amber-800 bg-amber-100 border-amber-300',
  COMPLETED:        'text-emerald-800 bg-emerald-100 border-emerald-300',
  CANCELLED:        'text-slate-700 bg-slate-200 border-slate-300',
  OVERDUE:          'text-red-800 bg-red-100 border-red-300',
};

export default function Maintenance() {
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history', 'catalog'
  const [equipment, setEquipment] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Selected records for modals
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form states
  const [initiateForm, setInitiateForm] = useState({
    type: 'Routine Maintenance',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    technicianId: '',
    cost: 0.0
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'IN_PROGRESS',
    notes: ''
  });

  const [completeForm, setCompleteForm] = useState({
    notes: 'Completed successfully.'
  });

  const isLabTech = currentUser?.roles?.includes('LAB_TECHNICIAN');
  const isLabManager = currentUser?.roles?.includes('LAB_MANAGER');
  const isSysAdmin = currentUser?.roles?.includes('SYSTEM_ADMIN');
  const isInstAdmin = currentUser?.roles?.includes('INSTITUTION_ADMIN');
  
  const canManage = isSysAdmin || isInstAdmin || isLabManager;
  const canInitiate = isSysAdmin || isInstAdmin || isLabManager || isLabTech;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);

    // Load Equipment independently
    try {
      const eqParams = statusFilter ? { status: statusFilter } : {};
      const eqRes = await equipmentService.getAll(eqParams);
      setEquipment(eqRes.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    }

    // Load Maintenance Records independently
    try {
      const maintRes = await maintenanceService.getAll();
      setMaintenanceRecords(maintRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
      showToast('Failed to load maintenance data', 'error');
    }

    // Load Users independently (optional for technician selector)
    try {
      const usersRes = await userService.getAll();
      setUsers(usersRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleInitiateMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      const payload = {
        equipmentId: selectedEquipment.id,
        type: initiateForm.type,
        description: initiateForm.description,
        startDate: initiateForm.startDate,
        scheduledDate: initiateForm.scheduledDate || null,
        technicianId: initiateForm.technicianId || null,
        cost: initiateForm.cost
      };

      await maintenanceService.create(payload);
      showToast('Maintenance initiated successfully', 'success');
      setShowInitiateModal(false);
      // Reset form
      setInitiateForm({
        type: 'Routine Maintenance',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        scheduledDate: '',
        technicianId: '',
        cost: 0.0
      });
      loadData();
    } catch (err) {
      showToast('Failed to initiate maintenance', 'error');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await maintenanceService.updateStatus(selectedRecord.id, updateForm.status, updateForm.notes);
      showToast('Maintenance status updated', 'success');
      setShowUpdateModal(false);
      setUpdateForm({ status: 'IN_PROGRESS', notes: '' });
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleCompleteMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await maintenanceService.complete(selectedRecord.id, completeForm.notes);
      showToast('Maintenance marked as completed', 'success');
      setShowCompleteModal(false);
      setCompleteForm({ notes: 'Completed successfully.' });
      loadData();
    } catch (err) {
      showToast('Failed to complete maintenance', 'error');
    }
  };

  const activeRecords = maintenanceRecords.filter(
    r => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS' || r.status === 'OVERDUE'
  );

  const historyRecords = maintenanceRecords.filter(
    r => r.status === 'COMPLETED' || r.status === 'CANCELLED'
  );

  const filteredCatalog = equipment.filter(e => {
    if (!search) return true;
    return `${e.name} ${e.manufacturer} ${e.model}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-800 bg-red-50' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 bg-emerald-50'}`}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title text-slate-900 font-extrabold">Equipment Maintenance</h1>
          <p className="page-subtitle text-slate-600">Initiate requests, track status updates, and view history logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2
            ${activeTab === 'active' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MdAccessTime className="text-lg" />
          Active Tracking ({activeRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2
            ${activeTab === 'history' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MdHistory className="text-lg" />
          Maintenance History ({historyRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2
            ${activeTab === 'catalog' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MdList className="text-lg" />
          Equipment Inventory ({equipment.length})
        </button>
      </div>

      {/* Content for Tab 1: Active Maintenance */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : activeRecords.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <MdBuild className="text-slate-400 text-5xl mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No active maintenance work orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRecords.map(r => (
                <div key={r.id} className="card space-y-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 font-bold truncate text-base">{r.equipmentName}</h4>
                      <p className="text-purple-600 text-xs mt-0.5 font-semibold">{r.type}</p>
                      <p className="text-slate-600 text-sm mt-2">{r.description || 'No description provided.'}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border ${RECORD_STATUS_STYLE[r.status] || 'badge'}`}>
                      {r.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3 text-slate-500">
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned Tech:</span>
                      <span className="font-bold text-slate-700">{users.find(u => u.id === r.technicianId) ? `${users.find(u => u.id === r.technicianId).firstName} ${users.find(u => u.id === r.technicianId).lastName}` : 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Initiated Date:</span>
                      <span className="font-bold text-slate-700">{r.startDate || '—'}</span>
                    </div>
                    {r.scheduledDate && (
                      <div>
                        <span className="text-slate-400 block font-medium">Target Completion:</span>
                        <span className="font-bold text-slate-700">{r.scheduledDate}</span>
                      </div>
                    )}
                    {r.cost > 0 && (
                      <div>
                        <span className="text-slate-400 block font-medium">Estimated Cost:</span>
                        <span className="font-bold text-emerald-600">₹{r.cost}</span>
                      </div>
                    )}
                  </div>

                  {r.notes && (
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <span className="font-bold text-purple-700 block mb-1">Latest Update:</span>
                      {r.notes}
                    </div>
                  )}

                  {canManage && (
                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setUpdateForm({ status: r.status, notes: r.notes || '' });
                          setShowUpdateModal(true);
                        }}
                        className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Update Progress
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setShowCompleteModal(true);
                        }}
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Complete Maintenance
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content for Tab 2: Maintenance History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <MdHistory className="text-slate-400 text-5xl mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No maintenance history records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto card p-0 border border-slate-200 bg-white shadow-sm rounded-2xl">
              <table className="data-table border-0 w-full text-slate-800">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="p-4">Equipment</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Completed Date</th>
                    <th className="p-4">Cost</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Logs / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {historyRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-4 font-bold text-slate-900">{r.equipmentName}</td>
                      <td className="p-4 text-purple-700 font-medium">{r.type}</td>
                      <td className="p-4 text-slate-700">{users.find(u => u.id === r.technicianId) ? `${users.find(u => u.id === r.technicianId).firstName} ${users.find(u => u.id === r.technicianId).lastName}` : '—'}</td>
                      <td className="p-4 text-slate-500">{r.startDate || '—'}</td>
                      <td className="p-4 text-slate-500">{r.completedDate || '—'}</td>
                      <td className="p-4 font-semibold text-emerald-600">₹{r.cost || '0.00'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${RECORD_STATUS_STYLE[r.status] || 'badge'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 max-w-xs truncate">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Content for Tab 3: Equipment Inventory */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-60">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search equipment..."
                className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="form-input w-44 py-2.5">
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="BOOKED">Booked</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <MdBuild className="text-slate-400 text-5xl mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No equipment found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map(e => (
                <div key={e.id} className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                      <EquipmentImage equipment={e} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 font-bold truncate">{e.name}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{e.manufacturer} · {e.model}</p>
                      {e.location && <p className="text-slate-400 text-xs mt-0.5">📍 {e.location}</p>}
                      {e.departmentName && <p className="text-slate-400 text-xs">Dept: {e.departmentName}</p>}
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLE[e.status] || STATUS_STYLE.AVAILABLE}`}>
                      {e.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {canInitiate && e.status !== 'UNDER_MAINTENANCE' && e.status !== 'RETIRED' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEquipment(e);
                          setShowInitiateModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all w-full justify-center"
                      >
                        <MdBuild className="text-sm" /> Initiate Maintenance
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Initiate Maintenance */}
      {showInitiateModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-scale-in text-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MdBuild className="text-purple-600" /> Initiate Maintenance
              </h3>
              <button onClick={() => setShowInitiateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-sm text-slate-500">
              Marking <strong className="text-slate-900">{selectedEquipment.name}</strong> under active maintenance.
            </p>

            <form onSubmit={handleInitiateMaintenance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Maintenance Type *</label>
                  <input
                    type="text"
                    required
                    value={initiateForm.type}
                    onChange={e => setInitiateForm({ ...initiateForm, type: e.target.value })}
                    className="form-input py-2"
                  />
                </div>
                <div>
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={initiateForm.startDate}
                    onChange={e => setInitiateForm({ ...initiateForm, startDate: e.target.value })}
                    className="form-input py-2"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Assign Technician (Optional)</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={initiateForm.technicianId}
                    onChange={e => setInitiateForm({ ...initiateForm, technicianId: e.target.value })}
                    className="form-input pl-9 pr-3 py-2 cursor-pointer"
                  >
                    <option value="">-- Choose Technician --</option>
                    {users
                      .filter(u => u.roles?.includes('LAB_TECHNICIAN') || u.roles?.includes('LAB_MANAGER'))
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.roles?.[0]})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Scheduled End Date</label>
                  <input
                    type="date"
                    value={initiateForm.scheduledDate}
                    onChange={e => setInitiateForm({ ...initiateForm, scheduledDate: e.target.value })}
                    className="form-input py-2"
                  />
                </div>
                <div>
                  <label className="form-label">Estimated Cost (₹)</label>
                  <div className="relative">
                    <MdCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={initiateForm.cost}
                      onChange={e => setInitiateForm({ ...initiateForm, cost: parseFloat(e.target.value) || 0 })}
                      className="form-input pl-8 pr-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Issue Description *</label>
                <div className="relative">
                  <MdNotes className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details about the issue or routine work..."
                    value={initiateForm.description}
                    onChange={e => setInitiateForm({ ...initiateForm, description: e.target.value })}
                    className="form-input pl-9 pr-3 py-2.5 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10"
                >
                  Confirm Initiation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Progress Status */}
      {showUpdateModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Update Maintenance Status
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-sm text-slate-500">
              Update logs and progress for <strong className="text-slate-900">{selectedRecord.equipmentName}</strong>.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="form-label">Status *</label>
                <select
                  value={updateForm.status}
                  onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="form-input px-3 py-2 cursor-pointer"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled / Aborted</option>
                </select>
              </div>

              <div>
                <label className="form-label">Progress Details / Notes *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe progress updates or notes..."
                  value={updateForm.notes}
                  onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  className="form-input px-3 py-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Complete Maintenance */}
      {showCompleteModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Complete Maintenance Work Order
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-sm text-slate-500">
              This will return <strong className="text-slate-900">{selectedRecord.equipmentName}</strong> to <span className="text-emerald-600 font-bold">AVAILABLE</span> status.
            </p>

            <form onSubmit={handleCompleteMaintenance} className="space-y-4">
              <div>
                <label className="form-label">Final Service Notes / Resolution *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record final resolution notes..."
                  value={completeForm.notes}
                  onChange={e => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  className="form-input px-3 py-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
