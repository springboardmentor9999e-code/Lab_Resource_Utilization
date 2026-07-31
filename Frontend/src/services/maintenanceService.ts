import api from "./api";

/**
 * Aligned with MaintenanceController + MaintenanceRequestDTO/MaintenanceResponseDTO:
 *   POST /api/maintenance
 *   GET  /api/maintenance
 *   GET  /api/maintenance/{id}
 *   GET  /api/maintenance/equipment/{equipmentId}
 *   GET  /api/maintenance/technician/{technicianId}
 *   GET  /api/maintenance/status/{status}
 *   PUT  /api/maintenance/{id}/complete
 */

export interface BackendMaintenance {
  maintenanceId: number;
  equipmentId: number;
  technicianId?: number;
  reportedBy?: number;
  issue?: string;
  maintenanceType?: string;
  issueDescription?: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  remarks?: string;
  createdAt?: string;
}

export interface MaintenanceRequest extends BackendMaintenance {
  /** UI alias */
  id: number;
}

export interface CreateMaintenancePayload {
  equipmentId: number;
  technicianId?: number;
  reportedBy?: number;
  issue?: string;
  maintenanceType?: string;
  issueDescription?: string;
  remarks?: string;
  scheduledDate?: string;
}

const normalize = (m: BackendMaintenance): MaintenanceRequest => ({ ...m, id: m.maintenanceId });

export const listMaintenance = () =>
  api.get<BackendMaintenance[]>("/api/maintenance").then((r) => r.data.map(normalize));

export const getMaintenance = (id: number) =>
  api.get<BackendMaintenance>(`/api/maintenance/${id}`).then((r) => normalize(r.data));

export const listMaintenanceByEquipment = (equipmentId: number) =>
  api
    .get<BackendMaintenance[]>(`/api/maintenance/equipment/${equipmentId}`)
    .then((r) => r.data.map(normalize));

export const listMaintenanceByTechnician = (technicianId: number) =>
  api
    .get<BackendMaintenance[]>(`/api/maintenance/technician/${technicianId}`)
    .then((r) => r.data.map(normalize));

export const listMaintenanceByStatus = (status: string) =>
  api
    .get<BackendMaintenance[]>(`/api/maintenance/status/${status}`)
    .then((r) => r.data.map(normalize));

export const createMaintenance = (payload: CreateMaintenancePayload) =>
  api.post<BackendMaintenance>("/api/maintenance", payload).then((r) => normalize(r.data));

export const completeMaintenance = (id: number) =>
  api.put<BackendMaintenance>(`/api/maintenance/${id}/complete`, {}).then((r) => normalize(r.data));
