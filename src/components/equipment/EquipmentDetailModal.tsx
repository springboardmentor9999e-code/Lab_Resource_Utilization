import React from 'react';
import { Equipment } from '../../types';
import { X, Calendar, Shield, Wrench, CheckCircle2, Clock, Edit2, Trash2, AlertTriangle, BadgeAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onBook: (equipment: Equipment) => void;
  onRaiseTicket: (equipment: Equipment) => void;
  onEdit?: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onBook,
  onRaiseTicket,
  onEdit,
}) => {
  const { currentUser, deleteEquipment } = useApp();
  if (!equipment) return null;

  const user = currentUser;
  const showAdminActions = user && (user.role === 'admin' || user.role === 'lab_technician');

  // Calculate Calibration Status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = equipment.nextCalibrationDueDate ? new Date(equipment.nextCalibrationDueDate) : null;
  let calibrationStatus: 'current' | 'upcoming' | 'overdue' = 'current';
  let calibrationMessage = 'Calibration Current';
  let daysDiff = 0;

  if (dueDate) {
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      calibrationStatus = 'overdue';
      calibrationMessage = `Calibration Overdue by ${Math.abs(daysDiff)} days`;
    } else if (daysDiff <= 15) {
      calibrationStatus = 'upcoming';
      calibrationMessage = `Calibration due in ${daysDiff} days`;
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the equipment "${equipment.name}"? This action cannot be undone.`)) {
      deleteEquipment(equipment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="relative h-48 bg-slate-900">
          <img
            src={equipment.imageUrl}
            alt={equipment.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-black/40"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/40 uppercase">
                {equipment.category}
              </span>
              <h2 className="text-xl font-bold text-white mt-1 leading-tight">{equipment.name}</h2>
              <p className="text-xs text-slate-300">Model: {equipment.modelNumber} · Serial: {equipment.serialNumber}</p>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
              equipment.status === 'Available' ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500' :
              equipment.status === 'Booked' ? 'bg-indigo-900/80 text-indigo-300 border-indigo-500' :
              'bg-rose-900/80 text-rose-300 border-rose-500'
            }`}>
              {equipment.status}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Department</span>
              <span className="font-bold text-white">{equipment.departmentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Laboratory</span>
              <span className="font-bold text-white">{equipment.labName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Condition</span>
              <span className={`font-bold ${
                equipment.condition === 'Excellent' || equipment.condition === 'Good' ? 'text-emerald-400' :
                equipment.condition === 'Fair' ? 'text-amber-400' : 'text-rose-400'
              }`}>{equipment.condition}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Supervision</span>
              <span className="font-bold text-slate-200">
                {equipment.requiresTechnicianSupervision ? 'Required' : 'Optional'}
              </span>
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(equipment.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-2 bg-slate-900/80 rounded-lg border border-slate-700/50 flex justify-between">
                  <span className="text-slate-400">{key === '0' || key === 'Standard specification details' ? 'Details' : key}:</span>
                  <span className="font-semibold text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration & Safety Records */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Calibration Details with Warning Alerts */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              calibrationStatus === 'overdue' ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' :
              calibrationStatus === 'upcoming' ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' :
              'bg-slate-900/60 border-slate-700/60 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-xs text-indigo-300">
                  <Calendar className="w-4 h-4" /> Calibration Record
                </span>
                
                {/* Calibration warning badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${
                  calibrationStatus === 'overdue' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  calibrationStatus === 'upcoming' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {calibrationStatus === 'overdue' && <AlertTriangle className="w-3 h-3 shrink-0" />}
                  {calibrationMessage}
                </span>
              </div>
              
              <div className="space-y-1 pt-1.5 border-t border-slate-700/40 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Calibrated:</span>
                  <span className="font-medium text-slate-200">{equipment.lastCalibrationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Calibration Due:</span>
                  <span className={`font-bold ${
                    calibrationStatus === 'overdue' ? 'text-rose-400 animate-pulse' :
                    calibrationStatus === 'upcoming' ? 'text-amber-400' : 'text-slate-200'
                  }`}>{equipment.nextCalibrationDueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate No:</span>
                  <span className="font-mono text-slate-300">{equipment.calibrationCertificateNo}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs mb-1.5">
                  <Shield className="w-4 h-4" /> Course Mapping & Rates
                </span>
                <p className="text-slate-300">{equipment.assignedCourse || 'General Academic & Research Access'}</p>
              </div>
              <div className="pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                Hourly Rate: <strong className="text-slate-200">${equipment.hourlyRate}/hr</strong> (External institution bookings require payments).
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between gap-3 flex-wrap">
          
          {/* Admin Modifications */}
          {showAdminActions ? (
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  if (onEdit) onEdit(equipment);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Asset
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Asset
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onRaiseTicket(equipment);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <Wrench className="w-4 h-4" /> Report Issue
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-4 py-2"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(equipment);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Request Equipment Slot
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
