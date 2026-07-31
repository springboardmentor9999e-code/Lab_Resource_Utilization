import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FlaskConical,
  CalendarCheck,
  Users,
  BarChart3,
  LogOut,
  Wrench,
  ClipboardList,
  Building2,
  ShieldCheck,
  FileText,
  Beaker,
  Activity,
  Flame,
  ListOrdered,
  Wand2,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth, ROLE_HOME, ROLE_LABEL, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const workspaceItems = [
  { title: "Equipment", url: "/equipment", icon: FlaskConical },
  { title: "Bookings", url: "/bookings", icon: CalendarCheck },
  { title: "Waitlist", url: "/waitlist", icon: ListOrdered },
];

const intelligenceItems = [
  { title: "Live Utilization", url: "/utilization", icon: Activity },
  { title: "Heatmaps", url: "/heatmaps", icon: Flame },
  { title: "Demand Analysis", url: "/demand", icon: TrendingUp },
  { title: "Smart Scheduling", url: "/optimization", icon: Wand2 },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Resource Sharing", url: "/resource-sharing", icon: ArrowLeftRight },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const roleExtras: Partial<Record<Role, { title: string; url: string; icon: any }[]>> = {
  INSTITUTION_ADMIN: [
    { title: "Users", url: "/users", icon: Users },
    { title: "Institution", url: "/institution-admin/dashboard", icon: Building2 },
  ],
  SYSTEM_ADMIN: [
    { title: "Users", url: "/users", icon: Users },
    { title: "Audit Logs", url: "/system-admin/dashboard", icon: ShieldCheck },
  ],
  LAB_TECHNICIAN: [{ title: "Maintenance", url: "/technician/dashboard", icon: Wrench }],
  LAB_MANAGER: [{ title: "Approvals", url: "/manager/dashboard", icon: ClipboardList }],
  DEPARTMENT_HEAD: [{ title: "Dept Reports", url: "/department-head/dashboard", icon: FileText }],
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;
  const home = ROLE_HOME[user.role];
  const extras = roleExtras[user.role] ?? [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Beaker className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">LabGrid</span>
            <span className="text-xs text-muted-foreground">Resource Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === home}>
                  <Link to={home}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {workspaceItems.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={pathname === i.url}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intelligenceItems.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={pathname === i.url}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {extras.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{ROLE_LABEL[user.role]}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {extras.map((i) => (
                  <SidebarMenuItem key={i.url}>
                    <SidebarMenuButton asChild isActive={pathname === i.url}>
                      <Link to={i.url}>
                        <i.icon />
                        <span>{i.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Button variant="ghost" size="sm" onClick={logout} className="justify-start gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
