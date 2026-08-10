package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthController(UserService userService,
                          JwtUtil jwtUtil,
                          CustomUserDetailsService customUserDetailsService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {

        User savedUser = userService.saveUser(user);

        return ResponseEntity.ok(savedUser);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User loginUser) {

        List<User> users = userService.getAllUsers();

        for (User user : users) {

            if (user.getEmail().equals(loginUser.getEmail())
                    && user.getPassword().equals(loginUser.getPassword())) {

                UserDetails userDetails =
                        customUserDetailsService.loadUserByUsername(user.getEmail());

                String token = jwtUtil.generateToken(
                        userDetails,
                        user.getUserId()
                );

                return ResponseEntity.ok(
                        new AuthResponse(
                                token,
                                user.getRole(),
                                user.getName(),
                                user.getUserId()
                        )
                );
            }
        }

        return ResponseEntity.badRequest().build();
    }

    // Forgot Password
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {

        userService.sendOtp(email);

        return ResponseEntity.ok("OTP sent successfully.");
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String email,
                                            @RequestParam String otp) {

        if (userService.verifyOtp(email, otp)) {
            return ResponseEntity.ok("OTP verified successfully.");
        }

        return ResponseEntity.badRequest().body("Invalid OTP");
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email,
                                                @RequestParam String newPassword) {

        userService.resetPassword(email, newPassword);

        return ResponseEntity.ok("Password reset successfully.");
    }
}