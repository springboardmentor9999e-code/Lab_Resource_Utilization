package com.lrplatform.controller;

import com.lrplatform.dto.response.DashboardAnalytics;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<DashboardAnalytics> getDashboardAnalytics(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            return ResponseEntity.ok(analyticsService.getDashboardAnalyticsByInstitution(myInstitutionId));
        }
        if (currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long departmentId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            if (departmentId == null) {
                throw new ForbiddenException("No department assigned to your account");
            }
            return ResponseEntity.ok(analyticsService.getDashboardAnalyticsByDepartment(departmentId));
        }
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }
}
