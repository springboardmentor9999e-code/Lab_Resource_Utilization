package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.SharingRequest;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.SharingRequestService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing-requests")
public class SharingRequestController {

    private final SharingRequestService sharingRequestService;
    private final CurrentUserService currentUserService;

    public SharingRequestController(SharingRequestService sharingRequestService,
                                     CurrentUserService currentUserService) {
        this.sharingRequestService = sharingRequestService;
        this.currentUserService = currentUserService;
    }

    // Item #8 fix: previously anyone authenticated could list or fetch any sharing
    // request regardless of role or institution, leaking cross-institution requester
    // identities and purposes. Now scoped per the Role-Operation Matrix's Read tier:
    // full-CRUD/approve roles see everything relevant to their scope, everyone else
    // only sees their own requests.
    @GetMapping
    public List<SharingRequest> getAllSharingRequests() {
        User currentUser = currentUserService.getCurrentUser();
        return sharingRequestService.getVisibleSharingRequests(currentUser);
    }

    @GetMapping("/{id}")
    public SharingRequest getSharingRequestById(@PathVariable Long id) {
        User currentUser = currentUserService.getCurrentUser();
        return sharingRequestService.getSharingRequestByIdForUser(id, currentUser);
    }

    // Matrix: STUDENT/RESEARCHER, LAB_TECHNICIAN, DEPARTMENT_HEAD = Read only.
    // LAB_MANAGER = Approve (and can request sharing on behalf of their lab).
    // INSTITUTION_ADMINISTRATOR / SYSTEM_ADMINISTRATOR = Full CRUD.
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'RESEARCHER', 'LAB_MANAGER', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public SharingRequest createSharingRequest(@RequestBody SharingRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        request.setRequestedBy(currentUser);
        return sharingRequestService.createSharingRequest(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public SharingRequest updateSharingRequest(@PathVariable Long id,
                                               @RequestBody SharingRequest request) {
        return sharingRequestService.updateSharingRequest(id, request);
    }

    // Matrix: LAB_MANAGER, DEPARTMENT_HEAD = Approve. Full-CRUD roles can also approve.
    // Approving also creates the actual Booking that grants access to the equipment -
    // this is what makes the sharing workflow functional end-to-end rather than just
    // a paper trail of approvals with no real access granted.
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public SharingRequest approveSharingRequest(@PathVariable Long id) {
        User approver = currentUserService.getCurrentUser();
        return sharingRequestService.approveSharingRequest(id, approver);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public SharingRequest rejectSharingRequest(@PathVariable Long id) {
        return sharingRequestService.rejectSharingRequest(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public void deleteSharingRequest(@PathVariable Long id) {
        sharingRequestService.deleteSharingRequest(id);
    }
}