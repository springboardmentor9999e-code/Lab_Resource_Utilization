package com.labresource.backend.service;

import com.labresource.backend.repository.BookingRepository;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.repository.LaboratoryRepository;
import com.labresource.backend.repository.MaintenanceRepository;
import com.labresource.backend.repository.ResourceRepository;
import com.labresource.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final MaintenanceRepository maintenanceRepository;

    public ReportService(
            UserRepository userRepository,
            LaboratoryRepository laboratoryRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            MaintenanceRepository maintenanceRepository) {

        this.userRepository = userRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public Map<String, Long> getSummary() {

        Map<String, Long> report = new HashMap<>();

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
 
}