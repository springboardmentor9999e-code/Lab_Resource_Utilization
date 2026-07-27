package com.labresource.service.impl;

import com.labresource.dto.request.ChangePasswordRequest;
import com.labresource.dto.request.UpdateProfileRequest;
import com.labresource.dto.response.UserResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Role;
import com.labresource.entity.UserRole;
import com.labresource.entity.UserRoleId;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.RoleRepository;
import com.labresource.repository.UserRoleRepository;
import com.labresource.security.Roles;
import com.labresource.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    // Roles a user may be granted through the admin console
    private static final Set<String> ASSIGNABLE_ROLES = Set.of(
            Roles.SYSTEM_ADMIN, Roles.INSTITUTION_ADMIN, Roles.DEPARTMENT_HEAD,
            Roles.LAB_MANAGER, Roles.LAB_TECHNICIAN, Roles.RESEARCHER, Roles.STUDENT);

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    // ------------------------------------------------------------------
    // Self-service
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        return mapToResponse(requireUser(username));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        AppUser user = requireUser(username);

        // Email must stay unique across users
        String newEmail = request.getEmail().trim();
        if (!newEmail.equalsIgnoreCase(user.getEmail())
                && appUserRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("That email address is already in use");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(newEmail);
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());

        return mapToResponse(appUserRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        AppUser user = requireUser(username);

        if ("GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
            throw new RuntimeException("Google accounts sign in with Google and have no local password to change");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirmation do not match");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);
    }

    // ------------------------------------------------------------------
    // Admin: user & role management
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String search, String role) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        String normalizedRole = (role == null || role.isBlank()) ? null : role.trim().toUpperCase();
        return appUserRepository.searchUsers(normalizedSearch, normalizedRole).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUserRoles(Long userId, Set<String> roleNames) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (roleNames == null || roleNames.isEmpty()) {
            throw new RuntimeException("A user must have at least one role");
        }

        Set<String> requested = roleNames.stream()
                .map(r -> r.trim().toUpperCase())
                .collect(Collectors.toSet());

        for (String roleName : requested) {
            if (!ASSIGNABLE_ROLES.contains(roleName)) {
                throw new RuntimeException("Unknown role: " + roleName);
            }
        }

        // Replace the user's role set with the requested one
        userRoleRepository.deleteAll(userRoleRepository.findByUserUserId(userId));
        user.getUserRoles().clear();

        for (String roleName : requested) {
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not configured: " + roleName));
            UserRole userRole = UserRole.builder()
                    .id(new UserRoleId(user.getUserId(), role.getRoleId()))
                    .user(user)
                    .role(role)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRoleRepository.save(userRole);
            user.getUserRoles().add(userRole);
        }

        return mapToResponse(appUserRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse setUserActive(Long userId, boolean active, String actingUsername) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // An admin cannot lock themselves out
        if (!active && user.getUsername().equals(actingUsername)) {
            throw new RuntimeException("You cannot deactivate your own account");
        }

        user.setIsActive(active);
        return mapToResponse(appUserRepository.save(user));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private AppUser requireUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserResponse mapToResponse(AppUser user) {
        Set<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toCollection(HashSet::new));

        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .institution(user.getInstitution() != null ? user.getInstitution().getName() : null)
                .department(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .roles(roles)
                .active(user.getIsActive() != null ? user.getIsActive() : true)
                .build();
    }
}
