package com.lab.backend.controller;

import com.lab.backend.dto.ReportDTO;
import com.lab.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ReportDTO> getDashboardReport() {

        return ResponseEntity.ok(
                reportService.getDashboardReport()
        );
    }
}