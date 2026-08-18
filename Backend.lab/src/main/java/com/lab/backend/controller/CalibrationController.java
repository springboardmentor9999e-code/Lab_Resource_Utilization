package com.lab.backend.controller;

import com.lab.backend.dto.CalibrationRequest;
import com.lab.backend.entity.Calibration;
import com.lab.backend.service.CalibrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/calibration", "/api/calibrations"})
@CrossOrigin(origins = "*")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @PostMapping
    public ResponseEntity<Calibration> addCalibration(
            @RequestBody CalibrationRequest request) {

        return ResponseEntity.ok(
                calibrationService.addCalibration(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Calibration>> getAllCalibrations() {

        return ResponseEntity.ok(
                calibrationService.getAllCalibrations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Calibration> getCalibrationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                calibrationService.getCalibrationById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Calibration> updateCalibration(
            @PathVariable Long id,
            @RequestBody CalibrationRequest request) {

        return ResponseEntity.ok(
                calibrationService.updateCalibration(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCalibration(
            @PathVariable Long id) {

        calibrationService.deleteCalibration(id);

        return ResponseEntity.ok("Calibration Deleted Successfully");
    }

    @GetMapping("/expired")
    public ResponseEntity<List<Calibration>> expired() {

        return ResponseEntity.ok(
                calibrationService.getExpiredCalibrations()
        );
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Calibration>> upcoming() {

        return ResponseEntity.ok(
                calibrationService.getUpcomingCalibrations()
        );
    }

}