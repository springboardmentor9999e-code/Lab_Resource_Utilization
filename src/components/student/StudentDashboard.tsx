import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Sparkles 
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenBookingModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenBookingModal }) => {
  const { currentUser, equipment, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'assigned' | 'my_bookings'>('assigned');

  const user = currentUser!;
  // Filter student's bookings
  const myBookings = bookings.filter(b => b.userId === user.id);

  // Filter equipment available in student's department or mapped to courses
  const deptEquipment = equipment.filter(e => e.departmentId === user.departmentId);

  return (
    <div className="space-y-6">
      
      {/* Student Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
              @student / @researcher
            </span>
            <h2 className="text-lg font-bold text-white">Student & Researcher Apparatus Portal</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Welcome, {user.name}. See assigned equipment for your research & practical courses, request lab slots, and track booking status.
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Request Equipment Slot
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 self-start inline-flex mb-2">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'assigned'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Assigned Equipment ({deptEquipment.length})
        </button>
        <button
          onClick={() => setActiveTab('my_bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'my_bookings'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Slot Bookings & Status ({myBookings.length})
        </button>
      </div>

      {/* Tab 1: Assigned Apparatus */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Equipment for Your Program</h3>
              <p className="text-xs text-slate-400">Apparatus available for research experiments & course work</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptEquipment.map(eq => (
              <div key={eq.id} className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.01]">
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-slate-800 shrink-0">
                    <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                      eq.status === 'Available' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' :
                      'bg-rose-950/80 text-rose-300 border-rose-500/30'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {eq.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 border border-slate-850 px-2 py-0.5 rounded">
                      {eq.modelNumber}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-tight tracking-tight">{eq.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    <span>Lab: {eq.labName}</span>
                  </p>
                  
                  {eq.assignedCourse && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Mapped to: {eq.assignedCourse}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Condition: <strong className="text-slate-200">{eq.condition}</strong></span>
                  <button
                    onClick={onOpenBookingModal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Request Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Bookings */}
      {activeTab === 'my_bookings' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                My Equipment Booking History & Waitlist Status
              </h3>
              <p className="text-xs text-slate-400">Track technician slot confirmation and time schedule</p>
            </div>
            <button
              onClick={onOpenBookingModal}
              className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
            >
              + New Slot Request
            </button>
          </div>

          {myBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              You have no active slot requests. Click "+ New Slot Request" to reserve equipment.
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map(bk => (
                <div key={bk.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{bk.equipmentName}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                      bk.status === 'Assigned Slot' || bk.status === 'Confirmed' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' :
                      bk.status === 'Pending Approval' ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' :
                      'bg-rose-900/50 text-rose-300 border-rose-700/50'
                    }`}>
                      {bk.status}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    <strong>Experiment Purpose:</strong> {bk.purpose}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <div>
                      Requested Date: <strong className="text-white">{bk.bookingDate}</strong> | Allocated Slot: <strong className="text-indigo-300">{bk.allocatedStartTime || bk.requestedStartTime} - {bk.allocatedEndTime || bk.requestedEndTime}</strong>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Lab Manager: {bk.allocatedByTechnicianName || 'Mr. Rajesh Kumar (Assigned)'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
