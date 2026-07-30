package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Laboratory;
import com.example.labresourceplatform.repository.LaboratoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratoryService {

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    public Laboratory saveLaboratory(Laboratory laboratory) {
        return laboratoryRepository.save(laboratory);
    }

    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }

    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id).orElse(null);
    }

    public void deleteLaboratory(Long id) {
        laboratoryRepository.deleteById(id);
    }
}