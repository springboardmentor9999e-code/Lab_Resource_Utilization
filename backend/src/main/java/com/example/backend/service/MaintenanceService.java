package com.example.backend.service;

import com.example.backend.entity.Maintenance;
import java.util.List;

public interface MaintenanceService {

    List<Maintenance> getAllMaintenance();

    Maintenance getMaintenanceById(Integer id);

    Maintenance saveMaintenance(Maintenance maintenance);

    Maintenance updateMaintenance(Integer id, Maintenance maintenance);

    void deleteMaintenance(Integer id);
}