import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services/platformService';
import { bookingService } from '../services/bookingService';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  Plus,
  Play,
  CheckCheck,
  Ban,
  UserX,
  XCircle,
  CheckCircle,
  Hourglass,
  ListOrdered,
  Trash2,
  History,
  Repeat,
  X,
  ArrowRight,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { getPrimaryRole } from '../utils/permissions';
import BookingStatusBadge from '../components/booking/BookingStatusBadge';

// Calendar event colors per booking status (matches BookingStatusBadge palette)
const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  IN_USE: '#3b82f6',
};

const MANAGER_ROLES = ['SYSTEM_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN'];
// Approve/Reject is a narrower gate than the operational actions
const APPROVER_ROLES = ['SYSTEM_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER'];

const todayStr = () => new Date().toISOString().split('T')[0];

const BookingPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const primaryRole = getPrimaryRole(user);
  const isManager = MANAGER_ROLES.includes(primaryRole);
  const isApprover = APPROVER_ROLES.includes(primaryRole);

  const [activeTab, setActiveTab] = useState('my-bookings'); // 'my-bookings' | 'all-bookings' | 'calendar' | 'waitlist'
  const [bookings, setBookings] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  // Slot-taken flow: the rejected request, plus the optimizer's ranked alternatives
  const [slotTaken, setSlotTaken] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [acceptingSuggestion, setAcceptingSuggestion] = useState(null);
  const [allWaitlist, setAllWaitlist] = useState([]);
  const [mySeries, setMySeries] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // New booking form (repeat: NONE | DAILY | WEEKLY)
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    equipmentId: '',
    bookingDate: todayStr(),
    startTime: '09:00',
    endTime: '11:00',
    repeat: 'NONE',
    repeatUntil: '',
  });

  // Audit trail modal: { booking, entries: [], loading }
  const [historyModal, setHistoryModal] = useState(null);

  // Availability calendar
  const [calEquipmentId, setCalEquipmentId] = useState('');
  const [calEvents, setCalEvents] = useState([]);
  const [calRange, setCalRange] = useState(null); // { from, to }

  // Confirm dialog state: { title, message, confirmLabel, danger, onConfirm }
  const [dialog, setDialog] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [bookingData, myWl, series] = await Promise.all([
        bookingService.getBookings(),
        bookingService.getMyWaitlist(),
        bookingService.getMyRecurring().catch(() => []),
      ]);
      setBookings(bookingData || []);
      setMyWaitlist(myWl || []);
      setMySeries(series || []);
      if (isManager) {
        const allWl = await bookingService.getAllWaitlist();
        setAllWaitlist(allWl || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch records. Please ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Load equipment for the booking form dropdown once
    platformService
      .getEquipment({ page: 0, size: 100 })
      .then((res) => setEquipmentList(res.content || []))
      .catch(() => {});
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    equipmentId: Number(form.equipmentId),
    bookingDate: form.bookingDate,
    startTime: form.startTime + ':00',
    endTime: form.endTime + ':00',
  });

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!form.equipmentId) {
      toast.error('Please select an instrument.');
      return;
    }
    if (form.repeat !== 'NONE' && !form.repeatUntil) {
      toast.error('Choose the "repeat until" date for the recurring series.');
      return;
    }
    setSubmitting(true);
    try {
      if (form.repeat !== 'NONE') {
        const result = await bookingService.createRecurring({
          equipmentId: Number(form.equipmentId),
          frequency: form.repeat,
          startDate: form.bookingDate,
          endDate: form.repeatUntil,
          startTime: form.startTime + ':00',
          endTime: form.endTime + ':00',
        });
        const skipped = result.occurrencesSkipped || 0;
        toast.success(
          `Recurring series created: ${result.occurrencesCreated} booking${result.occurrencesCreated === 1 ? '' : 's'} pending approval` +
          (skipped > 0 ? ` (${skipped} date${skipped === 1 ? '' : 's'} skipped due to conflicts)` : '')
        );
        if (skipped > 0 && result.skippedDates?.length) {
          toast.info(`Skipped dates: ${result.skippedDates.join(', ')}`);
        }
      } else {
        await bookingService.createBooking(buildPayload());
        toast.success('Booking request submitted — pending approval.');
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Booking failed.';
      if (msg.startsWith('SLOT_TAKEN:')) {
        // Rather than only offering the waitlist, ask the optimizer what else would work.
        // Waitlisting means waiting for someone to cancel; a suggestion is bookable right now.
        const humanMsg = msg.replace('SLOT_TAKEN:', '').trim();
        setSlotTaken({
          message: humanMsg,
          equipmentId: Number(form.equipmentId),
          bookingDate: form.bookingDate,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        setSuggestions([]);
        setSuggestionsLoading(true);
        try {
          const found = await bookingService.getSuggestions({
            equipmentId: Number(form.equipmentId),
            date: form.bookingDate,
            startTime: form.startTime + ':00',
            endTime: form.endTime + ':00',
          });
          setSuggestions(found || []);
        } catch {
          // A failed optimizer must not block the waitlist fallback — leave the list empty
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Book one of the optimizer's alternatives directly, without retyping the form
  const acceptSuggestion = async (suggestion) => {
    setAcceptingSuggestion(`${suggestion.equipmentId}-${suggestion.bookingDate}-${suggestion.startTime}`);
    try {
      await bookingService.createBooking({
        equipmentId: suggestion.equipmentId,
        bookingDate: suggestion.bookingDate,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
      });
      toast.success(
        `Booked ${suggestion.equipmentName} on ${suggestion.bookingDate} at ${suggestion.startTime?.substring(0, 5)} — pending approval.`
      );
      setSlotTaken(null);
      setFormOpen(false);
      fetchData();
    } catch (err) {
      // Someone may have taken it between the suggestion and the click
      toast.error(err.response?.data?.message || 'That alternative is no longer available.');
    } finally {
      setAcceptingSuggestion(null);
    }
  };

  const joinWaitlistFromSlotTaken = async () => {
    if (!slotTaken) return;
    try {
      await bookingService.joinWaitlist({
        equipmentId: slotTaken.equipmentId,
        requestedDate: slotTaken.bookingDate,
        startTime: slotTaken.startTime + ':00',
        endTime: slotTaken.endTime + ':00',
      });
      toast.success('You have been added to the waitlist.');
      setSlotTaken(null);
      setFormOpen(false);
      setActiveTab('waitlist');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join the waitlist.');
    }
  };

  // Wraps an async action in the shared ConfirmDialog
  const confirmAction = (title, message, confirmLabel, danger, action) => {
    setDialog({ title, message, confirmLabel, danger, onConfirm: action });
  };

  const runDialogConfirm = async () => {
    if (!dialog?.onConfirm) return;
    setDialogLoading(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Action failed.');
    } finally {
      setDialogLoading(false);
    }
  };

  const updateStatus = (booking, status, successMsg) => async () => {
    await bookingService.updateStatus(booking.bookingId, status);
    toast.success(successMsg);
    fetchData();
  };

  const cancelWaitlistEntry = (entry) => async () => {
    await bookingService.cancelWaitlist(entry.waitlistId);
    toast.success('Waitlist entry cancelled.');
    fetchData();
  };

  const cancelSeries = (series) => async () => {
    await bookingService.cancelRecurring(series.recurringId);
    toast.success('Recurring series and all its active bookings cancelled.');
    fetchData();
  };

  // ---------- Audit trail ----------
  const openHistory = async (booking) => {
    setHistoryModal({ booking, entries: [], loading: true });
    try {
      const entries = await bookingService.getHistory(booking.bookingId);
      setHistoryModal({ booking, entries: entries || [], loading: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load booking history.');
      setHistoryModal(null);
    }
  };

  // ---------- Availability calendar ----------
  const loadCalendar = useCallback(async (from, to, equipmentId) => {
    try {
      const data = await bookingService.getCalendar(from, to, equipmentId || null);
      setCalEvents(
        (data || []).map((b) => ({
          id: String(b.bookingId),
          title: `${b.equipmentName} · ${b.userFullName}`,
          start: `${b.bookingDate}T${b.startTime}`,
          end: `${b.bookingDate}T${b.endTime}`,
          backgroundColor: STATUS_COLORS[b.status] || '#64748b',
          borderColor: 'transparent',
          textColor: '#ffffff',
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not load the availability calendar.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when the equipment filter changes while the calendar is open
  useEffect(() => {
    if (activeTab === 'calendar' && calRange) {
      loadCalendar(calRange.from, calRange.to, calEquipmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calEquipmentId, activeTab]);

  // Per-role action buttons for one booking row
  const renderActions = (booking) => {
    const status = booking.status?.toUpperCase();
    const isOwner = booking.username === user?.username;
    const buttons = [];

    if (status === 'PENDING' && isApprover) {
      buttons.push(
        <button
          key="approve"
          onClick={() =>
            confirmAction(
              'Approve booking?',
              `Confirm the booking of ${booking.equipmentName} for ${booking.userFullName} on ${booking.bookingDate}. The equipment will be marked RESERVED.`,
              'Approve',
              false,
              updateStatus(booking, 'CONFIRMED', 'Booking confirmed.')
            )
          }
          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" /> Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={() =>
            confirmAction(
              'Reject booking?',
              `Reject the booking request of ${booking.equipmentName} by ${booking.userFullName}. The requester will be notified by email.`,
              'Reject',
              true,
              updateStatus(booking, 'REJECTED', 'Booking rejected.')
            )
          }
          className="px-3 py-1.5 border border-red-500/25 text-red-500 bg-red-500/5 text-xs font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" /> Reject
        </button>
      );
    }

    if (status === 'CONFIRMED' && isManager) {
      buttons.push(
        <button
          key="start"
          onClick={() =>
            confirmAction(
              'Start usage session?',
              `Mark ${booking.equipmentName} as IN USE for this booking.`,
              'Start Use',
              false,
              updateStatus(booking, 'IN_USE', 'Usage session started.')
            )
          }
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Play className="h-3 w-3" /> Start Use
        </button>
      );
      buttons.push(
        <button
          key="noshow"
          onClick={() =>
            confirmAction(
              'Mark as no-show?',
              `Mark this booking of ${booking.equipmentName} as NO SHOW. The reserved slot will be released.`,
              'Mark No-Show',
              true,
              updateStatus(booking, 'NO_SHOW', 'Booking marked as no-show.')
            )
          }
          className="px-3 py-1.5 border border-orange-500/25 text-orange-500 bg-orange-500/5 text-xs font-bold rounded-xl hover:bg-orange-500/10 transition-colors flex items-center gap-1"
        >
          <UserX className="h-3 w-3" /> No-Show
        </button>
      );
    }

    if (status === 'IN_USE' && isManager) {
      buttons.push(
        <button
          key="complete"
          onClick={() =>
            confirmAction(
              'Complete booking?',
              `Complete the usage session of ${booking.equipmentName} and release the equipment.`,
              'Complete',
              false,
              updateStatus(booking, 'COMPLETED', 'Booking completed.')
            )
          }
          className="px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <CheckCheck className="h-3 w-3" /> Complete
        </button>
      );
    }

    if ((status === 'PENDING' || status === 'CONFIRMED') && (isOwner || isApprover)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() =>
            confirmAction(
              'Cancel booking?',
              `Cancel this booking of ${booking.equipmentName} on ${booking.bookingDate}. This cannot be undone.`,
              'Cancel Booking',
              true,
              updateStatus(booking, 'CANCELLED', 'Booking cancelled.')
            )
          }
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <Ban className="h-3 w-3" /> Cancel
        </button>
      );
    }

    // Audit trail — owners always, managers for any booking
    if (isOwner || isManager) {
      buttons.push(
        <button
          key="history"
          onClick={() => openHistory(booking)}
          title="View status history"
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <History className="h-3 w-3" /> History
        </button>
      );
    }

    return buttons;
  };

  const myBookings = bookings.filter((b) => b.username === user?.username);
  const shownBookings = activeTab === 'all-bookings' ? bookings : myBookings;

  const tabButton = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        activeTab === key
          ? 'border-primary text-primary dark:text-blue-400 font-bold'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );

  const emptyState = (Icon, title, sub) => (
    <div className="glass-card dark:glass-card-dark p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400">
        <Icon className="h-10 w-10" />
      </div>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );

  const bookingsTable = (list, showRequester) => (
    <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden animate-fadeIn border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200/50 dark:border-slate-800/50">
              <th className="p-4">Instrument / Code</th>
              <th className="p-4">Laboratory</th>
              {showRequester && <th className="p-4">Requested By</th>}
              <th className="p-4">Date</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
            {list.map((booking) => (
              <tr key={booking.bookingId} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10 transition-colors">
                <td className="p-4">
                  <span className="font-bold text-slate-800 dark:text-white block">{booking.equipmentName}</span>
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{booking.equipmentCode}</span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{booking.labName}</td>
                {showRequester && (
                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-white block">{booking.userFullName}</span>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{booking.userRole}</span>
                  </td>
                )}
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{booking.bookingDate}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">{renderActions(booking)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const waitlistCard = (entry, allowCancel) => (
    <motion.div
      key={entry.waitlistId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div className="flex items-start gap-4">
        {entry.position != null ? (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex flex-col items-center justify-center text-white shadow-md shrink-0">
            <span className="text-sm font-extrabold leading-none">#{entry.position}</span>
            <span className="text-[8px] uppercase font-bold">queue</span>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <Hourglass className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white my-0">{entry.equipmentName}</h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-mono text-[10px]">{entry.equipmentCode}</span> · {entry.labName}
            {entry.userFullName && (
              <span className="ml-1.5 text-[10px] text-primary uppercase font-bold tracking-wider">{entry.userFullName}</span>
            )}
          </p>
          <div className="flex gap-4 mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {entry.requestedDate}
            </span>
            {entry.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {entry.startTime?.substring(0, 5)} - {entry.endTime?.substring(0, 5)}
              </span>
            )}
          </div>
          {/* A notified user holds the freed slot only until their claim lapses — show the
              countdown, since after that the slot passes to the next person in the queue */}
          {entry.status === 'NOTIFIED' && entry.offerHoursRemaining != null && (
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                entry.offerHoursRemaining === 0
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : entry.offerHoursRemaining <= 4
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              <Hourglass className="h-3 w-3" />
              {entry.offerHoursRemaining === 0
                ? 'Claim lapsed — the slot is passing to the next in line'
                : `Slot held for you — ${entry.offerHoursRemaining}h left to book it`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
            entry.status === 'NOTIFIED'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
              : entry.status === 'WAITING'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
              : entry.status === 'CONVERTED'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
              : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
          }`}
        >
          {entry.status}
        </span>
        {allowCancel && ['WAITING', 'NOTIFIED'].includes(entry.status) && (
          <button
            onClick={() =>
              confirmAction(
                'Leave waitlist?',
                `Remove this waitlist entry for ${entry.equipmentName} on ${entry.requestedDate}.`,
                'Remove',
                true,
                cancelWaitlistEntry(entry)
              )
            }
            className="px-3 py-1.5 border border-red-500/25 text-red-500 bg-red-500/5 text-xs font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Cancel
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              Booking & Reservation System
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Reserve instrumentation, track booking lifecycle, and manage waitlists.
            </p>
          </div>
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-1.5 w-fit"
          >
            <Plus className="h-3.5 w-3.5" /> New Booking
          </button>
        </div>

        {/* New booking form */}
        {formOpen && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateBooking}
            className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
          >
            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Instrument</label>
              <select
                name="equipmentId"
                required
                value={form.equipmentId}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
              >
                <option value="">Select equipment...</option>
                {equipmentList.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentName} ({eq.equipmentCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
              <input
                type="date"
                name="bookingDate"
                required
                min={todayStr()}
                value={form.bookingDate}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Start</label>
              <input
                type="time"
                name="startTime"
                required
                value={form.startTime}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">End</label>
              <input
                type="time"
                name="endTime"
                required
                value={form.endTime}
                onChange={handleFormChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>

            {/* Recurring controls + submit — second row */}
            <div className="sm:col-span-2 lg:col-span-5 flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="sm:w-48">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Repeat className="h-3 w-3" /> Repeat
                </label>
                <select
                  name="repeat"
                  value={form.repeat}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                >
                  <option value="NONE">Does not repeat</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly (same weekday)</option>
                </select>
              </div>
              {form.repeat !== 'NONE' && (
                <div className="sm:w-48">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Repeat Until</label>
                  <input
                    type="date"
                    name="repeatUntil"
                    min={form.bookingDate}
                    value={form.repeatUntil}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}
              {form.repeat !== 'NONE' && (
                <p className="text-[10px] text-slate-400 flex-1">
                  One booking per occurrence is created (max 60). Dates already booked are skipped and reported.
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all flex items-center gap-1.5 sm:ml-auto"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
                {form.repeat !== 'NONE' ? 'Book Series' : 'Book'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          {tabButton('my-bookings', 'My Bookings')}
          {isManager && tabButton('all-bookings', 'All Bookings')}
          {tabButton('calendar', 'Calendar')}
          {tabButton('waitlist', 'Waitlist')}
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Retrieving schedule lists...</span>
          </div>
        ) : errorMsg ? (
          <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{errorMsg}</span>
          </div>
        ) : activeTab === 'calendar' ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Equipment filter + legend */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <select
                value={calEquipmentId}
                onChange={(e) => setCalEquipmentId(e.target.value)}
                className="sm:w-72 px-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
              >
                <option value="">All equipment</option>
                {equipmentList.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentName} ({eq.equipmentCode})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {Object.entries({ 'Pending Approval': STATUS_COLORS.PENDING, Confirmed: STATUS_COLORS.CONFIRMED, 'In Use': STATUS_COLORS.IN_USE }).map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* FullCalendar availability view */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 booking-calendar">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="21:00:00"
                allDaySlot={false}
                nowIndicator
                events={calEvents}
                datesSet={(arg) => {
                  const from = arg.startStr.slice(0, 10);
                  const to = arg.endStr.slice(0, 10);
                  setCalRange({ from, to });
                  loadCalendar(from, to, calEquipmentId);
                }}
                dateClick={(info) => {
                  setForm((prev) => ({ ...prev, bookingDate: info.dateStr.slice(0, 10) }));
                  setFormOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Tip: click any empty slot to prefill the booking form with that date.
            </p>
          </div>
        ) : activeTab === 'waitlist' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Waitlist Entries</h2>
              {myWaitlist.length === 0
                ? emptyState(Hourglass, 'No waitlist entries', 'When a slot you want is taken, you can join the waitlist from the booking form.')
                : myWaitlist.map((entry) => waitlistCard(entry, true))}
            </div>
            {isManager && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="h-3.5 w-3.5" /> All Active Entries
                </h2>
                {allWaitlist.length === 0
                  ? emptyState(ListOrdered, 'Waitlist is empty', 'No users are currently waiting for equipment slots.')
                  : allWaitlist.map((entry) => waitlistCard(entry, true))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Recurring series (own) */}
            {activeTab === 'my-bookings' && mySeries.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5" /> My Recurring Series
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mySeries.map((s) => (
                    <div
                      key={s.recurringId}
                      className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          s.status === 'ACTIVE'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          <Repeat className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate my-0">
                            {s.equipmentName}
                            <span className="ml-2 text-[10px] font-bold uppercase text-primary">{s.frequency}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {s.startDate} → {s.endDate} · {s.startTime?.substring(0, 5)}-{s.endTime?.substring(0, 5)}
                            {s.occurrencesCreated != null && (
                              <span className="ml-1.5 text-slate-400">
                                ({s.occurrencesCreated} created{s.occurrencesSkipped ? `, ${s.occurrencesSkipped} skipped` : ''})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                        }`}>
                          {s.status}
                        </span>
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() =>
                              confirmAction(
                                'Cancel recurring series?',
                                `Cancel the ${s.frequency.toLowerCase()} series of ${s.equipmentName} and ALL of its remaining active bookings. Waitlisted users will be notified of the freed slots.`,
                                'Cancel Series',
                                true,
                                cancelSeries(s)
                              )
                            }
                            className="px-3 py-1.5 border border-red-500/25 text-red-500 bg-red-500/5 text-xs font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shownBookings.length === 0
              ? emptyState(FileText, 'No bookings on file', 'Use the New Booking button to submit a reservation request.')
              : bookingsTable(shownBookings, activeTab === 'all-bookings')}
          </div>
        )}

        {/* Slot taken — the optimizer's ranked alternatives, with waitlist as the last resort */}
        <AnimatePresence>
          {slotTaken && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                onClick={() => setSlotTaken(null)}
                className="fixed inset-0 z-[80] bg-black"
              />
              <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 18 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                  className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-xl max-h-[85vh] flex flex-col pointer-events-auto"
                >
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0 flex items-center gap-2">
                      <span className="bg-amber-500/10 p-1.5 rounded-lg text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                      That slot is taken
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 mb-0">
                      {slotTaken.message} Here is what the scheduler suggests instead — these are
                      free right now, so you can book one without waiting.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    {suggestionsLoading ? (
                      <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : suggestions.length === 0 ? (
                      <p className="py-8 text-center text-xs font-semibold text-slate-400">
                        No free alternatives found nearby — the waitlist is your best option.
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {suggestions.map((s) => {
                          const key = `${s.equipmentId}-${s.bookingDate}-${s.startTime}`;
                          const busy = acceptingSuggestion === key;
                          return (
                            <li
                              key={key}
                              className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-3.5 hover:border-primary/40 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white my-0 truncate">
                                    {s.equipmentName}
                                    <span className="ml-1.5 font-mono text-[9px] text-slate-400">
                                      {s.equipmentCode}
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-0 flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> {s.bookingDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {s.startTime?.substring(0, 5)}–{s.endTime?.substring(0, 5)}
                                    </span>
                                    {s.labName && <span className="text-slate-400">· {s.labName}</span>}
                                  </p>
                                </div>
                                <button
                                  onClick={() => acceptSuggestion(s)}
                                  disabled={!!acceptingSuggestion}
                                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-2 text-[11px] font-bold text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
                                >
                                  {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Book this
                                </button>
                              </div>
                              {/* Why the optimizer picked it — a ranked list nobody can interrogate
                                  is just a black box */}
                              {s.reasons?.length > 0 && (
                                <ul className="mt-2 space-y-0.5">
                                  {s.reasons.map((r, i) => (
                                    <li
                                      key={i}
                                      className="text-[10px] text-slate-500 dark:text-slate-400 flex gap-1.5"
                                    >
                                      <span className="text-primary">•</span>
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2.5 p-5 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button
                      onClick={() => setSlotTaken(null)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Back to form
                    </button>
                    <button
                      onClick={joinWaitlistFromSlotTaken}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      Join waitlist for the original slot
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Shared confirmation dialog */}
        <ConfirmDialog
          open={!!dialog}
          title={dialog?.title}
          message={dialog?.message}
          confirmLabel={dialog?.confirmLabel}
          danger={dialog?.danger}
          loading={dialogLoading}
          onConfirm={runDialogConfirm}
          onCancel={() => setDialog(null)}
        />

        {/* Booking audit trail modal */}
        <AnimatePresence>
          {historyModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                onClick={() => setHistoryModal(null)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="glass-card dark:glass-card-dark rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto pointer-events-auto shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-start justify-between gap-3 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-t-2xl">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white my-0 flex items-center gap-1.5">
                        <History className="h-4 w-4 text-primary" /> Booking Audit Trail
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {historyModal.booking.equipmentName} · {historyModal.booking.bookingDate} ·{' '}
                        {historyModal.booking.startTime?.substring(0, 5)}-{historyModal.booking.endTime?.substring(0, 5)}
                      </p>
                    </div>
                    <button
                      onClick={() => setHistoryModal(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    {historyModal.loading ? (
                      <div className="h-32 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    ) : historyModal.entries.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No history recorded for this booking (created before the audit trail was enabled).
                      </p>
                    ) : (
                      <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 space-y-5">
                        {historyModal.entries.map((h) => (
                          <li key={h.historyId} className="ml-5">
                            <span className="absolute -left-[7px] h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-slate-950" />
                            <div className="flex items-center gap-2 flex-wrap">
                              {h.oldStatus ? (
                                <>
                                  <BookingStatusBadge status={h.oldStatus} />
                                  <ArrowRight className="h-3 w-3 text-slate-400" />
                                </>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created as</span>
                              )}
                              <BookingStatusBadge status={h.newStatus} />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5">
                              by <span className="font-bold text-slate-700 dark:text-slate-300">{h.changedBy || 'system'}</span>
                              {' · '}
                              {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
                            </p>
                            {h.remarks && (
                              <p className="text-[11px] text-slate-400 italic mt-0.5">{h.remarks}</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default BookingPage;
