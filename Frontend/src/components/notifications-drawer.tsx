import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/hooks/use-api";
import {
  listNotifications,
  markNotificationRead,
  type Notification,
} from "@/services/notificationService";
import { LoadingState } from "@/components/async-state";

export function NotificationsDrawer() {
  const state = useApi<Notification[]>(listNotifications, []);
  const list = state.data ?? [];
  const unread = list.filter((n) => !n.read).length;

  const markAll = async () => {
    await Promise.all(list.filter((n) => !n.read).map((n) => markNotificationRead(n.id)));
    state.reload();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
            >
              {unread}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle>Notifications</SheetTitle>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAll}>
              <CheckCheck className="mr-2 h-3 w-3" /> Mark all read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="-mx-6 mt-4 flex-1 px-6">
          {state.loading ? (
            <LoadingState />
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">You're all caught up</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Notifications will appear here once the backend endpoint is available.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-lg border p-3 transition ${n.read ? "bg-card" : "border-primary/40 bg-primary/5"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      {n.message && (
                        <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
                      )}
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {n.createdAt && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
