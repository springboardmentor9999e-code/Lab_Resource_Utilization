package com.lrplatform.controller;

import com.lrplatform.dto.request.*;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.AuthResponse;
import com.lrplatform.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        if (request.isRememberMe()) {
            Cookie refreshCookie = new Cookie("refresh_token", authResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/api/auth/refresh");
            refreshCookie.setMaxAge(30 * 24 * 60 * 60);
            response.addCookie(refreshCookie);
        }

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request,
                                                     HttpServletRequest httpRequest) {
        String refreshTokenValue = request.getRefreshToken();

        if (refreshTokenValue == null || refreshTokenValue.isEmpty()) {
            refreshTokenValue = getRefreshTokenFromCookie(httpRequest);
        }

        AuthResponse response = authService.refreshToken(refreshTokenValue);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request,
                                              HttpServletResponse response) {
        String refreshToken = request.getHeader("X-Refresh-Token");

        if (refreshToken == null || refreshToken.isEmpty()) {
            refreshToken = getRefreshTokenFromCookie(request);
        }

        authService.logout(refreshToken);

        Cookie clearCookie = new Cookie("refresh_token", "");
        clearCookie.setPath("/api/auth/refresh");
        clearCookie.setMaxAge(0);
        clearCookie.setHttpOnly(true);
        response.addCookie(clearCookie);

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
    }

    @PostMapping("/oauth2/complete-profile")
    public ResponseEntity<AuthResponse> completeOAuthProfile(@Valid @RequestBody CompleteProfileRequest request) {
        AuthResponse authResponse = authService.completeOAuthProfile(request);
        return ResponseEntity.ok(authResponse);
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
