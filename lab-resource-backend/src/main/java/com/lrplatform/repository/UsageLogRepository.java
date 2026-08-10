package com.lrplatform.repository;

import com.lrplatform.model.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {

    List<UsageLog> findByInstitutionIdOrderByStartTimeDesc(Long institutionId);

    List<UsageLog> findByInstitutionIdAndStartTimeGreaterThanEqualAndEndTimeLessThanEqual(
            Long institutionId, LocalDateTime from, LocalDateTime to);

    List<UsageLog> findByStartTimeGreaterThanEqualAndEndTimeLessThanEqual(LocalDateTime from, LocalDateTime to);

    List<UsageLog> findByBookingId(Long bookingId);
}
