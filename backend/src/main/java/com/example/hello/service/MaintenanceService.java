package com.example.hello.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.hello.entity.Maintenance;
import com.example.hello.repository.MaintenanceRepository;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository repository;

    public List<Maintenance> getAllMaintenance() {
        return repository.findAll(
                Sort.by("maintenanceId")
        );
    }

    public Maintenance saveMaintenance(Maintenance maintenance) {
        return repository.save(maintenance);
    }

    public void deleteMaintenance(Integer id) {
        repository.deleteById(id);
    }
}