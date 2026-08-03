package com.labresource.controller;

import com.labresource.dto.RequestCreateDto;
import com.labresource.entity.EquipmentRequestEntity;
import com.labresource.entity.RequestStatus;
import com.labresource.repository.RequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestRepository requestRepository;

    public RequestController(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    // Any logged-in user can SUBMIT a request (e.g. a student requesting equipment access)
    @PostMapping
    public ResponseEntity<EquipmentRequestEntity> createRequest(
            @RequestBody RequestCreateDto dto,
            Authentication authentication) {

        String requesterEmail = authentication.getName(); // comes from the JWT filter (email was set as the "principal")

        EquipmentRequestEntity request = EquipmentRequestEntity.builder()
                .equipmentName(dto.getEquipmentName())
                .requestedBy(requesterEmail)
                .status(RequestStatus.PENDING)
                .build();

        return ResponseEntity.ok(requestRepository.save(request));
    }

    // Anyone logged in can VIEW all requests
    @GetMapping
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(requestRepository.findAll());
    }

    // Only DEPARTMENT_HEAD can APPROVE a request
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<EquipmentRequestEntity> approveRequest(@PathVariable Long id) {

        EquipmentRequestEntity request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.APPROVED);
        return ResponseEntity.ok(requestRepository.save(request));
    }

    // Only DEPARTMENT_HEAD can REJECT a request
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<EquipmentRequestEntity> rejectRequest(@PathVariable Long id) {

        EquipmentRequestEntity request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        return ResponseEntity.ok(requestRepository.save(request));
    }
}
