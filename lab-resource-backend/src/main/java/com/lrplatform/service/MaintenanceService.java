package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.response.ServiceScheduleResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.*;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.model.enums.WorkOrderStatus;
import com.lrplatform.repository.*;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class MaintenanceService {

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

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

            // Record the service cycle on the equipment
            equipment.setLastServiceDate(workOrder.getCompletionDate());
            int interval = equipment.getServiceIntervalMonths() != null
                    ? equipment.getServiceIntervalMonths() : 6;
            equipment.setNextServiceDueDate(workOrder.getCompletionDate().plusMonths(interval));
            equipment.setServiceReminderSentOn(null);
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

    @Transactional(readOnly = true)
    public CalibrationRecord getCalibrationRecordById(Long id) {
        return calibrationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Calibration record not found"));
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

        if (record.getCalibratedBy() == null || record.getCalibratedBy().isBlank()) {
            throw new BadRequestException("Calibrated by is required");
        }

        if (record.getNotes() == null || record.getNotes().isBlank()) {
            throw new BadRequestException("Notes are required");
        }

        if (record.getCertificateNumber() == null || record.getCertificateNumber().isBlank()) {
            record.setCertificateNumber(generateCertificateNumber());
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

    @Transactional(readOnly = true)
    public List<ServiceScheduleResponse> getServiceSchedule(User user) {
        List<Equipment> equipmentList = scopeEquipmentForUser(user);
        List<ServiceScheduleResponse> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Equipment e : equipmentList) {
            LocalDate nextDue = e.getNextServiceDueDate();
            long daysUntilDue;
            String status;
            if (nextDue == null) {
                status = "NEVER_SERVICED";
                daysUntilDue = -1;
            } else {
                daysUntilDue = ChronoUnit.DAYS.between(today, nextDue);
                if (daysUntilDue < 0) {
                    status = "OVERDUE";
                } else if (daysUntilDue <= 30) {
                    status = "DUE_SOON";
                } else if (daysUntilDue <= 90) {
                    status = "UPCOMING";
                } else {
                    status = "CURRENT";
                }
            }

            String laboratoryName = e.getLaboratory() != null ? e.getLaboratory().getLaboratoryName() : null;
            String departmentName = e.getLaboratory() != null && e.getLaboratory().getDepartment() != null
                    ? e.getLaboratory().getDepartment().getDepartmentName() : null;
            String institutionName = e.getLaboratory() != null && e.getLaboratory().getDepartment() != null
                    && e.getLaboratory().getDepartment().getInstitution() != null
                    ? e.getLaboratory().getDepartment().getInstitution().getInstitutionName() : null;

            result.add(ServiceScheduleResponse.builder()
                    .equipmentId(e.getId())
                    .equipmentName(e.getEquipmentName())
                    .equipmentCode(e.getEquipmentCode())
                    .manufacturer(e.getManufacturer())
                    .modelNumber(e.getModelNumber())
                    .serialNumber(e.getSerialNumber())
                    .laboratoryName(laboratoryName)
                    .departmentName(departmentName)
                    .institutionName(institutionName)
                    .lastServiceDate(e.getLastServiceDate())
                    .nextServiceDueDate(nextDue)
                    .serviceIntervalMonths(e.getServiceIntervalMonths())
                    .serviceCount(workOrderRepository.countByEquipmentIdAndStatus(e.getId(), WorkOrderStatus.COMPLETED))
                    .status(status)
                    .daysUntilDue(daysUntilDue)
                    .build());
        }
        return result;
    }

    private List<Equipment> scopeEquipmentForUser(User user) {
        if (user == null || user.getRole() == null) {
            return List.of();
        }
        UserRole role = user.getRole();
        if (role == UserRole.SYSTEM_ADMIN) {
            return equipmentRepository.findAll();
        }
        if (role == UserRole.INSTITUTION_ADMIN && user.getInstitution() != null) {
            return equipmentRepository.findByLaboratoryDepartmentInstitutionId(user.getInstitution().getId());
        }
        if (user.getDepartment() != null) {
            return equipmentRepository.findByLaboratoryDepartmentId(user.getDepartment().getId());
        }
        return List.of();
    }

    @Auditable(module = "CALIBRATION", action = "RENEW", entityType = "CalibrationRecord")
    @Transactional
    public CalibrationRecord renewCalibrationRecord(Long recordId, String calibratedBy, String notes) {
        CalibrationRecord existing = calibrationRepository.findById(Objects.requireNonNull(recordId))
                .orElseThrow(() -> new ResourceNotFoundException("Calibration record not found"));

        Equipment equipment = existing.getEquipment();
        int interval = equipment.getCalibrationIntervalMonths() != null
                ? equipment.getCalibrationIntervalMonths() : 12;

        CalibrationRecord renewed = CalibrationRecord.builder()
                .equipment(equipment)
                .calibrationDate(LocalDate.now())
                .nextDueDate(LocalDate.now().plusMonths(interval))
                .certificateNumber(generateCertificateNumber())
                .calibratedBy(calibratedBy != null ? calibratedBy : existing.getCalibratedBy())
                .notes(notes != null ? notes : existing.getNotes())
                .build();

        CalibrationRecord saved = calibrationRepository.save(renewed);

        equipment.setCalibrationDueDate(saved.getNextDueDate());
        equipmentRepository.save(equipment);

        return saved;
    }

    private String generateCertificateNumber() {
        long count = calibrationRepository.count() + 1;
        return "CERT-" + Year.now().getValue() + "-" + String.format("%06d", count);
    }

    @Transactional
    public File generateCalibrationCertificatePdf(Long recordId) {
        CalibrationRecord record = calibrationRepository.findById(Objects.requireNonNull(recordId))
                .orElseThrow(() -> new ResourceNotFoundException("Calibration record not found"));

        Equipment equipment = record.getEquipment();
        String certDir = uploadDir.endsWith("/") || uploadDir.endsWith("\\")
                ? uploadDir + "certificates" : uploadDir + File.separator + "certificates";
        File dir = new File(certDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new BadRequestException("Could not create certificate directory");
        }

        String fileName = (record.getCertificateNumber() != null ? record.getCertificateNumber() : "certificate-" + recordId) + ".pdf";
        File pdfFile = new File(dir, fileName);

        try (PdfDocument pdfDoc = new PdfDocument(new PdfWriter(pdfFile));
             Document document = new Document(pdfDoc)) {

            PdfFont bold = PdfFontFactory.createFont();
            document.setFontSize(11);

            String laboratoryName = equipment.getLaboratory() != null ? equipment.getLaboratory().getLaboratoryName() : "";
            String departmentName = equipment.getLaboratory() != null && equipment.getLaboratory().getDepartment() != null
                    ? equipment.getLaboratory().getDepartment().getDepartmentName() : "";
            String institutionName = equipment.getLaboratory() != null && equipment.getLaboratory().getDepartment() != null
                    && equipment.getLaboratory().getDepartment().getInstitution() != null
                    ? equipment.getLaboratory().getDepartment().getInstitution().getInstitutionName() : "";

            document.add(new Paragraph(institutionName.isBlank() ? "Laboratory Resource Management" : institutionName)
                    .setTextAlignment(TextAlignment.CENTER).setFont(bold).setFontSize(16));
            document.add(new Paragraph("Calibration Certificate")
                    .setTextAlignment(TextAlignment.CENTER).setFontSize(13));
            document.add(new Paragraph("Certificate No: " + record.getCertificateNumber())
                    .setTextAlignment(TextAlignment.CENTER).setFontSize(10));
            document.add(new LineSeparator(new SolidLine()));

            Table table = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
            addRow(table, "Equipment Code", equipment.getEquipmentCode());
            addRow(table, "Equipment Name", equipment.getEquipmentName());
            addRow(table, "Manufacturer", equipment.getManufacturer());
            addRow(table, "Model Number", equipment.getModelNumber());
            addRow(table, "Serial Number", equipment.getSerialNumber());
            addRow(table, "Laboratory", laboratoryName);
            addRow(table, "Department", departmentName);
            addRow(table, "Calibration Date", String.valueOf(record.getCalibrationDate()));
            addRow(table, "Next Due Date", String.valueOf(record.getNextDueDate()));
            addRow(table, "Calibrated By", record.getCalibratedBy() != null ? record.getCalibratedBy() : "");
            document.add(table);

            if (record.getNotes() != null && !record.getNotes().isBlank()) {
                document.add(new Paragraph("Notes"));
                document.add(new Paragraph(record.getNotes()).setFontSize(9));
            }

            document.add(new LineSeparator(new SolidLine()));
            document.add(new Paragraph("This certificate verifies that the above equipment has been calibrated "
                            + "and is within its valid calibration period until " + record.getNextDueDate() + ".")
                    .setFontSize(9));
        } catch (Exception e) {
            log.error("Failed to generate calibration certificate PDF for record {}", recordId, e);
            throw new BadRequestException("Failed to generate calibration certificate: " + e.getMessage());
        }

        record.setCertificateUrl("/uploads/certificates/" + fileName);
        calibrationRepository.save(record);

        return pdfFile;
    }

    @Transactional
    public File getCalibrationCertificateFile(Long recordId) {
        CalibrationRecord record = calibrationRepository.findById(Objects.requireNonNull(recordId))
                .orElseThrow(() -> new ResourceNotFoundException("Calibration record not found"));

        String certDir = uploadDir.endsWith("/") || uploadDir.endsWith("\\")
                ? uploadDir + "certificates" : uploadDir + File.separator + "certificates";
        String fileName = (record.getCertificateNumber() != null ? record.getCertificateNumber() : "certificate-" + recordId) + ".pdf";
        File pdfFile = new File(certDir, fileName);

        if (pdfFile.exists()) {
            return pdfFile;
        }
        return generateCalibrationCertificatePdf(recordId);
    }

    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setFontSize(10)));
        table.addCell(new Cell().add(new Paragraph(value == null ? "" : value).setFontSize(10)));
    }
}
