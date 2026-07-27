import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services/platformService';
import { maintenanceService } from '../services/maintenanceService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Loader2, AlertTriangle, Plus, X, User, CheckCheck, Play, Ban,
  ClipboardList, GaugeCircle, CalendarClock, BadgeCheck, Timer, FileWarning, Repeat,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { getPrimaryRole } from '../utils/permissions';

const MANAGER_ROLES = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER'];
const STAFF_ROLES = [...MANAGER_ROLES, 'LAB_TECHNICIAN'];

const TYPE_OPTIONS = ['CORRECTIVE', 'PREVENTIVE', 'CALIBRATION', 'INSPECTION'];
const PRIORITY_STYLES = {
  LOW: 'bg-slate-500/10 text-slate-500 border-slate-500/25',
  MEDIUM: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
};
const STATUS_STYLES = {
  OPEN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  ASSIGNED: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
  COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25',
  CANCELLED: 'bg-slate-500/10 text-slate-500 border-slate-500/25',
};

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100';
const labelCls = 'text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1';

const Chip = ({ value, styles }) => (
  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${styles[value] || styles.OPEN || ''}`}>
    {value?.replace('_', ' ')}
  </span>
);

const MaintenancePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const primaryRole = getPrimaryRole(user);
  const isManager = MANAGER_ROLES.includes(primaryRole);
  const isStaff = STAFF_ROLES.includes(primaryRole);
  const isTechnician = primaryRole === 'LAB_TECHNICIAN';

  const [activeTab, setActiveTab] = useState('work-orders'); // work-orders | calibrations | schedules
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [summary, setSummary] = useState({});
  const [requests, setRequests] = useState([]);
  const [calibrations, setCalibrations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  // Modals
  const [requestModal, setRequestModal] = useState(false);
  const [calibrationModal, setCalibrationModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // work order being assigned
  const [completeModal, setCompleteModal] = useState(null); // work order being completed
  const [submitting, setSubmitting] = useState(false);

  const [requestForm, setRequestForm] = useState({
    equipmentId: '', type: 'CORRECTIVE', priority: 'MEDIUM', title: '', description: '', scheduledDate: '',
  });
  const [calibrationForm, setCalibrationForm] = useState({
    equipmentId: '', calibrationDate: '', nextDueDate: '', certificateNumber: '', calibratedBy: '', remarks: '',
  });
  const [scheduleForm, setScheduleForm] = useState({
    equipmentId: '', maintenanceType: 'PREVENTIVE', intervalDays: 90, nextDueDate: '', notes: '',
  });
  const [assignTechId, setAssignTechId] = useState('');
  const [completeForm, setCompleteForm] = useState({ resolutionNotes: '', cost: '' });

  const [dialog, setDialog] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [sum, reqs, cals] = await Promise.all([
        maintenanceService.getSummary(),
        maintenanceService.getRequests(),
        maintenanceService.getCalibrations(),
      ]);
      setSummary(sum || {});
      setRequests(reqs || []);
      setCalibrations(cals || []);
      if (isStaff) {
        maintenanceService.getSchedules().then((s) => setSchedules(s || [])).catch(() => {});
      }
      if (isManager) {
        maintenanceService.getTechnicians().then((t) => setTechnicians(t || [])).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch maintenance records. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [isStaff, isManager]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    platformService.getEquipment({ page: 0, size: 100 })
      .then((res) => setEquipmentList(res.content || []))
      .catch(() => {});
  }, []);

  // ---------- Actions ----------
  const submitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.equipmentId) return toast.error('Select the equipment.');
    setSubmitting(true);
    try {
      await maintenanceService.createRequest({
        ...requestForm,
        equipmentId: Number(requestForm.equipmentId),
        scheduledDate: requestForm.scheduledDate || null,
      });
      toast.success('Maintenance request submitted.');
      setRequestModal(false);
      setRequestForm({ equipmentId: '', type: 'CORRECTIVE', priority: 'MEDIUM', title: '', description: '', scheduledDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCalibration = async (e) => {
    e.preventDefault();
    if (!calibrationForm.equipmentId) return toast.error('Select the equipment.');
    setSubmitting(true);
    try {
      await maintenanceService.addCalibration({
        ...calibrationForm,
        equipmentId: Number(calibrationForm.equipmentId),
      });
      toast.success('Calibration record added.');
      setCalibrationModal(false);
      setCalibrationForm({ equipmentId: '', calibrationDate: '', nextDueDate: '', certificateNumber: '', calibratedBy: '', remarks: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add calibration.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.equipmentId) return toast.error('Select the equipment.');
    setSubmitting(true);
    try {
      await maintenanceService.createSchedule({
        ...scheduleForm,
        equipmentId: Number(scheduleForm.equipmentId),
        intervalDays: Number(scheduleForm.intervalDays),
      });
      toast.success('Preventive schedule created — work orders will auto-generate when due.');
      setScheduleModal(false);
      setScheduleForm({ equipmentId: '', maintenanceType: 'PREVENTIVE', intervalDays: 90, nextDueDate: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAssign = async () => {
    if (!assignTechId) return toast.error('Select a technician.');
    setSubmitting(true);
    try {
      await maintenanceService.assign(assignModal.requestId, Number(assignTechId));
      toast.success('Work order assigned — the technician has been notified.');
      setAssignModal(null);
      setAssignTechId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitComplete = async () => {
    setSubmitting(true);
    try {
      await maintenanceService.updateStatus(
        completeModal.requestId, 'COMPLETED', completeForm.resolutionNotes, completeForm.cost);
      toast.success('Work order completed — equipment is available again.');
      setCompleteModal(null);
      setCompleteForm({ resolutionNotes: '', cost: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Completion failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusAction = (req, status, successMsg) => async () => {
    await maintenanceService.updateStatus(req.requestId, status, null, null);
    toast.success(successMsg);
    fetchData();
  };

  const runDialog = async () => {
    if (!dialog?.onConfirm) return;
    setDialogLoading(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setDialogLoading(false);
    }
  };

  // ---------- Row actions per role/status ----------
  const workOrderActions = (req) => {
    const buttons = [];
    const canOperate = isManager || (isTechnician && req.assignedToId === user?.userId);

    if (req.status === 'OPEN' && isManager) {
      buttons.push(
        <button key="assign" onClick={() => { setAssignModal(req); setAssignTechId(''); }}
          className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-1">
          <User className="h-3 w-3" /> Assign
        </button>
      );
    }
    if (['OPEN', 'ASSIGNED'].includes(req.status) && canOperate) {
      buttons.push(
        <button key="start"
          onClick={() => setDialog({
            title: 'Start maintenance?',
            message: `${req.equipmentName} will be marked UNDER MAINTENANCE and unavailable for booking.`,
            confirmLabel: 'Start Work', danger: false,
            onConfirm: statusAction(req, 'IN_PROGRESS', 'Work started — equipment marked under maintenance.'),
          })}
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1">
          <Play className="h-3 w-3" /> Start
        </button>
      );
    }
    if (req.status === 'IN_PROGRESS' && canOperate) {
      buttons.push(
        <button key="complete" onClick={() => { setCompleteModal(req); setCompleteForm({ resolutionNotes: '', cost: '' }); }}
          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1">
          <CheckCheck className="h-3 w-3" /> Complete
        </button>
      );
    }
    if (['OPEN', 'ASSIGNED'].includes(req.status) && isManager) {
      buttons.push(
        <button key="cancel"
          onClick={() => setDialog({
            title: 'Cancel work order?',
            message: `Cancel work order #${req.requestId} for ${req.equipmentName}.`,
            confirmLabel: 'Cancel Order', danger: true,
            onConfirm: statusAction(req, 'CANCELLED', 'Work order cancelled.'),
          })}
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
          <Ban className="h-3 w-3" /> Cancel
        </button>
      );
    }
    return buttons;
  };

  // ---------- Small building blocks ----------
  const statCard = (Icon, label, value, accent = 'text-primary') => (
    <div className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 my-0">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 dark:text-white my-0">{value ?? '—'}</p>
      </div>
    </div>
  );

  const tabBtn = (key, label) => (
    <button onClick={() => setActiveTab(key)}
      className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        activeTab === key
          ? 'border-primary text-primary dark:text-blue-400 font-bold'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}>
      {label}
    </button>
  );

  const modalShell = (open, title, onClose, children) => (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
            onClick={submitting ? undefined : onClose} className="fixed inset-0 z-[60] bg-black" />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-md p-6 pointer-events-auto max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white my-0 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" /> {title}
                </h3>
                <button onClick={onClose} disabled={submitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  const equipmentSelect = (value, onChange) => (
    <select required value={value} onChange={onChange} className={inputCls}>
      <option value="">Select equipment...</option>
      {equipmentList.map((eq) => (
        <option key={eq.equipmentId} value={eq.equipmentId}>
          {eq.equipmentName} ({eq.equipmentCode})
        </option>
      ))}
    </select>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-3">
              <Wrench className="h-7 w-7 text-primary" /> Maintenance & Calibration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Work orders, preventive schedules, calibration certificates and downtime tracking.
            </p>
          </div>
          <div className="flex gap-2">
            {isStaff && (
              <button onClick={() => setCalibrationModal(true)}
                className="px-4 py-2.5 border border-primary/25 text-primary bg-primary/5 font-bold text-xs rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" /> Add Calibration
              </button>
            )}
            <button onClick={() => setRequestModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Report Issue
            </button>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCard(ClipboardList, 'Open', summary.open, 'text-amber-500')}
          {statCard(User, 'Assigned', summary.assigned, 'text-indigo-500')}
          {statCard(GaugeCircle, 'In Progress', summary.inProgress, 'text-blue-500')}
          {statCard(CheckCheck, 'Completed (30d)', summary.completedLast30, 'text-emerald-500')}
          {statCard(Timer, 'Downtime hrs (30d)', summary.downtimeHoursLast30, 'text-orange-500')}
          {statCard(FileWarning, 'Overdue Calibrations', summary.overdueCalibrations, 'text-red-500')}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          {tabBtn('work-orders', 'Work Orders')}
          {tabBtn('calibrations', 'Calibrations')}
          {isStaff && tabBtn('schedules', 'Preventive Schedules')}
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Loading maintenance data...</span>
          </div>
        ) : errorMsg ? (
          <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{errorMsg}</span>
          </div>
        ) : activeTab === 'work-orders' ? (
          requests.length === 0 ? (
            <div className="glass-card dark:glass-card-dark p-12 rounded-2xl text-center text-slate-500 text-sm">
              No work orders yet. Use "Report Issue" to raise the first one.
            </div>
          ) : (
            <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="p-4">#</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4">Issue</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Assigned To</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Downtime</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                    {requests.map((req) => (
                      <tr key={req.requestId} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-4 font-mono text-slate-400">#{req.requestId}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-white block">{req.equipmentName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{req.equipmentCode}</span>
                        </td>
                        <td className="p-4 max-w-[220px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate" title={req.title}>{req.title}</span>
                          <span className="text-[10px] text-slate-400">by {req.requestedByName} · {req.scheduledDate || req.createdAt?.substring(0, 10)}</span>
                        </td>
                        <td className="p-4"><span className="text-[10px] font-bold text-slate-500">{req.type}</span></td>
                        <td className="p-4"><Chip value={req.priority} styles={PRIORITY_STYLES} /></td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{req.assignedToName || '—'}</td>
                        <td className="p-4"><Chip value={req.status} styles={STATUS_STYLES} /></td>
                        <td className="p-4 text-slate-500">
                          {req.downtimeMinutes != null ? `${Math.round(req.downtimeMinutes / 6) / 10} h` : '—'}
                        </td>
                        <td className="p-4"><div className="flex flex-wrap gap-1.5">{workOrderActions(req)}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : activeTab === 'calibrations' ? (
          calibrations.length === 0 ? (
            <div className="glass-card dark:glass-card-dark p-12 rounded-2xl text-center text-slate-500 text-sm">
              No calibration records yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {calibrations.map((cal) => {
                const overdue = cal.daysUntilDue < 0;
                const expiringSoon = cal.daysUntilDue >= 0 && cal.daysUntilDue <= 30;
                return (
                  <div key={cal.calibrationId}
                    className={`glass-card dark:glass-card-dark rounded-2xl p-4 border ${
                      overdue ? 'border-red-500/40' : expiringSoon ? 'border-amber-500/40' : 'border-slate-200/50 dark:border-slate-800/50'
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white my-0">{cal.equipmentName}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{cal.equipmentCode}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${
                        overdue ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25'
                        : expiringSoon ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                        : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                      }`}>
                        {overdue ? `OVERDUE ${-cal.daysUntilDue}d` : `${cal.daysUntilDue}d left`}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 space-y-1 text-[11px] text-slate-500">
                      <p>Calibrated: <span className="font-semibold text-slate-700 dark:text-slate-300">{cal.calibrationDate}</span></p>
                      <p>Next due: <span className="font-semibold text-slate-700 dark:text-slate-300">{cal.nextDueDate}</span></p>
                      {cal.certificateNumber && <p>Certificate: <span className="font-mono">{cal.certificateNumber}</span></p>}
                      {cal.calibratedBy && <p>By: {cal.calibratedBy}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Preventive schedules */
          <div className="space-y-4">
            {isManager && (
              <button onClick={() => setScheduleModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" /> New Preventive Schedule
              </button>
            )}
            {schedules.length === 0 ? (
              <div className="glass-card dark:glass-card-dark p-12 rounded-2xl text-center text-slate-500 text-sm">
                No preventive schedules. Create one to auto-generate work orders when maintenance is due.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedules.map((s) => (
                  <div key={s.scheduleId} className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        s.active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <Repeat className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate my-0">
                          {s.equipmentName}
                          <span className="ml-2 text-[10px] font-bold uppercase text-primary">{s.maintenanceType}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Every {s.intervalDays} days · next due <span className="font-bold">{s.nextDueDate}</span>
                          {s.lastGeneratedDate && <span className="text-slate-400"> · last generated {s.lastGeneratedDate}</span>}
                        </p>
                      </div>
                    </div>
                    {isManager && (
                      <button
                        onClick={async () => {
                          try {
                            await maintenanceService.toggleSchedule(s.scheduleId);
                            fetchData();
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Toggle failed');
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors shrink-0 ${
                          s.active
                            ? 'border-amber-500/25 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10'
                            : 'border-green-500/25 text-green-600 bg-green-500/5 hover:bg-green-500/10'
                        }`}>
                        {s.active ? 'Pause' : 'Resume'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------- Modals ---------- */}
        {modalShell(requestModal, 'Report Maintenance Issue', () => setRequestModal(false), (
          <form onSubmit={submitRequest} className="space-y-4">
            <div><label className={labelCls}>Equipment *</label>
              {equipmentSelect(requestForm.equipmentId, (e) => setRequestForm((f) => ({ ...f, equipmentId: e.target.value })))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Type *</label>
                <select value={requestForm.type} onChange={(e) => setRequestForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Priority</label>
                <select value={requestForm.priority} onChange={(e) => setRequestForm((f) => ({ ...f, priority: e.target.value }))} className={inputCls}>
                  {Object.keys(PRIORITY_STYLES).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Title *</label>
              <input required maxLength={150} value={requestForm.title}
                onChange={(e) => setRequestForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Spindle vibration above tolerance" className={inputCls} />
            </div>
            <div><label className={labelCls}>Description</label>
              <textarea rows={3} maxLength={1000} value={requestForm.description}
                onChange={(e) => setRequestForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Symptoms, error codes, when it started..." className={`${inputCls} resize-none`} />
            </div>
            <div><label className={labelCls}>Scheduled Date (optional)</label>
              <input type="date" value={requestForm.scheduledDate}
                onChange={(e) => setRequestForm((f) => ({ ...f, scheduledDate: e.target.value }))} className={inputCls} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-1.5 disabled:opacity-60">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Submit Request
            </button>
          </form>
        ))}

        {modalShell(calibrationModal, 'Add Calibration Record', () => setCalibrationModal(false), (
          <form onSubmit={submitCalibration} className="space-y-4">
            <div><label className={labelCls}>Equipment *</label>
              {equipmentSelect(calibrationForm.equipmentId, (e) => setCalibrationForm((f) => ({ ...f, equipmentId: e.target.value })))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Calibration Date *</label>
                <input type="date" required value={calibrationForm.calibrationDate}
                  onChange={(e) => setCalibrationForm((f) => ({ ...f, calibrationDate: e.target.value }))} className={inputCls} />
              </div>
              <div><label className={labelCls}>Next Due Date *</label>
                <input type="date" required value={calibrationForm.nextDueDate}
                  onChange={(e) => setCalibrationForm((f) => ({ ...f, nextDueDate: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Certificate No.</label>
                <input maxLength={100} value={calibrationForm.certificateNumber}
                  onChange={(e) => setCalibrationForm((f) => ({ ...f, certificateNumber: e.target.value }))}
                  placeholder="CAL-2026-1234" className={inputCls} />
              </div>
              <div><label className={labelCls}>Calibrated By</label>
                <input maxLength={150} value={calibrationForm.calibratedBy}
                  onChange={(e) => setCalibrationForm((f) => ({ ...f, calibratedBy: e.target.value }))}
                  placeholder="Agency / technician" className={inputCls} />
              </div>
            </div>
            <div><label className={labelCls}>Remarks</label>
              <textarea rows={2} maxLength={500} value={calibrationForm.remarks}
                onChange={(e) => setCalibrationForm((f) => ({ ...f, remarks: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-1.5 disabled:opacity-60">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />} Save Record
            </button>
          </form>
        ))}

        {modalShell(scheduleModal, 'New Preventive Schedule', () => setScheduleModal(false), (
          <form onSubmit={submitSchedule} className="space-y-4">
            <div><label className={labelCls}>Equipment *</label>
              {equipmentSelect(scheduleForm.equipmentId, (e) => setScheduleForm((f) => ({ ...f, equipmentId: e.target.value })))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Type *</label>
                <select value={scheduleForm.maintenanceType}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, maintenanceType: e.target.value }))} className={inputCls}>
                  <option value="PREVENTIVE">PREVENTIVE</option>
                  <option value="CALIBRATION">CALIBRATION</option>
                  <option value="INSPECTION">INSPECTION</option>
                </select>
              </div>
              <div><label className={labelCls}>Every N days *</label>
                <input type="number" min="1" required value={scheduleForm.intervalDays}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, intervalDays: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div><label className={labelCls}>First Due Date *</label>
              <input type="date" required value={scheduleForm.nextDueDate}
                onChange={(e) => setScheduleForm((f) => ({ ...f, nextDueDate: e.target.value }))} className={inputCls} />
            </div>
            <div><label className={labelCls}>Notes</label>
              <textarea rows={2} maxLength={500} value={scheduleForm.notes}
                onChange={(e) => setScheduleForm((f) => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-1.5 disabled:opacity-60">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarClock className="h-3.5 w-3.5" />} Create Schedule
            </button>
          </form>
        ))}

        {modalShell(!!assignModal, `Assign Work Order #${assignModal?.requestId ?? ''}`, () => setAssignModal(null), (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {assignModal?.equipmentName}: <span className="font-semibold">{assignModal?.title}</span>
            </p>
            <div><label className={labelCls}>Lab Technician *</label>
              <select value={assignTechId} onChange={(e) => setAssignTechId(e.target.value)} className={inputCls}>
                <option value="">Select technician...</option>
                {technicians.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.fullName} ({t.activeTaskCount} active task{t.activeTaskCount === 1 ? '' : 's'})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={submitAssign} disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center gap-1.5 disabled:opacity-60">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <User className="h-3.5 w-3.5" />} Assign & Notify
            </button>
          </div>
        ))}

        {modalShell(!!completeModal, `Complete Work Order #${completeModal?.requestId ?? ''}`, () => setCompleteModal(null), (
          <div className="space-y-4">
            <div><label className={labelCls}>Resolution Notes</label>
              <textarea rows={3} maxLength={1000} value={completeForm.resolutionNotes}
                onChange={(e) => setCompleteForm((f) => ({ ...f, resolutionNotes: e.target.value }))}
                placeholder="What was done, parts replaced..." className={`${inputCls} resize-none`} />
            </div>
            <div><label className={labelCls}>Maintenance Cost (₹, optional)</label>
              <input type="number" min="0" step="0.01" value={completeForm.cost}
                onChange={(e) => setCompleteForm((f) => ({ ...f, cost: e.target.value }))}
                placeholder="e.g. 2500" className={inputCls} />
            </div>
            <button onClick={submitComplete} disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1.5 disabled:opacity-60">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />} Complete & Release Equipment
            </button>
          </div>
        ))}

        <ConfirmDialog
          open={!!dialog}
          title={dialog?.title}
          message={dialog?.message}
          confirmLabel={dialog?.confirmLabel}
          danger={dialog?.danger}
          loading={dialogLoading}
          onConfirm={runDialog}
          onCancel={() => setDialog(null)}
        />
      </div>
    </PageTransition>
  );
};

export default MaintenancePage;
