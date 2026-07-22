import { apiClient } from "./client";

// Matches backend LoginRequest: { email, password }
export function login({ email, password }) {
  return apiClient.post("/api/auth/login", { email, password }).then((r) => r.data);
}

// Matches backend RegisterRequest: { name, email, password, role, institutionId }
export function register({ name, email, password, role, institutionId }) {
  return apiClient
    .post("/api/auth/register", { name, email, password, role, institutionId })
    .then((r) => r.data);
}
