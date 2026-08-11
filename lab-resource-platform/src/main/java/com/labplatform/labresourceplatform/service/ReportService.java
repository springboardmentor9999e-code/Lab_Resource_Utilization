package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.BillingRecord;
import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Maintenance;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Milestone 3, task (v): "Generate utilization effectiveness and cost analysis
// reports." Assembles a single report snapshot from data that already exists
// elsewhere in the app (utilization heatmap, day-of-week patterns, idle
// equipment, maintenance history, calibration reminders, billing totals) -
// this service doesn't compute anything new, it packages existing service
// methods into one coherent report payload that ReportPdfService then renders.
@Service
public class ReportService {

    private final UtilizationService utilizationService;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final CalibrationRecordService calibrationRecordService;
    private final BillingRecordService billingRecordService;

    public ReportService(UtilizationService utilizationService,
                          EquipmentRepository equipmentRepository,
                          MaintenanceRepository maintenanceRepository,
                          CalibrationRecordService calibrationRecordService,
                          BillingRecordService billingRecordService) {
        this.utilizationService = utilizationService;
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.calibrationRecordService = calibrationRecordService;
        this.billingRecordService = billingRecordService;
    }

    // Builds the full report data set for the given window, scoped to the
    // requesting user's institution - SYSTEM_ADMINISTRATOR gets an
    // organization-wide report across every institution, matching the same
    // scoping rule used for billing and the institution-admin dashboard.
    public ReportData buildReport(User currentUser, LocalDateTime from, LocalDateTime to) {
        Long institutionId = currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR
                ? null
                : (currentUser.getInstitution() != null ? currentUser.getInstitution().getInstitutionId() : null);

        List<Equipment> scopedEquipment = institutionId == null
                ? equipmentRepository.findAll()
                : equipmentRepository.findByLab_Institution_InstitutionId(institutionId);

        // Heatmap/idle/day-of-week are computed platform-wide by the underlying
        // service methods (no institution filter exists there yet), so narrow
        // them down here to just the equipment actually in scope for this report.
        List<Map<String, Object>> heatmap = utilizationService.getUtilizationHeatmap(from, to).stream()
                .filter(row -> scopedEquipment.stream()
                        .anyMatch(e -> e.getEquipmentId().equals(row.get("equipmentId"))))
                .toList();

        List<Map<String, Object>> idleEquipment = utilizationService.getIdleEquipment().stream()
                .filter(row -> scopedEquipment.stream()
                        .anyMatch(e -> e.getEquipmentId().equals(row.get("equipmentId"))))
                .toList();

        List<Maintenance> maintenanceRecords = maintenanceRepository.findAll().stream()
                .filter(m -> m.getEquipment() != null && scopedEquipment.stream()
                        .anyMatch(e -> e.getEquipmentId().equals(m.getEquipment().getEquipmentId())))
                .toList();

        List<CalibrationRecord> calibrationReminders = calibrationRecordService.getRenewalReminders(30).stream()
                .filter(c -> c.getEquipment() != null && scopedEquipment.stream()
                        .anyMatch(e -> e.getEquipmentId().equals(c.getEquipment().getEquipmentId())))
                .toList();

        List<BillingRecord> billingRecords = billingRecordService.getVisibleBillingRecords(currentUser);

        BigDecimal totalOwed = billingRecords.stream()
                .filter(r -> institutionId != null && r.getOwnerInstitution() != null
                        && institutionId.equals(r.getOwnerInstitution().getInstitutionId()))
                .map(BillingRecord::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOwing = billingRecords.stream()
                .filter(r -> institutionId != null && r.getBilledInstitution() != null
                        && institutionId.equals(r.getBilledInstitution().getInstitutionId()))
                .map(BillingRecord::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ReportData(
                from, to, scopedEquipment.size(), heatmap, idleEquipment,
                maintenanceRecords, calibrationReminders, billingRecords,
                totalOwed, totalOwing
        );
    }

    // Plain data holder passed to the PDF renderer - keeps ReportService
    // focused on assembling data and ReportPdfService focused on layout,
    // rather than mixing report content logic with PDF drawing calls.
    public record ReportData(
            LocalDateTime from,
            LocalDateTime to,
            int equipmentCount,
            List<Map<String, Object>> heatmap,
            List<Map<String, Object>> idleEquipment,
            List<Maintenance> maintenanceRecords,
            List<CalibrationRecord> calibrationReminders,
            List<BillingRecord> billingRecords,
            BigDecimal totalOwed,
            BigDecimal totalOwing
    ) {}
}
