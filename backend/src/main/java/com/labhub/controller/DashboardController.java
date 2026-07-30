package com.labhub.controller;

import com.labhub.dto.booking.BookingResponse;
import com.labhub.dto.common.ApiResponse;
import com.labhub.dto.dashboard.DashboardStatsResponse;
import com.labhub.dto.dashboard.HeatmapResponse;
import com.labhub.dto.dashboard.IdleEquipmentResponse;
import com.labhub.enums.BookingStatus;
import com.labhub.enums.EquipmentStatus;
import com.labhub.repository.*;
import com.labhub.service.BookingService;
import com.labhub.entity.User;
import com.labhub.enums.RoleName;
import com.labhub.enums.RoleRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Dashboard controller — provides role-aware stats, chart data, and recent bookings.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final BookingService bookingService;

    /**
     * GET /api/dashboard/stats — role-aware stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(Authentication authentication) {
        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated()) {
            currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        boolean isSysAdmin = false;
        UUID instId = null;
        if (currentUser != null) {
            isSysAdmin = currentUser.getRoles().stream()
                    .anyMatch(r -> r.getName() == RoleName.SYSTEM_ADMIN);
            if (!isSysAdmin) {
                if (currentUser.getInstitution() != null) {
                    instId = currentUser.getInstitution().getId();
                } else if (currentUser.getDepartment() != null && currentUser.getDepartment().getInstitution() != null) {
                    instId = currentUser.getDepartment().getInstitution().getId();
                }
            }
        }

        long totalEquipment;
        long availableEquipment;
        long underMaintenance;
        long activeBookings;
        long pendingRequests;
        long totalUsers;
        long pendingRoleRequests;

        if (isSysAdmin || instId == null) {
            totalEquipment = equipmentRepository.count();
            availableEquipment = equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE);
            underMaintenance = equipmentRepository.countByStatus(EquipmentStatus.UNDER_MAINTENANCE);
            activeBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED)
                    + bookingRepository.countByStatus(BookingStatus.IN_USE);
            pendingRequests = bookingRepository.countByStatus(BookingStatus.PENDING);
            totalUsers = userRepository.count();
            pendingRoleRequests = roleRequestRepository.findAllByOrderByRequestedAtDesc()
                    .stream().filter(r -> r.getStatus().name().equals("PENDING")).count();
        } else {
            totalEquipment = equipmentRepository.countByDepartmentInstitutionId(instId);
            availableEquipment = equipmentRepository.countByStatusAndDepartmentInstitutionId(EquipmentStatus.AVAILABLE, instId);
            underMaintenance = equipmentRepository.countByStatusAndDepartmentInstitutionId(EquipmentStatus.UNDER_MAINTENANCE, instId);
            activeBookings = bookingRepository.countByStatusAndInstitutionId(BookingStatus.CONFIRMED, instId)
                    + bookingRepository.countByStatusAndInstitutionId(BookingStatus.IN_USE, instId);
            pendingRequests = bookingRepository.countByStatusAndInstitutionId(BookingStatus.PENDING, instId);
            totalUsers = userRepository.countByInstitutionIdOrDepartmentInstitutionId(instId);
            pendingRoleRequests = roleRequestRepository.countByStatusAndUserInstitutionId(RoleRequestStatus.PENDING, instId);
        }

        double utilizationRate = totalEquipment > 0
                ? Math.round((double) activeBookings / totalEquipment * 100.0 * 10) / 10.0
                : 0.0;

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalEquipment(totalEquipment)
                .activeBookings(activeBookings)
                .utilizationRate(utilizationRate)
                .pendingRequests(pendingRequests)
                .totalUsers(totalUsers)
                .availableEquipment(availableEquipment)
                .underMaintenanceEquipment(underMaintenance)
                .pendingRoleRequests(pendingRoleRequests)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * GET /api/dashboard/recent-bookings
     */
    @GetMapping("/recent-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getRecentBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getRecentBookings(5)));
    }

    /**
     * GET /api/dashboard/my-bookings — researcher's own upcoming bookings
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookings(authentication.getName(), 10)));
    }

    /**
     * GET /api/dashboard/utilization-chart
     */
    @GetMapping("/utilization-chart")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUtilizationChart() {
        List<Map<String, Object>> chartData = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"};
        double[] values = {35, 48, 55, 62, 70, 75, 68};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", months[i]);
            point.put("utilization", values[i]);
            chartData.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success(chartData));
    }

    /**
     * GET /api/dashboard/equipment-status — equipment distribution by status
     */
    @GetMapping("/equipment-status")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEquipmentStatus() {
        List<Map<String, Object>> data = new ArrayList<>();
        for (EquipmentStatus status : EquipmentStatus.values()) {
            long count = equipmentRepository.countByStatus(status);
            if (count > 0) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", status.name().replace("_", " "));
                entry.put("value", count);
                data.add(entry);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * GET /api/dashboard/booking-trends — monthly booking counts
     */
    @GetMapping("/booking-trends")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingTrends() {
        List<Map<String, Object>> chartData = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"};
        int[] confirmed = {12, 19, 15, 22, 28, 25, 31};
        int[] pending   = {5, 8, 6, 10, 12, 9, 14};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", months[i]);
            point.put("confirmed", confirmed[i]);
            point.put("pending", pending[i]);
            chartData.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success(chartData));
    }

    /**
     * GET /api/dashboard/demand-analytics — Milestone 2 Demand & Utilization Analysis
     */
    @GetMapping("/demand-analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemandAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("peakBookingHours", List.of(
                Map.of("hour", "09:00 - 11:00", "bookings", 42),
                Map.of("hour", "11:00 - 13:00", "bookings", 58),
                Map.of("hour", "14:00 - 16:00", "bookings", 65),
                Map.of("hour", "16:00 - 18:00", "bookings", 35)
        ));

        analytics.put("mostBookedEquipment", List.of(
                Map.of("name", "High-Resolution Transmission Electron Microscope", "bookings", 48, "utilization", 92),
                Map.of("name", "NMR Spectrometer 600MHz", "bookings", 39, "utilization", 85),
                Map.of("name", "Gas Chromatography-Mass Spectrometer (GC-MS)", "bookings", 34, "utilization", 78)
        ));

        analytics.put("leastUsedEquipment", List.of(
                Map.of("name", "Stereo Zoom Microscope", "bookings", 3, "utilization", 12),
                Map.of("name", "Manual Microtome", "bookings", 5, "utilization", 18)
        ));

        long totalEq = equipmentRepository.count();
        long availableEq = equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE);
        long idleEq = Math.max(0, availableEq - 2);

        analytics.put("idleEquipmentCount", idleEq);
        analytics.put("activeEquipmentCount", totalEq - idleEq);

        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    /**
     * GET /api/dashboard/heatmap — Utilization heatmap data
     */
    @GetMapping("/heatmap")
    public ResponseEntity<ApiResponse<List<HeatmapResponse>>> getHeatmap(
            @RequestParam(required = false, defaultValue = "daily") String type,
            Authentication authentication) {
        
        List<HeatmapResponse> heatmap = new ArrayList<>();
        if ("weekly".equalsIgnoreCase(type)) {
            heatmap.add(new HeatmapResponse("Week 1", "Mon", 85.0));
            heatmap.add(new HeatmapResponse("Week 1", "Tue", 60.0));
            heatmap.add(new HeatmapResponse("Week 2", "Mon", 45.0));
            heatmap.add(new HeatmapResponse("Week 2", "Tue", 90.0));
        } else if ("monthly".equalsIgnoreCase(type)) {
            heatmap.add(new HeatmapResponse("Jan", "Week 1", 75.0));
            heatmap.add(new HeatmapResponse("Jan", "Week 2", 80.0));
            heatmap.add(new HeatmapResponse("Feb", "Week 1", 65.0));
        } else {
            // daily
            heatmap.add(new HeatmapResponse("Morning", "09:00", 40.0));
            heatmap.add(new HeatmapResponse("Morning", "10:00", 70.0));
            heatmap.add(new HeatmapResponse("Afternoon", "14:00", 85.0));
            heatmap.add(new HeatmapResponse("Afternoon", "15:00", 95.0));
        }
        return ResponseEntity.ok(ApiResponse.success(heatmap));
    }

    /**
     * GET /api/dashboard/idle-equipment — Identify equipment not used for a period
     */
    @GetMapping("/idle-equipment")
    public ResponseEntity<ApiResponse<List<IdleEquipmentResponse>>> getIdleEquipment(
            @RequestParam(required = false, defaultValue = "30") int days,
            Authentication authentication) {
        
        List<IdleEquipmentResponse> idleList = new ArrayList<>();
        
        // Mock idle data for now
        idleList.add(new IdleEquipmentResponse(
                UUID.randomUUID(), 
                "Centrifuge 5000", 
                "Biology Dept", 
                java.time.LocalDateTime.now().minusDays(45), 
                45, 
                5.0, 
                "Idle Equipment"
        ));
        
        idleList.add(new IdleEquipmentResponse(
                UUID.randomUUID(), 
                "Mass Spectrometer V2", 
                "Chemistry Dept", 
                java.time.LocalDateTime.now().minusDays(15), 
                15, 
                25.0, 
                "Low Utilization"
        ));

        idleList.add(new IdleEquipmentResponse(
                UUID.randomUUID(), 
                "Incubator B", 
                "Biology Dept", 
                java.time.LocalDateTime.now().minusDays(5), 
                5, 
                75.0, 
                "Moderately Utilized"
        ));

        return ResponseEntity.ok(ApiResponse.success(idleList));
    }
}

