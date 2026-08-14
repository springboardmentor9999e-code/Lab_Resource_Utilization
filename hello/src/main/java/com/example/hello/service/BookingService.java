package com.example.hello.service;

import com.example.hello.entity.Booking;
import com.example.hello.entity.Billing;
import com.example.hello.entity.Equipment;
import com.example.hello.entity.Notification;
import com.example.hello.entity.User;

import com.example.hello.repository.BookingRepository;
import com.example.hello.repository.BillingRepository;
import com.example.hello.repository.EquipmentRepository;
import com.example.hello.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository repository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;


    // ============================================================
    // GET ALL BOOKINGS
    // ============================================================

    public List<Booking> getAllBookings() {

        return repository.findAll(
                Sort.by(
                        Sort.Direction.ASC,
                        "bookingId"
                )
        );
    }


    // ============================================================
    // CHECK EQUIPMENT AVAILABILITY
    // ============================================================

    public boolean isEquipmentAvailable(Integer equipmentId) {

        List<Booking> bookings =
                repository.findByEquipmentIdAndStatusIn(
                        equipmentId,
                        List.of("PENDING", "APPROVED")
                );

        return bookings.isEmpty();
    }


    // ============================================================
    // SAVE / UPDATE BOOKING
    // ============================================================

    public Booking saveBooking(Booking booking) {

        String oldStatus = null;

        boolean isNewBooking =
                booking.getBookingId() == null;


        // --------------------------------------------------------
        // Get old status
        // --------------------------------------------------------

        if (!isNewBooking) {

            Booking oldBooking =
                    repository.findById(
                            booking.getBookingId()
                    ).orElse(null);

            if (oldBooking != null) {
                oldStatus = oldBooking.getStatus();
            }
        }


        // --------------------------------------------------------
        // Default status
        // --------------------------------------------------------

        if (booking.getStatus() == null ||
                booking.getStatus().isBlank()) {

            booking.setStatus("PENDING");
        }


        // --------------------------------------------------------
        // Save booking
        // --------------------------------------------------------

        Booking savedBooking =
                repository.save(booking);


        // ========================================================
        // COMPLETED BOOKING
        // CALCULATE TOTAL COST
        // ========================================================

        if ("COMPLETED".equals(savedBooking.getStatus())) {

            Equipment equipment =
                    equipmentRepository
                            .findById(
                                    savedBooking.getEquipmentId()
                            )
                            .orElse(null);

            if (equipment != null &&
                    savedBooking.getStartTime() != null &&
                    savedBooking.getEndTime() != null) {

                double hours =
                        Duration.between(
                                savedBooking.getStartTime(),
                                savedBooking.getEndTime()
                        ).toMinutes() / 60.0;


                Double totalCost =
                        Math.round(
                                hours *
                                        equipment.getCostPerHour() *
                                        100.0
                        ) / 100.0;


                savedBooking.setTotalCost(totalCost);

                savedBooking =
                        repository.save(savedBooking);
            }


            // ====================================================
            // CROSS-INSTITUTION BILLING
            // ====================================================

            User researcher =
                    userRepository
                            .findById(
                                    savedBooking.getUserId()
                            )
                            .orElse(null);

            if (researcher != null &&
                    equipment != null &&
                    researcher.getInstitutionId() != null &&
                    equipment.getInstitutionId() != null) {

                if (!researcher.getInstitutionId()
                        .equals(
                                equipment.getInstitutionId()
                        )) {

                    if (!billingRepository
                            .existsByBookingId(
                                    savedBooking.getBookingId()
                            )) {

                        Billing billing =
                                new Billing();

                        billing.setBookingId(
                                savedBooking.getBookingId()
                        );

                        billing.setFromInstitutionId(
                                researcher.getInstitutionId()
                        );

                        billing.setToInstitutionId(
                                equipment.getInstitutionId()
                        );

                        billing.setAmount(
                                savedBooking.getTotalCost()
                        );

                        billing.setBillingStatus(
                                "UNPAID"
                        );

                        billing.setCreatedAt(
                                LocalDateTime.now()
                        );

                        billingRepository.save(billing);
                    }
                }
            }


            // ====================================================
            // WAITLIST
            // ====================================================

            Optional<Booking> waitingBooking =
                    repository
                            .findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
                                    savedBooking.getEquipmentId(),
                                    "WAITLISTED"
                            );


            if (waitingBooking.isPresent()) {

                Booking nextBooking =
                        waitingBooking.get();

                nextBooking.setStatus("PENDING");

                repository.save(nextBooking);


                Notification availabilityNotification =
                        new Notification();

                availabilityNotification.setUserId(
                        nextBooking.getUserId()
                );

                availabilityNotification.setNotificationType(
                        "EQUIPMENT_AVAILABLE"
                );

                availabilityNotification.setMessage(
                        "The equipment you were waiting for is now available. "
                                + "Your booking has been moved to PENDING."
                );

                availabilityNotification.setIsRead(false);

                notificationService.saveNotification(
                        availabilityNotification
                );
            }
        }


        // ========================================================
        // NEW BOOKING NOTIFICATIONS
        // ========================================================

        if (isNewBooking) {

            // ----------------------------------------------------
            // Notify researcher
            // ----------------------------------------------------

            Notification researcherNotification =
                    new Notification();

            researcherNotification.setUserId(
                    savedBooking.getUserId()
            );

            researcherNotification.setNotificationType(
                    "BOOKING_CREATED"
            );

            researcherNotification.setMessage(
                    "Your booking request has been submitted successfully."
            );

            researcherNotification.setIsRead(false);

            notificationService.saveNotification(
                    researcherNotification
            );


            // ----------------------------------------------------
            // Get equipment
            // ----------------------------------------------------

            Equipment bookedEquipment =
                    equipmentRepository
                            .findById(
                                    savedBooking.getEquipmentId()
                            )
                            .orElse(null);


            // ----------------------------------------------------
            // Notify admins
            // ----------------------------------------------------

            List<User> users =
                    userRepository.findAll();


            for (User user : users) {

                if (user.getRole() == null) {
                    continue;
                }


                String roleName =
                        user.getRole().getRoleName();


                boolean notifyUser = false;


                // ------------------------------------------------
                // SYSTEM ADMIN
                // ------------------------------------------------

                if ("SYSTEM_ADMIN".equals(roleName)) {

                    notifyUser = true;
                }


                // ------------------------------------------------
                // INSTITUTION ADMIN
                // ------------------------------------------------

                if ("INSTITUTION_ADMIN".equals(roleName)
                        && bookedEquipment != null
                        && user.getInstitutionId() != null
                        && user.getInstitutionId()
                        .equals(
                                bookedEquipment.getInstitutionId()
                        )) {

                    notifyUser = true;
                }


                // ------------------------------------------------
                // DEPARTMENT HEAD
                // ------------------------------------------------

                if ("DEPARTMENT_HEAD".equals(roleName)
                        && bookedEquipment != null
                        && user.getDepartmentId() != null
                        && user.getDepartmentId()
                        .equals(
                                bookedEquipment.getDepartmentId()
                        )) {

                    notifyUser = true;
                }


                // ------------------------------------------------
                // Create notification
                // ------------------------------------------------

                if (notifyUser) {

                    Notification adminNotification =
                            new Notification();

                    adminNotification.setUserId(
                            user.getUserId()
                    );

                    adminNotification.setInstitutionId(
                            user.getInstitutionId()
                    );

                    adminNotification.setNotificationType(
                            "NEW_BOOKING"
                    );

                    adminNotification.setMessage(
                            "A new booking request has been submitted "
                                    + "for equipment in your department/institution."
                    );

                    adminNotification.setIsRead(false);

                    notificationService.saveNotification(
                            adminNotification
                    );
                }
            }
        }


        // ========================================================
        // STATUS CHANGE NOTIFICATIONS
        // ========================================================

        if (!isNewBooking &&
                oldStatus != null &&
                !oldStatus.equals(
                        savedBooking.getStatus()
                )) {

            String newStatus =
                    savedBooking.getStatus();

            String message = null;

            String notificationType = null;


            // ----------------------------------------------------
            // APPROVED
            // ----------------------------------------------------

            if ("APPROVED".equals(newStatus)) {

                notificationType =
                        "BOOKING_APPROVED";

                message =
                        "Your booking request has been approved.";
            }


            // ----------------------------------------------------
            // REJECTED
            // ----------------------------------------------------

            else if ("REJECTED".equals(newStatus)) {

                notificationType =
                        "BOOKING_REJECTED";

                message =
                        "Your booking request has been rejected.";
            }


            // ----------------------------------------------------
            // COMPLETED
            // ----------------------------------------------------

            else if ("COMPLETED".equals(newStatus)) {

                notificationType =
                        "BOOKING_COMPLETED";

                message =
                        "Your booking has been completed. Final cost: ₹"
                                + savedBooking.getTotalCost();
            }


            // ----------------------------------------------------
            // Notification
            // ----------------------------------------------------

            if (message != null) {

                Notification notification =
                        new Notification();

                notification.setUserId(
                        savedBooking.getUserId()
                );


                User researcher =
                        userRepository
                                .findById(
                                        savedBooking.getUserId()
                                )
                                .orElse(null);


                if (researcher != null) {

                    notification.setInstitutionId(
                            researcher.getInstitutionId()
                    );
                }


                notification.setNotificationType(
                        notificationType
                );

                notification.setMessage(
                        message
                );

                notification.setIsRead(false);

                notificationService.saveNotification(
                        notification
                );
            }
        }


        return savedBooking;
    }


    // ============================================================
    // GET BOOKING BY ID
    // ============================================================

    public Booking getBookingById(Integer id) {

        return repository.findById(id)
                .orElse(null);
    }


    // ============================================================
    // GET BOOKINGS BY USER
    // ============================================================

    public List<Booking> getBookingsByUser(
            Integer userId) {

        return repository.findByUserId(userId);
    }


    // ============================================================
    // GET BOOKINGS BY INSTITUTION
    // ============================================================

    public List<Booking> getBookingsByInstitution(
            Integer institutionId) {

        return repository.findBookingsByInstitution(
                institutionId
        );
    }


    // ============================================================
    // GET BOOKINGS BY DEPARTMENT
    // IMPORTANT FOR DEPARTMENT HEAD
    // ============================================================

    public List<Booking> getBookingsByDepartment(
            Integer departmentId) {

        return repository.findBookingsByDepartment(
                departmentId
        );
    }


    // ============================================================
    // UPDATE BOOKING STATUS
    // ============================================================

    public Booking updateBookingStatus(
            Integer bookingId,
            String newStatus,
            User loggedInUser) {


        Booking booking =
                repository.findById(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                ));


        if (loggedInUser.getRole() == null) {

            throw new RuntimeException(
                    "User role not found."
            );
        }


        String role =
                loggedInUser
                        .getRole()
                        .getRoleName();


        // ========================================================
        // SYSTEM ADMIN
        // ========================================================

        if ("SYSTEM_ADMIN".equals(role)) {

            booking.setStatus(newStatus);

            return saveBooking(booking);
        }


        // ========================================================
        // INSTITUTION ADMIN
        // ========================================================

        if ("INSTITUTION_ADMIN".equals(role)) {

            Equipment equipment =
                    equipmentRepository
                            .findById(
                                    booking.getEquipmentId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Equipment not found"
                                    ));


            if (loggedInUser.getInstitutionId() == null ||
                    !loggedInUser.getInstitutionId()
                            .equals(
                                    equipment.getInstitutionId()
                            )) {

                throw new RuntimeException(
                        "You are not authorized to manage this booking."
                );
            }


            if (!"APPROVED".equals(newStatus) &&
                    !"REJECTED".equals(newStatus)) {

                throw new RuntimeException(
                        "Invalid booking status."
                );
            }


            booking.setStatus(newStatus);

            Booking savedBooking =
                    repository.save(booking);


            // ----------------------------------------------------
            // Notify researcher
            // ----------------------------------------------------

            Notification notification =
                    new Notification();

            notification.setUserId(
                    booking.getUserId()
            );


            User researcher =
                    userRepository
                            .findById(
                                    booking.getUserId()
                            )
                            .orElse(null);


            if (researcher != null) {

                notification.setInstitutionId(
                        researcher.getInstitutionId()
                );
            }


            notification.setIsRead(false);


            if ("APPROVED".equals(newStatus)) {

                notification.setNotificationType(
                        "BOOKING_APPROVED"
                );

                notification.setMessage(
                        "Your booking request has been approved."
                );

            } else {

                notification.setNotificationType(
                        "BOOKING_REJECTED"
                );

                notification.setMessage(
                        "Your booking request has been rejected."
                );
            }


            notificationService.saveNotification(
                    notification
            );


            return savedBooking;
        }


        // ========================================================
        // DEPARTMENT HEAD
        // ========================================================

        if ("DEPARTMENT_HEAD".equals(role)) {

            Equipment equipment =
                    equipmentRepository
                            .findById(
                                    booking.getEquipmentId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Equipment not found"
                                    ));


            // ----------------------------------------------------
            // Department security
            // ----------------------------------------------------

            if (loggedInUser.getDepartmentId() == null ||
                    equipment.getDepartmentId() == null ||
                    !loggedInUser.getDepartmentId()
                            .equals(
                                    equipment.getDepartmentId()
                            )) {

                throw new RuntimeException(
                        "You are not authorized to manage this booking. "
                                + "The equipment does not belong to your department."
                );
            }


            // ----------------------------------------------------
            // Only APPROVED / REJECTED
            // ----------------------------------------------------

            if (!"APPROVED".equals(newStatus) &&
                    !"REJECTED".equals(newStatus)) {

                throw new RuntimeException(
                        "Invalid booking status. "
                                + "Department Head can only approve or reject bookings."
                );
            }


            booking.setStatus(newStatus);

            Booking savedBooking =
                    repository.save(booking);


            // ----------------------------------------------------
            // Notify researcher
            // ----------------------------------------------------

            Notification notification =
                    new Notification();

            notification.setUserId(
                    booking.getUserId()
            );


            User researcher =
                    userRepository
                            .findById(
                                    booking.getUserId()
                            )
                            .orElse(null);


            if (researcher != null) {

                notification.setInstitutionId(
                        researcher.getInstitutionId()
                );
            }


            notification.setIsRead(false);


            if ("APPROVED".equals(newStatus)) {

                notification.setNotificationType(
                        "BOOKING_APPROVED"
                );

                notification.setMessage(
                        "Your booking request has been approved "
                                + "by the Department Head."
                );

            } else {

                notification.setNotificationType(
                        "BOOKING_REJECTED"
                );

                notification.setMessage(
                        "Your booking request has been rejected "
                                + "by the Department Head."
                );
            }


            notificationService.saveNotification(
                    notification
            );


            return savedBooking;
        }


        // ========================================================
        // UNAUTHORIZED
        // ========================================================

        throw new RuntimeException(
                "You are not authorized to update bookings."
        );
    }


    // ============================================================
    // DELETE BOOKING
    // ============================================================

    public void deleteBooking(Integer id) {

        repository.deleteById(id);
    }

}