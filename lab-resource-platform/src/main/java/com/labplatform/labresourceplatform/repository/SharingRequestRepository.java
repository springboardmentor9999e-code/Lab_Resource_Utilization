package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.SharingRequest;
import com.labplatform.labresourceplatform.enums.SharingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {

    List<SharingRequest> findByRequestedBy_UserId(Long userId);

    // A request is "relevant" to an institution if that institution is either the
    // requester or the owner side of the sharing arrangement.
    @Query("SELECT sr FROM SharingRequest sr WHERE " +
           "sr.requesterInstitution.institutionId = :institutionId OR " +
           "sr.ownerInstitution.institutionId = :institutionId")
    List<SharingRequest> findByInstitutionInvolved(@Param("institutionId") Long institutionId);

    // Used to keep a sharing request's status in sync with its linked
    // booking's real status - e.g. when a Waitlisted booking is later
    // promoted, the SharingRequest that shows as WAITLISTED needs to be
    // updated too, or it stays stuck showing WAITLISTED forever even after
    // the requester's slot actually opened up.
    Optional<SharingRequest> findByBooking_BookingId(Long bookingId);

    // Used by the startup reconciliation pass to catch requests that got
    // stuck at WAITLISTED before the promotion-trigger bug (only Cancelled/No
    // Show freed a slot, not Completed) was fixed.
    List<SharingRequest> findByStatus(SharingRequestStatus status);

    // Returns just the booking id, not the full lazy Booking relation - used
    // by the startup reconciliation runner, which runs outside any web
    // request/open Hibernate session. Accessing request.getBooking() there
    // directly would throw LazyInitializationException; selecting the id
    // straight out of the query avoids ever needing to resolve that proxy.
    @Query("SELECT sr.id, sr.booking.bookingId FROM SharingRequest sr WHERE sr.status = :status AND sr.booking IS NOT NULL")
    List<Object[]> findIdAndBookingIdByStatus(@Param("status") SharingRequestStatus status);
}
