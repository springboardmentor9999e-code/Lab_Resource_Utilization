package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeatmapCellResponse {

    private int dayOfWeek; // 1 = Monday .. 7 = Sunday (ISO)
    private int hour;      // 8 .. 19 (start of each 1-hour slot in the 08:00-20:00 operating day)
    private long bookings; // bookings overlapping this slot
    private long minutes;  // total booked minutes falling inside this slot
}
