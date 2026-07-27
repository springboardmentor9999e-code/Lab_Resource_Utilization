package com.labresource.service.impl;

import com.labresource.entity.Institution;
import com.labresource.repository.InstitutionRepository;
import com.labresource.service.interfaces.InstitutionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionServiceImpl implements InstitutionService {
    
    private final InstitutionRepository institutionRepository;
    
    public InstitutionServiceImpl(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }
    
    @Override
    public Institution createInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }
    
    @Override
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }
    
    @Override
    public Institution getInstitutionById(Long id) {
        return institutionRepository.findById(id).orElse(null);
    }
}