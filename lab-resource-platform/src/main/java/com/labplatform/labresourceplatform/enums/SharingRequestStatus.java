package com.labplatform.labresourceplatform.enums;

public enum SharingRequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED,
    // Approved, but the booking it created came back Waitlisted due to a
    // scheduling conflict - the approver's decision was "yes" but the requester
    // doesn't have usable access yet. Distinct from APPROVED so the UI can make
    // this outcome visible instead of implying access was fully granted.
    WAITLISTED
}