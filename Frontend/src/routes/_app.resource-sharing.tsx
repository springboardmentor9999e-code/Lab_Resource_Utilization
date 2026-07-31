import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  Clock,
  Handshake,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import {
  approveShareRequest,
  createShareRequest,
  listSharedEquipment,
  listShareRequests,
  rejectShareRequest,
  type SharedEquipment,
  type ShareRequest,
} from "@/services/resourceSharingService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/resource-sharing")({
  component: SharingPage,
  head: () => ({
    meta: [
      { title: "Resource Sharing · LabGrid" },
      {
        name: "description",
        content: "Borrow and lend equipment between partner institutions.",
      },
    ],
  }),
});

const statusVariant: Record<
  ShareRequest["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  RETURNED: "outline",
};

function SharingPage() {
  const shared = useApi<SharedEquipment[]>(listSharedEquipment, []);
  const requests = useApi<ShareRequest[]>(listShareRequests, []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ equipmentId: "", institutionId: "", purpose: "" });
  const [busy, setBusy] = useState(false);

  const reqs = requests.data ?? [];
  const pending = reqs.filter((r) => r.status === "PENDING");
  const approved = reqs.filter((r) => r.status === "APPROVED");
  const partners = new Set((shared.data ?? []).map((s) => s.ownerInstitutionId)).size;

  const submit = async () => {
    if (!form.equipmentId || !form.institutionId || !form.purpose) {
      toast.error("All fields required");
      return;
    }
    setBusy(true);
    try {
      const res = await createShareRequest({
        equipmentId: Number(form.equipmentId),
        requesterInstitutionId: Number(form.institutionId),
        purpose: form.purpose,
      });
      if (res) {
        toast.success("Borrow request sent");
        requests.reload();
        setOpen(false);
      } else {
        toast.info("Resource-sharing endpoint not yet available on the backend.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const approve = async (id: number) => {
    try {
      await approveShareRequest(id);
      toast.success("Approved");
      requests.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };
  const reject = async (id: number) => {
    try {
      await rejectShareRequest(id);
      toast.success("Rejected");
      requests.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inter-Institution Sharing"
        description="Borrow specialised equipment from partner institutions and lend yours out."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Handshake className="mr-2 h-3 w-3" /> Borrow equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to Borrow</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Equipment ID</Label>
                    <Input
                      value={form.equipmentId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, equipmentId: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Your Institution ID</Label>
                    <Input
                      value={form.institutionId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, institutionId: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Purpose</Label>
                  <Textarea
                    rows={3}
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={busy}>
                  {busy ? "Sending…" : "Send request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Shared Equipment"
          value={shared.data?.length ?? 0}
          icon={<ArrowLeftRight className="h-4 w-4" />}
        />
        <StatCard
          label="Partner Institutions"
          value={partners}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label="Pending Requests"
          value={pending.length}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Active Transfers"
          value={approved.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="shared" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shared">Shared Catalogue</TabsTrigger>
          <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>

        <TabsContent value="shared" className="rounded-xl border bg-card">
          {shared.loading ? (
            <LoadingState />
          ) : shared.error ? (
            <ErrorState message={shared.error} onRetry={shared.reload} />
          ) : (shared.data ?? []).length === 0 ? (
            <EmptyState
              title="No shared equipment yet"
              description="Partner institutions' shared equipment will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Owner Institution</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(shared.data ?? []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.equipmentName}</TableCell>
                    <TableCell>{s.ownerInstitutionName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.availability === "AVAILABLE" ? "default" : "secondary"}
                      >
                        {s.availability}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.since ? new Date(s.since).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="rounded-xl border bg-card">
          {pending.length === 0 ? (
            <EmptyState title="No pending requests" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Requester Inst.</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">#{r.equipmentId}</TableCell>
                    <TableCell>#{r.requesterInstitutionId}</TableCell>
                    <TableCell className="text-xs">{r.purpose}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        onClick={() => reject(r.id)}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => approve(r.id)}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="history" className="rounded-xl border bg-card">
          {reqs.length === 0 ? (
            <EmptyState title="No transfer history yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">#{r.id}</TableCell>
                    <TableCell>#{r.equipmentId}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
