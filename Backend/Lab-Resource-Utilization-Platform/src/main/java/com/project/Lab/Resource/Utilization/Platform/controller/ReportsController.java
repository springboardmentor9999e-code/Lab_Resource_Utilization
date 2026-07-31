package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.ReportDTO;
import com.project.Lab.Resource.Utilization.Platform.service.ReportsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    // ==========================================================
    // GET REPORTS
    // All Logged-in Users
    // ==========================================================
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<ReportDTO> getReports() {

        return reportsService.getReports();

    }

    // ==========================================================
    // EXPORT CSV
    // All Logged-in Users
    // ==========================================================
    @GetMapping("/export/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String type
    ) {

        String csv = reportsService.exportCsv(type);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + type + ".csv\""
                )
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes(StandardCharsets.UTF_8));

    }

}