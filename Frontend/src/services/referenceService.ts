import api from "./api";

/**
 * Reference data — backed by real endpoints:
 *   GET /api/departments          -> Department[]
 *   GET /api/institutions         -> Institution[]
 *   GET /api/equipment-categories -> EquipmentCategory[]
 */

export interface Department {
  departmentId: number;
  institutionId?: number;
  departmentName: string;
  createdAt?: string;
}

export interface Institution {
  institutionId: number;
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
}

export interface EquipmentCategory {
  categoryId: number;
  categoryName: string;
}

export const listDepartments = () =>
  api.get<Department[]>("/api/departments").then((r) => r.data);

export const listInstitutions = () =>
  api.get<Institution[]>("/api/institutions").then((r) => r.data);

export const listEquipmentCategories = () =>
  api.get<EquipmentCategory[]>("/api/equipment-categories").then((r) => r.data);

/** id -> name lookup helpers used for table/detail rendering. */
export const departmentMap = (list: Department[] | null | undefined) =>
  new Map((list ?? []).map((d) => [d.departmentId, d.departmentName]));

export const institutionMap = (list: Institution[] | null | undefined) =>
  new Map((list ?? []).map((i) => [i.institutionId, i.name]));

export const categoryMap = (list: EquipmentCategory[] | null | undefined) =>
  new Map((list ?? []).map((c) => [c.categoryId, c.categoryName]));
