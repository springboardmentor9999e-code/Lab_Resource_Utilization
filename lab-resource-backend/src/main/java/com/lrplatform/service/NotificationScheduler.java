package com.lrplatform.service;

import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;
    private final EmailService emailService;
    private final SmsService smsService;

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
                SELECT e.id, e.equipment_name, e.next_calibration_date, u.email, u.id as user_id, u.phone
                FROM equipment e
                INNER JOIN laboratories l ON e.laboratory_id = l.id
                INNER JOIN users u ON l.lab_manager_id = u.id
                WHERE e.next_calibration_date <= ? AND e.next_calibration_date IS NOT NULL
                AND e.status != 'RETIRED'
                """;

            List<Map<String, Object>> dueEquipment = jdbcTemplate.queryForList(sql, checkDate);

            for (Map<String, Object> row : dueEquipment) {
                Long userId = ((Number) row.get("user_id")).longValue();
                String equipmentName = (String) row.get("equipment_name");
                String email = (String) row.get("email");
                String phone = (String) row.get("phone");
                LocalDate calibrationDate = ((java.sql.Date) row.get("next_calibration_date")).toLocalDate();

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

    private User findUserById(Long userId) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            (rs, rowNum) -> User.builder()
                .id(rs.getLong("id"))
                .email(rs.getString("email"))
                .firstName(rs.getString("first_name"))
                .lastName(rs.getString("last_name"))
                .build(),
            userId
        );
    }
}
