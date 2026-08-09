package com.labresource.platform.controller;

import com.labresource.platform.dto.CreateLabRequest;
import com.labresource.platform.dto.LabResponse;
import com.labresource.platform.dto.UpdateLabRequest;
import com.labresource.platform.service.LabService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labs")
public class LabController {

    private final LabService labService;

    public LabController(LabService labService) {
        this.labService = labService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public LabResponse createLab(@Valid @RequestBody CreateLabRequest request) {
        return labService.createLab(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<LabResponse> getAllLabs() {
        return labService.getAllLabs();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public LabResponse getLabById(@PathVariable Long id) {
        return labService.getLabById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public LabResponse updateLab(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLabRequest request
    ) {
        return labService.updateLab(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public void deleteLab(@PathVariable Long id) {
        labService.deleteLab(id);
    }
}
