package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByRoleName(String roleName);

}