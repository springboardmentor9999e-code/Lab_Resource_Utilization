import { getEquipmentDashboardCounts, listEquipment } from "./equipmentService";
import { listBookings, listMyBookings } from "./bookingService";
import { getUtilizationSeries } from "./dashboardService";
import { me } from "./authService";

export interface LiveUtilizationSummary {
  totalEquipment: number;
  availableEquipment: number;
  bookedEquipment: number;
  underMaintenanceEquipment: number;
  activeBookings: number;
  runningSessions: number;
  liveUtilizationPct: number;
}

/**
 * Load bookings according to logged-in user's role.
 */
async function loadBookings() {
  const user = await me();

  if (user.role === "STUDENT" || user.role === "RESEARCHER") {
    return await listMyBookings();
  }

  return await listBookings();
}

/** Derived on the frontend from existing endpoints until a dedicated one exists. */
export async function getLiveUtilization(): Promise<LiveUtilizationSummary> {
  const [counts, bookings, equipment] = await Promise.all([
    getEquipmentDashboardCounts().catch(() => null),
    loadBookings().catch(() => []),
    listEquipment().catch(() => []),
  ]);

  const totalEquipment = counts?.totalEquipment ?? equipment.length;
  const availableEquipment = counts?.availableEquipment ?? 0;
  const bookedEquipment = counts?.bookedEquipment ?? 0;
  const underMaintenanceEquipment = counts?.underMaintenanceEquipment ?? 0;

  const activeBookings = bookings.filter(
    (b) => b.status === "APPROVED" || b.status === "IN_USE"
  ).length;

  const runningSessions = bookings.filter(
    (b) => b.status === "IN_USE"
  ).length;

  const liveUtilizationPct = totalEquipment
    ? Math.min(
        100,
        Math.round(((bookedEquipment + runningSessions) / totalEquipment) * 100)
      )
    : 0;

  return {
    totalEquipment,
    availableEquipment,
    bookedEquipment,
    underMaintenanceEquipment,
    activeBookings,
    runningSessions,
    liveUtilizationPct,
  };
}

export { getUtilizationSeries };