package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Institution;
import com.infosys.labresourceutilizationplatform.repository.InstitutionRepository;
import com.infosys.labresourceutilizationplatform.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionServiceImpl implements InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Override
    public Institution addInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    @Override
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    @Override
    public Institution getInstitutionById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    @Override
    public Institution updateInstitution(Long id, Institution institution) {

        Institution existingInstitution = getInstitutionById(id);

        existingInstitution.setInstitutionName(institution.getInstitutionName());
        existingInstitution.setInstitutionCode(institution.getInstitutionCode());
        existingInstitution.setAddress(institution.getAddress());
        existingInstitution.setCity(institution.getCity());
        existingInstitution.setState(institution.getState());
        existingInstitution.setPincode(institution.getPincode());
        existingInstitution.setContactEmail(institution.getContactEmail());
        existingInstitution.setContactPhone(institution.getContactPhone());
        existingInstitution.setWebsite(institution.getWebsite());
        existingInstitution.setStatus(institution.getStatus());

        return institutionRepository.save(existingInstitution);
    }

    @Override
    public void deleteInstitution(Long id) {

        Institution institution = getInstitutionById(id);

        institutionRepository.delete(institution);
    }
}