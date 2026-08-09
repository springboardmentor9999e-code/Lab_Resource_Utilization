import { formatEnumLabel } from '../utils/display.js';

const statusClasses = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  IN_USE: 'bg-sky-50 text-sky-700 ring-sky-200',
  SCHEDULED: 'bg-sky-50 text-sky-700 ring-sky-200',
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
  MAINTENANCE: 'bg-rose-50 text-rose-700 ring-rose-200',
  OUT_OF_SERVICE: 'bg-rose-50 text-rose-700 ring-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status ?? '').toUpperCase().replaceAll(' ', '_');

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        statusClasses[normalizedStatus] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {formatEnumLabel(status)}
    </span>
  );
}
