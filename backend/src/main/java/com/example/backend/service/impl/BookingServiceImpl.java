package com.example.backend.service.impl;
import com.example.backend.entity.Equipment;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.entity.Booking;
import com.example.backend.repository.BookingRepository;
import com.example.backend.service.BookingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public Booking saveBooking(Booking booking) {
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @Override
    public Booking updateBooking(Booking booking) {

        Booking existingBooking = bookingRepository.findById(booking.getId()).orElse(null);

        if (existingBooking == null) {
            return null;
        }

        existingBooking.setUserId(booking.getUserId());
        existingBooking.setEquipmentId(booking.getEquipmentId());
        existingBooking.setBookingDate(booking.getBookingDate());
        existingBooking.setStartTime(booking.getStartTime());
        existingBooking.setEndTime(booking.getEndTime());
        existingBooking.setStatus(booking.getStatus());

        return bookingRepository.save(existingBooking);
    }

    @Override
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    @Override
    public Booking approveBooking(Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return null;
        }

        booking.setStatus("APPROVED");

        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return null;
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }

    @Override
    public Booking returnEquipment(Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return null;
        }

        booking.setStatus("RETURNED");

        return bookingRepository.save(booking);
    }
}