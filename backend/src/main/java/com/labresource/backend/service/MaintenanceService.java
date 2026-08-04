package com.labresource.backend.service;

import com.labresource.backend.dto.MaintenanceRequest;
import com.labresource.backend.entity.Equipment;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.repository.UserRepository;
import com.labresource.backend.entity.Maintenance;
import com.labresource.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public MaintenanceService(
        MaintenanceRepository maintenanceRepository,
        EquipmentRepository equipmentRepository,
        UserRepository userRepository) {

    this.maintenanceRepository = maintenanceRepository;
    this.equipmentRepository = equipmentRepository;
    this.userRepository = userRepository;
}

    // Create
    public Maintenance createMaintenance(MaintenanceRequest request) {

            Equipment equipment = equipmentRepository
                    .findById(request.getEquipmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Equipment Not Found"));
                    equipment.setStatus("Under Maintenance");
                    equipmentRepository.save(equipment);

            User user = userRepository
                    .findById(request.getReportedById())
                    .orElseThrow(() ->
                            new RuntimeException("User Not Found"));

            Maintenance maintenance = new Maintenance();

            maintenance.setEquipment(equipment);
            maintenance.setReportedBy(user);

            maintenance.setIssueDescription(request.getIssueDescription());

            maintenance.setStatus(request.getStatus());

            maintenance.setReportedDate(request.getReportedDate());

            return maintenanceRepository.save(maintenance);
        }

    // Get All
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    // Get By Id
    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Maintenance not found"));
    }

    // Update
    public Maintenance updateMaintenance(Long id, MaintenanceRequest request) {

        Maintenance existing = getMaintenanceById(id);

        existing.setIssueDescription(request.getIssueDescription());

        existing.setStatus(request.getStatus());

        if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {

            existing.setResolvedDate(java.time.LocalDate.now());

            Equipment equipment = existing.getEquipment();

            equipment.setStatus("Available");

            equipmentRepository.save(equipment);

        }

        return maintenanceRepository.save(existing);
    }

    // Delete
    public void deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
    }
    public List<Maintenance> getMaintenanceByInstitution(Long institutionId) {

            return maintenanceRepository
                    .findByEquipmentLaboratoryInstitutionInstitutionId(institutionId);

        }
}