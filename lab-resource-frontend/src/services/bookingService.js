import axios from "axios";

const API = "http://localhost:8080/api/bookings";

export const getBookings = () => axios.get(API);

export const addBooking = (data) =>
    axios.post(API, data);

export const updateBooking = (id, data) =>
    axios.put(`${API}/${id}`, data);

export const deleteBooking = (id) =>
    axios.delete(`${API}/${id}`);