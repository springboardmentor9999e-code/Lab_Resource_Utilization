package com.labresource.service.impl;

import com.labresource.entity.AppUser;
import com.labresource.entity.EquipmentCalibration;
import com.labresource.entity.MaintenanceRequest;
import com.labresource.entity.MaintenanceSchedule;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.EquipmentCalibrationRepository;
import com.labresource.repository.MaintenanceRequestRepository;
import com.labresource.repository.MaintenanceScheduleRepository;
import com.labresource.security.Roles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Daily automation (07:15 local):
 *  1. Preventive schedules whose nextDueDate has arrived generate an OPEN work order
 *     and advance to the next interval.
 *  2. Calibrations due within 30 days (or overdue) trigger renewal reminders to managers,
 *     once per calibration record.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceReminderJob {

    private static final List<String> MANAGER_ROLES =
            List.of(Roles.SYSTEM_ADMIN, Roles.LAB_MANAGER, Roles.DEPARTMENT_HEAD);

    private final MaintenanceScheduleRepository scheduleRepository;
    private final MaintenanceRequestRepository requestRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 15 7 * * *")
    @Transactional
    public void runDailyChecks() {
        try {
            generateDueWorkOrders();
        } catch (Exception ex) {
            log.error("Preventive work order generation failed: {}", ex.getMessage());
        }
        try {
            sendCalibrationReminders();
        } catch (Exception ex) {
            log.error("Calibration reminder run failed: {}", ex.getMessage());
        }
    }

    private void generateDueWorkOrders() {
        LocalDate today = LocalDate.now();
        List<MaintenanceSchedule> due = scheduleRepository.findByActiveTrueAndNextDueDateLessThanEqual(today);
        if (due.isEmpty()) {
            return;
        }
        List<AppUser> managers = appUserRepository.findActiveByRoles(MANAGER_ROLES);

        for (MaintenanceSchedule schedule : due) {
            MaintenanceRequest workOrder = requestRepository.save(MaintenanceRequest.builder()
                    .equipment(schedule.getEquipment())
                    .requestedBy(schedule.getCreatedBy())
                    .type("CALIBRATION".equals(schedule.getMaintenanceType()) ? "CALIBRATION"
                            : "INSPECTION".equals(schedule.getMaintenanceType()) ? "INSPECTION" : "PREVENTIVE")
                    .priority("MEDIUM")
                    .title("Scheduled " + schedule.getMaintenanceType().toLowerCase() + " — "
                            + schedule.getEquipment().getEquipmentName())
                    .description("Auto-generated from preventive schedule #" + schedule.getScheduleId()
                            + (schedule.getNotes() != null ? ". " + schedule.getNotes() : ""))
                    .scheduledDate(schedule.getNextDueDate())
                    .status("OPEN")
                    .build());

            schedule.setLastGeneratedDate(schedule.getNextDueDate());
            schedule.setNextDueDate(schedule.getNextDueDate().plusDays(schedule.getIntervalDays()));
            scheduleRepository.save(schedule);

            for (AppUser manager : managers) {
                notificationService.notifyInApp(manager, "MAINTENANCE",
                        "Preventive Maintenance Due",
                        "Work order #" + workOrder.getRequestId() + " auto-created for "
                                + schedule.getEquipment().getEquipmentName() + " — assign a technician.",
                        "/dashboard/maintenance");
            }
            log.info("Generated preventive work order #{} from schedule #{}",
                    workOrder.getRequestId(), schedule.getScheduleId());
        }
    }

    private void sendCalibrationReminders() {
        LocalDate horizon = LocalDate.now().plusDays(30);
        List<EquipmentCalibration> expiring =
                calibrationRepository.findByReminderSentFalseAndNextDueDateLessThanEqual(horizon);
        if (expiring.isEmpty()) {
            return;
        }
        List<AppUser> managers = appUserRepository.findActiveByRoles(MANAGER_ROLES);

        for (EquipmentCalibration cal : expiring) {
            boolean overdue = cal.getNextDueDate().isBefore(LocalDate.now());
            String title = overdue ? "Calibration OVERDUE" : "Calibration Expiring Soon";
            String body = cal.getEquipment().getEquipmentName() + " ("
                    + cal.getEquipment().getEquipmentCode() + ") — certification "
                    + (overdue ? "expired on " : "expires on ") + cal.getNextDueDate()
                    + (cal.getCertificateNumber() != null
                        ? " (cert " + cal.getCertificateNumber() + ")" : "")
                    + ". Schedule a re-calibration.";

            for (AppUser manager : managers) {
                if (overdue) {
                    // An out-of-calibration instrument invalidates the results taken on it —
                    // escalate past email so it is not sitting unread for a week.
                    notificationService.notifyUrgent(manager, "CALIBRATION", title, body,
                            "/dashboard/maintenance",
                            "OVERDUE calibration: " + cal.getEquipment().getEquipmentName()
                                    + " expired " + cal.getNextDueDate() + ".");
                } else {
                    notificationService.notify(manager, "CALIBRATION", title, body,
                            "/dashboard/maintenance");
                }
            }
            cal.setReminderSent(true);
            calibrationRepository.save(cal);
        }
        log.info("Sent calibration reminders for {} records", expiring.size());
    }
}
