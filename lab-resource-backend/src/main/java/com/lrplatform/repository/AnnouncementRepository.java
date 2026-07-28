package com.lrplatform.repository;

import com.lrplatform.model.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    List<Announcement> findByPublishedTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
    
    List<Announcement> findByPublishedTrueOrderByCreatedAtDesc();
    
    @Query("SELECT a FROM Announcement a WHERE a.createdBy.id = :userId ORDER BY a.createdAt DESC")
    List<Announcement> findByCreatedByOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT a FROM Announcement a WHERE a.published = true " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > :now) " +
           "AND (a.targetAudience = 'ALL' " +
           "OR (a.targetAudience = 'INSTITUTION' AND a.institution.id = :institutionId) " +
           "OR (a.targetAudience = 'DEPARTMENT' AND a.department.id = :departmentId)) " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncements(
        @Param("now") LocalDateTime now,
        @Param("institutionId") Long institutionId,
        @Param("departmentId") Long departmentId
    );
    
    long countByPublishedTrue();
    
    long countByPublishedFalse();
}
