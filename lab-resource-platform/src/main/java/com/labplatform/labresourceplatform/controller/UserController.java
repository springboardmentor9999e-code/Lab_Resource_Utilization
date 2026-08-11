package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.UserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService){
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    private boolean isSelfServiceRole(Role role){
        return role == Role.STUDENT || role == Role.RESEARCHER;
    }

    // STUDENT/RESEARCHER: Read own profile only. Staff roles: Read all users.
    // DEPARTMENT_HEAD is scoped further to their own institution's users only,
    // since (unlike the other staff roles here) they don't get full platform-wide
    // visibility - filters below are applied on top of that institution scope.
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMINISTRATOR','SYSTEM_ADMINISTRATOR')")
    public List<User> getAllUsers(
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Role role){
        User currentUser = currentUserService.getCurrentUser();

        if (currentUser.getRole() == Role.DEPARTMENT_HEAD) {
            Long ownInstitutionId = currentUser.getInstitution() != null
                    ? currentUser.getInstitution().getInstitutionId()
                    : null;
            // A DEPARTMENT_HEAD asking for a different institution's users gets
            // their own institution's list instead of someone else's - silently
            // ignoring the out-of-scope filter rather than erroring keeps this
            // endpoint consistent with how the rest of the app applies scoping.
            return userService.getUsers(ownInstitutionId, role);
        }

        return userService.getUsers(institutionId, role);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id){
        User currentUser = currentUserService.getCurrentUser();
        if (isSelfServiceRole(currentUser.getRole()) && !currentUser.getUserId().equals(id)) {
            throw new AccessDeniedException("You may only view your own profile");
        }
        return userService.getUserById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public User createUser(@RequestBody User user){
        User currentUser = currentUserService.getCurrentUser();
        return userService.createUser(user, currentUser.getRole());
    }

    // Matrix: INSTITUTION_ADMINISTRATOR can only "Update own" institution's users;
    // SYSTEM_ADMINISTRATOR has full CRUD. Everyone else has no write access to users.
    //
    // Two layers of restriction apply to INSTITUTION_ADMINISTRATOR here:
    // (1) institution boundary, checked below - they may only touch users in
    //     their own institution; (2) role ceiling, enforced inside
    //     userService.updateUser() - they may never assign, or edit, a
    //     SYSTEM_ADMINISTRATOR account. Previously only (1) was enforced, which
    //     let an INSTITUTION_ADMINISTRATOR promote any user in their own
    //     institution straight to SYSTEM_ADMINISTRATOR.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR')")
    public User updateUser(@PathVariable Long id, @RequestBody User user){
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() == Role.INSTITUTION_ADMINISTRATOR) {
            User target = userService.getUserById(id);
            boolean sameInstitution = target.getInstitution() != null
                    && currentUser.getInstitution() != null
                    && target.getInstitution().getInstitutionId().equals(currentUser.getInstitution().getInstitutionId());
            if (!sameInstitution) {
                throw new AccessDeniedException("You may only update users within your own institution");
            }
        }
        return userService.updateUser(id, user, currentUser.getRole());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public void deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
    }
}
