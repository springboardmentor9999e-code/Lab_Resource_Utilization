package com.labresource.backend.controller;

import com.labresource.backend.entity.EquipmentCertification;
import com.labresource.backend.service.EquipmentCertificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "*")
public class EquipmentCertificationController {

    private final EquipmentCertificationService service;

    public EquipmentCertificationController(
            EquipmentCertificationService service) {

        this.service = service;
    }

    @PostMapping
    public EquipmentCertification save(
            @RequestBody EquipmentCertification certification) {

        return service.save(certification);
    }

    @GetMapping
    public List<EquipmentCertification> getAll() {

        return service.getAll();
    }

    @GetMapping("/{id}")
    public EquipmentCertification getById(
            @PathVariable Long id) {

        return service.getById(id);
    }

    @PutMapping("/{id}")
    public EquipmentCertification update(
            @PathVariable Long id,
            @RequestBody EquipmentCertification certification) {

        return service.update(id, certification);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {

        service.delete(id);
    }

    @GetMapping("/expiring")
    public List<EquipmentCertification> getExpiring() {

        return service.getExpiringCertificates();
    }

    @GetMapping("/expired")
    public List<EquipmentCertification> getExpired() {

        return service.getExpiredCertificates();
    }

    @GetMapping("/reminders")
    public List<EquipmentCertification> getRenewalReminders() {

        return service.getRenewalReminders();
    }
    @GetMapping("/institution")
public List<EquipmentCertification> getInstitutionCertificates() {
    return service.getInstitutionCertificates();
}

@GetMapping("/laboratory")
public List<EquipmentCertification> getLaboratoryCertificates() {
    return service.getLaboratoryCertificates();
}
    
    
}