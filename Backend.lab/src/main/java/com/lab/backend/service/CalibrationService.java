package com.lab.backend.service;

import com.lab.backend.dto.CalibrationRequest;
import com.lab.backend.entity.Calibration;
import com.lab.backend.entity.CalibrationStatus;
import com.lab.backend.entity.Equipment;
import com.lab.backend.repository.CalibrationRepository;
import com.lab.backend.repository.EquipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;

    public CalibrationService(CalibrationRepository calibrationRepository,
                              EquipmentRepository equipmentRepository) {
        this.calibrationRepository = calibrationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public Calibration addCalibration(CalibrationRequest request) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        Calibration calibration = new Calibration();

        calibration.setEquipment(equipment);
        calibration.setCalibrationDate(request.getCalibrationDate());
        calibration.setNextCalibrationDate(request.getNextCalibrationDate());
        calibration.setRemarks(request.getRemarks());
        calibration.setStatus(CalibrationStatus.UPCOMING);

        return calibrationRepository.save(calibration);
    }

    public Calibration updateCalibration(Long id, CalibrationRequest request) {

        Calibration calibration = calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration not found"));

        calibration.setCalibrationDate(request.getCalibrationDate());
        calibration.setNextCalibrationDate(request.getNextCalibrationDate());
        calibration.setRemarks(request.getRemarks());

        if (request.getNextCalibrationDate() != null && request.getNextCalibrationDate().isBefore(LocalDate.now())) {
            calibration.setStatus(CalibrationStatus.EXPIRED);
        } else {
            calibration.setStatus(CalibrationStatus.UPCOMING);
        }

        return calibrationRepository.save(calibration);
    }

    public void deleteCalibration(Long id) {

        calibrationRepository.deleteById(id);

    }

    public List<Calibration> getExpiredCalibrations() {

        return calibrationRepository.findByNextCalibrationDateBefore(LocalDate.now());

    }

    public List<Calibration> getUpcomingCalibrations() {

        LocalDate today = LocalDate.now();

        return calibrationRepository.findByNextCalibrationDateBetween(
                today,
                today.plusDays(30)
        );
    }

    public Calibration createCalibration(Calibration calibration) {
        return calibrationRepository.save(calibration);
    }

    public List<Calibration> getAllCalibrations() {
        return calibrationRepository.findAll();
    }

    public Calibration getCalibrationById(Long id) {
        return calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration not found with ID: " + id));
    }
}