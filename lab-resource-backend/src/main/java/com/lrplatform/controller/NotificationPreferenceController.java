package com.lrplatform.controller;

import com.lrplatform.dto.request.NotificationPreferenceRequest;
import com.lrplatform.dto.response.NotificationPreferenceResponse;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.NotificationPreferenceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService notificationPreferenceService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<List<NotificationPreferenceResponse>> getPreferences(HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(notificationPreferenceService.getUserPreferences(userId));
    }

    @PutMapping
    public ResponseEntity<List<NotificationPreferenceResponse>> updateAllPreferences(
            @RequestBody List<NotificationPreferenceRequest> requests,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(notificationPreferenceService.updateAllPreferences(userId, requests));
    }

    @PutMapping("/{notificationType}")
    public ResponseEntity<NotificationPreferenceResponse> updatePreference(
            @PathVariable String notificationType,
            @RequestBody NotificationPreferenceRequest request,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        request.setNotificationType(notificationType);
        return ResponseEntity.ok(notificationPreferenceService.updatePreference(userId, request));
    }
}
