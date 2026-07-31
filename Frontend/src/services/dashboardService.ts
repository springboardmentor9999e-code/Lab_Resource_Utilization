import api from "./api";
import type { Role } from "@/lib/auth";

/**
 * Aligned with DashboardController:
 *   GET /api/dashboard/role/{role}
 *   GET /api/dashboard/{student|researcher|lab-technician|lab-manager|
 *                       department-head|institution-admin|system-admin}
 *   GET /api/dashboard/utilization           -> UtilizationPointDTO[]
 *   GET /api/dashboard/heatmap               -> HeatmapDTO[]
 *   GET /api/dashboard/department-statistics -> DepartmentStatDTO[]
 *   GET /api/dashboard/top-equipment         -> HeatmapDTO[]
 */

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  totalEquipment: number;
  availableEquipment: number;
  bookedEquipment: number;
  totalUsers: number;
  activeUsers: number;
}

export interface UtilizationPoint {
  day: string;
  usage: number;
}

export interface DepartmentStat {
  name: string;
  value: number;
}

export interface EquipmentHeatPoint {
  equipmentId: number;
  equipmentName: string;
  bookings: number;
  utilization: number;
}

/** Role enum -> dashboard path segment. */
export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  STUDENT: "student",
  RESEARCHER: "researcher",
  LAB_TECHNICIAN: "lab-technician",
  LAB_MANAGER: "lab-manager",
  DEPARTMENT_HEAD: "department-head",
  INSTITUTION_ADMIN: "institution-admin",
  SYSTEM_ADMIN: "system-admin",
};

/** Role-specific dashboard (secured per role on the backend). */
export const getRoleDashboard = (role: Role) =>
  api.get<DashboardStats>(`/api/dashboard/${ROLE_DASHBOARD_PATH[role]}`).then((r) => r.data);

/** Generic dashboard for any authenticated user. */
export const getDashboardStats = (role: string) =>
  api.get<DashboardStats>(`/api/dashboard/role/${role}`).then((r) => r.data);

export const getUtilizationSeries = () =>
  api.get<UtilizationPoint[]>("/api/dashboard/utilization").then((r) => r.data);

export const getDepartmentStats = () =>
  api.get<DepartmentStat[]>("/api/dashboard/department-statistics").then((r) => r.data);

export const getEquipmentHeatmapData = () =>
  api.get<EquipmentHeatPoint[]>("/api/dashboard/heatmap").then((r) => r.data);

export const getTopEquipment = () =>
  api.get<EquipmentHeatPoint[]>("/api/dashboard/top-equipment").then((r) => r.data);
