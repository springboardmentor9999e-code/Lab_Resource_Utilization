import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { utilizationApi } from "../api/utilization";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState, StatCard } from "../components/ui";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: toLocalInput(from), to: toLocalInput(to) };
}

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function UtilizationPage() {
  const { user } = useAuth();
  const [range, setRange] = useState(defaultRange);
  const [heatmap, setHeatmap] = useState([]);
  const [idle, setIdle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showIdle = can(user?.role, "utilization:idle");

  function load() {
    setLoading(true);
    setError(null);
    const calls = [
      utilizationApi.heatmap(range.from, range.to),
      showIdle ? utilizationApi.idle() : Promise.resolve([]),
    ];
    return Promise.all(calls)
      .then(([h, i]) => {
        setHeatmap(h);
        setIdle(i);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load utilization data."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => [...heatmap].sort((a, b) => b.utilizationRatePercent - a.utilizationRatePercent),
    [heatmap]
  );

  const avgUtilization = useMemo(() => {
    if (heatmap.length === 0) return 0;
    const sum = heatmap.reduce((acc, e) => acc + (e.utilizationRatePercent || 0), 0);
    return Math.round((sum / heatmap.length) * 10) / 10;
  }, [heatmap]);

  const underutilized = heatmap.filter((e) => e.utilizationRatePercent < 20).length;

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Utilization"
        description="How intensively equipment is actually used, over the selected window."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex items-end gap-3 mb-6 flex-wrap"
      >
        <div>
          <label htmlFor="from" className="block text-xs font-medium text-[var(--color-ink-600)] mb-1">
            From
          </label>
          <input
            id="from"
            type="datetime-local"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="rounded-md border border-[var(--color-paper-200)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20"
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs font-medium text-[var(--color-ink-600)] mb-1">
            To
          </label>
          <input
            id="to"
            type="datetime-local"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="rounded-md border border-[var(--color-paper-200)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
        >
          Update
        </button>
      </form>

      {error && <ErrorState message={error} />}
      {loading ? (
        <LoadingState label="Crunching utilization data…" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Equipment tracked" value={heatmap.length} />
            <StatCard label="Average utilization" value={`${avgUtilization}%`} accent />
            <StatCard label="Underutilized (<20%)" value={underutilized} sublabel="candidates for sharing or reallocation" />
          </div>

          <Card className="p-6 mb-6">
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)] mb-1">
              Utilization heatmap
            </h2>
            <p className="text-sm text-[var(--color-ink-600)] mb-5">
              Each row is one piece of equipment; the bar shows used time as a share of the
              selected window.
            </p>

            {sorted.length === 0 ? (
              <EmptyState
                title="No usage data in this window"
                description="Utilization logs are recorded automatically when bookings are marked Completed."
              />
            ) : (
              <div className="space-y-3">
                {sorted.map((e) => (
                  <HeatmapRow key={e.equipmentId} entry={e} />
                ))}
              </div>
            )}
          </Card>

          {showIdle && (
            <Card className="p-6">
              <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)] mb-1">
                Idle equipment
              </h2>
              <p className="text-sm text-[var(--color-ink-600)] mb-5">
                Equipment with no logged usage in the last 72+ hours — candidates for
                reallocation or an idle alert to the lab manager.
              </p>
              {idle.length === 0 ? (
                <EmptyState title="Nothing idle" description="All equipment has recent usage logged." />
              ) : (
                <ul className="divide-y divide-[var(--color-paper-200)]">
                  {idle.map((item) => (
                    <li key={item.equipmentId} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-[var(--color-ink-900)]">{item.equipmentName}</p>
                        <p className="text-xs text-[var(--color-ink-600)] mt-0.5">
                          {item.lastUsed ? `Last used ${new Date(item.lastUsed).toLocaleDateString()}` : "Never used"}
                        </p>
                      </div>
                      <span className="font-[var(--font-mono)] text-xs px-2 py-1 rounded-full bg-[var(--color-status-maintenance-bg)] text-[var(--color-status-maintenance)]">
                        {item.idleHours != null ? `${item.idleHours}h idle` : "no data"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}
    </>
  );
}

function HeatmapRow({ entry }) {
  const pct = Math.min(100, Math.max(0, entry.utilizationRatePercent || 0));
  const color = pct >= 60 ? "var(--color-status-available)" : pct >= 20 ? "var(--color-status-booked)" : "var(--color-status-maintenance)";

  return (
    <div className="flex items-center gap-4">
      <div className="w-40 shrink-0">
        <p className="text-sm font-medium text-[var(--color-ink-900)] truncate">{entry.equipmentName}</p>
        <p className="text-xs text-[var(--color-ink-600)]">{entry.category || "—"}</p>
      </div>
      <div className="flex-1 h-6 rounded-full bg-[var(--color-paper-100)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-14 shrink-0 text-right font-[var(--font-mono)] text-sm text-[var(--color-ink-900)]">
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}
