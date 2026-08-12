package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.dto.*;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        return userService.getPendingUsers();
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );
    }

    @GetMapping("/google/config")
    public ResponseEntity<Map<String, Object>> getGoogleConfig() {
        return ResponseEntity.ok(userService.getGoogleAuthConfig());
    }

    @PostMapping("/google")
    public LoginResponse googleAuth(@RequestBody GoogleAuthRequest request) {
        return userService.processGoogleLogin(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> result = userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Map<String, Object> result = userService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, Object> result = userService.resetPassword(request);
        return ResponseEntity.ok(result);
    }
}