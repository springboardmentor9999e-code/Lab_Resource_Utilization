import React from 'react';
import { Equipment } from '../../types';
import { X, Calendar, Shield, Wrench, CheckCircle2, Clock } from 'lucide-react';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onBook: (equipment: Equipment) => void;
  onRaiseTicket: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onBook,
  onRaiseTicket,
}) => {
  if (!equipment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative h-48 bg-slate-900">
          <img
            src={equipment.imageUrl}
            alt={equipment.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-black/40"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full transition-colors"
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
              <span className="font-bold text-emerald-400">{equipment.condition}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Supervision</span>
              <span className="font-bold text-slate-200">
                {equipment.requiresTechnicianSupervision ? 'Required' : 'Optional'}
              </span>
            </div>
          </div>

          {/* Specs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(equipment.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-2 bg-slate-900/80 rounded-lg border border-slate-700/50 flex justify-between">
                  <span className="text-slate-400">{key}:</span>
                  <span className="font-semibold text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" /> Calibration Record
              </span>
              <p className="text-slate-300">Last: {equipment.lastCalibrationDate}</p>
              <p className="text-amber-400 font-semibold">Next Due: {equipment.nextCalibrationDueDate}</p>
              <p className="text-[10px] text-slate-400 font-mono">Cert No: {equipment.calibrationCertificateNo}</p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" /> Course Mapping
              </span>
              <p className="text-slate-300">{equipment.assignedCourse || 'General Academic & Research Access'}</p>
              <p className="text-[10px] text-slate-400">Hourly Rate: ${equipment.hourlyRate}/hr (Internal Academic Waiver Applied)</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onRaiseTicket(equipment);
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <Wrench className="w-4 h-4" /> Report Issue
          </button>

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
