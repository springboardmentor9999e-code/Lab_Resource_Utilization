package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.*;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.model.enums.WorkOrderStatus;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceWorkOrderRepository workOrderRepository;
    private final CalibrationRecordRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public MaintenanceWorkOrder getWorkOrderById(Long id) {
        return workOrderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrder> getWorkOrdersByEquipment(Long equipmentId) {
        return workOrderRepository.findByEquipmentId(equipmentId);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrder> getWorkOrdersByTechnician(Long technicianId) {
        return workOrderRepository.findByAssignedToId(technicianId);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrder> getWorkOrdersByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrder> getWorkOrdersByDepartment(Long departmentId) {
        return workOrderRepository.findByEquipmentDepartmentId(departmentId);
    }

    @Auditable(module = "MAINTENANCE", action = "CREATE", entityType = "MaintenanceWorkOrder")
    @Transactional
    public MaintenanceWorkOrder createWorkOrder(MaintenanceWorkOrder workOrder, Long createdByUserId) {
        Equipment equipment = equipmentRepository.findById(Objects.requireNonNull(workOrder.getEquipment().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        User createdBy = userRepository.findById(Objects.requireNonNull(createdByUserId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        workOrder.setEquipment(equipment);
        workOrder.setCreatedBy(createdBy);
        workOrder.setStatus(WorkOrderStatus.CREATED);

        if (workOrder.getMaintenanceType() == null) {
            throw new BadRequestException("Maintenance type is required");
        }

        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);

        // Update equipment status to UNDER_MAINTENANCE
        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(equipment);

        // Notify assigned technician if provided
        if (workOrder.getAssignedTo() != null) {
            notificationService.createNotification(
                    workOrder.getAssignedTo(),
                    "New Work Order Assigned",
                    "Work order #" + saved.getId() + " for " + equipment.getEquipmentName() +
                            " has been assigned to you.",
                    com.lrplatform.model.enums.NotificationType.MAINTENANCE_SCHEDULED,
                    com.lrplatform.model.enums.NotificationPriority.HIGH
            );
        }

        return saved;
    }

    @Auditable(module = "MAINTENANCE", action = "UPDATE", entityType = "MaintenanceWorkOrder")
    @Transactional
    public MaintenanceWorkOrder updateWorkOrder(Long id, MaintenanceWorkOrder updated) {
        MaintenanceWorkOrder workOrder = getWorkOrderById(id);

        if (updated.getMaintenanceType() != null) {
            workOrder.setMaintenanceType(updated.getMaintenanceType());
        }
        if (updated.getPriority() != null) {
            workOrder.setPriority(updated.getPriority());
        }
        if (updated.getDescription() != null) {
            workOrder.setDescription(updated.getDescription());
        }
        if (updated.getScheduledDate() != null) {
            workOrder.setScheduledDate(updated.getScheduledDate());
        }
        if (updated.getRemarks() != null) {
            workOrder.setRemarks(updated.getRemarks());
        }
        if (updated.getDowntimeHours() != null) {
            workOrder.setDowntimeHours(updated.getDowntimeHours());
        }
        if (updated.getTotalCost() != null) {
            workOrder.setTotalCost(updated.getTotalCost());
        }
        if (updated.getPartsUsed() != null) {
            workOrder.setPartsUsed(updated.getPartsUsed());
        }
        if (updated.getLaborHours() != null) {
            workOrder.setLaborHours(updated.getLaborHours());
        }

        workOrder.setUpdatedAt(LocalDateTime.now());
        return workOrderRepository.save(workOrder);
    }

    @Auditable(module = "MAINTENANCE", action = "ASSIGN", entityType = "MaintenanceWorkOrder")
    @Transactional
    public MaintenanceWorkOrder assignWorkOrder(Long id, Long technicianId) {
        MaintenanceWorkOrder workOrder = getWorkOrderById(id);
        User technician = userRepository.findById(Objects.requireNonNull(technicianId))
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        workOrder.setAssignedTo(technician);
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        workOrder.setUpdatedAt(LocalDateTime.now());

        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);

        notificationService.createNotification(
                technician,
                "Work Order Assigned",
                "Work order #" + saved.getId() + " for " + saved.getEquipment().getEquipmentName() +
                        " has been assigned to you.",
                com.lrplatform.model.enums.NotificationType.MAINTENANCE_SCHEDULED,
                com.lrplatform.model.enums.NotificationPriority.HIGH
        );

        return saved;
    }

    @Auditable(module = "MAINTENANCE", action = "UPDATE_STATUS", entityType = "MaintenanceWorkOrder")
    @Transactional
    public MaintenanceWorkOrder updateStatus(Long id, WorkOrderStatus newStatus) {
        MaintenanceWorkOrder workOrder = getWorkOrderById(id);
        workOrder.setStatus(newStatus);
        workOrder.setUpdatedAt(LocalDateTime.now());

        if (newStatus == WorkOrderStatus.COMPLETED) {
            workOrder.setCompletionDate(LocalDate.now());

            // Update equipment status back to AVAILABLE
            Equipment equipment = workOrder.getEquipment();
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);

            // Notify creator
            notificationService.createNotification(
                    workOrder.getCreatedBy(),
                    "Work Order Completed",
                    "Work order #" + workOrder.getId() + " for " + equipment.getEquipmentName() +
                            " has been completed.",
                    com.lrplatform.model.enums.NotificationType.MAINTENANCE_COMPLETED,
                    com.lrplatform.model.enums.NotificationPriority.MEDIUM
            );
        }

        return workOrderRepository.save(workOrder);
    }

    @Auditable(module = "MAINTENANCE", action = "DELETE", entityType = "MaintenanceWorkOrder")
    @Transactional
    public void deleteWorkOrder(Long id) {
        MaintenanceWorkOrder workOrder = workOrderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found"));

        // Revert equipment status if work order is not completed
        if (workOrder.getStatus() != WorkOrderStatus.COMPLETED) {
            Equipment equipment = workOrder.getEquipment();
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        workOrderRepository.deleteById(id);
    }

    // Calibration methods

    @Transactional(readOnly = true)
    public List<CalibrationRecord> getCalibrationRecords(Long equipmentId) {
        return calibrationRepository.findByEquipmentIdOrderByCalibrationDateDesc(equipmentId);
    }

    @Auditable(module = "CALIBRATION", action = "CREATE", entityType = "CalibrationRecord")
    @Transactional
    public CalibrationRecord createCalibrationRecord(CalibrationRecord record) {
        Equipment equipment = equipmentRepository.findById(Objects.requireNonNull(record.getEquipment().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        record.setEquipment(equipment);

        if (record.getCalibrationDate() == null || record.getNextDueDate() == null) {
            throw new BadRequestException("Calibration date and next due date are required");
        }

        CalibrationRecord saved = calibrationRepository.save(record);

        // Update equipment calibration due date
        equipment.setCalibrationDueDate(record.getNextDueDate());
        equipmentRepository.save(equipment);

        return saved;
    }

    @Auditable(module = "CALIBRATION", action = "UPDATE", entityType = "CalibrationRecord")
    @Transactional
    public CalibrationRecord updateCalibrationRecord(Long id, CalibrationRecord updated) {
        CalibrationRecord record = calibrationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Calibration record not found"));

        if (updated.getCalibrationDate() != null) {
            record.setCalibrationDate(updated.getCalibrationDate());
        }
        if (updated.getNextDueDate() != null) {
            record.setNextDueDate(updated.getNextDueDate());
        }
        if (updated.getCertificateUrl() != null) {
            record.setCertificateUrl(updated.getCertificateUrl());
        }
        if (updated.getCalibratedBy() != null) {
            record.setCalibratedBy(updated.getCalibratedBy());
        }
        if (updated.getNotes() != null) {
            record.setNotes(updated.getNotes());
        }

        return calibrationRepository.save(Objects.requireNonNull(record));
    }

    @Auditable(module = "CALIBRATION", action = "DELETE", entityType = "CalibrationRecord")
    @Transactional
    public void deleteCalibrationRecord(Long id) {
        if (!calibrationRepository.existsById(Objects.requireNonNull(id))) {
            throw new ResourceNotFoundException("Calibration record not found");
        }
        calibrationRepository.deleteById(Objects.requireNonNull(id));
    }
}
