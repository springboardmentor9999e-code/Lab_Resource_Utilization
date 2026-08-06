package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class PreventiveMaintenanceScheduler {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedRate = 10000) // Every 10 seconds
    @Transactional
    public void runMaintenanceChecks() {
        LocalDate today = LocalDate.now();
        List<Equipment> equipmentList = equipmentRepository.findAll();

        for (Equipment e : equipmentList) {
            Long instId = (e.getLaboratory() != null &&
                           e.getLaboratory().getDepartment() != null &&
                           e.getLaboratory().getDepartment().getInstitution() != null) ?
                           e.getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;

            String name = e.getEquipmentName();

            // 1. Calibration Checks
            if (e.getNextCalibrationDate() != null) {
                LocalDate nextCal = e.getNextCalibrationDate();
                long daysToCal = ChronoUnit.DAYS.between(today, nextCal);

                if (daysToCal == 1) {
                    String title = "Calibration Due Soon";
                    String msg = name + " calibration is due tomorrow (" + nextCal + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        e.setCalibrationStatus("Due Soon");
                        equipmentRepository.save(e);
                        
                        sendToMaintenanceStaff(instId, title, msg, "CALIBRATION");
                    }
                } else if (nextCal.isBefore(today)) {
                    String title = "Calibration Overdue";
                    String msg = name + " calibration is OVERDUE (Was due on " + nextCal + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        e.setCalibrationStatus("Overdue");
                        equipmentRepository.save(e);

                        sendToMaintenanceStaff(instId, title, msg, "CALIBRATION");
                    }
                } else {
                    if ("Overdue".equals(e.getCalibrationStatus()) && nextCal.isAfter(today)) {
                        e.setCalibrationStatus("Scheduled");
                        equipmentRepository.save(e);
                    }
                }
            }

            // 2. License Checks
            if (e.getLicenseExpiryDate() != null) {
                LocalDate exp = e.getLicenseExpiryDate();
                long daysToExp = ChronoUnit.DAYS.between(today, exp);

                if (daysToExp == 7 || daysToExp == 2 || daysToExp == 1) {
                    String title = "License Renewal Due";
                    String msg = name + " license (No: " + e.getLicenseNumber() + ") is expiring in " + daysToExp + " days (" + exp + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        sendToMaintenanceStaff(instId, title, msg, "LICENSE_RENEWAL");
                    }
                } else if (exp.isBefore(today)) {
                    String title = "License Overdue";
                    String msg = name + " license (No: " + e.getLicenseNumber() + ") is OVERDUE (Expired on " + exp + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        sendToMaintenanceStaff(instId, title, msg, "LICENSE_RENEWAL");
                    }
                }
            }

            // 3. Certificate Checks
            if (e.getCertificateExpiryDate() != null) {
                LocalDate exp = e.getCertificateExpiryDate();
                long daysToExp = ChronoUnit.DAYS.between(today, exp);

                if (daysToExp == 7 || daysToExp == 2 || daysToExp == 1) {
                    String title = "Certificate Renewal Due";
                    String msg = name + " certificate (No: " + e.getCertificateNumber() + ") is expiring in " + daysToExp + " days (" + exp + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        sendToMaintenanceStaff(instId, title, msg, "CERTIFICATE_RENEWAL");
                    }
                } else if (exp.isBefore(today)) {
                    String title = "Certificate Overdue";
                    String msg = name + " certificate (No: " + e.getCertificateNumber() + ") is OVERDUE (Expired on " + exp + ").";
                    if (!notificationService.hasNotificationBeenSentToday(title, name)) {
                        sendToMaintenanceStaff(instId, title, msg, "CERTIFICATE_RENEWAL");
                    }
                }
            }
        }
    }

    private void sendToMaintenanceStaff(Long instId, String title, String msg, String category) {
        // Send to Lab Technician
        notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, title, msg, category);
        // Send to Lab Manager
        notificationService.sendNotification(null, "LAB_MANAGER", instId, title, msg, category);
        // Send to Department Head
        notificationService.sendNotification(null, "DEPARTMENT_HEAD", instId, title, msg, category);
        // Send to Institution Admin
        notificationService.sendNotification(null, "INSTITUTION_ADMIN", instId, title, msg, category);
        // Send to System Admin
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, title, msg, category);
    }
}
