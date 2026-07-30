package com.rems.controller;

import com.rems.dto.LabRequest;
import com.rems.dto.LabResponse;
import com.rems.service.LabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labs")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @PostMapping
    @PreAuthorize("hasAuthority('manage_labs')")
    public ResponseEntity<LabResponse> createLab(@Valid @RequestBody LabRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labService.createLab(request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('manage_labs')")
    public ResponseEntity<Map<String, String>> deleteLab(@PathVariable Long id, Principal principal) {
        labService.deleteLab(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Lab deleted successfully"));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LabResponse>> getMyDepartmentLabs(Principal principal) {
        return ResponseEntity.ok(labService.getMyDepartmentLabs(principal.getName()));
    }
}
