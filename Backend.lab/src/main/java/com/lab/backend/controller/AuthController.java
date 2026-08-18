package com.lab.backend.controller;

import com.lab.backend.dto.LoginRequest;
import com.lab.backend.entity.User;
import com.lab.backend.security.JwtUtil;
import com.lab.backend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;


    public AuthController(
            UserService userService,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder) {

        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================
    // Register User
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage() != null ? e.getMessage() : "Registration failed"
            ));
        }
    }

    // =========================
    // Login User
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest == null || loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid email or password"
            ));
        }

        User existingUser = userService.findByEmail(loginRequest.getEmail().trim());

        if (existingUser == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid email or password"
            ));
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid email or password"
            ));
        }

        String token = jwtUtil.generateToken(existingUser.getEmail());
        String roleStr = existingUser.getRole() != null ? existingUser.getRole().name() : "STUDENT";

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", token,
                "name", existingUser.getName() != null ? existingUser.getName() : existingUser.getEmail(),
                "email", existingUser.getEmail(),
                "role", roleStr
        ));
    }
}