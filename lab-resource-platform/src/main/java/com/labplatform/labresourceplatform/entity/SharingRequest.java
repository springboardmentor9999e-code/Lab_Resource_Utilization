package com.labplatform.labresourceplatform.entity;

import com.labplatform.labresourceplatform.enums.SharingRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sharing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "requester_institution_id")
    private Institution requesterInstitution;

    @ManyToOne
    @JoinColumn(name = "owner_institution_id")
    private Institution ownerInstitution;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    private SharingRequestStatus status;

    private String purpose;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    // Set only for sharing requests that were auto-generated as an audit trail
    // when a user booked equipment belonging to a different institution
    // directly (bypassing the request-first workflow, which is allowed - see
    // BookingService.createBooking). Null for a normal, manually-submitted
    // sharing request that still needs review via approve/reject.
    // When this is set, the request already reflects a real outcome
    // (APPROVED/WAITLISTED matching the booking's own status) and must NOT be
    // run through the approve workflow, since that would create a *second*,
    // duplicate booking - see SharingRequestService.approveSharingRequest.
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Only default to PENDING if nothing set a status already - the
        // auto-logged path (see BookingService) creates these already
        // APPROVED/WAITLISTED to reflect a booking that already happened,
        // and shouldn't be forced back into a "needs review" state.
        if (status == null) {
            status = SharingRequestStatus.PENDING;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}