import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceSchedule, Equipment } from '../../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Wrench, 
  Search,
  CalendarCheck,
  Sparkles,
  Clock3
} from 'lucide-react';

interface MaintenancePlannerProps {
  onOpenCalibrationModal?: () => void;
}

export const MaintenancePlanner: React.FC<MaintenancePlannerProps> = ({ onOpenCalibrationModal }) => {
  const { 
    equipment, 
    schedules, 
    tickets, 
    scheduleMaintenance, 
    updateScheduleStatus, 
    currentRole 
  } = useApp();

  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [technicianName, setTechnicianName] = useState<string>('Dave Lawson');
  const [description, setDescription] = useState<string>('');
  const [maintType, setMaintType] = useState<'Preventive' | 'Calibration Check' | 'Routine Servicing'>('Preventive');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(2.0);
  const [estimatedCost, setEstimatedCost] = useState<number>(150);

  const [activeSubTab, setActiveSubTab] = useState<'scheduler' | 'calibrations' | 'reminders'>('scheduler');
  const [maintSearch, setMaintSearch] = useState<string>('');

  const todayStr = '2026-08-05';
  const today = new Date(todayStr);

  // Compute metrics
  const upcomingSchedules = schedules.filter(s => s.status === 'Scheduled');
  const completedSchedules = schedules.filter(s => s.status === 'Completed');
  
  const totalDowntimeHours = upcomingSchedules.reduce((acc, s) => acc + s.estimatedDurationHours, 0);
  const totalPlannedCost = upcomingSchedules.reduce((acc, s) => acc + s.estimatedCost, 0);
  const totalActualCost = tickets.reduce((acc, t) => acc + (t.repairCost || 0), 0);

  // Calibration calculations
  const calibrationList = equipment.map(eq => {
    if (!eq.nextCalibrationDueDate) {
      return { eq, status: 'Compliant' as const, daysLeft: 180 };
    }
    const dueDate = new Date(eq.nextCalibrationDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status: 'Overdue' | 'Due Soon' | 'Compliant' = 'Compliant';
    if (diffDays < 0) status = 'Overdue';
    else if (diffDays <= 15) status = 'Due Soon';

    return { eq, status, daysLeft: diffDays };
  });

  const overdueCount = calibrationList.filter(c => c.status === 'Overdue').length;
  const dueSoonCount = calibrationList.filter(c => c.status === 'Due Soon').length;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipment.find(item => item.id === selectedEqId);
    if (!eq || !scheduledDate) return;

    await scheduleMaintenance({
      equipmentId: eq.id,
      equipmentName: eq.name,
      labId: eq.labId,
      labName: eq.labName,
      scheduledDate,
      scheduledTime,
      technicianName,
      description,
      type: maintType,
      estimatedDurationHours: Number(estimatedDuration),
      estimatedCost: Number(estimatedCost)
    });

    // Reset fields
    setScheduledDate('');
    setDescription('');
  };

  const handleQuickCalibrationSchedule = (eq: Equipment) => {
    setSelectedEqId(eq.id);
    setMaintType('Calibration Check');
    setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
    setDescription(`Scheduled recalibration check to clear calibration warnings.`);
    setEstimatedCost(100);
    setEstimatedDuration(1.5);
    setActiveSubTab('scheduler');
  };

  // Filtered schedules list
  const filteredSchedules = schedules.filter(s => 
    s.equipmentName.toLowerCase().includes(maintSearch.toLowerCase()) ||
    s.technicianName.toLowerCase().includes(maintSearch.toLowerCase()) ||
    s.type.toLowerCase().includes(maintSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Dynamic Alert Alarms at the top */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3.5 animate-pulse text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300 block uppercase tracking-wider text-[10px]">
              CRITICAL CALIBRATION WARNING SYSTEM
            </span>
            <p className="text-slate-300">
              There are <strong className="text-rose-400 font-mono">{overdueCount} devices with expired calibration</strong> and{' '}
              <strong className="text-amber-400 font-mono">{dueSoonCount} devices near expiration</strong>. ISO/IEC 17025 compliance is currently flagged as **DEGRADED**. Please schedule calibrations immediately.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled Downtime</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1 font-mono">{totalDowntimeHours} Hours</h3>
            <p className="text-[10px] text-slate-500 mt-1">Across all upcoming maintenance</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Clock3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Planned Maintenance Cost</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">${totalPlannedCost}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Budgeted for scheduled checks</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actual Repair Cost</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1 font-mono">${totalActualCost}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Logged from resolved tickets</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overdue Calibration</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1 font-mono">{overdueCount} Expired</h3>
            <p className="text-[10px] text-amber-400 mt-1">Requires immediate compliance checks</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-700 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('scheduler')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'scheduler'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Maintenance Scheduler ({upcomingSchedules.length} Scheduled)
        </button>
        <button
          onClick={() => setActiveSubTab('calibrations')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'calibrations'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Calibration Status Board ({equipment.length} Devices)
        </button>
        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'reminders'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overdue & Warning Alerts ({overdueCount + dueSoonCount})
        </button>
      </div>

      {/* Tab 1: Scheduler Panel */}
      {activeSubTab === 'scheduler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scheduling List */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Planned Maintenance Schedules</h3>
                <p className="text-xs text-slate-400">Chronological list of all planned and completed maintenance work</p>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={maintSearch}
                  onChange={(e) => setMaintSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredSchedules.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No maintenance schedules found matching your query.
                </div>
              ) : (
                filteredSchedules.map(sch => {
                  const isCompleted = sch.status === 'Completed';
                  const isCancelled = sch.status === 'Cancelled';
                  
                  return (
                    <div 
                      key={sch.id} 
                      className={`p-4 bg-slate-900/80 border rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isCompleted ? 'border-emerald-500/20 bg-slate-900/40 opacity-75' :
                        isCancelled ? 'border-slate-800/80 opacity-50' : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{sch.equipmentName}</span>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                            sch.type === 'Calibration Check' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                            sch.type === 'Preventive' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {sch.type}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            isCompleted ? 'bg-emerald-900/30 text-emerald-400' :
                            isCancelled ? 'bg-slate-800 text-slate-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {sch.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                          <div>Lab: <span className="text-slate-200">{sch.labName}</span></div>
                          <div>Technician: <span className="text-slate-200">{sch.technicianName}</span></div>
                          <div>Estimated Cost: <span className="text-slate-200">${sch.estimatedCost}</span></div>
                          <div>Duration: <span className="text-slate-200">{sch.estimatedDurationHours} Hours</span></div>
                        </div>

                        <div className="text-slate-300 leading-relaxed italic bg-slate-800/50 p-2 rounded border border-slate-800 text-[11px]">
                          "{sch.description}"
                        </div>
                      </div>

                      {/* Schedule action controls */}
                      {sch.status === 'Scheduled' && (
                        <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                          <button
                            onClick={() => updateScheduleStatus(sch.id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                          <button
                            onClick={() => updateScheduleStatus(sch.id, 'Cancelled')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Form to Schedule Maintenance */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 h-fit">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Schedule Maintenance Task
              </h3>
              <p className="text-xs text-slate-400">Book future calibration, inspection, or repairs</p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Equipment:</label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.labName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Scheduled Date:</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Scheduled Time:</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Est. Duration (hrs):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Est. Cost ($):</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Maintenance Type:</label>
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="Preventive">Preventive Maintenance</option>
                  <option value="Calibration Check">Calibration Check</option>
                  <option value="Routine Servicing">Routine Servicing</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assigned Engineer:</label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description / Notes:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Inspect drive motors, verify alignment matrix..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Plus className="w-4 h-4" /> Book Schedule Slot
              </button>

            </form>
          </div>

        </div>
      )}

      {/* Tab 2: Calibration Status Board */}
      {activeSubTab === 'calibrations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Calibration Status Board</h3>
            <p className="text-xs text-slate-400">Monitor instrument calibration status, certificate due dates, and compliance alerts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calibrationList.map(({ eq, status, daysLeft }) => (
              <div 
                key={eq.id} 
                className={`p-4 bg-slate-900 rounded-2xl border text-xs space-y-3 ${
                  status === 'Overdue' ? 'border-rose-500/30 bg-rose-500/[0.02]' :
                  status === 'Due Soon' ? 'border-amber-500/30 bg-amber-500/[0.02]' :
                  'border-slate-700/60'
                }`}
              >
                
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{eq.name}</h4>
                    <p className="text-slate-400 font-mono text-[10px] mt-0.5">Model: {eq.modelNumber} | S/N: {eq.serialNumber}</p>
                    <p className="text-indigo-400 font-medium text-[10px] mt-0.5">Lab: {eq.labName} ({eq.departmentName})</p>
                  </div>

                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    status === 'Overdue' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    status === 'Due Soon' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {status}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 space-y-1.5 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Last Calibration:</span>
                    <span className="text-white font-bold">{eq.lastCalibrationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due Date:</span>
                    <span className="text-white font-bold">{eq.nextCalibrationDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate No:</span>
                    <span className="text-white">{eq.calibrationCertificateNo}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-700/60 font-sans text-xs">
                    <span className="text-slate-400">Time Remaining:</span>
                    <span className={`font-bold ${
                      status === 'Overdue' ? 'text-rose-400' :
                      status === 'Due Soon' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {status === 'Overdue' ? `EXPIRED ${Math.abs(daysLeft)} DAYS AGO` :
                       status === 'Due Soon' ? `Expires in ${daysLeft} days` :
                       `Compliant (${daysLeft} days left)`}
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex justify-end gap-2 pt-1">
                  {status !== 'Compliant' && (
                    <button
                      onClick={() => handleQuickCalibrationSchedule(eq)}
                      className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 cursor-pointer"
                    >
                      Schedule Calibration
                    </button>
                  )}
                  {onOpenCalibrationModal && (
                    <button
                      onClick={onOpenCalibrationModal}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Log Certificate
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 3: Reminders Panel */}
      {activeSubTab === 'reminders' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Calibration & Maintenance Reminders</h3>
            <p className="text-xs text-slate-400">List of critical alerts, warning lists, and pending urgent tasks</p>
          </div>

          <div className="space-y-3">
            {calibrationList.filter(c => c.status !== 'Compliant').map(({ eq, status, daysLeft }) => (
              <div key={eq.id} className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    status === 'Overdue' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{eq.name}</span>
                    <p className="text-[11px] text-slate-400">
                      {status === 'Overdue' 
                        ? `Calibration expired on ${eq.nextCalibrationDueDate} (${Math.abs(daysLeft)} days overdue)`
                        : `Calibration expiring soon on ${eq.nextCalibrationDueDate} (${daysLeft} days remaining)`
                      }
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickCalibrationSchedule(eq)}
                  className="bg-indigo-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                >
                  Schedule Recalibration
                </button>
              </div>
            ))}

            {upcomingSchedules.length === 0 && calibrationList.filter(c => c.status !== 'Compliant').length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-xl">
                No active warnings or reminders. ISO/IEC 17025 compliance is fully certified.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
