import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center">
      <AlertCircle className="h-6 w-6 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No data available",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-10 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

/** Convenience wrapper: choose the right state based on api hook output. */
export function AsyncBoundary<T>({
  state,
  children,
  emptyWhen,
  emptyTitle,
  emptyDescription,
}: {
  state: { data: T | null; loading: boolean; error: string | null; reload: () => void };
  children: (data: T) => ReactNode;
  emptyWhen?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.data) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  if (emptyWhen && emptyWhen(state.data))
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(state.data)}</>;
}
