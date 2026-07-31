import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { getUtilizationSeries, getDepartmentStats, type UtilizationPoint, type DepartmentStat } from "@/services/dashboardService";
import { listReports, exportReport, downloadBlob, type Report } from "@/services/reportService";
import { apiErrorMessage } from "@/services/api";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function ReportsPage() {
  const util = useApi<UtilizationPoint[]>(getUtilizationSeries, []);
  const depts = useApi<DepartmentStat[]>(getDepartmentStats, []);
  const reports = useApi<Report[]>(listReports, []);

  const doExport = async (type: string) => {
    try {
      const blob = await exportReport(type);
      downloadBlob(blob, `${type}.csv`);
      toast.success(`Exported ${type}.csv`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Export failed"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Cross-institution insights and CSV exports." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Utilization">
          {util.loading ? <LoadingState /> : util.error ? <ErrorState message={util.error} onRetry={util.reload} /> :
            !util.data || util.data.length === 0 ? <EmptyState title="No utilization data" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={util.data}>
                  <defs>
                    <linearGradient id="rp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="usage" stroke="var(--color-chart-1)" fill="url(#rp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
        <ChartCard title="Department Share">
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

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold">Available Reports</h3>
            <p className="text-xs text-muted-foreground">From <code>/api/reports</code> · export via <code>/api/reports/export/&#123;type&#125;</code>.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => doExport("bookings")}>
              <Download className="mr-2 h-3 w-3" /> Bookings CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => doExport("equipment")}>
              <Download className="mr-2 h-3 w-3" /> Equipment CSV
            </Button>
          </div>
        </div>
        {reports.loading ? <LoadingState /> : reports.error ? <ErrorState message={reports.error} onRetry={reports.reload} /> :
          !reports.data || reports.data.length === 0 ? <EmptyState title="No reports available" /> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Created</TableHead><TableHead>Size</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {reports.data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell><Badge variant="secondary">{r.type}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-xs">{r.sizeBytes ? `${Math.round(r.sizeBytes / 1024)} KB` : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => doExport(r.type.toLowerCase())}>
                        <Download className="mr-2 h-3 w-3" /> Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>
    </div>
  );
}
