package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.RoleChangeRequest;
import com.labplatform.labresourceplatform.enums.RoleChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleChangeRequestRepository extends JpaRepository<RoleChangeRequest, Long> {

    List<RoleChangeRequest> findByStatus(RoleChangeStatus status);

    List<RoleChangeRequest> findByStatusAndUser_Institution_InstitutionId(RoleChangeStatus status, Long institutionId);

    List<RoleChangeRequest> findByUser_UserId(Long userId);

    Optional<RoleChangeRequest> findFirstByUser_UserIdAndStatus(Long userId, RoleChangeStatus status);
}
