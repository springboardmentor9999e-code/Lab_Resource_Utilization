package com.labresource.platform.service.impl;

import com.labresource.platform.dto.CreateMaintenanceRequest;
import com.labresource.platform.dto.MaintenanceResponse;
import com.labresource.platform.dto.UpdateMaintenanceRequest;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Maintenance;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.EquipmentNotFoundException;
import com.labresource.platform.exception.MaintenanceConflictException;
import com.labresource.platform.exception.MaintenanceNotFoundException;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.MaintenanceRepository;
import com.labresource.platform.service.MaintenanceService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {

    private static final List<MaintenanceStatus> ACTIVE_STATUSES = List.of(
            MaintenanceStatus.SCHEDULED,
            MaintenanceStatus.IN_PROGRESS
    );

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceServiceImpl(
            EquipmentRepository equipmentRepository,
            MaintenanceRepository maintenanceRepository
    ) {
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Override
    @Transactional
    public MaintenanceResponse createMaintenance(CreateMaintenanceRequest request, Authentication authentication) {
        User createdBy = authenticatedUser(authentication);
        Equipment equipment = findEquipmentById(request.equipmentId());
        validateScheduledWindow(request.scheduledStartTime(), request.scheduledEndTime());
        validateNoActiveOverlap(equipment.getId(), request.scheduledStartTime(), request.scheduledEndTime(), null);

        Maintenance maintenance = Maintenance.builder()
                .equipment(equipment)
                .title(normalizeRequired(request.title(), "Title is required"))
                .description(normalizeOptional(request.description()))
                .status(MaintenanceStatus.SCHEDULED)
                .scheduledStartTime(request.scheduledStartTime())
                .scheduledEndTime(request.scheduledEndTime())
                .technicianName(normalizeOptional(request.technicianName()))
                .notes(normalizeOptional(request.notes()))
                .createdBy(createdBy)
                .build();

        return MaintenanceResponse.from(maintenanceRepository.saveAndFlush(maintenance));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getAllMaintenance() {
        return maintenanceRepository.findAll()
                .stream()
                .map(MaintenanceResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceResponse getMaintenanceById(Long id) {
        return MaintenanceResponse.from(findMaintenanceById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId) {
        findEquipmentById(equipmentId);

        return maintenanceRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(MaintenanceResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatus(status)
                .stream()
                .map(MaintenanceResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public MaintenanceResponse updateMaintenance(Long id, UpdateMaintenanceRequest request) {
        Maintenance maintenance = findMaintenanceById(id);

        if (maintenance.getStatus() != MaintenanceStatus.SCHEDULED) {
            throw new IllegalArgumentException("Only scheduled maintenance records can be edited");
        }

        Equipment equipment = findEquipmentById(request.equipmentId());
        validateScheduledWindow(request.scheduledStartTime(), request.scheduledEndTime());
        validateNoActiveOverlap(equipment.getId(), request.scheduledStartTime(), request.scheduledEndTime(), id);

        maintenance.setEquipment(equipment);
        maintenance.setTitle(normalizeRequired(request.title(), "Title is required"));
        maintenance.setDescription(normalizeOptional(request.description()));
        maintenance.setScheduledStartTime(request.scheduledStartTime());
        maintenance.setScheduledEndTime(request.scheduledEndTime());
        maintenance.setTechnicianName(normalizeOptional(request.technicianName()));
        maintenance.setNotes(normalizeOptional(request.notes()));

        return MaintenanceResponse.from(maintenanceRepository.saveAndFlush(maintenance));
    }

    @Override
    @Transactional
    public MaintenanceResponse startMaintenance(Long id) {
        Maintenance maintenance = findMaintenanceById(id);

        if (maintenance.getStatus() != MaintenanceStatus.SCHEDULED) {
            throw new IllegalArgumentException("Only scheduled maintenance can be started");
        }

        maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);
        maintenance.setActualStartTime(LocalDateTime.now());
        maintenance.getEquipment().setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.saveAndFlush(maintenance.getEquipment());

        return MaintenanceResponse.from(maintenanceRepository.saveAndFlush(maintenance));
    }

    @Override
    @Transactional
    public MaintenanceResponse completeMaintenance(Long id) {
        Maintenance maintenance = findMaintenanceById(id);

        if (maintenance.getStatus() != MaintenanceStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Only in-progress maintenance can be completed");
        }

        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setActualEndTime(LocalDateTime.now());
        maintenance.getEquipment().setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.saveAndFlush(maintenance.getEquipment());

        return MaintenanceResponse.from(maintenanceRepository.saveAndFlush(maintenance));
    }

    @Override
    @Transactional
    public MaintenanceResponse cancelMaintenance(Long id) {
        Maintenance maintenance = findMaintenanceById(id);

        if (maintenance.getStatus() == MaintenanceStatus.COMPLETED
                || maintenance.getStatus() == MaintenanceStatus.CANCELLED) {
            throw new IllegalArgumentException("Completed or cancelled maintenance records cannot be cancelled");
        }

        if (maintenance.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            maintenance.getEquipment().setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.saveAndFlush(maintenance.getEquipment());
        }

        maintenance.setStatus(MaintenanceStatus.CANCELLED);

        return MaintenanceResponse.from(maintenanceRepository.saveAndFlush(maintenance));
    }

    private Maintenance findMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new MaintenanceNotFoundException("Maintenance record with id " + id + " was not found"));
    }

    private Equipment findEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment with id " + id + " was not found"));
    }

    private void validateScheduledWindow(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Scheduled start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Scheduled start time must be before scheduled end time");
        }

        if (!endTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Maintenance window must not have already ended");
        }
    }

    private void validateNoActiveOverlap(
            Long equipmentId,
            LocalDateTime scheduledStartTime,
            LocalDateTime scheduledEndTime,
            Long excludedId
    ) {
        List<Maintenance> overlappingMaintenance = excludedId == null
                ? maintenanceRepository.findOverlappingActiveMaintenance(
                        equipmentId,
                        ACTIVE_STATUSES,
                        scheduledStartTime,
                        scheduledEndTime
                )
                : maintenanceRepository.findOverlappingActiveMaintenanceExcludingId(
                        excludedId,
                        equipmentId,
                        ACTIVE_STATUSES,
                        scheduledStartTime,
                        scheduledEndTime
                );

        if (!overlappingMaintenance.isEmpty()) {
            throw new MaintenanceConflictException("Active maintenance already exists for this equipment in the requested time range");
        }
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Authenticated user was not found");
        }

        return user;
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
