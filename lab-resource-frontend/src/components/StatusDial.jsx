// The app's signature element: a small dial-style status indicator, styled
// after equipment calibration dials. Used consistently everywhere a status
// appears (equipment availability, booking state) so the eye learns one
// visual language across the whole platform.

const STATUS_STYLES = {
  Available: { dot: "bg-[var(--color-status-available)]", bg: "bg-[var(--color-status-available-bg)]", text: "text-[var(--color-ink-900)]" },
  Confirmed: { dot: "bg-[var(--color-status-available)]", bg: "bg-[var(--color-status-available-bg)]", text: "text-[var(--color-ink-900)]" },
  "In Use": { dot: "bg-[var(--color-status-available)]", bg: "bg-[var(--color-status-available-bg)]", text: "text-[var(--color-ink-900)]" },
  Completed: { dot: "bg-[var(--color-ink-600)]", bg: "bg-[var(--color-paper-200)]", text: "text-[var(--color-ink-700)]" },
  Booked: { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  "Pending Approval": { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  Waitlisted: { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  "Under Maintenance": { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
  Cancelled: { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
  "No Show": { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
  "Out of Service": { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
  Retired: { dot: "bg-[var(--color-status-retired)]", bg: "bg-[var(--color-status-retired-bg)]", text: "text-[var(--color-ink-700)]" },
  // SharingRequestStatus enum values (uppercase, distinct from Booking/Equipment status strings)
  PENDING: { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  APPROVED: { dot: "bg-[var(--color-status-available)]", bg: "bg-[var(--color-status-available-bg)]", text: "text-[var(--color-ink-900)]" },
  // Approved but the booking it created came back Waitlisted due to a
  // scheduling conflict - distinct from APPROVED so this doesn't look like
  // full access was granted.
  WAITLISTED: { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  REJECTED: { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
  CANCELLED: { dot: "bg-[var(--color-ink-600)]", bg: "bg-[var(--color-paper-200)]", text: "text-[var(--color-ink-700)]" },
  // Maintenance status is free-text on the backend (no enum/CHECK constraint)
  Scheduled: { dot: "bg-[var(--color-status-booked)]", bg: "bg-[var(--color-status-booked-bg)]", text: "text-[var(--color-ink-900)]" },
  "In Progress": { dot: "bg-[var(--color-status-maintenance)]", bg: "bg-[var(--color-status-maintenance-bg)]", text: "text-[var(--color-ink-900)]" },
};

const DEFAULT_STYLE = { dot: "bg-[var(--color-ink-600)]", bg: "bg-[var(--color-paper-200)]", text: "text-[var(--color-ink-700)]" };

export function StatusDial({ status, size = "md" }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${style.bg} ${style.text} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
