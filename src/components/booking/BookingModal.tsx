import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { X, Calendar, Clock, BookOpen } from 'lucide-react';

interface BookingModalProps {
  initialEquipment?: Equipment | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ initialEquipment, onClose }) => {
  const { equipment, currentUser, addBooking } = useApp();

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

  const selectedEq = equipment.find(e => e.id === selectedEqId) || equipment[0];

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
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      subjectCode,
      subjectName,
      purpose,
      bookingDate,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
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
                  {eq.name} ({eq.departmentName.split(' ')[0]} - {eq.labName})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Target Booking Date:</label>
            <input
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Preferred End Time:</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
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
              Submit Booking Request
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
