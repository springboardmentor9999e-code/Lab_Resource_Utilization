package com.labresource.service.impl;

import com.labresource.dto.request.CalibrationCreate;
import com.labresource.dto.request.MaintenanceRequestCreate;
import com.labresource.dto.request.MaintenanceScheduleCreate;
import com.labresource.dto.response.CalibrationResponse;
import com.labresource.dto.response.MaintenanceRequestResponse;
import com.labresource.dto.response.MaintenanceScheduleResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.security.Roles;
import com.labresource.service.interfaces.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private static final Set<String> VALID_TYPES = Set.of("PREVENTIVE", "CORRECTIVE", "CALIBRATION", "INSPECTION");
    private static final Set<String> VALID_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL");

    private static final Set<String> MANAGER_AUTHORITIES = Set.of(
            "ROLE_" + Roles.SYSTEM_ADMIN, "ROLE_" + Roles.INSTITUTION_ADMIN,
            "ROLE_" + Roles.DEPARTMENT_HEAD, "ROLE_" + Roles.LAB_MANAGER);

    private static final Set<String> STAFF_AUTHORITIES = Set.of(
            "ROLE_" + Roles.SYSTEM_ADMIN, "ROLE_" + Roles.INSTITUTION_ADMIN,
            "ROLE_" + Roles.DEPARTMENT_HEAD, "ROLE_" + Roles.LAB_MANAGER,
            "ROLE_" + Roles.LAB_TECHNICIAN);

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;
    private final ChargebackService chargebackService;

    // ------------------------------------------------------------------
    // Work orders
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public MaintenanceRequestResponse createRequest(MaintenanceRequestCreate request, String username) {
        AppUser reporter = requireUser(username);
        Equipment equipment = requireEquipment(request.getEquipmentId());

        String type = normalize(request.getType(), VALID_TYPES, "maintenance type");
        String priority = request.getPriority() == null || request.getPriority().isBlank()
                ? "MEDIUM"
                : normalize(request.getPriority(), VALID_PRIORITIES, "priority");

        MaintenanceRequest saved = maintenanceRequestRepository.save(MaintenanceRequest.builder()
                .equipment(equipment)
                .requestedBy(reporter)
                .type(type)
                .priority(priority)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .status("OPEN")
                .build());

        // Alert managers so the work order gets triaged
        for (AppUser manager : appUserRepository.findActiveByRoles(
                List.of(Roles.SYSTEM_ADMIN, Roles.LAB_MANAGER, Roles.DEPARTMENT_HEAD))) {
            notificationService.notifyInApp(manager, "MAINTENANCE",
                    "New Maintenance Request (" + priority + ")",
                    equipment.getEquipmentName() + ": " + saved.getTitle()
                            + " — reported by " + reporter.getFirstName() + " " + reporter.getLastName(),
                    "/dashboard/maintenance");
        }

        return mapRequest(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequestResponse> getRequests(String username) {
        if (hasAnyAuthority(STAFF_AUTHORITIES)) {
            return maintenanceRequestRepository.findAllByOrderByCreatedAtDesc()
                    .stream().map(this::mapRequest).collect(Collectors.toList());
        }
        AppUser user = requireUser(username);
        return maintenanceRequestRepository.findByRequestedBy_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream().map(this::mapRequest).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequestResponse> getMyAssigned(String username) {
        AppUser user = requireUser(username);
        return maintenanceRequestRepository.findByAssignedTo_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream().map(this::mapRequest).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse assign(Long requestId, Long technicianId, String username) {
        MaintenanceRequest request = requireRequest(requestId);
        if (!"OPEN".equals(request.getStatus()) && !"ASSIGNED".equals(request.getStatus())) {
            throw new RuntimeException("Only OPEN or ASSIGNED work orders can be (re)assigned");
        }

        AppUser technician = appUserRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        boolean isTechnician = technician.getUserRoles().stream()
                .anyMatch(ur -> Roles.LAB_TECHNICIAN.equals(ur.getRole().getRoleName()));
        if (!isTechnician) {
            throw new RuntimeException("The selected user is not a Lab Technician");
        }

        request.setAssignedTo(technician);
        request.setStatus("ASSIGNED");
        MaintenanceRequest saved = maintenanceRequestRepository.save(request);

        // Urgent: a technician is often away from a desk, and equipment stays down until the
        // work order is picked up.
        notificationService.notifyUrgent(technician, "MAINTENANCE",
                "Work Order Assigned to You",
                "Work order #" + saved.getRequestId() + " — " + saved.getTitle()
                        + " (" + saved.getEquipment().getEquipmentName() + ", priority " + saved.getPriority() + ")",
                "/dashboard/maintenance",
                "Work order #" + saved.getRequestId() + " (" + saved.getPriority() + ") assigned: "
                        + saved.getEquipment().getEquipmentName() + ".");

        return mapRequest(saved);
    }

    @Override
    @Transactional
    public MaintenanceRequestResponse updateStatus(Long requestId, String status,
                                                   String resolutionNotes, BigDecimal cost, String username) {
        MaintenanceRequest request = requireRequest(requestId);
        String newStatus = status == null ? "" : status.trim().toUpperCase();
        String oldStatus = request.getStatus();

        Map<String, Set<String>> transitions = Map.of(
                "OPEN", Set.of("CANCELLED", "IN_PROGRESS"),
                "ASSIGNED", Set.of("IN_PROGRESS", "CANCELLED"),
                "IN_PROGRESS", Set.of("COMPLETED")
        );
        Set<String> allowed = transitions.get(oldStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new RuntimeException("Illegal work order transition: " + oldStatus + " -> " + newStatus);
        }

        // Permission: managers always; the assigned technician for their own orders
        boolean isManager = hasAnyAuthority(MANAGER_AUTHORITIES);
        boolean isAssignedTech = request.getAssignedTo() != null
                && request.getAssignedTo().getUsername().equals(username);
        if (!isManager && !isAssignedTech) {
            throw new RuntimeException("Only managers or the assigned technician can update this work order");
        }

        Equipment equipment = request.getEquipment();

        switch (newStatus) {
            case "IN_PROGRESS" -> {
                request.setStartedAt(LocalDateTime.now());
                equipment.setStatus("UNDER_MAINTENANCE");
                equipmentRepository.save(equipment);
            }
            case "COMPLETED" -> {
                request.setCompletedAt(LocalDateTime.now());
                if (request.getStartedAt() != null) {
                    request.setDowntimeMinutes(
                            Duration.between(request.getStartedAt(), request.getCompletedAt()).toMinutes());
                }
                request.setResolutionNotes(resolutionNotes);
                request.setCost(cost);
                if ("UNDER_MAINTENANCE".equals(equipment.getStatus())) {
                    equipment.setStatus("AVAILABLE");
                    equipmentRepository.save(equipment);
                }
            }
            case "CANCELLED" -> {
                request.setResolutionNotes(resolutionNotes);
                if ("UNDER_MAINTENANCE".equals(equipment.getStatus())) {
                    equipment.setStatus("AVAILABLE");
                    equipmentRepository.save(equipment);
                }
            }
            default -> { /* unreachable */ }
        }

        request.setStatus(newStatus);
        MaintenanceRequest saved = maintenanceRequestRepository.save(request);

        if ("COMPLETED".equals(newStatus)) {
            notificationService.notifyInApp(request.getRequestedBy(), "MAINTENANCE",
                    "Maintenance Completed",
                    "Work order #" + saved.getRequestId() + " for "
                            + equipment.getEquipmentName() + " has been completed.",
                    "/dashboard/maintenance");

            // Bills the owning department. Own transaction, own error handling — a billing
            // failure cannot undo the completion.
            chargebackService.postMaintenanceCharge(saved.getRequestId());
        }

        return mapRequest(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTechnicians() {
        return appUserRepository.findActiveByRole(Roles.LAB_TECHNICIAN).stream()
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("userId", t.getUserId());
                    m.put("fullName", t.getFirstName() + " " + t.getLastName());
                    m.put("username", t.getUsername());
                    m.put("activeTaskCount", maintenanceRequestRepository
                            .findByAssignedTo_UserIdOrderByCreatedAtDesc(t.getUserId()).stream()
                            .filter(r -> Set.of("ASSIGNED", "IN_PROGRESS").contains(r.getStatus()))
                            .count());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Calibration
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public CalibrationResponse addCalibration(CalibrationCreate request, String username) {
        AppUser creator = requireUser(username);
        Equipment equipment = requireEquipment(request.getEquipmentId());

        if (request.getNextDueDate().isBefore(request.getCalibrationDate())) {
            throw new RuntimeException("Next due date must be after the calibration date");
        }

        EquipmentCalibration saved = calibrationRepository.save(EquipmentCalibration.builder()
                .equipment(equipment)
                .calibrationDate(request.getCalibrationDate())
                .nextDueDate(request.getNextDueDate())
                .certificateNumber(request.getCertificateNumber())
                .calibratedBy(request.getCalibratedBy())
                .remarks(request.getRemarks())
                .createdBy(creator)
                .build());

        return mapCalibration(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationResponse> getCalibrations(Long equipmentId) {
        List<EquipmentCalibration> list = equipmentId != null
                ? calibrationRepository.findByEquipment_EquipmentIdOrderByCalibrationDateDesc(equipmentId)
                : calibrationRepository.findAllByOrderByNextDueDateAsc();
        return list.stream().map(this::mapCalibration).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationResponse> getExpiringCalibrations(int days) {
        return calibrationRepository.findExpiringUntil(LocalDate.now().plusDays(days)).stream()
                .map(this::mapCalibration)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Preventive schedules
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public MaintenanceScheduleResponse createSchedule(MaintenanceScheduleCreate request, String username) {
        AppUser creator = requireUser(username);
        Equipment equipment = requireEquipment(request.getEquipmentId());

        String type = normalize(request.getMaintenanceType(),
                Set.of("PREVENTIVE", "CALIBRATION", "INSPECTION"), "schedule type");

        MaintenanceSchedule saved = maintenanceScheduleRepository.save(MaintenanceSchedule.builder()
                .equipment(equipment)
                .createdBy(creator)
                .maintenanceType(type)
                .intervalDays(request.getIntervalDays())
                .nextDueDate(request.getNextDueDate())
                .notes(request.getNotes())
                .active(true)
                .build());

        return mapSchedule(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> getSchedules() {
        return maintenanceScheduleRepository.findAllByOrderByNextDueDateAsc().stream()
                .map(this::mapSchedule)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaintenanceScheduleResponse toggleSchedule(Long scheduleId, String username) {
        MaintenanceSchedule schedule = maintenanceScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Maintenance schedule not found"));
        schedule.setActive(!Boolean.TRUE.equals(schedule.getActive()));
        return mapSchedule(maintenanceScheduleRepository.save(schedule));
    }

    // ------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSummary() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("open", maintenanceRequestRepository.countByStatus("OPEN"));
        summary.put("assigned", maintenanceRequestRepository.countByStatus("ASSIGNED"));
        summary.put("inProgress", maintenanceRequestRepository.countByStatus("IN_PROGRESS"));
        summary.put("completedLast30", maintenanceRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> "COMPLETED".equals(r.getStatus())
                        && r.getCompletedAt() != null && r.getCompletedAt().isAfter(thirtyDaysAgo))
                .count());
        summary.put("downtimeHoursLast30",
                Math.round(maintenanceRequestRepository.sumDowntimeMinutesSince(thirtyDaysAgo) / 60.0 * 10) / 10.0);
        summary.put("overdueCalibrations", calibrationRepository.countByNextDueDateBefore(LocalDate.now()));
        summary.put("maintenanceCostLast30", maintenanceRequestRepository.sumCompletedCostSince(thirtyDaysAgo));
        summary.put("activeSchedules", maintenanceScheduleRepository.findAllByOrderByNextDueDateAsc().stream()
                .filter(s -> Boolean.TRUE.equals(s.getActive())).count());
        return summary;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private AppUser requireUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Equipment requireEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    private MaintenanceRequest requireRequest(Long id) {
        return maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));
    }

    private String normalize(String value, Set<String> valid, String label) {
        String v = value == null ? "" : value.trim().toUpperCase();
        if (!valid.contains(v)) {
            throw new RuntimeException("Invalid " + label + ": " + value + ". Use one of " + valid);
        }
        return v;
    }

    private boolean hasAnyAuthority(Set<String> authorities) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(Object::toString)
                .anyMatch(authorities::contains);
    }

    private MaintenanceRequestResponse mapRequest(MaintenanceRequest r) {
        return MaintenanceRequestResponse.builder()
                .requestId(r.getRequestId())
                .equipmentId(r.getEquipment().getEquipmentId())
                .equipmentName(r.getEquipment().getEquipmentName())
                .equipmentCode(r.getEquipment().getEquipmentCode())
                .labName(r.getEquipment().getLab() != null ? r.getEquipment().getLab().getName() : "Unallocated")
                .requestedByName(r.getRequestedBy().getFirstName() + " " + r.getRequestedBy().getLastName())
                .assignedToId(r.getAssignedTo() != null ? r.getAssignedTo().getUserId() : null)
                .assignedToName(r.getAssignedTo() != null
                        ? r.getAssignedTo().getFirstName() + " " + r.getAssignedTo().getLastName() : null)
                .type(r.getType())
                .priority(r.getPriority())
                .title(r.getTitle())
                .description(r.getDescription())
                .status(r.getStatus())
                .scheduledDate(r.getScheduledDate())
                .startedAt(r.getStartedAt())
                .completedAt(r.getCompletedAt())
                .downtimeMinutes(r.getDowntimeMinutes())
                .resolutionNotes(r.getResolutionNotes())
                .cost(r.getCost())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private CalibrationResponse mapCalibration(EquipmentCalibration c) {
        return CalibrationResponse.builder()
                .calibrationId(c.getCalibrationId())
                .equipmentId(c.getEquipment().getEquipmentId())
                .equipmentName(c.getEquipment().getEquipmentName())
                .equipmentCode(c.getEquipment().getEquipmentCode())
                .calibrationDate(c.getCalibrationDate())
                .nextDueDate(c.getNextDueDate())
                .daysUntilDue(ChronoUnit.DAYS.between(LocalDate.now(), c.getNextDueDate()))
                .certificateNumber(c.getCertificateNumber())
                .calibratedBy(c.getCalibratedBy())
                .remarks(c.getRemarks())
                .createdByName(c.getCreatedBy().getFirstName() + " " + c.getCreatedBy().getLastName())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private MaintenanceScheduleResponse mapSchedule(MaintenanceSchedule s) {
        return MaintenanceScheduleResponse.builder()
                .scheduleId(s.getScheduleId())
                .equipmentId(s.getEquipment().getEquipmentId())
                .equipmentName(s.getEquipment().getEquipmentName())
                .equipmentCode(s.getEquipment().getEquipmentCode())
                .maintenanceType(s.getMaintenanceType())
                .intervalDays(s.getIntervalDays())
                .nextDueDate(s.getNextDueDate())
                .lastGeneratedDate(s.getLastGeneratedDate())
                .notes(s.getNotes())
                .active(s.getActive())
                .createdByName(s.getCreatedBy().getFirstName() + " " + s.getCreatedBy().getLastName())
                .build();
    }
}
