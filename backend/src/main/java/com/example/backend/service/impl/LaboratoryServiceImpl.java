package com.example.backend.service.impl;

import com.example.backend.entity.Laboratory;
import com.example.backend.repository.LaboratoryRepository;
import com.example.backend.service.LaboratoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratoryServiceImpl implements LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;

    public LaboratoryServiceImpl(LaboratoryRepository laboratoryRepository) {
        this.laboratoryRepository = laboratoryRepository;
    }

    @Override
    public Laboratory saveLaboratory(Laboratory laboratory) {
        return laboratoryRepository.save(laboratory);
    }

    @Override
    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }

    @Override
    public Laboratory getLaboratoryById(Integer id) {
        return laboratoryRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteLaboratory(Integer id) {
        laboratoryRepository.deleteById(id);
    }
}