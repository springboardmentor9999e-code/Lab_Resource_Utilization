import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Clock, ListOrdered, Plus, Users2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/searchable-select";
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
  joinWaitlist,
  leaveWaitlist,
  listMyWaitlist,
  type WaitlistEntry,
} from "@/services/waitlistService";
import { listEquipment, type Equipment } from "@/services/equipmentService";
import { apiErrorMessage } from "@/services/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/waitlist")({
  component: WaitlistPage,
  head: () => ({
    meta: [
      { title: "Waitlist · LabGrid" },
      {
        name: "description",
        content: "Join queues for busy equipment and track your position in real time.",
      },
      { property: "og:title", content: "Waitlist · LabGrid" },
      {
        property: "og:description",
        content: "Join queues for busy equipment and track your position in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function WaitlistPage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const fetchMine = useCallback(
    () => (userId ? listMyWaitlist(userId) : Promise.resolve([] as WaitlistEntry[])),
    [userId],
  );
  const state = useApi<WaitlistEntry[]>(fetchMine, [userId]);
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const [open, setOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [busy, setBusy] = useState(false);

  const entries = state.data ?? [];
  const active = entries.filter((e) => e.status === "WAITING");
  const promoted = entries.filter((e) => e.status !== "WAITING");
  const nextUp = active[0];

  const equipmentNames = useMemo(
    () => new Map((equipment.data ?? []).map((e) => [e.equipmentId, e.equipmentName])),
    [equipment.data],
  );

  const canJoin = user?.role === "STUDENT" || user?.role === "RESEARCHER";

  const submit = async () => {
    if (!equipmentId) {
      toast.error("Please select equipment");
      return;
    }
    setBusy(true);
    try {
      await joinWaitlist({ equipmentId: Number(equipmentId), userId });
      toast.success("Added to waitlist");
      state.reload();
      setOpen(false);
      setEquipmentId("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to join waitlist"));
    } finally {
      setBusy(false);
    }
  };

  const leave = async (id: number) => {
    try {
      await leaveWaitlist(id);
      toast.success("Left waitlist");
      state.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waitlist"
        description="Queue for high-demand equipment and get promoted automatically."
        actions={
          canJoin ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-3 w-3" /> Join waitlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Equipment Waitlist</DialogTitle>
                  <DialogDescription>
                    You'll be queued as soon as the request is accepted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Equipment</Label>
                    <SearchableSelect
                      value={equipmentId}
                      onChange={setEquipmentId}
                      placeholder="Select equipment"
                      searchPlaceholder="Search equipment..."
                      options={(equipment.data ?? []).map((e) => ({
                        value: String(e.equipmentId),
                        label: e.equipmentName,
                        hint: e.status?.replace(/_/g, " "),
                      }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submit} disabled={busy}>
                    {busy ? "Joining…" : "Join waitlist"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active"
          value={state.loading ? "…" : active.length}
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <StatCard
          label="Resolved"
          value={state.loading ? "…" : promoted.length}
          icon={<Users2 className="h-4 w-4" />}
        />
        <StatCard
          label="Next position"
          value={state.loading ? "…" : (nextUp?.position ?? "—")}
          hint={
            nextUp
              ? `for ${equipmentNames.get(nextUp.equipmentId) ?? "#" + nextUp.equipmentId}`
              : undefined
          }
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <StatCard
          label="Queued since"
          value={
            state.loading
              ? "…"
              : nextUp?.createdAt
                ? new Date(nextUp.createdAt).toLocaleDateString()
                : "—"
          }
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">My Waitlist</h3>
          <p className="text-xs text-muted-foreground">
            Positions update automatically as bookings resolve.
          </p>
        </div>
        {state.loading ? (
          <LoadingState />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : entries.length === 0 ? (
          <EmptyState
            title="You're not on any waitlists"
            description="Join a waitlist for busy equipment and we'll queue you automatically."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {equipmentNames.get(e.equipmentId) ?? `#${e.equipmentId}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">#{e.position}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.priority ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{e.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => leave(e.id)}>
                      Leave
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
