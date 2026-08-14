package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.entity.CalibrationCertification;

public interface CalibrationCertificationRepository
        extends JpaRepository<CalibrationCertification, Integer> {
}