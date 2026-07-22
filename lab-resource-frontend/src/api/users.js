import { apiClient } from "./client";

// NOTE: update() must never send a `password` field unless the admin explicitly
// intends to reset it — UserService.updateUser() overwrites the hash whenever
// the incoming payload includes a non-null password.
//
// list() accepts optional filters; the backend also enforces its own scoping
// server-side (e.g. DEPARTMENT_HEAD is always limited to their own institution
// regardless of what's passed here).
export const usersApi = {
  list: (params) => apiClient.get("/api/users", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/api/users/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/users", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/users/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/users/${id}`),
};
