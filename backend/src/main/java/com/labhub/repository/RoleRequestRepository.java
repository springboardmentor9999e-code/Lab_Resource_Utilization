package com.labhub.repository;

import com.labhub.entity.RoleRequest;
import com.labhub.entity.User;
import com.labhub.enums.RoleRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, UUID> {

    List<RoleRequest> findByUserOrderByRequestedAtDesc(User user);

    List<RoleRequest> findByStatusOrderByRequestedAtDesc(RoleRequestStatus status);

    List<RoleRequest> findAllByOrderByRequestedAtDesc();

    boolean existsByUserAndStatus(User user, RoleRequestStatus status);

    @Query("SELECT count(r) FROM RoleRequest r WHERE r.status = :status AND (r.user.institution.id = :instId OR r.user.department.institution.id = :instId)")
    long countByStatusAndUserInstitutionId(@Param("status") RoleRequestStatus status, @Param("instId") UUID instId);
}
