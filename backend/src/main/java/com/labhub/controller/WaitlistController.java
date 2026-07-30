package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.Waitlist;
import com.labhub.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<Map<String, Object>>> joinWaitlist(
            @RequestBody Map<String, String> body, Authentication auth) {
        UUID equipmentId = UUID.fromString(body.get("equipmentId"));
        Waitlist w = waitlistService.joinWaitlist(auth.getName(), equipmentId);
        return ResponseEntity.ok(ApiResponse.success("Successfully joined waitlist", mapSingle(w)));
    }

    @GetMapping("/my-waitlist")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyWaitlist(Authentication auth) {
        List<Waitlist> list = waitlistService.getUserWaitlist(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(list.stream().map(this::mapSingle).toList()));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEquipmentWaitlist(@PathVariable UUID equipmentId) {
        List<Waitlist> list = waitlistService.getEquipmentWaitlist(equipmentId);
        return ResponseEntity.ok(ApiResponse.success(list.stream().map(this::mapSingle).toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelWaitlist(@PathVariable UUID id, Authentication auth) {
        waitlistService.cancelWaitlist(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Waitlist entry cancelled"));
    }

    private Map<String, Object> mapSingle(Waitlist w) {
        return Map.of(
                "id", w.getId().toString(),
                "equipmentId", w.getEquipment().getId().toString(),
                "equipmentName", w.getEquipment().getName(),
                "position", w.getPosition(),
                "status", w.getStatus().name(),
                "createdAt", w.getCreatedAt().toString()
        );
    }
}
