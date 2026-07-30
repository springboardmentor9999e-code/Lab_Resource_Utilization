package com.rems.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {
    private Long departmentId;
    private String name;
    private Long institutionId;
    private String institutionName;
    private Instant createdAt;
}
