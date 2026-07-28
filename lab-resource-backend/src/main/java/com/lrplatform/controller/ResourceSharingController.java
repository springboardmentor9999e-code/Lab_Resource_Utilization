package com.lrplatform.controller;

import com.lrplatform.dto.request.ExternalBookingRequestDto;
import com.lrplatform.dto.request.PartnershipRequest;
import com.lrplatform.dto.request.ShareEquipmentRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.ExternalBookingRequestResponse;
import com.lrplatform.dto.response.PartnershipResponse;
import com.lrplatform.dto.response.SharingAnalyticsResponse;
import com.lrplatform.dto.response.SharedEquipmentResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.ResourceSharingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sharing")
@RequiredArgsConstructor
public class ResourceSharingController {

    private final ResourceSharingService resourceSharingService;
    private final CurrentUserUtil currentUserUtil;

    private Long getInstitutionIdIfInstitutionAdmin(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            return myInstitutionId;
        }
        return null;
    }

    private Long getDepartmentIdIfDepartmentHead(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long departmentId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            if (departmentId == null) {
                throw new ForbiddenException("No department assigned to your account");
            }
            return departmentId;
        }
        return null;
    }

    // ==================== Shared Equipment Endpoints ====================

    @GetMapping("/equipment")
    public ResponseEntity<List<SharedEquipmentResponse>> getAllSharedEquipment(HttpServletRequest request) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(request);
        if (institutionId != null) {
            return ResponseEntity.ok(resourceSharingService.getAllSharedEquipmentByInstitution(institutionId));
        }
        return ResponseEntity.ok(resourceSharingService.getAllSharedEquipment());
    }

    @GetMapping("/equipment/{id}")
    public ResponseEntity<SharedEquipmentResponse> getSharedEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingService.getSharedEquipmentById(id));
    }

    @PostMapping("/equipment")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<SharedEquipmentResponse> shareEquipment(@RequestBody ShareEquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceSharingService.shareEquipment(request));
    }

    @PutMapping("/equipment/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<SharedEquipmentResponse> updateSharedEquipment(
            @PathVariable Long id,
            @RequestBody ShareEquipmentRequest request) {
        return ResponseEntity.ok(resourceSharingService.updateSharedEquipment(id, request));
    }

    @DeleteMapping("/equipment/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> stopSharing(@PathVariable Long id) {
        resourceSharingService.stopSharing(id);
        return ResponseEntity.ok(ApiResponse.success("Sharing stopped successfully"));
    }

    // ==================== Partnership Endpoints ====================

    @GetMapping("/partnerships")
    public ResponseEntity<List<PartnershipResponse>> getAllPartnerships(HttpServletRequest request) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(request);
        if (institutionId != null) {
            return ResponseEntity.ok(resourceSharingService.getAllPartnershipsByInstitution(institutionId));
        }
        return ResponseEntity.ok(resourceSharingService.getAllPartnerships());
    }

    @GetMapping("/partnerships/{id}")
    public ResponseEntity<PartnershipResponse> getPartnershipById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingService.getPartnershipById(id));
    }

    @PostMapping("/partnerships")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PartnershipResponse> createPartnership(@RequestBody PartnershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceSharingService.createPartnership(request));
    }

    @PutMapping("/partnerships/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PartnershipResponse> updatePartnership(
            @PathVariable Long id,
            @RequestBody PartnershipRequest request) {
        return ResponseEntity.ok(resourceSharingService.updatePartnership(id, request));
    }

    @DeleteMapping("/partnerships/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> deletePartnership(@PathVariable Long id) {
        resourceSharingService.deletePartnership(id);
        return ResponseEntity.ok(ApiResponse.success("Partnership deleted successfully"));
    }

    // ==================== External Booking Endpoints ====================

    @GetMapping("/external-bookings")
    public ResponseEntity<List<ExternalBookingRequestResponse>> getAllExternalBookingRequests(HttpServletRequest request) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(request);
        Long departmentId = getDepartmentIdIfDepartmentHead(request);
        if (institutionId != null) {
            return ResponseEntity.ok(resourceSharingService.getAllExternalBookingRequestsByInstitution(institutionId));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(resourceSharingService.getAllExternalBookingRequestsByDepartment(departmentId));
        }
        return ResponseEntity.ok(resourceSharingService.getAllExternalBookingRequests());
    }

    @GetMapping("/external-bookings/status/{status}")
    public ResponseEntity<List<ExternalBookingRequestResponse>> getExternalBookingRequestsByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(resourceSharingService.getExternalBookingRequestsByStatus(status));
    }

    @PostMapping("/external-bookings")
    public ResponseEntity<ExternalBookingRequestResponse> createExternalBookingRequest(
            @RequestBody ExternalBookingRequestDto request,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceSharingService.createExternalBookingRequest(request, userId));
    }

    @PutMapping("/external-bookings/{id}/approve")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<ExternalBookingRequestResponse> approveExternalBookingRequest(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(resourceSharingService.approveExternalBookingRequest(id, userId));
    }

    @PutMapping("/external-bookings/{id}/reject")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<ExternalBookingRequestResponse> rejectExternalBookingRequest(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(resourceSharingService.rejectExternalBookingRequest(id, userId));
    }

    // ==================== Analytics Endpoint ====================

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<SharingAnalyticsResponse> getSharingAnalytics(HttpServletRequest request) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(request);
        if (institutionId != null) {
            return ResponseEntity.ok(resourceSharingService.getSharingAnalyticsByInstitution(institutionId));
        }
        return ResponseEntity.ok(resourceSharingService.getSharingAnalytics());
    }
}
