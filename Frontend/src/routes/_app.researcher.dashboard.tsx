import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarClock, CheckCircle2, Clock3, Flame, ListOrdered, TrendingUp, Wand2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listMyBookings, type Booking } from "@/services/bookingService";
import { getLiveUtilization, type LiveUtilizationSummary } from "@/services/utilizationService";

export const Route = createFileRoute("/_app/researcher/dashboard")({ component: ResearcherDashboard });

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");

function ResearcherDashboard() {
  const state = useApi<Booking[]>(listMyBookings, []);
  const live = useApi<LiveUtilizationSummary>(getLiveUtilization, []);
  const list = state.data ?? [];
  const active = list.filter((b) => b.status === "APPROVED");
  const pending = list.filter((b) => b.status === "PENDING");
  const completed = list.filter((b) => b.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <PageHeader title="Researcher Dashboard" description="Track your active research bookings and history." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Bookings" value={state.loading ? "…" : active.length} icon={<CalendarClock className="h-4 w-4" />} />
        <StatCard label="Pending Requests" value={state.loading ? "…" : pending.length} icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Completed" value={state.loading ? "…" : completed.length} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Live Utilization" value={live.loading ? "…" : `${live.data?.liveUtilizationPct ?? 0}%`} icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="justify-start"><Link to="/utilization"><Activity className="mr-2 h-4 w-4" /> Live Utilization</Link></Button>
        <Button asChild variant="outline" className="justify-start"><Link to="/heatmaps"><Flame className="mr-2 h-4 w-4" /> Heatmaps</Link></Button>
        <Button asChild variant="outline" className="justify-start"><Link to="/waitlist"><ListOrdered className="mr-2 h-4 w-4" /> My Waitlist</Link></Button>
        <Button asChild variant="outline" className="justify-start"><Link to="/optimization"><Wand2 className="mr-2 h-4 w-4" /> Smart Schedule</Link></Button>
      </div>


      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Pending Requests</h3>
        {state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> :
          pending.length === 0 ? <EmptyState title="No pending requests" /> : (
            <div className="space-y-3">
              {pending.map((b) => (
                <div key={b.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{b.equipmentName || `#${b.equipmentId}`}</div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{fmtDate(b.startTime)}</div>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Recent Bookings</h3>
        {state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> :
          list.length === 0 ? <EmptyState title="No bookings yet" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Equipment</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>{b.equipmentName || `#${b.equipmentId}`}</TableCell>
                    <TableCell>{fmtDate(b.startTime)}</TableCell>
                    <TableCell><Badge>{b.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>
    </div>
  );
}
