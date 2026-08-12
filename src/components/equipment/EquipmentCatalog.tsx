import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { Search, Filter, Cpu, ArrowUpRight, Edit2, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { initialInstitutions } from '../../data/initialData';

interface EquipmentCatalogProps {
  searchQuery: string;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenBookingModal: (eq?: Equipment) => void;
  onEditEquipment?: (eq: Equipment) => void;
}

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  searchQuery,
  onSelectEquipment,
  onOpenBookingModal,
  onEditEquipment
}) => {
  const { equipment, departments, currentUser, deleteEquipment } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedInst, setSelectedInst] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const user = currentUser;
  const showAdminActions = user && (user.role === 'admin' || user.role === 'lab_technician');

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.labName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || eq.departmentId === selectedDept;
    const matchesInst = selectedInst === 'all' || eq.institutionId === selectedInst;
    const matchesStatus = selectedStatus === 'all' || eq.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesInst && matchesStatus;
  });

  const handleDelete = (e: React.MouseEvent, eq: Equipment) => {
    e.stopPropagation();
    if (window.confirm(`Are you absolutely sure you want to delete the equipment "${eq.name}"?`)) {
      deleteEquipment(eq.id);
    }
  };

  const handleEdit = (e: React.MouseEvent, eq: Equipment) => {
    e.stopPropagation();
    if (onEditEquipment) onEditEquipment(eq);
  };

  return (
    <div className="space-y-4">
      
      {/* Filters Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white uppercase tracking-wider">Equipment Inventory ({filteredEquipment.length})</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-slate-300">
            <span>Institution:</span>
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="all">All Institutions</option>
              {initialInstitutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.shortName} {inst.id === 'inst-rit' ? '(Local)' : '(Partner)'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span>Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="under maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(eq => {
          // Check Calibration Status for warning icons
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = eq.nextCalibrationDueDate ? new Date(eq.nextCalibrationDueDate) : null;
          let calStatus: 'current' | 'upcoming' | 'overdue' = 'current';
          if (dueDate) {
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) calStatus = 'overdue';
            else if (diffDays <= 15) calStatus = 'upcoming';
          }

          return (
            <div 
              key={eq.id} 
              onClick={() => onSelectEquipment(eq)}
              className="bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20 rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                    eq.status === 'Available' ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-500/30' :
                    eq.status === 'Booked' ? 'bg-indigo-900/90 text-indigo-300 border border-indigo-500/30' :
                    'bg-rose-900/90 text-rose-300 border border-rose-500/30'
                  }`}>
                    {eq.status}
                  </span>

                  {/* Quick Edit/Delete Overlay for Admins */}
                  {showAdminActions && (
                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEdit(e, eq)}
                        className="p-1.5 bg-slate-900/90 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg shadow transition-colors"
                        title="Edit Equipment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, eq)}
                        className="p-1.5 bg-slate-900/90 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg shadow transition-colors"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Calibration Warning Badge */}
                  {calStatus !== 'current' && (
                    <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 ${
                      calStatus === 'overdue' 
                        ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse' 
                        : 'bg-amber-950 text-amber-300 border border-amber-600'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      {calStatus === 'overdue' ? 'CAL DUE' : 'CAL UPCOMING'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                    eq.institutionId === 'inst-rit' 
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {eq.institutionId === 'inst-rit' ? 'LOCAL' : (initialInstitutions.find(i => i.id === eq.institutionId)?.shortName || eq.institutionName.split(' ')[0]).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {eq.modelNumber}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">{eq.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Lab: {eq.labName}</p>
                
                {/* Calibration date display */}
                <p className={`text-[10px] mt-1.5 flex items-center gap-1 font-mono ${
                  calStatus === 'overdue' ? 'text-rose-400 font-semibold' :
                  calStatus === 'upcoming' ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>Cal Due: {eq.nextCalibrationDueDate}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEquipment(eq);
                  }}
                  className="text-indigo-400 hover:underline font-semibold flex items-center gap-0.5 text-xs"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBookingModal(eq);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Request Slot
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
