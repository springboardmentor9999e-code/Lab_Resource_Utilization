package com.labresource.controller;

import com.labresource.dto.request.ForgotPasswordRequest;
import com.labresource.dto.request.GoogleAuthRequest;
import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RefreshTokenRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.request.ResetPasswordRequest;
import com.labresource.dto.request.VerifyOtpRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.AuthResponse;
import com.labresource.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<?> register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.loginUser(request);
    }

    @PostMapping("/google")
    public AuthResponse googleAuth(
            @Valid @RequestBody GoogleAuthRequest request) {

        return authService.googleAuth(request);
    }

    @PostMapping("/refresh-token")
    public AuthResponse refreshToken(
            @RequestBody RefreshTokenRequest request) {

        return authService.refreshToken(request);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return authService.forgotPassword(request);
    }

    @PostMapping("/verify-otp")
    public ApiResponse<?> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        return authService.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    public ApiResponse<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        return authService.resetPassword(request);
    }
}
