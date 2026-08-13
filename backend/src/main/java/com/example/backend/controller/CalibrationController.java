package com.example.backend.controller;

import com.example.backend.entity.Calibration;
import com.example.backend.service.CalibrationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calibration")
@CrossOrigin(origins = "*")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(
            CalibrationService calibrationService) {

        this.calibrationService = calibrationService;
    }

    // GET ALL CALIBRATION
    @GetMapping
    public ResponseEntity<List<Calibration>> getAllCalibration() {

        return ResponseEntity.ok(
                calibrationService.getAllCalibration()
        );
    }

    // GET CALIBRATION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Calibration> getCalibrationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                calibrationService.getCalibrationById(id)
        );
    }

    // CREATE CALIBRATION WITH CERTIFICATE UPLOAD
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Calibration> createCalibration(

            @RequestParam Long resourceId,

            @RequestParam String calibrationDate,

            @RequestParam String nextDueDate,

            @RequestParam String performedBy,

            @RequestParam(required = false)
            MultipartFile certificateFile,

            @RequestParam(required = false)
            String remarks,

            @RequestParam String status

    ) throws IOException {

        Calibration calibration = new Calibration();

        // Equipment ID
        calibration.setResourceId(resourceId);

        // Calibration date
        calibration.setCalibrationDate(
                LocalDate.parse(calibrationDate)
        );

        // Next due date
        calibration.setNextDueDate(
                LocalDate.parse(nextDueDate)
        );

        // Performed by
        calibration.setPerformedBy(performedBy);

        // Remarks
        calibration.setRemarks(remarks);

        // Status
        calibration.setStatus(status);

        // Certificate filename
        if (certificateFile != null
                && !certificateFile.isEmpty()) {

            calibration.setCertificateFile(
                    certificateFile.getOriginalFilename()
            );
        }

        return ResponseEntity.ok(
                calibrationService.createCalibration(
                        calibration
                )
        );
    }

    // UPDATE CALIBRATION
    @PutMapping("/{id}")
    public ResponseEntity<Calibration> updateCalibration(

            @PathVariable Long id,

            @RequestBody Calibration calibration

    ) {

        return ResponseEntity.ok(
                calibrationService.updateCalibration(
                        id,
                        calibration
                )
        );
    }

    // DELETE CALIBRATION
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCalibration(

            @PathVariable Long id

    ) {

        calibrationService.deleteCalibration(id);

        return ResponseEntity.ok(
                "Calibration deleted successfully"
        );
    }
}