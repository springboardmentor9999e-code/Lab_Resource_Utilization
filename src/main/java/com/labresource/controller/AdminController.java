package com.labresource.controller;
import java.util.List;
import java.util.stream.Collectors;
import com.labresource.dto.RoleUpdateRequest;
import com.labresource.dto.UserResponse;
import com.labresource.entity.User;
import com.labresource.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Only SYSTEM_ADMINISTRATOR can view all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
    // Only SYSTEM_ADMINISTRATOR can change another user's role
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(request.getNewRole());
        User saved = userRepository.save(user);

        UserResponse response = new UserResponse(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getRole()
        );

        return ResponseEntity.ok(response);
    }
}