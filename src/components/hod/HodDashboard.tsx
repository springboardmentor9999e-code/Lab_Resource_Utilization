import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Users, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Layers
} from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const { currentUser, labs, equipment, users, bookings, rejectBooking, assignSlot } = useApp();
  const [activeTab, setActiveTab] = useState<'labs' | 'people' | 'equipment' | 'requests'>('labs');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);

  // Filter department data
  const deptId = currentUser.departmentId || 'dept-ece';
  const deptName = currentUser.departmentName || 'Electronics & Communication Engineering';

  const myLabs = labs.filter(l => l.departmentId === deptId);
  const myEquipment = equipment.filter(e => e.departmentId === deptId);
  const myUsers = users.filter(u => u.departmentId === deptId);
  const myBookings = bookings.filter(b => b.departmentId === deptId);

  const pendingRequests = myBookings.filter(b => b.status === 'Pending Approval');

  const facultyList = myUsers.filter(u => u.role === 'staff');
  const technicianList = myUsers.filter(u => u.role === 'lab_technician');
  const studentList = myUsers.filter(u => u.role === 'student');

  const handleApprove = (bookingId: string) => {
    // Default slot assignment confirmation
    const booking = myBookings.find(b => b.id === bookingId);
    if (booking) {
      assignSlot(
        bookingId, 
        booking.requestedStartTime, 
        booking.requestedEndTime, 
        currentUser.name
      );
    }
  };

  const handleConfirmReject = (bookingId: string) => {
    if (!rejectReason) return;
    rejectBooking(bookingId, rejectReason);
    setRejectingBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* HOD Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department Labs</p>
            <h3 className="text-2xl font-bold text-white mt-1">{myLabs.length} Active Labs</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All Safety Audited
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department People</p>
            <h3 className="text-2xl font-bold text-white mt-1">{myUsers.length} Members</h3>
            <p className="text-[11px] text-slate-400 mt-1">{facultyList.length} Faculty · {technicianList.length} Techs</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department Equipment</p>
            <h3 className="text-2xl font-bold text-white mt-1">{myEquipment.length} Assets</h3>
            <p className="text-[11px] text-emerald-400 mt-1">
              {myEquipment.filter(e => e.status === 'Available').length} Available Now
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingRequests.length} Requests</h3>
            <p className="text-[11px] text-amber-400 mt-1">Requires HOD Decision</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'labs'
              ? 'border-blue-500 text-blue-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Required Department Labs ({myLabs.length})
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'people'
              ? 'border-blue-500 text-blue-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Department People ({myUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'equipment'
              ? 'border-blue-500 text-blue-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Lab Equipment Matrix ({myEquipment.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-blue-500 text-blue-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Approvals ({pendingRequests.length})
        </button>
      </div>

      {/* Tab 1: Labs & Conditions */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Required Labs & Condition Status</h2>
              <p className="text-xs text-slate-400">All laboratories under {deptName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLabs.map(lab => (
              <div key={lab.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                      {lab.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{lab.name}</h3>
                    <p className="text-xs text-slate-400">{lab.building} · {lab.roomNumber}</p>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    lab.condition === 'Operational' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' :
                    lab.condition === 'Degraded' ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' :
                    'bg-rose-900/50 text-rose-300 border-rose-700/50'
                  }`}>
                    {lab.condition}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Technician:</span>
                    <span className="font-semibold text-white">{lab.technicianName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Student Capacity:</span>
                    <span className="font-semibold text-white">{lab.capacity} Workstations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Safety Compliance Score:</span>
                    <span className="font-bold text-emerald-400 font-mono">{lab.safetyScore}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Curriculum Subjects Conducted in this Lab:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.subjects.map((subj, sIdx) => (
                      <span key={sIdx} className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: People Under Department */}
      {activeTab === 'people' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">People Under Department ({deptName})</h2>
            <p className="text-xs text-slate-400">Faculty members, lab technicians, and research scholars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Faculty List */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>Professors & Faculty ({facultyList.length})</span>
              </h3>
              <div className="space-y-2">
                {facultyList.map(u => (
                  <div key={u.id} className="p-2.5 bg-slate-800/80 rounded-lg flex items-center gap-2 text-xs">
                    <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technicians List */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>Lab Technicians ({technicianList.length})</span>
              </h3>
              <div className="space-y-2">
                {technicianList.map(u => (
                  <div key={u.id} className="p-2.5 bg-slate-800/80 rounded-lg flex items-center gap-2 text-xs">
                    <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students List */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>Students & Scholars ({studentList.length})</span>
              </h3>
              <div className="space-y-2">
                {studentList.map(u => (
                  <div key={u.id} className="p-2.5 bg-slate-800/80 rounded-lg flex items-center gap-2 text-xs">
                    <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Equipment Matrix */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Department Equipment Availability</h2>
            <p className="text-xs text-slate-400">Real-time status and condition of equipment under {deptName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEquipment.map(eq => (
              <div key={eq.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex items-start gap-4">
                <img src={eq.imageUrl} alt={eq.name} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-700" />
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{eq.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      eq.status === 'Available' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                      eq.status === 'Booked' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' :
                      'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                  <p className="text-slate-400">Model: {eq.modelNumber} · Serial: {eq.serialNumber}</p>
                  <p className="text-slate-300">Lab: {eq.labName}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span>Condition: <strong className="text-slate-200">{eq.condition}</strong></span>
                    <span>·</span>
                    <span>Next Calibration: <strong className="text-slate-200">{eq.nextCalibrationDueDate}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pending Approvals */}
      {activeTab === 'requests' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Booking & Resource Sharing Requests</h2>
            <p className="text-xs text-slate-400">Review pending requests for department equipment</p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No pending approval requests for your department.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.equipmentName}</span>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">
                        Pending HOD Review
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Requested on: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    <strong>Requester:</strong> {req.userName} ({req.userRole}) · <strong>Purpose:</strong> {req.purpose}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">
                      Requested Slot: <strong>{req.bookingDate}</strong> ({req.requestedStartTime} - {req.requestedEndTime})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Request
                      </button>

                      <button
                        onClick={() => setRejectingBookingId(req.id)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-3 py-1 rounded flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Reject Modal Prompt */}
                  {rejectingBookingId === req.id && (
                    <div className="mt-3 p-3 bg-slate-800 border border-rose-500/50 rounded-lg space-y-2">
                      <label className="text-[11px] font-semibold text-rose-300 block">
                        Specify Rejection Reason:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Equipment scheduled for mandatory maintenance / Conflict with class lab"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingBookingId(null)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(req.id)}
                          className="bg-rose-600 text-white text-xs px-3 py-1 rounded font-medium"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
