package com.rems.service;

import com.rems.dto.UserResponse;
import com.rems.entity.Role;
import com.rems.entity.User;
import com.rems.enums.UserStatus;
import com.rems.exception.ApiException;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public UserResponse approveInstitutionAdministrator(Long userId, String adminEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 5);
        if (!hasRole) {
            throw new ApiException("User is not an Institution Administrator", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getStatus() != UserStatus.PENDING) {
            throw new ApiException("User is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        targetUser.setStatus(UserStatus.ACTIVE);
        Role instAdminRole = targetUser.getRoles().stream().filter(r -> r.getRoleId() == 5).findFirst().orElse(null);
        User savedUser = userRepository.save(targetUser);
        notificationService.sendAccountApprovalNotification(savedUser);
        return toUserResponse(savedUser, instAdminRole);
    }

    @Transactional
    public UserResponse approveDepartmentHead(Long userId, String institutionAdminEmail) {
        User approver = userRepository.findByEmail(institutionAdminEmail)
                .orElseThrow(() -> new ApiException("Approver not found", HttpStatus.NOT_FOUND));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 4);
        if (!hasRole) {
            throw new ApiException("User is not a Department Head", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getStatus() != UserStatus.PENDING) {
            throw new ApiException("User is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        if (approver.getInstitution() == null || targetUser.getInstitution() == null ||
            !approver.getInstitution().getInstitutionId().equals(targetUser.getInstitution().getInstitutionId())) {
            throw new ApiException("You are not authorized to approve department heads for another institution", HttpStatus.FORBIDDEN);
        }

        targetUser.setStatus(UserStatus.ACTIVE);
        Role deptHeadRole = targetUser.getRoles().stream().filter(r -> r.getRoleId() == 4).findFirst().orElse(null);
        User savedDeptHead = userRepository.save(targetUser);
        notificationService.sendAccountApprovalNotification(savedDeptHead);
        return toUserResponse(savedDeptHead, deptHeadRole);
    }

    @Transactional
    public UserResponse approveLabManager(Long userId, String departmentHeadEmail) {
        User approver = userRepository.findByEmail(departmentHeadEmail)
                .orElseThrow(() -> new ApiException("Approver not found", HttpStatus.NOT_FOUND));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 3);
        if (!hasRole) {
            throw new ApiException("User is not a Lab Manager", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getStatus() != UserStatus.PENDING) {
            throw new ApiException("User is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        if (approver.getDepartment() == null || targetUser.getDepartment() == null ||
            !approver.getDepartment().getDepartmentId().equals(targetUser.getDepartment().getDepartmentId())) {
            throw new ApiException("You are not authorized to approve lab managers for another department", HttpStatus.FORBIDDEN);
        }

        targetUser.setStatus(UserStatus.ACTIVE);
        Role labManagerRole = targetUser.getRoles().stream().filter(r -> r.getRoleId() == 3).findFirst().orElse(null);
        User savedManager = userRepository.save(targetUser);
        notificationService.sendAccountApprovalNotification(savedManager);
        return toUserResponse(savedManager, labManagerRole);
    }

    @Transactional
    public UserResponse approveLabTechnician(Long userId, String departmentHeadEmail) {
        User approver = userRepository.findByEmail(departmentHeadEmail)
                .orElseThrow(() -> new ApiException("Approver not found", HttpStatus.NOT_FOUND));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 2);
        if (!hasRole) {
            throw new ApiException("User is not a Lab Technician", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getStatus() != UserStatus.PENDING) {
            throw new ApiException("User is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        if (approver.getDepartment() == null || targetUser.getDepartment() == null ||
            !approver.getDepartment().getDepartmentId().equals(targetUser.getDepartment().getDepartmentId())) {
            throw new ApiException("You are not authorized to approve lab technicians for another department", HttpStatus.FORBIDDEN);
        }

        targetUser.setStatus(UserStatus.ACTIVE);
        Role labTechRole = targetUser.getRoles().stream().filter(r -> r.getRoleId() == 2).findFirst().orElse(null);
        User savedTech = userRepository.save(targetUser);
        notificationService.sendAccountApprovalNotification(savedTech);
        return toUserResponse(savedTech, labTechRole);
    }

    public List<UserResponse> getPendingApprovals(String userEmail) {
        User approver = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean isSysAdmin = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 6);
        boolean isInstAdmin = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 5);
        boolean isDeptHead = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 4);

        if (isSysAdmin) {
            return userRepository.findAll().stream()
                    .filter(u -> u.getStatus() == UserStatus.PENDING 
                            && u.getRoles().stream().anyMatch(r -> r.getRoleId() == 5))
                    .map(u -> toUserResponse(u, u.getRoles().stream().filter(r -> r.getRoleId() == 5).findFirst().orElse(null)))
                    .toList();
        }

        if (isInstAdmin) {
            if (approver.getInstitution() == null) {
                throw new ApiException("You are not assigned to any institution", HttpStatus.BAD_REQUEST);
            }
            Long instId = approver.getInstitution().getInstitutionId();
            return userRepository.findAll().stream()
                    .filter(u -> u.getStatus() == UserStatus.PENDING 
                            && u.getRoles().stream().anyMatch(r -> r.getRoleId() == 4) 
                            && u.getInstitution() != null 
                            && u.getInstitution().getInstitutionId().equals(instId))
                    .map(u -> toUserResponse(u, u.getRoles().stream().filter(r -> r.getRoleId() == 4).findFirst().orElse(null)))
                    .toList();
        }

        if (isDeptHead) {
            if (approver.getDepartment() == null) {
                throw new ApiException("You are not assigned to any department", HttpStatus.BAD_REQUEST);
            }
            Long deptId = approver.getDepartment().getDepartmentId();
            return userRepository.findAll().stream()
                    .filter(u -> u.getStatus() == UserStatus.PENDING 
                            && u.getRoles().stream().anyMatch(r -> r.getRoleId() == 3 || r.getRoleId() == 2) 
                            && u.getDepartment() != null 
                            && u.getDepartment().getDepartmentId().equals(deptId))
                    .map(u -> toUserResponse(u, u.getRoles().stream().filter(r -> r.getRoleId() == 3 || r.getRoleId() == 2).findFirst().orElse(null)))
                    .toList();
        }

        throw new ApiException("You do not have permission to view pending approvals", HttpStatus.FORBIDDEN);
    }

    @Transactional
    public UserResponse rejectUser(Long userId, String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ApiException("Approver not found", HttpStatus.NOT_FOUND));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (targetUser.getStatus() != UserStatus.PENDING) {
            throw new ApiException("User is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        boolean isSysAdmin = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 6);
        boolean isInstAdmin = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 5);
        boolean isDeptHead = approver.getRoles().stream().anyMatch(r -> r.getRoleId() == 4);

        if (isSysAdmin) {
            boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 5);
            if (!hasRole) throw new ApiException("Target is not an Institution Administrator", HttpStatus.BAD_REQUEST);
        } else if (isInstAdmin) {
            boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 4);
            if (!hasRole) throw new ApiException("Target is not a Department Head", HttpStatus.BAD_REQUEST);
            if (approver.getInstitution() == null || targetUser.getInstitution() == null ||
                !approver.getInstitution().getInstitutionId().equals(targetUser.getInstitution().getInstitutionId())) {
                throw new ApiException("You are not authorized to reject department heads for another institution", HttpStatus.FORBIDDEN);
            }
        } else if (isDeptHead) {
            boolean hasRole = targetUser.getRoles().stream().anyMatch(r -> r.getRoleId() == 3 || r.getRoleId() == 2);
            if (!hasRole) throw new ApiException("Target is not a Lab Manager or Lab Technician", HttpStatus.BAD_REQUEST);
            if (approver.getDepartment() == null || targetUser.getDepartment() == null ||
                !approver.getDepartment().getDepartmentId().equals(targetUser.getDepartment().getDepartmentId())) {
                throw new ApiException("You are not authorized to reject for another department", HttpStatus.FORBIDDEN);
            }
        } else {
            throw new ApiException("You are not authorized to reject user registrations", HttpStatus.FORBIDDEN);
        }

        targetUser.setStatus(UserStatus.INACTIVE);
        return toUserResponse(userRepository.save(targetUser), null);
    }

    private UserResponse toUserResponse(User user, Role selectedRole) {
        Role role = selectedRole;
        if (role == null && !user.getRoles().isEmpty()) {
            role = user.getRoles().iterator().next();
        }

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus().name())
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
