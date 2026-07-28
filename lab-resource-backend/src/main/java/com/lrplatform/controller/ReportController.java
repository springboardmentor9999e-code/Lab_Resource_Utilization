package com.lrplatform.controller;

import com.lrplatform.dto.request.ReportGenerationRequest;
import com.lrplatform.dto.response.ReportResponse;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ReportResponse> generateReport(
            @RequestBody ReportGenerationRequest request,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        String userName = currentUserUtil.getCurrentUserName(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.generateReport(request, userId, userName));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @SuppressWarnings("null")
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long id) {
        ReportResponse report = reportService.getReportById(id);
        File file = new File(report.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(file);
        String encodedFileName = URLEncoder.encode(report.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getFileName() + "\"; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }
}
