import axios from "axios";

const API_URL = "http://localhost:8080/api/bookings";

const getAllBookings = () => {
    return axios.get(API_URL);
};

const createBooking = (booking) => {
    return axios.post(API_URL, booking);
};

const approveBooking = (id) => {
    return axios.put(API_URL + "/" + id + "/approve");
};

const cancelBooking = (id) => {
    return axios.put(API_URL + "/" + id + "/cancel");
};

const deleteBooking = (id) => {
    return axios.delete(API_URL + "/" + id);
};

const BookingService = {
    getAllBookings,
    createBooking,
    approveBooking,
    cancelBooking,
    deleteBooking
};

export default BookingService;