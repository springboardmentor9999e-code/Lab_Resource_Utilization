package com.rems.controller;

import com.rems.dto.RouteInfo;
import com.rems.entity.Role;
import com.rems.exception.ApiException;
import com.rems.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoleRoutesController {

    private final RoleRepository roleRepository;

    private static final List<RouteInfo> ALL_ROUTES = Arrays.asList(
            new RouteInfo("/api/auth/register", "POST", "User registration", "PUBLIC"),
            new RouteInfo("/api/auth/login", "POST", "User login", "PUBLIC"),
            new RouteInfo("/api/auth/logout", "POST", "User logout", "AUTHENTICATED"),
            new RouteInfo("/api/institutions/register", "POST", "Institution self-registration", "PUBLIC"),
            new RouteInfo("/api/institutions/pending", "GET", "List pending institutions", "manage_all_institutions"),
            new RouteInfo("/api/institutions/{id}/approve", "PATCH", "Approve institution registration", "manage_all_institutions"),
            new RouteInfo("/api/{role}/routes", "GET", "Get authorized routes for a role", "PUBLIC"),
            new RouteInfo("/api/equipment/search", "GET", "Search research equipment", "view_equipment"),
            new RouteInfo("/api/equipment/{id}", "GET", "Get equipment details", "view_equipment"),
            new RouteInfo("/api/equipment/add", "POST", "Add new equipment", "manage_equipment"),
            new RouteInfo("/api/equipment/{id}", "DELETE", "Remove equipment", "manage_equipment"),
            new RouteInfo("/api/bookings", "POST", "Book equipment", "create_booking"),
            new RouteInfo("/api/bookings/my", "GET", "View own equipment bookings", "view_own_bookings"),
            new RouteInfo("/api/bookings/pending", "GET", "List department bookings pending approval", "approve_bookings"),
            new RouteInfo("/api/bookings/{id}/approve", "PATCH", "Approve booking request", "approve_bookings"),
            new RouteInfo("/api/bookings/{id}/reject", "PATCH", "Reject booking request", "approve_bookings"),
            new RouteInfo("/api/bookings/{id}/return", "POST", "Request return of booked equipment", "create_booking"),
            new RouteInfo("/api/bookings/{id}/approve-return", "PATCH", "Approve equipment return", "approve_bookings"),
            new RouteInfo("/api/departments", "POST", "Add new department", "manage_departments"),
            new RouteInfo("/api/departments/{id}", "DELETE", "Remove department", "manage_departments"),
            new RouteInfo("/api/departments/my", "GET", "List institution departments", "AUTHENTICATED"),
            new RouteInfo("/api/labs", "POST", "Add new lab", "manage_labs"),
            new RouteInfo("/api/labs/{id}", "DELETE", "Remove lab", "manage_labs"),
            new RouteInfo("/api/labs/my", "GET", "List department labs", "AUTHENTICATED"),
            new RouteInfo("/api/users/{id}/approve-institution-administrator", "PATCH", "Approve institution administrator", "manage_all_institutions"),
            new RouteInfo("/api/users/{id}/approve-department-head", "PATCH", "Approve department head", "approve_department_head"),
            new RouteInfo("/api/users/{id}/approve-lab-manager", "PATCH", "Approve lab manager", "approve_lab_manager"),
            new RouteInfo("/api/users/{id}/approve-lab-technician", "PATCH", "Approve lab technician", "approve_lab_technician"),
            new RouteInfo("/api/users/pending-approvals", "GET", "List users pending approval", "AUTHENTICATED")
    );

    @GetMapping("/api/{role}/routes")
    public ResponseEntity<List<RouteInfo>> getRoutesForRole(@PathVariable String role) {
        Role matchedRole = findRole(role);
        
        List<String> permissions = matchedRole.getPermissions();
        
        List<RouteInfo> authorizedRoutes = ALL_ROUTES.stream()
                .filter(route -> "PUBLIC".equalsIgnoreCase(route.getPermissionRequired()) 
                        || "AUTHENTICATED".equalsIgnoreCase(route.getPermissionRequired())
                        || permissions.contains(route.getPermissionRequired()))
                .toList();
                
        return ResponseEntity.ok(authorizedRoutes);
    }

    private Role findRole(String roleIdentifier) {
        try {
            int roleId = Integer.parseInt(roleIdentifier);
            return roleRepository.findById(roleId)
                    .orElseThrow(() -> new ApiException("Role not found with ID " + roleId, HttpStatus.NOT_FOUND));
        } catch (NumberFormatException e) {
            String normalizedInput = normalize(roleIdentifier);
            
            return roleRepository.findAll().stream()
                    .filter(r -> normalize(r.getRoleName()).equals(normalizedInput) 
                            || normalizedInput.contains(normalize(r.getRoleName()))
                            || normalize(r.getRoleName()).contains(normalizedInput))
                    .findFirst()
                    .orElseThrow(() -> new ApiException("Role not found with name " + roleIdentifier, HttpStatus.NOT_FOUND));
        }
    }

    private String normalize(String str) {
        if (str == null) return "";
        return str.toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
