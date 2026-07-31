import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, XCircle, TrendingUp, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listBookingsByStatus, approveBooking, rejectBooking, type Booking } from "@/services/bookingService";
import { getUtilizationSeries, type UtilizationPoint } from "@/services/dashboardService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/manager/dashboard")({ component: ManagerDashboard });

const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");
const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

function ManagerDashboard() {
  const fetchPending = useCallback(() => listBookingsByStatus("PENDING"), []);
  const fetchApproved = useCallback(() => listBookingsByStatus("APPROVED"), []);
  const fetchRejected = useCallback(() => listBookingsByStatus("REJECTED"), []);
  const pending = useApi<Booking[]>(fetchPending, []);
  const approved = useApi<Booking[]>(fetchApproved, []);
  const rejected = useApi<Booking[]>(fetchRejected, []);
  const utilization = useApi<UtilizationPoint[]>(getUtilizationSeries, []);

  const approvedToday = (approved.data ?? []).filter((b) => isToday(b.createdAt || b.startTime)).length;
  const rejectedToday = (rejected.data ?? []).filter((b) => isToday(b.createdAt || b.startTime)).length;

  const refreshAll = () => { pending.reload(); approved.reload(); rejected.reload(); };

  const approve = async (b: Booking) => {
    try {
      await approveBooking(b.id);
      toast.success(`Approved ${b.equipmentName ?? `booking #${b.id}`}`);
      refreshAll();
    } catch (err) { toast.error(apiErrorMessage(err, "Failed to approve")); }
  };
  const reject = async (b: Booking) => {
    try {
      await rejectBooking(b.id);
      toast.error(`Rejected ${b.equipmentName ?? `booking #${b.id}`}`);
      refreshAll();
    } catch (err) { toast.error(apiErrorMessage(err, "Failed to reject")); }
  };

  const pendingList = pending.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Manager Dashboard" description="Approve bookings and monitor lab utilization." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Approvals" value={pending.loading ? "…" : pendingList.length} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Approved Today" value={approved.loading ? "…" : approvedToday} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Rejected Today" value={rejected.loading ? "…" : rejectedToday} icon={<XCircle className="h-4 w-4" />} />
        <StatCard label="Lab Utilization" value={utilization.data?.length ? `${Math.round((utilization.data.reduce((a, p) => a + (p.usage ?? 0), 0) / utilization.data.length))}%` : "N/A"} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <ChartCard title="Lab Utilization" description="Daily usage across your labs">
        {utilization.loading ? <LoadingState /> : utilization.error ? <ErrorState message={utilization.error} onRetry={utilization.reload} /> :
          !utilization.data || utilization.data.length === 0 ? <EmptyState title="No utilization data" description="The analytics API returned no data." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilization.data}>
                <defs>
                  <linearGradient id="u1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey={utilization.data[0]?.day ? "day" : "date"} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="usage" stroke="var(--color-chart-1)" fill="url(#u1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
      </ChartCard>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Booking Approval Queue</h3>
        {pending.loading ? <LoadingState /> : pending.error ? <ErrorState message={pending.error} onRetry={pending.reload} /> :
          pendingList.length === 0 ? <EmptyState title="No pending bookings" /> : (
            <div className="space-y-2">
              {pendingList.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">{b.equipmentName || `Equipment #${b.equipmentId}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {(b.userName || b.userEmail || `User #${b.userId ?? "—"}`)} · {fmtDateTime(b.startTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Pending</Badge>
                    <Button size="sm" onClick={() => approve(b)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(b)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
