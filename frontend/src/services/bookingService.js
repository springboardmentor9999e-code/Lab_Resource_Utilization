import api from '../api/client.js';
import { canViewAllBookings } from '../auth/permissions.js';

export async function getBookingsForUser(user) {
  const response = await api.get(canViewAllBookings(user) ? '/bookings' : '/bookings/me');
  return response.data;
}

export async function createBooking(request) {
  const response = await api.post('/bookings', request);
  return response.data;
}

export async function approveBooking(id) {
  const response = await api.patch(`/bookings/${id}/approve`);
  return response.data;
}

export async function rejectBooking(id, rejectionReason) {
  const response = await api.patch(`/bookings/${id}/reject`, { rejectionReason });
  return response.data;
}

export async function cancelBooking(id) {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
}
