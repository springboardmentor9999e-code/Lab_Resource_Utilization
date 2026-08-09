import { Ban, CalendarPlus, CheckCircle2, Filter, Search, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import {
  canApproveOrRejectBookings,
  canCancelBooking,
  canCreateBooking,
} from '../auth/permissions.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../services/apiError.js';
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getBookingsForUser,
  rejectBooking,
} from '../services/bookingService.js';
import { getEquipment } from '../services/equipmentService.js';
import {
  BOOKING_STATUSES,
  formatBookingRequester,
  formatDate,
  formatEnumLabel,
  formatTime,
  toLocalDateTime,
} from '../utils/display.js';

const initialForm = {
  equipmentId: '',
  quantity: '1',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
};

export default function Bookings() {
  const { currentUser, draftBooking, searchQuery, setDraftBooking } = useOutletContext();
  const canCreateBookingsForRole = canCreateBooking(currentUser);
  const canApproveOrReject = canApproveOrRejectBookings(currentUser);
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [queueQuery, setQueueQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionBookingId, setActionBookingId] = useState(null);
  const [pageError, setPageError] = useState('');

  const refreshBookings = useCallback(async () => {
    const [equipmentData, bookingData] = await Promise.all([
      getEquipment(),
      getBookingsForUser(currentUser),
    ]);

    setEquipment(equipmentData);
    setBookings(bookingData);
    setForm((current) => {
      if (current.equipmentId || equipmentData.length === 0) {
        return current;
      }

      return { ...current, equipmentId: String(equipmentData[0].id) };
    });
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      setIsLoading(true);
      setPageError('');

      try {
        await refreshBookings();
      } catch (requestError) {
        if (isMounted) {
          setPageError(getApiErrorMessage(requestError, 'Unable to load bookings.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [refreshBookings]);

  useEffect(() => {
    if (!draftBooking) {
      return;
    }

    setForm((current) => ({
      ...current,
      equipmentId: draftBooking.equipmentId ? String(draftBooking.equipmentId) : current.equipmentId,
      date: draftBooking.date ?? current.date,
    }));
    setDraftBooking(null);
  }, [draftBooking, setDraftBooking]);

  const filteredBookings = useMemo(() => {
    const localQuery = queueQuery.trim().toLowerCase();
    const globalQuery = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const searchableText = [
        booking.id,
        booking.equipmentName,
        formatBookingRequester(booking),
        booking.userEmail,
        booking.quantity,
        booking.purpose,
        booking.status,
        booking.rejectionReason,
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        (!localQuery || searchableText.includes(localQuery)) &&
        (!globalQuery || searchableText.includes(globalQuery));
      const matchesStatus = !statusFilter || booking.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [bookings, queueQuery, searchQuery, statusFilter]);

  function updateField(field, value) {
    setFormError('');
    setFormSuccess('');
    setActionMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (!form.equipmentId || !form.date || !form.startTime || !form.endTime || !form.purpose.trim()) {
      setFormError('Complete the equipment, date, time, and purpose fields.');
      return;
    }

    if (form.startTime >= form.endTime) {
      setFormError('End time must be after the start time.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await createBooking({
        equipmentId: Number(form.equipmentId),
        quantity: Number(form.quantity),
        startTime: toLocalDateTime(form.date, form.startTime),
        endTime: toLocalDateTime(form.date, form.endTime),
        purpose: form.purpose.trim(),
      });
      await refreshBookings();
      setFormSuccess('Booking request submitted.');
      setForm((current) => ({
        ...initialForm,
        equipmentId: current.equipmentId,
      }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Unable to create booking.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runBookingAction(booking, action) {
    setActionMessage('');

    let request;

    if (action === 'approve') {
      request = approveBooking(booking.id);
    } else if (action === 'cancel') {
      request = cancelBooking(booking.id);
    } else {
      const rejectionReason = window.prompt('Rejection reason');

      if (rejectionReason === null) {
        return;
      }

      if (!rejectionReason.trim()) {
        setActionMessage('Rejection reason is required.');
        return;
      }

      request = rejectBooking(booking.id, rejectionReason.trim());
    }

    setActionBookingId(`${action}-${booking.id}`);

    try {
      const updatedBooking = await request;
      setBookings((current) =>
        current.map((item) => (item.id === updatedBooking.id ? updatedBooking : item)),
      );
      setActionMessage('Booking updated.');
    } catch (requestError) {
      setActionMessage(getApiErrorMessage(requestError, 'Unable to update booking.'));
    } finally {
      setActionBookingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading bookings...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {pageError}
      </div>
    );
  }

  return (
    <div className={canCreateBookingsForRole ? 'grid gap-6 xl:grid-cols-[380px_1fr]' : 'space-y-6'}>
      {canCreateBookingsForRole ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Create booking request</h3>

        <form className="mt-5 space-y-4" onSubmit={submitBooking}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Equipment</span>
            <select
              className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
              onChange={(event) => updateField('equipmentId', event.target.value)}
              value={form.equipmentId}
            >
              {equipment.length === 0 ? (
                <option value="">No equipment available</option>
              ) : null}
              {equipment.map((item) => (
                <option
                  key={item.id}
                  disabled={item.status === 'MAINTENANCE' || item.status === 'OUT_OF_SERVICE'}
                  value={item.id}
                >
                  {item.name} ({item.availableQuantity} of {item.quantity} available)
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Quantity</span>
            <input
              className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
              min="1"
              onChange={(event) => updateField('quantity', event.target.value)}
              type="number"
              value={form.quantity}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Purpose</span>
            <textarea
              className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              onChange={(event) => updateField('purpose', event.target.value)}
              placeholder="PCR sample analysis"
              value={form.purpose}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Date</span>
            <input
              className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
              onChange={(event) => updateField('date', event.target.value)}
              type="date"
              value={form.date}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Start</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('startTime', event.target.value)}
                type="time"
                value={form.startTime}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">End</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('endTime', event.target.value)}
                type="time"
                value={form.endTime}
              />
            </label>
          </div>

          {formError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {formError}
            </p>
          ) : null}

          {formSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {formSuccess}
            </p>
          ) : null}

          <button
            className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSubmitting || equipment.length === 0}
            type="submit"
          >
            <CalendarPlus className="h-4 w-4" />
            {isSubmitting ? 'Submitting' : 'Submit request'}
          </button>
        </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-950">Booking queue</h3>
          <p className="mt-1 text-sm text-slate-500">Requests are loaded from the backend approval workflow.</p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Search booking queue</span>
              <input
                className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
                onChange={(event) => setQueueQuery(event.target.value)}
                placeholder="Search queue"
                type="search"
                value={queueQuery}
              />
            </label>

            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Filter booking status</span>
              <select
                className="focus-ring h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="">All statuses</option>
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {actionMessage ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {actionMessage}
            </p>
          ) : null}
        </div>

        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Booking</th>
                  <th className="px-5 py-3 font-semibold">Requester</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const canApproveOrRejectBooking = canApproveOrReject && booking.status === 'PENDING';
                  const canCancel = canCancelBooking(booking, currentUser);
                  const hasActions = canApproveOrRejectBooking || canCancel;

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{booking.equipmentName}</p>
                        <p className="mt-1 text-xs text-slate-500">#{booking.id} · Qty {booking.quantity}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatBookingRequester(booking)}
                        <span className="block text-xs text-slate-400">{booking.userEmail}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(booking.startTime)}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.status} />
                        {booking.rejectionReason ? (
                          <span className="mt-1 block max-w-44 text-xs text-rose-600">
                            {booking.rejectionReason}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        {hasActions ? (
                          <div className="flex items-center gap-2">
                            {canApproveOrRejectBooking ? (
                              <>
                                <button
                                  aria-label={`Approve booking ${booking.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionBookingId)}
                                  onClick={() => runBookingAction(booking, 'approve')}
                                  title="Approve request"
                                  type="button"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                  aria-label={`Reject booking ${booking.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionBookingId)}
                                  onClick={() => runBookingAction(booking, 'reject')}
                                  title="Reject request"
                                  type="button"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            ) : null}

                            {canCancel ? (
                              <button
                                aria-label={`Cancel booking ${booking.id}`}
                                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={Boolean(actionBookingId)}
                                onClick={() => runBookingAction(booking, 'cancel')}
                                title="Cancel booking"
                                type="button"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">No bookings match the current filters.</div>
        )}
      </section>
    </div>
  );
}
