package com.labresource.service.impl;

import com.labresource.dto.response.EquipmentUtilizationResponse;
import com.labresource.dto.response.UtilizationSummaryResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.repository.*;
import com.labresource.security.Roles;
import com.labresource.service.interfaces.UtilizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Role-aware analytics for the intelligence dashboard:
 *  - every user      : equipment availability overview + personal booking stats
 *  - managers        : approvals queue, no-show rate, high-demand assets, maintenance load
 *  - institution/system admins: org-wide utilization, cost intelligence, procurement recommendations
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final Set<String> MANAGER_AUTHORITIES = Set.of(
            "ROLE_" + Roles.SYSTEM_ADMIN, "ROLE_" + Roles.INSTITUTION_ADMIN,
            "ROLE_" + Roles.DEPARTMENT_HEAD, "ROLE_" + Roles.LAB_MANAGER,
            "ROLE_" + Roles.LAB_TECHNICIAN);

    private static final Set<String> ADMIN_AUTHORITIES = Set.of(
            "ROLE_" + Roles.SYSTEM_ADMIN, "ROLE_" + Roles.INSTITUTION_ADMIN);

    private final AppUserRepository appUserRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;
    private final SharingRequestRepository sharingRequestRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final UtilizationService utilizationService;
    private final BillingService billingService;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String username, int days) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> authorities = currentAuthorities();
        boolean isManager = authorities.stream().anyMatch(MANAGER_AUTHORITIES::contains);
        boolean isAdmin = authorities.stream().anyMatch(ADMIN_AUTHORITIES::contains);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", isAdmin ? "ADMIN" : isManager ? "MANAGER" : "RESEARCHER");
        payload.put("days", days);
        payload.put("common", buildCommonBlock());
        payload.put("personal", buildPersonalBlock(user));
        if (isManager) {
            payload.put("manager", buildManagerBlock(days));
        }
        if (isAdmin) {
            payload.put("admin", buildAdminBlock(days));
        }
        return payload;
    }

    // ------------------------------------------------------------------
    // Blocks
    // ------------------------------------------------------------------

    /** Equipment availability overview — visible to everyone. */
    private Map<String, Object> buildCommonBlock() {
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (String status : List.of("AVAILABLE", "RESERVED", "IN_USE",
                "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED", "LOST")) {
            statusCounts.put(status, equipmentRepository.countByStatus(status));
        }
        Map<String, Object> block = new LinkedHashMap<>();
        block.put("totalEquipment", equipmentRepository.count());
        block.put("equipmentStatusCounts", statusCounts);
        return block;
    }

    /** My bookings / waitlist / history summary — the researcher & student dashboard. */
    private Map<String, Object> buildPersonalBlock(AppUser user) {
        List<Booking> myBookings = bookingRepository.findByUser_UserId(user.getUserId());
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> upcoming = myBookings.stream()
                .filter(b -> Set.of("PENDING", "CONFIRMED", "APPROVED", "IN_USE").contains(b.getStatus()))
                .filter(b -> !b.getBookingDate().isBefore(today))
                .sorted(Comparator.comparing(Booking::getBookingDate).thenComparing(Booking::getStartTime))
                .limit(5)
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("bookingId", b.getBookingId());
                    m.put("equipmentName", b.getEquipment().getEquipmentName());
                    m.put("bookingDate", b.getBookingDate());
                    m.put("startTime", b.getStartTime());
                    m.put("endTime", b.getEndTime());
                    m.put("status", "APPROVED".equals(b.getStatus()) ? "CONFIRMED" : b.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        long completed = myBookings.stream().filter(b -> "COMPLETED".equals(b.getStatus())).count();
        long noShows = myBookings.stream().filter(b -> "NO_SHOW".equals(b.getStatus())).count();
        long activeWaitlist = waitlistRepository.findByUser_UserIdOrderByRequestedAtDesc(user.getUserId()).stream()
                .filter(w -> Set.of("WAITING", "NOTIFIED").contains(w.getStatus()))
                .count();

        // Simple recommendation: the category this user books most, with available units
        Map<String, Long> categoryCounts = myBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getCategory(), Collectors.counting()));
        String favouriteCategory = categoryCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);
        List<Map<String, Object>> recommendations = favouriteCategory == null ? List.of()
                : equipmentRepository.findAll().stream()
                    .filter(e -> favouriteCategory.equals(e.getCategory()) && "AVAILABLE".equals(e.getStatus()))
                    .limit(4)
                    .map(e -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("equipmentId", e.getEquipmentId());
                        m.put("equipmentName", e.getEquipmentName());
                        m.put("equipmentCode", e.getEquipmentCode());
                        m.put("category", e.getCategory());
                        return m;
                    })
                    .collect(Collectors.toList());

        Map<String, Object> block = new LinkedHashMap<>();
        block.put("upcomingBookings", upcoming);
        block.put("totalBookings", myBookings.size());
        block.put("completedBookings", completed);
        block.put("noShows", noShows);
        block.put("activeWaitlistEntries", activeWaitlist);
        block.put("favouriteCategory", favouriteCategory);
        block.put("recommendations", recommendations);
        return block;
    }

    /** Lab manager / department head block. */
    private Map<String, Object> buildManagerBlock(int days) {
        LocalDate from = LocalDate.now().minusDays(days);
        List<Booking> window = bookingRepository.findAll().stream()
                .filter(b -> !b.getBookingDate().isBefore(from))
                .collect(Collectors.toList());

        long decided = window.stream()
                .filter(b -> Set.of("COMPLETED", "NO_SHOW", "IN_USE", "CONFIRMED", "APPROVED").contains(b.getStatus()))
                .count();
        long noShows = window.stream().filter(b -> "NO_SHOW".equals(b.getStatus())).count();
        double noShowRate = decided == 0 ? 0 : Math.round(noShows * 1000.0 / decided) / 10.0;

        // High-demand equipment: most booked in the window
        Map<String, Long> demand = window.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getEquipment().getEquipmentName(), Collectors.counting()));
        List<Map<String, Object>> highDemand = demand.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("equipmentName", e.getKey());
                    m.put("bookings", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> block = new LinkedHashMap<>();
        block.put("pendingApprovals", bookingRepository.countByStatus("PENDING"));
        block.put("noShowRate", noShowRate);
        block.put("bookingsInWindow", window.size());
        block.put("highDemandEquipment", highDemand);
        block.put("openWorkOrders", maintenanceRequestRepository.countByStatusIn(List.of("OPEN", "ASSIGNED")));
        block.put("workOrdersInProgress", maintenanceRequestRepository.countByStatus("IN_PROGRESS"));
        block.put("overdueCalibrations", calibrationRepository.countByNextDueDateBefore(LocalDate.now()));
        block.put("pendingSharingRequests", sharingRequestRepository.countByStatus("PENDING"));
        return block;
    }

    /** Institution admin / system admin block. */
    private Map<String, Object> buildAdminBlock(int days) {
        UtilizationSummaryResponse utilization = utilizationService.getSummary(days);

        // Procurement recommendations from utilization extremes
        List<Map<String, Object>> recommendations = new ArrayList<>();
        for (EquipmentUtilizationResponse e : utilization.getMostUtilized()) {
            if (e.getUtilizationRate() >= 70) {
                recommendations.add(recommendation("PROCURE",
                        e.getEquipmentName() + " runs at " + e.getUtilizationRate()
                                + "% utilization — consider procuring an additional unit."));
            }
        }
        for (EquipmentUtilizationResponse e : utilization.getLeastUtilized()) {
            if (e.getUtilizationRate() <= 5) {
                recommendations.add(recommendation("REALLOCATE",
                        e.getEquipmentName() + " is only at " + e.getUtilizationRate()
                                + "% utilization — consider sharing it with partner institutions or reallocating."));
            }
        }

        Map<String, Long> sharingCounts = new LinkedHashMap<>();
        for (String status : List.of("PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED")) {
            sharingCounts.put(status, sharingRequestRepository.countByStatus(status));
        }

        Map<String, Object> block = new LinkedHashMap<>();
        block.put("overallUtilizationRate", utilization.getOverallUtilizationRate());
        block.put("departmentUtilization", utilization.getDepartmentUtilization());
        block.put("mostUtilized", utilization.getMostUtilized());
        block.put("leastUtilized", utilization.getLeastUtilized());
        block.put("idleEquipmentCount", utilization.getIdleEquipmentCount());
        block.put("sharingCounts", sharingCounts);
        block.put("departmentCosts", billingService.getDepartmentCosts(days));
        block.put("procurementRecommendations", recommendations);
        block.put("totalUsers", appUserRepository.count());
        return block;
    }

    private Map<String, Object> recommendation(String action, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("action", action); // PROCURE | REALLOCATE
        m.put("message", message);
        return m;
    }

    private Set<String> currentAuthorities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Set.of();
        return auth.getAuthorities().stream().map(Object::toString).collect(Collectors.toSet());
    }
}
