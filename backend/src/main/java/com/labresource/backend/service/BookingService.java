package com.labresource.backend.service;

import com.labresource.backend.entity.Booking;
import com.labresource.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import com.labresource.backend.dto.BookingRequest;
import com.labresource.backend.entity.Laboratory;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.LaboratoryRepository;
import com.labresource.backend.repository.UserRepository;
import com.labresource.backend.entity.Equipment;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.entity.Billing;
import com.labresource.backend.repository.BillingRepository;
import java.time.LocalDate;
//import com.labresource.backend.service.NotificationService;
import com.labresource.backend.entity.Notification;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final LaboratoryRepository laboratoryRepository;
        private final EquipmentRepository equipmentRepository;
        private final BillingRepository billingRepository;
        private final NotificationService notificationService;
        public BookingService(
                BookingRepository bookingRepository,
                UserRepository userRepository,
                LaboratoryRepository laboratoryRepository,
                EquipmentRepository equipmentRepository,
                BillingRepository billingRepository,
                NotificationService notificationService
        ) {
            this.bookingRepository = bookingRepository;
            this.userRepository = userRepository;
            this.laboratoryRepository = laboratoryRepository;
            this.equipmentRepository = equipmentRepository;
            this.billingRepository = billingRepository;
            this.notificationService = notificationService;
        }

    // Create Booking
    public Booking createBooking(BookingRequest request, Authentication authentication) {

    if (authentication == null) {
        throw new RuntimeException("Authentication is null");
    }
    
    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("Logged-in user not found: " + email));

    Laboratory laboratory = laboratoryRepository.findById(request.getLabId())
            .orElseThrow(() ->
                    new RuntimeException("Laboratory not found"));

                   if (!laboratory.getInstitution().getInstitutionId()
        .equals(request.getInstitutionId())) {

    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Selected laboratory does not belong to the selected institution."
    );
}


    Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
            .orElseThrow(() ->
                    new RuntimeException("Equipment not found"));

                    if (!equipment.getLaboratory().getLabId().equals(request.getLabId())) {

    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Selected equipment does not belong to the selected laboratory."
    );
}


    if (equipment.getAvailableQuantity() < request.getQuantity()) {

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only " + equipment.getAvailableQuantity() + " item(s) are available."
        );
    }

    Booking booking = new Booking();

    booking.setUser(user);
    booking.setLaboratory(laboratory);
    booking.setEquipment(equipment);

    booking.setQuantity(request.getQuantity());
    booking.setBookingDate(request.getBookingDate());
    booking.setStartTime(request.getStartTime());
    booking.setEndTime(request.getEndTime());
    booking.setPurpose(request.getPurpose());

    booking.setStatus("PENDING");
    booking.setCreatedAt(LocalDateTime.now());

    Booking savedBooking = bookingRepository.save(booking);

    equipment.setAvailableQuantity(
        equipment.getAvailableQuantity() - request.getQuantity()
);

equipmentRepository.save(equipment);

// Create notification
createNotification(
        user,
        "Booking Request Submitted",
        "Your booking request for "
                + equipment.getEquipmentName()
                + " in "
                + laboratory.getLabName()
                + " has been submitted successfully and is awaiting approval.",
        "BOOKING"
);

return savedBooking;
}

    // Get All Bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Student / Faculty - View Own Bookings
    public List<Booking> getBookingsByUser(Long userId) {

        return bookingRepository.findByUserUserId(userId);

    }

    // Lab Assistant - Today's Bookings
        public List<Booking> getTodaysBookings() {
            return bookingRepository.findByStatus("APPROVED");
        }

    // Department Head / Institute Admin
    public List<Booking> getPendingBookings() {

        return bookingRepository.findByStatus("PENDING");

    }

    // Get Booking By Id
    public Booking getBookingById(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));
    }

    // Update Booking
    public Booking updateBooking(Long id, Booking booking) {

        Booking existingBooking = getBookingById(id);

        existingBooking.setUser(booking.getUser());
        existingBooking.setLaboratory(booking.getLaboratory());
        existingBooking.setEquipment(booking.getEquipment());
        existingBooking.setQuantity(booking.getQuantity());
        existingBooking.setBookingDate(booking.getBookingDate());
        existingBooking.setStartTime(booking.getStartTime());
        existingBooking.setEndTime(booking.getEndTime());
        existingBooking.setPurpose(booking.getPurpose());
        existingBooking.setStatus(booking.getStatus());

        Booking updatedBooking = bookingRepository.save(existingBooking);

        System.out.println("Booking Updated Successfully");

        return updatedBooking;
    }

    // Delete Booking
    public void deleteBooking(Long id) {

        bookingRepository.deleteById(id);

        System.out.println("Booking Deleted Successfully");
    }

    // Approve Booking
   public Booking approveBooking(Long id) {

            Booking booking = getBookingById(id);

            booking.setStatus("APPROVED");

            Booking updatedBooking = bookingRepository.save(booking);
            createNotification(
                    booking.getUser(),
                    "Booking Approved",
                    "Your booking for "
                            + booking.getEquipment().getEquipmentName()
                            + " has been approved.",
                    "BOOKING"
            );

            Billing billing = new Billing();

            billing.setBooking(updatedBooking);

            billing.setInstitution(
                    updatedBooking.getLaboratory().getInstitution()
            );

            billing.setDepartmentHead(
                    updatedBooking.getUser()
            );

            double equipmentCost =
                    updatedBooking.getEquipment().getCost()
                    * updatedBooking.getQuantity();

            double laboratoryCost = 500.0;

            billing.setEquipmentCost(equipmentCost);

            billing.setLaboratoryCost(laboratoryCost);

            billing.setTotalCost(
                    equipmentCost + laboratoryCost
            );

            billing.setPaymentStatus("PENDING");

            billing.setGeneratedDate(LocalDate.now());

            billingRepository.save(billing);

            return updatedBooking;
        }

    // Reject Booking
    public Booking rejectBooking(Long id) {

        Booking booking = getBookingById(id);
        booking.setStatus("REJECTED");

        Booking updatedBooking = bookingRepository.save(booking);
        createNotification(
                booking.getUser(),
                "Booking Rejected",
                "Your booking request for "
                        + booking.getEquipment().getEquipmentName()
                        + " has been rejected.",
                "BOOKING"
        );

        System.out.println("Booking Rejected");

        return updatedBooking;
    }

    // Cancel Booking
    public Booking cancelBooking(Long id) {

        Booking booking = getBookingById(id);

        if (!booking.getStatus().equals("PENDING")) {
            throw new RuntimeException("Only pending bookings can be cancelled.");
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }

    // Complete Booking
    public Booking completeBooking(Long id) {

        Booking booking = getBookingById(id);
        booking.setStatus("COMPLETED");

        Booking updatedBooking = bookingRepository.save(booking);
        createNotification(
                booking.getUser(),
                "Booking Completed",
                "Your booking for "
                        + booking.getEquipment().getEquipmentName()
                        + " has been completed successfully.",
                "BOOKING"
        );

        System.out.println("Booking Completed");

        return updatedBooking;
    }
    
    public List<Booking> getBookingsByInstitution(Long institutionId) {

        return bookingRepository
                .findByLaboratoryInstitutionInstitutionId(institutionId);

    }

    public long getBookingHours(Booking booking) {

        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            return 0;
        }

        return Duration.between(
                booking.getStartTime(),
                booking.getEndTime()
        ).toHours();

    }

   private void createNotification(
            User user,
            String title,
            String message,
            String type) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);

        notificationService.createNotification(notification);
    }

}