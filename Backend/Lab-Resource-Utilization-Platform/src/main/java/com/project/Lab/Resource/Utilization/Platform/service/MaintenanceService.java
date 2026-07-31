package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.MaintenanceRequestDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.MaintenanceResponseDTO;
import com.project.Lab.Resource.Utilization.Platform.entity.Maintenance;
import com.project.Lab.Resource.Utilization.Platform.repository.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    // Create Maintenance
    public MaintenanceResponseDTO create(MaintenanceRequestDTO dto){

        Maintenance maintenance = new Maintenance();

        maintenance.setEquipmentId(dto.getEquipmentId());
        maintenance.setTechnicianId(dto.getTechnicianId());
        maintenance.setReportedBy(dto.getReportedBy());
        maintenance.setIssue(dto.getIssue());
        maintenance.setMaintenanceType(dto.getMaintenanceType());
        maintenance.setIssueDescription(dto.getIssueDescription());
        maintenance.setRemarks(dto.getRemarks());

        maintenance.setStatus("PENDING");
        maintenance.setScheduledDate(dto.getScheduledDate());
        maintenance.setCreatedAt(LocalDateTime.now());

        Maintenance saved = maintenanceRepository.save(maintenance);

        return map(saved);
    }

    // Get All
    public List<MaintenanceResponseDTO> getAll(){

        return maintenanceRepository.findAll()
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    // Get By Id
    public MaintenanceResponseDTO getById(Integer id){

        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Maintenance not found"));

        return map(maintenance);
    }

    // Get By Equipment
    public List<MaintenanceResponseDTO> getByEquipment(Integer equipmentId){

        return maintenanceRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    // Get By Technician
    public List<MaintenanceResponseDTO> getByTechnician(Integer technicianId){

        return maintenanceRepository.findByTechnicianId(technicianId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    // Get By Status
    public List<MaintenanceResponseDTO> getByStatus(String status){

        return maintenanceRepository.findByStatus(status)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }
    // Complete Maintenance
    public MaintenanceResponseDTO complete(Integer id, String remarks) {

        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Maintenance not found"));

        maintenance.setStatus("COMPLETED");
        maintenance.setCompletedDate(LocalDate.now());
        maintenance.setRemarks(remarks);

        Maintenance updated = maintenanceRepository.save(maintenance);

        return map(updated);
    }

    // DTO Mapper
    private MaintenanceResponseDTO map(Maintenance maintenance) {

        return new MaintenanceResponseDTO(
                maintenance.getMaintenanceId(),
                maintenance.getEquipmentId(),
                maintenance.getTechnicianId(),
                maintenance.getReportedBy(),
                maintenance.getIssue(),
                maintenance.getMaintenanceType(),
                maintenance.getIssueDescription(),
                maintenance.getStatus(),
                maintenance.getScheduledDate(),
                maintenance.getCompletedDate(),
                maintenance.getRemarks(),
                maintenance.getCreatedAt()
        );
    }

}