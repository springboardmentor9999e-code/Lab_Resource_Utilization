import {
  Activity,
  CalendarClock,
  ClipboardCheck,
  FlaskConical,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { canViewMaintenance } from '../auth/permissions.js';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../services/apiError.js';
import { getDashboardSummary } from '../services/analyticsService.js';
import { getBookingsForUser } from '../services/bookingService.js';
import { getEquipment } from '../services/equipmentService.js';
import { getMaintenanceRecords } from '../services/maintenanceService.js';
import {
  formatBookingRequester,
  formatDateTimeRange,
  formatEnumLabel,
} from '../utils/display.js';

const statIcons = [FlaskConical, Activity, ClipboardCheck, Wrench];
const activeMaintenanceStatuses = new Set(['SCHEDULED', 'IN_PROGRESS']);

export default function Dashboard() {
  const { currentUser, searchQuery } = useOutletContext();
  const canViewMaintenanceForRole = canViewMaintenance(currentUser);
  const [summary, setSummary] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [analyticsNotice, setAnalyticsNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      setAnalyticsNotice('');

      try {
        const [equipmentData, bookingData] = await Promise.all([
          getEquipment(),
          getBookingsForUser(currentUser),
        ]);

        if (!isMounted) {
          return;
        }

        setEquipment(equipmentData);
        setBookings(bookingData);

        const [summaryData, maintenanceData] = await Promise.all([
          getDashboardSummary(),
          canViewMaintenanceForRole ? getMaintenanceRecords() : Promise.resolve([]),
        ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setMaintenance(maintenanceData);
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'Unable to load dashboard data.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [currentUser, canViewMaintenanceForRole]);

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'PENDING'),
    [bookings],
  );

  const activeMaintenance = useMemo(
    () => maintenance.filter((item) => activeMaintenanceStatuses.has(item.status)),
    [maintenance],
  );

  const dashboardStats = summary
    ? [
        {
          label: 'Active labs',
          value: String(summary.activeLabs),
          trend: `${summary.totalLabs} total labs registered`,
          tone: 'sky',
        },
        {
          label: 'Available units',
          value: String(summary.availableEquipmentUnits),
          trend: `${summary.totalEquipmentUnits} total units across ${summary.totalEquipmentRecords} records`,
          tone: 'emerald',
        },
        {
          label: 'Pending approvals',
          value: String(summary.pendingBookings),
          trend: `${summary.approvedBookings} approved bookings`,
          tone: 'amber',
        },
        {
          label: 'Active maintenance',
          value: String(summary.activeMaintenanceRecords),
          trend: 'Scheduled or in-progress maintenance records',
          tone: 'rose',
        },
      ]
    : [];

  const visibleEquipment = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return equipment;
    }

    return equipment.filter((item) =>
      [
        item.name,
        item.id,
        item.category,
        item.manufacturer,
        item.serialNumber,
        item.labName,
        item.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [equipment, searchQuery]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <StatCard key={stat.label} icon={statIcons[index]} {...stat} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800">
          {analyticsNotice || 'Dashboard analytics are unavailable for this account.'}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Equipment availability</h3>
              <p className="mt-1 text-sm text-slate-500">Current inventory status by resource.</p>
            </div>
            <Link
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              to="/bookings"
            >
              <CalendarClock className="h-4 w-4" />
              Review schedule
            </Link>
          </div>

          {visibleEquipment.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Equipment</th>
                    <th className="px-5 py-3 font-semibold">Lab</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Available units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.serialNumber}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.labName}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.availableQuantity} of {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-500">No equipment matches the current search.</div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Pending approvals</h3>
            <div className="mt-4 space-y-4">
              {pendingBookings.length > 0 ? (
                pendingBookings.slice(0, 5).map((booking) => (
                  <article key={booking.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{booking.equipmentName}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatBookingRequester(booking)} - {formatDateTimeRange(booking.startTime, booking.endTime)}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  All booking requests are cleared.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Maintenance alerts</h3>
            <div className="mt-4 space-y-3">
              {activeMaintenance.length > 0 ? (
                activeMaintenance.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.equipmentName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.title} · {formatEnumLabel(item.status)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  No active maintenance records.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
