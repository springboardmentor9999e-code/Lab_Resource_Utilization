package com.labresource.repository;

import com.labresource.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Active users holding a given role (e.g. LAB_TECHNICIAN for work-order assignment)
    @Query("SELECT DISTINCT u FROM AppUser u JOIN u.userRoles ur JOIN ur.role r " +
           "WHERE r.roleName = :roleName AND u.isActive = true")
    List<AppUser> findActiveByRole(@Param("roleName") String roleName);

    // Active users holding any of the given roles (reminder fan-out to managers)
    @Query("SELECT DISTINCT u FROM AppUser u JOIN u.userRoles ur JOIN ur.role r " +
           "WHERE r.roleName IN :roleNames AND u.isActive = true")
    List<AppUser> findActiveByRoles(@Param("roleNames") Collection<String> roleNames);

    // Budget alerts go to the people accountable for one department's spend, not to every
    // manager in the institution — a Chemistry overrun is not Physics' problem.
    @Query("SELECT DISTINCT u FROM AppUser u JOIN u.userRoles ur JOIN ur.role r " +
           "WHERE u.department.departmentId = :departmentId " +
           "AND r.roleName IN :roleNames AND u.isActive = true")
    List<AppUser> findActiveInDepartmentByRoles(@Param("departmentId") Long departmentId,
                                                @Param("roleNames") Collection<String> roleNames);

    // Admin user directory: optional free-text (name/username/email) + role filter.
    // The CAST is required, not cosmetic: :search is only ever used inside IS NULL and
    // CONCAT, so Postgres has nothing to infer a type from and binds a null as bytea,
    // which then fails with "function lower(bytea) does not exist".
    @Query("SELECT DISTINCT u FROM AppUser u LEFT JOIN u.userRoles ur LEFT JOIN ur.role r WHERE " +
           "(CAST(:search AS string) IS NULL " +
           "  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (CAST(:role AS string) IS NULL OR r.roleName = :role) " +
           "ORDER BY u.createdAt DESC")
    List<AppUser> searchUsers(@Param("search") String search, @Param("role") String role);
}