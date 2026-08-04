import axiosInstance from "../utils/axiosInstance";


const API = "http://localhost:8080/api/bookings";

const getAllBookings = async () => {
    const response = await axiosInstance.get(API);
    return response.data;
};

const getBookingsByUser = async (userId) => {
    const response = await axiosInstance.get(`${API}/user/${userId}`);
    return response.data;
};

const getTodaysBookings = async () => {
    const response = await axiosInstance.get(`${API}/today`);
    return response.data;
};

const getPendingBookings = async () => {
    const response = await axiosInstance.get(`${API}/pending`);
    return response.data;
};

const createBooking = async (booking) => {
    const response = await axiosInstance.post(API, booking);
    return response.data;
};

const updateBooking = async (id, booking) => {
    const response = await axiosInstance.put(`${API}/${id}`, booking);
    return response.data;
};

const deleteBooking = async (id) => {
    return axiosInstance.delete(`${API}/${id}`);
};

const approveBooking = async (id) => {
    const response = await axiosInstance.put(`${API}/${id}/approve`);
    return response.data;
};

const rejectBooking = async (id) => {
    const response = await axiosInstance.put(`${API}/${id}/reject`);
    return response.data;
};

const completeBooking = async (id) => {
    const response = await axiosInstance.put(`${API}/${id}/complete`);
    return response.data;
};

const cancelBooking = async (id) => {
    const response = await axiosInstance.put(`${API}/${id}/cancel`);
    return response.data;
};

const getBookingsByInstitution = async (institutionId) => {

    const response = await axiosInstance.get(
        `/bookings/institution/${institutionId}`
    );

    return response.data;
};

export default {
    getAllBookings,
    getBookingsByUser,
    getTodaysBookings,
    getPendingBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    approveBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    getBookingsByInstitution,
};