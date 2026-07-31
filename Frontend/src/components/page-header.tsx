import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
