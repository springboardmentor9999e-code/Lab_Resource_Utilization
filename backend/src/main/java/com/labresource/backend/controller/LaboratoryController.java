package com.labresource.backend.controller;

import com.labresource.backend.dto.LaboratoryRequest;
import com.labresource.backend.entity.Laboratory;
import com.labresource.backend.service.LaboratoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
@CrossOrigin(origins = "*")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;
    private final UserRepository userRepository;

    public LaboratoryController(
            LaboratoryService laboratoryService,
            UserRepository userRepository) {

        this.laboratoryService = laboratoryService;
        this.userRepository = userRepository;
    }

    // Get all laboratories
    @GetMapping
    public ResponseEntity<List<Laboratory>> getAllLaboratories() {
        return ResponseEntity.ok(laboratoryService.getAllLaboratories());
    }

    // Get laboratory by ID
    @GetMapping("/{id}")
    public ResponseEntity<Laboratory> getLaboratoryById(@PathVariable Long id) {
        return ResponseEntity.ok(laboratoryService.getLaboratoryById(id));
    }

    // Create laboratory
    @PostMapping
public ResponseEntity<Laboratory> createLaboratory(
        @RequestBody LaboratoryRequest request,
        Authentication authentication) {

    return ResponseEntity.ok(
            laboratoryService.createLaboratory(
                    request,
                    authentication
            )
    );
}

    @PutMapping("/{id}")
public ResponseEntity<Laboratory> updateLaboratory(
        @PathVariable Long id,
        @RequestBody LaboratoryRequest request,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow();

    if ("SYSTEM_ADMIN".equals(user.getRole().getRoleName())) {

        return ResponseEntity.ok(
                laboratoryService.updateLaboratory(id, request));

    } else {

        return ResponseEntity.ok(
                laboratoryService.updateLaboratoryByInstitution(
                        user.getInstitution().getInstitutionId(),
                        id,
                        request
                )
        );
    }
}

    @DeleteMapping("/{id}")
public ResponseEntity<String> deleteLaboratory(
        @PathVariable Long id,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow();

    if ("SYSTEM_ADMIN".equals(user.getRole().getRoleName())) {

        laboratoryService.deleteLaboratory(id);

    } else {

        laboratoryService.deleteLaboratoryByInstitution(
                user.getInstitution().getInstitutionId(),
                id
        );
    }

    return ResponseEntity.ok("Laboratory deleted successfully");
}

    @GetMapping("/institution/{institutionId}")
            public ResponseEntity<List<Laboratory>> getLaboratoriesByInstitution(
                    @PathVariable Long institutionId) {

                return ResponseEntity.ok(
                        laboratoryService.getLaboratoriesByInstitution(institutionId)
                );

            }

        @GetMapping("/institution")
public List<Laboratory> getLaboratoriesByInstitution(
        Principal principal) {

    String email = principal.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Long institutionId =
            user.getInstitution().getInstitutionId();

    return laboratoryService
            .getLaboratoriesByInstitution(institutionId);
}
}