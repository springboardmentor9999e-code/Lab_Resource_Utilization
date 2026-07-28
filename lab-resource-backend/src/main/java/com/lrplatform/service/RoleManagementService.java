package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.RoleConfigUpdateRequest;
import com.lrplatform.dto.response.RoleResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.RoleConfig;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.RoleConfigRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RoleManagementService {

    private final RoleConfigRepository roleConfigRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        List<RoleResponse> roles = new ArrayList<>();
        
        for (UserRole userRole : UserRole.values()) {
            RoleConfig config = roleConfigRepository.findByRoleName(userRole.name()).orElse(null);
            long userCount = userRepository.countByRole(userRole);
            
            roles.add(RoleResponse.builder()
                    .id(config != null ? config.getId() : null)
                    .roleName(userRole.name())
                    .userCount(userCount)
                    .description(config != null ? config.getDescription() : "")
                    .enabled(config != null ? config.getEnabled() : true)
                    .build());
        }
        return roles;
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleConfig(String roleName) {
        RoleConfig config = roleConfigRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role config not found: " + roleName));
        
        long userCount = userRepository.countByRole(UserRole.valueOf(roleName));
        
        return RoleResponse.builder()
                .id(config.getId())
                .roleName(config.getRoleName())
                .userCount(userCount)
                .description(config.getDescription())
                .enabled(config.getEnabled())
                .build();
    }

    @Auditable(module = "ROLE_MANAGEMENT", action = "UPDATE", entityType = "RoleConfig")
    @Transactional
    public RoleResponse updateRoleConfig(String roleName, RoleConfigUpdateRequest request) {
        RoleConfig config = roleConfigRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role config not found: " + roleName));
        
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getEnabled() != null) {
            config.setEnabled(request.getEnabled());
        }
        
        roleConfigRepository.save(config);
        log.info("Role config updated for role: {}", roleName);
        
        long userCount = userRepository.countByRole(UserRole.valueOf(roleName));
        
        return RoleResponse.builder()
                .id(config.getId())
                .roleName(config.getRoleName())
                .userCount(userCount)
                .description(config.getDescription())
                .enabled(config.getEnabled())
                .build();
    }
}
