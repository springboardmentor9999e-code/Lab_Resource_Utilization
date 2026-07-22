import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { can, isSelfServiceRole, roleLabel } from "../auth/permissions";
import { bookingsApi } from "../api/bookings";
import { equipmentApi } from "../api/equipment";
import { utilizationApi } from "../api/utilization";
import { sharingRequestsApi } from "../api/sharingRequests";
import { Card, StatCard, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [sharingRequests, setSharingRequests] = useState([]);
  const [idleEquipment, setIdleEquipment] = useState([]);

  const showIdle = can(user?.role, "utilization:idle");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const calls = [
      bookingsApi.list(),
      equipmentApi.list(),
      sharingRequestsApi.list().catch(() => []),
      showIdle ? utilizationApi.idle().catch(() => []) : Promise.resolve([]),
    ];

    Promise.all(calls)
      .then(([b, e, sr, idle]) => {
        if (cancelled) return;
        setBookings(b);
        setEquipment(e);
        setSharingRequests(sr);
        setIdleEquipment(idle);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load dashboard data.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [showIdle]);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} />;

  const selfService = isSelfServiceRole(user?.role);

  return selfService ? (
    <StudentDashboard user={user} bookings={bookings} equipment={equipment} sharingRequests={sharingRequests} />
  ) : (
    <StaffDashboard
      user={user}
      bookings={bookings}
      equipment={equipment}
      sharingRequests={sharingRequests}
      idleEquipment={idleEquipment}
    />
  );
}

function StudentDashboard({ user, bookings, equipment, sharingRequests }) {
  const upcoming = bookings
    .filter((b) => ["Pending Approval", "Confirmed", "Waitlisted"].includes(b.status))
    .slice(0, 5);
  const availableCount = equipment.filter((e) => e.status === "Available").length;

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${roleLabel(user?.role)}`}
        title={`Hello, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's what's happening with your bookings and available equipment."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="My upcoming bookings" value={upcoming.length} accent />
        <StatCard label="Available equipment" value={availableCount} sublabel={`of ${equipment.length} total`} />
        <StatCard label="My sharing requests" value={sharingRequests.length} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">My bookings</h2>
          <Link to="/bookings" className="text-sm font-medium text-[var(--color-brass-600)] hover:underline">
            View all →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            description="Browse equipment and reserve a slot to get started."
            action={
              <Link
                to="/equipment"
                className="inline-block rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
              >
                Browse equipment
              </Link>
            }
          />
        ) : (
          <BookingRows rows={upcoming} />
        )}
      </Card>
    </>
  );
}

function StaffDashboard({ user, bookings, equipment, sharingRequests, idleEquipment }) {
  const pendingApprovals = bookings.filter((b) => b.status === "Pending Approval");
  const inMaintenance = equipment.filter((e) => e.status === "Under Maintenance");
  const pendingSharing = sharingRequests.filter((s) => s.status === "PENDING");

  return (
    <>
      <PageHeader
        eyebrow={roleLabel(user?.role)}
        title="Operations overview"
        description="Bookings awaiting review, equipment health, and utilization signals across your labs."
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending approvals" value={pendingApprovals.length} accent />
        <StatCard label="Total equipment" value={equipment.length} />
        <StatCard label="Under maintenance" value={inMaintenance.length} />
        <StatCard label="Idle equipment" value={idleEquipment.length} sublabel="72h+ unused" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">
              Pending booking approvals
            </h2>
            <Link to="/bookings" className="text-sm font-medium text-[var(--color-brass-600)] hover:underline">
              View all →
            </Link>
          </div>
          {pendingApprovals.length === 0 ? (
            <EmptyState title="All caught up" description="No bookings waiting on approval right now." />
          ) : (
            <BookingRows rows={pendingApprovals.slice(0, 5)} />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">
              Idle equipment
            </h2>
            <Link to="/utilization" className="text-sm font-medium text-[var(--color-brass-600)] hover:underline">
              View utilization →
            </Link>
          </div>
          {idleEquipment.length === 0 ? (
            <EmptyState title="Nothing idle" description="All equipment has recent usage logged." />
          ) : (
            <ul className="divide-y divide-[var(--color-paper-200)]">
              {idleEquipment.slice(0, 5).map((item) => (
                <li key={item.equipmentId} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-ink-900)]">{item.equipmentName}</span>
                  <span className="font-[var(--font-mono)] text-xs text-[var(--color-status-maintenance)]">
                    {item.idleHours != null ? `${item.idleHours}h idle` : "never used"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {pendingSharing.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">
              Sharing requests awaiting review
            </h2>
            <Link to="/sharing-requests" className="text-sm font-medium text-[var(--color-brass-600)] hover:underline">
              Review →
            </Link>
          </div>
          <p className="text-sm text-[var(--color-ink-600)]">
            {pendingSharing.length} request{pendingSharing.length === 1 ? "" : "s"} from other
            institutions or labs waiting on your approval.
          </p>
        </Card>
      )}
    </>
  );
}

function BookingRows({ rows }) {
  return (
    <ul className="divide-y divide-[var(--color-paper-200)]">
      {rows.map((b) => (
        <li key={b.bookingId || b.id} className="py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-ink-900)] truncate">
              {b.equipment?.equipmentName || `Equipment #${b.equipment?.equipmentId ?? "—"}`}
            </p>
            <p className="text-xs text-[var(--color-ink-600)] mt-0.5">
              {formatRange(b.startTime, b.endTime)}
            </p>
          </div>
          <StatusDial status={b.status} size="sm" />
        </li>
      ))}
    </ul>
  );
}

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
