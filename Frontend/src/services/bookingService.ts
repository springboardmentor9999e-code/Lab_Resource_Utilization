import api from "./api";

/**
 * Aligned with BookingController + Booking entity.
 * Backend fields: bookingId, equipmentId, userId, startTime, endTime, purpose, status, createdAt.
 * Note: backend does NOT populate equipmentName / userName — the UI displays the ID
 * when a name is not available (see joins done client-side in booking pages).
 */

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "IN_USE"
  | "COMPLETED"
  | "NO_SHOW";

export interface BackendBooking {
  bookingId: number;
  equipmentId: number;
  userId: number;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: BookingStatus;
  createdAt?: string;
}

/** UI-friendly booking (adds `id` alias so existing pages keep working). */
export interface Booking extends BackendBooking {
  id: number;
  equipmentName?: string;
  userName?: string;
  userEmail?: string;
  date?: string;
}

export interface CreateBookingPayload {
  equipmentId: number;
  startTime: string; // ISO LocalDateTime (yyyy-MM-ddTHH:mm:ss)
  endTime: string;
  purpose?: string;
}

function normalize(b: BackendBooking): Booking {
  return { ...b, id: b.bookingId };
}

export const listBookings = () =>
  api.get<BackendBooking[]>("/api/bookings").then((r) => r.data.map(normalize));

export const listMyBookings = () =>
  api.get<BackendBooking[]>("/api/bookings/my-bookings").then((r) => r.data.map(normalize));

export const getBooking = (id: number) =>
  api.get<BackendBooking>(`/api/bookings/${id}`).then((r) => normalize(r.data));

export const listBookingsByStatus = (status: BookingStatus) =>
  api.get<BackendBooking[]>(`/api/bookings/status/${status}`).then((r) => r.data.map(normalize));

export const createBooking = (payload: CreateBookingPayload) =>
  api.post<BackendBooking>("/api/bookings", payload).then((r) => normalize(r.data));

const put = (path: string) => api.put<BackendBooking>(path, {}).then((r) => normalize(r.data));

export const cancelBooking = (id: number) => put(`/api/bookings/${id}/cancel`);
export const approveBooking = (id: number) => put(`/api/bookings/${id}/approve`);
export const rejectBooking = (id: number) => put(`/api/bookings/${id}/reject`);
export const markBookingInUse = (id: number) => put(`/api/bookings/${id}/in-use`);
export const markBookingCompleted = (id: number) => put(`/api/bookings/${id}/complete`);
export const markBookingNoShow = (id: number) => put(`/api/bookings/${id}/no-show`);
