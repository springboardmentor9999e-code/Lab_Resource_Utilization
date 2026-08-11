package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {

    // "What this institution owes to others" - they were the requester/user side.
    List<BillingRecord> findByBilledInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    // "What this institution is owed by others" - they own the equipment used.
    List<BillingRecord> findByOwnerInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    // Every record involving an institution on either side - used for
    // INSTITUTION_ADMINISTRATOR's own-institution billing view.
    List<BillingRecord> findByBilledInstitution_InstitutionIdOrOwnerInstitution_InstitutionIdOrderByCreatedAtDesc(
            Long billedInstitutionId, Long ownerInstitutionId);

    // Prevents double-billing the same booking if createBillingRecordIfApplicable
    // somehow runs twice for it (e.g. a booking edited back and forth across
    // Completed).
    Optional<BillingRecord> findByBooking_BookingId(Long bookingId);
}
