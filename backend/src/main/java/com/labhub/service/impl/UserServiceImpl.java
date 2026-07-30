package com.labhub.service.impl;

import com.labhub.dto.user.UserDTO;
import com.labhub.entity.User;
import com.labhub.enums.UserStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.UserRepository;
import com.labhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersForCurrentUser(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        boolean isSysAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.labhub.enums.RoleName.SYSTEM_ADMIN);

        if (isSysAdmin) {
            return userRepository.findAll().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        // For Institution Admin & institution staff, scope to their institution
        if (currentUser.getInstitution() != null) {
            return userRepository.findByInstitutionId(currentUser.getInstitution().getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        // Fallback: if no institution mapped, return current user only
        return List.of(toDTO(currentUser));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id.toString()));
        return toDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateStatus(UUID id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id.toString()));
        user.setStatus(status);
        userRepository.save(user);
        return toDTO(user);
    }

    private UserDTO toDTO(User user) {
        String instName = null;
        if (user.getInstitution() != null) {
            instName = user.getInstitution().getName();
        } else if (user.getDepartment() != null && user.getDepartment().getInstitution() != null) {
            instName = user.getDepartment().getInstitution().getName();
        }

        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toList()))
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .institutionName(instName)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
