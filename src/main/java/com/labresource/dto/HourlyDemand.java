package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HourlyDemand {
    private int hour;    // 0-23
    private long count;
}
