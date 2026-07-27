package com.labresource.repository;

import com.labresource.entity.UserRole;
import com.labresource.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    
    List<UserRole> findByUserUserId(Long userId);
    
}