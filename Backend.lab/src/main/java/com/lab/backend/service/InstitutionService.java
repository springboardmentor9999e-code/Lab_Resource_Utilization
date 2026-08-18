package com.lab.backend.service;

import com.lab.backend.entity.Institution;
import com.lab.backend.exception.ResourceNotFoundException;
import com.lab.backend.repository.InstitutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
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
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));
    }

    public Institution updateInstitution(Long id, Institution updated) {
        Institution existing = getInstitutionById(id);
        existing.setName(updated.getName());
        existing.setCode(updated.getCode());
        existing.setContactEmail(updated.getContactEmail());
        existing.setAddress(updated.getAddress());
        return institutionRepository.save(existing);
    }

    public void deleteInstitution(Long id) {
        institutionRepository.deleteById(id);
    }
}
