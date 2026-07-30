package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Booking;
import com.example.labresourceplatform.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    public Booking updateBooking(Long id, Booking booking) {
        Booking existingBooking = bookingRepository.findById(id).orElse(null);

        if (existingBooking != null) {
            existingBooking.setBookedBy(booking.getBookedBy());
            existingBooking.setBookingDate(booking.getBookingDate());
            existingBooking.setStartTime(booking.getStartTime());
            existingBooking.setEndTime(booking.getEndTime());
            existingBooking.setPurpose(booking.getPurpose());
            existingBooking.setStatus(booking.getStatus());
            existingBooking.setEquipment(booking.getEquipment());

            return bookingRepository.save(existingBooking);
        }

        return null;
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}