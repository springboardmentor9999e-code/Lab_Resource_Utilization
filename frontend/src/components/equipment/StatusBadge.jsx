import React from 'react';
import { CheckCircle, Activity, Clock, Wrench, XCircle, HelpCircle, Archive } from 'lucide-react';

// Status badge config per mentor spec:
// Available (Green), In Use (Blue), Reserved (Orange), Maintenance (Yellow),
// Out of Service (Red), Lost (Gray)
export const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    icon: CheckCircle,
    classes: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25',
    dot: 'bg-green-500',
  },
  IN_USE: {
    label: 'In Use',
    icon: Activity,
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    dot: 'bg-blue-500',
  },
  RESERVED: {
    label: 'Reserved',
    icon: Clock,
    classes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
    dot: 'bg-orange-500',
  },
  UNDER_MAINTENANCE: {
    label: 'Maintenance',
    icon: Wrench,
    classes: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/25',
    dot: 'bg-yellow-500',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    icon: XCircle,
    classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
    dot: 'bg-red-500',
  },
  RETIRED: {
    label: 'Retired',
    icon: Archive,
    classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    dot: 'bg-purple-500',
  },
  LOST: {
    label: 'Lost',
    icon: HelpCircle,
    classes: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25',
    dot: 'bg-slate-400',
  },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
  const Icon = cfg.icon;
  const sizing =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs gap-1.5'
      : 'px-2 py-1 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center ${sizing} rounded-lg border font-bold whitespace-nowrap ${cfg.classes}`}
    >
      <Icon className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
