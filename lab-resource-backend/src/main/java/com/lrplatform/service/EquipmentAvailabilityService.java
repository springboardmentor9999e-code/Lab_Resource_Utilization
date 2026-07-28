package com.lrplatform.service;

import com.lrplatform.dto.response.AvailabilitySlotResponse;
import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.enums.BookingStatus;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentAvailabilityService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    private static final LocalTime DAY_START = LocalTime.of(8, 0);
    private static final LocalTime DAY_END = LocalTime.of(20, 0);
    private static final int SLOT_MINUTES = 60;

    public AvailabilitySlotResponse getAvailability(Long equipmentId, LocalDate date) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found: " + equipmentId));

        List<Booking> bookings = bookingRepository.findByEquipmentIdAndBookingDate(equipmentId, date);

        List<AvailabilitySlotResponse.BookedSlot> bookedSlots = new ArrayList<>();
        for (Booking b : bookings) {
            if (b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED) {
                String bookedBy = b.getUser() != null
                        ? b.getUser().getFirstName() + " " + b.getUser().getLastName()
                        : "Unknown";
                bookedSlots.add(AvailabilitySlotResponse.BookedSlot.builder()
                        .start(b.getStartTime())
                        .end(b.getEndTime())
                        .status(b.getStatus().name())
                        .bookedBy(bookedBy)
                        .build());
            }
        }

        List<AvailabilitySlotResponse.TimeSlot> availableSlots = new ArrayList<>();
        LocalTime current = DAY_START;
        while (current.plusMinutes(SLOT_MINUTES).isBefore(DAY_END) || current.plusMinutes(SLOT_MINUTES).equals(DAY_END)) {
            LocalTime slotEnd = current.plusMinutes(SLOT_MINUTES);
            final LocalTime slotStart = current;
            boolean isBlocked = bookedSlots.stream().anyMatch(booked ->
                    slotStart.isBefore(booked.getEnd()) && slotEnd.isAfter(booked.getStart())
            );
            if (!isBlocked) {
                availableSlots.add(AvailabilitySlotResponse.TimeSlot.builder()
                        .start(slotStart)
                        .end(slotEnd)
                        .durationMinutes(SLOT_MINUTES)
                        .build());
            }
            current = slotEnd;
        }

        return AvailabilitySlotResponse.builder()
                .equipmentId(equipmentId)
                .equipmentName(equipment.getEquipmentName())
                .date(date)
                .dayStart(DAY_START)
                .dayEnd(DAY_END)
                .availableSlots(availableSlots)
                .bookedSlots(bookedSlots)
                .build();
    }

    public List<AvailabilitySlotResponse> getAvailabilityRange(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        List<AvailabilitySlotResponse> result = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                result.add(getAvailability(equipmentId, current));
            }
            current = current.plusDays(1);
        }
        return result;
    }
}
