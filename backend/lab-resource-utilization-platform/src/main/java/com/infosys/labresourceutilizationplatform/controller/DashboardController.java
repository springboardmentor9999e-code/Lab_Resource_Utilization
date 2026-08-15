package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.*;
import com.infosys.labresourceutilizationplatform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private IssueReportRepository issueReportRepository;

    @Autowired
    private PreventiveMaintenanceRepository preventiveMaintenanceRepository;

    @Autowired
    private ResourceSharingRepository resourceSharingRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String role) {

        Map<String, Object> stats = new HashMap<>();

        long totalEquipment = equipmentRepository.count();
        long totalLaboratories = laboratoryRepository.count();
        long totalDepartments = departmentRepository.count();

        // Calculate available and maintenance quantities
        long availableEquipment = equipmentRepository.findByStatus("Available").size();
        long maintenanceEquipment = equipmentRepository.findByStatus("Under Maintenance").size();
        long pendingBookings = bookingRepository.findByStatus("Pending").size() + bookingRepository.findByStatus("Pending Approval").size();

        stats.put("totalEquipment", totalEquipment);
        stats.put("availableEquipment", availableEquipment > 0 ? availableEquipment : totalEquipment - maintenanceEquipment);
        stats.put("maintenanceEquipment", maintenanceEquipment);
        stats.put("pendingBookings", pendingBookings);
        stats.put("totalLaboratories", totalLaboratories);
        stats.put("totalDepartments", totalDepartments);
        stats.put("totalUsers", userRepository.count());

        if (userId != null) {
            List<Booking> userBookings = bookingRepository.findByUserUserId(userId);
            long myBookingsCount = userBookings.size();
            long activeBookingsCount = userBookings.stream()
                    .filter(b -> "Approved".equalsIgnoreCase(b.getStatus()) || "Confirmed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()))
                    .count();

            stats.put("myBookings", myBookingsCount);
            stats.put("activeBookings", activeBookingsCount);
        } else {
            stats.put("myBookings", 0);
            stats.put("activeBookings", 0);
        }

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/utilization")
    public ResponseEntity<List<Map<String, Object>>> getUtilization() {
        List<Map<String, Object>> utilizationData = new ArrayList<>();
        List<Equipment> equipmentList = equipmentRepository.findAll();

        Random random = new Random(42);

        for (Equipment eq : equipmentList) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", eq.getEquipmentName());
            
            double baseRate = eq.getStatus().equalsIgnoreCase("Available") ? 45.0 : 85.0;
            if (eq.getStatus().equalsIgnoreCase("Under Maintenance")) {
                baseRate = 0.0;
            }
            double rate = Math.min(100.0, Math.max(0.0, baseRate + random.nextInt(25) - 10));
            
            item.put("utilizationRate", Math.round(rate * 10.0) / 10.0);
            utilizationData.add(item);
        }

        return ResponseEntity.ok(utilizationData);
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<Map<String, Object>>> getHeatmap(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) Long equipmentId) {

        List<Booking> bookings = bookingRepository.findAll();
        
        if (equipmentId != null) {
            bookings = bookings.stream().filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(equipmentId)).collect(Collectors.toList());
        } else if (laboratoryId != null) {
            bookings = bookings.stream().filter(b -> b.getEquipment() != null && b.getEquipment().getLaboratory() != null && b.getEquipment().getLaboratory().getLabId().equals(laboratoryId)).collect(Collectors.toList());
        } else if (departmentId != null) {
            bookings = bookings.stream().filter(b -> b.getEquipment() != null && b.getEquipment().getLaboratory() != null && b.getEquipment().getLaboratory().getDepartment() != null && b.getEquipment().getLaboratory().getDepartment().getDepartmentId().equals(departmentId)).collect(Collectors.toList());
        }

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        
        Map<String, Integer> dayCounts = new HashMap<>();
        for (String day : days) {
            dayCounts.put(day, 0);
        }

        for (Booking b : bookings) {
            if (b.getBookingDate() != null) {
                String dayOfWeek = b.getBookingDate().getDayOfWeek().name();
                String formattedDay = dayOfWeek.substring(0, 1) + dayOfWeek.substring(1).toLowerCase();
                dayCounts.put(formattedDay, dayCounts.getOrDefault(formattedDay, 0) + 1);
            }
        }

        List<Map<String, Object>> heatmapData = new ArrayList<>();
        for (String day : days) {
            Map<String, Object> point = new HashMap<>();
            point.put("day", day);
            point.put("value", dayCounts.get(day));
            heatmapData.add(point);
        }

        return ResponseEntity.ok(heatmapData);
    }

    @GetMapping("/realtime")
    public ResponseEntity<?> getRealtimeDashboard(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().getRoleName();
        Map<String, Object> data = new HashMap<>();

        // Fetch master lists
        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();
        List<Laboratory> allLaboratories = laboratoryRepository.findAll();
        List<Department> allDepartments = departmentRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<IssueReport> allIssues = issueReportRepository.findAll();
        List<PreventiveMaintenance> allPMs = preventiveMaintenanceRepository.findAll();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            data.put("totalInstitutions", institutionRepository.count());
            data.put("totalDepartments", allDepartments.size());
            data.put("totalLaboratories", allLaboratories.size());
            data.put("totalEquipment", allEquipment.size());
            data.put("totalUsers", allUsers.size());
            
            long activeBookings = allBookings.stream()
                    .filter(b -> "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus()) || "Confirmed".equalsIgnoreCase(b.getStatus()) || "Approved".equalsIgnoreCase(b.getStatus()))
                    .count();
            data.put("activeBookings", activeBookings);

            long totalMaintenance = allIssues.stream()
                    .filter(i -> "PENDING".equalsIgnoreCase(i.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                    .count();
            data.put("totalMaintenance", totalMaintenance);

            double totalHours = 0.0;
            double totalCost = 0.0;
            long interInstituteCount = 0;
            long crossInstUtilization = 0;

            for (Booking b : allBookings) {
                boolean isCompletedOrActive = "Completed".equalsIgnoreCase(b.getStatus()) 
                        || "In Use".equalsIgnoreCase(b.getStatus()) 
                        || "Active".equalsIgnoreCase(b.getStatus())
                        || "Approved".equalsIgnoreCase(b.getStatus())
                        || "Confirmed".equalsIgnoreCase(b.getStatus());

                if (isCompletedOrActive) {
                    double duration = b.getDuration() != null ? b.getDuration() : 0.0;
                    totalHours += duration;

                    if (b.getUser() != null && b.getEquipment() != null) {
                        if (b.getEquipment().getLaboratory() != null &&
                            b.getEquipment().getLaboratory().getDepartment() != null &&
                            b.getEquipment().getLaboratory().getDepartment().getInstitution() != null) {
                            Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                            Integer userInstId = b.getUser().getInstitutionId();
                            if (userInstId == null || !eqInstId.equals(Long.valueOf(userInstId))) {
                                interInstituteCount++;
                                if ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus())) {
                                    crossInstUtilization++;
                                }
                                double costPer = b.getEquipment().getCostPerHour() != null ? b.getEquipment().getCostPerHour() : 0.0;
                                totalCost += duration * costPer;
                            }
                        }
                    }
                }
            }

            double avgUtilization = allEquipment.isEmpty() ? 0.0 : (totalHours / (allEquipment.size() * 720.0)) * 100.0;
            if (avgUtilization > 100.0) avgUtilization = 100.0;

            data.put("overallUtilization", Math.round(avgUtilization * 100.0) / 100.0);
            data.put("overallUtilizationCost", Math.round(totalCost * 100.0) / 100.0);

            long totalSharedEquipment = allBookings.stream()
                    .filter(b -> {
                        if (b.getUser() == null || b.getEquipment() == null) return false;
                        if (b.getEquipment().getLaboratory() == null ||
                            b.getEquipment().getLaboratory().getDepartment() == null ||
                            b.getEquipment().getLaboratory().getDepartment().getInstitution() == null) return false;
                        Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                        Integer userInstId = b.getUser().getInstitutionId();
                        return userInstId == null || !eqInstId.equals(Long.valueOf(userInstId));
                    })
                    .map(b -> b.getEquipment().getId())
                    .distinct()
                    .count();

            List<ResourceSharing> globalSharings = resourceSharingRepository.findAll();
            long totalActiveSharing = globalSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()))
                    .count();
            long pendingSharingGlobal = globalSharings.stream()
                    .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                    .count();
            long approvedSharingGlobal = globalSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .count();

            data.put("totalOwnedEquipment", allEquipment.size());
            data.put("totalSharedEquipment", totalSharedEquipment);
            data.put("totalActiveSharingRequests", totalActiveSharing);
            data.put("pendingRequests", pendingSharingGlobal);
            data.put("approvedRequests", approvedSharingGlobal);
            data.put("totalInterInstituteRequests", interInstituteCount);
            data.put("crossInstituteUtilization", crossInstUtilization);

            // Chart: Top Shared Equipment
            List<Map<String, Object>> topSharedEquip = allBookings.stream()
                    .filter(b -> {
                        if (b.getUser() == null || b.getEquipment() == null) return false;
                        if (b.getEquipment().getLaboratory() == null ||
                            b.getEquipment().getLaboratory().getDepartment() == null ||
                            b.getEquipment().getLaboratory().getDepartment().getInstitution() == null) return false;
                        Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                        Integer userInstId = b.getUser().getInstitutionId();
                        return userInstId == null || !eqInstId.equals(Long.valueOf(userInstId));
                    })
                    .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentName(), Collectors.counting()))
                    .entrySet().stream()
                    .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", e.getKey());
                        map.put("value", e.getValue());
                        return map;
                    })
                    .collect(Collectors.toList());
            data.put("topSharedEquipment", topSharedEquip);

            // Chart: Top Sharing Institutes
            Map<String, Long> instSharingCount = new HashMap<>();
            for (Booking b : allBookings) {
                if (b.getUser() != null && b.getEquipment() != null) {
                    if (b.getEquipment().getLaboratory() != null &&
                        b.getEquipment().getLaboratory().getDepartment() != null &&
                        b.getEquipment().getLaboratory().getDepartment().getInstitution() != null) {
                        Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                        Integer userInstId = b.getUser().getInstitutionId();
                        if (userInstId == null || !eqInstId.equals(Long.valueOf(userInstId))) {
                            String eqInstName = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionName();
                            instSharingCount.put(eqInstName, instSharingCount.getOrDefault(eqInstName, 0L) + 1);
                            if (b.getUser().getInstitutionId() != null) {
                                Institution userInst = institutionRepository.findById(Long.valueOf(b.getUser().getInstitutionId())).orElse(null);
                                if (userInst != null) {
                                    String userInstName = userInst.getInstitutionName();
                                    instSharingCount.put(userInstName, instSharingCount.getOrDefault(userInstName, 0L) + 1);
                                }
                            }
                        }
                    }
                }
            }
            List<Map<String, Object>> topInstitutes = instSharingCount.entrySet().stream()
                    .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", e.getKey());
                        map.put("value", e.getValue());
                        return map;
                    })
                    .collect(Collectors.toList());
            data.put("topInstitutesByResourceSharing", topInstitutes);

            // Chart: Institution Comparison
            List<Map<String, Object>> instComp = institutionRepository.findAll().stream().map(inst -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", inst.getInstitutionName());
                long count = allEquipment.stream()
                        .filter(e -> e.getLaboratory() != null && e.getLaboratory().getDepartment() != null && e.getLaboratory().getDepartment().getInstitution() != null && e.getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(inst.getInstitutionId()))
                        .count();
                map.put("value", count);
                return map;
            }).collect(Collectors.toList());
            data.put("institutionComparison", instComp);

            // Chart: Booking Trend
            Map<String, Long> bookingCounts = allBookings.stream().collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
            data.put("bookingTrend", bookingCounts);

            // Chart: Maintenance Trend
            Map<String, Long> issueCounts = allIssues.stream().collect(Collectors.groupingBy(IssueReport::getStatus, Collectors.counting()));
            data.put("maintenanceTrend", issueCounts);

        } else if ("INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
            Long instId = Long.valueOf(user.getInstitutionId());

            List<Department> instDepts = allDepartments.stream()
                    .filter(d -> d.getInstitution() != null && d.getInstitution().getInstitutionId().equals(instId))
                    .collect(Collectors.toList());
            List<Long> deptIds = instDepts.stream().map(Department::getDepartmentId).collect(Collectors.toList());

            List<Laboratory> instLabs = allLaboratories.stream()
                    .filter(l -> l.getDepartment() != null && deptIds.contains(l.getDepartment().getDepartmentId()))
                    .collect(Collectors.toList());
            List<Long> labIds = instLabs.stream().map(Laboratory::getLabId).collect(Collectors.toList());

            List<Equipment> instEquip = allEquipment.stream()
                    .filter(e -> e.getLaboratory() != null && labIds.contains(e.getLaboratory().getLabId()))
                    .collect(Collectors.toList());
            List<Long> equipIds = instEquip.stream().map(Equipment::getId).collect(Collectors.toList());

            List<Booking> incomingBookings = allBookings.stream()
                    .filter(b -> b.getEquipment() != null && equipIds.contains(b.getEquipment().getId()))
                    .collect(Collectors.toList());

            List<Booking> outgoingBookings = allBookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getInstitutionId() != null 
                            && b.getUser().getInstitutionId().equals(user.getInstitutionId())
                            && (b.getEquipment() == null || !equipIds.contains(b.getEquipment().getId())))
                    .collect(Collectors.toList());

            List<Booking> myAllRelatedBookings = allBookings.stream()
                    .filter(b -> (b.getEquipment() != null && equipIds.contains(b.getEquipment().getId())) 
                            || (b.getUser() != null && b.getUser().getInstitutionId() != null && b.getUser().getInstitutionId().equals(user.getInstitutionId())))
                    .collect(Collectors.toList());

            List<User> instUsers = allUsers.stream()
                    .filter(u -> u.getInstitutionId() != null && u.getInstitutionId().equals(user.getInstitutionId()))
                    .collect(Collectors.toList());

            long pendingApprovals = instUsers.stream().filter(u -> "PENDING".equalsIgnoreCase(u.getStatus())).count();

            data.put("totalDepartments", instDepts.size());
            data.put("totalLaboratories", instLabs.size());
            data.put("totalEquipment", instEquip.size());
            data.put("totalActiveUsers", instUsers.size() - pendingApprovals);
            data.put("pendingUserApprovals", pendingApprovals);

            long activeBookings = incomingBookings.stream()
                    .filter(b -> "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus()) || "Confirmed".equalsIgnoreCase(b.getStatus()) || "Approved".equalsIgnoreCase(b.getStatus()))
                    .count();
            data.put("activeBookings", activeBookings);

            long maintenanceCount = instEquip.stream().filter(e -> "Under Maintenance".equalsIgnoreCase(e.getStatus())).count();
            data.put("equipmentUnderMaintenance", maintenanceCount);

            double totalHours = 0.0;
            double totalCost = 0.0;
            for (Booking b : incomingBookings) {
                if ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus())) {
                    double duration = b.getDuration() != null ? b.getDuration() : 0.0;
                    totalHours += duration;
                    
                    if (b.getUser() != null) {
                        Integer userInstId = b.getUser().getInstitutionId();
                        if (userInstId == null || !instId.equals(Long.valueOf(userInstId))) {
                            double costPer = b.getEquipment() != null && b.getEquipment().getCostPerHour() != null ? b.getEquipment().getCostPerHour() : 0.0;
                            totalCost += duration * costPer;
                        }
                    }
                }
            }
            double instUtilization = instEquip.isEmpty() ? 0.0 : (totalHours / (instEquip.size() * 720.0)) * 100.0;
            if (instUtilization > 100.0) instUtilization = 100.0;

            data.put("totalUtilizationCost", Math.round(totalCost * 100.0) / 100.0);
            data.put("institutionUtilizationPercentage", Math.round(instUtilization * 100.0) / 100.0);

            // Inter-Institute Sharing metrics
            long incomingRequestsCount = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .count();
            long outgoingRequestsCount = outgoingBookings.size();
            long pendingSharingApprovals = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Pending".equalsIgnoreCase(b.getStatus()))
                    .count();
            long approvedSharingRequests = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Approved".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus()) || "Completed".equalsIgnoreCase(b.getStatus()))
                    .count();
            long rejectedSharingRequests = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Rejected".equalsIgnoreCase(b.getStatus()))
                    .count();
            double externalRevenue = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()))
                    .mapToDouble(b -> b.getUtilizationCost() != null ? b.getUtilizationCost() : 0.0)
                    .sum();
            long crossInstituteUtilizationCount = myAllRelatedBookings.stream()
                    .filter(b -> b.getUser() != null && b.getEquipment() != null)
                    .filter(b -> {
                        Long eqId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                        Integer userIdVal = b.getUser().getInstitutionId();
                        return userIdVal == null || !eqId.equals(Long.valueOf(userIdVal));
                    })
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus()))
                    .count();
            double internalEquipmentUsage = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getInstitutionId() != null && Long.valueOf(b.getUser().getInstitutionId()).equals(instId))
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()))
                    .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                    .sum();
            double externalEquipmentUsage = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()))
                    .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                    .sum();
            long totalInternalBookings = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getInstitutionId() != null && Long.valueOf(b.getUser().getInstitutionId()).equals(instId))
                    .count();
            long totalExternalBookings = incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .count();

            Map<String, Double> instRevenueMap = new HashMap<>();
            incomingBookings.stream()
                    .filter(b -> b.getUser() != null && (b.getUser().getInstitutionId() == null || !Long.valueOf(b.getUser().getInstitutionId()).equals(instId)))
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()))
                    .forEach(b -> {
                        if (b.getUser().getInstitutionId() != null) {
                            Institution reqInst = institutionRepository.findById(Long.valueOf(b.getUser().getInstitutionId())).orElse(null);
                            if (reqInst != null) {
                                String name = reqInst.getInstitutionName();
                                double costVal = b.getUtilizationCost() != null ? b.getUtilizationCost() : 0.0;
                                instRevenueMap.put(name, instRevenueMap.getOrDefault(name, 0.0) + costVal);
                            }
                        }
                    });
            List<Map<String, Object>> instWiseRev = instRevenueMap.entrySet().stream()
                    .map(e -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("name", e.getKey());
                        m.put("value", Math.round(e.getValue() * 100.0) / 100.0);
                        return m;
                    }).collect(Collectors.toList());

            List<ResourceSharing> instSharings = resourceSharingRepository.findAll();
            long totalSharedWithOthers = instSharings.stream()
                    .filter(s -> s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .map(s -> s.getEquipment().getId())
                    .distinct()
                    .count();

            long totalSharedFromOthers = instSharings.stream()
                    .filter(s -> s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .map(s -> s.getEquipment().getId())
                    .distinct()
                    .count();

            long totalActiveSharing = instSharings.stream()
                    .filter(s -> (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId)) 
                            || (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId)))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()))
                    .count();

            long pendingRequestsInst = instSharings.stream()
                    .filter(s -> s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                    .count();

            long approvedRequestsInst = instSharings.stream()
                    .filter(s -> (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId)) 
                            || (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId)))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .count();

            data.put("totalOwnedEquipment", instEquip.size());
            data.put("totalEquipmentSharedWithOthers", totalSharedWithOthers);
            data.put("totalEquipmentSharedFromOthers", totalSharedFromOthers);
            data.put("totalActiveSharingRequests", totalActiveSharing);
            data.put("pendingRequests", pendingRequestsInst);
            data.put("approvedRequests", approvedRequestsInst);

            data.put("incomingRequestsCount", incomingRequestsCount);
            data.put("outgoingRequestsCount", outgoingRequestsCount);
            data.put("pendingSharingApprovals", pendingSharingApprovals);
            data.put("approvedSharingRequests", approvedSharingRequests);
            data.put("rejectedSharingRequests", rejectedSharingRequests);
            data.put("externalRevenue", Math.round(externalRevenue * 100.0) / 100.0);
            data.put("crossInstituteUtilizationCount", crossInstituteUtilizationCount);
            data.put("internalEquipmentUsage", Math.round(internalEquipmentUsage * 100.0) / 100.0);
            data.put("externalEquipmentUsage", Math.round(externalEquipmentUsage * 100.0) / 100.0);
            data.put("totalInternalBookings", totalInternalBookings);
            data.put("totalExternalBookings", totalExternalBookings);
            data.put("externalUtilizationRevenue", Math.round(externalRevenue * 100.0) / 100.0);
            data.put("institutionWiseUtilizationRevenue", instWiseRev);

            // Chart: Department Comparison
            List<Map<String, Object>> deptComp = instDepts.stream().map(dept -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", dept.getDepartmentName());
                long count = instEquip.stream()
                        .filter(e -> e.getLaboratory() != null && e.getLaboratory().getDepartment() != null && e.getLaboratory().getDepartment().getDepartmentId().equals(dept.getDepartmentId()))
                        .count();
                map.put("value", count);
                return map;
            }).collect(Collectors.toList());
            data.put("departmentComparison", deptComp);

            // Chart: Equipment Utilization
            List<Map<String, Object>> equipUtil = instEquip.stream().limit(10).map(eq -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", eq.getEquipmentName());
                double eqHours = incomingBookings.stream()
                        .filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(eq.getId()) && ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus())))
                        .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                        .sum();
                double util = (eqHours / 720.0) * 100.0;
                map.put("utilization", Math.round(Math.min(100.0, util) * 100.0) / 100.0);
                return map;
            }).collect(Collectors.toList());
            data.put("equipmentUtilization", equipUtil);

        } else if ("DEPARTMENT_HEAD".equalsIgnoreCase(role)) {
            Long deptId = Long.valueOf(user.getDepartmentId());

            List<Laboratory> deptLabs = allLaboratories.stream()
                    .filter(l -> l.getDepartment() != null && l.getDepartment().getDepartmentId().equals(deptId))
                    .collect(Collectors.toList());
            List<Long> labIds = deptLabs.stream().map(Laboratory::getLabId).collect(Collectors.toList());

            List<Equipment> deptEquip = allEquipment.stream()
                    .filter(e -> e.getLaboratory() != null && labIds.contains(e.getLaboratory().getLabId()))
                    .collect(Collectors.toList());
            List<Long> equipIds = deptEquip.stream().map(Equipment::getId).collect(Collectors.toList());

            List<Booking> deptBookings = allBookings.stream()
                    .filter(b -> b.getEquipment() != null && equipIds.contains(b.getEquipment().getId()))
                    .collect(Collectors.toList());

            List<IssueReport> deptIssues = allIssues.stream()
                    .filter(i -> i.getEquipment() != null && equipIds.contains(i.getEquipment().getId()))
                    .collect(Collectors.toList());

            data.put("departmentEquipment", deptEquip.size());
            data.put("departmentLaboratories", deptLabs.size());

            long activeBookings = deptBookings.stream()
                    .filter(b -> "In Use".equalsIgnoreCase(b.getStatus()) || "Confirmed".equalsIgnoreCase(b.getStatus()) || "Approved".equalsIgnoreCase(b.getStatus()))
                    .count();
            data.put("activeBookings", activeBookings);

            long activeIssues = deptIssues.stream()
                    .filter(i -> "PENDING".equalsIgnoreCase(i.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                    .count();
            data.put("maintenanceOverview", activeIssues);

            double totalHours = 0.0;
            for (Booking b : deptBookings) {
                if ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus())) {
                    totalHours += b.getDuration() != null ? b.getDuration() : 0.0;
                }
            }
            double deptUtilization = deptEquip.isEmpty() ? 0.0 : (totalHours / (deptEquip.size() * 720.0)) * 100.0;
            if (deptUtilization > 100.0) deptUtilization = 100.0;

            data.put("departmentUtilization", Math.round(deptUtilization * 100.0) / 100.0);

            // Chart: Equipment Usage
            List<Map<String, Object>> eqUsage = deptEquip.stream().limit(8).map(eq -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", eq.getEquipmentName());
                double eqHours = deptBookings.stream()
                        .filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(eq.getId()) && ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus())))
                        .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                        .sum();
                map.put("value", Math.round(eqHours * 100.0) / 100.0);
                return map;
            }).collect(Collectors.toList());
            data.put("monthlyEquipmentUsage", eqUsage);

        } else if ("LAB_MANAGER".equalsIgnoreCase(role)) {
            Long deptId = Long.valueOf(user.getDepartmentId());

            List<Laboratory> deptLabs = allLaboratories.stream()
                    .filter(l -> l.getDepartment() != null && l.getDepartment().getDepartmentId().equals(deptId))
                    .collect(Collectors.toList());
            List<Long> labIds = deptLabs.stream().map(Laboratory::getLabId).collect(Collectors.toList());

            List<Equipment> deptEquip = allEquipment.stream()
                    .filter(e -> e.getLaboratory() != null && labIds.contains(e.getLaboratory().getLabId()))
                    .collect(Collectors.toList());
            List<Long> equipIds = deptEquip.stream().map(Equipment::getId).collect(Collectors.toList());

            List<Booking> deptBookings = allBookings.stream()
                    .filter(b -> b.getEquipment() != null && equipIds.contains(b.getEquipment().getId()))
                    .collect(Collectors.toList());

            data.put("totalEquipment", deptEquip.size());
            data.put("availableEquipment", deptEquip.stream().filter(e -> "Available".equalsIgnoreCase(e.getStatus())).count());
            data.put("activeBookings", deptBookings.stream().filter(b -> "In Use".equalsIgnoreCase(b.getStatus())).count());
            data.put("pendingBookings", deptBookings.stream().filter(b -> "Pending Approval".equalsIgnoreCase(b.getStatus()) || "Pending".equalsIgnoreCase(b.getStatus())).count());
            data.put("equipmentUnderMaintenance", deptEquip.stream().filter(e -> "Under Maintenance".equalsIgnoreCase(e.getStatus())).count());
            
            LocalDate today = LocalDate.now();
            long todayBookings = deptBookings.stream().filter(b -> today.equals(b.getBookingDate())).count();
            data.put("todayBookings", todayBookings);

            double totalHours = 0.0;
            for (Booking b : deptBookings) {
                if ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus())) {
                    totalHours += b.getDuration() != null ? b.getDuration() : 0.0;
                }
            }
            double deptUtilization = deptEquip.isEmpty() ? 0.0 : (totalHours / (deptEquip.size() * 720.0)) * 100.0;
            if (deptUtilization > 100.0) deptUtilization = 100.0;

            data.put("utilizationPercentage", Math.round(deptUtilization * 100.0) / 100.0);

            // Chart: Equipment Utilization
            List<Map<String, Object>> eqUtil = deptEquip.stream().limit(8).map(eq -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", eq.getEquipmentName());
                double eqHours = deptBookings.stream()
                        .filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(eq.getId()) && ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus())))
                        .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                        .sum();
                double util = (eqHours / 720.0) * 100.0;
                map.put("utilization", Math.round(Math.min(100.0, util) * 100.0) / 100.0);
                return map;
            }).collect(Collectors.toList());
            data.put("equipmentUtilization", eqUtil);

        } else if ("LAB_TECHNICIAN".equalsIgnoreCase(role)) {
            Long deptId = Long.valueOf(user.getDepartmentId());

            List<Laboratory> deptLabs = allLaboratories.stream()
                    .filter(l -> l.getDepartment() != null && l.getDepartment().getDepartmentId().equals(deptId))
                    .collect(Collectors.toList());
            List<Long> labIds = deptLabs.stream().map(Laboratory::getLabId).collect(Collectors.toList());

            List<Equipment> deptEquip = allEquipment.stream()
                    .filter(e -> e.getLaboratory() != null && labIds.contains(e.getLaboratory().getLabId()))
                    .collect(Collectors.toList());
            List<Long> equipIds = deptEquip.stream().map(Equipment::getId).collect(Collectors.toList());

            List<IssueReport> deptIssues = allIssues.stream()
                    .filter(i -> i.getEquipment() != null && equipIds.contains(i.getEquipment().getId()))
                    .collect(Collectors.toList());

            List<PreventiveMaintenance> deptPMs = allPMs.stream()
                    .filter(pm -> pm.getEquipment() != null && equipIds.contains(pm.getEquipment().getId()))
                    .collect(Collectors.toList());

            long underMaint = deptEquip.stream().filter(e -> "Under Maintenance".equalsIgnoreCase(e.getStatus())).count();
            long pendingMaint = deptIssues.stream().filter(i -> "PENDING".equalsIgnoreCase(i.getStatus())).count();
            long scheduledMaint = deptPMs.stream().filter(pm -> "SCHEDULED".equalsIgnoreCase(pm.getStatus())).count();
            long completedMaint = deptIssues.stream().filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus())).count() 
                    + deptPMs.stream().filter(pm -> "COMPLETED".equalsIgnoreCase(pm.getStatus())).count();

            long unavailableCount = deptEquip.stream()
                    .filter(e -> "Under Maintenance".equalsIgnoreCase(e.getStatus()) || "Out of Service".equalsIgnoreCase(e.getStatus()) || "Retired".equalsIgnoreCase(e.getStatus()))
                    .count();

            data.put("equipmentUnderMaintenance", underMaint);
            data.put("pendingMaintenanceRequests", pendingMaint);
            data.put("scheduledMaintenance", scheduledMaint);
            data.put("completedMaintenance", completedMaint);
            data.put("equipmentCurrentlyUnavailable", unavailableCount);

            // Chart: Maintenance frequency per equipment
            List<Map<String, Object>> freq = deptEquip.stream().limit(8).map(eq -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", eq.getEquipmentName());
                long count = deptIssues.stream().filter(i -> i.getEquipment() != null && i.getEquipment().getId().equals(eq.getId())).count();
                map.put("value", count);
                return map;
            }).collect(Collectors.toList());
            data.put("equipmentMaintenanceFrequency", freq);

        } else {
            // STUDENT or RESEARCHER
            List<Booking> myBookings = allBookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getUserId().equals(user.getUserId()))
                    .collect(Collectors.toList());

            data.put("totalLaboratories", allLaboratories.size());
            data.put("totalEquipment", allEquipment.size());
            data.put("availableEquipment", allEquipment.stream().filter(e -> "Available".equalsIgnoreCase(e.getStatus())).count());

            long active = myBookings.stream().filter(b -> "In Use".equalsIgnoreCase(b.getStatus())).count();
            long upcoming = myBookings.stream().filter(b -> "Confirmed".equalsIgnoreCase(b.getStatus()) || "Approved".equalsIgnoreCase(b.getStatus())).count();
            long completed = myBookings.stream().filter(b -> "Completed".equalsIgnoreCase(b.getStatus())).count();
            long cancelled = myBookings.stream().filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus())).count();

            data.put("myActiveBookings", active);
            data.put("myUpcomingBookings", upcoming);
            data.put("myCompletedBookings", completed);
            data.put("myCancelledBookings", cancelled);
            data.put("inUseByMe", active);

            double totalHours = 0.0;
            double totalCost = 0.0;
            Map<String, Double> equipUsage = new HashMap<>();

            for (Booking b : myBookings) {
                if ("Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus())) {
                    double duration = b.getDuration() != null ? b.getDuration() : 0.0;
                    totalHours += duration;

                    double costPer = b.getEquipment() != null && b.getEquipment().getCostPerHour() != null ? b.getEquipment().getCostPerHour() : 0.0;
                    totalCost += duration * costPer;

                    if (b.getEquipment() != null) {
                        String eqName = b.getEquipment().getEquipmentName();
                        equipUsage.put(eqName, equipUsage.getOrDefault(eqName, 0.0) + duration);
                    }
                }
            }

            data.put("totalHoursUsed", Math.round(totalHours * 100.0) / 100.0);
            data.put("totalUtilizationCost", Math.round(totalCost * 100.0) / 100.0);

            // Chart: Most frequently used equipment
            List<Map<String, Object>> freqUsed = equipUsage.entrySet().stream()
                    .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", e.getKey());
                        map.put("value", Math.round(e.getValue() * 100.0) / 100.0);
                        return map;
                    }).collect(Collectors.toList());
            
            data.put("mostFrequentlyUsed", freqUsed);
        }

        return ResponseEntity.ok(data);
    }

    @GetMapping("/heatmap-v2")
    public ResponseEntity<?> getHeatmapV2(
            @RequestParam(defaultValue = "weekly") String filterType,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().getRoleName();
        List<Booking> bookings = bookingRepository.findAll();

        // Filter bookings based on role permissions
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            // No filtering - overall/cross-institution
        } else if ("INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
            // Filter by institution
            Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
            bookings = bookings.stream()
                    .filter(b -> b.getEquipment() != null 
                            && b.getEquipment().getLaboratory() != null 
                            && b.getEquipment().getLaboratory().getDepartment() != null 
                            && b.getEquipment().getLaboratory().getDepartment().getInstitution() != null 
                            && b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                    .collect(Collectors.toList());
        } else if ("DEPARTMENT_HEAD".equalsIgnoreCase(role)) {
            // Filter by department
            Long deptId = user.getDepartmentId() != null ? Long.valueOf(user.getDepartmentId()) : null;
            bookings = bookings.stream()
                    .filter(b -> b.getEquipment() != null 
                            && b.getEquipment().getLaboratory() != null 
                            && b.getEquipment().getLaboratory().getDepartment() != null 
                            && b.getEquipment().getLaboratory().getDepartment().getDepartmentId().equals(deptId))
                    .collect(Collectors.toList());
        } else if ("LAB_MANAGER".equalsIgnoreCase(role) || "LAB_TECHNICIAN".equalsIgnoreCase(role)) {
            // Filter by laboratory department
            Long deptId = user.getDepartmentId() != null ? Long.valueOf(user.getDepartmentId()) : null;
            bookings = bookings.stream()
                    .filter(b -> b.getEquipment() != null 
                            && b.getEquipment().getLaboratory() != null 
                            && b.getEquipment().getLaboratory().getDepartment() != null 
                            && b.getEquipment().getLaboratory().getDepartment().getDepartmentId().equals(deptId))
                    .collect(Collectors.toList());
        } else if ("STUDENT".equalsIgnoreCase(role) || "RESEARCHER".equalsIgnoreCase(role)) {
            // Filter by user's own bookings
            bookings = bookings.stream()
                    .filter(b -> b.getUser() != null && b.getUser().getUserId().equals(user.getUserId()))
                    .collect(Collectors.toList());
        }

        // Only count completed, active, booked, approved, or confirmed bookings
        bookings = bookings.stream()
                .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()) 
                        || "In Use".equalsIgnoreCase(b.getStatus()) 
                        || "Active".equalsIgnoreCase(b.getStatus())
                        || "Approved".equalsIgnoreCase(b.getStatus())
                        || "Confirmed".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.toList());

        // Calculate most used equipment, least used equipment
        Map<String, Long> equipUsage = bookings.stream()
                .filter(b -> b.getEquipment() != null)
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentName(), Collectors.counting()));

        String mostUsed = equipUsage.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        String leastUsed = equipUsage.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // Prepare heatmap points depending on filterType (daily, weekly, monthly)
        List<Map<String, Object>> cells = new ArrayList<>();
        Map<String, Integer> cellValues = new LinkedHashMap<>();

        if ("daily".equalsIgnoreCase(filterType)) {
            // 24 hours of today / aggregate by hour of day (00:00 to 23:00)
            for (int h = 0; h < 24; h++) {
                cellValues.put(String.format("%02d:00", h), 0);
            }
            for (Booking b : bookings) {
                if (b.getStartTime() != null) {
                    int hour = b.getStartTime().getHour();
                    String key = String.format("%02d:00", hour);
                    cellValues.put(key, cellValues.getOrDefault(key, 0) + 1);
                }
            }
        } else if ("monthly".equalsIgnoreCase(filterType)) {
            // Days of the current month (1 to 31)
            int daysInMonth = LocalDate.now().lengthOfMonth();
            for (int d = 1; d <= daysInMonth; d++) {
                cellValues.put(String.valueOf(d), 0);
            }
            for (Booking b : bookings) {
                if (b.getBookingDate() != null && b.getBookingDate().getMonth() == LocalDate.now().getMonth()) {
                    String key = String.valueOf(b.getBookingDate().getDayOfMonth());
                    cellValues.put(key, cellValues.getOrDefault(key, 0) + 1);
                }
            }
        } else {
            // Weekly (default): Monday to Sunday
            String[] weekDays = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
            for (String day : weekDays) {
                cellValues.put(day, 0);
            }
            for (Booking b : bookings) {
                if (b.getBookingDate() != null) {
                    String dayOfWeek = b.getBookingDate().getDayOfWeek().name();
                    String formattedDay = dayOfWeek.substring(0, 1) + dayOfWeek.substring(1).toLowerCase();
                    cellValues.put(formattedDay, cellValues.getOrDefault(formattedDay, 0) + 1);
                }
            }
        }

        // Find day/slot with highest utilization
        String highestDay = "None";
        int maxVal = -1;
        for (Map.Entry<String, Integer> entry : cellValues.entrySet()) {
            if (entry.getValue() > maxVal) {
                maxVal = entry.getValue();
                highestDay = entry.getKey();
            }
        }
        if (maxVal <= 0) {
            highestDay = "None";
        }

        // Generate cells with level (0 = none, 1 = low, 2 = moderate, 3 = high)
        int maxCellVal = cellValues.values().stream().max(Integer::compare).orElse(0);

        for (Map.Entry<String, Integer> entry : cellValues.entrySet()) {
            Map<String, Object> cell = new HashMap<>();
            cell.put("label", entry.getKey());
            int val = entry.getValue();
            cell.put("value", val);

            int level = 0;
            if (val > 0) {
                if (maxCellVal == 0) {
                    level = 1;
                } else {
                    double percent = (double) val / maxCellVal;
                    if (percent <= 0.33) {
                        level = 1;
                    } else if (percent <= 0.66) {
                        level = 2;
                    } else {
                        level = 3;
                    }
                }
            }
            cell.put("level", level);
            cells.add(cell);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("cells", cells);
        response.put("mostUsed", mostUsed);
        response.put("leastUsed", leastUsed);
        response.put("highestDay", highestDay);
        response.put("totalBookings", bookings.size());

        return ResponseEntity.ok(response);
    }
}
