package com.labresource.service.interfaces;

import com.labresource.dto.request.ChangePasswordRequest;
import com.labresource.dto.request.UpdateProfileRequest;
import com.labresource.dto.response.UserResponse;

import java.util.List;
import java.util.Set;

public interface UserService {

    // ---- Self-service (current user) ----
    UserResponse getCurrentUser(String username);

    UserResponse updateProfile(String username, UpdateProfileRequest request);

    void changePassword(String username, ChangePasswordRequest request);

    // ---- Admin: user & role management ----
    List<UserResponse> getAllUsers(String search, String role);

    UserResponse updateUserRoles(Long userId, Set<String> roleNames);

    UserResponse setUserActive(Long userId, boolean active, String actingUsername);
}
