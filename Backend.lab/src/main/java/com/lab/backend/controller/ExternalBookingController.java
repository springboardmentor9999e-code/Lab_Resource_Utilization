package com.lab.backend.controller;

import com.lab.backend.dto.ExternalBookingRequest;
import com.lab.backend.entity.ExternalBooking;
import com.lab.backend.service.ExternalBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-bookings")
@CrossOrigin(origins = "*")
public class ExternalBookingController {

    private final ExternalBookingService externalBookingService;

    public ExternalBookingController(ExternalBookingService externalBookingService) {
        this.externalBookingService = externalBookingService;
    }

    @PostMapping
    public ResponseEntity<ExternalBooking> createBooking(@RequestBody ExternalBookingRequest request) {
        return ResponseEntity.ok(externalBookingService.createExternalBooking(request));
    }

    @PostMapping("/book")
    public ResponseEntity<ExternalBooking> bookSharedEquipment(@RequestBody ExternalBookingRequest request) {
        return ResponseEntity.ok(externalBookingService.createExternalBooking(request));
    }

    @GetMapping
    public ResponseEntity<List<ExternalBooking>> getAllExternalBookings() {
        return ResponseEntity.ok(externalBookingService.getAllExternalBookings());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExternalBooking>> getBookingHistory(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(externalBookingService.getExternalBookingHistory(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternalBooking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(externalBookingService.getExternalBookingById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ExternalBooking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(externalBookingService.cancelExternalBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ExternalBooking> deleteBooking(@PathVariable Long id) {
        return ResponseEntity.ok(externalBookingService.cancelExternalBooking(id));
    }
}
