package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.BillingRecord;
import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.repository.BillingRecordRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;

@Service
public class BillingRecordService {

    private final BillingRecordRepository billingRecordRepository;

    public BillingRecordService(BillingRecordRepository billingRecordRepository) {
        this.billingRecordRepository = billingRecordRepository;
    }

    // Called when a booking is marked Completed (see BookingService.updateBooking).
    // Only generates a record when ALL of these hold:
    //  - the booker's institution differs from the equipment-owning institution
    //    (same cross-institution check used for the sharing-request audit trail)
    //  - the equipment has an hourly rate set (no rate = nothing to charge)
    //  - this booking doesn't already have a billing record (avoids duplicates
    //    if a booking is edited back and forth across Completed)
    // Silently does nothing otherwise - this is a byproduct of completing a
    // booking, not a user-facing action that should fail loudly if there's
    // nothing to bill.
    public void createBillingRecordIfApplicable(Booking booking) {
        if (billingRecordRepository.findByBooking_BookingId(booking.getBookingId()).isPresent()) {
            return;
        }

        User user = booking.getUser();
        Equipment equipment = booking.getEquipment();
        if (user == null || equipment == null || equipment.getLab() == null) {
            return;
        }

        Institution billedInstitution = user.getInstitution();
        Institution ownerInstitution = equipment.getLab().getInstitution();
        if (billedInstitution == null || ownerInstitution == null) {
            return;
        }
        if (billedInstitution.getInstitutionId().equals(ownerInstitution.getInstitutionId())) {
            return;
        }

        BigDecimal hourlyRate = equipment.getHourlyRate();
        if (hourlyRate == null) {
            return;
        }

        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            return;
        }
        long minutesUsed = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
        if (minutesUsed <= 0) {
            // Guards the same bad-data case flagged for UtilizationLog: an end
            // time before/equal to the start time shouldn't produce a bill.
            return;
        }

        BigDecimal hoursUsed = BigDecimal.valueOf(minutesUsed)
                .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        BigDecimal totalCost = hourlyRate.multiply(hoursUsed).setScale(2, RoundingMode.HALF_UP);

        BillingRecord record = new BillingRecord();
        record.setBooking(booking);
        record.setEquipment(equipment);
        record.setBilledInstitution(billedInstitution);
        record.setOwnerInstitution(ownerInstitution);
        record.setHourlyRate(hourlyRate);
        record.setHoursUsed(hoursUsed);
        record.setTotalCost(totalCost);

        billingRecordRepository.save(record);
    }

    // Scoped view: SYSTEM_ADMINISTRATOR sees everything; everyone else only
    // sees records touching their own institution (either side - what they owe,
    // or what they're owed), matching the same institution-boundary pattern
    // used for sharing requests.
    public List<BillingRecord> getVisibleBillingRecords(User currentUser) {
        if (currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            return billingRecordRepository.findAll();
        }
        Long institutionId = currentUser.getInstitution() != null
                ? currentUser.getInstitution().getInstitutionId()
                : null;
        if (institutionId == null) {
            return List.of();
        }
        return billingRecordRepository.findByBilledInstitution_InstitutionIdOrOwnerInstitution_InstitutionIdOrderByCreatedAtDesc(
                institutionId, institutionId);
    }

    public BillingRecord getById(Long id) {
        return billingRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing record not found with id: " + id));
    }

    public BillingRecord markStatus(Long id, String status, User currentUser) {
        BillingRecord record = getById(id);
        assertCanManage(record, currentUser);
        record.setStatus(status);
        return billingRecordRepository.save(record);
    }

    // Only the owner institution (who's owed the money) or a system admin can
    // mark a bill Invoiced/Paid - the billed institution shouldn't be able to
    // unilaterally mark their own charge as settled.
    private void assertCanManage(BillingRecord record, User currentUser) {
        if (currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            return;
        }
        Long ownInstitutionId = currentUser.getInstitution() != null
                ? currentUser.getInstitution().getInstitutionId()
                : null;
        Long ownerInstitutionId = record.getOwnerInstitution() != null
                ? record.getOwnerInstitution().getInstitutionId()
                : null;
        if (ownInstitutionId == null || !ownInstitutionId.equals(ownerInstitutionId)) {
            throw new AccessDeniedException("Only the owning institution can update this billing record's status.");
        }
    }
}
