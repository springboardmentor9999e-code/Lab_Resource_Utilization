package com.labresource.service.impl;

import com.labresource.dto.response.IdleEquipmentResponse;
import com.labresource.entity.AppUser;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.NotificationRepository;
import com.labresource.security.Roles;
import com.labresource.service.interfaces.UtilizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Daily idle-equipment alert (07:45 local).
 * Equipment with no booking activity for {@value #IDLE_THRESHOLD_DAYS}+ days is
 * flagged to lab managers so under-used assets can be reallocated. A given piece
 * of equipment is not re-alerted to the same manager within a 7-day window.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IdleEquipmentAlertJob {

    private static final int IDLE_THRESHOLD_DAYS = 14;
    private static final int DEDUP_WINDOW_DAYS = 7;
    private static final List<String> MANAGER_ROLES =
            List.of(Roles.SYSTEM_ADMIN, Roles.LAB_MANAGER, Roles.DEPARTMENT_HEAD);

    private final UtilizationService utilizationService;
    private final AppUserRepository appUserRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 45 7 * * *")
    public void runDailyIdleCheck() {
        try {
            int sent = alertIdleEquipment(IDLE_THRESHOLD_DAYS);
            if (sent > 0) {
                log.info("Daily idle-equipment check sent {} alerts", sent);
            }
        } catch (Exception ex) {
            log.error("Idle-equipment alert run failed: {}", ex.getMessage());
        }
    }

    /**
     * Sends idle alerts to managers and returns how many notifications went out.
     * Also called on demand from the utilization API ("Alert Managers" button).
     */
    @Transactional
    public int alertIdleEquipment(int idleThresholdDays) {
            List<IdleEquipmentResponse> idle = utilizationService.getIdleEquipment(idleThresholdDays);
            if (idle.isEmpty()) {
                return 0;
            }
            List<AppUser> managers = appUserRepository.findActiveByRoles(MANAGER_ROLES);
            if (managers.isEmpty()) {
                return 0;
            }

            LocalDateTime since = LocalDateTime.now().minusDays(DEDUP_WINDOW_DAYS);
            int sent = 0;

            for (IdleEquipmentResponse eq : idle) {
                String marker = "[EQ:" + eq.getEquipmentId() + "]"; // stable per-equipment dedup key
                String message = eq.getEquipmentName() + " (" + eq.getEquipmentCode() + ") has had "
                        + "no bookings for " + eq.getIdleDays() + " days"
                        + (eq.getLabName() != null ? " in " + eq.getLabName() : "")
                        + ". Consider reallocating or promoting it. " + marker;

                for (AppUser manager : managers) {
                    boolean alreadyAlerted = notificationRepository.existsRecentForUser(
                            manager.getUserId(), "UTILIZATION", marker, since);
                    if (alreadyAlerted) {
                        continue;
                    }
                    notificationService.notifyInApp(manager, "UTILIZATION",
                            "Idle Equipment Alert", message, "/dashboard/utilization");
                    sent++;
                }
            }
            if (sent > 0) {
                log.info("Idle-equipment alerts sent: {} (for {} idle items)", sent, idle.size());
            }
            return sent;
    }
}
