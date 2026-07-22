package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.repository.BookingRepository;
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

    public BookingService(BookingRepository bookingRepository,
                           UtilizationService utilizationService,
                           EquipmentService equipmentService){
        this.bookingRepository = bookingRepository;
        this.utilizationService = utilizationService;
        this.equipmentService = equipmentService;
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

        // If the requested slot conflicts with an existing active booking on the same
        // equipment, place this request on the waitlist instead of Pending Approval
        // (Milestone 2: waitlist management for high-demand equipment).
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                equipmentId, booking.getStartTime(), booking.getEndTime());

        booking.setStatus(conflicts.isEmpty() ? "Pending Approval" : "Waitlisted");
        Booking saved = bookingRepository.save(booking);

        syncEquipmentStatus(saved);
        return saved;
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
                return saved;
            }
            // Still conflicts - leave this one waitlisted and check the next.
        }
        return null;
    }

    public Booking updateBooking(Long id, Booking updatedBooking){

        Booking existing = getBookingById(id);

        if(updatedBooking.getUser() != null)
            existing.setUser(updatedBooking.getUser());

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
        if (timeChanging) {
            LocalDateTime newStart = updatedBooking.getStartTime() != null ? updatedBooking.getStartTime() : existing.getStartTime();
            LocalDateTime newEnd = updatedBooking.getEndTime() != null ? updatedBooking.getEndTime() : existing.getEndTime();

            String effectiveStatus = updatedBooking.getStatus() != null ? updatedBooking.getStatus() : existing.getStatus();
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

        boolean justFreed = updatedBooking.getStatus() != null
                && ("Cancelled".equals(updatedBooking.getStatus()) || "No Show".equals(updatedBooking.getStatus()))
                && !updatedBooking.getStatus().equals(existing.getStatus());

        if(updatedBooking.getStatus() != null)
            existing.setStatus(updatedBooking.getStatus());

        Booking saved = bookingRepository.save(existing);

        // Real-time usage tracking: once a booking is marked Completed, record the
        // actual usage session for utilization-rate calculations (Milestone 2).
        if (justCompleted) {
            utilizationService.logUsageFromBooking(saved);
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
