import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { EmptyState, LoadingState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import {
  getDepartmentStats,
  getUtilizationSeries,
  type DepartmentStat,
  type UtilizationPoint,
} from "@/services/dashboardService";
import { listBookings, type Booking } from "@/services/bookingService";
import { getLiveUtilization, type LiveUtilizationSummary } from "@/services/utilizationService";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Enterprise Analytics · LabGrid" },
      {
        name: "description",
        content: "Cross-institution utilisation, booking trends and department comparisons.",
      },
    ],
  }),
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function AnalyticsPage() {
  const util = useApi<UtilizationPoint[]>(getUtilizationSeries, []);
  const depts = useApi<DepartmentStat[]>(getDepartmentStats, []);
  const bookings = useApi<Booking[]>(listBookings, []);
  const summary = useApi<LiveUtilizationSummary>(getLiveUtilization, []);

  const bookingsByStatus = (bookings.data ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(bookingsByStatus).map(([name, value]) => ({ name, value }));

  // Booking trend by date (last 30 days).
  const byDate = new Map<string, number>();
  (bookings.data ?? []).forEach((b) => {
    const k = new Date(b.startTime).toISOString().slice(0, 10);
    byDate.set(k, (byDate.get(k) ?? 0) + 1);
  });
  const trend = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, value]) => ({ date, bookings: value }));

  // Fake institution comparison — single institution in scope; show as one bar.
  const institutionData = [
    {
      name: "Your institution",
      utilisation: summary.data?.liveUtilizationPct ?? 0,
      capacity: summary.data?.totalEquipment ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Analytics"
        description="Executive view of utilisation, demand and cross-department comparisons."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={bookings.data?.length ?? 0}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Live utilisation"
          value={`${summary.data?.liveUtilizationPct ?? 0}%`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Departments tracked"
          value={depts.data?.length ?? 0}
          icon={<PieIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Peak day sample"
          value={trend.length ? Math.max(...trend.map((t) => t.bookings)) : 0}
          icon={<LineIcon className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Utilization — Area" description="Weekly usage hours">
          {util.loading ? (
            <LoadingState />
          ) : !util.data || util.data.length === 0 ? (
            <EmptyState title="No utilisation series" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={util.data}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#ag1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Booking Trend — Line" description="Bookings by date">
          {trend.length === 0 ? (
            <EmptyState title="No bookings yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Department Comparison — Bar">
          {depts.loading ? (
            <LoadingState />
          ) : !depts.data || depts.data.length === 0 ? (
            <EmptyState title="No department data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {depts.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Booking Status — Pie">
          {statusData.length === 0 ? (
            <EmptyState title="No bookings yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Institution Comparison" description="Live utilisation snapshot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={institutionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="utilisation"
                fill="var(--color-chart-1)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="capacity"
                fill="var(--color-chart-4)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Utilization Composition" description="Available vs booked vs maintenance">
          {!summary.data ? (
            <LoadingState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Available", value: summary.data.availableEquipment },
                    { name: "Booked", value: summary.data.bookedEquipment },
                    { name: "Maintenance", value: summary.data.underMaintenanceEquipment },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                >
                  <Cell fill="var(--color-chart-2)" />
                  <Cell fill="var(--color-chart-1)" />
                  <Cell fill="var(--color-chart-4)" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
