package com.labresource.repository;

import com.labresource.entity.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {

    List<MaintenanceSchedule> findAllByOrderByNextDueDateAsc();

    List<MaintenanceSchedule> findByActiveTrueAndNextDueDateLessThanEqual(LocalDate date);
}
