package com.labresource.controller;

import com.labresource.service.impl.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Role-aware intelligence dashboard payload. Blocks:
     * common + personal (everyone), manager (staff roles), admin (institution/system admins).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam(defaultValue = "30") int days,
            Principal principal) {
        return ResponseEntity.ok(analyticsService.getDashboard(principal.getName(), days));
    }
}
