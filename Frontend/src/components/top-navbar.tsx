import { Moon, Search, Sun, LogOut } from "lucide-react";
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsDrawer } from "@/components/notifications-drawer";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useNavigate } from "@tanstack/react-router";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const handleSignOut = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <form
        className="relative hidden max-w-md flex-1 md:block"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate({ to: "/equipment" }); }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search equipment, bookings, users..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <NotificationsDrawer />
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-xs font-medium">{user.name}</div>
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">{ROLE_LABEL[user.role]}</Badge>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="px-2 py-2 text-xs">
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground truncate">{user.email}</div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
