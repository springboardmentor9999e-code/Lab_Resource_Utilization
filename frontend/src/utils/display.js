export const EQUIPMENT_STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
export const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
export const MAINTENANCE_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatEnumLabel(value) {
  if (!value) {
    return 'Unknown';
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  const text = String(value);
  const date = new Date(text.length === 10 ? `${text}T00:00:00` : text);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return dateFormatter.format(date);
}

export function formatTime(value) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(11, 16) || String(value);
  }

  return timeFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not set';
  }

  return `${formatDate(value)} ${formatTime(value)}`;
}

export function formatDateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return 'Not scheduled';
  }

  return `${formatDate(startTime)} · ${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function toLocalDateTime(date, time, seconds = '00') {
  if (!date || !time) {
    return '';
  }

  const normalizedTime = time.length === 5 ? `${time}:${seconds}` : time;
  return `${date}T${normalizedTime}`;
}

export function toDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

export function toTimeInput(value) {
  return value ? String(value).slice(11, 16) : '';
}

export function formatBookingRequester(booking) {
  const name = [booking?.userFirstName, booking?.userLastName].filter(Boolean).join(' ');
  return name || booking?.userEmail || 'Unknown user';
}

export function clampPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
}

export function formatPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0%';
  }

  return `${Number.isInteger(numericValue) ? numericValue : numericValue.toFixed(2)}%`;
}
