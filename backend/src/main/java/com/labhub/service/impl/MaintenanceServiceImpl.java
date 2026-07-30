package com.labhub.service.impl;

import com.labhub.entity.Equipment;
import com.labhub.entity.Maintenance;
import com.labhub.entity.User;
import com.labhub.enums.EquipmentStatus;
import com.labhub.enums.MaintenanceStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.EquipmentRepository;
import com.labhub.repository.MaintenanceRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.AuditLogService;
import com.labhub.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public Maintenance createRequest(String userEmail, UUID equipmentId, String type, String description,
                                     LocalDate scheduledDate, Double cost, LocalDate startDate, UUID technicianId) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        User assignedTech = creator;
        if (technicianId != null) {
            assignedTech = userRepository.findById(technicianId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", technicianId));
        }

        // Set equipment status to UNDER_MAINTENANCE immediately
        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(equipment);

        Maintenance maintenance = Maintenance.builder()
                .equipment(equipment)
                .technician(assignedTech)
                .type(type != null ? type : "Routine Maintenance")
                .description(description)
                .scheduledDate(scheduledDate)
                .startDate(startDate != null ? startDate : LocalDate.now())
                .cost(cost)
                .status(MaintenanceStatus.IN_PROGRESS) // Set to IN_PROGRESS directly
                .isActive(true)
                .build();

        maintenance = maintenanceRepository.save(maintenance);

        auditLogService.log(creator, "MAINTENANCE_INITIATED", "Maintenance", maintenance.getId().toString(),
                "Initiated maintenance for " + equipment.getName() + ", assigned to " + assignedTech.getFullName());

        return maintenance;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Maintenance> getAllMaintenance(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        boolean isSysAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.labhub.enums.RoleName.SYSTEM_ADMIN);

        if (isSysAdmin) {
            return maintenanceRepository.findAllWithEquipment();
        }

        UUID instId = null;
        if (currentUser.getInstitution() != null) {
            instId = currentUser.getInstitution().getId();
        } else if (currentUser.getDepartment() != null && currentUser.getDepartment().getInstitution() != null) {
            instId = currentUser.getDepartment().getInstitution().getId();
        }

        if (instId != null) {
            return maintenanceRepository.findByEquipmentDepartmentInstitutionId(instId);
        }

        return List.of();
    }

    @Override
    @Transactional
    public Maintenance approveRequest(UUID maintenanceId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", maintenanceId));

        maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);
        Equipment equipment = maintenance.getEquipment();
        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(equipment);

        maintenance = maintenanceRepository.save(maintenance);

        auditLogService.log(user, "MAINTENANCE_APPROVED", "Maintenance", maintenance.getId().toString(),
                "Approved maintenance for " + equipment.getName());

        return maintenance;
    }

    @Override
    @Transactional
    public Maintenance rejectRequest(UUID maintenanceId, String reason, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", maintenanceId));

        maintenance.setStatus(MaintenanceStatus.CANCELLED);
        maintenance.setNotes("Rejected: " + reason);
        maintenance = maintenanceRepository.save(maintenance);

        auditLogService.log(user, "MAINTENANCE_REJECTED", "Maintenance", maintenance.getId().toString(),
                "Rejected maintenance for " + maintenance.getEquipment().getName());

        return maintenance;
    }

    @Override
    @Transactional
    public Maintenance completeMaintenance(UUID maintenanceId, String notes, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", maintenanceId));

        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setCompletedDate(LocalDate.now());
        if (notes != null) maintenance.setNotes(notes);

        Equipment equipment = maintenance.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        maintenance = maintenanceRepository.save(maintenance);

        auditLogService.log(user, "MAINTENANCE_COMPLETED", "Maintenance", maintenance.getId().toString(),
                "Completed maintenance for " + equipment.getName());

        return maintenance;
    }

    @Override
    @Transactional
    public Maintenance updateStatus(UUID maintenanceId, MaintenanceStatus status, String notes, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", "id", maintenanceId));

        if (status != null) {
            maintenance.setStatus(status);
        }
        if (notes != null) {
            maintenance.setNotes(notes);
        }

        maintenance = maintenanceRepository.save(maintenance);

        auditLogService.log(user, "MAINTENANCE_UPDATED", "Maintenance", maintenance.getId().toString(),
                "Updated maintenance status to " + (status != null ? status.name() : "N/A") + " for " + maintenance.getEquipment().getName());

        return maintenance;
    }
}
