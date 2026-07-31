import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { useAuth, ROLE_HOME, type Role } from "@/lib/auth";

export const Route = createFileRoute("/_app")({ component: AppLayout });

// Map route prefixes to roles that MAY access them.
const ROLE_ROUTES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/student", roles: ["STUDENT"] },
  { prefix: "/researcher", roles: ["RESEARCHER"] },
  { prefix: "/technician", roles: ["LAB_TECHNICIAN"] },
  { prefix: "/manager", roles: ["LAB_MANAGER"] },
  { prefix: "/department-head", roles: ["DEPARTMENT_HEAD"] },
  { prefix: "/institution-admin", roles: ["INSTITUTION_ADMIN", "SYSTEM_ADMIN"] },
  { prefix: "/system-admin", roles: ["SYSTEM_ADMIN"] },
];

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    const match = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
    if (match && !match.roles.includes(user.role)) {
      navigate({ to: ROLE_HOME[user.role], replace: true });
    }
  }, [user, loading, pathname, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <TopNavbar />
          <main className="flex-1 space-y-6 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
