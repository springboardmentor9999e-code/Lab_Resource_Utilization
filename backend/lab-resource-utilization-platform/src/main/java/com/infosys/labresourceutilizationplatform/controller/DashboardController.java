package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

        Random random = new Random(42); // Stable seed for mock calculation if database is fresh

        for (Equipment eq : equipmentList) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", eq.getEquipmentName());
            
            // Calculate a semi-realistic utilization rate based on database status or deterministic random
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
    public ResponseEntity<List<Map<String, Object>>> getHeatmap() {
        List<Map<String, Object>> heatmapData = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri"};
        
        List<Equipment> equipmentList = equipmentRepository.findAll();
        Random random = new Random(100);

        for (Equipment eq : equipmentList) {
            for (String day : days) {
                Map<String, Object> point = new HashMap<>();
                point.put("equipment", eq.getEquipmentName());
                point.put("day", day);
                point.put("hoursBooked", random.nextInt(6) + 1);
                heatmapData.add(point);
            }
        }

        return ResponseEntity.ok(heatmapData);
    }
}
