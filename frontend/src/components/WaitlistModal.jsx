import { useState } from 'react';
import { MdHourglassEmpty, MdCheckCircle, MdClose } from 'react-icons/md';
import { waitlistService } from '../services/services';
import { useToast } from '../context/ToastContext';

export default function WaitlistModal({ equipment, onClose, onSuccess }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    setSubmitting(true);
    try {
      await waitlistService.join(equipment.id);
      toast.showSuccess(`Joined waitlist for ${equipment.name}! You will be notified when it becomes available.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdHourglassEmpty className="text-3xl" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">Equipment Currently Unavailable</h3>
        <p className="text-xs text-slate-500 mb-6">
          <strong className="text-slate-800">{equipment.name}</strong> is currently booked or undergoing maintenance.
          Join the waitlist to get automated notifications when a slot frees up.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={submitting}
            className="btn-primary bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {submitting ? 'Joining...' : 'Join Waitlist Queue'}
          </button>
        </div>
      </div>
    </div>
  );
}
