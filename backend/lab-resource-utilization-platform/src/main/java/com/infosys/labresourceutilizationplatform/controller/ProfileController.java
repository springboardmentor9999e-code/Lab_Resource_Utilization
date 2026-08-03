package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.dto.ChangePasswordRequest;
import com.infosys.labresourceutilizationplatform.dto.UserProfileDto;
import com.infosys.labresourceutilizationplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserProfileDto profile = userService.getUserProfile(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDto profileDto, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserProfileDto updated = userService.updateUserProfile(principal.getName(), profileDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            String message = userService.changePassword(principal.getName(), request);
            return ResponseEntity.ok().body(new java.util.HashMap<String, String>() {{
                put("message", message);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new java.util.HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
}
