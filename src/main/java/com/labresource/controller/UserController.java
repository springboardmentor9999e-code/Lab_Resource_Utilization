package com.labresource.controller;

import com.labresource.dto.*;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;
import com.labresource.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository; // NEW

    public UserController(UserService userService, UserRepository userRepository) { // NEW param
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {

        User savedUser = userService.registerUser(request);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        String token = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(new LoginResponse(token));
    }

    // NEW — any logged-in user can update their own institution/profile type
    @PutMapping("/me/profile")
    public ResponseEntity<UserResponse> updateMyProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getInstitutionId() != null) {
            user.setInstitutionId(request.getInstitutionId());
        }
        if (request.getProfileType() != null) {
            user.setProfileType(request.getProfileType());
        }

        User saved = userRepository.save(user);

        return ResponseEntity.ok(new UserResponse(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getRole()
        ));
    }

    @GetMapping("/test")
    public String test() {
        return "JWT Authentication Successful!";
    }
}