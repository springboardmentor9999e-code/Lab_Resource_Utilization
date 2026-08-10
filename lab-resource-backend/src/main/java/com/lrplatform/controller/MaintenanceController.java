package com.lrplatform.controller;

import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.MaintenanceWorkOrderResponse;
import com.lrplatform.dto.response.ServiceScheduleResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.MaintenanceWorkOrder;
import com.lrplatform.model.entity.CalibrationRecord;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.WorkOrderStatus;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.MaintenanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/work-orders")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<MaintenanceWorkOrderResponse>> getAllWorkOrders(
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) WorkOrderStatus status,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        List<MaintenanceWorkOrder> orders;
        if (currentUser.getRole().name().equals("LAB_TECHNICIAN")) {
            orders = maintenanceService.getWorkOrdersByTechnician(currentUser.getId());
        } else if (currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long departmentId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            if (departmentId == null) throw new ForbiddenException("No department assigned to your account");
            orders = maintenanceService.getWorkOrdersByDepartment(departmentId);
        } else if (equipmentId != null) {
            orders = maintenanceService.getWorkOrdersByEquipment(equipmentId);
        } else if (technicianId != null) {
            orders = maintenanceService.getWorkOrdersByTechnician(technicianId);
        } else if (status != null) {
            orders = maintenanceService.getWorkOrdersByStatus(status);
        } else {
            orders = maintenanceService.getAllWorkOrders();
        }
        return ResponseEntity.ok(orders.stream().map(this::toDto).toList());
    }

    @GetMapping("/work-orders/{id}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceWorkOrderResponse> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(maintenanceService.getWorkOrderById(id)));
    }

    @PostMapping("/work-orders")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> createWorkOrder(@RequestBody MaintenanceWorkOrder workOrder,
                                                        HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        maintenanceService.createWorkOrder(workOrder, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work order created successfully"));
    }

    @PutMapping("/work-orders/{id}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> updateWorkOrder(@PathVariable Long id,
                                                       @RequestBody MaintenanceWorkOrder workOrder) {
        maintenanceService.updateWorkOrder(id, workOrder);
        return ResponseEntity.ok(ApiResponse.success("Work order updated successfully"));
    }

    @PutMapping("/work-orders/{id}/assign")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> assignWorkOrder(@PathVariable Long id,
                                                        @RequestBody Map<String, Long> body) {
        Long technicianId = body.get("technicianId");
        maintenanceService.assignWorkOrder(id, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Work order assigned successfully"));
    }

    @PutMapping("/work-orders/{id}/status")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id,
                                                     @RequestParam WorkOrderStatus status) {
        maintenanceService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully"));
    }

    @DeleteMapping("/work-orders/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> deleteWorkOrder(@PathVariable Long id) {
        maintenanceService.deleteWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work order deleted successfully"));
    }

    @GetMapping("/calibration/{equipmentId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<CalibrationRecord>> getCalibrationRecords(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(maintenanceService.getCalibrationRecords(equipmentId));
    }

    @PostMapping("/calibration")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> createCalibrationRecord(@RequestBody CalibrationRecord record) {
        maintenanceService.createCalibrationRecord(record);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Calibration record created successfully"));
    }

    @PutMapping("/calibration/{id}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> updateCalibrationRecord(@PathVariable Long id,
                                                                @RequestBody CalibrationRecord record) {
        maintenanceService.updateCalibrationRecord(id, record);
        return ResponseEntity.ok(ApiResponse.success("Calibration record updated successfully"));
    }

    @DeleteMapping("/calibration/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> deleteCalibrationRecord(@PathVariable Long id) {
        maintenanceService.deleteCalibrationRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Calibration record deleted successfully"));
    }

    @GetMapping("/service-schedule")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<ServiceScheduleResponse>> getServiceSchedule(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(maintenanceService.getServiceSchedule(currentUser));
    }

    @PutMapping("/calibration/{id}/renew")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> renewCalibrationRecord(@PathVariable Long id,
                                                               @RequestBody(required = false) Map<String, String> body) {
        String calibratedBy = body != null ? body.get("calibratedBy") : null;
        String notes = body != null ? body.get("notes") : null;
        maintenanceService.renewCalibrationRecord(id, calibratedBy, notes);
        return ResponseEntity.ok(ApiResponse.success("Calibration renewed successfully"));
    }

    @GetMapping("/calibration/{id}/certificate")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Resource> downloadCalibrationCertificate(@PathVariable Long id) {
        CalibrationRecord record = maintenanceService.getCalibrationRecordById(id);
        File file = maintenanceService.getCalibrationCertificateFile(id);
        FileSystemResource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(file.length())
                .body(resource);
    }

    private MaintenanceWorkOrderResponse toDto(MaintenanceWorkOrder w) {
        return MaintenanceWorkOrderResponse.builder()
                .id(w.getId())
                .equipmentId(w.getEquipment() != null ? w.getEquipment().getId() : null)
                .equipmentName(w.getEquipment() != null ? w.getEquipment().getEquipmentName() : null)
                .equipmentCode(w.getEquipment() != null ? w.getEquipment().getEquipmentCode() : null)
                .maintenanceType(w.getMaintenanceType() != null ? w.getMaintenanceType().name() : null)
                .priority(w.getPriority())
                .assignedToId(w.getAssignedTo() != null ? w.getAssignedTo().getId() : null)
                .assignedToName(w.getAssignedTo() != null ? w.getAssignedTo().getFirstName() + " " + w.getAssignedTo().getLastName() : null)
                .createdById(w.getCreatedBy() != null ? w.getCreatedBy().getId() : null)
                .createdByName(w.getCreatedBy() != null ? w.getCreatedBy().getFirstName() + " " + w.getCreatedBy().getLastName() : null)
                .status(w.getStatus() != null ? w.getStatus().name() : null)
                .description(w.getDescription())
                .scheduledDate(w.getScheduledDate())
                .completionDate(w.getCompletionDate())
                .downtimeHours(w.getDowntimeHours())
                .totalCost(w.getTotalCost())
                .remarks(w.getRemarks())
                .partsUsed(w.getPartsUsed())
                .laborHours(w.getLaborHours())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
