package com.lab.backend.service;

import com.lab.backend.entity.*;
import com.lab.backend.enums.*;
import com.lab.backend.repository.*;
import com.lab.backend.dto.WaitlistRequestDTO;
import com.lab.backend.dto.WaitlistResponseDTO;
import com.lab.backend.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WaitlistService {
    
    @Autowired
    private WaitlistRepository waitlistRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private EquipmentRepository equipmentRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private BookingOptimizationService optimizationService;
    
    // Step 1: Add user to waitlist
    public WaitlistResponseDTO addToWaitlist(WaitlistRequestDTO dto) {
        
        // Validate equipment
        Equipment equipment = equipmentRepo.findById(dto.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        
        // Validate user
        User user = userRepo.findById(dto.getUserId())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Check if already in waitlist for this date range
        Optional<Waitlist> existing = waitlistRepo.findByEquipmentIdAndUserId(
            dto.getResourceId(), dto.getUserId());
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("User already in waitlist for this equipment");
        }
        
        // Create waitlist entry
        Waitlist waitlist = new Waitlist();
        waitlist.setEquipment(equipment);
        waitlist.setUser(user);
        waitlist.setDesiredStartDate(dto.getStartDate());
        waitlist.setDesiredEndDate(dto.getEndDate());
        waitlist.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        waitlist.setStatus(WaitlistStatus.WAITING);
        
        // Calculate position
        Integer position = waitlistRepo.countByResourceAndStatus(
            dto.getResourceId(), WaitlistStatus.WAITING) + 1;
        waitlist.setPositionInQueue(position);
        
        Waitlist saved = waitlistRepo.save(waitlist);
        
        return new WaitlistResponseDTO(
            saved.getId(),
            saved.getEquipment().getId(),
            saved.getUser().getId(),
            saved.getDesiredStartDate(),
            saved.getDesiredEndDate(),
            saved.getPositionInQueue(),
            saved.getStatus(),
            saved.getPriority()
        );
    }
    
    // Step 2: Get user's position
    public Integer getUserPosition(Long resourceId, Long userId) {
        Waitlist waitlist = waitlistRepo.findByEquipmentIdAndUserId(resourceId, userId)
            .orElseThrow(() -> new RuntimeException("User not in waitlist"));
        
        return waitlist.getPositionInQueue();
    }
    
    // Step 3: Check availability periodically (run every 5 minutes)
    @Scheduled(fixedRate = 300000)  // 5 minutes
    public void processWaitlist() {
        // Get all waiting entries sorted by priority and date
        List<Waitlist> allWaiting = waitlistRepo.findByStatusOrderedByPriority(WaitlistStatus.WAITING);
        
        for (Waitlist entry : allWaiting) {
            boolean available = isDateRangeAvailable(
                entry.getEquipment().getId(),
                entry.getDesiredStartDate(),
                entry.getDesiredEndDate());
            
            if (available) {
                notifyUser(entry);
            }
        }
    }
    
    // Step 4: Notify user when slot becomes available
    private void notifyUser(Waitlist entry) {
        entry.setStatus(WaitlistStatus.NOTIFIED);
        waitlistRepo.save(entry);
        
        // Send email notification
        emailService.sendWaitlistNotification(
            entry.getUser().getEmail(),
            entry.getEquipment().getName(),
            entry.getDesiredStartDate(),
            entry.getDesiredEndDate(),
            entry.getId()
        );
    }
    
    // Step 5: User confirms and books the resource
    public Booking confirmAndBook(Long waitlistId) {
        Waitlist entry = waitlistRepo.findById(waitlistId)
            .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));
        
        if (!entry.getStatus().equals(WaitlistStatus.NOTIFIED)) {
            throw new IllegalStateException("Can only book from NOTIFIED status");
        }
        
        // Double-check availability
        boolean available = isDateRangeAvailable(
            entry.getEquipment().getId(),
            entry.getDesiredStartDate(),
            entry.getDesiredEndDate());
        
        if (!available) {
            throw new ResourceNotAvailableException("Equipment no longer available");
        }
        
        // Create booking
        Booking booking = new Booking();
        booking.setEquipment(entry.getEquipment());
        booking.setUser(entry.getUser());
        booking.setBookingDate(entry.getDesiredStartDate());
        booking.setReturnDate(entry.getDesiredEndDate());
        booking.setStatus(BookingStatus.APPROVED);
        
        Booking savedBooking = bookingRepo.save(booking);
        
        // Update waitlist
        entry.setStatus(WaitlistStatus.BOOKED);
        waitlistRepo.save(entry);
        
        // Trigger optimization
        optimizationService.optimizeResourceSchedule(entry.getEquipment().getId());
        
        return savedBooking;
    }
    
    // Step 6: Check if date range is available
    private boolean isDateRangeAvailable(Long resourceId, LocalDate startDate, LocalDate endDate) {
        long conflicts = bookingRepo.countConflictingBookings(resourceId, startDate, endDate);
        return conflicts == 0;
    }

    public void leaveWaitlist(Long waitlistId) {
        Waitlist entry = waitlistRepo.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found with ID: " + waitlistId));
        entry.setStatus(WaitlistStatus.CANCELLED);
        waitlistRepo.save(entry);
    }

    public List<Waitlist> getWaitlistByEquipment(Long equipmentId) {
        return waitlistRepo.findByEquipmentId(equipmentId);
    }

    public List<Waitlist> getWaitlistByUser(Long userId) {
        return waitlistRepo.findByUserId(userId);
    }
}
