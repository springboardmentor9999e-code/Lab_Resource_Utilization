package com.labhub.service.impl;

import com.labhub.dto.auth.AuthResponse;
import com.labhub.dto.auth.InstitutionRegisterRequest;
import com.labhub.dto.auth.LoginRequest;
import com.labhub.dto.auth.RegisterRequest;
import com.labhub.dto.institution.InstitutionDTO;
import com.labhub.entity.Department;
import com.labhub.entity.Institution;
import com.labhub.entity.Role;
import com.labhub.entity.User;
import com.labhub.enums.InstitutionStatus;
import com.labhub.enums.RoleName;
import com.labhub.enums.UserStatus;
import com.labhub.exception.DuplicateResourceException;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.DepartmentRepository;
import com.labhub.repository.InstitutionRepository;
import com.labhub.repository.RoleRepository;
import com.labhub.repository.UserRepository;
import com.labhub.security.JwtUtil;
import com.labhub.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Authentication service implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    @Transactional
    public InstitutionDTO registerInstitution(InstitutionRegisterRequest request) {
        if (institutionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Institution name already exists: " + request.getName());
        }
        if (request.getCode() != null && institutionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Institution code already exists: " + request.getCode());
        }
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new DuplicateResourceException("Admin email already registered: " + request.getAdminEmail());
        }

        // 1. Create Institution in PENDING status
        Institution institution = Institution.builder()
                .name(request.getName())
                .code(request.getCode())
                .type(request.getType() != null ? request.getType() : "University")
                .status(InstitutionStatus.PENDING)
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .primaryAdminName(request.getAdminFirstName() + " " + request.getAdminLastName())
                .primaryAdminEmail(request.getAdminEmail())
                .isActive(true)
                .build();

        institution = institutionRepository.save(institution);

        // 2. Create Primary Admin account for this Institution
        Role instAdminRole = roleRepository.findByName(RoleName.INSTITUTION_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "INSTITUTION_ADMIN"));

        Set<Role> roles = new HashSet<>();
        roles.add(instAdminRole);

        User adminUser = User.builder()
                .firstName(request.getAdminFirstName())
                .lastName(request.getAdminLastName())
                .email(request.getAdminEmail())
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .phone(request.getPhone())
                .institution(institution)
                .roles(roles)
                .status(UserStatus.PENDING_APPROVAL)
                .isActive(true)
                .build();

        userRepository.save(adminUser);
        log.info("Institution registered pending approval: {}", institution.getName());

        return InstitutionDTO.builder()
                .id(institution.getId())
                .name(institution.getName())
                .code(institution.getCode())
                .type(institution.getType())
                .status(institution.getStatus().name())
                .address(institution.getAddress())
                .email(institution.getEmail())
                .phone(institution.getPhone())
                .website(institution.getWebsite())
                .logoUrl(institution.getLogoUrl())
                .primaryAdminName(institution.getPrimaryAdminName())
                .primaryAdminEmail(institution.getPrimaryAdminEmail())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        // Validate mandatory institution selection
        if (request.getInstitutionId() == null || request.getInstitutionId().isBlank()) {
            throw new IllegalArgumentException("Institution selection is required for registration.");
        }

        Institution institution = null;
        try {
            UUID instUuid = UUID.fromString(request.getInstitutionId());
            institution = institutionRepository.findById(instUuid).orElse(null);
        } catch (IllegalArgumentException ignored) {
            // Not a UUID string — try finding by code or name
        }

        if (institution == null) {
            institution = institutionRepository.findByCode(request.getInstitutionId()).orElse(null);
        }
        if (institution == null) {
            institution = institutionRepository.findByName(request.getInstitutionId()).orElse(null);
        }
        if (institution == null) {
            // Fallback: pick first approved institution
            institution = institutionRepository.findAll().stream()
                    .filter(i -> i.getStatus() == null || i.getStatus() == InstitutionStatus.APPROVED)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", request.getInstitutionId()));
        }

        if (institution.getStatus() != null && institution.getStatus() != InstitutionStatus.APPROVED) {
            throw new IllegalStateException("Selected institution is not approved for user registrations.");
        }

        // Resolve optional department if provided
        Department department = null;
        if (request.getDepartmentId() != null && !request.getDepartmentId().isBlank()) {
            try {
                UUID deptUuid = UUID.fromString(request.getDepartmentId());
                department = departmentRepository.findById(deptUuid).orElse(null);
            } catch (Exception ignored) {
                department = null;
            }
        }

        // Always assign RESEARCHER role by default
        Role assignedRole = roleRepository.findByName(RoleName.RESEARCHER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "RESEARCHER"));

        Set<Role> roles = new HashSet<>();
        roles.add(assignedRole);

        // Build user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .institution(institution)
                .department(department)
                .roles(roles)
                .status(UserStatus.ACTIVE)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered with default RESEARCHER role under institution {}: {}", institution.getName(), user.getEmail());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate — throws BadCredentialsException if invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Validate institution status if user is linked to an institution
        if (user.getInstitution() != null && user.getInstitution().getStatus() != null) {
            InstitutionStatus status = user.getInstitution().getStatus();
            if (status == InstitutionStatus.PENDING) {
                throw new IllegalStateException("Your institution registration is awaiting approval.");
            }
            if (status == InstitutionStatus.REJECTED) {
                throw new IllegalStateException("Your institution registration has been rejected. Please contact the System Administrator.");
            }
            if (status == InstitutionStatus.SUSPENDED) {
                throw new IllegalStateException("Your institution has been suspended.");
            }
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        Institution inst = user.getInstitution();
        if (inst == null && user.getDepartment() != null) {
            inst = user.getDepartment().getInstitution();
        }

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .id(user.getId().toString())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toList()))
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId().toString() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .institutionId(inst != null ? inst.getId().toString() : null)
                .institutionName(inst != null ? inst.getName() : null)
                .build();
    }
}

