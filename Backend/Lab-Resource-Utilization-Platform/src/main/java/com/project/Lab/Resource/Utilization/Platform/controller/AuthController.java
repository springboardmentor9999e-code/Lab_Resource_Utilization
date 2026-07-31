package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.AuthResponse;
import com.project.Lab.Resource.Utilization.Platform.dto.CurrentUserResponse;
import com.project.Lab.Resource.Utilization.Platform.dto.LoginRequest;
import com.project.Lab.Resource.Utilization.Platform.dto.RegisterRequest;
import com.project.Lab.Resource.Utilization.Platform.entity.User;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import com.project.Lab.Resource.Utilization.Platform.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test")
    public String test() {
        return "Backend Working";
    }

    // ==========================================================
    // REGISTER
    // ==========================================================
    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody RegisterRequest request
    ) {

        return authService.register(request);

    }

    // ==========================================================
    // LOGIN
    // ==========================================================
    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
    ) {

        return authService.login(request);

    }

    // ==========================================================
    // CURRENT LOGGED IN USER
    // ==========================================================
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public CurrentUserResponse getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return new CurrentUserResponse(
                user.getUserId(),
                user.getInstitutionId(),
                user.getFirstName(),
                user.getLastName(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getRoleName()
        );

    }

}