package com.example.labresourceplatform.repository;

import com.example.labresourceplatform.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByNextMaintenanceDate(LocalDate nextMaintenanceDate);

    List<Maintenance> findByNextMaintenanceDateLessThanEqual(LocalDate nextMaintenanceDate);

}