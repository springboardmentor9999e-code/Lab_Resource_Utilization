package com.lrplatform.controller;

import com.lrplatform.dto.response.SystemHealthResponse;
import com.lrplatform.service.SystemMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/system")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class SystemMonitorController {

    private final SystemMonitorService systemMonitorService;

    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getHealth() {
        return ResponseEntity.ok(systemMonitorService.getSystemHealth());
    }
}
