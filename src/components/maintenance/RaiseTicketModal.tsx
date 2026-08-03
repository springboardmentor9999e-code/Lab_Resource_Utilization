import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, TicketIssueType, TicketPriority } from '../../types';
import { X, Wrench, AlertTriangle } from 'lucide-react';

interface RaiseTicketModalProps {
  initialEquipment?: Equipment | null;
  onClose: () => void;
}

export const RaiseTicketModal: React.FC<RaiseTicketModalProps> = ({ initialEquipment, onClose }) => {
  const { equipment, currentUser, raiseMaintenanceTicket } = useApp();

  const [selectedEqId, setSelectedEqId] = useState<string>(
    initialEquipment ? initialEquipment.id : (equipment[0]?.id || '')
  );

  const [issueType, setIssueType] = useState<TicketIssueType>('Hardware Defect');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [description, setDescription] = useState<string>('');

  const selectedEq = equipment.find(e => e.id === selectedEqId) || equipment[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEq || !description) return;

    raiseMaintenanceTicket({
      equipmentId: selectedEq.id,
      equipmentName: selectedEq.name,
      labId: selectedEq.labId,
      labName: selectedEq.labName,
      departmentId: selectedEq.departmentId,
      departmentName: selectedEq.departmentName,
      raisedByUserId: currentUser.id,
      raisedByUserName: currentUser.name,
      raisedByUserRole: currentUser.role,
      issueType,
      priority,
      description,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Raise Maintenance Ticket</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Select Malfunctioning Equipment:</label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            >
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.labName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Issue Category:</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as TicketIssueType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="Hardware Defect">Hardware Defect</option>
                <option value="Calibration Drift">Calibration Drift</option>
                <option value="Power/Electrical">Power/Electrical</option>
                <option value="Software Error">Software Error</option>
                <option value="Physical Damage">Physical Damage</option>
                <option value="Routine Service">Routine Service</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Priority Level:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="Critical">Critical (Immediate Stop)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Detailed Fault Description & Symptoms:</label>
            <textarea
              rows={4}
              required
              placeholder="Describe error code, noisy fan, channel attenuation, software freeze..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Create Ticket & Flag Equipment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
