import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, CheckCircle2 } from 'lucide-react';

interface CalibrationModalProps {
  onClose: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({ onClose }) => {
  const { equipment, recordCalibration } = useApp();

  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');
  const [calibrationDate, setCalibrationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [nextDueDate, setNextDueDate] = useState<string>(
    new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );
  const [agency, setAgency] = useState<string>('Keysight Authorized Calibration Lab');
  const [technicianName, setTechnicianName] = useState<string>('Marcus Wright (NIST Certified)');
  const [certificateNumber, setCertificateNumber] = useState<string>(`CAL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [result, setResult] = useState<'Passed' | 'Passed with Adjustments' | 'Failed'>('Passed');
  const [notes, setNotes] = useState<string>('Calibrated within ISO/IEC 17025 tolerance limits.');

  const selectedEq = equipment.find(e => e.id === selectedEqId) || equipment[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEq) return;

    recordCalibration({
      equipmentId: selectedEq.id,
      equipmentName: selectedEq.name,
      calibrationDate,
      nextDueDate,
      agency,
      technicianName,
      certificateNumber,
      result,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between text-amber-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Record Equipment Calibration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Equipment:</label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            >
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.labName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Calibration Date:</label>
              <input
                type="date"
                value={calibrationDate}
                onChange={(e) => setCalibrationDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Next Calibration Due:</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Certifying Agency:</label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Certificate Number:</label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Calibration Result:</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="Passed">Passed (Fully Compliant)</option>
              <option value="Passed with Adjustments">Passed with Adjustments</option>
              <option value="Failed">Failed (Requires Maintenance)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Notes / Adjustments Made:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

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
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Save Calibration Certificate
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
