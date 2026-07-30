package com.labhub.controller;

import com.labhub.dto.auth.AuthResponse;
import com.labhub.dto.auth.LoginRequest;
import com.labhub.dto.auth.RegisterRequest;
import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.User;
import com.labhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authResponse));
    }

    /**
     * Register a new institution (starts in PENDING status).
     * POST /api/auth/register-institution
     */
    @PostMapping("/register-institution")
    public ResponseEntity<ApiResponse<com.labhub.dto.institution.InstitutionDTO>> registerInstitution(
            @Valid @RequestBody com.labhub.dto.auth.InstitutionRegisterRequest request) {
        com.labhub.dto.institution.InstitutionDTO institutionDTO = authService.registerInstitution(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Institution registered successfully and is pending approval by System Administrator", institutionDTO));
    }

    /**
     * Authenticate user and return JWT.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * Get current authenticated user profile.
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        Map<String, Object> profile = Map.of(
                "id", user.getId().toString(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "roles", user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .toList(),
                "status", user.getStatus().name()
        );
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
