package com.labresource.controller;

import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.LabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final LabRepository labRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        // Real counts only — no seed/placeholder fallbacks.
        long totalEquipment = equipmentRepository.count();
        long activeDevices = equipmentRepository.countByStatus("AVAILABLE")
                + equipmentRepository.countByStatus("RESERVED");
        long pendingRequests = bookingRepository.countByStatus("PENDING");
        long bookedLabs = bookingRepository.countApprovedBookings();

        // Inventory by category (real counts)
        List<Map<String, Object>> categoryCounts = new ArrayList<>();
        for (Object[] row : equipmentRepository.countByCategory()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", row[0]);
            entry.put("count", row[1]);
            categoryCounts.add(entry);
        }

        // Bookings per day over the last 7 days (real counts, zero-filled)
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(6);
        Map<LocalDate, Long> perDay = new HashMap<>();
        for (Object[] row : bookingRepository.countPerDay(from, today)) {
            perDay.put((LocalDate) row[0], (Long) row[1]);
        }
        List<Map<String, Object>> weeklyBookings = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("day", d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("date", d.toString());
            entry.put("bookings", perDay.getOrDefault(d, 0L));
            weeklyBookings.add(entry);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("bookedLabs", bookedLabs);
        stats.put("activeDevices", activeDevices);
        stats.put("totalEquipment", totalEquipment);
        stats.put("pendingRequests", pendingRequests);
        stats.put("categoryCounts", categoryCounts);
        stats.put("weeklyBookings", weeklyBookings);

        return ResponseEntity.ok(stats);
    }
}
