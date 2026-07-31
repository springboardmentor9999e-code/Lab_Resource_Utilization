package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.AuthResponse;
import com.project.Lab.Resource.Utilization.Platform.dto.LoginRequest;
import com.project.Lab.Resource.Utilization.Platform.dto.RegisterRequest;
import com.project.Lab.Resource.Utilization.Platform.entity.Role;
import com.project.Lab.Resource.Utilization.Platform.entity.User;
import com.project.Lab.Resource.Utilization.Platform.repository.RoleRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import com.project.Lab.Resource.Utilization.Platform.security.JwtService;
import com.project.Lab.Resource.Utilization.Platform.entity.Institution;
import com.project.Lab.Resource.Utilization.Platform.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private InstitutionRepository institutionRepository;

    // ==========================================================
    // REGISTER
    // ==========================================================

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse(
                    null,
                    "Email already exists",
                    null
            );
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        user.setName(
                request.getFirstName().trim() + " " +
                        request.getLastName().trim()
        );

        user.setEmail(request.getEmail().trim().toLowerCase());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());

        Integer institutionId = request.getInstitutionId();

        if (institutionId == null &&
                request.getInstitutionName() != null &&
                !request.getInstitutionName().trim().isEmpty()) {

            Institution institution = institutionRepository
                    .findByNameIgnoreCase(request.getInstitutionName().trim())
                    .orElseGet(() -> {

                        Institution newInstitution = new Institution();
                        newInstitution.setName(request.getInstitutionName().trim());
                        newInstitution.setCreatedAt(LocalDateTime.now());

                        return institutionRepository.save(newInstitution);
                    });

            institutionId = institution.getInstitutionId();
        }

        user.setInstitutionId(institutionId);

        user.setRole(role);

        user.setIsActive(true);

        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", role.getRoleName());

        String token = jwtService.generateToken(
                claims,
                user.getEmail()
        );

        return new AuthResponse(
                token,
                "Registration Successful",
                role.getRoleName()
        );

    }

    // ==========================================================
    // LOGIN
    // ==========================================================

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail().trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid Email or Password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is disabled.");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new BadCredentialsException("Invalid Email or Password");
        }

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", user.getRole().getRoleName());

        String token = jwtService.generateToken(
                claims,
                user.getEmail()
        );

        return new AuthResponse(
                token,
                "Login Successful",
                user.getRole().getRoleName()
        );

    }

}