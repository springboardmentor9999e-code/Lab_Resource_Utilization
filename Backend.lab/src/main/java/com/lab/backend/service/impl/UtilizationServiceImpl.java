package com.lab.backend.service.impl;

import com.lab.backend.dto.UtilizationRequest;
import com.lab.backend.dto.UtilizationResponse;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.User;
import com.lab.backend.entity.Utilization;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.exception.ResourceNotFoundException;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.UserRepository;
import com.lab.backend.repository.UtilizationRepository;
import com.lab.backend.service.UtilizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UtilizationServiceImpl implements UtilizationService {

    private final UtilizationRepository utilizationRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public UtilizationServiceImpl(UtilizationRepository utilizationRepository,
                                  EquipmentRepository equipmentRepository,
                                  UserRepository userRepository) {
        this.utilizationRepository = utilizationRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UtilizationResponse startUtilization(UtilizationRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        // Update equipment status to BOOKED/in use
        equipment.setStatus(EquipmentStatus.BOOKED);
        equipmentRepository.save(equipment);

        Utilization utilization = new Utilization();
        utilization.setEquipment(equipment);
        utilization.setUser(user);
        utilization.setDepartment(request.getDepartment() != null ? request.getDepartment() : "General");
        utilization.setStartTime(LocalDateTime.now());
        utilization.setPurpose(request.getPurpose());
        utilization.setStatus("IN_USE");

        Utilization saved = utilizationRepository.save(utilization);
        return new UtilizationResponse(saved);
    }

    @Override
    public UtilizationResponse endUtilization(Long id) {
        Utilization utilization = utilizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilization log not found with ID: " + id));

        if ("COMPLETED".equals(utilization.getStatus())) {
            return new UtilizationResponse(utilization);
        }

        LocalDateTime now = LocalDateTime.now();
        utilization.setEndTime(now);
        utilization.setStatus("COMPLETED");

        if (utilization.getStartTime() != null) {
            long minutes = Duration.between(utilization.getStartTime(), now).toMinutes();
            utilization.setDurationMinutes(Math.max(1, minutes));
        }

        // Return equipment status to AVAILABLE
        Equipment equipment = utilization.getEquipment();
        if (equipment != null) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        Utilization saved = utilizationRepository.save(utilization);
        return new UtilizationResponse(saved);
    }

    @Override
    public List<UtilizationResponse> getAllUtilization() {
        return utilizationRepository.findAll().stream()
                .map(UtilizationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public UtilizationResponse getUtilizationById(Long id) {
        Utilization utilization = utilizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilization log not found with ID: " + id));
        return new UtilizationResponse(utilization);
    }

    @Override
    public List<UtilizationResponse> getUtilizationByEquipment(Long equipmentId) {
        return utilizationRepository.findByEquipmentId(equipmentId).stream()
                .map(UtilizationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<UtilizationResponse> getUtilizationByDepartment(String department) {
        return utilizationRepository.findByDepartmentIgnoreCase(department).stream()
                .map(UtilizationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getOverallUtilization() {
        List<Utilization> all = utilizationRepository.findAll();
        long totalSessions = all.size();
        long activeSessions = all.stream().filter(u -> "IN_USE".equals(u.getStatus())).count();
        long completedSessions = all.stream().filter(u -> "COMPLETED".equals(u.getStatus())).count();
        long totalDurationMinutes = all.stream()
                .mapToLong(u -> u.getDurationMinutes() != null ? u.getDurationMinutes() : 0)
                .sum();

        long totalEquipmentCount = equipmentRepository.count();
        double utilizationPercentage = 0.0;
        if (totalEquipmentCount > 0) {
            long usedEquipmentCount = equipmentRepository.findAll().stream()
                    .filter(e -> e.getStatus() == EquipmentStatus.BOOKED || e.getStatus() == EquipmentStatus.RESERVED)
                    .count();
            utilizationPercentage = ((double) usedEquipmentCount / totalEquipmentCount) * 100.0;
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalSessions", totalSessions);
        metrics.put("activeSessions", activeSessions);
        metrics.put("completedSessions", completedSessions);
        metrics.put("totalDurationMinutes", totalDurationMinutes);
        metrics.put("utilizationPercentage", Math.round(utilizationPercentage * 100.0) / 100.0);
        return metrics;
    }

    @Override
    public List<Map<String, Object>> getTopUsedEquipment() {
        List<Utilization> all = utilizationRepository.findAll();
        Map<Equipment, Long> usageMap = all.stream()
                .filter(u -> u.getEquipment() != null)
                .collect(Collectors.groupingBy(
                        Utilization::getEquipment,
                        Collectors.summingLong(u -> u.getDurationMinutes() != null ? u.getDurationMinutes() : 1)
                ));

        return usageMap.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("equipmentId", entry.getKey().getId());
                    map.put("equipmentName", entry.getKey().getName());
                    map.put("category", entry.getKey().getCategory());
                    map.put("totalMinutesUsed", entry.getValue());
                    map.put("status", entry.getKey().getStatus());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
