import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/use-api";
import {
  getDemandTrend,
  getLeastRequested,
  getMostRequested,
  type DemandRow,
} from "@/services/demandService";
import { getDepartmentStats, type DepartmentStat } from "@/services/dashboardService";
import { EmptyState, LoadingState } from "@/components/async-state";

export const Route = createFileRoute("/_app/demand")({
  component: DemandPage,
  head: () => ({
    meta: [
      { title: "Demand Analysis · LabGrid" },
      {
        name: "description",
        content: "Most and least requested equipment, demand trends, and department demand.",
      },
    ],
  }),
});

function RankTable({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: DemandRow[];
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Utilisation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.equipmentId}>
                <TableCell className="font-medium">{r.equipmentName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.requests}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={r.utilizationPct} className="h-2 w-24" />
                    <span className="text-xs">{r.utilizationPct}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function DemandPage() {
  const most = useApi<DemandRow[]>(getMostRequested, []);
  const least = useApi<DemandRow[]>(getLeastRequested, []);
  const trend = useApi<{ date: string; requests: number }[]>(getDemandTrend, []);
  const depts = useApi<DepartmentStat[]>(getDepartmentStats, []);

  const totalRequests = (most.data ?? []).reduce((s, r) => s + r.requests, 0);
  const avgUtil = most.data?.length
    ? Math.round(
        most.data.reduce((s, r) => s + r.utilizationPct, 0) / most.data.length,
      )
    : 0;
  const peakDay = (trend.data ?? []).reduce(
    (acc, cur) => (cur.requests > acc.requests ? cur : acc),
    { date: "—", requests: 0 },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Analysis"
        description="Understand what your researchers actually ask for."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={totalRequests}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Avg utilisation"
          value={`${avgUtil}%`}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <StatCard
          label="Peak day"
          value={peakDay.date}
          hint={`${peakDay.requests} requests`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Under-used items"
          value={least.data?.length ?? 0}
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Demand Trend" description="Requests per day">
          {trend.loading ? (
            <LoadingState />
          ) : !trend.data || trend.data.length === 0 ? (
            <EmptyState
              title="No trend data"
              description="Wire GET /api/demand/trend to populate this chart."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  dataKey="requests"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Department Demand" description="Booking volume per department">
          {depts.loading ? (
            <LoadingState />
          ) : !depts.data || depts.data.length === 0 ? (
            <EmptyState title="No department data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-chart-3)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankTable
          title="Most Requested Equipment"
          rows={most.data ?? []}
          emptyText="No demand data yet"
        />
        <RankTable
          title="Least Requested Equipment"
          rows={least.data ?? []}
          emptyText="No under-used equipment identified yet"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">Institution Demand</h3>
          <p className="text-xs text-muted-foreground">
            Cross-institution comparison requires GET /api/demand/institution.
          </p>
        </div>
        <EmptyState
          title="Institution demand pending"
          description="This becomes available once the backend exposes cross-institution demand metrics."
        />
      </div>
    </div>
  );
}
