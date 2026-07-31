package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.entity.Institution;
import com.project.Lab.Resource.Utilization.Platform.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }
}