import { createFileRoute } from "@tanstack/react-router";
import { Flame, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { HeatmapGrid } from "@/components/heatmap-grid";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useApi } from "@/hooks/use-api";
import {
  getDailyHeatmap,
  getDepartmentHeatmap,
  getEquipmentHeatmap,
  getHourlyHeatmap,
  type HeatmapCell,
} from "@/services/heatmapService";
import { LoadingState } from "@/components/async-state";

export const Route = createFileRoute("/_app/heatmaps")({
  component: HeatmapsPage,
  head: () => ({
    meta: [
      { title: "Heatmaps · LabGrid" },
      {
        name: "description",
        content: "Hourly, daily, weekly and monthly booking heatmaps with peak-hours analysis.",
      },
    ],
  }),
});

const HOURS = [
  "6AM",
  "8AM",
  "10AM",
  "12PM",
  "2PM",
  "4PM",
  "6PM",
  "8PM",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HeatmapsPage() {
  const hourly = useApi<HeatmapCell[]>(getHourlyHeatmap, []);
  const daily = useApi<HeatmapCell[]>(getDailyHeatmap, []);
  const equip = useApi<HeatmapCell[]>(getEquipmentHeatmap, []);
  const dept = useApi<HeatmapCell[]>(getDepartmentHeatmap, []);

  // Derive peak hours from hourly matrix.
  const peakByHour = new Map<string, number>();
  (hourly.data ?? []).forEach((c) => {
    peakByHour.set(c.y, (peakByHour.get(c.y) ?? 0) + c.value);
  });
  const peakRows = Array.from(peakByHour.entries())
    .map(([hour, value]) => ({ hour, value }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Heatmaps"
        description="Visualise demand density across time, equipment and departments."
      />

      <Tabs defaultValue="temporal" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
          <TabsTrigger value="resource">Resource</TabsTrigger>
          <TabsTrigger value="peaks">Peaks</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Hourly Heatmap</h3>
                  <p className="text-xs text-muted-foreground">Bookings by hour × day</p>
                </div>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </header>
              {hourly.loading ? (
                <LoadingState />
              ) : (
                <HeatmapGrid cells={hourly.data ?? []} xLabels={DAYS} yLabels={HOURS} />
              )}
            </section>
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4">
                <h3 className="font-semibold">Daily Heatmap</h3>
                <p className="text-xs text-muted-foreground">Bookings by weekday × week</p>
              </header>
              {daily.loading ? (
                <LoadingState />
              ) : (
                <HeatmapGrid cells={daily.data ?? []} />
              )}
            </section>
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4">
                <h3 className="font-semibold">Weekly Heatmap</h3>
                <p className="text-xs text-muted-foreground">
                  Aggregated bookings per week across months
                </p>
              </header>
              <HeatmapGrid
                cells={daily.data ?? []}
                emptyDescription="Weekly aggregation shares the daily endpoint until a dedicated one lands."
              />
            </section>
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4">
                <h3 className="font-semibold">Monthly Heatmap</h3>
                <p className="text-xs text-muted-foreground">Bookings by day × month</p>
              </header>
              <HeatmapGrid
                cells={[]}
                emptyDescription="Monthly heatmap requires GET /api/analytics/heatmap/monthly on the backend."
              />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="resource" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4">
                <h3 className="font-semibold">Equipment Heatmap</h3>
                <p className="text-xs text-muted-foreground">
                  Utilisation intensity per equipment
                </p>
              </header>
              {equip.loading ? (
                <LoadingState />
              ) : (
                <HeatmapGrid cells={equip.data ?? []} />
              )}
            </section>
            <section className="rounded-xl border bg-card p-5">
              <header className="mb-4">
                <h3 className="font-semibold">Department Heatmap</h3>
                <p className="text-xs text-muted-foreground">Load spread across departments</p>
              </header>
              {dept.loading ? (
                <LoadingState />
              ) : (
                <HeatmapGrid cells={dept.data ?? []} />
              )}
            </section>
            <section className="rounded-xl border bg-card p-5 lg:col-span-2">
              <header className="mb-4">
                <h3 className="font-semibold">Booking Density Heatmap</h3>
                <p className="text-xs text-muted-foreground">
                  Booking counts by equipment × hour of day
                </p>
              </header>
              <HeatmapGrid
                cells={equip.data ?? []}
                emptyDescription="Booking-density matrix will populate once /api/analytics/heatmap/density is available."
              />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="peaks" className="space-y-6">
          <ChartCard
            title="Peak Hours Analysis"
            description="Aggregate booking volume across the day"
          >
            {peakRows.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium">No peak data yet</p>
                  <p className="text-xs text-muted-foreground">
                    Wire GET /api/analytics/peak-hours to populate.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakRows}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="var(--color-chart-2)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
