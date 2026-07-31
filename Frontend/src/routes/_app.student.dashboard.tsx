import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Clock, FlaskConical, History } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listMyBookings, type Booking } from "@/services/bookingService";
import { listEquipment, type Equipment } from "@/services/equipmentService";

export const Route = createFileRoute("/_app/student/dashboard")({ component: StudentDashboard });

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");
const fmtTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

function StudentDashboard() {
  const bookings = useApi<Booking[]>(listMyBookings, []);
  const equipment = useApi<Equipment[]>(listEquipment, []);

  const list = bookings.data ?? [];
  const now = Date.now();
  const upcoming = list.filter((b) => b.status === "APPROVED" && new Date(b.startTime ?? 0).getTime() > now);
  const available = (equipment.data ?? []).filter((e) => e.status === "AVAILABLE");

  return (
    <div className="space-y-6">
      <PageHeader title="Student Dashboard" description="Your bookings and available equipment at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Bookings" value={bookings.loading ? "…" : list.length} icon={<CalendarCheck className="h-4 w-4" />} />
        <StatCard label="Upcoming" value={bookings.loading ? "…" : upcoming.length} hint="Approved" icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Available Equipment" value={equipment.loading ? "…" : available.length} icon={<FlaskConical className="h-4 w-4" />} />
        <StatCard label="Total History" value={bookings.loading ? "…" : list.filter((b) => b.status === "COMPLETED").length} hint="Completed" icon={<History className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Upcoming Reservations</h3>
          {bookings.loading ? <LoadingState /> : bookings.error ? <ErrorState message={bookings.error} onRetry={bookings.reload} /> :
            upcoming.length === 0 ? <EmptyState title="No upcoming reservations" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Equipment</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                <TableBody>
                  {upcoming.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.equipmentName || `#${b.equipmentId}`}</TableCell>
                      <TableCell>{fmtDate(b.startTime)}</TableCell>
                      <TableCell>{fmtTime(b.startTime)}{b.endTime ? ` – ${fmtTime(b.endTime)}` : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Available Equipment</h3>
          {equipment.loading ? <LoadingState /> : equipment.error ? <ErrorState message={equipment.error} onRetry={equipment.reload} /> :
            available.length === 0 ? <EmptyState title="No equipment currently available" /> : (
              <div className="space-y-2">
                {available.slice(0, 6).map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">{e.equipmentName || e.name}</div>
                      <div className="text-xs text-muted-foreground">{[e.lab, e.department].filter(Boolean).join(" · ")}</div>
                    </div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Booking History</h3>
        {bookings.loading ? <LoadingState /> : bookings.error ? <ErrorState message={bookings.error} onRetry={bookings.reload} /> :
          list.length === 0 ? <EmptyState title="No bookings yet" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Equipment</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>{b.equipmentName || `#${b.equipmentId}`}</TableCell>
                    <TableCell>{fmtDate(b.startTime)}</TableCell>
                    <TableCell><Badge variant={b.status === "APPROVED" ? "default" : b.status === "REJECTED" || b.status === "CANCELLED" ? "destructive" : "secondary"}>{b.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>
    </div>
  );
}
