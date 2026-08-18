package com.lab.backend.service.impl;

import com.lab.backend.dto.DashboardDTO;
import com.lab.backend.dto.DashboardResponse;
import com.lab.backend.dto.LabUtilizationDTO;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.Laboratory;
import com.lab.backend.enums.BookingStatus;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.repository.*;
import com.lab.backend.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final UtilizationRepository utilizationRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            LaboratoryRepository laboratoryRepository,
            MaintenanceRepository maintenanceRepository,
            UtilizationRepository utilizationRepository) {

        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.utilizationRepository = utilizationRepository;
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalLaboratories = laboratoryRepository.count();
        long totalEquipment = equipmentRepository.count();

        List<Equipment> allEquipment = equipmentRepository.findAll();
        long availableEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE)
                .count();

        long reservedEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.RESERVED)
                .count();

        long inUseEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.BOOKED)
                .count();

        long underMaintenanceEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE)
                .count();

        long notAvailableEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.BOOKED)
                .count();

        double utilizationPercentage = 0.0;
        if (totalEquipment > 0) {
            utilizationPercentage = ((double) (inUseEquipment + reservedEquipment) / totalEquipment) * 100.0;
        }
        utilizationPercentage = Math.round(utilizationPercentage * 100.0) / 100.0;

        String mostUsedEquipment = "N/A";
        if (!allEquipment.isEmpty()) {
            Map<Equipment, Long> bookingCounts = bookingRepository.findAll().stream()
                    .filter(b -> b.getEquipment() != null)
                    .collect(Collectors.groupingBy(com.lab.backend.entity.Booking::getEquipment, Collectors.counting()));
            if (!bookingCounts.isEmpty()) {
                mostUsedEquipment = bookingCounts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(entry -> entry.getKey().getName())
                        .orElse(allEquipment.get(0).getName());
            } else {
                mostUsedEquipment = allEquipment.get(0).getName();
            }
        }

        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long approvedBookings = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long returnedBookings = bookingRepository.countByStatus(BookingStatus.RETURNED);
        long issuedBookings = bookingRepository.countByStatus(BookingStatus.ISSUED);

        stats.put("totalLaboratories", totalLaboratories);
        stats.put("totalEquipment", totalEquipment);
        stats.put("availableEquipment", availableEquipment);
        stats.put("reservedEquipment", reservedEquipment);
        stats.put("inUseEquipment", inUseEquipment);
        stats.put("bookedEquipment", reservedEquipment + inUseEquipment);
        stats.put("underMaintenanceEquipment", underMaintenanceEquipment);
        stats.put("notAvailableEquipment", notAvailableEquipment);
        stats.put("utilizationPercentage", utilizationPercentage);
        stats.put("mostUsedEquipment", mostUsedEquipment);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("approvedBookings", approvedBookings);
        stats.put("returnedBookings", returnedBookings);
        stats.put("issuedBookings", issuedBookings);
        stats.put("totalUsers", userRepository.count());

        // Category distribution for charts
        Map<String, Long> categoryCounts = allEquipment.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(Equipment::getCategory, Collectors.counting()));
        stats.put("equipmentByCategory", categoryCounts);

        // Booking status distribution for charts
        Map<String, Long> statusCounts = new HashMap<>();
        for (BookingStatus s : BookingStatus.values()) {
            statusCounts.put(s.name(), bookingRepository.countByStatus(s));
        }
        stats.put("bookingStatusCounts", statusCounts);

        // Equipment status breakdown
        Map<String, Long> availabilityCounts = new HashMap<>();
        availabilityCounts.put("AVAILABLE", availableEquipment);
        availabilityCounts.put("RESERVED", reservedEquipment);
        availabilityCounts.put("IN_USE", inUseEquipment);
        availabilityCounts.put("UNDER_MAINTENANCE", underMaintenanceEquipment);
        availabilityCounts.put("NOT_AVAILABLE", notAvailableEquipment);
        stats.put("equipmentAvailabilityCounts", availabilityCounts);

        return stats;
    }

    @Override
    public DashboardDTO getDashboard() {

        DashboardDTO dto = new DashboardDTO();

        long total = equipmentRepository.count();
        long available = equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE);
        long reserved = equipmentRepository.countByStatus(EquipmentStatus.RESERVED);
        long inUse = equipmentRepository.countByStatus(EquipmentStatus.BOOKED);
        long maintenance = equipmentRepository.countByStatus(EquipmentStatus.MAINTENANCE);

        dto.setTotalEquipment(total);
        dto.setAvailable(available);
        dto.setReserved(reserved);
        dto.setInUse(inUse);
        dto.setMaintenance(maintenance);

        double utilization = 0.0;
        if (total > 0) {
            utilization = ((double) (inUse + reserved) / total) * 100.0;
        }
        dto.setUtilizationPercentage(Math.round(utilization * 100.0) / 100.0);

        String mostUsed = "N/A";
        List<Equipment> allEq = equipmentRepository.findAll();
        if (!allEq.isEmpty()) {
            Map<Equipment, Long> bookingCounts = bookingRepository.findAll().stream()
                    .filter(b -> b.getEquipment() != null)
                    .collect(Collectors.groupingBy(com.lab.backend.entity.Booking::getEquipment, Collectors.counting()));
            if (!bookingCounts.isEmpty()) {
                mostUsed = bookingCounts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(entry -> entry.getKey().getName())
                        .orElse(allEq.get(0).getName());
            } else {
                mostUsed = allEq.get(0).getName();
            }
        }
        dto.setMostUsedEquipment(mostUsed);

        List<LabUtilizationDTO> labs = new ArrayList<>();

        List<Laboratory> laboratoryList = laboratoryRepository.findAll();

        for (Laboratory lab : laboratoryList) {

            List<Equipment> equipmentList =
                    equipmentRepository.findByLaboratoryId(lab.getId());

            int labTotal = equipmentList.size();

            long used = equipmentList.stream()
                    .filter(e ->
                            e.getStatus() == EquipmentStatus.RESERVED
                                    || e.getStatus() == EquipmentStatus.BOOKED)
                    .count();

            double labUtilization = 0;

            if (labTotal > 0) {
                labUtilization = ((double) used / labTotal) * 100;
            }

            labs.add(new LabUtilizationDTO(
                    lab.getLabName(),
                    Math.round(labUtilization * 100.0) / 100.0
            ));
        }

        dto.setLabs(labs);

        return dto;
    }

    @Override
    public DashboardResponse getDashboardResponse() {
        long totalEquipment = equipmentRepository.count();
        List<Equipment> allEquipment = equipmentRepository.findAll();

        long availableEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE)
                .count();

        long inUseEquipment = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.BOOKED)
                .count();

        long underMaintenance = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE)
                .count();

        long reserved = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.RESERVED)
                .count();

        double overallUtilizationPercentage = 0.0;
        if (totalEquipment > 0) {
            overallUtilizationPercentage = ((double) (inUseEquipment + reserved) / totalEquipment) * 100.0;
        }
        overallUtilizationPercentage = Math.round(overallUtilizationPercentage * 100.0) / 100.0;

        // Department-wise utilization
        Map<String, Object> deptWise = new HashMap<>();
        List<com.lab.backend.entity.Utilization> utilizationLogs = utilizationRepository.findAll();
        Map<String, Long> deptLogCounts = utilizationLogs.stream()
                .filter(u -> u.getDepartment() != null)
                .collect(Collectors.groupingBy(com.lab.backend.entity.Utilization::getDepartment, Collectors.counting()));
        deptWise.putAll(deptLogCounts);

        if (deptWise.isEmpty()) {
            laboratoryRepository.findAll().forEach(lab -> {
                long count = equipmentRepository.findByLaboratoryId(lab.getId()).size();
                deptWise.put(lab.getLabName(), count);
            });
        }

        // Top used equipment
        Map<Equipment, Long> usageMap = utilizationLogs.stream()
                .filter(u -> u.getEquipment() != null)
                .collect(Collectors.groupingBy(
                        com.lab.backend.entity.Utilization::getEquipment,
                        Collectors.summingLong(u -> u.getDurationMinutes() != null ? u.getDurationMinutes() : 1)
                ));

        List<Map<String, Object>> topUsedList = new ArrayList<>();
        if (!usageMap.isEmpty()) {
            topUsedList = usageMap.entrySet().stream()
                    .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                    .limit(10)
                    .map(entry -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("equipmentId", entry.getKey().getId());
                        map.put("name", entry.getKey().getName());
                        map.put("category", entry.getKey().getCategory());
                        map.put("totalMinutesUsed", entry.getValue());
                        return map;
                    })
                    .collect(Collectors.toList());
        } else {
            // Fallback to equipment booking count or all equipment
            Map<Equipment, Long> bookingCounts = bookingRepository.findAll().stream()
                    .filter(b -> b.getEquipment() != null)
                    .collect(Collectors.groupingBy(com.lab.backend.entity.Booking::getEquipment, Collectors.counting()));
            if (!bookingCounts.isEmpty()) {
                topUsedList = bookingCounts.entrySet().stream()
                        .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                        .limit(10)
                        .map(entry -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("equipmentId", entry.getKey().getId());
                            map.put("name", entry.getKey().getName());
                            map.put("category", entry.getKey().getCategory());
                            map.put("totalBookingsCount", entry.getValue());
                            return map;
                        })
                        .collect(Collectors.toList());
            } else {
                topUsedList = allEquipment.stream()
                        .limit(10)
                        .map(e -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("equipmentId", e.getId());
                            map.put("name", e.getName());
                            map.put("category", e.getCategory());
                            map.put("status", e.getStatus());
                            return map;
                        })
                        .collect(Collectors.toList());
            }
        }

        return new DashboardResponse(
                totalEquipment,
                availableEquipment,
                inUseEquipment,
                underMaintenance,
                overallUtilizationPercentage,
                deptWise,
                topUsedList
        );
    }
}
