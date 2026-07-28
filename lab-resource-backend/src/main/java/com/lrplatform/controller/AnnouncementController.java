package com.lrplatform.controller;

import com.lrplatform.dto.request.AnnouncementRequest;
import com.lrplatform.dto.response.AnnouncementResponse;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.AnnouncementService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements(HttpServletRequest httpRequest) {
        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long institutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (institutionId != null) {
                return ResponseEntity.ok(announcementService.getActiveAnnouncements(institutionId, null));
            }
        }
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements(
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements(institutionId, departmentId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AnnouncementResponse>> getMyAnnouncements(HttpServletRequest httpRequest) {
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(announcementService.getMyAnnouncements(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> getAnnouncementById(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.getAnnouncementById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestBody AnnouncementRequest request,
            HttpServletRequest httpRequest) {
        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long institutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (institutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            request.setInstitutionId(institutionId);
        }
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(announcementService.createAnnouncement(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody AnnouncementRequest request,
            HttpServletRequest httpRequest) {
        verifyAnnouncementAccess(id, httpRequest);
        Long userId = currentUserUtil.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable Long id, HttpServletRequest httpRequest) {
        verifyAnnouncementAccess(id, httpRequest);
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully"));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AnnouncementResponse> publishAnnouncement(@PathVariable Long id, HttpServletRequest httpRequest) {
        verifyAnnouncementAccess(id, httpRequest);
        return ResponseEntity.ok(announcementService.publishAnnouncement(id));
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AnnouncementResponse> unpublishAnnouncement(@PathVariable Long id, HttpServletRequest httpRequest) {
        verifyAnnouncementAccess(id, httpRequest);
        return ResponseEntity.ok(announcementService.unpublishAnnouncement(id));
    }

    private void verifyAnnouncementAccess(Long announcementId, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("SYSTEM_ADMIN")) {
            return;
        }
        AnnouncementResponse announcement = announcementService.getAnnouncementById(announcementId);
        Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
        if (myInstitutionId == null || !myInstitutionId.equals(announcement.getInstitutionId())) {
            throw new ForbiddenException("You can only manage announcements within your institution");
        }
    }
}
