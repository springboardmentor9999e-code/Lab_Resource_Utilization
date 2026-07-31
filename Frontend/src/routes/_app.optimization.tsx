import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Calendar, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listEquipment, type Equipment } from "@/services/equipmentService";
import {
  checkConflicts,
  suggestAlternativeEquipment,
  suggestSlots,
  type ConflictCheckResult,
  type SlotSuggestion,
} from "@/services/optimizationService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/_app/optimization")({
  component: OptimizationPage,
  head: () => ({
    meta: [
      { title: "Smart Scheduling · LabGrid" },
      {
        name: "description",
        content: "Detect conflicts and get AI-driven alternative slot or equipment suggestions.",
      },
    ],
  }),
});

function OptimizationPage() {
  const equipment = useApi<Equipment[]>(listEquipment, []);
  const [form, setForm] = useState({ equipmentId: "", start: "", end: "", duration: 60 });
  const [checking, setChecking] = useState(false);
  const [conflict, setConflict] = useState<ConflictCheckResult | null>(null);
  const [slots, setSlots] = useState<SlotSuggestion[]>([]);
  const [alts, setAlts] = useState<SlotSuggestion[]>([]);

  const run = async () => {
    if (!form.equipmentId || !form.start || !form.end) {
      toast.error("Fill equipment and time window first");
      return;
    }
    setChecking(true);
    try {
      const eq = Number(form.equipmentId);
      const [c, s, a] = await Promise.all([
        checkConflicts({ equipmentId: eq, startTime: form.start, endTime: form.end }),
        suggestSlots({ equipmentId: eq, durationMinutes: Number(form.duration) }),
        suggestAlternativeEquipment({
          categoryId: 0,
          startTime: form.start,
          endTime: form.end,
        }),
      ]);
      setConflict(c);
      setSlots(s);
      setAlts(a);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Optimization service unavailable"));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Scheduling"
        description="Check conflicts and get suggestions for the best time and equipment."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conflicts detected"
          value={conflict ? conflict.conflictingBookingIds.length : "—"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Slot suggestions"
          value={slots.length}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Equipment alternatives"
          value={alts.length}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Status"
          value={conflict ? (conflict.hasConflict ? "Conflicting" : "Clear") : "Idle"}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-1 md:col-span-2">
            <Label>Equipment</Label>
            <Select
              value={form.equipmentId}
              onValueChange={(v) => setForm((f) => ({ ...f, equipmentId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {(equipment.data ?? []).map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.equipmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>End</Label>
            <Input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              min={15}
              step={15}
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={run} disabled={checking}>
            <Wand2 className="mr-2 h-3 w-3" />
            {checking ? "Analysing…" : "Run smart check"}
          </Button>
        </div>
      </div>

      {conflict && (
        <Alert variant={conflict.hasConflict ? "destructive" : "default"}>
          {conflict.hasConflict ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>
            {conflict.hasConflict
              ? `Conflict with ${conflict.conflictingBookingIds.length} booking(s)`
              : "Slot is clear"}
          </AlertTitle>
          <AlertDescription>
            {conflict.hasConflict
              ? `Booking IDs: ${conflict.conflictingBookingIds.join(", ")}`
              : "No overlap detected for the requested window."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Alternative Slots</h3>
            <p className="text-xs text-muted-foreground">Ranked by score</p>
          </div>
          {slots.length === 0 ? (
            <EmptyState
              title="No slot suggestions"
              description="Run a smart check to see alternative time windows here."
            />
          ) : (
            <ul className="divide-y">
              {slots.map((s, i) => (
                <li key={i} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(s.startTime).toLocaleString()} →{" "}
                      {new Date(s.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.equipmentName ?? `Equipment #${s.equipmentId}`}
                    </div>
                  </div>
                  <Badge>{Math.round(s.score * 100)}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Alternative Equipment</h3>
            <p className="text-xs text-muted-foreground">Same category, available window</p>
          </div>
          {alts.length === 0 ? (
            <EmptyState
              title="No equipment alternatives"
              description="Suggestions will appear once the optimization backend is wired up."
            />
          ) : (
            <ul className="divide-y">
              {alts.map((s, i) => (
                <li key={i} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium">
                      {s.equipmentName ?? `Equipment #${s.equipmentId}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.startTime).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="secondary">{Math.round(s.score * 100)}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
