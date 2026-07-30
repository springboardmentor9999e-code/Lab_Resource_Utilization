import { useState, useEffect } from 'react';
import { MdSchedule, MdCheck, MdWarning } from 'react-icons/md';
import { bookingService } from '../services/services';

export default function SmartScheduleModal({ equipmentId, onSelectSlot, onClose }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.suggestSlots(equipmentId)
      .then(r => setSlots(r.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
        <h3 className="text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <MdSchedule className="text-purple-600" /> Smart Slot Suggestions
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Conflict detected! Here are the next available conflict-free time slots for this equipment:
        </p>

        {loading ? (
          <div className="py-6 text-center text-slate-500 text-sm font-medium">Finding available slots...</div>
        ) : slots.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm font-medium">No free slots found for today. Try selecting a different date.</div>
        ) : (
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {slots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSlot(slot)}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-900 font-bold text-sm flex items-center justify-between transition-colors"
              >
                <span>⏰ {slot}</span>
                <span className="text-xs text-purple-700 font-semibold">Select Slot →</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
