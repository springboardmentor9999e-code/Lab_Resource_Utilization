package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class BookingLifecycleScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedRate = 5000) // every 5 seconds
    @Transactional
    public void updateBookingLifecycles() {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        List<Booking> bookings = bookingRepository.findAll();

        for (Booking b : bookings) {
            if (b.getBookingDate() == null || b.getStartTime() == null || b.getEndTime() == null) {
                continue;
            }

            LocalDateTime start = LocalDateTime.of(b.getBookingDate(), b.getStartTime());
            LocalDateTime end = LocalDateTime.of(b.getBookingDate(), b.getEndTime());
            String status = b.getStatus();

            Long userId = (b.getUser() != null && b.getUser().getUserId() != null) ? Long.valueOf(b.getUser().getUserId()) : null;
            Long instId = (b.getEquipment() != null && b.getEquipment().getLaboratory() != null &&
                           b.getEquipment().getLaboratory().getDepartment() != null &&
                           b.getEquipment().getLaboratory().getDepartment().getInstitution() != null) ?
                           b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
            String equipName = b.getEquipment() != null ? b.getEquipment().getEquipmentName() : "Equipment";

            // 1. Expiry check
            if ("Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) {
                if (start.isBefore(now)) {
                    b.setStatus("Expired");
                    bookingRepository.save(b);
                    notificationService.sendNotification(userId, null, instId, "Booking Expired", "Your booking request for " + equipName + " on " + b.getBookingDate() + " has expired.", "BOOKING");
                    continue;
                }
            }

            // 2. Lifecycle status transitions
            if ("Confirmed".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status) 
                    || "Booked".equalsIgnoreCase(status) || "In Use".equalsIgnoreCase(status) || "Active".equalsIgnoreCase(status)) {
                
                if (now.isBefore(start)) {
                    if (!"Booked".equalsIgnoreCase(status)) {
                        b.setStatus("Booked");
                        bookingRepository.save(b);
                    }
                } else if ((now.isAfter(start) || now.isEqual(start)) && now.isBefore(end)) {
                    if (!"In Use".equalsIgnoreCase(status)) {
                        b.setStatus("In Use");
                        bookingRepository.save(b);
                        notificationService.sendNotification(userId, null, instId, "Booking Started", "Your booking for " + equipName + " has started.", "BOOKING");
                    }
                } else if (now.isAfter(end) || now.isEqual(end)) {
                    if (!"Completed".equalsIgnoreCase(status)) {
                        b.setStatus("Completed");
                        bookingRepository.save(b);
                        notificationService.sendNotification(userId, null, instId, "Booking Completed", "Your booking for " + equipName + " has completed automatically.", "BOOKING");
                        notificationService.sendNotification(userId, null, instId, "Equipment Returned", "Equipment " + equipName + " has been marked as returned.", "EQUIPMENT");
                    }
                }
            }
        }

        // 3. Equipment Status Synchronization
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            String currentEqStatus = eq.getStatus();
            
            // Skip sync if status is maintenance or retired
            if ("Under Maintenance".equalsIgnoreCase(currentEqStatus) 
                    || "Out of Service".equalsIgnoreCase(currentEqStatus) 
                    || "Retired".equalsIgnoreCase(currentEqStatus)) {
                continue;
            }

            // Check if there is an active booking currently "In Use"
            boolean inUseActive = bookings.stream()
                    .filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(eq.getId()))
                    .filter(b -> "In Use".equalsIgnoreCase(b.getStatus()))
                    .anyMatch(b -> {
                        LocalDateTime start = LocalDateTime.of(b.getBookingDate(), b.getStartTime());
                        LocalDateTime end = LocalDateTime.of(b.getBookingDate(), b.getEndTime());
                        return now.isAfter(start) && now.isBefore(end);
                    });

            // Check if there is a booking approved but not yet started ("Booked")
            boolean bookedActive = bookings.stream()
                    .filter(b -> b.getEquipment() != null && b.getEquipment().getId().equals(eq.getId()))
                    .filter(b -> "Booked".equalsIgnoreCase(b.getStatus()) || "Approved".equalsIgnoreCase(b.getStatus()) || "Confirmed".equalsIgnoreCase(b.getStatus()))
                    .anyMatch(b -> {
                        LocalDateTime start = LocalDateTime.of(b.getBookingDate(), b.getStartTime());
                        return now.isBefore(start);
                    });

            if (inUseActive) {
                if (!"In Use".equalsIgnoreCase(currentEqStatus)) {
                    eq.setStatus("In Use");
                    equipmentRepository.save(eq);
                }
            } else if (bookedActive) {
                if (!"Booked".equalsIgnoreCase(currentEqStatus)) {
                    eq.setStatus("Booked");
                    equipmentRepository.save(eq);
                }
            } else {
                if ("In Use".equalsIgnoreCase(currentEqStatus) || "Booked".equalsIgnoreCase(currentEqStatus)) {
                    eq.setStatus("Available");
                    equipmentRepository.save(eq);
                }
            }
        }
    }
}
