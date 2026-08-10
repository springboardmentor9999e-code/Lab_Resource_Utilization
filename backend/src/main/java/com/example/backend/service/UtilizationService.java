package com.example.backend.service;

import com.example.backend.dto.UtilizationStatsDTO;
import com.example.backend.entity.Equipment;
import com.example.backend.entity.Utilization;

import java.util.List;
import java.util.Optional;

public interface UtilizationService {

    List<Utilization> getAllUtilizations();

    Optional<Utilization> getUtilizationById(Long id);

    Utilization saveUtilization(Utilization utilization);

    Utilization updateUtilization(Long id, Utilization utilization);

    void deleteUtilization(Long id);

    UtilizationStatsDTO getUtilizationStats();

    List<Equipment> getIdleEquipment();
}