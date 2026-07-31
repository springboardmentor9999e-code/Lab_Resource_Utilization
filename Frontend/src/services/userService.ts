import api from "./api";
import type { Role } from "@/lib/auth";

/**
 * Aligned with UserController + User entity.
 * Backend User: { userId, institutionId, firstName, lastName, email, phone,
 *                 isActive, createdAt, name, role: { roleId, roleName } }
 */

export interface BackendRole {
  roleId: number;
  roleName: Role;
}

export interface BackendUser {
  userId: number;
  institutionId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  name?: string;
  role: BackendRole;
}

/** UI-friendly user with aliases used by existing pages. */
export interface AppUser extends BackendUser {
  id: number;
  active: boolean;
  /** Convenience string role for badges / filters. */
  roleName: Role;
  /** Legacy alias kept so <Badge>{ROLE_LABEL[u.role]}</Badge> still works. */
  department?: string;
}

function normalize(u: BackendUser): AppUser {
  return {
    ...u,
    id: u.userId,
    active: u.isActive,
    roleName: u.role.roleName,
    name: u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
  };
}

export const listUsers = () =>
  api.get<BackendUser[]>("/api/users").then((r) => r.data.map(normalize));

export const getUser = (id: number) =>
  api.get<BackendUser>(`/api/users/${id}`).then((r) => normalize(r.data));

export const updateUser = (id: number, payload: Partial<BackendUser>) =>
  api.put<BackendUser>(`/api/users/${id}`, payload).then((r) => normalize(r.data));

export const deleteUser = (id: number) =>
  api.delete<string>(`/api/users/${id}`).then((r) => r.data);

export const setUserActive = (id: number, active: boolean) =>
  api.put<BackendUser>(`/api/users/${id}/status`, null, { params: { active } })
    .then((r) => normalize(r.data));
