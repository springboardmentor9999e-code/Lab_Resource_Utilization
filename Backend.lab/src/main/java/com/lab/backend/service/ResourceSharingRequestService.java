package com.lab.backend.service;

import com.lab.backend.dto.ResourceSharingRequestDTO;
import com.lab.backend.entity.ResourceSharingRequest;
import com.lab.backend.enums.SharingStatus;
import com.lab.backend.exception.ResourceNotFoundException;
import com.lab.backend.repository.ResourceSharingRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResourceSharingRequestService {

    private final ResourceSharingRequestRepository resourceSharingRequestRepository;
    private final ResourceSharingService resourceSharingService;

    public ResourceSharingRequestService(ResourceSharingRequestRepository resourceSharingRequestRepository,
                                         ResourceSharingService resourceSharingService) {
        this.resourceSharingRequestRepository = resourceSharingRequestRepository;
        this.resourceSharingService = resourceSharingService;
    }

    public ResourceSharingRequest createRequest(ResourceSharingRequestDTO dto) {
        return resourceSharingService.requestResourceShare(dto);
    }

    public List<ResourceSharingRequest> getAllRequests() {
        return resourceSharingRequestRepository.findAll();
    }

    public ResourceSharingRequest getRequestById(Long id) {
        return resourceSharingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource sharing request not found with ID: " + id));
    }

    public List<ResourceSharingRequest> getPendingRequests() {
        return resourceSharingService.getPendingRequests();
    }

    public List<ResourceSharingRequest> getRequestsByStatus(SharingStatus status) {
        return resourceSharingRequestRepository.findByStatus(status);
    }

    public List<ResourceSharingRequest> getRequestsByRequestingLab(Long labId) {
        return resourceSharingRequestRepository.findByRequestingLaboratoryId(labId);
    }

    public List<ResourceSharingRequest> getRequestsByProviderLab(Long labId) {
        return resourceSharingRequestRepository.findByProviderLaboratoryId(labId);
    }

    public ResourceSharingRequest approveRequest(Long id) {
        return resourceSharingService.approveSharingRequest(id);
    }

    public ResourceSharingRequest activateRequest(Long id) {
        return resourceSharingService.activateSharingRequest(id);
    }

    public ResourceSharingRequest rejectRequest(Long id, String reason) {
        return resourceSharingService.rejectSharingRequest(id, reason);
    }

    public void deleteRequest(Long id) {
        ResourceSharingRequest request = getRequestById(id);
        resourceSharingRequestRepository.delete(request);
    }
}
