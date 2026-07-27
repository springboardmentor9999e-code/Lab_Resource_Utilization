package com.labresource.controller;

import com.labresource.dto.request.DeviceTokenRegistration;
import com.labresource.dto.request.NotificationPreferencesUpdate;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.NotificationResponse;
import com.labresource.service.impl.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(principal.getName())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markRead(@PathVariable Long id, Principal principal) {
        notificationService.markRead(id, principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<?>> markAllRead(Principal principal) {
        int updated = notificationService.markAllRead(principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, updated + " notifications marked as read", null));
    }

    // ------------------------------------------------------------------
    // Channel preferences (email is always on; SMS and push are opt-out)
    // ------------------------------------------------------------------

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences(Principal principal) {
        return ResponseEntity.ok(notificationService.getPreferences(principal.getName()));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @RequestBody NotificationPreferencesUpdate request, Principal principal) {
        return ResponseEntity.ok(notificationService.updatePreferences(
                principal.getName(), request.getSmsEnabled(), request.getPushEnabled()));
    }

    // ------------------------------------------------------------------
    // FCM device registration
    // ------------------------------------------------------------------

    @PostMapping("/device-tokens")
    public ResponseEntity<ApiResponse<?>> registerDevice(
            @Valid @RequestBody DeviceTokenRegistration request, Principal principal) {
        notificationService.registerDevice(principal.getName(), request.getToken(), request.getPlatform());
        return ResponseEntity.ok(new ApiResponse<>(true, "Device registered for push notifications", null));
    }

    /**
     * Called on logout so the next person to use the machine does not receive the previous
     * user's alerts. Deliberately idempotent — an unknown token is not an error.
     */
    @DeleteMapping("/device-tokens")
    public ResponseEntity<ApiResponse<?>> unregisterDevice(@RequestParam String token) {
        notificationService.unregisterDevice(token);
        return ResponseEntity.ok(new ApiResponse<>(true, "Device unregistered", null));
    }
}
