package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.AdminPasswordResetRequest;
import com.lrplatform.dto.request.RoleChangeRequest;
import com.lrplatform.dto.request.UserCreateRequest;
import com.lrplatform.dto.request.UserUpdateRequest;
import com.lrplatform.dto.response.UserListResponse;
import com.lrplatform.dto.response.UserResponse;
import com.lrplatform.exception.DuplicateResourceException;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class UserManagementService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserListResponse getAllUsers(int page, int size, String search, String role, Long institutionId, Boolean status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage;

        if (search != null && !search.isEmpty()) {
            userPage = userRepository.findBySearch(search, pageable);
        } else if (role != null && !role.isEmpty()) {
            UserRole userRole = UserRole.valueOf(role);
            userPage = userRepository.findByRole(userRole, pageable);
        } else if (institutionId != null) {
            userPage = userRepository.findByInstitutionId(institutionId, pageable);
        } else if (status != null) {
            userPage = userRepository.findByStatus(status, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return UserListResponse.builder()
                .users(userPage.getContent().stream().map(this::toUserResponse).toList())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .currentPage(userPage.getNumber())
                .pageSize(userPage.getSize())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
    }

    @Auditable(module = "USER_MANAGEMENT", action = "CREATE", entityType = "User")
    @Transactional
    public void createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(true)
                .build();

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            user.setInstitution(institution);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            user.setDepartment(department);
        }

        userRepository.save(Objects.requireNonNull(user));
        log.info("User created by admin: {}", request.getEmail());
    }

    @Auditable(module = "USER_MANAGEMENT", action = "UPDATE", entityType = "User")
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already registered: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
            }
            user.setPhone(request.getPhone());
        }

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            user.setInstitution(institution);
        } else if (request.getInstitutionId() == null && request.getFirstName() != null) {
            user.setInstitution(null);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            user.setDepartment(department);
        }

        userRepository.save(user);
        log.info("User updated by admin: {}", user.getEmail());
        return toUserResponse(user);
    }

    @Auditable(module = "USER_MANAGEMENT", action = "CHANGE_ROLE", entityType = "User")
    @Transactional
    public UserResponse changeUserRole(Long id, RoleChangeRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        UserRole oldRole = user.getRole();
        user.setRole(request.getRole());
        userRepository.save(user);

        log.info("User role changed from {} to {} for user: {}", oldRole, request.getRole(), user.getEmail());
        return toUserResponse(user);
    }

    @Auditable(module = "USER_MANAGEMENT", action = "TOGGLE_STATUS", entityType = "User")
    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(!user.getStatus());
        userRepository.save(user);

        log.info("User status toggled to {} for user: {}", user.getStatus(), user.getEmail());
        return toUserResponse(user);
    }

    @Auditable(module = "USER_MANAGEMENT", action = "RESET_PASSWORD", entityType = "User")
    @Transactional
    public void resetPassword(Long id, AdminPasswordResetRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset by admin for user: {}", user.getEmail());
    }

    @Auditable(module = "USER_MANAGEMENT", action = "DELETE", entityType = "User")
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        try {
            userRepository.delete(user);
            userRepository.flush();
            log.info("User deleted by admin: {}", user.getEmail());
        } catch (DataIntegrityViolationException e) {
            log.error("Failed to delete user {} due to foreign key constraints", id);
            throw new BadRequestException("Cannot delete user because they have associated records (e.g., bookings, logs). Please disable their account instead.");
        }
    }

    @Transactional(readOnly = true)
    public long countByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    @Transactional(readOnly = true)
    public long countByStatus(Boolean status) {
        return userRepository.countByStatus(status);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .profileImageUrl(user.getProfileImageUrl())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                .institutionName(user.getInstitution() != null ? user.getInstitution().getInstitutionName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
