package com.lab.backend.controller;

import com.lab.backend.service.BookingOptimizationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking-optimization")
@CrossOrigin(origins = "*")
public class BookingOptimizationController {

    private final BookingOptimizationService bookingOptimizationService;

    public BookingOptimizationController(BookingOptimizationService bookingOptimizationService) {
        this.bookingOptimizationService = bookingOptimizationService;
    }

    @GetMapping("/next-slot/{equipmentId}")
    public ResponseEntity<Map<String, Object>> suggestNextAvailableSlot(
            @PathVariable Long equipmentId,
            @RequestParam(required = false, defaultValue = "1") Integer durationDays) {
        return ResponseEntity.ok(bookingOptimizationService.suggestNextAvailableSlot(equipmentId, durationDays));
    }

    @GetMapping("/alternatives/{equipmentId}")
    public ResponseEntity<List<Map<String, Object>>> suggestAlternativeEquipment(
            @PathVariable Long equipmentId) {
        return ResponseEntity.ok(bookingOptimizationService.suggestAlternativeEquipment(equipmentId));
    }

    @RequestMapping(value = {"/check-overlap", "/conflicts", "/detect-conflicts"}, method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> checkOverlap(
            @RequestParam Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(bookingOptimizationService.checkOverlap(equipmentId, startDate, endDate));
    }

    @PostMapping("/optimize/{equipmentId}")
    public ResponseEntity<Map<String, String>> optimizeSchedule(@PathVariable Long equipmentId) {
        bookingOptimizationService.optimizeResourceSchedule(equipmentId);
        return ResponseEntity.ok(Map.of("message", "Schedule optimization complete for equipment " + equipmentId));
    }
}
