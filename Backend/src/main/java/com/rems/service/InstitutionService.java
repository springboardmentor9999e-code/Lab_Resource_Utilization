package com.rems.service;

import com.rems.dto.InstitutionRequest;
import com.rems.dto.InstitutionResponse;
import com.rems.entity.Institution;
import com.rems.enums.InstitutionStatus;
import com.rems.exception.ApiException;
import com.rems.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    @Transactional
    public InstitutionResponse register(InstitutionRequest request) {

        if(institutionRepository.existsByContactEmail(request.getContactEmail())){
            throw new ApiException("Email is already registered", HttpStatus.CONFLICT);
        }
        Institution institution = Institution.builder()
                .name(request.getName())
                .type(request.getType())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .status(InstitutionStatus.PENDING)
                .build();

        return toResponse(institutionRepository.save(institution));
    }

    public List<InstitutionResponse> getPending() {
        return institutionRepository.findByStatus(InstitutionStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InstitutionResponse approve(Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ApiException("Institution not found", HttpStatus.NOT_FOUND));

        institution.setStatus(InstitutionStatus.ACTIVE);
        return toResponse(institutionRepository.save(institution));
    }

    private InstitutionResponse toResponse(Institution institution) {
        return InstitutionResponse.builder()
                .institutionId(institution.getInstitutionId())
                .name(institution.getName())
                .type(institution.getType())
                .address(institution.getAddress())
                .contactEmail(institution.getContactEmail())
                .contactPhone(institution.getContactPhone())
                .status(institution.getStatus().name())
                .createdAt(institution.getCreatedAt())
                .build();
    }
}
