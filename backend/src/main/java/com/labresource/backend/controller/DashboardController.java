package com.labresource.backend.controller;

import com.labresource.backend.repository.BookingRepository;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.repository.MaintenanceRepository;
import com.labresource.backend.repository.NotificationRepository;
import com.labresource.backend.repository.InterInstitutionSharingRepository;
import com.labresource.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final NotificationRepository notificationRepository;
    private final InterInstitutionSharingRepository sharingRepository;
    private final UserRepository userRepository;

    public DashboardController(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            MaintenanceRepository maintenanceRepository,
            NotificationRepository notificationRepository,
            InterInstitutionSharingRepository sharingRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.notificationRepository = notificationRepository;
        this.sharingRepository = sharingRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // STUDENT DASHBOARD
    // =========================

    @GetMapping("/student")
    public ResponseEntity<?> studentDashboard(
            Authentication authentication) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow();

        Long userId = user.getUserId();

        Map<String, Object> data = new HashMap<>();

        data.put(
                "myBookings",
                bookingRepository.findByUserUserId(userId)
        );

        data.put(
                "bookingCount",
                bookingRepository.countByUserUserId(userId)
        );

        data.put(
                "approvedBookings",
                bookingRepository
                        .countByUserUserIdAndStatus(userId, "APPROVED")
        );

        data.put(
                "completedBookings",
                bookingRepository
                        .countByUserUserIdAndStatus(userId, "COMPLETED")
        );

        data.put(
                "pendingBookings",
                bookingRepository
                        .countByUserUserIdAndStatus(userId, "PENDING")
        );

        data.put(
                "notifications",
                notificationRepository
                        .findByUserUserIdAndIsReadFalse(userId)
        );

        data.put(
                "equipmentHistory",
                bookingRepository
                        .getUserEquipmentHistory(userId)
        );

        data.put(
                "equipment",
                equipmentRepository
                        .findByLaboratoryInstitutionInstitutionId(
                                user.getInstitution()
                                        .getInstitutionId()
                        )
        );

        return ResponseEntity.ok(data);
    }


    // =========================
    // DEPARTMENT HEAD DASHBOARD
    // =========================

    @GetMapping("/department")
    public ResponseEntity<?> departmentDashboard(
            Authentication authentication) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow();

        Long institutionId =
                user.getInstitution()
                        .getInstitutionId();

        Map<String, Object> data = new HashMap<>();

        data.put(
                "pendingBookings",
                bookingRepository.findByStatus("PENDING")
        );

        data.put(
                "bookingCount",
                bookingRepository
                        .countByLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        data.put(
                "approvedBookings",
                bookingRepository
                        .countByLaboratoryInstitutionInstitutionIdAndStatus(
                                institutionId,
                                "APPROVED"
                        )
        );

        data.put(
                "equipment",
                equipmentRepository
                        .findByLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        data.put(
                "maintenance",
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        return ResponseEntity.ok(data);
    }


    // =========================
    // INSTITUTION ADMIN
    // =========================

    @GetMapping("/institution")
    public ResponseEntity<?> institutionDashboard(
            Authentication authentication) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow();

        Long institutionId =
                user.getInstitution()
                        .getInstitutionId();

        Map<String, Object> data = new HashMap<>();

        data.put(
                "equipment",
                equipmentRepository
                        .findByLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        data.put(
                "bookings",
                bookingRepository
                        .findByLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        data.put(
                "maintenance",
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
        );

        data.put(
                "sharing",
                sharingRepository
                        .findByFromInstitutionInstitutionIdOrToInstitutionInstitutionId(
                                institutionId,
                                institutionId
                        )
        );

        return ResponseEntity.ok(data);
    }
}