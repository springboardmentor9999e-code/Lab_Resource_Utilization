package com.labresource.repository;

import com.labresource.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long> {
}
