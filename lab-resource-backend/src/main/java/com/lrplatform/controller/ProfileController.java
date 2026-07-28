package com.lrplatform.controller;

import com.lrplatform.dto.request.PasswordChangeRequest;
import com.lrplatform.dto.request.ProfileUpdateRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.UserResponse;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest profileRequest,
            HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(profileService.updateProfile(userId, profileRequest));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody PasswordChangeRequest passwordRequest,
            HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        profileService.changePassword(userId, passwordRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
