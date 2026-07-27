package com.labresource.service.interfaces;

import com.labresource.entity.Institution;

import java.util.List;

public interface InstitutionService {
    
    Institution createInstitution(Institution institution);
    
    List<Institution> getAllInstitutions();
    
    Institution getInstitutionById(Long id);
    
}