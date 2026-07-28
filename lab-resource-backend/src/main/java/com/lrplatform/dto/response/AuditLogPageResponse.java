package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogPageResponse {
    private List<AuditLogResponse> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
