package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Lab;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.LabService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labs")
public class LabController {

    private final LabService labService;
    private final CurrentUserService currentUserService;

    public LabController(LabService labService, CurrentUserService currentUserService){
        this.labService = labService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<Lab> getAllLabs(@RequestParam(required = false) Long institutionId){
        if (institutionId != null) {
            return labService.getLabsByInstitution(institutionId);
        }
        return labService.getAllLabs();
    }

    @GetMapping("/{id}")
    public Lab getLabById(@PathVariable Long id){
        return labService.getLabById(id);
    }

    // LAB_MANAGER may create labs, but only within their own institution -
    // there's no "managed labs" ownership field on Lab, so institution
    // membership is the closest available scope (same pattern as
    // INSTITUTION_ADMINISTRATOR's own-institution restriction elsewhere).
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER')")
    public Lab createLab(@RequestBody Lab lab){
        assertLabManagerOwnInstitution(lab.getInstitution() != null ? lab.getInstitution().getInstitutionId() : null);
        return labService.createLab(lab);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER')")
    public Lab updateLab(@PathVariable Long id, @RequestBody Lab lab){
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() == Role.LAB_MANAGER) {
            Lab existing = labService.getLabById(id);
            Long existingInstitutionId = existing.getInstitution() != null ? existing.getInstitution().getInstitutionId() : null;
            assertLabManagerOwnInstitution(existingInstitutionId);
            // Also block a LAB_MANAGER from reassigning the lab to a different institution.
            if (lab.getInstitution() != null) {
                assertLabManagerOwnInstitution(lab.getInstitution().getInstitutionId());
            }
        }
        return labService.updateLab(id, lab);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public void deleteLab(@PathVariable Long id){
        labService.deleteLab(id);
    }

    private void assertLabManagerOwnInstitution(Long targetInstitutionId){
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != Role.LAB_MANAGER) {
            return;
        }
        Long ownInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getInstitutionId() : null;
        if (targetInstitutionId == null || ownInstitutionId == null || !ownInstitutionId.equals(targetInstitutionId)) {
            throw new AccessDeniedException("You may only manage labs within your own institution");
        }
    }
}
