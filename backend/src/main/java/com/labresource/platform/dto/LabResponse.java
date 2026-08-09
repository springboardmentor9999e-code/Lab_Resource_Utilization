package com.labresource.platform.dto;

import com.labresource.platform.entity.Lab;
import java.time.LocalDateTime;

public record LabResponse(
        Long id,
        String name,
        String building,
        String roomNumber,
        Integer capacity,
        String description,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static LabResponse from(Lab lab) {
        return new LabResponse(
                lab.getId(),
                lab.getName(),
                lab.getBuilding(),
                lab.getRoomNumber(),
                lab.getCapacity(),
                lab.getDescription(),
                lab.getActive(),
                lab.getCreatedAt(),
                lab.getUpdatedAt()
        );
    }
}
