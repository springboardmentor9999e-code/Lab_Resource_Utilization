package com.example.hello.controller;

import com.example.hello.entity.Booking;
import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;
import com.example.hello.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService service;

    @Autowired
    private UserRepository userRepository;


    // ============================================================
    // GET BOOKINGS
    // ============================================================

    @GetMapping
    @PreAuthorize(
            "hasAnyAuthority(" +
                    "'SYSTEM_ADMIN'," +
                    "'RESEARCHER'," +
                    "'INSTITUTION_ADMIN'," +
                    "'DEPARTMENT_HEAD'" +
                    ")"
    )
    public List<Booking> getBookings(
            Authentication authentication) {


        String email =
                authentication.getName();


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));


        if (user.getRole() == null) {

            throw new RuntimeException(
                    "User role not found"
            );
        }


        String role =
                user.getRole()
                        .getRoleName();


        // ========================================================
        // SYSTEM ADMIN
        // ALL BOOKINGS
        // ========================================================

        if ("SYSTEM_ADMIN".equals(role)) {

            return service.getAllBookings();
        }


        // ========================================================
        // INSTITUTION ADMIN
        // INSTITUTION BOOKINGS
        // ========================================================

        if ("INSTITUTION_ADMIN".equals(role)) {

            if (user.getInstitutionId() == null) {

                throw new RuntimeException(
                        "Institution Admin is not associated "
                                + "with an institution"
                );
            }


            return service.getBookingsByInstitution(
                    user.getInstitutionId()
            );
        }


        // ========================================================
        // DEPARTMENT HEAD
        // DEPARTMENT BOOKINGS
        // ========================================================

        if ("DEPARTMENT_HEAD".equals(role)) {

            if (user.getDepartmentId() == null) {

                throw new RuntimeException(
                        "Department Head is not associated "
                                + "with a department"
                );
            }


            return service.getBookingsByDepartment(
                    user.getDepartmentId()
            );
        }


        // ========================================================
        // RESEARCHER
        // OWN BOOKINGS ONLY
        // ========================================================

        return service.getBookingsByUser(
                user.getUserId()
        );
    }


    // ============================================================
    // APPROVE / REJECT BOOKING
    // ============================================================

    @PutMapping("/{id}/status")
    @PreAuthorize(
            "hasAnyAuthority(" +
                    "'SYSTEM_ADMIN'," +
                    "'INSTITUTION_ADMIN'," +
                    "'DEPARTMENT_HEAD'" +
                    ")"
    )
    public Booking updateBookingStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            Authentication authentication) {


        String email =
                authentication.getName();


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));


        return service.updateBookingStatus(
                id,
                status,
                user
        );
    }


    // ============================================================
    // CHECK EQUIPMENT AVAILABILITY
    // ============================================================

    @GetMapping("/available/{equipmentId}")
    @PreAuthorize(
            "hasAnyAuthority(" +
                    "'RESEARCHER'," +
                    "'SYSTEM_ADMIN'," +
                    "'INSTITUTION_ADMIN'," +
                    "'DEPARTMENT_HEAD'" +
                    ")"
    )
    public boolean isAvailable(
            @PathVariable Integer equipmentId) {


        return service.isEquipmentAvailable(
                equipmentId
        );
    }


    // ============================================================
    // ADD BOOKING
    // ONLY RESEARCHER
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('RESEARCHER')")
    public Booking addBooking(
            @RequestBody Booking booking,
            Authentication authentication) {


        String email =
                authentication.getName();


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));


        // --------------------------------------------------------
        // Never trust userId from React
        // --------------------------------------------------------

        booking.setUserId(
                user.getUserId()
        );


        // --------------------------------------------------------
        // Default status
        // --------------------------------------------------------

        if (booking.getStatus() == null ||
                booking.getStatus().isBlank()) {

            booking.setStatus("PENDING");
        }


        return service.saveBooking(
                booking
        );
    }


    // ============================================================
    // GET BOOKING BY ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyAuthority(" +
                    "'SYSTEM_ADMIN'," +
                    "'RESEARCHER'," +
                    "'INSTITUTION_ADMIN'," +
                    "'DEPARTMENT_HEAD'" +
                    ")"
    )
    public Booking getBooking(
            @PathVariable Integer id) {


        return service.getBookingById(
                id
        );
    }


    // ============================================================
    // UPDATE BOOKING
    // SYSTEM ADMIN ONLY
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SYSTEM_ADMIN')")
    public Booking updateBooking(
            @PathVariable Integer id,
            @RequestBody Booking booking) {


        booking.setBookingId(id);


        return service.saveBooking(
                booking
        );
    }


    // ============================================================
    // DELETE BOOKING
    // ONLY SYSTEM ADMIN
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SYSTEM_ADMIN')")
    public void deleteBooking(
            @PathVariable Integer id) {


        service.deleteBooking(
                id
        );
    }

}