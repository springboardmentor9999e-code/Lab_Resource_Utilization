package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.Lab;
import com.labplatform.labresourceplatform.repository.InstitutionRepository;
import com.labplatform.labresourceplatform.repository.LabRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabService {

    private final LabRepository labRepository;
    private final InstitutionRepository institutionRepository;

    public LabService(LabRepository labRepository, InstitutionRepository institutionRepository){
        this.labRepository = labRepository;
        this.institutionRepository = institutionRepository;
    }

    public List<Lab> getAllLabs(){
        return labRepository.findAll();
    }

    public List<Lab> getLabsByInstitution(Long institutionId){
        return labRepository.findByInstitution_InstitutionId(institutionId);
    }

    public Lab getLabById(Long id){
        return labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found with id: " + id));
    }

    public Lab createLab(Lab lab){
        // The client only sends { institution: { institutionId: N } }. Re-fetch
        // the real, fully-loaded Institution so the response (and the row shown
        // until a full reload) has the actual institution name, not a bare id.
        if (lab.getInstitution() != null) {
            lab.setInstitution(fetchInstitution(lab.getInstitution().getInstitutionId()));
        }
        return labRepository.save(lab);
    }

    private Institution fetchInstitution(Long institutionId){
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found with id: " + institutionId));
    }

    public Lab updateLab(Long id, Lab updatedLab){

        Lab existing = getLabById(id);

        if(updatedLab.getLabName() != null)
            existing.setLabName(updatedLab.getLabName());

        if(updatedLab.getLocation() != null)
            existing.setLocation(updatedLab.getLocation());

        if(updatedLab.getInstitution() != null)
            // Same re-fetch as createLab() above.
            existing.setInstitution(fetchInstitution(updatedLab.getInstitution().getInstitutionId()));

        return labRepository.save(existing);
    }

    public void deleteLab(Long id){
        labRepository.deleteById(id);
    }
}
