package com.example.backend.service;

import com.example.backend.entity.Calibration;

import java.util.List;

public interface CalibrationService {

    List<Calibration> getAllCalibration();

    Calibration getCalibrationById(Long id);

    Calibration createCalibration(Calibration calibration);

    Calibration updateCalibration(Long id, Calibration calibration);

    void deleteCalibration(Long id);
}