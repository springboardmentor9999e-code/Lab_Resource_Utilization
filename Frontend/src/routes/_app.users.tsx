import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { listUsers, setUserActive, deleteUser, type AppUser } from "@/services/userService";
import { apiErrorMessage } from "@/services/api";
import { ROLE_LABEL, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

function UsersPage() {
  const { user } = useAuth();
  const isSysAdmin = user?.role === "SYSTEM_ADMIN";
  const state = useApi<AppUser[]>(listUsers, []);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const list = state.data ?? [];
    const term = q.toLowerCase();
    return list.filter((u) =>
      `${u.name} ${u.email} ${u.roleName} ${u.phone ?? ""}`.toLowerCase().includes(term),
    );
  }, [state.data, q]);

  const toggleActive = async (u: AppUser) => {
    try {
      await setUserActive(u.id, !u.active);
      toast.success(u.active ? "User deactivated" : "User activated");
      state.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update user"));
    }
  };

  const remove = async (u: AppUser) => {
    if (!confirm(`Delete ${u.name || u.email}? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      toast.success("User deleted");
      state.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete user"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Institution-wide user directory and roles." />
      <Input placeholder="Search users..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />

      {state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> :
        filtered.length === 0 ? <EmptyState title="No users found" /> : (
          <div className="rounded-xl border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell><Badge variant="secondary">{ROLE_LABEL[u.roleName] ?? u.roleName}</Badge></TableCell>
                    <TableCell>{u.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "default" : "destructive"}>
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>
                          {u.active ? "Deactivate" : "Activate"}
                        </Button>
                        {isSysAdmin && (
                          <Button size="sm" variant="destructive" onClick={() => remove(u)}>Delete</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
}
