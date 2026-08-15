package com.labresource.backend.controller;

import com.labresource.backend.dto.ChangePasswordRequest;
import com.labresource.backend.dto.UserProfileResponse;
import com.labresource.backend.dto.UserRequest;
import com.labresource.backend.entity.User;
import com.labresource.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService,
                        UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Create user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Update user
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody UserRequest request) {

        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/profile")
public ResponseEntity<UserProfileResponse> getLoggedInUserProfile(
        Principal principal) {

    String email = principal.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    UserProfileResponse response = new UserProfileResponse();

    response.setUserId(user.getUserId());
    response.setFullName(user.getFullName());
    response.setEmail(user.getEmail());
    response.setPhone(user.getPhone());
    response.setDepartment(user.getDepartment());
    response.setRole(user.getRole().getRoleName());

    if (user.getInstitution() != null) {
        response.setInstitutionName(
                user.getInstitution().getInstitutionName()
        );
    }

    return ResponseEntity.ok(response);
}

@PutMapping("/profile")
public ResponseEntity<UserProfileResponse> updateProfile(
        @RequestBody UserRequest request,
        Authentication authentication) {

    User user = userService.updateProfile(request, authentication);

    UserProfileResponse response = new UserProfileResponse();

    response.setUserId(user.getUserId());
    response.setFullName(user.getFullName());
    response.setEmail(user.getEmail());
    response.setPhone(user.getPhone());
    response.setDepartment(user.getDepartment());
    response.setRole(user.getRole().getRoleName());

    if (user.getInstitution() != null) {
        response.setInstitutionName(
                user.getInstitution().getInstitutionName()
        );
    }

    return ResponseEntity.ok(response);
}

@PutMapping("/change-password")
public ResponseEntity<String> changePassword(
        @RequestBody ChangePasswordRequest request,
        Authentication authentication) {

    userService.changePassword(request, authentication);

    return ResponseEntity.ok("Password changed successfully");
}

}