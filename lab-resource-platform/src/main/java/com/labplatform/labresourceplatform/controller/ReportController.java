package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.ReportPdfService;
import com.labplatform.labresourceplatform.service.ReportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Milestone 3, task (v): downloadable utilization effectiveness and cost
// analysis reports. Same role tier as billing (LAB_MANAGER and up) rather
// than the platform-wide Read tier used for Equipment/Maintenance - a report
// combines cost data with operational data, so it's treated as management-tier
// information the same way billing itself is.
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportPdfService reportPdfService;
    private final CurrentUserService currentUserService;

    public ReportController(ReportService reportService,
                             ReportPdfService reportPdfService,
                             CurrentUserService currentUserService) {
        this.reportService = reportService;
        this.reportPdfService = reportPdfService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/utilization-cost-analysis")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        User currentUser = currentUserService.getCurrentUser();

        // Defaults to the last 30 days if no window is given - matches the
        // default window already used elsewhere (e.g. calibration reminders).
        LocalDateTime toDate = to != null ? LocalDateTime.parse(to) : LocalDateTime.now();
        LocalDateTime fromDate = from != null ? LocalDateTime.parse(from) : toDate.minusDays(30);

        ReportService.ReportData data = reportService.buildReport(currentUser, fromDate, toDate);

        String institutionLabel = currentUser.getInstitution() != null
                ? currentUser.getInstitution().getInstitutionName()
                : "All Institutions";

        byte[] pdf = reportPdfService.renderPdf(data, institutionLabel);

        String filename = "lab-report-" + fromDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                + "-to-" + toDate.format(DateTimeFormatter.ISO_LOCAL_DATE) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
