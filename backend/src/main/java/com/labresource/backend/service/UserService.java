package com.labresource.backend.service;

import com.labresource.backend.dto.UserRequest;
import com.labresource.backend.entity.Role;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.RoleRepository;
import com.labresource.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.labresource.backend.entity.Institution;
import com.labresource.backend.entity.Laboratory;
import com.labresource.backend.repository.InstitutionRepository;
import com.labresource.backend.repository.LaboratoryRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import com.labresource.backend.dto.ChangePasswordRequest;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final PasswordEncoder passwordEncoder;
       
    public UserService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        InstitutionRepository institutionRepository,
        LaboratoryRepository laboratoryRepository,
        PasswordEncoder passwordEncoder) {

    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.institutionRepository = institutionRepository;
    this.laboratoryRepository = laboratoryRepository;
    this.passwordEncoder = passwordEncoder;
}

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // Create user
    public User createUser(UserRequest request) {

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        Institution institution = institutionRepository
        .findById(request.getInstitutionId())
        .orElseThrow(() ->
                new RuntimeException("Institution not found"));

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
    );
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setRole(role);
        user.setInstitution(institution);
        Laboratory laboratory = null;

        if (request.getLabId() != null) {
            laboratory = laboratoryRepository
                    .findById(request.getLabId())
                    .orElseThrow(() -> new RuntimeException("Laboratory not found"));
        }
        user.setLaboratory(laboratory);
        return userRepository.save(user);
    }

    // Update user
    public User updateUser(Long id, UserRequest request) {

        User user = getUserById(id);

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));
        Institution institution = institutionRepository
        .findById(request.getInstitutionId())
        .orElseThrow(() ->
                new RuntimeException("Institution not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null &&
            !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setRole(role);
        user.setInstitution(institution);
        
        Laboratory laboratory = null;

        if (request.getLabId() != null) {
            laboratory = laboratoryRepository
                    .findById(request.getLabId())
                    .orElseThrow(() -> new RuntimeException("Laboratory not found"));
        }
        user.setLaboratory(laboratory);
        return userRepository.save(user);
    }

    public User updateUserByInstitution(
        Long institutionId,
        Long userId,
        UserRequest request) {

    User existing = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (!existing.getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    Role role = roleRepository.findById(request.getRoleId())
            .orElseThrow(() ->
                    new RuntimeException("Role not found"));

    Institution institution = institutionRepository
            .findById(request.getInstitutionId())
            .orElseThrow(() ->
                    new RuntimeException("Institution not found"));

    existing.setFullName(request.getFullName());
    existing.setEmail(request.getEmail());
            if (request.getPassword() != null &&
            !request.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }
    existing.setPhone(request.getPhone());
    existing.setDepartment(request.getDepartment());
    existing.setRole(role);
    existing.setInstitution(institution);

    return userRepository.save(existing);
}

public void deleteUserByInstitution(
        Long institutionId,
        Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (!user.getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    userRepository.delete(user);
}

    // Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User updateProfile(UserRequest request, Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setDepartment(request.getDepartment());

    return userRepository.save(user);
}

public void changePassword(
        ChangePasswordRequest request,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("Logged-in user not found"));

    // Check current password
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new RuntimeException("Current password is incorrect");
    }

    // Check new password and confirmation
    if (!request.getNewPassword()
            .equals(request.getConfirmPassword())) {

        throw new RuntimeException("New passwords do not match");
    }

    // Update password
    user.setPassword(
            passwordEncoder.encode(request.getNewPassword())
    );

    userRepository.save(user);
}

}