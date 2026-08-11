package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.SharingRequest;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.SharingRequestStatus;
import com.labplatform.labresourceplatform.repository.BookingRepository;
import com.labplatform.labresourceplatform.repository.SharingRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private static final List<String> ACTIVE_STATUSES =
            List.of("Pending Approval", "Confirmed", "In Use");

    private final BookingRepository bookingRepository;
    private final UtilizationService utilizationService;
    private final EquipmentService equipmentService;
    private final UserService userService;
    private final SharingRequestRepository sharingRequestRepository;
    private final BillingRecordService billingRecordService;

    public BookingService(BookingRepository bookingRepository,
                           UtilizationService utilizationService,
                           EquipmentService equipmentService,
                           UserService userService,
                           SharingRequestRepository sharingRequestRepository,
                           BillingRecordService billingRecordService){
        this.bookingRepository = bookingRepository;
        this.utilizationService = utilizationService;
        this.equipmentService = equipmentService;
        this.userService = userService;
        this.sharingRequestRepository = sharingRequestRepository;
        this.billingRecordService = billingRecordService;
    }

    public List<Booking> getAllBookings(){
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsForUser(Long userId){
        return bookingRepository.findByUser_UserId(userId);
    }

    public Booking getBookingById(Long id){
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public boolean isOwnedBy(Long bookingId, Long userId){
        Booking booking = getBookingById(bookingId);
        return booking.getUser() != null && booking.getUser().getUserId().equals(userId);
    }

    public Booking createBooking(Booking booking){
        return createBooking(booking, true);
    }

    // logCrossInstitutionSharing=false is used when this booking is itself
    // being created as the side effect of approving a SharingRequest (see
    // SharingRequestService.approveSharingRequest) - that caller already links
    // the real, human-reviewed SharingRequest to the booking it creates, so
    // auto-logging here too would create a second, redundant audit record for
    // the same access. Only a booking made directly by a user (bypassing the
    // request-first workflow entirely) should trigger the auto-log.
    private Booking createBooking(Booking booking, boolean logCrossInstitutionSharing){
        // The incoming booking's `equipment` is whatever the client sent in the
        // request body - typically just { equipmentId: N } with no other fields
        // populated. Re-fetch the real, fully-loaded Equipment before saving so
        // the booking (and the response we return) references the actual entity
        // with its name/category/etc, not a bare id. Without this, the create
        // response echoes back an equipment object with only equipmentId set,
        // and the UI falls back to showing "Equipment #N" until the next full
        // page load re-fetches bookings with the real, DB-loaded equipment.
        Long equipmentId = booking.getEquipment().getEquipmentId();
        booking.setEquipment(equipmentService.getEquipmentById(equipmentId));

        // "The technician will receive message for calibration test... then he
        // can approve the registered equipment" - equipment sitting in Pending
        // Calibration hasn't been verified as accurate yet, so it can't be
        // booked at all until a technician logs its first calibration record
        // (see CalibrationRecordService.create -> approveInitialCalibration).
        // Without this check, the status existed but nothing actually
        // enforced it - equipment could still be booked while awaiting
        // verification, which defeats the entire point of the gate.
        if (EquipmentService.PENDING_CALIBRATION.equals(booking.getEquipment().getStatus())) {
            throw new RuntimeException(
                    "This equipment is awaiting its initial calibration check and can't be booked yet.");
        }

        // Same re-fetch for the user - for self-service roles the controller
        // already attaches the real, DB-loaded current user, but a staff member
        // booking on someone else's behalf sends only { userId: N }. Re-fetching
        // here guarantees booking.getUser().getInstitution() below is always
        // real data, and keeps the response consistent for both cases.
        if (booking.getUser() == null || booking.getUser().getUserId() == null) {
            throw new RuntimeException("A booking must specify which user it is for.");
        }
        booking.setUser(userService.getUserById(booking.getUser().getUserId()));

        // If the requested slot conflicts with an existing active booking on the same
        // equipment, place this request on the waitlist instead of Pending Approval
        // (Milestone 2: waitlist management for high-demand equipment).
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                equipmentId, booking.getStartTime(), booking.getEndTime());

        booking.setStatus(conflicts.isEmpty() ? "Pending Approval" : "Waitlisted");
        Booking saved = bookingRepository.save(booking);

        syncEquipmentStatus(saved);
        if (logCrossInstitutionSharing) {
            logSharingRequestIfCrossInstitution(saved);
        }
        return saved;
    }

    // Used only by SharingRequestService when approving a manually-submitted
    // sharing request, so its booking-creation doesn't also trigger the
    // auto-log path above (that would create a duplicate, redundant
    // SharingRequest for access that's already being tracked by the original,
    // human-reviewed one).
    Booking createBookingWithoutSharingAudit(Booking booking){
        return createBooking(booking, false);
    }

    // Booking equipment that belongs to a different institution than the
    // booker is allowed directly (no approval gate) - but it should still show
    // up in Sharing Requests for visibility/audit, the same place a
    // manually-submitted cross-institution request would appear. This creates
    // that record automatically, already reflecting the real outcome
    // (APPROVED if the booking is active, WAITLISTED if it landed on the
    // waitlist) rather than PENDING, since the access has already happened -
    // there's nothing left to approve.
    private void logSharingRequestIfCrossInstitution(Booking booking){
        User requester = booking.getUser();
        Institution requesterInstitution = requester != null ? requester.getInstitution() : null;

        Institution ownerInstitution = booking.getEquipment() != null && booking.getEquipment().getLab() != null
                ? booking.getEquipment().getLab().getInstitution()
                : null;

        if (requesterInstitution == null || ownerInstitution == null) {
            return;
        }
        if (requesterInstitution.getInstitutionId().equals(ownerInstitution.getInstitutionId())) {
            return;
        }

        SharingRequest auditRecord = new SharingRequest();
        auditRecord.setEquipment(booking.getEquipment());
        auditRecord.setRequesterInstitution(requesterInstitution);
        auditRecord.setOwnerInstitution(ownerInstitution);
        auditRecord.setRequestedBy(requester);
        auditRecord.setStartDate(booking.getStartTime());
        auditRecord.setEndDate(booking.getEndTime());
        auditRecord.setPurpose("Auto-logged: booked directly rather than via a sharing request.");
        auditRecord.setBooking(booking);
        auditRecord.setStatus("Waitlisted".equals(booking.getStatus())
                ? SharingRequestStatus.WAITLISTED
                : SharingRequestStatus.APPROVED);

        sharingRequestRepository.save(auditRecord);
    }

    public List<Booking> getWaitlistForEquipment(Long equipmentId){
        return bookingRepository.findByEquipment_EquipmentIdAndStatusOrderByCreatedAtAsc(equipmentId, "Waitlisted");
    }

    // Call after a booking is Cancelled/No-Show to offer the freed slot to the next
    // waitlisted request for the same equipment. Does not auto-confirm; moves the
    // promoted booking to Pending Approval so staff can approve as usual.
    //
    // Item #7 fix: a waitlisted booking's own requested time range may no longer be
    // free by the time its turn comes up (e.g. a different, later-waitlisted request
    // for an overlapping-but-not-identical window was separately confirmed in the
    // meantime). Re-validate the promoted booking's time range against currently
    // active bookings before promoting it; if it still conflicts, leave it waitlisted
    // and try the next request in line instead of blindly promoting the head of the queue.
    public Booking promoteNextInLine(Long equipmentId){
        List<Booking> waitlist = getWaitlistForEquipment(equipmentId);

        for (Booking candidate : waitlist) {
            List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcluding(
                    equipmentId, candidate.getStartTime(), candidate.getEndTime(), candidate.getBookingId());

            if (conflicts.isEmpty()) {
                candidate.setStatus("Pending Approval");
                Booking saved = bookingRepository.save(candidate);
                syncEquipmentStatus(saved);
                syncLinkedSharingRequestStatus(saved);
                return saved;
            }
            // Still conflicts - leave this one waitlisted and check the next.
        }
        return null;
    }

    // Bug fix: a SharingRequest linked to a Waitlisted booking (see
    // approveSharingRequest and logSharingRequestIfCrossInstitution) was never
    // updated when that booking later got promoted off the waitlist - the
    // request stayed showing WAITLISTED permanently, even once the requester's
    // slot actually opened up and the booking moved to Pending Approval. This
    // brings the request's status back in line with its booking's real state
    // whenever the booking's status changes here.
    private void syncLinkedSharingRequestStatus(Booking booking){
        sharingRequestRepository.findByBooking_BookingId(booking.getBookingId()).ifPresent(request -> {
            if (request.getStatus() == SharingRequestStatus.WAITLISTED
                    && ACTIVE_STATUSES.contains(booking.getStatus())) {
                request.setStatus(SharingRequestStatus.APPROVED);
                sharingRequestRepository.save(request);
            }
        });
    }

    // Startup self-heal for requests that got stuck at WAITLISTED before two
    // related bugs were fixed: (1) promoteNextInLine never told the linked
    // SharingRequest about a promotion, and (2) a booking being marked
    // Completed (as opposed to Cancelled/No Show) never triggered promotion
    // at all. Rather than requiring a manual SQL fix every time logic like
    // this changes, this re-checks every currently-WAITLISTED request's
    // linked booking on every startup and corrects any that are already out
    // of sync - safe to run repeatedly, it only writes when there's an actual
    // mismatch to fix.
    public void reconcileStuckWaitlistedSharingRequests(){
        for (Object[] row : sharingRequestRepository.findIdAndBookingIdByStatus(SharingRequestStatus.WAITLISTED)) {
            Long requestId = (Long) row[0];
            Long bookingId = (Long) row[1];

            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                continue;
            }

            // Completed also counts as "the requester got real access" here,
            // same reasoning as justFreed treating Completed as freeing the
            // slot below - by the time a booking is Completed, the requester
            // clearly did get to use the equipment, so the request should
            // read APPROVED, not still WAITLISTED.
            if (ACTIVE_STATUSES.contains(booking.getStatus()) || "Completed".equals(booking.getStatus())) {
                sharingRequestRepository.findById(requestId).ifPresent(request -> {
                    request.setStatus(SharingRequestStatus.APPROVED);
                    sharingRequestRepository.save(request);
                });
            }
        }
    }

    public Booking updateBooking(Long id, Booking updatedBooking){

        Booking existing = getBookingById(id);

        if(updatedBooking.getUser() != null)
            // Same re-fetch as createBooking(): avoid saving/echoing back a
            // partial user object (just an id) if a booking is reassigned to a
            // different user during an edit.
            existing.setUser(userService.getUserById(updatedBooking.getUser().getUserId()));

        if(updatedBooking.getEquipment() != null)
            // Same fix as createBooking(): re-fetch the real, fully-loaded
            // Equipment rather than saving/echoing back whatever partial object
            // the client sent (typically just an id).
            existing.setEquipment(equipmentService.getEquipmentById(updatedBooking.getEquipment().getEquipmentId()));

        if(updatedBooking.getBookingDate() != null)
            existing.setBookingDate(updatedBooking.getBookingDate());

        // Item #6 fix: if the time range is changing, re-check for scheduling
        // conflicts on the new range before accepting it - previously a booking
        // could be rescheduled onto a slot that overlaps another active booking
        // with no validation at all. Only bookings in an active status need this
        // check; a Completed/Cancelled/No Show/Waitlisted booking being edited for
        // other reasons doesn't hold a live slot to protect.
        boolean timeChanging = updatedBooking.getStartTime() != null || updatedBooking.getEndTime() != null;

        // Second, related gap this closes: approving a Waitlisted booking (e.g.
        // via the Bookings page "Approve" button) sends only { status:
        // "Confirmed" } with no time fields at all, since the time isn't
        // changing. That meant timeChanging was false and the conflict check
        // above never ran - a Waitlisted booking could be manually approved
        // straight past an active conflict it was waitlisted for in the first
        // place, double-booking the equipment. Anytime a booking is moving INTO
        // an active status (regardless of whether the time itself changed), it
        // needs the same validation against its *current* time range.
        String previousStatus = existing.getStatus();
        String requestedStatus = updatedBooking.getStatus();
        boolean enteringActiveStatus = requestedStatus != null
                && ACTIVE_STATUSES.contains(requestedStatus)
                && !ACTIVE_STATUSES.contains(previousStatus);

        if (timeChanging || enteringActiveStatus) {
            LocalDateTime newStart = updatedBooking.getStartTime() != null ? updatedBooking.getStartTime() : existing.getStartTime();
            LocalDateTime newEnd = updatedBooking.getEndTime() != null ? updatedBooking.getEndTime() : existing.getEndTime();

            String effectiveStatus = requestedStatus != null ? requestedStatus : previousStatus;
            if (ACTIVE_STATUSES.contains(effectiveStatus)) {
                List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcluding(
                        existing.getEquipment().getEquipmentId(), newStart, newEnd, existing.getBookingId());
                if (!conflicts.isEmpty()) {
                    throw new RuntimeException(
                            "This time range conflicts with another active booking for this equipment.");
                }
            }

            existing.setStartTime(newStart);
            existing.setEndTime(newEnd);
        }

        boolean justCompleted = updatedBooking.getStatus() != null
                && "Completed".equals(updatedBooking.getStatus())
                && !"Completed".equals(existing.getStatus());

        // Bug fix: this previously only covered "Cancelled"/"No Show" - a
        // booking that finished normally (Completed) also frees its slot for
        // the next waitlisted request, but nothing was triggering promotion
        // for that case. A waitlisted request whose conflict was a booking
        // that later completed (rather than being explicitly cancelled) could
        // sit WAITLISTED forever even after that time slot had genuinely passed.
        boolean justFreed = updatedBooking.getStatus() != null
                && ("Cancelled".equals(updatedBooking.getStatus())
                    || "No Show".equals(updatedBooking.getStatus())
                    || "Completed".equals(updatedBooking.getStatus()))
                && !updatedBooking.getStatus().equals(existing.getStatus());

        if(updatedBooking.getStatus() != null)
            existing.setStatus(updatedBooking.getStatus());

        Booking saved = bookingRepository.save(existing);

        // Real-time usage tracking: once a booking is marked Completed, record the
        // actual usage session for utilization-rate calculations (Milestone 2).
        if (justCompleted) {
            utilizationService.logUsageFromBooking(saved);
            // Milestone 3, task 3: if this was a cross-institution booking with
            // a priced equipment rate, generate the corresponding bill. No-ops
            // silently if the booking was within one institution or the
            // equipment has no hourly rate set - see
            // BillingRecordService.createBillingRecordIfApplicable for the exact conditions.
            billingRecordService.createBillingRecordIfApplicable(saved);
        }

        // Waitlist management: offer the freed slot to the next waitlisted request.
        if (justFreed && saved.getEquipment() != null) {
            promoteNextInLine(saved.getEquipment().getEquipmentId());
        }

        // Item #10 fix: keep the equipment's status in sync with what actually
        // happens to its bookings, instead of leaving it permanently whatever it
        // was set to at creation. Runs after the completed/freed handling above so
        // it sees the final, saved booking status.
        syncEquipmentStatus(saved);

        // Same fix as promoteNextInLine(): if this booking is linked to a
        // WAITLISTED sharing request and just moved into an active status
        // (whether via promotion above, or - as here - a staff member
        // manually approving a Waitlisted booking straight through the
        // Bookings page), bring the request's status back in line rather than
        // leaving it stuck showing WAITLISTED after the slot actually opened up.
        if (enteringActiveStatus) {
            syncLinkedSharingRequestStatus(saved);
        }

        return saved;
    }

    public void deleteBooking(Long id){
        Booking existing = getBookingById(id);
        Long equipmentId = existing.getEquipment() != null ? existing.getEquipment().getEquipmentId() : null;
        bookingRepository.deleteById(id);

        // A deleted booking frees its slot the same way Cancelled/No Show does.
        if (equipmentId != null) {
            promoteNextInLine(equipmentId);
            reconcileEquipmentStatus(equipmentId);
        }
    }

    // Item #10: mirror a booking's status onto its equipment's availability -
    // Confirmed/In Use marks the equipment Booked; Completed/Cancelled/No Show/
    // Waitlisted/Pending Approval releases it back to Available, UNLESS another
    // still-active booking is currently holding the same equipment (e.g. this
    // status change was on an older booking while a newer one is In Use), or the
    // equipment is in a manually-controlled state like Under Maintenance.
    private void syncEquipmentStatus(Booking booking){
        if (booking.getEquipment() == null) {
            return;
        }
        reconcileEquipmentStatus(booking.getEquipment().getEquipmentId());
    }

    private void reconcileEquipmentStatus(Long equipmentId){
        boolean anyActive = ACTIVE_STATUSES.stream()
                .anyMatch(status -> !bookingRepository
                        .findByEquipment_EquipmentIdAndStatusOrderByCreatedAtAsc(equipmentId, status)
                        .isEmpty());

        equipmentService.applyBookingDrivenStatus(equipmentId, anyActive ? "Booked" : "Available");
    }
}
