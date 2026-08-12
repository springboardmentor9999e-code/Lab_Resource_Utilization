import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { X, Calendar, Clock, BookOpen, AlertTriangle, CreditCard } from 'lucide-react';
import { initialInstitutions } from '../../data/initialData';

interface BookingModalProps {
  initialEquipment?: Equipment | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ initialEquipment, onClose }) => {
  const { equipment, currentUser, addBooking } = useApp();

  const user = currentUser!;
  const [selectedEqId, setSelectedEqId] = useState<string>(
    initialEquipment ? initialEquipment.id : (equipment[0]?.id || '')
  );

  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('11:30');
  const [subjectCode, setSubjectCode] = useState<string>('ECE301');
  const [subjectName, setSubjectName] = useState<string>('Microprocessors & Microcontrollers Practical');
  const [purpose, setPurpose] = useState<string>('Laboratory Experiment & Hardware Verification');
  const [grantReference, setGrantReference] = useState<string>('');

  // Dummy Payment States
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');

  const selectedEq = equipment.find(e => e.id === selectedEqId) || equipment[0];
  const isExternal = selectedEq && selectedEq.institutionId !== user.institutionId;

  // Calculate duration and total cost
  const getDurationHours = () => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0.5, Math.round((durationMin / 60) * 10) / 10);
  };
  const durationHours = getDurationHours();
  const totalCost = selectedEq ? durationHours * selectedEq.hourlyRate : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEq) return;

    addBooking({
      equipmentId: selectedEq.id,
      equipmentName: selectedEq.name,
      labId: selectedEq.labId,
      labName: selectedEq.labName,
      departmentId: selectedEq.departmentId,
      departmentName: selectedEq.departmentName,
      institutionId: selectedEq.institutionId,
      institutionName: selectedEq.institutionName,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      userInstitutionId: user.institutionId,
      userInstitutionName: user.institutionName,
      subjectCode,
      subjectName,
      purpose,
      bookingDate,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      grantReference: isExternal ? (grantReference || 'PAID_DUMMY_CARD') : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Request Equipment & Lab Slot</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Equipment Selector */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Select Equipment / Apparatus:</label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.institutionId === user.institutionId ? 'Local' : (initialInstitutions.find(i => i.id === eq.institutionId)?.shortName || eq.institutionName.split(' ')[0])} - {eq.labName})
                </option>
              ))}
            </select>
          </div>

          {/* Inter-institution Warning Alert & Billing */}
          {isExternal && (
            <div className="space-y-3">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Inter-Institution Request ({selectedEq.institutionName})</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  This asset belongs to a partner institution. Booking requests are subject to remote scheduling approvals and transport protocols. Usage rate is <strong className="text-amber-300">${selectedEq.hourlyRate}/hour</strong>.
                </p>
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Project Grant / Funding Reference:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIH-GRANT-2026-ECE"
                    value={grantReference}
                    onChange={(e) => setGrantReference(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dummy Payment form */}
              <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <CreditCard className="w-4 h-4 text-indigo-400" /> Payment & Billing Details
                  </span>
                  <span className="text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                    Total: ${totalCost.toFixed(2)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required={isExternal}
                      placeholder="John Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required={isExternal}
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required={isExternal}
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Security Code (CVV)
                    </label>
                    <input
                      type="password"
                      required={isExternal}
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center italic leading-normal">
                  Sandbox Mode: Payments are mock and will not transfer actual funds.
                </p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Target Booking Date:</label>
            <input
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Preferred Start Time:</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Preferred End Time:</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Subject & Purpose */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Subject Code:</label>
              <input
                type="text"
                placeholder="e.g. ECE301"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Subject Name:</label>
              <input
                type="text"
                placeholder="e.g. Microprocessors"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Experiment / Purpose Details:</label>
            <textarea
              rows={3}
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              {isExternal ? `Pay $${totalCost.toFixed(2)} & Submit Request` : 'Submit Booking Request'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
