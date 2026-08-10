package com.example.backend.service.impl;

import com.example.backend.dto.UtilizationStatsDTO;
import com.example.backend.entity.Equipment;
import com.example.backend.entity.Utilization;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.UtilizationRepository;
import com.example.backend.service.UtilizationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UtilizationServiceImpl implements UtilizationService {

    private final UtilizationRepository utilizationRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public UtilizationServiceImpl(UtilizationRepository utilizationRepository,
                                  EquipmentRepository equipmentRepository,
                                  BookingRepository bookingRepository) {
        this.utilizationRepository = utilizationRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<Utilization> getAllUtilizations() {
        return utilizationRepository.findAll();
    }

    @Override
    public Optional<Utilization> getUtilizationById(Long id) {
        return utilizationRepository.findById(id);
    }

    @Override
    public Utilization saveUtilization(Utilization utilization) {
        return utilizationRepository.save(utilization);
    }

    @Override
    public Utilization updateUtilization(Long id, Utilization utilization) {

        Utilization existing = utilizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilization not found"));

        existing.setBookingId(utilization.getBookingId());
        existing.setEquipmentId(utilization.getEquipmentId());
        existing.setUserId(utilization.getUserId());
        existing.setUsageDate(utilization.getUsageDate());
        existing.setHoursUsed(utilization.getHoursUsed());
        existing.setRemarks(utilization.getRemarks());

        return utilizationRepository.save(existing);
    }

    @Override
    public void deleteUtilization(Long id) {
        utilizationRepository.deleteById(id);
    }

    @Override
    public UtilizationStatsDTO getUtilizationStats() {
        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Utilization> utilizations = utilizationRepository.findAll();

        UtilizationStatsDTO stats = new UtilizationStatsDTO();
        stats.setTotalEquipment(allEquipment.size());

        Set<Long> activeEquipmentIds = utilizations.stream()
                .map(Utilization::getEquipmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        stats.setActiveEquipment(activeEquipmentIds.size());
        stats.setIdleEquipmentCount(Math.max(0, allEquipment.size() - activeEquipmentIds.size()));

        BigDecimal totalHoursUsed = utilizations.stream()
                .map(u -> u.getHoursUsed() != null ? u.getHoursUsed() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.setTotalHoursUsed(totalHoursUsed);

        // Calculate available operating capacity (assuming standard 40 hrs/week per equipment)
        BigDecimal totalCapacity = BigDecimal.valueOf(allEquipment.size() * 160L);
        double utilizationRate = 0.0;
        if (totalCapacity.compareTo(BigDecimal.ZERO) > 0) {
            utilizationRate = totalHoursUsed.divide(totalCapacity, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        stats.setOverallUtilizationRate(Math.min(100.0, Math.round(utilizationRate * 10.0) / 10.0));

        // Category usage mapping
        Map<String, Long> categoryMap = allEquipment.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory() : "General",
                        Collectors.counting()
                ));
        stats.setCategoryUsageMap(categoryMap);

        return stats;
    }

    @Override
    public List<Equipment> getIdleEquipment() {
        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Utilization> utilizations = utilizationRepository.findAll();

        Set<Long> usedIds = utilizations.stream()
                .map(Utilization::getEquipmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return allEquipment.stream()
                .filter(e -> !usedIds.contains(e.getId().longValue()))
                .collect(Collectors.toList());
    }
}