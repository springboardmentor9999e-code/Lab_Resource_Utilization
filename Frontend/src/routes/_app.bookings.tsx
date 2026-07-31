import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import {
  listBookings, listMyBookings, createBooking,
  cancelBooking, approveBooking, rejectBooking,
  markBookingInUse, markBookingCompleted, markBookingNoShow,
  type Booking, type BookingStatus,
} from "@/services/bookingService";
import { listEquipment, type Equipment } from "@/services/equipmentService";
import { listDepartments, type Department } from "@/services/referenceService";
import { apiErrorMessage } from "@/services/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/bookings")({
  component: BookingsPage,
  head: () => ({
    meta: [
      { title: "Bookings · LabGrid" },
      {
        name: "description",
        content: "Reserve lab equipment by department and manage approvals across your institution.",
      },
      { property: "og:title", content: "Bookings · LabGrid" },
      {
        property: "og:description",
        content: "Reserve lab equipment by department and manage approvals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const PAGE_SIZE = 10;

const statusVariant = (s: BookingStatus) =>
  s === "APPROVED" || s === "COMPLETED" || s === "IN_USE" ? "default"
  : s === "REJECTED" || s === "CANCELLED" || s === "NO_SHOW" ? "destructive"
  : "secondary";

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};
const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
/** datetime-local value -> yyyy-MM-ddTHH:mm:ss expected by the backend. */
const toLocalDateTime = (v: string) => (v.length === 16 ? `${v}:00` : v);

function NewBookingDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const departments = useApi<Department[]>(listDepartments, []);
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const [departmentId, setDepartmentId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);

  // Equipment list refreshes whenever the selected department changes.
  const departmentEquipment = useMemo(() => {
    if (!departmentId) return [];
    return (equipment.data ?? []).filter((e) => String(e.departmentId ?? "") === departmentId);
  }, [equipment.data, departmentId]);

  const pickDepartment = (v: string) => {
    setDepartmentId(v);
    setEquipmentId("");
  };

  const submit = async () => {
    if (!departmentId) return toast.error("Please select a department");
    if (!equipmentId) return toast.error("Please select equipment");
    if (!start || !end) return toast.error("Please choose a start and end time");
    if (new Date(end) <= new Date(start)) return toast.error("End time must be after start time");
    setBusy(true);
    try {
      await createBooking({
        equipmentId: Number(equipmentId),
        startTime: toLocalDateTime(start),
        endTime: toLocalDateTime(end),
        purpose: purpose || undefined,
      });
      toast.success("Booking request submitted");
      setOpen(false);
      setDepartmentId(""); setEquipmentId(""); setStart(""); setEnd(""); setPurpose("");
      onCreated();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to create booking"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-3 w-3" /> New booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Equipment</DialogTitle>
          <DialogDescription>Pick a department first, then the equipment inside it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Department</Label>
            <SearchableSelect
              value={departmentId}
              onChange={pickDepartment}
              placeholder={departments.loading ? "Loading departments…" : "Select department"}
              searchPlaceholder="Search departments..."
              options={(departments.data ?? []).map((d) => ({
                value: String(d.departmentId),
                label: d.departmentName,
              }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Equipment</Label>
            <SearchableSelect
              value={equipmentId}
              onChange={setEquipmentId}
              disabled={!departmentId}
              placeholder={
                !departmentId ? "Select a department first"
                : equipment.loading ? "Loading equipment…"
                : "Select equipment"
              }
              searchPlaceholder="Search equipment..."
              emptyText="No equipment in this department."
              options={departmentEquipment.map((e) => ({
                value: String(e.equipmentId),
                label: e.equipmentName,
                hint: e.status?.replace(/_/g, " "),
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="bk-start">Start</Label>
              <Input id="bk-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bk-end">End</Label>
              <Input id="bk-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bk-purpose">Purpose</Label>
            <Textarea id="bk-purpose" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe what you'll use it for" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Booking…" : "Book"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "STUDENT" || user?.role === "RESEARCHER";
  const canManage = user?.role === "LAB_MANAGER" || user?.role === "DEPARTMENT_HEAD" ||
                    user?.role === "INSTITUTION_ADMIN" || user?.role === "SYSTEM_ADMIN";
  const canOperate = user?.role === "LAB_TECHNICIAN" || user?.role === "LAB_MANAGER" || user?.role === "SYSTEM_ADMIN";

  const fetcher = isOwner ? listMyBookings : listBookings;
  const state = useApi<Booking[]>(fetcher, [isOwner]);
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const equipmentNames = useMemo(
    () => new Map((equipment.data ?? []).map((e) => [e.equipmentId, e.equipmentName])),
    [equipment.data],
  );

  const filtered = useMemo(() => {
    const list = state.data ?? [];
    return list.filter((b) => {
      const okStatus = status === "all" || b.status === status;
      const name = equipmentNames.get(b.equipmentId) ?? "";
      const hay = `${name} ${b.equipmentId} ${b.userId} ${b.purpose ?? ""}`.toLowerCase();
      return okStatus && hay.includes(q.toLowerCase());
    });
  }, [state.data, q, status, equipmentNames]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success(label);
      state.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, `${label} failed`));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwner ? "My Bookings" : "Booking Management"}
        description={isOwner ? "Track and cancel your equipment reservations." : "Approve, reject, and monitor lab bookings."}
        actions={isOwner ? <NewBookingDialog onCreated={state.reload} /> : undefined}
      />
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search by equipment, user ID, purpose..." value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_USE">In use</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> :
        filtered.length === 0 ? <EmptyState title="No bookings found" /> : (
          <>
            <div className="rounded-xl border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slice.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.id}</TableCell>
                      <TableCell>{equipmentNames.get(b.equipmentId) ?? `#${b.equipmentId}`}</TableCell>
                      <TableCell>#{b.userId}</TableCell>
                      <TableCell>{fmtDate(b.startTime)}</TableCell>
                      <TableCell>{fmtTime(b.startTime)}{b.endTime ? ` – ${fmtTime(b.endTime)}` : ""}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{b.purpose ?? "—"}</TableCell>
                      <TableCell><Badge variant={statusVariant(b.status)}>{b.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {isOwner && (b.status === "PENDING" || b.status === "APPROVED") && (
                            <Button size="sm" variant="outline"
                              onClick={() => run("Booking cancelled", () => cancelBooking(b.id))}>
                              Cancel
                            </Button>
                          )}
                          {canManage && b.status === "PENDING" && (
                            <>
                              <Button size="sm" onClick={() => run("Booking approved", () => approveBooking(b.id))}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => run("Booking rejected", () => rejectBooking(b.id))}>
                                Reject
                              </Button>
                            </>
                          )}
                          {canOperate && b.status === "APPROVED" && (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => run("Marked in-use", () => markBookingInUse(b.id))}>
                                Start
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => run("Marked no-show", () => markBookingNoShow(b.id))}>
                                No-show
                              </Button>
                            </>
                          )}
                          {canOperate && b.status === "IN_USE" && (
                            <Button size="sm" onClick={() => run("Booking completed", () => markBookingCompleted(b.id))}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {pages} · {filtered.length} results</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
