package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.RoleChangeRequest;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.RoleChangeRequestService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-change-requests")
public class RoleChangeRequestController {

    private final RoleChangeRequestService roleChangeRequestService;
    private final CurrentUserService currentUserService;

    public RoleChangeRequestController(RoleChangeRequestService roleChangeRequestService,
                                        CurrentUserService currentUserService) {
        this.roleChangeRequestService = roleChangeRequestService;
        this.currentUserService = currentUserService;
    }

    // INSTITUTION_ADMINISTRATOR: pending requests from their own institution's users.
    // SYSTEM_ADMINISTRATOR: pending requests across every institution.
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public List<RoleChangeRequest> getPendingRequests() {
        User currentUser = currentUserService.getCurrentUser();
        return roleChangeRequestService.getPendingRequests(currentUser);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public RoleChangeRequest approve(@PathVariable Long id) {
        User reviewer = currentUserService.getCurrentUser();
        return roleChangeRequestService.approve(id, reviewer);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public RoleChangeRequest reject(@PathVariable Long id) {
        User reviewer = currentUserService.getCurrentUser();
        return roleChangeRequestService.reject(id, reviewer);
    }
}
