package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.entity.Booking;
import com.project.Lab.Resource.Utilization.Platform.repository.BookingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;


    // =========================================================
    // CREATE BOOKING
    // =========================================================

    public Booking createBooking(
            Booking booking
    ) {

        if (
                booking.getStartTime() == null ||
                        booking.getEndTime() == null
        ) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }


        if (
                booking.getStartTime()
                        .isAfter(
                                booking.getEndTime()
                        )

                        ||

                        booking.getStartTime()
                                .isEqual(
                                        booking.getEndTime()
                                )
        ) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }


        // Check conflicting bookings

        List<Booking> conflicts =
                bookingRepository
                        .findConflictingBookings(

                                booking.getEquipmentId(),

                                booking.getStartTime(),

                                booking.getEndTime()

                        );


        if (!conflicts.isEmpty()) {

            throw new RuntimeException(
                    "Equipment already booked for selected time slot"
            );
        }


        booking.setCreatedAt(
                LocalDateTime.now()
        );

        booking.setStatus(
                "PENDING"
        );


        return bookingRepository
                .save(booking);
    }


    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================

    public List<Booking> getAllBookings() {

        return bookingRepository
                .findAll();
    }


    // =========================================================
    // GET BOOKING BY ID
    // =========================================================

    public Booking getBookingById(
            Integer id
    ) {

        return bookingRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<Booking> getBookingsByStatus(
            String status
    ) {

        return bookingRepository
                .findByStatus(status);
    }


    // =========================================================
    // APPROVE BOOKING
    // =========================================================

    public Booking approveBooking(
            Integer id
    ) {

        Booking booking =
                getBookingById(id);


        if (!"PENDING".equals(
                booking.getStatus()
        )) {

            throw new RuntimeException(
                    "Only pending bookings can be approved"
            );
        }


        booking.setStatus(
                "APPROVED"
        );


        return bookingRepository
                .save(booking);
    }
    @Autowired
    private WaitlistService waitlistService;

    // =========================================================
    // REJECT BOOKING
    // =========================================================

    public Booking rejectBooking(
            Integer id
    ) {

        Booking booking =
                getBookingById(id);


        if (!"PENDING".equals(
                booking.getStatus()
        )) {

            throw new RuntimeException(
                    "Only pending bookings can be rejected"
            );
        }


        booking.setStatus(
                "REJECTED"
        );


        return bookingRepository
                .save(booking);
    }


    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    public Booking cancelBooking(Integer id) {

        Booking booking = getBookingById(id);

        if (!"PENDING".equals(booking.getStatus())
                && !"APPROVED".equals(booking.getStatus())) {

            throw new RuntimeException(
                    "Only pending or approved bookings can be cancelled"
            );
        }

        booking.setStatus("CANCELLED");

        Booking updatedBooking = bookingRepository.save(booking);

        waitlistService.getNextUser(updatedBooking.getEquipmentId());

        return updatedBooking;
    }

    // =========================================================
    // MARK IN USE
    // =========================================================

    public Booking markInUse(
            Integer id
    ) {

        Booking booking =
                getBookingById(id);


        if (!"APPROVED".equals(
                booking.getStatus()
        )) {

            throw new RuntimeException(
                    "Only approved bookings can be marked in use"
            );
        }


        booking.setStatus(
                "IN_USE"
        );


        return bookingRepository
                .save(booking);
    }


    // =========================================================
    // COMPLETE BOOKING
    // =========================================================

    public Booking markCompleted(Integer id) {

        Booking booking = getBookingById(id);

        if (!"IN_USE".equals(booking.getStatus())) {

            throw new RuntimeException(
                    "Only in-use bookings can be completed"
            );
        }

        booking.setStatus("COMPLETED");

        Booking updatedBooking = bookingRepository.save(booking);

        waitlistService.getNextUser(updatedBooking.getEquipmentId());

        return updatedBooking;
    }

    // =========================================================
    // NO SHOW
    // =========================================================

    public Booking markNoShow(
            Integer id
    ) {

        Booking booking =
                getBookingById(id);


        if (!"APPROVED".equals(
                booking.getStatus()
        )) {

            throw new RuntimeException(
                    "Only approved bookings can be marked no-show"
            );
        }


        booking.setStatus(
                "NO_SHOW"
        );


        return bookingRepository
                .save(booking);


    }
}