package com.labresource.backend.service;

import com.labresource.backend.dto.LaboratoryRequest;
import com.labresource.backend.entity.Laboratory;
import com.labresource.backend.repository.LaboratoryRepository;
import org.springframework.stereotype.Service;
import com.labresource.backend.entity.Institution;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.InstitutionRepository;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;


import java.util.List;

@Service
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;
private final UserRepository userRepository;
private final InstitutionRepository institutionRepository;

public LaboratoryService(
        LaboratoryRepository laboratoryRepository,
        UserRepository userRepository,
        InstitutionRepository institutionRepository) {

    this.laboratoryRepository = laboratoryRepository;
    this.userRepository = userRepository;
    this.institutionRepository = institutionRepository;
}

    // Get all laboratories
    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }

    // Get laboratory by ID
    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Laboratory not found"));
    }

    // Create laboratory
    public Laboratory createLaboratory(
        LaboratoryRequest request,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Laboratory laboratory = new Laboratory();

    laboratory.setLabName(request.getLabName());
    laboratory.setLabCode(request.getLabCode());
    laboratory.setLocation(request.getLocation());
    laboratory.setCapacity(request.getCapacity());
    laboratory.setStatus(request.getStatus());

    laboratory.setInstitution(user.getInstitution());

    return laboratoryRepository.save(laboratory);
}

    // Update laboratory
    public Laboratory updateLaboratory(Long id, LaboratoryRequest request) {

        Laboratory laboratory = getLaboratoryById(id);

        laboratory.setLabName(request.getLabName());
        laboratory.setLabCode(request.getLabCode());
        laboratory.setLocation(request.getLocation());
        laboratory.setCapacity(request.getCapacity());
        laboratory.setStatus(request.getStatus());

        return laboratoryRepository.save(laboratory);
    }

    // Delete laboratory
    public void deleteLaboratory(Long id) {
        laboratoryRepository.deleteById(id);
    }
    public List<Laboratory> getLaboratoriesByInstitution(Long institutionId) {

    return laboratoryRepository.findByInstitutionInstitutionId(institutionId);

}

public Laboratory updateLaboratoryByInstitution(
        Long institutionId,
        Long labId,
        LaboratoryRequest request) {

    Laboratory laboratory = getLaboratoryById(labId);

    if (!laboratory.getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    laboratory.setLabName(request.getLabName());
    laboratory.setLabCode(request.getLabCode());
    laboratory.setLocation(request.getLocation());
    laboratory.setCapacity(request.getCapacity());
    laboratory.setStatus(request.getStatus());

    return laboratoryRepository.save(laboratory);
}

public void deleteLaboratoryByInstitution(
        Long institutionId,
        Long labId) {

    Laboratory laboratory = getLaboratoryById(labId);

    if (!laboratory.getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    laboratoryRepository.delete(laboratory);
}
}