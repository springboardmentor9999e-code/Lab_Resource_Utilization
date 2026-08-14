package com.example.hello.service;

import com.example.hello.entity.Institution;
import com.example.hello.entity.User;
import com.example.hello.repository.InstitutionRepository;
import com.example.hello.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collections;

@Service
public class InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private UserRepository userRepository;


    public List<Institution> getInstitutionsForUser(String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getInstitutionId() == null) {
            return Collections.emptyList();
        }

        Integer institutionId = user.getInstitutionId();

        Institution institution =
                institutionRepository.findById(institutionId).orElse(null);

        if (institution == null) {
            return Collections.emptyList();
        }

        return List.of(institution);
    }


    public Institution saveInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }


    public void deleteInstitution(Integer id) {
        institutionRepository.deleteById(id);
    }
}