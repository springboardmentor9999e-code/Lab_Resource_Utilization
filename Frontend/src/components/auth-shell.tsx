import type { ReactNode } from "react";
import { Beaker } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Beaker className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">LabGrid</div>
            <div className="text-xs opacity-80">Lab Resource Utilization</div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">Book smarter. Utilize better.</h2>
          <p className="max-w-md text-sm opacity-90">
            Manage equipment, approvals, and analytics across labs, departments, and institutions — all in one enterprise platform.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "12k+", v: "Bookings/mo" },
              { k: "340", v: "Labs" },
              { k: "99.9%", v: "Uptime" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                <div className="text-xl font-semibold">{s.k}</div>
                <div className="text-xs opacity-80">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} LabGrid Systems</div>
      </div>
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Beaker className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">LabGrid</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
