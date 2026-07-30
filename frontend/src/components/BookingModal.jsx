import { useState, useEffect } from 'react';
import { MdClose, MdScience, MdEventNote, MdAccessTime, MdInfo } from 'react-icons/md';
import { bookingService, equipmentService } from '../services/services';
import { useToast } from '../context/ToastContext';

export default function BookingModal({ isOpen, onClose, equipmentId = '', equipmentName = '', onSuccess }) {
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    equipmentId: equipmentId,
    startTime: '',
    endTime: '',
    purpose: '',
    notes: '',
  });
  
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync pre-selected equipment
  useEffect(() => {
    setForm((prev) => ({ ...prev, equipmentId }));
  }, [equipmentId]);

  // Load available equipment list if not pre-selected
  useEffect(() => {
    if (isOpen && !equipmentId) {
      setLoadingList(true);
      equipmentService.getAll({ status: 'AVAILABLE', size: 100 })
        .then((res) => {
          setEquipmentList(res.data?.data?.content || []);
        })
        .catch(() => {
          toast('Failed to load available equipment', 'error');
        })
        .finally(() => {
          setLoadingList(false);
        });
    }
  }, [isOpen, equipmentId, toast]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentId) {
      setError('Please select an equipment');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError('Please fill in both start and end times');
      return;
    }

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (start.getTime() >= end.getTime()) {
      setError('End time must be after start time');
      return;
    }
    if (start.getTime() < Date.now()) {
      setError('Start time cannot be in the past');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.create({
        equipmentId: form.equipmentId,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        notes: form.notes,
      });
      toast('Booking request submitted successfully! Status: PENDING', 'success');
      onSuccess?.();
      onClose();
      // Reset form
      setForm({
        equipmentId: equipmentId,
        startTime: '',
        endTime: '',
        purpose: '',
        notes: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white/95 border border-slate-100 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <MdEventNote className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Request Booking</h3>
              <p className="text-slate-400 text-xs mt-0.5">Submit a booking request for review</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <MdInfo className="text-base flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Equipment Selection */}
          <div>
            <label className="form-label">Equipment</label>
            <div className="relative">
              <MdScience className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
              {equipmentId ? (
                <input
                  type="text"
                  value={equipmentName}
                  disabled
                  className="form-input pl-10 bg-slate-50/50 text-slate-500 border-slate-200 cursor-not-allowed"
                />
              ) : (
                <select
                  name="equipmentId"
                  value={form.equipmentId}
                  onChange={handleChange}
                  disabled={loadingList}
                  required
                  className="form-input pl-10 pr-9 appearance-none cursor-pointer"
                >
                  <option value="">— Select Available Equipment —</option>
                  {equipmentList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.manufacturer} · {e.model}) — {e.location}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date & Time</label>
              <div className="relative">
                <MdAccessTime className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                <input
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">End Date & Time</label>
              <div className="relative">
                <MdAccessTime className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                <input
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="form-label">Purpose of Use</label>
            <input
              type="text"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="e.g., Polymerase chain reaction study"
              required
              className="form-input"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Provide any specific preparation or configuration notes..."
              rows={2}
              className="form-input resize-none py-2"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-28 justify-center">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
