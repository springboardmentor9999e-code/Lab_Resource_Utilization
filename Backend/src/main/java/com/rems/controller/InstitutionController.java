package com.rems.controller;

import com.rems.dto.InstitutionRequest;
import com.rems.dto.InstitutionResponse;
import com.rems.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    // POST /api/institutions/register  -> created with status PENDING (public)
    @PostMapping("/register")
    public ResponseEntity<InstitutionResponse> register(@Valid @RequestBody InstitutionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institutionService.register(request));
    }

    // GET /api/institutions/pending  -> System Administrator only
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('manage_all_institutions')")
    public ResponseEntity<List<InstitutionResponse>> getPending() {
        return ResponseEntity.ok(institutionService.getPending());
    }

    // PATCH /api/institutions/{id}/approve  -> System Administrator only, PENDING -> ACTIVE
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('manage_all_institutions')")
    public ResponseEntity<InstitutionResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.approve(id));
    }
}
