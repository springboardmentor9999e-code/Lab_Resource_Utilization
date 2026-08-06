package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.service.EquipmentService;
import com.infosys.labresourceutilizationplatform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private NotificationService notificationService;

    // Add Equipment
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment));
    }

    // Get Equipment (supports filters)
    @GetMapping
    public ResponseEntity<List<Equipment>> getEquipment(

            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        if (laboratoryId != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByLaboratory(laboratoryId));
        }

        if (category != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByCategory(category));
        }

        if (status != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByStatus(status));
        }

        if (search != null) {
            return ResponseEntity.ok(
                    equipmentService.searchEquipment(search));
        }

        return ResponseEntity.ok(
                equipmentService.getAllEquipment());
    }

    // Get Equipment By ID
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentById(id));
    }

    // Update Equipment
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Long id,
            @RequestBody Equipment equipment) {

        return ResponseEntity.ok(
                equipmentService.updateEquipment(id, equipment));
    }

    // Delete Equipment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Long id) {

        equipmentService.deleteEquipment(id);

        return ResponseEntity.ok("Equipment deleted successfully.");
    }

    // Upload Equipment Image
    @PostMapping("/upload")
    public ResponseEntity<String> uploadEquipmentImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty.");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate a unique filename
            String filename = "upload-" + System.currentTimeMillis() + extension;

            java.io.File targetDir = new java.io.File("d:\\Infosys_virtual_internship\\frontend\\public\\images\\equipment");
            if (!targetDir.exists()) {
                targetDir.mkdirs();
            }

            java.io.File destFile = new java.io.File(targetDir, filename);
            file.transferTo(destFile);

            String imageUrl = "/images/equipment/" + filename;
            return ResponseEntity.ok(imageUrl);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }

    // Complete Calibration
    @PostMapping("/{id}/calibration/complete")
    public ResponseEntity<Equipment> completeCalibration(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        Equipment eq = equipmentService.getEquipmentById(id);
        eq.setLastCalibrationDate(java.time.LocalDate.now());
        
        String freq = eq.getCalibrationFrequency();
        java.time.LocalDate nextCal = java.time.LocalDate.now();
        if ("Every 3 Months".equalsIgnoreCase(freq) || freq == null) {
            nextCal = nextCal.plusMonths(3);
        } else if ("Every 6 Months".equalsIgnoreCase(freq)) {
            nextCal = nextCal.plusMonths(6);
        } else if ("Every 12 Months".equalsIgnoreCase(freq)) {
            nextCal = nextCal.plusMonths(12);
        } else {
            nextCal = nextCal.plusMonths(3);
        }
        
        eq.setNextCalibrationDate(nextCal);
        eq.setCalibrationStatus("Completed");
        Equipment saved = equipmentService.updateEquipment(id, eq);
        
        Long instId = (saved.getLaboratory() != null &&
                       saved.getLaboratory().getDepartment() != null &&
                       saved.getLaboratory().getDepartment().getInstitution() != null) ?
                       saved.getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
        
        String msg = "Calibration completed successfully for " + saved.getEquipmentName() + ". Next calibration scheduled on " + nextCal + ".";
        
        notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, "Calibration Completed", msg, "CALIBRATION");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "Calibration Completed", msg, "CALIBRATION");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Calibration Completed", msg, "CALIBRATION");
        
        return ResponseEntity.ok(saved);
    }

    // Renew License
    @PostMapping("/{id}/license/renew")
    public ResponseEntity<Equipment> renewLicense(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        Equipment eq = equipmentService.getEquipmentById(id);
        eq.setLicenseIssueDate(java.time.LocalDate.now());
        
        String freq = eq.getLicenseRenewalFrequency();
        java.time.LocalDate nextExpiry = java.time.LocalDate.now();
        if ("Every 3 Months".equalsIgnoreCase(freq)) {
            nextExpiry = nextExpiry.plusMonths(3);
        } else if ("Every 6 Months".equalsIgnoreCase(freq) || freq == null) {
            nextExpiry = nextExpiry.plusMonths(6);
        } else if ("Every 12 Months".equalsIgnoreCase(freq)) {
            nextExpiry = nextExpiry.plusMonths(12);
        } else {
            nextExpiry = nextExpiry.plusMonths(6);
        }
        
        eq.setLicenseExpiryDate(nextExpiry);
        eq.setLicenseRenewalDate(nextExpiry);
        eq.setLicenseStatus("Renewed");
        Equipment saved = equipmentService.updateEquipment(id, eq);
        
        Long instId = (saved.getLaboratory() != null &&
                       saved.getLaboratory().getDepartment() != null &&
                       saved.getLaboratory().getDepartment().getInstitution() != null) ?
                       saved.getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
        
        String msg = "License renewed successfully for " + saved.getEquipmentName() + ". New expiration date is " + nextExpiry + ".";
        
        notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, "License Renewed", msg, "LICENSE_RENEWAL");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "License Renewed", msg, "LICENSE_RENEWAL");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "License Renewed", msg, "LICENSE_RENEWAL");
        
        return ResponseEntity.ok(saved);
    }

    // Renew Certificate
    @PostMapping("/{id}/certificate/renew")
    public ResponseEntity<Equipment> renewCertificate(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        Equipment eq = equipmentService.getEquipmentById(id);
        eq.setCertificateIssueDate(java.time.LocalDate.now());
        
        String freq = eq.getCertificateRenewalFrequency();
        java.time.LocalDate nextExpiry = java.time.LocalDate.now();
        if ("Every 3 Months".equalsIgnoreCase(freq)) {
            nextExpiry = nextExpiry.plusMonths(3);
        } else if ("Every 6 Months".equalsIgnoreCase(freq) || freq == null) {
            nextExpiry = nextExpiry.plusMonths(6);
        } else if ("Every 12 Months".equalsIgnoreCase(freq)) {
            nextExpiry = nextExpiry.plusMonths(12);
        } else {
            nextExpiry = nextExpiry.plusMonths(6);
        }
        
        eq.setCertificateExpiryDate(nextExpiry);
        eq.setCertificateRenewalDate(nextExpiry);
        eq.setCertificateStatus("Renewed");
        Equipment saved = equipmentService.updateEquipment(id, eq);
        
        Long instId = (saved.getLaboratory() != null &&
                       saved.getLaboratory().getDepartment() != null &&
                       saved.getLaboratory().getDepartment().getInstitution() != null) ?
                       saved.getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
        
        String msg = "Certificate renewed successfully for " + saved.getEquipmentName() + ". New expiration date is " + nextExpiry + ".";
        
        notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, "Certificate Renewed", msg, "CERTIFICATE_RENEWAL");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "Certificate Renewed", msg, "CERTIFICATE_RENEWAL");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Certificate Renewed", msg, "CERTIFICATE_RENEWAL");
        
        return ResponseEntity.ok(saved);
    }
}