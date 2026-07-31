import api from "./api";
import type { Role } from "@/lib/auth";

/**
 * Aligned with Spring Boot backend:
 *   AuthController      /api/auth/{register,login,me,test}
 *   AuthResponse        { token, message, role }
 *   CurrentUserResponse { userId, institutionId, firstName, lastName, name, email, phone, role }
 *   RegisterRequest     { firstName, lastName, email, password, phone, roleId, institutionId }
 *   LoginRequest        { email, password }
 */

export interface AuthResponse {
  token: string | null;
  message: string;
  role: Role | null;
}

export interface CurrentUser {
  userId: number;
  institutionId: number | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleId: number;
  /** Send either an existing institutionId… */
  institutionId?: number;
  /** …or a new institution name — the backend creates it if it does not exist. */
  institutionName?: string;
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (payload: RegisterPayload) =>
  api.post<AuthResponse>("/api/auth/register", payload).then((r) => r.data);

export const me = () => api.get<CurrentUser>("/api/auth/me").then((r) => r.data);

/** NOT IMPLEMENTED IN BACKEND (no /api/auth/forgot-password yet). */
export const forgotPassword = (email: string) =>
  api.post("/api/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (token: string, password: string) =>
  api.post("/api/auth/reset-password", { token, password }).then((r) => r.data);
