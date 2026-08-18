package com.lab.backend.controller;

import com.lab.backend.entity.Booking;
import com.lab.backend.entity.BookingOptimizationLog;
import com.lab.backend.dto.WaitlistRequestDTO;
import com.lab.backend.dto.WaitlistResponseDTO;
import com.lab.backend.service.WaitlistService;
import com.lab.backend.service.BookingOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin(origins = "*")
public class WaitlistController {
    
    @Autowired
    private WaitlistService waitlistService;
    @Autowired
    private BookingOptimizationService optimizationService;
    
    // Add to waitlist (join)
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<WaitlistResponseDTO> addToWaitlist(
            @RequestBody WaitlistRequestDTO dto) {
        
        WaitlistResponseDTO response = waitlistService.addToWaitlist(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WaitlistResponseDTO> postWaitlist(
            @RequestBody WaitlistRequestDTO dto) {
        WaitlistResponseDTO response = waitlistService.addToWaitlist(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join")
    public ResponseEntity<WaitlistResponseDTO> joinWaitlist(
            @RequestBody WaitlistRequestDTO dto) {
        WaitlistResponseDTO response = waitlistService.addToWaitlist(dto);
        return ResponseEntity.ok(response);
    }

    // Leave waitlist
    @DeleteMapping("/leave/{id}")
    public ResponseEntity<Void> leaveWaitlist(@PathVariable Long id) {
        waitlistService.leaveWaitlist(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/leave")
    public ResponseEntity<Void> leaveWaitlistPut(@PathVariable Long id) {
        waitlistService.leaveWaitlist(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> leaveWaitlistDelete(@PathVariable Long id) {
        waitlistService.leaveWaitlist(id);
        return ResponseEntity.noContent().build();
    }

    // Get waitlist by equipment
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<java.util.List<com.lab.backend.entity.Waitlist>> getWaitlistByEquipment(
            @PathVariable Long equipmentId) {
        return ResponseEntity.ok(waitlistService.getWaitlistByEquipment(equipmentId));
    }

    // Get user waitlist
    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<com.lab.backend.entity.Waitlist>> getWaitlistByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(waitlistService.getWaitlistByUser(userId));
    }
    
    // Get user's waitlist position
    @GetMapping("/position/{resourceId}/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<Integer> getWaitlistPosition(
            @PathVariable Long resourceId,
            @PathVariable Long userId) {
        
        Integer position = waitlistService.getUserPosition(resourceId, userId);
        return ResponseEntity.ok(position);
    }
    
    // Confirm and book from waitlist
    @PostMapping("/{waitlistId}/confirm-and-book")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<Booking> confirmAndBook(
            @PathVariable Long waitlistId) {
        
        Booking booking = waitlistService.confirmAndBook(waitlistId);
        return ResponseEntity.ok(booking);
    }
    
    // Get optimization report
    @GetMapping("/optimization-report/{resourceId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<BookingOptimizationLog> getOptimizationReport(
            @PathVariable Long resourceId) {
        
        BookingOptimizationLog log = optimizationService.getLatestOptimizationReport(resourceId);
        return ResponseEntity.ok(log);
    }
}
