package com.labresource.controller;

import com.labresource.dto.request.LabRequest;
import com.labresource.dto.response.LabResponse;
import com.labresource.service.interfaces.LabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labs")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @PostMapping
    public ResponseEntity<LabResponse> createLab(@Valid @RequestBody LabRequest request) {
        LabResponse response = labService.createLab(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LabResponse>> getAllLabs() {
        List<LabResponse> response = labService.getAllLabs();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResponse> getLabById(@PathVariable Long id) {
        LabResponse response = labService.getLabById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabResponse> updateLab(
            @PathVariable Long id,
            @Valid @RequestBody LabRequest request) {
        LabResponse response = labService.updateLab(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLab(@PathVariable Long id) {
        labService.deleteLab(id);
        return ResponseEntity.noContent().build();
    }
}
