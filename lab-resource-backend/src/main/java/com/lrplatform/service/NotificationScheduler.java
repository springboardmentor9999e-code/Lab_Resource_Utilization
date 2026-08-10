package com.lrplatform.service;

import com.lrplatform.model.entity.NotificationRetryQueue;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import com.lrplatform.repository.NotificationRetryQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationRetryQueueRepository retryQueueRepository;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendBookingReminders() {
        log.info("Running daily booking reminder scheduler");
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        try {
            String sql = """
                SELECT b.id, b.user_id, b.start_time, b.end_time,
                       e.equipment_name, u.email, u.first_name, u.phone
                FROM bookings b
                INNER JOIN equipment e ON b.equipment_id = e.id
                INNER JOIN users u ON b.user_id = u.id
                WHERE b.booking_date = ? AND b.booking_status IN ('CONFIRMED', 'APPROVED')
                """;

            List<Map<String, Object>> upcomingBookings = jdbcTemplate.queryForList(sql, tomorrow);

            for (Map<String, Object> row : upcomingBookings) {
                Long userId = ((Number) row.get("user_id")).longValue();
                String equipmentName = (String) row.get("equipment_name");
                String email = (String) row.get("email");
                String phone = (String) row.get("phone");
                LocalTime startTime = ((java.sql.Time) row.get("start_time")).toLocalTime();

                notificationService.createNotification(
                    findUserById(userId),
                    "Booking Reminder",
                    String.format("Your booking for %s starts tomorrow at %s.", equipmentName, startTime),
                    NotificationType.BOOKING_REMINDER,
                    NotificationPriority.HIGH
                );

                if (preferenceService.isEmailEnabled(userId, "BOOKING_REMINDER")) {
                    emailService.sendBookingReminderEmail(email, equipmentName, startTime.toString());
                }

                if (phone != null && preferenceService.isSmsEnabled(userId, "BOOKING_REMINDER")) {
                    smsService.sendBookingReminderSms(phone, equipmentName, startTime.toString());
                }
            }

            log.info("Booking reminders sent for {} bookings", upcomingBookings.size());
        } catch (Exception e) {
            log.error("Error sending booking reminders: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void checkCalibrationDue() {
        log.info("Running weekly calibration check");
        LocalDate checkDate = LocalDate.now().plusDays(30);

        try {
            String sql = """
                SELECT e.id, e.equipment_name, e.calibration_due_date, u.email, u.id as user_id, u.phone
                FROM equipment e
                INNER JOIN laboratories l ON e.laboratory_id = l.id
                INNER JOIN users u ON l.lab_manager_id = u.id
                WHERE e.calibration_due_date <= ? AND e.calibration_due_date IS NOT NULL
                AND e.status != 'RETIRED'
                """;

            List<Map<String, Object>> dueEquipment = jdbcTemplate.queryForList(sql, checkDate);

            for (Map<String, Object> row : dueEquipment) {
                Long userId = ((Number) row.get("user_id")).longValue();
                String equipmentName = (String) row.get("equipment_name");
                String email = (String) row.get("email");
                String phone = (String) row.get("phone");
                LocalDate calibrationDate = ((java.sql.Date) row.get("calibration_due_date")).toLocalDate();

                notificationService.createNotification(
                    findUserById(userId),
                    "Calibration Due",
                    String.format("Calibration for %s is due on %s.", equipmentName, calibrationDate),
                    NotificationType.CALIBRATION_DUE,
                    NotificationPriority.HIGH
                );

                if (preferenceService.isEmailEnabled(userId, "CALIBRATION_DUE")) {
                    emailService.sendCalibrationDueEmail(email, equipmentName, calibrationDate.toString());
                }

                if (phone != null && preferenceService.isSmsEnabled(userId, "CALIBRATION_DUE")) {
                    smsService.sendSms(phone, String.format("Calibration for %s is due on %s.", equipmentName, calibrationDate));
                }
            }

            log.info("Calibration check completed for {} equipment items", dueEquipment.size());
        } catch (Exception e) {
            log.error("Error checking calibration due: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 15 8 * * *")
    public void checkServiceDue() {
        log.info("Running daily service due check");
        LocalDate checkDate = LocalDate.now().plusDays(30);

        try {
            String sql = """
                SELECT e.id, e.equipment_name, e.equipment_code, e.next_service_due_date,
                       l.lab_manager_id, d.id AS department_id, d.institution_id
                FROM equipment e
                INNER JOIN laboratories l ON e.laboratory_id = l.id
                INNER JOIN departments d ON l.department_id = d.id
                WHERE e.next_service_due_date IS NOT NULL
                  AND e.next_service_due_date <= ?
                  AND e.status != 'RETIRED'
                  AND e.service_reminder_sent_on IS NULL
                """;

            List<Map<String, Object>> dueEquipment = jdbcTemplate.queryForList(sql, checkDate);

            int notified = 0;
            for (Map<String, Object> row : dueEquipment) {
                Long equipmentId = ((Number) row.get("id")).longValue();
                String equipmentName = (String) row.get("equipment_name");
                LocalDate dueDate = ((java.sql.Date) row.get("next_service_due_date")).toLocalDate();
                Long labManagerId = row.get("lab_manager_id") != null ? ((Number) row.get("lab_manager_id")).longValue() : null;
                Long departmentId = row.get("department_id") != null ? ((Number) row.get("department_id")).longValue() : null;
                Long institutionId = row.get("institution_id") != null ? ((Number) row.get("institution_id")).longValue() : null;

                Set<Long> recipientIds = new LinkedHashSet<>();
                if (labManagerId != null) {
                    recipientIds.add(labManagerId);
                }
                if (departmentId != null) {
                    recipientIds.addAll(jdbcTemplate.queryForList(
                            "SELECT id FROM users WHERE role = 'DEPARTMENT_HEAD' AND department_id = ?", Long.class, departmentId));
                }
                if (institutionId != null) {
                    recipientIds.addAll(jdbcTemplate.queryForList(
                            "SELECT id FROM users WHERE role = 'INSTITUTION_ADMIN' AND institution_id = ?", Long.class, institutionId));
                }

                for (Long userId : recipientIds) {
                    User recipient = findUserById(userId);
                    notificationService.createNotification(
                        recipient,
                        "Service Due Reminder",
                        String.format("Maintenance service for %s is due on %s.", equipmentName, dueDate),
                        NotificationType.SERVICE_DUE_REMINDER,
                        NotificationPriority.HIGH
                    );
                    if (preferenceService.isEmailEnabled(userId, "SERVICE_DUE_REMINDER")) {
                        emailService.sendNotificationEmail(recipient.getEmail(),
                            "Service Due Reminder",
                            String.format("Maintenance service for %s is due on %s.", equipmentName, dueDate),
                            "SERVICE_DUE_REMINDER");
                    }
                    if (recipient.getPhone() != null && preferenceService.isSmsEnabled(userId, "SERVICE_DUE_REMINDER")) {
                        smsService.sendSms(recipient.getPhone(),
                            String.format("Maintenance service for %s is due on %s.", equipmentName, dueDate));
                    }
                }

                jdbcTemplate.update("UPDATE equipment SET service_reminder_sent_on = ? WHERE id = ?",
                        LocalDate.now(), equipmentId);
                notified++;
            }

            log.info("Service due check completed for {} equipment items", notified);
        } catch (Exception e) {
            log.error("Error checking service due: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 */30 * * * *")
    public void processNotificationRetries() {
        log.info("Processing notification retry queue");

        List<NotificationRetryQueue> pendingRetries = retryQueueRepository.findPendingRetries(LocalDateTime.now());
        for (NotificationRetryQueue retry : pendingRetries) {
            notificationService.retryFailedNotification(retry);
        }

        retryQueueRepository.markExpiredRetries();
        log.info("Processed {} pending retries", pendingRetries.size());
    }

    @Scheduled(cron = "0 0 10 * * MON")
    public void checkIdleEquipment() {
        log.info("Running idle equipment check (14+ days without bookings)");
        LocalDate cutoffDate = LocalDate.now().minusDays(14);

        try {
            String sql = """
                SELECT e.id, e.equipment_name, e.equipment_code,
                       l.id as lab_id, l.lab_manager_id,
                       u.email as manager_email, u.first_name, u.phone as manager_phone
                FROM equipment e
                INNER JOIN laboratories l ON e.laboratory_id = l.id
                INNER JOIN users u ON l.lab_manager_id = u.id
                WHERE e.status = 'ACTIVE'
                AND e.id NOT IN (
                    SELECT DISTINCT b.equipment_id FROM bookings b
                    WHERE b.booking_date >= ? AND b.booking_status IN ('CONFIRMED', 'APPROVED', 'COMPLETED')
                )
                """;

            List<Map<String, Object>> idleEquipment = jdbcTemplate.queryForList(sql, cutoffDate);

            for (Map<String, Object> row : idleEquipment) {
                Long managerUserId = ((Number) row.get("lab_manager_id")).longValue();
                String equipmentName = (String) row.get("equipment_name");
                String equipmentCode = (String) row.get("equipment_code");

                notificationService.createNotification(
                    findUserById(managerUserId),
                    "Idle Equipment Alert",
                    String.format("Equipment %s (%s) has had no bookings in the last 14 days. Consider reviewing utilization.", equipmentName, equipmentCode),
                    NotificationType.IDLE_EQUIPMENT_ALERT,
                    NotificationPriority.MEDIUM
                );
            }

            log.info("Idle equipment alert completed for {} items", idleEquipment.size());
        } catch (Exception e) {
            log.error("Error checking idle equipment: {}", e.getMessage());
        }
    }

    private User findUserById(Long userId) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            (rs, rowNum) -> User.builder()
                .id(rs.getLong("id"))
                .email(rs.getString("email"))
                .firstName(rs.getString("first_name"))
                .lastName(rs.getString("last_name"))
                .phone(rs.getString("phone"))
                .build(),
            userId
        );
    }
}
