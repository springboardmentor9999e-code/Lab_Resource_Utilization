package com.example.backend.controller;

import com.example.backend.entity.SharingRequest;
import com.example.backend.service.SharingRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing")
@CrossOrigin(origins = "http://localhost:3000")
public class SharingRequestController {

    private final SharingRequestService service;

    public SharingRequestController(SharingRequestService service) {
        this.service = service;
    }

    @PostMapping("/request")
    public SharingRequest createRequest(@RequestBody SharingRequest request) {
        return service.createRequest(request);
    }

    @GetMapping
    public List<SharingRequest> getAllRequests() {
        return service.getAllRequests();
    }

    @GetMapping("/pending")
    public List<SharingRequest> getPendingRequests() {
        return service.getPendingRequests();
    }

    @PutMapping("/{id}/approve")
    public SharingRequest approveRequest(@PathVariable Long id) {
        return service.approveRequest(id);
    }

    @PutMapping("/{id}/reject")
    public SharingRequest rejectRequest(
            @PathVariable Long id,
            @RequestParam String remarks) {

        return service.rejectRequest(id, remarks);
    }
}