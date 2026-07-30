package com.rems.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabResponse {
    private Long labId;
    private String name;
    private Long departmentId;
    private String departmentName;
    private Instant createdAt;
    private Instant updatedAt;
}
