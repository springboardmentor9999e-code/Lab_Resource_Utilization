package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.InstitutionService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionService institutionService;
    private final CurrentUserService currentUserService;

    public InstitutionController(InstitutionService institutionService, CurrentUserService currentUserService){
        this.institutionService = institutionService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<Institution> getAllInstitutions(){
        return institutionService.getAllInstitutions();
    }

    @GetMapping("/{id}")
    public Institution getInstitutionById(@PathVariable Long id){
        return institutionService.getInstitutionById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public Institution createInstitution(@RequestBody Institution institution){
        return institutionService.createInstitution(institution);
    }

    // SYSTEM_ADMINISTRATOR: Full CRUD on any institution.
    // INSTITUTION_ADMINISTRATOR: may only "Update own" institution (per Role-Operation Matrix).
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public Institution updateInstitution(@PathVariable Long id, @RequestBody Institution institution){
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() == Role.INSTITUTION_ADMINISTRATOR) {
            boolean isOwnInstitution = currentUser.getInstitution() != null
                    && currentUser.getInstitution().getInstitutionId().equals(id);
            if (!isOwnInstitution) {
                throw new AccessDeniedException("You may only update your own institution");
            }
        }
        return institutionService.updateInstitution(id, institution);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public void deleteInstitution(@PathVariable Long id){
        institutionService.deleteInstitution(id);
    }
}
