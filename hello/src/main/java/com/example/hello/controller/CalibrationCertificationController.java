package com.example.hello.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.hello.entity.CalibrationCertification;
import com.example.hello.service.CalibrationCertificationService;

@RestController
@RequestMapping("/calibration")
@CrossOrigin(origins = "http://localhost:3000")
public class CalibrationCertificationController {

    @Autowired
    private CalibrationCertificationService service;

    @GetMapping
    public List<CalibrationCertification> getAll() {

        return service.getAll();
    }

    @PostMapping
    public CalibrationCertification save(
            @RequestBody CalibrationCertification calibration) {

        return service.save(calibration);
    }

    @PutMapping("/{id}")
    public CalibrationCertification update(
            @PathVariable Integer id,
            @RequestBody CalibrationCertification calibration) {

        return service.update(id, calibration);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {

        service.delete(id);
    }
}