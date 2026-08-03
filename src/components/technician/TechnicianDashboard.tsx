import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EquipmentStatus, EquipmentCondition } from '../../types';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Check, 
  X
} from 'lucide-react';

interface TechnicianDashboardProps {
  onOpenCalibrationModal: () => void;
  onOpenSafetyCheckModal: () => void;
  onOpenTicketModal: () => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  onOpenCalibrationModal,
  onOpenSafetyCheckModal,
  onOpenTicketModal
}) => {
  const { 
    currentUser, 
    bookings, 
    equipment, 
    calibrations, 
    safetyChecklists, 
    assignSlot, 
    rejectBooking, 
    updateEquipmentStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'scheduler' | 'equipment_control' | 'calibration' | 'safety'>('scheduler');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>('09:00');
  const [customEnd, setCustomEnd] = useState<string>('11:00');
  const [rejectReason, setRejectReason] = useState<string>('');

  // Department / Lab filter
  const myEquipment = equipment.filter(e => e.departmentId === currentUser.departmentId);
  const pendingBookings = bookings.filter(b => b.status === 'Pending Approval');
  const allocatedBookings = bookings.filter(b => b.status === 'Assigned Slot' || b.status === 'Confirmed');

  const handleAllocateSlot = (bookingId: string) => {
    assignSlot(bookingId, customStart, customEnd, currentUser.name);
    setSelectedBookingId(null);
  };

  const handleReject = (bookingId: string) => {
    if (!rejectReason) return;
    rejectBooking(bookingId, rejectReason);
    setSelectedBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Technician Header Cards */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
              @lab_technicians
            </span>
            <h2 className="text-lg font-bold text-white">Lab Manager & Technician Console</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Welcome, {currentUser.name}. Allocate booking slots, manage equipment availability, track calibration dates, and enforce lab safety.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onOpenCalibrationModal}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Log Calibration
          </button>

          <button
            onClick={onOpenSafetyCheckModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Lab Safety Check
          </button>

          <button
            onClick={onOpenTicketModal}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Raise Maintenance Ticket
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('scheduler')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'scheduler'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Slot Allocator ({pendingBookings.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('equipment_control')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'equipment_control'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Equipment Status & Condition ({myEquipment.length})
        </button>
        <button
          onClick={() => setActiveTab('calibration')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'calibration'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Calibration Records ({calibrations.length})
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'safety'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Lab Safety & Audits ({safetyChecklists.length})
        </button>
      </div>

      {/* Tab 1: Slot Scheduler */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          
          {/* Pending Requests */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Incoming Booking Requests (Requires Slot Allocation)
                </h3>
                <p className="text-xs text-slate-400">Assign precise timetable slot or reject invalid bookings</p>
              </div>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No pending booking requests. All lab slots allocated!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map(bk => (
                  <div key={bk.id} className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{bk.equipmentName}</span>
                        <p className="text-slate-400">Lab: {bk.labName}</p>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-2.5 py-0.5 rounded border border-amber-500/30">
                        {bk.userRole.toUpperCase()} REQUEST
                      </span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                      <p className="text-slate-200">
                        <strong>Requested By:</strong> {bk.userName} ({bk.userEmail})
                      </p>
                      <p className="text-slate-200">
                        <strong>Purpose / Course:</strong> {bk.purpose}
                      </p>
                      <p className="text-slate-300 font-mono text-[11px]">
                        Requested Date: <strong>{bk.bookingDate}</strong> | Preferred Slot: <strong>{bk.requestedStartTime} - {bk.requestedEndTime}</strong>
                      </p>
                    </div>

                    {/* Allocation Drawer */}
                    {selectedBookingId === bk.id ? (
                      <div className="p-3 bg-slate-800 border border-amber-500/50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                              Allocated Start Time:
                            </label>
                            <input
                              type="time"
                              value={customStart}
                              onChange={(e) => setCustomStart(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                              Allocated End Time:
                            </label>
                            <input
                              type="time"
                              value={customEnd}
                              onChange={(e) => setCustomEnd(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <input
                            type="text"
                            placeholder="Rejection reason (if rejecting)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white w-2/3"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(bk.id)}
                              className="bg-rose-600 text-white text-xs px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAllocateSlot(bk.id)}
                              className="bg-emerald-600 text-white text-xs px-3 py-1 rounded font-bold"
                            >
                              Confirm Slot
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBookingId(bk.id);
                            setCustomStart(bk.requestedStartTime);
                            setCustomEnd(bk.requestedEndTime);
                          }}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Schedule & Allocate Slot
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed / Allocated Timetable */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Active Allocated Timetable ({allocatedBookings.length})
            </h3>

            <div className="space-y-2">
              {allocatedBookings.map(ab => (
                <div key={ab.id} className="p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{ab.equipmentName}</span>
                    <span className="text-slate-400 block">{ab.userName} · {ab.purpose}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold block">{ab.bookingDate}</span>
                    <span className="text-slate-300 font-mono text-[11px]">{ab.allocatedStartTime || ab.requestedStartTime} - {ab.allocatedEndTime || ab.requestedEndTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Equipment Status Control */}
      {activeTab === 'equipment_control' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Equipment Status & Condition Control</h3>
            <p className="text-xs text-slate-400">Directly set status (Available, Under Maintenance, Retired) and condition ratings</p>
          </div>

          <div className="space-y-3">
            {myEquipment.map(eq => (
              <div key={eq.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <img src={eq.imageUrl} alt={eq.name} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700" />
                  <div>
                    <span className="font-bold text-white text-sm block">{eq.name}</span>
                    <p className="text-slate-400">Model: {eq.modelNumber} | Serial: {eq.serialNumber}</p>
                    <p className="text-indigo-400">Lab: {eq.labName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  
                  {/* Status Toggle Selector */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Status:</label>
                    <select
                      value={eq.status}
                      onChange={(e) => updateEquipmentStatus(eq.id, e.target.value as EquipmentStatus)}
                      className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Booked">Booked</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  {/* Condition Selector */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Condition:</label>
                    <select
                      value={eq.condition}
                      onChange={(e) => updateEquipmentStatus(eq.id, eq.status, e.target.value as EquipmentCondition)}
                      className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Calibration">Needs Calibration</option>
                      <option value="Faulty">Faulty</option>
                    </select>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Calibration Records */}
      {activeTab === 'calibration' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Calibration History & Certification Log</h3>
              <p className="text-xs text-slate-400">NIST & ISO/IEC 17025 compliant calibration records</p>
            </div>
            <button
              onClick={onOpenCalibrationModal}
              className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
            >
              + Record Calibration
            </button>
          </div>

          <div className="space-y-3">
            {calibrations.map(c => (
              <div key={c.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{c.equipmentName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.result === 'Passed' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'
                  }`}>
                    {c.result}
                  </span>
                </div>
                <p className="text-slate-300">
                  <strong>Agency / Inspector:</strong> {c.agency} ({c.technicianName})
                </p>
                <p className="text-slate-400">Certificate No: <span className="font-mono text-indigo-300">{c.certificateNumber}</span></p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Calibrated: {c.calibrationDate}</span>
                  <span className="text-amber-400 font-bold">Next Due: {c.nextDueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Lab Safety Audits */}
      {activeTab === 'safety' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lab Safety & Inspection History</h3>
              <p className="text-xs text-slate-400">Safety checklists, fire extinguishers, emergency stops, PPE</p>
            </div>
            <button
              onClick={onOpenSafetyCheckModal}
              className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
            >
              + New Safety Inspection
            </button>
          </div>

          <div className="space-y-3">
            {safetyChecklists.map(s => (
              <div key={s.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{s.labName}</span>
                  <span className="text-emerald-400 font-mono font-bold">Passed Audit ({s.date})</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fire Extinguishers
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> First Aid Stocked
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Emergency Stop Button
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PPE Gear Available
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ventilation OK
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Waste Disposed
                  </div>
                </div>

                <p className="text-slate-400 text-[11px]">Inspector Notes: {s.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
