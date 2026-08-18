package com.lab.backend.service;

import com.lab.backend.entity.*;
import com.lab.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingOptimizationService {
    
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private BookingOptimizationLogRepository logRepo;
    @Autowired
    private EquipmentRepository equipmentRepo;
    
    private static final int YEAR_IN_DAYS = 365;
    
    // Step 1: Optimize resource schedule
    public void optimizeResourceSchedule(Long equipmentId) {
        
        // Get all bookings for equipment
        List<Booking> bookings = bookingRepo.findByEquipmentIdOrderByBookingDate(equipmentId);
        
        // Calculate efficiency
        double efficiency = calculateEfficiency(bookings);
        
        // Detect gaps
        List<BookingGap> gaps = detectGaps(bookings);
        
        // Log optimization result
        BookingOptimizationLog log = new BookingOptimizationLog();
        Equipment equipment = equipmentRepo.findById(equipmentId)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        log.setEquipment(equipment);
        log.setSlotsOptimized(bookings.size());
        log.setOverlappingBookingsDetected(detectOverlaps(bookings));
        log.setEfficiencyScore(BigDecimal.valueOf(efficiency));
        
        logRepo.save(log);
    }
    
    // Step 2: Calculate efficiency score
    private double calculateEfficiency(List<Booking> bookings) {
        if (bookings.isEmpty()) {
            return 0.0;
        }
        
        long bookedDays = bookings.stream()
            .mapToLong(b -> ChronoUnit.DAYS.between(b.getBookingDate(), b.getReturnDate()) + 1)
            .sum();
        
        double efficiency = (double) bookedDays / YEAR_IN_DAYS * 100;
        return Math.min(efficiency, 100.0);  // Cap at 100%
    }
    
    // Step 3: Detect gaps in bookings
    private List<BookingGap> detectGaps(List<Booking> bookings) {
        List<BookingGap> gaps = new ArrayList<>();
        
        if (bookings.size() < 2) {
            return gaps;
        }
        
        for (int i = 0; i < bookings.size() - 1; i++) {
            Booking current = bookings.get(i);
            Booking next = bookings.get(i + 1);
            
            LocalDate gapStart = current.getReturnDate().plusDays(1);
            LocalDate gapEnd = next.getBookingDate().minusDays(1);
            
            if (gapStart.isBefore(gapEnd) || gapStart.equals(gapEnd)) {
                long gapDays = ChronoUnit.DAYS.between(gapStart, gapEnd) + 1;
                gaps.add(new BookingGap(gapStart, gapEnd, gapDays));
            }
        }
        
        return gaps;
    }
    
    // Step 4: Detect overlapping bookings
    private Integer detectOverlaps(List<Booking> bookings) {
        int overlapCount = 0;
        
        for (int i = 0; i < bookings.size(); i++) {
            for (int j = i + 1; j < bookings.size(); j++) {
                Booking b1 = bookings.get(i);
                Booking b2 = bookings.get(j);
                
                if (b1.getBookingDate().isBefore(b2.getReturnDate()) &&
                    b2.getBookingDate().isBefore(b1.getReturnDate())) {
                    overlapCount++;
                }
            }
        }
        
        return overlapCount;
    }
    
    // Step 5: Get optimization report
    public BookingOptimizationLog getLatestOptimizationReport(Long equipmentId) {
        List<BookingOptimizationLog> logs = logRepo
            .findByEquipmentIdOrderByOptimizationTimestampDesc(
                equipmentId, org.springframework.data.domain.PageRequest.of(0, 1));
        
        return logs.isEmpty() ? null : logs.get(0);
    }

    // Step 6: Suggest next available slot
    public Map<String, Object> suggestNextAvailableSlot(Long equipmentId, Integer durationDays) {
        if (durationDays == null || durationDays <= 0) {
            durationDays = 1;
        }

        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        List<Booking> activeBookings = bookingRepo.findByEquipmentIdOrderByBookingDate(equipmentId).stream()
                .filter(b -> b.getStatus() == com.lab.backend.enums.BookingStatus.APPROVED ||
                             b.getStatus() == com.lab.backend.enums.BookingStatus.PENDING ||
                             b.getStatus() == com.lab.backend.enums.BookingStatus.ISSUED)
                .collect(Collectors.toList());

        LocalDate suggestedStart = LocalDate.now();

        for (Booking booking : activeBookings) {
            LocalDate bookingEnd = booking.getReturnDate();
            if (bookingEnd != null && (suggestedStart.isBefore(bookingEnd) || suggestedStart.equals(bookingEnd))) {
                suggestedStart = bookingEnd.plusDays(1);
            }
        }

        LocalDate suggestedEnd = suggestedStart.plusDays(durationDays - 1);

        Map<String, Object> result = new HashMap<>();
        result.put("equipmentId", equipmentId);
        result.put("equipmentName", equipment.getName());
        result.put("suggestedStartDate", suggestedStart);
        result.put("suggestedEndDate", suggestedEnd);
        result.put("durationDays", durationDays);
        return result;
    }

    // Step 7: Suggest alternative equipment
    public List<Map<String, Object>> suggestAlternativeEquipment(Long equipmentId) {
        Equipment current = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        List<Equipment> alternatives = equipmentRepo.findAll().stream()
                .filter(e -> !e.getId().equals(equipmentId))
                .filter(e -> (e.getCategory() != null && e.getCategory().equalsIgnoreCase(current.getCategory())) ||
                             (e.getLaboratory() != null && current.getLaboratory() != null &&
                              e.getLaboratory().getId().equals(current.getLaboratory().getId())))
                .filter(e -> e.getStatus() == com.lab.backend.enums.EquipmentStatus.AVAILABLE || e.getAvailableQuantity() > 0)
                .collect(Collectors.toList());

        return alternatives.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("equipmentId", e.getId());
            map.put("name", e.getName());
            map.put("category", e.getCategory());
            map.put("availableQuantity", e.getAvailableQuantity());
            map.put("status", e.getStatus());
            return map;
        }).collect(Collectors.toList());
    }

    // Step 8: Prevent / check overlapping bookings
    public Map<String, Object> checkOverlap(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        List<com.lab.backend.enums.BookingStatus> activeStatuses = Arrays.asList(
                com.lab.backend.enums.BookingStatus.PENDING,
                com.lab.backend.enums.BookingStatus.APPROVED,
                com.lab.backend.enums.BookingStatus.ISSUED
        );

        List<Booking> overlapping = bookingRepo.findByEquipmentIdAndStatusInAndBookingDateLessThanEqualAndReturnDateGreaterThanEqual(
                equipmentId, activeStatuses, endDate, startDate
        );

        boolean isOverlapping = !overlapping.isEmpty();

        Map<String, Object> result = new HashMap<>();
        result.put("equipmentId", equipmentId);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("isOverlapping", isOverlapping);
        result.put("overlappingBookingCount", overlapping.size());
        return result;
    }
}

// Helper class
class BookingGap {
    LocalDate startDate;
    LocalDate endDate;
    Long gapDays;
    
    public BookingGap(LocalDate startDate, LocalDate endDate, Long gapDays) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.gapDays = gapDays;
    }
}
