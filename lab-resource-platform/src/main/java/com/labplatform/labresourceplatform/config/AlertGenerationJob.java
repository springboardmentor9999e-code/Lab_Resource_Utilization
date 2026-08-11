package com.labplatform.labresourceplatform.config;

import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Maintenance;
import com.labplatform.labresourceplatform.repository.MaintenanceRepository;
import com.labplatform.labresourceplatform.service.CalibrationRecordService;
import com.labplatform.labresourceplatform.service.NotificationService;
import com.labplatform.labresourceplatform.service.UtilizationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// The alert system (mentor priority #3): runs daily and generates in-app
// notifications for the three conditions called out in the meeting notes:
//   1. Equipment idle for a week or more (no usage logged)
//   2. Maintenance due or overdue for a piece of equipment
//   3. Calibration expiring or already expired
//
// Deliberately a scheduled polling job rather than event-driven triggers -
// "idle for a week" and "maintenance due" are conditions that become true
// purely from the passage of time (nothing has to happen for them to become
// relevant), so there's no natural event to hang the check off of the way
// "booking completed" triggers utilization logging.
@Component
public class AlertGenerationJob {

    private final UtilizationService utilizationService;
    private final MaintenanceRepository maintenanceRepository;
    private final CalibrationRecordService calibrationRecordService;
    private final NotificationService notificationService;

    public AlertGenerationJob(UtilizationService utilizationService,
                               MaintenanceRepository maintenanceRepository,
                               CalibrationRecordService calibrationRecordService,
                               NotificationService notificationService) {
        this.utilizationService = utilizationService;
        this.maintenanceRepository = maintenanceRepository;
        this.calibrationRecordService = calibrationRecordService;
        this.notificationService = notificationService;
    }

    // @Transactional fix: this job runs from a @Scheduled daily trigger AND
    // from a CommandLineRunner at startup (see AlertStartupRunner) - neither
    // is a web request, so spring.jpa.open-in-view (which only keeps a
    // session open for the duration of an HTTP request) doesn't apply here.
    // Without an explicitly open session, checkMaintenanceDue() and
    // checkCalibrationDue() below throw LazyInitializationException the
    // moment they touch m.getEquipment()/record.getEquipment() - both are
    // @ManyToOne(fetch = LAZY) associations that need an active Hibernate
    // session to resolve. @Transactional here keeps one session open for the
    // full duration of runDailyChecks(), covering the repository loads AND
    // every lazy field access in all three checks below.
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void runDailyChecks() {
        checkIdleEquipment();
        checkMaintenanceDue();
        checkCalibrationDue();
    }

    // Reuses UtilizationService.getIdleEquipment(), which is now set to the
    // 1-week threshold from the meeting notes ("if not used for a week, send
    // an alert") - see the IDLE_THRESHOLD_HOURS constant.
    private void checkIdleEquipment() {
        for (Map<String, Object> entry : utilizationService.getIdleEquipment()) {
            Long equipmentId = (Long) entry.get("equipmentId");
            String equipmentName = (String) entry.get("equipmentName");
            Object idleHours = entry.get("idleHours");

            String message = idleHours == null
                    ? equipmentName + " has never been used."
                    : equipmentName + " has been idle for over a week (" + (((Long) idleHours) / 24) + " days).";
            notificationService.notifyEquipmentStaff(equipmentId, "Idle Equipment", message);
        }
    }

    private void checkMaintenanceDue() {
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(3);

        for (Maintenance m : maintenanceRepository.findAll()) {
            if (m.getEquipment() == null || m.getStartDate() == null) {
                continue;
            }
            boolean isPendingWork = "Scheduled".equals(m.getStatus()) || m.getStatus() == null;
            if (!isPendingWork) {
                continue;
            }
            boolean dueOrOverdue = !m.getStartDate().isAfter(horizon);
            if (!dueOrOverdue) {
                continue;
            }

            // Safe to access lazy fields (getEquipment(), getEquipmentName())
            // here because this whole method runs inside the @Transactional
            // session opened by runDailyChecks() above.
            Equipment equipment = m.getEquipment();
            String message = m.getStartDate().isBefore(today)
                    ? "Maintenance for " + equipment.getEquipmentName() + " is overdue (was due " + m.getStartDate() + ")."
                    : "Maintenance for " + equipment.getEquipmentName() + " is due on " + m.getStartDate() + ".";
            notificationService.notifyEquipmentStaff(equipment.getEquipmentId(), "Maintenance Due", message);
        }
    }

    private void checkCalibrationDue() {
        // Reuses the same reminders query the dashboard/UI already call -
        // equipment whose latest calibration expires within 30 days or has
        // already expired.
        List<CalibrationRecord> reminders = calibrationRecordService.getRenewalReminders(30);
        LocalDate today = LocalDate.now();

        for (CalibrationRecord record : reminders) {
            if (record.getEquipment() == null) {
                continue;
            }
            // Same note as above - safe only because this runs inside
            // runDailyChecks()'s open transaction.
            Equipment equipment = record.getEquipment();
            String message = record.getExpiryDate().isBefore(today)
                    ? "Calibration for " + equipment.getEquipmentName() + " expired on " + record.getExpiryDate() + "."
                    : "Calibration for " + equipment.getEquipmentName() + " expires on " + record.getExpiryDate() + ".";
            notificationService.notifyEquipmentStaff(equipment.getEquipmentId(), "Calibration Due", message);
        }
    }
}
