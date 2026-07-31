import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleDashed,
  Loader2,
  RefreshCw,
  Signal,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import {
  getLiveUtilization,
  getUtilizationSeries,
  type LiveUtilizationSummary,
} from "@/services/utilizationService";
import { listEquipment, type Equipment } from "@/services/equipmentService";
import { listBookings, type Booking } from "@/services/bookingService";
import type { UtilizationPoint } from "@/services/dashboardService";

export const Route = createFileRoute("/_app/utilization")({
  component: UtilizationPage,
  head: () => ({
    meta: [
      { title: "Live Utilization · LabGrid" },
      {
        name: "description",
        content: "Real-time equipment status, live utilization and activity timeline.",
      },
    ],
  }),
});

const statusColor: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  BOOKED: "bg-blue-500",
  UNDER_MAINTENANCE: "bg-amber-500",
};

function StatusPill({ status }: { status?: string }) {
  const s = status ?? "UNKNOWN";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${statusColor[s] ?? "bg-muted-foreground"} animate-pulse`}
      />
      {s.replace(/_/g, " ")}
    </span>
  );
}

function UtilizationPage() {
  const summary = useApi<LiveUtilizationSummary>(getLiveUtilization, []);
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const bookings = useApi<Booking[]>(listBookings, []);
  const series = useApi<UtilizationPoint[]>(getUtilizationSeries, []);
  const [auto, setAuto] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (tick === 0) return;
    summary.reload();
    equipment.reload();
    bookings.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const s = summary.data;
  const equipList = equipment.data ?? [];
  const bookingList = bookings.data ?? [];

  // Institution / department utilization derived from equipment counts.
  const byDept = new Map<string, { total: number; busy: number }>();
  for (const e of equipList) {
    const key = e.department || `Dept #${e.departmentId ?? "—"}`;
    const b = byDept.get(key) ?? { total: 0, busy: 0 };
    b.total += 1;
    if (e.status === "BOOKED" || e.status === "IN_USE") b.busy += 1;
    byDept.set(key, b);
  }
  const deptRows = Array.from(byDept.entries()).map(([name, v]) => ({
    name,
    total: v.total,
    busy: v.busy,
    pct: v.total ? Math.round((v.busy / v.total) * 100) : 0,
  }));

  // Institution: single-institution derivation.
  const instPct = s?.liveUtilizationPct ?? 0;

  const timeline = [...bookingList]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Utilization"
        description="Live equipment status, capacity and activity timeline."
        actions={
          <>
            <Badge variant={auto ? "default" : "secondary"} className="gap-1">
              <Signal className="h-3 w-3" />
              {auto ? "Live · 15s" : "Paused"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setAuto((v) => !v)}>
              {auto ? "Pause" : "Resume"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                summary.reload();
                equipment.reload();
                bookings.reload();
              }}
            >
              <RefreshCw className="mr-2 h-3 w-3" /> Refresh
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Live Utilization"
          value={summary.loading ? "…" : `${s?.liveUtilizationPct ?? 0}%`}
          icon={<Activity className="h-4 w-4" />}
          hint="Booked + in-use vs total"
        />
        <StatCard
          label="Available"
          value={summary.loading ? "…" : (s?.availableEquipment ?? 0)}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="In Use / Booked"
          value={summary.loading ? "…" : (s?.bookedEquipment ?? 0) + (s?.runningSessions ?? 0)}
          icon={<Zap className="h-4 w-4" />}
        />
        <StatCard
          label="Maintenance"
          value={summary.loading ? "…" : (s?.underMaintenanceEquipment ?? 0)}
          icon={<Wrench className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Utilization Trend"
            description="Weekly usage hours across all equipment"
          >
            {series.loading ? (
              <LoadingState />
            ) : series.error ? (
              <ErrorState message={series.error} onRetry={series.reload} />
            ) : !series.data || series.data.length === 0 ? (
              <EmptyState title="No utilization data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series.data}>
                  <defs>
                    <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="var(--color-chart-1)"
                    fill="url(#ug)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Institution Capacity</h3>
          <p className="text-xs text-muted-foreground">Aggregated live load</p>
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-semibold tracking-tight">{instPct}%</div>
            <p className="mt-1 text-xs text-muted-foreground">of total capacity in use</p>
            <Progress value={instPct} className="mt-4 w-full" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border p-2 text-center">
              <div className="text-muted-foreground">Active</div>
              <div className="text-lg font-semibold">{s?.activeBookings ?? 0}</div>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <div className="text-muted-foreground">Running</div>
              <div className="text-lg font-semibold">{s?.runningSessions ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold">Live Equipment Status</h3>
              <p className="text-xs text-muted-foreground">
                {equipList.length} devices · updates every 15s
              </p>
            </div>
          </div>
          {equipment.loading ? (
            <LoadingState />
          ) : equipment.error ? (
            <ErrorState message={equipment.error} onRetry={equipment.reload} />
          ) : equipList.length === 0 ? (
            <EmptyState title="No equipment yet" />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipList.slice(0, 30).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.equipmentName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {e.modelNo || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={e.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold">Activity Timeline</h3>
              <p className="text-xs text-muted-foreground">Most recent bookings</p>
            </div>
          </div>
          {bookings.loading ? (
            <LoadingState />
          ) : bookings.error ? (
            <ErrorState message={bookings.error} onRetry={bookings.reload} />
          ) : timeline.length === 0 ? (
            <EmptyState title="No recent activity" />
          ) : (
            <ol className="relative space-y-4 p-6">
              {timeline.map((b) => (
                <li key={b.id} className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background">
                    {b.status === "IN_USE" ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <CircleDashed className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {b.equipmentName || `Equipment #${b.equipmentId}`}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.startTime).toLocaleString()} →{" "}
                      {new Date(b.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">Department Utilization</h3>
          <p className="text-xs text-muted-foreground">Derived from live equipment status</p>
        </div>
        {deptRows.length === 0 ? (
          <EmptyState title="No department breakdown yet" />
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              {deptRows.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.busy}/{d.total} · {d.pct}%
                    </span>
                  </div>
                  <Progress value={d.pct} className="mt-1 h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
