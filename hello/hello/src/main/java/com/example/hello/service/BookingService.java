package com.example.hello.service;

import com.example.hello.entity.Booking;
import com.example.hello.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
@Service
public class BookingService {

    @Autowired
    private BookingRepository repository;

    public List<Booking> getAllBookings() {
        return repository.findAll(
                Sort.by(Sort.Direction.ASC, "bookingId")
        );
    }
    public boolean isEquipmentAvailable(Integer equipmentId){

        List<Booking> bookings =
                repository.findByEquipmentIdAndStatusIn(
                        equipmentId,
                        List.of("PENDING","APPROVED")
                );

        return bookings.isEmpty();

    }
    public Booking saveBooking(Booking booking) {

        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("PENDING");
        }

        Booking savedBooking = repository.save(booking);

        if ("COMPLETED".equals(savedBooking.getStatus())) {

            Optional<Booking> waitingBooking =
                    repository.findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
                            savedBooking.getEquipmentId(),
                            "WAITLISTED"
                    );

            if (waitingBooking.isPresent()) {

                Booking nextBooking = waitingBooking.get();

                nextBooking.setStatus("PENDING");

                repository.save(nextBooking);
            }
        }

        return savedBooking;
    }
    public Booking getBookingById(Integer id) {

        return repository.findById(id).orElse(null);
    }
    public List<Booking> getBookingsByUser(Integer userId) {
        return repository.findByUserId(userId);
    }
    public void deleteBooking(Integer id) {
        repository.deleteById(id);
    }
}