import { Download, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getApiErrorMessage } from '../services/apiError.js';
import { getAnalyticsOverview } from '../services/analyticsService.js';
import { clampPercent, formatPercent } from '../utils/display.js';

const barColors = ['bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

function toInputDate(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function defaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    fromDate: toInputDate(start),
    toDate: toInputDate(end),
  };
}

export default function Analytics() {
  const [range, setRange] = useState(defaultRange);
  const [appliedRange, setAppliedRange] = useState(defaultRange);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getAnalyticsOverview(
          `${appliedRange.fromDate}T00:00:00`,
          `${appliedRange.toDate}T23:59:59`,
        );

        if (isMounted) {
          setOverview(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'Unable to load analytics.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [appliedRange]);

  const bookingStatusItems = useMemo(() => {
    const status = overview?.bookingStatus;

    if (!status) {
      return [];
    }

    return [
      ['Pending', status.pending],
      ['Approved', status.approved],
      ['Rejected', status.rejected],
      ['Cancelled', status.cancelled],
      ['Completed', status.completed],
    ];
  }, [overview]);

  const equipmentStatusItems = useMemo(() => {
    const status = overview?.equipmentStatus;

    if (!status) {
      return [];
    }

    return [
      ['Available', status.available],
      ['In use', status.inUse],
      ['Maintenance', status.maintenance],
      ['Out of service', status.outOfService],
    ];
  }, [overview]);

  function updateRange(field, value) {
    setRange((current) => ({ ...current, [field]: value }));
  }

  function applyRange(event) {
    event.preventDefault();

    if (!range.fromDate || !range.toDate) {
      setError('Select both analytics dates.');
      return;
    }

    if (range.fromDate > range.toDate) {
      setError('From date must be before to date.');
      return;
    }

    setAppliedRange(range);
  }

  function exportUtilizationCsv() {
    if (!overview) {
      return;
    }

    const rows = [
      ['Lab', 'Building', 'Room', 'Equipment records', 'Equipment units', 'Approved bookings', 'Utilization'],
      ...overview.labUtilization.map((item) => [
        item.labName,
        item.building,
        item.roomNumber,
        item.equipmentRecords,
        item.equipmentUnits,
        item.approvedBookingCount,
        formatPercent(item.utilizationPercentage),
      ]),
    ];
    const csv = rows.map((row) => row.map(formatCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `lab-utilization-${appliedRange.fromDate}-to-${appliedRange.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading analytics...
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" onSubmit={applyRange}>
          <div>
            <h3 className="text-lg font-bold text-slate-950">Analytics range</h3>
            <p className="mt-1 text-sm text-slate-500">Overview data is calculated from approved bookings in the selected window.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[180px_180px_auto]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">From</span>
              <input
                className="focus-ring mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateRange('fromDate', event.target.value)}
                type="date"
                value={range.fromDate}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">To</span>
              <input
                className="focus-ring mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateRange('toDate', event.target.value)}
                type="date"
                value={range.toDate}
              />
            </label>

            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              type="submit"
            >
              Apply
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}
      </section>

      {overview ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <InsightCard
              label="Equipment units"
              value={overview.dashboard.totalEquipmentUnits}
              helper={`${overview.dashboard.availableEquipmentUnits} currently available`}
            />
            <InsightCard
              label="Pending bookings"
              value={overview.dashboard.pendingBookings}
              helper={`${overview.dashboard.approvedBookings} approved bookings`}
            />
            <InsightCard
              label="Active maintenance"
              value={overview.dashboard.activeMaintenanceRecords}
              helper={`${overview.dashboard.activeLabs} active labs`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Utilization by lab</h3>
                  <p className="mt-1 text-sm text-slate-500">Booked unit-hours compared with equipment capacity.</p>
                </div>
                <button
                  className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={overview.labUtilization.length === 0}
                  onClick={exportUtilizationCsv}
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {overview.labUtilization.length > 0 ? (
                  overview.labUtilization.map((item, index) => (
                    <div key={item.labId}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.labName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.building}, Room {item.roomNumber} · {item.equipmentUnits} units
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-950">
                          {formatPercent(item.utilizationPercentage)}
                        </p>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                          style={{ width: `${clampPercent(item.utilizationPercentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No lab utilization data for the selected range.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <StatusMetricGroup title="Booking status" items={bookingStatusItems} />
              <StatusMetricGroup title="Equipment status" items={equipmentStatusItems} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Equipment utilization</h3>
            <div className="mt-6 space-y-5">
              {overview.equipmentUtilization.length > 0 ? (
                overview.equipmentUtilization.map((item, index) => (
                  <div key={item.equipmentId}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.equipmentName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.category} · {item.totalQuantity} units · {item.approvedBookingCount} bookings
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-950">
                        {formatPercent(item.utilizationPercentage)}
                      </p>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                        style={{ width: `${clampPercent(item.utilizationPercentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No equipment utilization data for the selected range.
                </p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function formatCsvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function InsightCard({ label, value, helper }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">{helper}</p>
    </article>
  );
}

function StatusMetricGroup({ title, items }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-4 divide-y divide-slate-100">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className="text-sm font-bold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
