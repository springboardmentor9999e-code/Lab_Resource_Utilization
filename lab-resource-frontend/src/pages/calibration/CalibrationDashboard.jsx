import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { maintenanceApi, equipmentApi } from '../../api/api';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertTriangle, Clock, Plus, X, Trash2 } from 'lucide-react';

export default function CalibrationDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    calibrationDate: '',
    nextDueDate: '',
    calibratedBy: '',
    notes: '',
    certificateUrl: '',
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (selectedEquipment) {
      fetchCalibrationRecords(selectedEquipment);
    } else {
      fetchAllRecords();
    }
  }, [selectedEquipment]);

  const fetchEquipment = async () => {
    try {
      const res = await equipmentApi.getAll({ page: 0, size: 100 });
      setEquipmentList(res.data?.content || []);
    } catch (err) {
      toast.error('Failed to load equipment');
    }
  };

  const fetchCalibrationRecords = async (equipId) => {
    setLoading(true);
    try {
      const res = await maintenanceApi.getCalibrationRecords(equipId);
      setRecords(res.data || []);
    } catch (err) {
      toast.error('Failed to load calibration records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const allRecords = [];
      for (const equip of equipmentList) {
        try {
          const res = await maintenanceApi.getCalibrationRecords(equip.id);
          if (res.data) {
            res.data.forEach(r => allRecords.push({ ...r, equipmentName: equip.equipmentName, equipmentCode: equip.equipmentCode }));
          }
        } catch {}
      }
      setRecords(allRecords.sort((a, b) => new Date(b.calibrationDate) - new Date(a.calibrationDate)));
    } catch (err) {
      toast.error('Failed to load calibration records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.createCalibrationRecord({
        equipment: { id: parseInt(formData.equipmentId) },
        calibrationDate: formData.calibrationDate,
        nextDueDate: formData.nextDueDate,
        calibratedBy: formData.calibratedBy,
        notes: formData.notes,
        certificateUrl: formData.certificateUrl,
      });
      toast.success('Calibration record created');
      setShowForm(false);
      setFormData({ equipmentId: '', calibrationDate: '', nextDueDate: '', calibratedBy: '', notes: '', certificateUrl: '' });
      if (selectedEquipment) fetchCalibrationRecords(selectedEquipment);
      else fetchAllRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this calibration record?')) return;
    try {
      await maintenanceApi.deleteCalibrationRecord(id);
      toast.success('Record deleted');
      if (selectedEquipment) fetchCalibrationRecords(selectedEquipment);
      else fetchAllRecords();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const getStatus = (nextDueDate) => {
    if (!nextDueDate) return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100' };
    const due = new Date(nextDueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100' };
    if (daysUntil <= 30) return { label: 'Due Soon', color: 'text-amber-700', bg: 'bg-amber-100' };
    if (daysUntil <= 90) return { label: 'Upcoming', color: 'text-blue-700', bg: 'bg-blue-100' };
    return { label: 'Current', color: 'text-green-700', bg: 'bg-green-100' };
  };

  const stats = {
    total: records.length,
    overdue: records.filter(r => r.nextDueDate && new Date(r.nextDueDate) < new Date()).length,
    dueSoon: records.filter(r => {
      if (!r.nextDueDate) return false;
      const d = new Date(r.nextDueDate);
      const now = new Date();
      const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    }).length,
    current: records.filter(r => {
      if (!r.nextDueDate) return false;
      const d = new Date(r.nextDueDate);
      return d > new Date();
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calibration & Certification</h1>
          <p className="text-gray-500 mt-1">Track equipment calibration records and certification status</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><ShieldCheck size={20} className="text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Records</p><p className="text-xl font-bold">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><ShieldCheck size={20} className="text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Current</p><p className="text-xl font-bold text-green-600">{stats.current}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg"><Clock size={20} className="text-amber-600" /></div>
            <div><p className="text-sm text-gray-500">Due Soon</p><p className="text-xl font-bold text-amber-600">{stats.dueSoon}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Overdue</p><p className="text-xl font-bold text-red-600">{stats.overdue}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Equipment</label>
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="input-field w-full max-w-md"
        >
          <option value="">All Equipment</option>
          {equipmentList.map(eq => (
            <option key={eq.id} value={eq.id}>{eq.equipmentName} ({eq.equipmentCode})</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Calibration Record</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment *</label>
                <select required value={formData.equipmentId} onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })} className="input-field w-full">
                  <option value="">Select equipment</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.equipmentName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Date *</label>
                  <input type="date" required value={formData.calibrationDate} onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date *</label>
                  <input type="date" required value={formData.nextDueDate} onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calibrated By</label>
                <input type="text" value={formData.calibratedBy} onChange={(e) => setFormData({ ...formData, calibratedBy: e.target.value })} className="input-field w-full" placeholder="Technician or lab name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                <input type="url" value={formData.certificateUrl} onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })} className="input-field w-full" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field w-full" rows={3} placeholder="Additional notes..." />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calibration Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calibrated By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No calibration records found</td></tr>
            ) : records.map((record) => {
              const status = getStatus(record.nextDueDate);
              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{record.equipmentName || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{record.equipmentCode || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.calibrationDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.nextDueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.calibratedBy || '—'}</td>
                  <td className="px-4 py-3">
                    {record.certificateUrl ? (
                      <a href={record.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">View</a>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(record.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
