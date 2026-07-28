package com.lrplatform.dto.request;

import lombok.Data;

@Data
public class ReportGenerationRequest {
    private String reportType;
    private String dateFrom;
    private String dateTo;
    private Long departmentId;
    private Long institutionId;
    private String format;
}
