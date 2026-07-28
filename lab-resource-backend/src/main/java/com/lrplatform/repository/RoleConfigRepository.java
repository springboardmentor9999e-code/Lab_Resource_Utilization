package com.lrplatform.repository;

import com.lrplatform.model.entity.RoleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleConfigRepository extends JpaRepository<RoleConfig, Long> {
    Optional<RoleConfig> findByRoleName(String roleName);
    boolean existsByRoleName(String roleName);
}
