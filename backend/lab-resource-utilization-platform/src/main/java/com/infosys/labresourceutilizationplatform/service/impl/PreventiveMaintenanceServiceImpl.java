package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.PreventiveMaintenance;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.PreventiveMaintenanceRepository;
import com.infosys.labresourceutilizationplatform.service.PreventiveMaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PreventiveMaintenanceServiceImpl implements PreventiveMaintenanceService {

    @Autowired
    private PreventiveMaintenanceRepository preventiveMaintenanceRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Override
    public PreventiveMaintenance scheduleMaintenance(Long equipmentId, String scheduledDate, String description) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        PreventiveMaintenance pm = new PreventiveMaintenance();
        pm.setEquipment(equipment);
        pm.setScheduledDate(LocalDate.parse(scheduledDate));
        pm.setDescription(description);
        pm.setStatus("SCHEDULED");

        return preventiveMaintenanceRepository.save(pm);
    }

    @Override
    public List<PreventiveMaintenance> getAllSchedules() {
        return preventiveMaintenanceRepository.findAll();
    }

    @Override
    public PreventiveMaintenance updateMaintenanceStatus(Long id, String status, String remarks) {
        PreventiveMaintenance pm = preventiveMaintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Preventive maintenance schedule not found"));

        pm.setStatus(status);
        pm.setRemarks(remarks);

        if ("COMPLETED".equalsIgnoreCase(status)) {
            // When marked as completed, change equipment status back to Available
            Equipment eq = pm.getEquipment();
            if (eq != null) {
                eq.setStatus("Available");
                equipmentRepository.save(eq);
            }
        }

        return preventiveMaintenanceRepository.save(pm);
    }
}
