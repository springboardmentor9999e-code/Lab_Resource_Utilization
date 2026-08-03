import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  FileText
} from 'lucide-react';

interface StaffDashboardProps {
  onOpenBookingModal: () => void;
  onOpenTicketModal: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  onOpenBookingModal, 
  onOpenTicketModal 
}) => {
  const { currentUser, labs, equipment, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'subject_labs' | 'my_schedule' | 'equipment_condition'>('subject_labs');

  // Filter bookings for this professor
  const myBookings = bookings.filter(b => b.userId === currentUser.id);
  const myDeptLabs = labs.filter(l => l.departmentId === currentUser.departmentId);
  const myDeptEquipment = equipment.filter(e => e.departmentId === currentUser.departmentId);

  return (
    <div className="space-y-6">
      
      {/* Staff Header & Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
              @staff
            </span>
            <h2 className="text-lg font-bold text-white">Faculty & Course Lab Portal</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Welcome, {currentUser.name}. Manage subject practical lab sessions, check slot allocations, and inspect equipment readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenBookingModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Request Subject Lab Slot
          </button>

          <button
            onClick={onOpenTicketModal}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Report Faulty Equipment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('subject_labs')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'subject_labs'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Required Subject Labs ({myDeptLabs.length})
        </button>
        <button
          onClick={() => setActiveTab('my_schedule')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'my_schedule'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Scheduled Slots Timetable ({myBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment_condition')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'equipment_condition'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Lab Equipment Condition Check ({myDeptEquipment.length})
        </button>
      </div>

      {/* Tab 1: Subject Labs */}
      {activeTab === 'subject_labs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myDeptLabs.map(lab => (
            <div key={lab.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    {lab.code}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{lab.name}</h3>
                  <p className="text-xs text-slate-400">{lab.building} · {lab.roomNumber}</p>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  lab.condition === 'Operational' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' : 'bg-rose-900/50 text-rose-300 border-rose-700/50'
                }`}>
                  {lab.condition}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lab Technician:</span>
                  <span className="font-semibold text-white">{lab.technicianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workstation Capacity:</span>
                  <span className="font-semibold text-white">{lab.capacity} Students</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Subjects Mapped to This Lab:
                </span>
                <div className="space-y-1">
                  {lab.subjects.map((subj, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 text-xs text-slate-200 rounded border border-slate-700 flex items-center justify-between">
                      <span>{subj}</span>
                      <button
                        onClick={onOpenBookingModal}
                        className="text-[10px] text-emerald-400 hover:underline font-semibold"
                      >
                        Book Slot
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Timetable / Scheduled Slots */}
      {activeTab === 'my_schedule' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Scheduled Class Slots (Assigned by Lab Technician)
              </h3>
              <p className="text-xs text-slate-400">Timetable allocated for your course lab sessions</p>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No slots scheduled yet. Use "+ Request Subject Lab Slot" to apply for class hours.
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
                    <strong>Course/Subject:</strong> {bk.subjectCode || 'General'} - {bk.subjectName || bk.purpose}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Date: <strong className="text-white">{bk.bookingDate}</strong></span>
                      <span>·</span>
                      <span>
                        Slot: <strong className="text-emerald-400">{bk.allocatedStartTime || bk.requestedStartTime} - {bk.allocatedEndTime || bk.requestedEndTime}</strong>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Scheduled by: {bk.allocatedByTechnicianName || 'Pending Technician Assignment'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Equipment Condition Check */}
      {activeTab === 'equipment_condition' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Equipment Readiness & Condition Check</h3>
            <p className="text-xs text-slate-400">Verify calibration and equipment status prior to student lab sessions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDeptEquipment.map(eq => (
              <div key={eq.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl flex items-start gap-3">
                <img src={eq.imageUrl} alt={eq.name} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700" />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{eq.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      eq.condition === 'Excellent' || eq.condition === 'Good' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'
                    }`}>
                      {eq.condition}
                    </span>
                  </div>
                  <p className="text-slate-400">Lab: {eq.labName}</p>
                  <p className="text-slate-400">Next Calibration: <span className="text-slate-200">{eq.nextCalibrationDueDate}</span></p>

                  {eq.condition === 'Faulty' && (
                    <button
                      onClick={onOpenTicketModal}
                      className="mt-1 text-[10px] bg-rose-600 text-white px-2 py-1 rounded font-medium"
                    >
                      Report Maintenance Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
