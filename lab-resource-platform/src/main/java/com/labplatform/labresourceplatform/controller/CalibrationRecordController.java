package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import com.labplatform.labresourceplatform.service.CalibrationRecordService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calibration-records")
public class CalibrationRecordController {

    private final CalibrationRecordService calibrationRecordService;

    public CalibrationRecordController(CalibrationRecordService calibrationRecordService) {
        this.calibrationRecordService = calibrationRecordService;
    }

    // Everyone can read calibration history/reminders, same Read-tier as
    // Equipment and Maintenance in the Role-Operation Matrix - no @PreAuthorize
    // needed beyond being authenticated at all (handled by SecurityConfig).
    @GetMapping("/equipment/{equipmentId}")
    public List<CalibrationRecord> getHistoryForEquipment(@PathVariable Long equipmentId) {
        return calibrationRecordService.getHistoryForEquipment(equipmentId);
    }

    // Renewal reminders: equipment whose latest calibration is already expired
    // or expiring within `daysAhead` days (default 30).
    @GetMapping("/reminders")
    public List<CalibrationRecord> getRenewalReminders(
            @RequestParam(defaultValue = "30") int daysAhead) {
        return calibrationRecordService.getRenewalReminders(daysAhead);
    }

    // Logging a calibration is a technician/manager-level action, matching the
    // same role tier that can manage Maintenance records.
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public CalibrationRecord create(@RequestBody CalibrationRecord record) {
        return calibrationRecordService.create(record);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public void delete(@PathVariable Long id) {
        calibrationRecordService.delete(id);
    }
}
