package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Maintenance;
import com.example.labresourceplatform.repository.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    public Maintenance saveMaintenance(Maintenance maintenance) {
        return maintenanceRepository.save(maintenance);
    }

    public List<Maintenance> getDueTomorrowMaintenance() {

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        return maintenanceRepository.findAll()
                .stream()
                .filter(m -> m.getNextMaintenanceDate() != null)
                .filter(m -> m.getNextMaintenanceDate().equals(tomorrow))
                .collect(Collectors.toList());
    }
}