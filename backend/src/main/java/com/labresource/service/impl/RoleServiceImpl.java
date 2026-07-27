package com.labresource.service.impl;

import com.labresource.entity.Role;
import com.labresource.repository.RoleRepository;
import com.labresource.service.interfaces.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {
    
    private final RoleRepository roleRepository;
    
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    @Override
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }
    
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Override
    public Role getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }
    
    @Override
    public Role getRoleByName(String roleName) {
        return roleRepository.findByRoleName(roleName).orElse(null);
    }
}