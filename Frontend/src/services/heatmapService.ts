import { getEquipmentHeatmapData, getDepartmentStats } from "./dashboardService";
import { listBookings, listMyBookings } from "./bookingService";
import { me } from "./authService";

/**
 * Heatmaps.
 * Students & Researchers -> My Bookings
 * Management -> All Bookings
 */

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Automatically load correct bookings based on role.
 */
async function loadBookings() {
  const user = await me();

  if (user.role === "STUDENT" || user.role === "RESEARCHER") {
    return await listMyBookings();
  }

  return await listBookings();
}

export async function getHourlyHeatmap(): Promise<HeatmapCell[]> {
  const bookings = await loadBookings();

  const counts = new Map<string, number>();

  for (const b of bookings) {
    const d = new Date(b.startTime);

    if (isNaN(d.getTime())) continue;

    const key = `${DAY_NAMES[d.getDay()]}|${pad(d.getHours())}:00`;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, value]) => {
    const [x, y] = key.split("|");
    return { x, y, value };
  });
}

export async function getDailyHeatmap(): Promise<HeatmapCell[]> {
  const bookings = await loadBookings();

  const counts = new Map<string, number>();

  for (const b of bookings) {
    const d = new Date(b.startTime);

    if (isNaN(d.getTime())) continue;

    const week = `Week ${Math.ceil(d.getDate() / 7)}`;

    const key = `${DAY_NAMES[d.getDay()]}|${week}`;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, value]) => {
    const [x, y] = key.split("|");
    return { x, y, value };
  });
}

export async function getEquipmentHeatmap(): Promise<HeatmapCell[]> {
  const rows = await getEquipmentHeatmapData();

  return rows.map((r) => ({
    x: "Utilisation",
    y: r.equipmentName ?? `#${r.equipmentId}`,
    value: Math.round(r.utilization ?? 0),
  }));
}

export async function getDepartmentHeatmap(): Promise<HeatmapCell[]> {
  const rows = await getDepartmentStats();

  return rows.map((r) => ({
    x: "Bookings",
    y: r.name,
    value: Number(r.value ?? 0),
  }));
}

export async function getBookingDensityHeatmap(): Promise<HeatmapCell[]> {
  const [bookings, heat] = await Promise.all([
    loadBookings(),
    getEquipmentHeatmapData(),
  ]);

  const names = new Map(
    heat.map((h) => [h.equipmentId, h.equipmentName])
  );

  const counts = new Map<string, number>();

  for (const b of bookings) {
    const d = new Date(b.startTime);

    if (isNaN(d.getTime())) continue;

    const key = `${pad(d.getHours())}:00|${
      names.get(b.equipmentId) ?? `#${b.equipmentId}`
    }`;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, value]) => {
    const [x, y] = key.split("|");
    return { x, y, value };
  });
}