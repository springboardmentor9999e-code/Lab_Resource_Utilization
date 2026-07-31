import api from "./api";

/**
 * Aligned with WaitlistController:
 *   POST   /api/waitlist                      { equipmentId, userId }
 *   GET    /api/waitlist/my/{userId}
 *   GET    /api/waitlist/equipment/{equipmentId}
 *   DELETE /api/waitlist/{waitlistId}
 */

export type WaitlistStatus = "WAITING" | "PROMOTED" | "EXPIRED" | "CANCELLED";

export interface BackendWaitlistEntry {
  waitlistId: number;
  equipmentId: number;
  userId: number;
  priority: number;
  status: string;
  createdAt: string;
}

export interface WaitlistEntry extends BackendWaitlistEntry {
  /** UI alias */
  id: number;
  equipmentName?: string;
  /** Queue position within the same equipment queue. */
  position: number;
}

function normalize(e: BackendWaitlistEntry, position: number): WaitlistEntry {
  return { ...e, id: e.waitlistId, position };
}

function withPositions(rows: BackendWaitlistEntry[]): WaitlistEntry[] {
  const sorted = [...rows].sort((a, b) => {
    const p = (b.priority ?? 0) - (a.priority ?? 0);
    if (p !== 0) return p;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  return sorted.map((e, i) => normalize(e, i + 1));
}

export const listMyWaitlist = (userId: number) =>
  api.get<BackendWaitlistEntry[]>(`/api/waitlist/my/${userId}`).then((r) => withPositions(r.data));

export const listEquipmentWaitlist = (equipmentId: number) =>
  api
    .get<BackendWaitlistEntry[]>(`/api/waitlist/equipment/${equipmentId}`)
    .then((r) => withPositions(r.data));

export const joinWaitlist = (payload: { equipmentId: number; userId: number }) =>
  api.post<BackendWaitlistEntry>("/api/waitlist", payload).then((r) => normalize(r.data, 0));

export const leaveWaitlist = (waitlistId: number) =>
  api.delete<string>(`/api/waitlist/${waitlistId}`).then((r) => r.data);
