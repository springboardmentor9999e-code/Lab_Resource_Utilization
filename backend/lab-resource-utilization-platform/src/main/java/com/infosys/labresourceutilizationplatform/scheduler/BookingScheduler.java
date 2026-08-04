package com.infosys.labresourceutilizationplatform.scheduler;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class BookingScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Scheduled(fixedRate = 60000)
    public void processAutomaticTransitions() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Confirmed / Approved -> In Use
        List<Booking> confirmedBookings = new ArrayList<>();
        confirmedBookings.addAll(bookingRepository.findByStatus("Confirmed"));
        confirmedBookings.addAll(bookingRepository.findByStatus("Approved"));
        
        for (Booking b : confirmedBookings) {
            if (b.getBookingDate().isBefore(today) || 
               (b.getBookingDate().isEqual(today) && !b.getStartTime().isAfter(now))) {
                
                b.setStatus("In Use");
                bookingRepository.save(b);
                System.out.println("Booking #" + b.getBookingId() + " transitioned to IN USE");
            }
        }

        // 2. In Use -> Completed
        List<Booking> inUseBookings = bookingRepository.findByStatus("In Use");
        for (Booking b : inUseBookings) {
            if (b.getBookingDate().isBefore(today) || 
               (b.getBookingDate().isEqual(today) && !b.getEndTime().isAfter(now))) {
                
                b.setStatus("Completed");
                bookingRepository.save(b);
                System.out.println("Booking #" + b.getBookingId() + " transitioned to COMPLETED");

                // Release equipment
                Equipment eq = b.getEquipment();
                if (eq != null) {
                    if (!"Under Maintenance".equalsIgnoreCase(eq.getStatus()) 
                        && !"Out of Service".equalsIgnoreCase(eq.getStatus())
                        && !"Retired".equalsIgnoreCase(eq.getStatus())) {
                        eq.setStatus("Available");
                        equipmentRepository.save(eq);
                    }
                }

                // Promote waitlisted
                promoteWaitlistedBookingsForEquipment(eq);
            }
        }
    }

    private void promoteWaitlistedBookingsForEquipment(Equipment equipment) {
        if (equipment == null) return;
        
        List<Booking> allWaitlisted = bookingRepository.findByStatus("Waitlisted");
        for (Booking b : allWaitlisted) {
            if (b.getEquipment() == null || !b.getEquipment().getId().equals(equipment.getId())) {
                continue;
            }

            List<Booking> sameDayBookings = bookingRepository.findByEquipmentIdAndBookingDate(
                    equipment.getId(), b.getBookingDate()
            );
            
            boolean stillHasOverlap = false;
            for (Booking existing : sameDayBookings) {
                if (existing.getBookingId().equals(b.getBookingId())) {
                    continue;
                }
                
                if ("Confirmed".equalsIgnoreCase(existing.getStatus()) || 
                    "Approved".equalsIgnoreCase(existing.getStatus()) ||
                    "In Use".equalsIgnoreCase(existing.getStatus())) {
                    
                    if (b.getStartTime().isBefore(existing.getEndTime()) && 
                        b.getEndTime().isAfter(existing.getStartTime())) {
                        stillHasOverlap = true;
                        break;
                    }
                }
            }
            
            if (!stillHasOverlap) {
                b.setStatus("Pending Approval");
                bookingRepository.save(b);
                System.out.println("Scheduler: Promoted waitlisted booking #" + b.getBookingId() + " to Pending Approval");
            }
        }
    }
}
