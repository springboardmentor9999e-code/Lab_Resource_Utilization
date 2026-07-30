import axios from "axios";

const API_URL = "http://localhost:8080/api/bookings";

const getToken = () => localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Get all bookings
export const getAllBookings = () => {
    return axios.get(API_URL, config());
};

// Get booking by ID
export const getBookingById = (id) => {
    return axios.get(`${API_URL}/${id}`, config());
};

// Create booking
export const addBooking = (booking) => {
    return axios.post(API_URL, booking, config());
};

// Update booking
export const updateBooking = (id, booking) => {
    return axios.put(`${API_URL}/${id}`, booking, config());
};

// Delete booking
export const deleteBooking = (id) => {
    return axios.delete(`${API_URL}/${id}`, config());
};