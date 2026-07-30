package com.labhub.service.impl;

import com.labhub.dto.rolerequest.RoleRequestCreate;
import com.labhub.dto.rolerequest.RoleRequestResponse;
import com.labhub.entity.RoleRequest;
import com.labhub.entity.Role;
import com.labhub.entity.User;
import com.labhub.enums.RoleName;
import com.labhub.enums.RoleRequestStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.RoleRepository;
import com.labhub.repository.RoleRequestRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.RoleRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleRequestServiceImpl implements RoleRequestService {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public RoleRequestResponse submit(RoleRequestCreate request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Get the user's primary role
        RoleName currentRole = user.getRoles().stream()
                .map(r -> r.getName())
                .findFirst()
                .orElse(RoleName.RESEARCHER);

        // Check for existing pending request
        if (roleRequestRepository.existsByUserAndStatus(user, RoleRequestStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending role request");
        }

        RoleRequest roleRequest = RoleRequest.builder()
                .user(user)
                .currentRole(currentRole)
                .requestedRole(request.getRequestedRole())
                .reason(request.getReason())
                .status(RoleRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .isActive(true)
                .build();

        roleRequest = roleRequestRepository.save(roleRequest);
        log.info("Role request submitted by {} for role {}", email, request.getRequestedRole());
        return toResponse(roleRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleRequestResponse> getAll() {
        return roleRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleRequestResponse> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return roleRequestRepository.findByUserOrderByRequestedAtDesc(user)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RoleRequestResponse approve(UUID id, String reviewerEmail) {
        RoleRequest roleRequest = roleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoleRequest", "id", id.toString()));
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        roleRequest.setStatus(RoleRequestStatus.APPROVED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        roleRequest.setReviewedBy(reviewer);

        // Update the user's role
        User targetUser = roleRequest.getUser();
        Role newRole = roleRepository.findByName(roleRequest.getRequestedRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleRequest.getRequestedRole().name()));

        targetUser.getRoles().clear();
        targetUser.getRoles().add(newRole);
        userRepository.save(targetUser);

        roleRequestRepository.save(roleRequest);
        log.info("Role request {} approved by {}", id, reviewerEmail);
        return toResponse(roleRequest);
    }

    @Override
    @Transactional
    public RoleRequestResponse reject(UUID id, String reviewerEmail, String reason) {
        RoleRequest roleRequest = roleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoleRequest", "id", id.toString()));
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        roleRequest.setStatus(RoleRequestStatus.REJECTED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        roleRequest.setReviewedBy(reviewer);

        roleRequestRepository.save(roleRequest);
        log.info("Role request {} rejected by {}", id, reviewerEmail);
        return toResponse(roleRequest);
    }

    private RoleRequestResponse toResponse(RoleRequest r) {
        return RoleRequestResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userFirstName(r.getUser().getFirstName())
                .userLastName(r.getUser().getLastName())
                .userEmail(r.getUser().getEmail())
                .currentRole(r.getCurrentRole())
                .requestedRole(r.getRequestedRole())
                .reason(r.getReason())
                .status(r.getStatus())
                .requestedAt(r.getRequestedAt())
                .reviewedAt(r.getReviewedAt())
                .reviewedByEmail(r.getReviewedBy() != null ? r.getReviewedBy().getEmail() : null)
                .build();
    }
}
