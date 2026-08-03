package com.labresource.service.impl;

import com.labresource.config.JwtUtil;
import com.labresource.dto.RegisterRequest;
import com.labresource.entity.*;
import com.labresource.repository.RoleRequestRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleRequestRepository roleRequestRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           RoleRequestRepository roleRequestRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.roleRequestRepository = roleRequestRepository;
    }

    @Override
    public User registerUser(RegisterRequest request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.RESEARCHER_STUDENT); // always the real role at signup
        user.setProfileType(request.getProfileType() != null ? request.getProfileType() : ProfileType.STUDENT); // NEW
        user.setInstitutionId(request.getInstitutionId()); // NEW

        User saved = userRepository.save(user);

        if (request.getDesiredRole() != null && request.getDesiredRole() != Role.RESEARCHER_STUDENT) {
            RoleRequest roleRequest = RoleRequest.builder()
                    .userEmail(saved.getEmail())
                    .requestedRole(request.getDesiredRole())
                    .reason("Requested at registration")
                    .status(RoleRequestStatus.PENDING)
                    .build();
            roleRequestRepository.save(roleRequest);
        }

        return saved;
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public String login(String email, String password) {
        System.out.println("Login attempt: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        System.out.println("User found: " + user.getEmail());

        if (!passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("Password mismatch");
            throw new RuntimeException("Invalid email or password");
        }

        System.out.println("Password matched");

        String role = user.getRole().name();
        String profileType = user.getProfileType() != null ? user.getProfileType().name() : null;
        Long institutionId = user.getInstitutionId();

        System.out.println("Generating JWT...");

        return jwtUtil.generateToken(user.getEmail(), role, user.getName(), profileType, institutionId);
    }
}