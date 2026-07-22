import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can, isSelfServiceRole } from "../auth/permissions";
import { bookingsApi } from "../api/bookings";
import { equipmentApi } from "../api/equipment";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";
import { DocIcon } from "../components/DocIcon";
import { Modal } from "../components/Modal";

const STAFF_STATUS_OPTIONS = ["Confirmed", "In Use", "Completed", "Cancelled", "No Show"];

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const canApprove = can(user?.role, "bookings:approve");
  const selfService = isSelfServiceRole(user?.role);

  function loadData() {
    setLoading(true);
    setError(null);
    return Promise.all([bookingsApi.list(), equipmentApi.list()])
      .then(([b, e]) => {
        setBookings(b);
        setEquipment(e);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load bookings."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  if (loading) return <LoadingState label="Loading bookings…" />;

  return (
    <>
      <PageHeader
        eyebrow="Scheduling"
        title="Bookings"
        description={
          selfService
            ? "Your equipment reservations, past and upcoming."
            : "All bookings across your labs — approve, track, and manage."
        }
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
          >
            + New booking
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} count={bookings.length} />
        {Object.entries(statusCounts).map(([status, count]) => (
          <FilterPill
            key={status}
            label={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            count={count}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "all" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
            description={selfService ? "Reserve equipment to see it here." : "Nothing matches this filter."}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Equipment</th>
                {!selfService && (
                  <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Requested by</th>
                )}
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">When</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Status</th>
                {canApprove && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {filtered.map((b) => (
                <BookingRow
                  key={b.bookingId || b.id}
                  booking={b}
                  selfService={selfService}
                  canApprove={canApprove}
                  onUpdated={(updated) =>
                    setBookings((prev) =>
                      prev.map((x) => ((x.bookingId || x.id) === (updated.bookingId || updated.id) ? updated : x))
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New booking">
        <CreateBookingForm
          equipment={equipment}
          onCreated={(booking) => {
            setBookings((prev) => [booking, ...prev]);
            setCreateOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

function FilterPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink-900)] text-white"
          : "bg-white border border-[var(--color-paper-200)] text-[var(--color-ink-700)] hover:border-[var(--color-brass-500)]"
      }`}
    >
      {label} <span className="opacity-70">· {count}</span>
    </button>
  );
}

function BookingRow({ booking, selfService, canApprove, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const bookingId = booking.bookingId || booking.id;

  async function setStatus(status) {
    setSaving(true);
    try {
      const updated = await bookingsApi.update(bookingId, { status });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">
        <div className="flex items-center gap-2">
          <span>{booking.equipment?.equipmentName || `Equipment #${booking.equipment?.equipmentId ?? "—"}`}</span>
          {booking.equipment?.documentationUrl && (
            <a
              href={booking.equipment.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View equipment documentation"
              className="text-[var(--color-brass-600)] hover:text-[var(--color-brass-500)]"
            >
              <DocIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </td>
      {!selfService && (
        <td className="px-5 py-3 text-[var(--color-ink-600)]">{booking.user?.name || "—"}</td>
      )}
      <td className="px-5 py-3 text-[var(--color-ink-600)]">{formatRange(booking.startTime, booking.endTime)}</td>
      <td className="px-5 py-3">
        <StatusDial status={booking.status} size="sm" />
      </td>
      {canApprove && (
        <td className="px-5 py-3 text-right">
          {booking.status === "Pending Approval" || booking.status === "Waitlisted" ? (
            <div className="flex gap-2 justify-end">
              <button
                disabled={saving}
                onClick={() => setStatus("Confirmed")}
                className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-available-bg)] text-[var(--color-ink-900)] hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                Approve
              </button>
              <button
                disabled={saving}
                onClick={() => setStatus("Cancelled")}
                className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-maintenance-bg)] text-[var(--color-status-maintenance)] hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                Reject
              </button>
            </div>
          ) : (
            <select
              defaultValue=""
              disabled={saving}
              onChange={(e) => e.target.value && setStatus(e.target.value)}
              className="text-xs border border-[var(--color-paper-200)] rounded-md px-2 py-1 disabled:opacity-50"
            >
              <option value="" disabled>
                Update…
              </option>
              {STAFF_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </td>
      )}
    </tr>
  );
}

function CreateBookingForm({ equipment, onCreated }) {
  const [equipmentId, setEquipmentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedEquipment = equipment.find((eq) => String(eq.equipmentId) === String(equipmentId));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const booking = await bookingsApi.create({
        equipment: { equipmentId: Number(equipmentId) },
        bookingDate: startTime ? startTime.slice(0, 10) : undefined, // backend requires this alongside startTime/endTime
        startTime,
        endTime,
      });
      onCreated(booking);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create booking — check the time range and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="equip" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Equipment
        </label>
        <select
          id="equip"
          required
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Select equipment
          </option>
          {equipment.map((eq) => (
            <option key={eq.equipmentId} value={eq.equipmentId}>
              {eq.equipmentName} {eq.status !== "Available" ? `(${eq.status})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedEquipment && (selectedEquipment.specification || selectedEquipment.documentationUrl) && (
        <div className="rounded-md bg-[var(--color-paper-100)] px-3.5 py-3 text-xs space-y-1.5">
          {selectedEquipment.specification && (
            <p className="text-[var(--color-ink-700)]">{selectedEquipment.specification}</p>
          )}
          {selectedEquipment.documentationUrl && (
            <a
              href={selectedEquipment.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[var(--color-brass-600)] hover:underline"
            >
              View equipment manual / documentation
            </a>
          )}
        </div>
      )}

      <div>
        <label htmlFor="start" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Start
        </label>
        <input
          id="start"
          type="datetime-local"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="end" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          End
        </label>
        <input
          id="end"
          type="datetime-local"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={inputClass}
        />
      </div>

      <p className="text-xs text-[var(--color-ink-600)]">
        If this slot conflicts with an existing booking, your request is placed on the
        waitlist automatically and promoted when the slot frees up.
      </p>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Requesting…" : "Request booking"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";

function formatRange(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const dateFmt = { month: "short", day: "numeric" };
  const timeFmt = { hour: "numeric", minute: "2-digit" };
  const datePart = s.toLocaleDateString(undefined, dateFmt);
  const startTime = s.toLocaleTimeString(undefined, timeFmt);
  const endTime = e ? e.toLocaleTimeString(undefined, timeFmt) : null;
  return endTime ? `${datePart}, ${startTime} – ${endTime}` : `${datePart}, ${startTime}`;
}
