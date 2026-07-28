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
public class LaboratoryResponse {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String laboratoryName;
    private Long labManagerId;
    private String labManagerName;
    private String location;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
