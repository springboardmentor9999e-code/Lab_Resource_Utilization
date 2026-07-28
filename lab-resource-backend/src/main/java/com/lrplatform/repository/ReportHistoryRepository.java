package com.lrplatform.repository;

import com.lrplatform.model.entity.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findByGeneratedByOrderByGeneratedAtDesc(Long userId);

    List<ReportHistory> findAllByOrderByGeneratedAtDesc();
}
