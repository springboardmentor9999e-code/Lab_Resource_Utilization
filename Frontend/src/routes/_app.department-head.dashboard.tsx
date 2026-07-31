import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Building2, FlaskConical, TrendingUp, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { getUtilizationSeries, getDepartmentStats, type UtilizationPoint, type DepartmentStat } from "@/services/dashboardService";
import { listUsers } from "@/services/userService";
import { listEquipment } from "@/services/equipmentService";

export const Route = createFileRoute("/_app/department-head/dashboard")({ component: DeptHead });

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function DeptHead() {
  const users = useApi(listUsers, []);
  const equipment = useApi(listEquipment, []);
  const utilization = useApi<UtilizationPoint[]>(getUtilizationSeries, []);
  const depts = useApi<DepartmentStat[]>(getDepartmentStats, []);

  const researchers = (users.data ?? []).filter((u) => u.roleName === "RESEARCHER").length;
  const labs = new Set((equipment.data ?? []).map((e) => e.departmentId).filter(Boolean)).size;
  const avgUtil = utilization.data?.length ? Math.round(utilization.data.reduce((a, p) => a + (p.usage ?? 0), 0) / utilization.data.length) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Department Head Dashboard" description="Department-wide research and equipment utilization." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Researchers" value={users.loading ? "…" : researchers} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Labs" value={equipment.loading ? "…" : labs} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Equipment" value={equipment.loading ? "…" : (equipment.data?.length ?? 0)} icon={<FlaskConical className="h-4 w-4" />} />
        <StatCard label="Avg Utilization" value={utilization.loading ? "…" : avgUtil !== null ? `${avgUtil}%` : "N/A"} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Research Activity" description="Bookings trend over the week">
          {utilization.loading ? <LoadingState /> : utilization.error ? <ErrorState message={utilization.error} onRetry={utilization.reload} /> :
            !utilization.data || utilization.data.length === 0 ? <EmptyState title="No activity data" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilization.data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="usage" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Equipment Utilization by Department">
          {depts.loading ? <LoadingState /> : depts.error ? <ErrorState message={depts.error} onRetry={depts.reload} /> :
            !depts.data || depts.data.length === 0 ? <EmptyState title="No department data" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={depts.data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {depts.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>
    </div>
  );
}
