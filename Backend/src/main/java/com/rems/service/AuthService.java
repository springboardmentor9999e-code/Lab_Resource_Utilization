package com.rems.service;

import com.rems.dto.*;
import com.rems.entity.BlacklistedToken;
import com.rems.entity.Department;
import com.rems.entity.Institution;
import com.rems.entity.Role;
import com.rems.entity.User;
import com.rems.enums.InstitutionStatus;
import com.rems.enums.UserStatus;
import com.rems.exception.ApiException;
import com.rems.repository.BlacklistedTokenRepository;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.InstitutionRepository;
import com.rems.repository.RoleRepository;
import com.rems.repository.UserRepository;
import com.rems.security.JwtUtil;
import com.rems.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.rems.entity.Lab;
import com.rems.repository.LabRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final LabRepository labRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ApiException(
                        "Invalid roleId: " + request.getRoleId() + ". Must be 1-6.", HttpStatus.BAD_REQUEST));

        // Enforce hierarchy input validations
        if (role.getRoleId() == 5 && request.getInstitutionId() == null) {
            throw new ApiException("Institution ID is required for Institution Administrator registration", HttpStatus.BAD_REQUEST);
        }
        if (role.getRoleId() == 4 && (request.getInstitutionId() == null || request.getDepartmentId() == null)) {
            throw new ApiException("Institution ID and Department ID are required for Department Head registration", HttpStatus.BAD_REQUEST);
        }
        if ((role.getRoleId() == 3 || role.getRoleId() == 2) && 
            (request.getInstitutionId() == null || request.getDepartmentId() == null || request.getLabId() == null)) {
            throw new ApiException("Institution ID, Department ID, and Lab ID are required for Lab Manager / Lab Technician registration", HttpStatus.BAD_REQUEST);
        }

        // Institution is optional (except for roles 5, 4, 3, 2 where validated above) — but if given, it must exist AND already be approved (ACTIVE).
        Institution institution = null;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ApiException(
                            "No institution found with id " + request.getInstitutionId(), HttpStatus.BAD_REQUEST));

            if (institution.getStatus() != InstitutionStatus.ACTIVE) {
                throw new ApiException(
                        "Institution '" + institution.getName() + "' is not yet approved (status: "
                                + institution.getStatus() + ")", HttpStatus.BAD_REQUEST);
            }
        }

        // Department is optional too (except for roles 4, 3, 2) — but only meaningful alongside an institution,
        // and must actually belong to that institution.
        Department department = null;
        if (request.getDepartmentId() != null) {
            if (institution == null) {
                throw new ApiException("institutionId is required when departmentId is provided", HttpStatus.BAD_REQUEST);
            }

            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ApiException(
                            "No department found with id " + request.getDepartmentId(), HttpStatus.BAD_REQUEST));

            if (!department.getInstitution().getInstitutionId().equals(institution.getInstitutionId())) {
                throw new ApiException(
                        "Department '" + department.getName() + "' does not belong to institution '"
                                + institution.getName() + "'", HttpStatus.BAD_REQUEST);
            }
        }

        // Lab is optional (except for roles 3, 2) — but only meaningful alongside a department,
        // and must actually belong to that department.
        Lab lab = null;
        if (request.getLabId() != null) {
            if (department == null) {
                throw new ApiException("departmentId is required when labId is provided", HttpStatus.BAD_REQUEST);
            }

            lab = labRepository.findById(request.getLabId())
                    .orElseThrow(() -> new ApiException(
                            "No lab found with id " + request.getLabId(), HttpStatus.BAD_REQUEST));

            if (!lab.getDepartment().getDepartmentId().equals(department.getDepartmentId())) {
                throw new ApiException(
                        "Lab '" + lab.getName() + "' does not belong to department '"
                                + department.getName() + "'", HttpStatus.BAD_REQUEST);
            }
        }

        UserStatus initialStatus = UserStatus.ACTIVE;
        if (role.getRoleId() == 2 || role.getRoleId() == 3 || role.getRoleId() == 4 || role.getRoleId() == 5) {
            initialStatus = UserStatus.PENDING;
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        User saved;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            boolean alreadyHasRole = existingUser.getRoles().stream()
                    .anyMatch(r -> r.getRoleId().equals(request.getRoleId()));
            if (alreadyHasRole) {
                throw new ApiException("Email is already registered with this role", HttpStatus.CONFLICT);
            }

            if (!passwordEncoder.matches(request.getPassword(), existingUser.getPasswordHash())) {
                throw new ApiException("Email is already registered. Please provide the correct password to add a new role.", HttpStatus.UNAUTHORIZED);
            }

            existingUser.getRoles().add(role);
            if (existingUser.getRoleIds() == null) {
                existingUser.setRoleIds(new java.util.ArrayList<>());
            }
            if (!existingUser.getRoleIds().contains(role.getRoleId())) {
                existingUser.getRoleIds().add(role.getRoleId());
            }
            if (initialStatus == UserStatus.PENDING) {
                existingUser.setStatus(UserStatus.PENDING);
            }
            if (existingUser.getInstitution() == null && institution != null) {
                existingUser.setInstitution(institution);
            }
            if (existingUser.getDepartment() == null && department != null) {
                existingUser.setDepartment(department);
            }
            if (existingUser.getLab() == null && lab != null) {
                existingUser.setLab(lab);
            }
            saved = userRepository.save(existingUser);
        } else {
            User newUser = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .phone(request.getPhone())
                    .institution(institution)
                    .department(department)
                    .lab(lab)
                    .status(initialStatus)
                    .build();
            newUser.getRoles().add(role);
            if (newUser.getRoleIds() == null) {
                newUser.setRoleIds(new java.util.ArrayList<>());
            }
            newUser.getRoleIds().add(role.getRoleId());
            saved = userRepository.save(newUser);
        }

        if (saved.getStatus() == UserStatus.PENDING) {
            if ((role.getRoleId() == 2 || role.getRoleId() == 3) && saved.getDepartment() != null) {
                java.util.List<User> heads = userRepository.findByDepartmentDepartmentId(saved.getDepartment().getDepartmentId());
                for (User head : heads) {
                    if (head.getRoles().stream().anyMatch(r -> r.getRoleId() == 4)) {
                        notificationService.sendApprovalRequestNotification(
                                head,
                                "New " + role.getRoleName() + " Registration Pending",
                                "User " + saved.getName() + " (" + saved.getEmail() + ") requested approval."
                        );
                        inAppNotificationService.createNotification(head, "Registration Approval Needed", "User " + saved.getName() + " (" + saved.getEmail() + ") registered as " + role.getRoleName() + " and requires approval.", NotificationType.APPROVAL, saved.getUserId());
                    }
                }
            } else if (role.getRoleId() == 4 && saved.getInstitution() != null) {
                java.util.List<User> instAdmins = userRepository.findByInstitutionInstitutionId(saved.getInstitution().getInstitutionId());
                for (User admin : instAdmins) {
                    if (admin.getRoles().stream().anyMatch(r -> r.getRoleId() == 5)) {
                        notificationService.sendApprovalRequestNotification(
                                admin,
                                "New Department Head Registration Pending",
                                "User " + saved.getName() + " (" + saved.getEmail() + ") requested approval."
                        );
                        inAppNotificationService.createNotification(admin, "Registration Approval Needed", "User " + saved.getName() + " (" + saved.getEmail() + ") registered as Department Head and requires approval.", NotificationType.APPROVAL, saved.getUserId());
                    }
                }
            }
        }

        String token = null;
        // Only return a token if the user is ACTIVE
        if (saved.getStatus() == UserStatus.ACTIVE) {
            token = jwtUtil.generateToken(saved.getUserId(), saved.getEmail(), role.getRoleName(), role.getRoleId(), role.getPermissions());
        }

        return RegisterResponse.builder()
                .token(token)
                .user(toUserResponse(saved, role))
                .build();
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        Role selectedRole = user.getRoles().stream()
                .filter(r -> r.getRoleId().equals(request.getRoleId()))
                .findFirst()
                .orElseThrow(() -> new ApiException("Selected role does not match this account", HttpStatus.FORBIDDEN));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException("Account is " + user.getStatus() + ", contact your administrator", HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(
                user.getUserId(), user.getEmail(), selectedRole.getRoleName(), selectedRole.getRoleId(), selectedRole.getPermissions());

        return LoginResponse.builder()
                .token(token)
                .user(toUserResponse(user, selectedRole))
                .build();
    }

    @Transactional
    public void logout(String token) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new ApiException("Token is invalid or already expired", HttpStatus.BAD_REQUEST);
        }

        String jti = jwtUtil.extractJti(token);

        if (!blacklistedTokenRepository.existsByJti(jti)) {
            blacklistedTokenRepository.save(BlacklistedToken.builder()
                    .jti(jti)
                    .expiresAt(jwtUtil.extractExpiration(token))
                    .build());
        }
    }

    private UserResponse toUserResponse(User user, Role selectedRole) {
        Role role = selectedRole;
        if (role == null && !user.getRoles().isEmpty()) {
            role = user.getRoles().iterator().next();
        }

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());

        List<Integer> allRoleIds = user.getRoleIds();
        if (allRoleIds == null || allRoleIds.isEmpty()) {
            allRoleIds = user.getRoles().stream().map(Role::getRoleId).collect(Collectors.toList());
        }

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus().name())
                .roleIds(allRoleIds)
                .roles(roleNames)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        if (role != null) {
            builder.roleId(role.getRoleId())
                    .roleName(role.getRoleName())
                    .permissions(role.getPermissions());
        }

        if (user.getInstitution() != null) {
            builder.institutionId(user.getInstitution().getInstitutionId())
                    .institutionName(user.getInstitution().getName());
        }

        if (user.getDepartment() != null) {
            builder.departmentId(user.getDepartment().getDepartmentId())
                    .departmentName(user.getDepartment().getName());
        }

        if (user.getLab() != null) {
            builder.labId(user.getLab().getLabId())
                    .labName(user.getLab().getName());
        }

        return builder.build();
    }
}
