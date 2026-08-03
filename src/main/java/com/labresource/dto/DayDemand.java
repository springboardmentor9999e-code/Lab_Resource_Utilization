package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DayDemand {
    private String dayOfWeek; // MONDAY, TUESDAY, ...
    private long count;
}
