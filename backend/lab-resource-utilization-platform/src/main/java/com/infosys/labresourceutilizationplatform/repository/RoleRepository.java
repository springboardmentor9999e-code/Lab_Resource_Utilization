package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByRoleName(String roleName);
}