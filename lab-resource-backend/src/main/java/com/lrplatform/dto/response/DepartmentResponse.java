package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String departmentName;
    private Long hodId;
    private String hodName;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
