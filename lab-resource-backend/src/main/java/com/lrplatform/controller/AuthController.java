package com.lrplatform.controller;

import com.lrplatform.dto.request.*;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.AuthResponse;
import com.lrplatform.dto.response.OAuthSetupInfoResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.security.JwtCookieUtil;
import com.lrplatform.security.JwtTokenProvider;
import com.lrplatform.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        JwtCookieUtil.addAccessCookie(httpRequest, response, authResponse.getAccessToken(),
                tokenProvider.getAccessTokenExpiration() / 1000);
        long refreshMaxAge = request.isRememberMe()
                ? tokenProvider.getRefreshTokenExpiration() / 1000
                : -1;
        JwtCookieUtil.addRefreshCookie(httpRequest, response, authResponse.getRefreshToken(), refreshMaxAge);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody(required = false) RefreshTokenRequest request,
                                                     HttpServletRequest httpRequest,
                                                     HttpServletResponse response) {
        String refreshTokenValue = request != null ? request.getRefreshToken() : null;
        if (refreshTokenValue == null || refreshTokenValue.isEmpty()) {
            refreshTokenValue = JwtCookieUtil.getCookieValue(httpRequest, JwtCookieUtil.REFRESH_COOKIE);
        }
        if (refreshTokenValue == null || refreshTokenValue.isEmpty()) {
            throw new BadRequestException("Missing refresh token");
        }

        AuthResponse authResponse = authService.refreshToken(refreshTokenValue);

        JwtCookieUtil.addAccessCookie(httpRequest, response, authResponse.getAccessToken(),
                tokenProvider.getAccessTokenExpiration() / 1000);
        JwtCookieUtil.addRefreshCookie(httpRequest, response, authResponse.getRefreshToken(),
                tokenProvider.getRefreshTokenExpiration() / 1000);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request,
                                              HttpServletResponse response) {
        String refreshToken = request.getHeader("X-Refresh-Token");
        if (refreshToken == null || refreshToken.isEmpty()) {
            refreshToken = JwtCookieUtil.getCookieValue(request, JwtCookieUtil.REFRESH_COOKIE);
        }

        authService.logout(refreshToken);
        JwtCookieUtil.clearAuthCookies(request, response);

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
    public ResponseEntity<AuthResponse> completeOAuthProfile(@Valid @RequestBody CompleteProfileRequest request,
                                                             Authentication authentication) {
        String email = authentication.getName();
        AuthResponse authResponse = authService.completeOAuthProfile(email, request);
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/oauth2/setup-info")
    public ResponseEntity<OAuthSetupInfoResponse> oauthSetupInfo(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getOAuthSetupInfo(email));
    }

    @PostMapping("/oauth2/success")
    public ResponseEntity<ApiResponse> oauth2Success(@Valid @RequestBody OAuth2SuccessRequest request,
                                                     HttpServletRequest httpRequest,
                                                     HttpServletResponse response) {
        JwtCookieUtil.addAccessCookie(httpRequest, response, request.getAccessToken(),
                tokenProvider.getAccessTokenExpiration() / 1000);
        JwtCookieUtil.addRefreshCookie(httpRequest, response, request.getRefreshToken(),
                tokenProvider.getRefreshTokenExpiration() / 1000);
        return ResponseEntity.ok(ApiResponse.success("Cookies set successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentProfile(authentication));
    }
}
