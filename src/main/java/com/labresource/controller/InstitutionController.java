package com.labresource.controller;

import com.labresource.dto.InstitutionPublicDto;
import com.labresource.dto.InstitutionRequest;
import com.labresource.entity.Institution;
import com.labresource.repository.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    public InstitutionController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllInstitutions() {
        return ResponseEntity.ok(institutionRepository.findAll());
    }

    // NEW — public, no auth required, minimal fields (id + name only), used by the Register page
    @GetMapping("/public")
    public ResponseEntity<List<InstitutionPublicDto>> getPublicInstitutions() {
        List<InstitutionPublicDto> result = institutionRepository.findAll().stream()
                .map(i -> new InstitutionPublicDto(i.getId(), i.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTITUTION_ADMINISTRATOR')")
    public ResponseEntity<Institution> createInstitution(@RequestBody InstitutionRequest request) {
        Institution institution = Institution.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .build();
        return ResponseEntity.ok(institutionRepository.save(institution));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTITUTION_ADMINISTRATOR')")
    public ResponseEntity<Institution> updateInstitution(
            @PathVariable Long id,
            @RequestBody InstitutionRequest request) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
        institution.setName(request.getName());
        institution.setAddress(request.getAddress());
        institution.setContactEmail(request.getContactEmail());
        return ResponseEntity.ok(institutionRepository.save(institution));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTITUTION_ADMINISTRATOR')")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        institutionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}