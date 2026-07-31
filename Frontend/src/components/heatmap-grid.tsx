import type { HeatmapCell } from "@/services/heatmapService";
import { EmptyState } from "@/components/async-state";

interface HeatmapGridProps {
  cells: HeatmapCell[];
  xLabels?: string[];
  yLabels?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Semantic-token heat scale using primary color at increasing alpha. */
function cellStyle(v: number, max: number): React.CSSProperties {
  if (max <= 0) return { backgroundColor: "var(--color-muted)" };
  const t = Math.min(1, v / max);
  return {
    backgroundColor: `color-mix(in oklab, var(--color-primary) ${Math.round(t * 90)}%, var(--color-muted))`,
    color: t > 0.55 ? "var(--color-primary-foreground)" : "var(--color-foreground)",
  };
}

export function HeatmapGrid({
  cells,
  xLabels,
  yLabels,
  emptyTitle = "No heatmap data",
  emptyDescription = "This endpoint is not yet implemented on the backend.",
}: HeatmapGridProps) {
  if (!cells || cells.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  const xs = xLabels ?? Array.from(new Set(cells.map((c) => c.x)));
  const ys = yLabels ?? Array.from(new Set(cells.map((c) => c.y)));
  const map = new Map(cells.map((c) => [`${c.x}|${c.y}`, c.value]));
  const max = Math.max(...cells.map((c) => c.value));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background p-1 text-left font-medium text-muted-foreground" />
            {xs.map((x) => (
              <th key={x} className="p-1 text-center font-medium text-muted-foreground">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ys.map((y) => (
            <tr key={y}>
              <td className="sticky left-0 bg-background p-1 pr-2 text-right font-medium text-muted-foreground">
                {y}
              </td>
              {xs.map((x) => {
                const v = map.get(`${x}|${y}`) ?? 0;
                return (
                  <td key={`${x}-${y}`} className="p-0">
                    <div
                      className="flex h-8 min-w-10 items-center justify-center rounded-md text-[10px] font-medium transition"
                      style={cellStyle(v, max)}
                      title={`${x} · ${y}: ${v}`}
                    >
                      {v > 0 ? v : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
