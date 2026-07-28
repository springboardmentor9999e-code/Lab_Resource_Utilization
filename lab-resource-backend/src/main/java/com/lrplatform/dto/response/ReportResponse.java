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
public class ReportResponse {
    private Long id;
    private String reportType;
    private String fileName;
    private String filePath;
    private String format;
    private String status;
    private LocalDateTime generatedAt;
    private Long generatedBy;
    private String generatedByName;
}
