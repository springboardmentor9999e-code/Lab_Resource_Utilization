package com.labresource.backend.service;

import com.labresource.backend.repository.BookingRepository;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.repository.InterInstitutionSharingRepository;
import com.labresource.backend.repository.LaboratoryRepository;
import com.labresource.backend.repository.MaintenanceRepository;
import com.labresource.backend.repository.ResourceRepository;
import com.labresource.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;

import com.labresource.backend.entity.Booking;
import com.labresource.backend.entity.Maintenance;
import com.labresource.backend.entity.User;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final InterInstitutionSharingRepository interInstitutionSharingRepository;

    public ReportService(
            UserRepository userRepository,
            LaboratoryRepository laboratoryRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            MaintenanceRepository maintenanceRepository,
            InterInstitutionSharingRepository interInstitutionSharingRepository) {

        this.userRepository = userRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.interInstitutionSharingRepository = interInstitutionSharingRepository;
    }

    public Map<String, Long> getSummary(Authentication authentication) {

    Map<String, Long> report = new HashMap<>();

    String email = authentication.getName();

    User loggedInUser = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("Logged-in user not found"));

    String role = loggedInUser.getRole().getRoleName();

    // =========================================
    // SYSTEM ADMIN / INSTITUTION ADMIN
    // =========================================

    if ("SYSTEM_ADMIN".equals(role)
            || "INSTITUTE_ADMIN".equals(role)) {

        report.put("Users", userRepository.count());
        report.put("Laboratories", laboratoryRepository.count());
        report.put("Equipment", equipmentRepository.count());
        report.put("Resources", resourceRepository.count());
        report.put("Bookings", bookingRepository.count());
        report.put("Maintenance", maintenanceRepository.count());

        report.put(
                "ApprovedBookings",
                bookingRepository.countByStatus("APPROVED")
        );

        report.put(
                "PendingBookings",
                bookingRepository.countByStatus("PENDING")
        );

        report.put(
                "RejectedBookings",
                bookingRepository.countByStatus("REJECTED")
        );

        report.put(
                "CompletedBookings",
                bookingRepository.countByStatus("COMPLETED")
        );

        report.put(
                "PendingMaintenance",
                maintenanceRepository.countByStatus("Pending")
        );

        report.put(
                "ResolvedMaintenance",
                maintenanceRepository.countByStatus("Resolved")
        );

        return report;
    }

    // =========================================
    // DEPARTMENT HEAD
    // =========================================

    if ("DEPARTMENT_HEAD".equals(role)) {

        String department = loggedInUser.getDepartment();

        Long institutionId =
                loggedInUser.getInstitution().getInstitutionId();

        List<Booking> departmentBookings =
                bookingRepository.findByUserDepartmentAndUserInstitutionInstitutionId(
                        department,
                        institutionId
                );

        long totalBookings = departmentBookings.size();

        long approvedBookings =
                departmentBookings.stream()
                        .filter(b -> "APPROVED".equals(b.getStatus()))
                        .count();

        long pendingBookings =
                departmentBookings.stream()
                        .filter(b -> "PENDING".equals(b.getStatus()))
                        .count();

        long completedBookings =
                departmentBookings.stream()
                        .filter(b -> "COMPLETED".equals(b.getStatus()))
                        .count();

        long maintenance =
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
                        .size();

        report.put("Users", 0L);
        report.put("Laboratories", 0L);

        report.put(
    "Equipment",
    (long) equipmentRepository
        .findByLaboratoryInstitutionInstitutionId(institutionId)
        .size()
);

        report.put("Resources", 0L);

        report.put("Bookings", totalBookings);
        report.put("ApprovedBookings", approvedBookings);
        report.put("PendingBookings", pendingBookings);
        report.put("CompletedBookings", completedBookings);
        report.put("RejectedBookings", 0L);

        report.put("Maintenance", maintenance);

        report.put(
                "PendingMaintenance",
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
                        .stream()
                        .filter(m -> "Pending".equalsIgnoreCase(m.getStatus()))
                        .count()
        );

        report.put(
                "ResolvedMaintenance",
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                institutionId
                        )
                        .stream()
                        .filter(m -> "Resolved".equalsIgnoreCase(m.getStatus()))
                        .count()
        );

        return report;
    }

    // =========================================
    // LAB ASSISTANT
    // =========================================

    if ("LAB_ASSISTANT".equals(role)) {

        Long labId = loggedInUser.getLaboratory() != null
                ? loggedInUser.getLaboratory().getLabId()
                : null;

        if (labId == null) {
            return report;
        }

        List<Booking> labBookings =
                bookingRepository.findByLaboratoryLabId(labId);

        long totalBookings = labBookings.size();

        long approvedBookings =
                labBookings.stream()
                        .filter(b -> "APPROVED".equals(b.getStatus()))
                        .count();

        long pendingBookings =
                labBookings.stream()
                        .filter(b -> "PENDING".equals(b.getStatus()))
                        .count();

        long completedBookings =
                labBookings.stream()
                        .filter(b -> "COMPLETED".equals(b.getStatus()))
                        .count();

        List<Maintenance> maintenanceList =
                maintenanceRepository
                        .findByEquipmentLaboratoryInstitutionInstitutionId(
                                loggedInUser.getInstitution()
                                        .getInstitutionId()
                        );

        report.put("Users", 0L);
        report.put("Laboratories", 1L);

        report.put(
            "Equipment",
            (long) equipmentRepository
                .findByLaboratoryLabId(labId)
                .size()
        );

        report.put("Resources", 0L);

        report.put("Bookings", totalBookings);
        report.put("ApprovedBookings", approvedBookings);
        report.put("PendingBookings", pendingBookings);
        report.put("CompletedBookings", completedBookings);
        report.put("RejectedBookings", 0L);

        report.put("Maintenance", maintenanceList.size() * 1L);

        report.put(
                "PendingMaintenance",
                maintenanceList.stream()
                        .filter(m -> "Pending".equalsIgnoreCase(m.getStatus()))
                        .count()
        );

        report.put(
                "ResolvedMaintenance",
                maintenanceList.stream()
                        .filter(m -> "Resolved".equalsIgnoreCase(m.getStatus()))
                        .count()
        );

        return report;
    }

    return report;
}

    public List<Map<String, Object>> getEquipmentUtilizationReport() {

    List<Object[]> result =
            bookingRepository.getEquipmentUtilizationReport();

    List<Map<String, Object>> report = new ArrayList<>();

    for (Object[] row : result) {

        Map<String, Object> item = new HashMap<>();

        item.put("equipment", row[0]);

        item.put("bookings", row[1]);

        report.add(item);

    }

    return report;

}

public Map<String, Double> getProcurementCostAnalysis() {

    Map<String, Double> report = new HashMap<>();

    // Total Equipment Cost
    Double totalCost = equipmentRepository.getTotalInventoryValue();

    // Total Equipment Count
    Long totalEquipment = equipmentRepository.count();

    // Average Equipment Cost
    Double averageCost = 0.0;

    if (totalEquipment > 0 && totalCost != null) {
        averageCost = totalCost / totalEquipment;
    }

    report.put("TotalProcurementCost",
            totalCost == null ? 0.0 : totalCost);

    report.put("AverageEquipmentCost",
            averageCost);

    return report;
}

public List<Map<String, Object>> getInstitutionSharingReport() {

    List<Object[]> results =
            interInstitutionSharingRepository.getInstitutionSharingReport();

    List<Map<String, Object>> report = new ArrayList<>();

    for (Object[] row : results) {

        Map<String, Object> item = new HashMap<>();

        item.put("institution", row[0]);
        item.put("shares", row[1]);

        report.add(item);
    }

    return report;
}

 
}