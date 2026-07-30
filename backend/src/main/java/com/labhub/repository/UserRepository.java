package com.labhub.repository;

import com.labhub.entity.User;
import com.labhub.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.department.id = :deptId")
    Page<User> findByDepartmentId(@Param("deptId") UUID deptId, Pageable pageable);

    long countByStatus(UserStatus status);

    @Query("SELECT u FROM User u WHERE u.institution.id = :instId")
    java.util.List<User> findByInstitutionId(@Param("instId") UUID instId);

    @Query("SELECT count(u) FROM User u WHERE u.institution.id = :instId OR u.department.institution.id = :instId")
    long countByInstitutionIdOrDepartmentInstitutionId(@Param("instId") UUID instId);
}
