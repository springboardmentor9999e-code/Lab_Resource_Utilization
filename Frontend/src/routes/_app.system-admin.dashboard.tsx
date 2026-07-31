import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ShieldCheck, Users, Building2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listUsers } from "@/services/userService";
import { listEquipment } from "@/services/equipmentService";
import { getUtilizationSeries, type UtilizationPoint } from "@/services/dashboardService";

export const Route = createFileRoute("/_app/system-admin/dashboard")({ component: SystemAdmin });

function SystemAdmin() {
  const users = useApi(listUsers, []);
  const equipment = useApi(listEquipment, []);
  const utilization = useApi<UtilizationPoint[]>(getUtilizationSeries, []);
  const institutions = Array.from(new Set((users.data ?? []).map((u) => u.institutionId).filter(Boolean))).length;

  return (
    <div className="space-y-6">
      <PageHeader title="System Admin Dashboard" description="Full platform control and system health." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Institutions" value={users.loading ? "…" : institutions || "N/A"} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Total Users" value={users.loading ? "…" : (users.data?.length ?? 0)} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Equipment" value={equipment.loading ? "…" : (equipment.data?.length ?? 0)} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Audit Events" value="N/A" hint="Audit log API required" icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <ChartCard title="Weekly Utilization" description="Platform-wide booking volume">
        {utilization.loading ? <LoadingState /> : utilization.error ? <ErrorState message={utilization.error} onRetry={utilization.reload} /> :
          !utilization.data || utilization.data.length === 0 ? <EmptyState title="No analytics data available" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilization.data}>
                <defs>
                  <linearGradient id="sa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="usage" stroke="var(--color-chart-2)" fill="url(#sa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
      </ChartCard>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-2 font-semibold">Audit Logs</h3>
        <p className="mb-4 text-xs text-muted-foreground">Backend audit-log API not implemented. TODO: add <code>GET /api/audit-logs</code>.</p>
        <EmptyState title="Audit log API not available" />
      </div>
    </div>
  );
}
