package com.lab.backend.service;

import com.lab.backend.entity.*;
import com.lab.backend.enums.*;
import com.lab.backend.repository.*;
import com.lab.backend.dto.ResourceSharingRequestDTO;
import com.lab.backend.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ResourceSharingService {
    
    @Autowired
    private ResourceSharingRequestRepository sharingRequestRepo;
    @Autowired
    private InstitutionPartnershipRepository partnershipRepo;
    @Autowired
    private EquipmentRepository equipmentRepo;
    @Autowired
    private LaboratoryRepository laboratoryRepo;
    @Autowired
    private BookingRepository bookingRepo;
    
    // Step 1: Submit sharing request
    public ResourceSharingRequest requestResourceShare(ResourceSharingRequestDTO dto) {
        
        // Validate equipment exists
        Equipment equipment = equipmentRepo.findById(dto.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        
        // Get laboratories
        Laboratory providerLab = equipment.getLaboratory();
        Laboratory requestingLab = laboratoryRepo.findById(dto.getRequestingInstId())
            .orElseThrow(() -> new InstitutionNotFoundException("Requesting laboratory not found"));
        
        // Validate partnership exists and is ACTIVE
        InstitutionPartnership partnership = partnershipRepo
            .findByInstitutions(providerLab.getId(), requestingLab.getId())
            .orElseThrow(() -> new PartnershipNotActiveException("No partnership between laboratories"));
        
        if (!partnership.getApprovalStatus().equals(ApprovalStatus.ACTIVE)) {
            throw new PartnershipNotActiveException("Partnership not active");
        }
        
        // Check quota
        Integer activeCount = sharingRequestRepo.countActiveSharesByMonth(
            providerLab.getId(), requestingLab.getId(), dto.getStartDate());
        
        if (activeCount >= partnership.getSharingQuota()) {
            throw new QuotaExceededException("Monthly sharing quota exceeded");
        }
        
        // Check date conflict
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        
        // Create and save request
        ResourceSharingRequest request = new ResourceSharingRequest();
        request.setEquipment(equipment);
        request.setRequestingLaboratory(requestingLab);
        request.setProviderLaboratory(providerLab);
        request.setStartDate(dto.getStartDate());
        request.setEndDate(dto.getEndDate());
        request.setPurpose(dto.getPurpose());
        request.setStatus(SharingStatus.PENDING);
        
        return sharingRequestRepo.save(request);
    }
    
    // Step 2: Get pending requests (for admin approval)
    public List<ResourceSharingRequest> getPendingRequests() {
        return sharingRequestRepo.findByStatusOrderByDate(SharingStatus.PENDING);
    }
    
    // Step 3: Approve sharing request
    public ResourceSharingRequest approveSharingRequest(Long requestId) {
        ResourceSharingRequest request = sharingRequestRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        
        // Check equipment availability
        long conflicts = bookingRepo.countConflictingBookings(
            request.getEquipment().getId(),
            request.getStartDate(),
            request.getEndDate());
        
        if (conflicts > 0) {
            throw new ResourceNotAvailableException("Equipment not available for requested dates");
        }
        
        request.setStatus(SharingStatus.APPROVED);
        return sharingRequestRepo.save(request);
    }
    
    // Step 4: Activate approved request (after provider confirms)
    public ResourceSharingRequest activateSharingRequest(Long requestId) {
        ResourceSharingRequest request = sharingRequestRepo.findById(requestId)
            .orElseThrow();
        
        if (!request.getStatus().equals(SharingStatus.APPROVED)) {
            throw new IllegalStateException("Only approved requests can be activated");
        }
        
        request.setStatus(SharingStatus.ACTIVE);
        return sharingRequestRepo.save(request);
    }
    
    // Step 5: Reject request
    public ResourceSharingRequest rejectSharingRequest(Long requestId, String reason) {
        ResourceSharingRequest request = sharingRequestRepo.findById(requestId)
            .orElseThrow();
        
        request.setStatus(SharingStatus.REJECTED);
        return sharingRequestRepo.save(request);
    }
}
