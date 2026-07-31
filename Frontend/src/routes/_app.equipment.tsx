import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listEquipment, deleteEquipment, type Equipment } from "@/services/equipmentService";
import {
  listDepartments, listEquipmentCategories, departmentMap, categoryMap,
  type Department, type EquipmentCategory,
} from "@/services/referenceService";
import { apiErrorMessage } from "@/services/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/equipment")({
  component: EquipmentPage,
  head: () => ({
    meta: [
      { title: "Equipment Management · LabGrid" },
      {
        name: "description",
        content: "Browse, filter and manage lab equipment by department, category and status.",
      },
      { property: "og:title", content: "Equipment Management · LabGrid" },
      {
        property: "og:description",
        content: "Browse, filter and manage lab equipment by department, category and status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function EquipmentPage() {
  const { user } = useAuth();
  const canManage = user?.role === "INSTITUTION_ADMIN" || user?.role === "SYSTEM_ADMIN";
  const state = useApi<Equipment[]>(listEquipment, []);
  const departments = useApi<Department[]>(listDepartments, []);
  const categories = useApi<EquipmentCategory[]>(listEquipmentCategories, []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");

  const deptNames = useMemo(() => departmentMap(departments.data), [departments.data]);
  const catNames = useMemo(() => categoryMap(categories.data), [categories.data]);

  const filtered = useMemo(() => {
    const list = state.data ?? [];
    const term = q.toLowerCase();
    return list.filter((e) => {
      const okStatus = status === "all" || e.status === status;
      const okDept = departmentId === "all" || String(e.departmentId ?? "") === departmentId;
      const okCat = categoryId === "all" || String(e.categoryId ?? "") === categoryId;
      const hay = `${e.equipmentName} ${e.modelNo ?? ""} ${e.serialNo ?? ""} ${e.description ?? ""}`.toLowerCase();
      return okStatus && okDept && okCat && hay.includes(term);
    });
  }, [state.data, q, status, departmentId, categoryId]);

  const remove = async (e: Equipment) => {
    if (!confirm(`Delete ${e.equipmentName}?`)) return;
    try {
      await deleteEquipment(e.equipmentId);
      toast.success("Equipment deleted");
      state.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete equipment"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Management"
        description="Browse, filter, and manage lab equipment."
      />
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="w-full sm:w-56">
          <SearchableSelect
            value={departmentId}
            onChange={setDepartmentId}
            placeholder={departments.loading ? "Loading departments…" : "All departments"}
            searchPlaceholder="Search departments..."
            options={[
              { value: "all", label: "All departments" },
              ...(departments.data ?? []).map((d) => ({
                value: String(d.departmentId),
                label: d.departmentName,
              })),
            ]}
          />
        </div>
        <div className="w-full sm:w-56">
          <SearchableSelect
            value={categoryId}
            onChange={setCategoryId}
            placeholder={categories.loading ? "Loading categories…" : "All categories"}
            searchPlaceholder="Search categories..."
            options={[
              { value: "all", label: "All categories" },
              ...(categories.data ?? []).map((c) => ({
                value: String(c.categoryId),
                label: c.categoryName,
              })),
            ]}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="UNDER_MAINTENANCE">Under maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> :
        filtered.length === 0 ? <EmptyState title="No equipment found" description="Try adjusting your filters." /> : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Model No.</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.equipmentName}</div>
                    {e.description && (
                      <div className="max-w-[240px] truncate text-xs text-muted-foreground">{e.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{e.modelNo || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{e.serialNo || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {e.departmentId ? (deptNames.get(e.departmentId) ?? `#${e.departmentId}`) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {e.categoryId ? (catNames.get(e.categoryId) ?? `#${e.categoryId}`) : "—"}
                  </TableCell>
                  <TableCell>
                    {e.status && (
                      <Badge variant={e.status === "AVAILABLE" ? "default" : e.status === "UNDER_MAINTENANCE" ? "destructive" : "secondary"}>
                        {e.status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => remove(e)}>Delete</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
