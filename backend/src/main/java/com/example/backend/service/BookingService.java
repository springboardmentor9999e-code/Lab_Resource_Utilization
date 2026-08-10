package com.example.backend.service;

import com.example.backend.entity.Booking;
import java.util.List;

public interface BookingService {

    Booking saveBooking(Booking booking);

    List<Booking> getAllBookings();

    Booking getBookingById(Long id);

    Booking updateBooking(Booking booking);

    void deleteBooking(Long id);

    Booking approveBooking(Long id);

    Booking cancelBooking(Long id);

    Booking returnEquipment(Long id);
}