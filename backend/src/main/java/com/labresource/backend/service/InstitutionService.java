package com.labresource.backend.service;

import com.labresource.backend.entity.Institution;
import com.labresource.backend.repository.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public InstitutionService(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    public Institution createInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public Institution getInstitutionById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    public Institution updateInstitution(Long id, Institution institution) {

        Institution existing = getInstitutionById(id);

        existing.setInstitutionName(institution.getInstitutionName());
        existing.setCity(institution.getCity());
        existing.setState(institution.getState());
        existing.setEmail(institution.getEmail());
        existing.setPhone(institution.getPhone());
        existing.setType(institution.getType());

        return institutionRepository.save(existing);
    }

    public void deleteInstitution(Long id) {
        institutionRepository.deleteById(id);
    }
}