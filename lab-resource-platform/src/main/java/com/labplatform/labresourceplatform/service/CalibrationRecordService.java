package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import com.labplatform.labresourceplatform.repository.CalibrationRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CalibrationRecordService {

    private final CalibrationRecordRepository calibrationRecordRepository;
    private final EquipmentService equipmentService;
    private final UserService userService;

    public CalibrationRecordService(CalibrationRecordRepository calibrationRecordRepository,
                                     EquipmentService equipmentService,
                                     UserService userService) {
        this.calibrationRecordRepository = calibrationRecordRepository;
        this.equipmentService = equipmentService;
        this.userService = userService;
    }

    public List<CalibrationRecord> getHistoryForEquipment(Long equipmentId) {
        return calibrationRecordRepository.findByEquipment_EquipmentIdOrderByCalibratedDateDesc(equipmentId);
    }

    public CalibrationRecord getById(Long id) {
        return calibrationRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration record not found with id: " + id));
    }

    // "For every six months the validation should be conducted" - if the
    // caller doesn't specify an expiry date, default to 6 months after the
    // calibration date rather than leaving it to guesswork. Still overridable
    // (some equipment/standards may need a different cycle), this is just the
    // sensible default the meeting note calls for.
    private static final int DEFAULT_VALIDITY_MONTHS = 6;

    public CalibrationRecord create(CalibrationRecord record) {
        // Same partial-reference re-fetch pattern used everywhere else in this
        // codebase (Booking, Maintenance, etc): the client only sends ids, so
        // re-fetch the real entities before saving.
        if (record.getEquipment() != null) {
            record.setEquipment(equipmentService.getEquipmentById(record.getEquipment().getEquipmentId()));
        }
        if (record.getPerformedBy() != null) {
            record.setPerformedBy(userService.getUserById(record.getPerformedBy().getUserId()));
        }
        if (record.getCalibratedDate() != null && record.getExpiryDate() == null) {
            record.setExpiryDate(record.getCalibratedDate().plusMonths(DEFAULT_VALIDITY_MONTHS));
        }
        if (record.getExpiryDate() != null && record.getCalibratedDate() != null
                && record.getExpiryDate().isBefore(record.getCalibratedDate())) {
            throw new RuntimeException("Expiry date can't be before the calibration date.");
        }
        CalibrationRecord saved = calibrationRecordRepository.save(record);

        // "Then he can approve the registered equipment" - logging this
        // calibration IS the technician's approval; if the equipment was
        // sitting in Pending Calibration waiting for exactly this, release it
        // into normal use now that someone has verified it reads accurately.
        if (saved.getEquipment() != null) {
            equipmentService.approveInitialCalibration(saved.getEquipment().getEquipmentId());
        }

        return saved;
    }

    public void delete(Long id) {
        calibrationRecordRepository.deleteById(id);
    }

    // Renewal reminders (Milestone 3, task 2): equipment whose most recent
    // calibration expires within the next `daysAhead` days, or has already
    // expired. Returns the calibration records themselves (each carries its
    // equipment), so the caller has everything needed to show "what's due and
    // when" without a second lookup.
    public List<CalibrationRecord> getRenewalReminders(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(daysAhead);
        // Deliberately start the window well in the past (not just "today") so
        // equipment that's ALREADY overdue for recalibration still shows up as
        // a reminder, rather than silently dropping off the list the moment its
        // expiry date passes.
        LocalDate from = today.minusYears(5);
        return calibrationRecordRepository.findLatestExpiringBetween(from, horizon);
    }
}
