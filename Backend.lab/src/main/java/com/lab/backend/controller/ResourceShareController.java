package com.lab.backend.controller;

import com.lab.backend.dto.ResourceShareRequestDTO;
import com.lab.backend.entity.ResourceShare;
import com.lab.backend.service.ResourceShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "*")
public class ResourceShareController {

    private final ResourceShareService resourceShareService;

    public ResourceShareController(ResourceShareService resourceShareService) {
        this.resourceShareService = resourceShareService;
    }

    @PostMapping
    public ResponseEntity<ResourceShare> createRequest(@RequestBody ResourceShareRequestDTO dto) {
        return ResponseEntity.ok(resourceShareService.createRequest(dto));
    }

    @PostMapping("/share")
    public ResponseEntity<ResourceShare> shareEquipment(@RequestBody ResourceShareRequestDTO dto) {
        return ResponseEntity.ok(resourceShareService.createRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<ResourceShare>> getAllRequests() {
        return ResponseEntity.ok(resourceShareService.getAllRequests());
    }

    @GetMapping("/shared")
    public ResponseEntity<List<ResourceShare>> viewSharedEquipment() {
        return ResponseEntity.ok(resourceShareService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceShare> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceShareService.getRequestById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResourceShare> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(resourceShareService.approveRequest(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResourceShare> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(resourceShareService.rejectRequest(id));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ResourceShare> completeRequest(@PathVariable Long id) {
        return ResponseEntity.ok(resourceShareService.completeRequest(id));
    }
}
