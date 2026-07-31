import api from "./api";

/**
 * Aligned with EquipmentController + Equipment entity.
 * Backend fields: equipmentId, departmentId, categoryId, equipmentName, modelNo,
 *                 serialNo, description, purchaseDate, status, createdAt.
 * Statuses seen in backend: AVAILABLE, BOOKED, UNDER_MAINTENANCE.
 */

export interface BackendEquipment {
  equipmentId: number;
  departmentId?: number;
  categoryId?: number;
  equipmentName: string;
  modelNo?: string;
  serialNo?: string;
  description?: string;
  purchaseDate?: string;
  status?: string;
  createdAt?: string;
}

export interface Equipment extends BackendEquipment {
  /** UI alias for equipmentId to keep existing pages working. */
  id: number;
  /** Convenience aliases used by legacy UI code — undefined unless a page joins them. */
  name?: string;
  equipmentCode?: string;
  lab?: string;
  department?: string;
  category?: string;
  utilization?: number;
}

export interface EquipmentDashboardCounts {
  totalEquipment: number;
  availableEquipment: number;
  bookedEquipment: number;
  underMaintenanceEquipment: number;
}

function normalize(e: BackendEquipment): Equipment {
  return { ...e, id: e.equipmentId, name: e.equipmentName };
}

export const listEquipment = () =>
  api.get<BackendEquipment[]>("/api/equipment").then((r) => r.data.map(normalize));

export const getEquipment = (id: number) =>
  api.get<BackendEquipment>(`/api/equipment/${id}`).then((r) => normalize(r.data));

export const searchEquipment = (name: string) =>
  api.get<BackendEquipment[]>(`/api/equipment/search`, { params: { name } })
    .then((r) => r.data.map(normalize));

export const listEquipmentByStatus = (status: string) =>
  api.get<BackendEquipment[]>(`/api/equipment/status/${status}`).then((r) => r.data.map(normalize));

export const getEquipmentDashboardCounts = () =>
  api.get<EquipmentDashboardCounts>("/api/equipment/dashboard").then((r) => r.data);

export const createEquipment = (payload: Partial<BackendEquipment>) =>
  api.post<BackendEquipment>("/api/equipment", payload).then((r) => normalize(r.data));

export const updateEquipment = (id: number, payload: Partial<BackendEquipment>) =>
  api.put<BackendEquipment>(`/api/equipment/${id}`, payload).then((r) => normalize(r.data));

export const deleteEquipment = (id: number) =>
  api.delete<string>(`/api/equipment/${id}`).then((r) => r.data);
