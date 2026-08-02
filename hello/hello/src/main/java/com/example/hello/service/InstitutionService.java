package com.example.hello.service;

import com.example.hello.entity.Institution;
import com.example.hello.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Sort;
@Service
public class InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll(Sort.by("institutionId"));
    }

    public Institution saveInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    public void deleteInstitution(Integer id) {
        institutionRepository.deleteById(id);
    }
}