import React from 'react';
import {
  HelpCircle,
  CheckCircle,
  Activity,
  CheckCheck,
  Ban,
  XCircle,
  UserX,
} from 'lucide-react';

// Booking status badge config per doc spec:
// PENDING amber, CONFIRMED green, IN_USE blue, COMPLETED slate,
// CANCELLED gray, REJECTED red, NO_SHOW orange
export const BOOKING_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Approval',
    icon: HelpCircle,
    classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle,
    classes: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25',
  },
  IN_USE: {
    label: 'In Use',
    icon: Activity,
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCheck,
    classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: Ban,
    classes: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/25',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
  },
  NO_SHOW: {
    label: 'No Show',
    icon: UserX,
    classes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
  },
};

const BookingStatusBadge = ({ status, size = 'sm' }) => {
  // Legacy APPROVED rows display as CONFIRMED
  const key = status?.toUpperCase() === 'APPROVED' ? 'CONFIRMED' : status?.toUpperCase();
  const cfg = BOOKING_STATUS_CONFIG[key] || BOOKING_STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  const sizing =
    size === 'lg' ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-2 py-1 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center ${sizing} rounded-lg border font-bold whitespace-nowrap ${cfg.classes}`}
    >
      <Icon className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {cfg.label}
    </span>
  );
};

export default BookingStatusBadge;
