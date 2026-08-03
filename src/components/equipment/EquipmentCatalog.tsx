import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { Search, Filter, Cpu, ArrowUpRight } from 'lucide-react';

interface EquipmentCatalogProps {
  searchQuery: string;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenBookingModal: (eq?: Equipment) => void;
}

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  searchQuery,
  onSelectEquipment,
  onOpenBookingModal
}) => {
  const { equipment, departments } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.labName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || eq.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'all' || eq.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-4">
      
      {/* Filters Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white uppercase tracking-wider">Equipment Inventory ({filteredEquipment.length})</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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
        {filteredEquipment.map(eq => (
          <div key={eq.id} className="bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all">
            <div>
              <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-slate-700">
                <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                  eq.status === 'Available' ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-500' :
                  eq.status === 'Booked' ? 'bg-indigo-900/90 text-indigo-300 border border-indigo-500' :
                  'bg-rose-900/90 text-rose-300 border border-rose-500'
                }`}>
                  {eq.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                  {eq.departmentName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {eq.modelNumber}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-tight">{eq.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Lab: {eq.labName}</p>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectEquipment(eq)}
                className="text-indigo-400 hover:underline font-semibold flex items-center gap-0.5 text-xs"
              >
                View Specs <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenBookingModal(eq)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs"
              >
                Request Slot
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
