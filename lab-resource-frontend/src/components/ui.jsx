export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-[var(--color-paper-200)] rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sublabel, accent = false }) {
  return (
    <Card className="p-5">
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-wide text-[var(--color-ink-600)]">
        {label}
      </p>
      <p
        className={`font-[var(--font-display)] text-3xl mt-2 ${
          accent ? "text-[var(--color-brass-600)]" : "text-[var(--color-ink-900)]"
        }`}
      >
        {value}
      </p>
      {sublabel && <p className="text-sm text-[var(--color-ink-600)] mt-1">{sublabel}</p>}
    </Card>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)] py-8 justify-center">
      <span
        className="h-3.5 w-3.5 rounded-full border-2 border-[var(--color-brass-500)] border-t-transparent animate-spin"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-ink-600)] mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div
      role="alert"
      className="rounded-md bg-[var(--color-status-maintenance-bg)] px-4 py-3 text-sm text-[var(--color-status-maintenance)]"
    >
      {message}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        {eyebrow && (
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.15em] text-[var(--color-brass-600)] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-ink-900)]">{title}</h1>
        {description && <p className="text-sm text-[var(--color-ink-600)] mt-1.5 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
