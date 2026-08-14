package com.example.hello.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hello.entity.CalibrationCertification;
import com.example.hello.repository.CalibrationCertificationRepository;

@Service
public class CalibrationCertificationService {

    @Autowired
    private CalibrationCertificationRepository repository;

    public List<CalibrationCertification> getAll() {
        return repository.findAll();
    }

    public CalibrationCertification save(
            CalibrationCertification calibration) {

        return repository.save(calibration);
    }

    public CalibrationCertification update(
            Integer id,
            CalibrationCertification calibration) {

        calibration.setCalibrationId(id);

        return repository.save(calibration);
    }

    public void delete(Integer id) {

        repository.deleteById(id);
    }
}