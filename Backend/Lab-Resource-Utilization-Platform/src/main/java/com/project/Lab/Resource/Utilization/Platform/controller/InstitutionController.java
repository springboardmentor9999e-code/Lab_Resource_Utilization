package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.Institution;
import com.project.Lab.Resource.Utilization.Platform.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    @Autowired
    private InstitutionService institutionService;

    @GetMapping
    //@PreAuthorize("isAuthenticated()")
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }
}