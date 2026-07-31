import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Activity, AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listEquipment, type Equipment } from "@/services/equipmentService";
import { listMaintenance, completeMaintenance, type MaintenanceRequest } from "@/services/maintenanceService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/technician/dashboard")({ component: TechnicianDashboard });

function TechnicianDashboard() {
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const maintenance = useApi<MaintenanceRequest[]>(listMaintenance, []);
  const eqList = equipment.data ?? [];
  const mList = maintenance.data ?? [];
  const inUse = eqList.filter((e) => e.status === "IN_USE" || e.status === "BOOKED").length;
  const openReqs = mList.filter((m) => (m.status ?? "").toUpperCase() !== "COMPLETED");
  const urgent = openReqs.filter((m) => (m.maintenanceType ?? "").toUpperCase() === "BREAKDOWN");
  const equipmentNames = new Map(eqList.map((e) => [e.equipmentId, e.equipmentName]));

  const resolve = async (m: MaintenanceRequest) => {
    try {
      await completeMaintenance(m.id);
      toast.success("Maintenance marked completed");
      maintenance.reload();
      equipment.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Technician Dashboard" description="Monitor equipment status, maintenance, and active sessions." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monitored Equipment" value={equipment.loading ? "…" : eqList.length} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Active Sessions" value={equipment.loading ? "…" : inUse} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Maintenance Requests" value={maintenance.loading ? "…" : openReqs.length} hint={urgent.length ? `${urgent.length} urgent` : undefined} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Alerts" value={maintenance.loading ? "…" : urgent.length} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Equipment Status</h3>
        {equipment.loading ? <LoadingState /> : equipment.error ? <ErrorState message={equipment.error} onRetry={equipment.reload} /> :
          eqList.length === 0 ? <EmptyState title="No equipment records" /> : (
            <div className="grid gap-3 md:grid-cols-2">
              {eqList.map((e) => (
                <div key={e.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{e.equipmentName || e.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{[e.lab, e.equipmentCode].filter(Boolean).join(" · ")}</div>
                    </div>
                    {e.status && (
                      <Badge variant={e.status === "AVAILABLE" ? "default" : e.status === "MAINTENANCE" || e.status === "OUT_OF_SERVICE" ? "destructive" : "secondary"}>
                        {e.status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                  {typeof e.utilization === "number" && (
                    <>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{e.utilization}%</span>
                      </div>
                      <Progress value={e.utilization} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Maintenance Requests</h3>
        {maintenance.loading ? <LoadingState /> : maintenance.error ? <ErrorState message={maintenance.error} onRetry={maintenance.reload} /> :
          openReqs.length === 0 ? <EmptyState title="No open maintenance requests" /> : (
            <div className="space-y-2">
              {openReqs.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">{equipmentNames.get(m.equipmentId) ?? `Equipment #${m.equipmentId}`}</div>
                    <div className="text-xs text-muted-foreground">#{m.id} · {m.issue ?? m.issueDescription ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.maintenanceType && (
                      <Badge variant={(m.maintenanceType ?? "").toUpperCase() === "BREAKDOWN" ? "destructive" : "secondary"}>{m.maintenanceType}</Badge>
                    )}
                    <Badge variant="outline">{m.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => resolve(m)}>Complete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
