package com.labresource.service.interfaces;

import com.labresource.entity.Role;

import java.util.List;

public interface RoleService {
    
    Role createRole(Role role);
    
    List<Role> getAllRoles();
    
    Role getRoleById(Long id);
    
    Role getRoleByName(String roleName);
    
}