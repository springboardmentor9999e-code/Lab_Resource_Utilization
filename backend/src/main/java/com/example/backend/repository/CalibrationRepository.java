package com.example.backend.repository;

import com.example.backend.entity.Calibration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalibrationRepository extends JpaRepository<Calibration, Long> {

}