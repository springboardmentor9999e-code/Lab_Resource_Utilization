package com.labhub.service;

import com.labhub.entity.Partnership;
import com.labhub.enums.PartnershipStatus;

import java.util.List;
import java.util.UUID;

public interface PartnershipService {
    Partnership requestPartnership(String userEmail, UUID targetInstitutionId, String notes);
    List<Partnership> getIncomingRequests(String userEmail);
    List<Partnership> getOutgoingRequests(String userEmail);
    List<Partnership> getAllPartnerships(String userEmail);
    Partnership updatePartnershipStatus(UUID partnershipId, PartnershipStatus status, String userEmail);
}
