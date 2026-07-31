import { getTopEquipment, getEquipmentHeatmapData, getUtilizationSeries } from "./dashboardService";

/**
 * Demand analysis is computed from real backend analytics:
 *   GET /api/dashboard/top-equipment
 *   GET /api/dashboard/heatmap
 *   GET /api/dashboard/utilization
 */

export interface DemandRow {
  equipmentId: number;
  equipmentName: string;
  requests: number;
  utilizationPct: number;
}

const toRow = (r: {
  equipmentId: number;
  equipmentName: string;
  bookings: number;
  utilization: number;
}): DemandRow => ({
  equipmentId: r.equipmentId,
  equipmentName: r.equipmentName ?? `#${r.equipmentId}`,
  requests: Number(r.bookings ?? 0),
  utilizationPct: Math.round(Number(r.utilization ?? 0)),
});

export const getMostRequested = async (): Promise<DemandRow[]> => {
  const rows = await getTopEquipment();
  return rows.map(toRow).sort((a, b) => b.requests - a.requests);
};

export const getLeastRequested = async (): Promise<DemandRow[]> => {
  const rows = await getEquipmentHeatmapData();
  return rows
    .map(toRow)
    .sort((a, b) => a.requests - b.requests)
    .slice(0, 10);
};

export const getDemandTrend = async (): Promise<{ date: string; requests: number }[]> => {
  const series = await getUtilizationSeries();
  return series.map((p) => ({ date: p.day, requests: Number(p.usage ?? 0) }));
};
