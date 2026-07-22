package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.repository.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    public InstitutionService(InstitutionRepository institutionRepository){
        this.institutionRepository=institutionRepository;
    }

    public List<Institution> getAllInstitutions(){
        return institutionRepository.findAll();
    }

    public Institution getInstitutionById(Long id){
        return institutionRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Institution not found with Id: "+id));
    }

    public Institution createInstitution(Institution institution){
        return institutionRepository.save(institution);
    }

    public Institution updateInstitution(Long  id, Institution updatedInstitution){

        Institution existing = getInstitutionById(id);

        if(updatedInstitution.getInstitutionName()!=null)
            existing.setInstitutionName(updatedInstitution.getInstitutionName());
        if(updatedInstitution.getAddress()!=null)
            existing.setAddress(updatedInstitution.getAddress());
        if(updatedInstitution.getContactPhone()!=null)
            existing.setContactPhone(updatedInstitution.getContactPhone());
        if(updatedInstitution.getContactEmail()!=null)
            existing.setContactEmail(updatedInstitution.getContactEmail());

        return institutionRepository.save(existing);
    }

    public void deleteInstitution(Long id){
        Institution institution = getInstitutionById(id);
        institutionRepository.delete(institution);
    }
}