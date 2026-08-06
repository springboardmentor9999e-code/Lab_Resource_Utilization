package com.rems.controller;

import com.rems.dto.InAppNotificationResponse;
import com.rems.service.InAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-notifications")
@RequiredArgsConstructor
public class InAppNotificationController {

    private final InAppNotificationService inAppNotificationService;

    @GetMapping
    public ResponseEntity<List<InAppNotificationResponse>> getNotifications(
            @RequestParam(required = false) String type,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(inAppNotificationService.getUserNotifications(email, type));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        inAppNotificationService.markAsRead(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        inAppNotificationService.markAllAsRead(email);
        return ResponseEntity.noContent().build();
    }
}
