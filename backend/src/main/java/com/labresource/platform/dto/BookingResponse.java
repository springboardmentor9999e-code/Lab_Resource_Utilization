package com.labresource.platform.dto;

import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.User;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long userId,
        String userFirstName,
        String userLastName,
        String userEmail,
        Long equipmentId,
        String equipmentName,
        Integer quantity,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String purpose,
        BookingStatus status,
        String rejectionReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static BookingResponse from(Booking booking) {
        User user = booking.getUser();
        Equipment equipment = booking.getEquipment();

        return new BookingResponse(
                booking.getId(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                equipment.getId(),
                equipment.getName(),
                booking.getQuantity(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getStatus(),
                booking.getRejectionReason(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
