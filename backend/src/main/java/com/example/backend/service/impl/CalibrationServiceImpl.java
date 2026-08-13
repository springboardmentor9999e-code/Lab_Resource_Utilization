package com.example.backend.service.impl;

import com.example.backend.entity.Calibration;
import com.example.backend.entity.Notification;
import com.example.backend.repository.CalibrationRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.service.CalibrationService;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final NotificationRepository notificationRepository;

    public CalibrationServiceImpl(
            CalibrationRepository calibrationRepository,
            NotificationRepository notificationRepository) {

        this.calibrationRepository = calibrationRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public List<Calibration> getAllCalibration() {
        return calibrationRepository.findAll();
    }

    @Override
    public Calibration getCalibrationById(Long id) {

        return calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Calibration not found"));
    }

    @Override
    public Calibration createCalibration(Calibration calibration) {

        if (calibration.getResourceId() == null) {
            throw new IllegalArgumentException(
                    "Equipment ID is required for calibration");
        }

        Calibration saved = calibrationRepository.save(calibration);

        checkAndCreateNotification(saved);

        return saved;
    }

    @Override
    public Calibration updateCalibration(
            Long id,
            Calibration calibration) {

        Calibration existing = calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Calibration not found"));

        if (calibration.getResourceId() == null) {
            throw new IllegalArgumentException(
                    "Equipment ID is required for calibration");
        }

        existing.setResourceId(calibration.getResourceId());

        existing.setCalibrationDate(
                calibration.getCalibrationDate());

        existing.setNextDueDate(
                calibration.getNextDueDate());

        existing.setPerformedBy(
                calibration.getPerformedBy());

        existing.setCertificateFile(
                calibration.getCertificateFile());

        existing.setRemarks(
                calibration.getRemarks());

        existing.setStatus(
                calibration.getStatus());

        Calibration saved =
                calibrationRepository.save(existing);

        checkAndCreateNotification(saved);

        return saved;
    }

    @Override
    public void deleteCalibration(Long id) {

        calibrationRepository.deleteById(id);
    }

    private void checkAndCreateNotification(
            Calibration cal) {

        if (cal.getNextDueDate() == null) {
            return;
        }

        LocalDate now = LocalDate.now();

        boolean overdue =
                cal.getNextDueDate().isBefore(now);

        boolean dueSoon =
                !overdue &&
                        !cal.getNextDueDate()
                                .isAfter(now.plusDays(14));

        if (overdue || dueSoon) {

            Notification notif = new Notification();

            // Existing project logic
            notif.setUserId(1);

            notif.setTitle(
                    "Calibration Alert - Resource #"
                            + cal.getResourceId());

            if (overdue) {

                notif.setMessage(
                        "Calibration for equipment resource #"
                                + cal.getResourceId()
                                + " was due on "
                                + cal.getNextDueDate()
                                + " and is OVERDUE!");

            } else {

                notif.setMessage(
                        "Calibration certification renewal "
                                + "due soon on "
                                + cal.getNextDueDate()
                                + " for equipment resource #"
                                + cal.getResourceId());
            }

            notif.setType("CALIBRATION");

            notif.setStatus("UNREAD");

            notificationRepository.save(notif);
        }
    }
}