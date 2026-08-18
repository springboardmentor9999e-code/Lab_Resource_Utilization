package com.lab.backend.repository;

import com.lab.backend.entity.Calibration;
import com.lab.backend.entity.CalibrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalibrationRepository extends JpaRepository<Calibration, Long> {

    List<Calibration> findByNextCalibrationDateBefore(LocalDate date);

    List<Calibration> findByNextCalibrationDateBetween(LocalDate start, LocalDate end);

    List<Calibration> findByStatus(CalibrationStatus status);

}