package com.lab.backend.service;

import com.lab.backend.entity.Laboratory;
import com.lab.backend.repository.LaboratoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;


    public LaboratoryService(LaboratoryRepository laboratoryRepository) {
        this.laboratoryRepository = laboratoryRepository;
    }


    // Create Laboratory
    public Laboratory createLaboratory(Laboratory laboratory) {
        return laboratoryRepository.save(laboratory);
    }


    // Get All Laboratories
    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }


    // Get Laboratory By ID
    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Laboratory not found"));
    }


    // Update Laboratory
    public Laboratory updateLaboratory(Long id, Laboratory laboratory) {

        Laboratory existing = getLaboratoryById(id);

        existing.setLabName(laboratory.getLabName());
        existing.setLocation(laboratory.getLocation());
        existing.setDescription(laboratory.getDescription());
        existing.setCapacity(laboratory.getCapacity());
        existing.setStatus(laboratory.getStatus());

        return laboratoryRepository.save(existing);
    }


    // Delete Laboratory
    public void deleteLaboratory(Long id) {
        laboratoryRepository.deleteById(id);
    }
}