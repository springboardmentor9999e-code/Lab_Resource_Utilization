package com.lrplatform.repository;

import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
    List<User> findByInstitutionId(Long institutionId);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndInstitutionId(UserRole role, Long institutionId);
    List<User> findByRoleAndDepartmentId(UserRole role, Long departmentId);

    Page<User> findByRole(UserRole role, Pageable pageable);
    Page<User> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<User> findByStatus(Boolean status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findBySearch(@Param("search") String search, Pageable pageable);

    long countByRole(UserRole role);
    long countByStatus(Boolean status);
    long countByDepartmentId(Long departmentId);
    long countByInstitutionIdAndStatus(Long institutionId, Boolean status);
    long countByDepartmentIdAndStatus(Long departmentId, Boolean status);
}
