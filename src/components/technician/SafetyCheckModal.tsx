import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck } from 'lucide-react';

interface SafetyCheckModalProps {
  onClose: () => void;
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ onClose }) => {
  const { labs, submitSafetyCheck, currentUser } = useApp();

  const [selectedLabId, setSelectedLabId] = useState<string>(labs[0]?.id || '');
  const [fire, setFire] = useState(true);
  const [firstAid, setFirstAid] = useState(true);
  const [emergencyStop, setEmergencyStop] = useState(true);
  const [ppe, setPpe] = useState(true);
  const [ventilation, setVentilation] = useState(true);
  const [waste, setWaste] = useState(true);
  const [notes, setNotes] = useState('All lab safety checks verified and passed compliant.');

  const selectedLab = labs.find(l => l.id === selectedLabId) || labs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab) return;

    submitSafetyCheck({
      labId: selectedLab.id,
      labName: selectedLab.name,
      date: new Date().toISOString().split('T')[0],
      checkedBy: currentUser.name,
      fireExtinguisherChecked: fire,
      firstAidKitStocked: firstAid,
      emergencyStopFunctional: emergencyStop,
      ppeAvailable: ppe,
      ventilationOK: ventilation,
      hazardousWasteDisposed: waste,
      passed: fire && emergencyStop && ppe,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between text-indigo-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Perform Lab Safety Inspection</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Target Laboratory:</label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            >
              {labs.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
            <span className="font-bold text-white block mb-2">Safety Verification Checklist:</span>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={fire} onChange={e => setFire(e.target.checked)} className="rounded text-indigo-600" />
              <span>Fire Extinguisher & Pressure Gauge Inspected</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={firstAid} onChange={e => setFirstAid(e.target.checked)} className="rounded text-indigo-600" />
              <span>First Aid Kit Fully Stocked</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={emergencyStop} onChange={e => setEmergencyStop(e.target.checked)} className="rounded text-indigo-600" />
              <span>Emergency Power Cutoff & Stop Button Tested</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={ppe} onChange={e => setPpe(e.target.checked)} className="rounded text-indigo-600" />
              <span>Personal Protective Equipment (Goggles/Gloves/ESD) Available</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={ventilation} onChange={e => setVentilation(e.target.checked)} className="rounded text-indigo-600" />
              <span>Fume Hoods & Ventilation Systems Operational</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input type="checkbox" checked={waste} onChange={e => setWaste(e.target.checked)} className="rounded text-indigo-600" />
              <span>Hazardous Waste Safely Stored & Labeled</span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Inspector Notes & Recommendations:</label>
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Submit Safety Audit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
