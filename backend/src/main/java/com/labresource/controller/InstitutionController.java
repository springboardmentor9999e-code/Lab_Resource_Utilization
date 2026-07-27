package com.labresource.controller;

import com.labresource.dto.response.InstitutionResponse;
import com.labresource.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Institution lookup for the sharing module — list only, all authenticated users.
 */
@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    @GetMapping
    public ResponseEntity<List<InstitutionResponse>> getInstitutions() {
        List<InstitutionResponse> institutions = institutionRepository.findAll().stream()
                .map(i -> InstitutionResponse.builder()
                        .institutionId(i.getInstitutionId())
                        .name(i.getName())
                        .code(i.getCode())
                        .email(i.getEmail())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(institutions);
    }
}
