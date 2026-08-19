package com.rems.service;

import com.rems.entity.Equipment;
import com.rems.entity.User;
import com.rems.enums.NotificationType;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class EquipmentRenewalScheduler {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InAppNotificationService inAppNotificationService;
    private final NotificationService notificationService;

    // Run every day at 8:00 AM UTC (and run once at startup 30s after launch)
    @Scheduled(cron = "0 0 8 * * *")
    @Scheduled(initialDelay = 30000, fixedRate = 86400000)
    public void checkAndSendEquipmentRenewalNotifications() {
        log.info("[EQUIPMENT RENEWAL SCHEDULER] Checking for equipment expiring tomorrow / soon...");

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate next3Days = today.plusDays(3);

        // Find equipment expiring tomorrow, within 3 days, or already expired
        List<Equipment> expiringEquipment = equipmentRepository.findByExpiryDateNotNullAndExpiryDateLessThanEqual(next3Days);

        int count = 0;
        for (Equipment eq : expiringEquipment) {
            LocalDate exp = eq.getExpiryDate();
            if (exp == null) continue;

            String urgencyMsg;
            if (exp.isEqual(tomorrow)) {
                urgencyMsg = "expires TOMORROW (" + exp + ")";
            } else if (exp.isBefore(today)) {
                urgencyMsg = "EXPIRED on " + exp;
            } else if (exp.isEqual(today)) {
                urgencyMsg = "expires TODAY (" + exp + ")";
            } else {
                urgencyMsg = "expires on " + exp;
            }

            // Find Lab Managers (roleId = 3) & Technicians (roleId = 2) for this equipment's lab / department
            List<User> recipients = getStaffForEquipment(eq);

            for (User staff : recipients) {
                String title = "Equipment Renewal Alert: " + eq.getName();
                String message = "Asset '" + eq.getName() + "' (ID: " + eq.getEquipmentId() + ") in " 
                        + (eq.getLab() != null ? eq.getLab().getName() : "your lab") + " " + urgencyMsg + ". Renewal is required!";

                try {
                    // 1. In-App Notification
                    inAppNotificationService.createNotification(staff, title, message, NotificationType.MAINTENANCE, eq.getEquipmentId());
                } catch (Exception e) {
                    log.warn("Could not create in-app renewal notification: {}", e.getMessage());
                }

                try {
                    // 2. Email Notification
                    notificationService.sendApprovalRequestNotification(staff, title, message);
                } catch (Exception e) {
                    log.warn("Could not send email renewal notification: {}", e.getMessage());
                }
                count++;
            }
        }

        log.info("[EQUIPMENT RENEWAL SCHEDULER] Successfully processed {} equipment renewal alerts.", count);
    }

    private List<User> getStaffForEquipment(Equipment equipment) {
        if (equipment.getLab() != null) {
            List<User> labUsers = userRepository.findByLabLabId(equipment.getLab().getLabId());
            List<User> staff = labUsers.stream()
                    .filter(u -> (u.getRoleIds() != null && (u.getRoleIds().contains(2) || u.getRoleIds().contains(3))) ||
                                 (u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getRoleId() == 2 || r.getRoleId() == 3)))
                    .toList();
            if (!staff.isEmpty()) return staff;
        }

        if (equipment.getDepartment() != null) {
            List<User> deptUsers = userRepository.findByDepartmentDepartmentId(equipment.getDepartment().getDepartmentId());
            return deptUsers.stream()
                    .filter(u -> (u.getRoleIds() != null && (u.getRoleIds().contains(2) || u.getRoleIds().contains(3) || u.getRoleIds().contains(4))) ||
                                 (u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getRoleId() == 2 || r.getRoleId() == 3 || r.getRoleId() == 4)))
                    .toList();
        }

        return List.of();
    }
}
