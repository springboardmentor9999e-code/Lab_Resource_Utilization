import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080";

export const TOKEN_KEY = "lab_token";
export const USER_KEY = "lab_user";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Human-readable message for any axios error. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect to the server. Please try again.";
    const data = err.response.data as { message?: string; error?: string } | undefined;
    if (err.response.status === 403) return "Access denied. You don't have permission for this action.";
    if (err.response.status === 404) return "Not found.";
    if (err.response.status === 409) return data?.message || "Conflict — the resource is already in use.";
    return data?.message || data?.error || `Request failed (${err.response.status})`;
  }
  return fallback;
}

export default api;
