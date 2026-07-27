import api from './api';

// Booking + Waitlist module API calls.
// Booking statuses: PENDING | CONFIRMED | IN_USE | COMPLETED | CANCELLED | NO_SHOW | REJECTED
export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, null, { params: { status } });
    return response.data;
  },

  // Audit trail — status change timeline of one booking
  getHistory: async (id) => {
    const response = await api.get(`/bookings/${id}/history`);
    return response.data;
  },

  // Availability calendar feed (active bookings between two ISO dates)
  getCalendar: async (from, to, equipmentId = null) => {
    const params = { from, to };
    if (equipmentId) params.equipmentId = equipmentId;
    const response = await api.get('/bookings/calendar', { params });
    return response.data;
  },

  // Recurring bookings
  createRecurring: async ({ equipmentId, frequency, startDate, endDate, startTime, endTime }) => {
    const response = await api.post('/bookings/recurring', {
      equipmentId, frequency, startDate, endDate, startTime, endTime,
    });
    return response.data; // RecurringBookingResponse (occurrencesCreated, skippedDates...)
  },
  getMyRecurring: async () => {
    const response = await api.get('/bookings/recurring/my');
    return response.data;
  },
  cancelRecurring: async (id) => {
    const response = await api.delete(`/bookings/recurring/${id}`);
    return response.data;
  },

  // Rule-based scheduling optimization — ranked alternatives for an unavailable slot
  getSuggestions: async ({ equipmentId, date, startTime, endTime, limit = 5 }) => {
    const response = await api.get('/bookings/suggestions', {
      params: { equipmentId, date, startTime, endTime, limit },
    });
    return response.data;
  },

  // Waitlist
  joinWaitlist: async ({ equipmentId, requestedDate, startTime, endTime }) => {
    const response = await api.post('/waitlist', { equipmentId, requestedDate, startTime, endTime });
    return response.data; // ApiResponse<WaitlistResponse>
  },
  getMyWaitlist: async () => {
    const response = await api.get('/waitlist/my');
    return response.data;
  },
  getAllWaitlist: async () => {
    const response = await api.get('/waitlist');
    return response.data;
  },
  cancelWaitlist: async (id) => {
    const response = await api.delete(`/waitlist/${id}`);
    return response.data;
  },
};

export default bookingService;
