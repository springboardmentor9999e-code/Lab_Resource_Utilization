package com.lrplatform.repository;

import com.lrplatform.model.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findByUserIdOrderByActionTimeDesc(Long userId);
    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findByModuleOrderByActionTimeDesc(String module);
    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findTop20ByOrderByActionTimeDesc();

    @Query(value = "SELECT a.* FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id " +
           "WHERE a.action_time >= COALESCE(:dateFrom, TIMESTAMP '1970-01-01') " +
           "AND a.action_time <= COALESCE(:dateTo, TIMESTAMP '9999-12-31') " +
           "AND (COALESCE(:userSearch, '') = '' OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || LOWER(COALESCE(:userSearch, '')) || '%') " +
           "ORDER BY a.action_time DESC",
           countQuery = "SELECT COUNT(*) FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id " +
           "WHERE a.action_time >= COALESCE(:dateFrom, TIMESTAMP '1970-01-01') " +
           "AND a.action_time <= COALESCE(:dateTo, TIMESTAMP '9999-12-31') " +
           "AND (COALESCE(:userSearch, '') = '' OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || LOWER(COALESCE(:userSearch, '')) || '%')",
           nativeQuery = true)
    Page<AuditLog> findFiltered(@Param("dateFrom") LocalDateTime dateFrom,
                                @Param("dateTo") LocalDateTime dateTo,
                                @Param("userSearch") String userSearch,
                                Pageable pageable);

    @Query(value = "SELECT a.* FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id " +
           "WHERE a.module = :module " +
           "AND a.action_time >= COALESCE(:dateFrom, TIMESTAMP '1970-01-01') " +
           "AND a.action_time <= COALESCE(:dateTo, TIMESTAMP '9999-12-31') " +
           "AND (COALESCE(:userSearch, '') = '' OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || LOWER(COALESCE(:userSearch, '')) || '%') " +
           "ORDER BY a.action_time DESC",
           countQuery = "SELECT COUNT(*) FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id " +
           "WHERE a.module = :module " +
           "AND a.action_time >= COALESCE(:dateFrom, TIMESTAMP '1970-01-01') " +
           "AND a.action_time <= COALESCE(:dateTo, TIMESTAMP '9999-12-31') " +
           "AND (COALESCE(:userSearch, '') = '' OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || LOWER(COALESCE(:userSearch, '')) || '%')",
           nativeQuery = true)
    Page<AuditLog> findFilteredByModule(@Param("module") String module,
                                        @Param("dateFrom") LocalDateTime dateFrom,
                                        @Param("dateTo") LocalDateTime dateTo,
                                        @Param("userSearch") String userSearch,
                                        Pageable pageable);
}
