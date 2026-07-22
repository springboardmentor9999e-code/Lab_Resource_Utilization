package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.BookingService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    public BookingController(BookingService bookingService, CurrentUserService currentUserService){
        this.bookingService = bookingService;
        this.currentUserService = currentUserService;
    }

    private boolean isSelfServiceRole(Role role){
        return role == Role.STUDENT || role == Role.RESEARCHER;
    }

    // STUDENT/RESEARCHER: Read own bookings only (per Role-Operation Matrix).
    // Staff roles: Read all.
    @GetMapping
    public List<Booking> getAllBookings(){
        User currentUser = currentUserService.getCurrentUser();
        if (isSelfServiceRole(currentUser.getRole())) {
            return bookingService.getBookingsForUser(currentUser.getUserId());
        }
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable Long id){
        User currentUser = currentUserService.getCurrentUser();
        Booking booking = bookingService.getBookingById(id);

        boolean isOwnBooking = booking.getUser() != null
                && booking.getUser().getUserId().equals(currentUser.getUserId());

        if (!isOwnBooking && isSelfServiceRole(currentUser.getRole())) {
            throw new AccessDeniedException("You may only view your own bookings");
        }
        return booking;
    }

    // Any authenticated user can request a booking, but STUDENT/RESEARCHER can only book for themselves.
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking){
        User currentUser = currentUserService.getCurrentUser();
        if (isSelfServiceRole(currentUser.getRole())) {
            booking.setUser(currentUser);
        }
        return bookingService.createBooking(booking);
    }

    // Waitlist for a specific piece of equipment, oldest request first.
    @GetMapping("/waitlist/{equipmentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'DEPARTMENT_HEAD')")
    public List<Booking> getWaitlist(@PathVariable Long equipmentId){
        return bookingService.getWaitlistForEquipment(equipmentId);
    }

    // Approving/rejecting/changing a booking's status is a staff action.
    // DEPARTMENT_HEAD gets this too, per their expanded oversight scope.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'DEPARTMENT_HEAD')")
    public Booking updateBooking(@PathVariable Long id, @RequestBody Booking booking){
        return bookingService.updateBooking(id, booking);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'DEPARTMENT_HEAD')")
    public void deleteBooking(@PathVariable Long id){
        bookingService.deleteBooking(id);
    }
}
