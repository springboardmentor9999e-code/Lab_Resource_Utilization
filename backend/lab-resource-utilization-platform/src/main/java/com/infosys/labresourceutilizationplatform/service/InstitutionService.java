package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Institution;

import java.util.List;

public interface InstitutionService {

    Institution addInstitution(Institution institution);

    List<Institution> getAllInstitutions();

    Institution getInstitutionById(Long id);

    Institution updateInstitution(Long id, Institution institution);

    void deleteInstitution(Long id);

}