package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.IssueReport;
import com.infosys.labresourceutilizationplatform.service.IssueReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:3000")
public class IssueReportController {

    @Autowired
    private IssueReportService issueReportService;

    @PostMapping
    public ResponseEntity<?> reportIssue(@RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Long equipmentId = Long.valueOf(payload.get("equipmentId").toString());
            String description = payload.get("description").toString();
            IssueReport report = issueReportService.reportIssue(equipmentId, description, principal.getName());
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllIssues(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            List<IssueReport> reports = issueReportService.getAllIssues(principal.getName());
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIssue(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            String status = payload.get("status").toString();
            String resolutionDetails = payload.containsKey("resolutionDetails") && payload.get("resolutionDetails") != null ? payload.get("resolutionDetails").toString() : "";
            IssueReport report = issueReportService.updateIssueStatus(id, status, resolutionDetails);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignIssue(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Integer technicianUserId = Integer.valueOf(payload.get("technicianUserId").toString());
            IssueReport report = issueReportService.assignIssue(id, technicianUserId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
