package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.RoleChangeRequest;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.enums.RoleChangeStatus;
import com.labplatform.labresourceplatform.repository.RoleChangeRequestRepository;
import com.labplatform.labresourceplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoleChangeRequestService {

    private final RoleChangeRequestRepository roleChangeRequestRepository;
    private final UserRepository userRepository;

    public RoleChangeRequestService(RoleChangeRequestRepository roleChangeRequestRepository,
                                     UserRepository userRepository) {
        this.roleChangeRequestRepository = roleChangeRequestRepository;
        this.userRepository = userRepository;
    }

    // Creates a pending request, or replaces an existing pending one for the same
    // user (only one pending request per user at a time - a newer registration
    // attempt/role pick supersedes an older undecided one rather than stacking up).
    public RoleChangeRequest createOrReplacePending(User user, Role requestedRole) {
        roleChangeRequestRepository.findFirstByUser_UserIdAndStatus(user.getUserId(), RoleChangeStatus.PENDING)
                .ifPresent(existing -> {
                    existing.setStatus(RoleChangeStatus.REJECTED);
                    existing.setReviewedAt(LocalDateTime.now());
                    roleChangeRequestRepository.save(existing);
                });

        RoleChangeRequest request = new RoleChangeRequest();
        request.setUser(user);
        request.setRequestedRole(requestedRole);
        request.setStatus(RoleChangeStatus.PENDING);
        return roleChangeRequestRepository.save(request);
    }

    // SYSTEM_ADMINISTRATOR sees every pending request; INSTITUTION_ADMINISTRATOR
    // only sees pending requests from users in their own institution.
    public List<RoleChangeRequest> getPendingRequests(User currentUser) {
        if (currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            return roleChangeRequestRepository.findByStatus(RoleChangeStatus.PENDING);
        }
        Long institutionId = currentUser.getInstitution() != null
                ? currentUser.getInstitution().getInstitutionId()
                : null;
        return roleChangeRequestRepository.findByStatusAndUser_Institution_InstitutionId(
                RoleChangeStatus.PENDING, institutionId);
    }

    public RoleChangeRequest getById(Long id) {
        return roleChangeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role change request not found with id: " + id));
    }

    // Enforces that an INSTITUTION_ADMINISTRATOR may only decide on requests from
    // their own institution; SYSTEM_ADMINISTRATOR may decide on any.
    public void assertCanReview(User reviewer, RoleChangeRequest request) {
        if (reviewer.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            return;
        }
        Long reviewerInstitutionId = reviewer.getInstitution() != null ? reviewer.getInstitution().getInstitutionId() : null;
        Long requesterInstitutionId = request.getUser().getInstitution() != null
                ? request.getUser().getInstitution().getInstitutionId()
                : null;
        if (reviewerInstitutionId == null || !reviewerInstitutionId.equals(requesterInstitutionId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only review role change requests within your own institution");
        }
    }

    public RoleChangeRequest approve(Long id, User reviewer) {
        RoleChangeRequest request = getById(id);
        assertCanReview(reviewer, request);

        request.setStatus(RoleChangeStatus.APPROVED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        RoleChangeRequest saved = roleChangeRequestRepository.save(request);

        User user = saved.getUser();
        user.setRole(saved.getRequestedRole());
        userRepository.save(user);

        return saved;
    }

    public RoleChangeRequest reject(Long id, User reviewer) {
        RoleChangeRequest request = getById(id);
        assertCanReview(reviewer, request);

        request.setStatus(RoleChangeStatus.REJECTED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        return roleChangeRequestRepository.save(request);
    }
}
