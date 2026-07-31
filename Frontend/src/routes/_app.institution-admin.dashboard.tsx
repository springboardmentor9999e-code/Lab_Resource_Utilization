import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, FlaskConical, Users, FileBarChart2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listUsers, type AppUser } from "@/services/userService";
import { listEquipment } from "@/services/equipmentService";
import { ROLE_LABEL } from "@/lib/auth";

export const Route = createFileRoute("/_app/institution-admin/dashboard")({ component: InstitutionAdmin });

const displayName = (u: AppUser) => u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;

function InstitutionAdmin() {
  const users = useApi(listUsers, []);
  const equipment = useApi(listEquipment, []);
  const uList = users.data ?? [];
  const eList = equipment.data ?? [];
  const departments = Array.from(new Set(eList.map((e) => e.department).filter(Boolean))) as string[];
  const activeUsers = uList.filter((u) => u.active !== false).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Admin Dashboard"
        description="Manage institution, departments, equipment, and users."
        actions={<Button asChild><Link to="/users">Manage users</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Departments" value={equipment.loading ? "…" : departments.length} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Equipment" value={equipment.loading ? "…" : eList.length} icon={<FlaskConical className="h-4 w-4" />} />
        <StatCard label="Active Users" value={users.loading ? "…" : activeUsers} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Reports" value="N/A" hint="Reports API required" icon={<FileBarChart2 className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Department Management</h3>
          {equipment.loading ? <LoadingState /> : equipment.error ? <ErrorState message={equipment.error} onRetry={equipment.reload} /> :
            departments.length === 0 ? <EmptyState title="No departments" /> : (
              <div className="space-y-2">
                {departments.map((d) => (
                  <div key={d} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">{d}</div>
                      <div className="text-xs text-muted-foreground">
                        {eList.filter((e) => e.department === d).length} equipment
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled title="Department config API required">Configure</Button>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Recent Users</h3>
          {users.loading ? <LoadingState /> : users.error ? <ErrorState message={users.error} onRetry={users.reload} /> :
            uList.length === 0 ? <EmptyState title="No users" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Dept</TableHead></TableRow></TableHeader>
                <TableBody>
                  {uList.slice(0, 8).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{displayName(u)}</TableCell>
                      <TableCell><Badge variant="secondary">{ROLE_LABEL[u.roleName] ?? u.roleName}</Badge></TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </div>
      </div>
    </div>
  );
}
