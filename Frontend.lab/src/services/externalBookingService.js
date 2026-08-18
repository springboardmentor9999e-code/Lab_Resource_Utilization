import api from "./api";

const API_ENDPOINT = "/external-bookings";

export const getAllExternalBookings = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

export const getExternalBookingHistory = async (email = "") => {
  const params = email ? { email } : {};
  const response = await api.get(`${API_ENDPOINT}/history`, { params });
  return response.data;
};

export const getExternalBookingById = async (id) => {
  const response = await api.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

export const createExternalBooking = async (bookingData) => {
  const response = await api.post(API_ENDPOINT, bookingData);
  return response.data;
};

export const cancelExternalBooking = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/cancel`);
  return response.data;
};

export const deleteExternalBooking = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};
