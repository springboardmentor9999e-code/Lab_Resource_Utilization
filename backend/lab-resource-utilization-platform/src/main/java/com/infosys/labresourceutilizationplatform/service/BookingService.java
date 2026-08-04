package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Booking;

import java.util.List;

public interface BookingService {

    Booking createBooking(Booking booking);

    List<Booking> getAllBookings();

    Booking getBookingById(Long bookingId);

    Booking updateBooking(Long bookingId, Booking booking);

    void deleteBooking(Long bookingId);

    Booking cancelBooking(Long bookingId, String email);
}