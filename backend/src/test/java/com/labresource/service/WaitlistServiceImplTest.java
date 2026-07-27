package com.labresource.service;

import com.labresource.dto.response.WaitlistResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Equipment;
import com.labresource.entity.Waitlist;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.WaitlistRepository;
import com.labresource.service.impl.NotificationService;
import com.labresource.service.impl.WaitlistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for waitlist queue rules: join validation, duplicate prevention,
 * cancellation permissions and next-in-line notification.
 * Pure Mockito — no Spring context or database required.
 */
@ExtendWith(MockitoExtension.class)
class WaitlistServiceImplTest {

    @Mock private WaitlistRepository waitlistRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private WaitlistServiceImpl waitlistService;

    private AppUser user;
    private Equipment equipment;
    private final LocalDate tomorrow = LocalDate.now().plusDays(1);

    @BeforeEach
    void setUp() {
        user = AppUser.builder()
                .userId(1L).username("student").firstName("Sam").lastName("Student")
                .email("sam@test.local").build();
        equipment = Equipment.builder()
                .equipmentId(10L).equipmentName("Oscilloscope").equipmentCode("EQ-1")
                .status("AVAILABLE").build();

        // @Value is not applied without a Spring context, so the offer window would default to 0
        // and every new offer would be born already expired
        ReflectionTestUtils.setField(waitlistService, "offerWindowHours", 24);
    }

    private Waitlist entry(Long id, String status) {
        return Waitlist.builder()
                .waitlistId(id).equipment(equipment).user(user)
                .requestedDate(tomorrow).priority(1).status(status).build();
    }

    // -------------------- joinWaitlist --------------------

    @Test
    void joinWaitlist_assignsPriorityAfterExistingWaiters() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(waitlistRepository.existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedDateAndStatusIn(
                anyLong(), anyLong(), any(), anyList())).thenReturn(false);
        when(waitlistRepository.countByEquipment_EquipmentIdAndRequestedDateAndStatus(10L, tomorrow, "WAITING"))
                .thenReturn(2L); // two people already waiting
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> {
            Waitlist w = inv.getArgument(0);
            w.setWaitlistId(50L);
            return w;
        });
        when(waitlistRepository.findActiveQueue(10L, tomorrow))
                .thenReturn(List.of(entry(48L, "WAITING"), entry(49L, "WAITING"), entry(50L, "WAITING")));

        WaitlistResponse resp = waitlistService.joinWaitlist(10L, tomorrow, null, null, "student");

        assertEquals(3, resp.getPriority());  // 2 waiting + 1
        assertEquals(3, resp.getPosition());  // last in queue
        assertEquals("WAITING", resp.getStatus());
    }

    @Test
    void joinWaitlist_rejectsPastDate() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        assertThrows(RuntimeException.class, () ->
                waitlistService.joinWaitlist(10L, LocalDate.now().minusDays(1), null, null, "student"));
        verify(waitlistRepository, never()).save(any());
    }

    @Test
    void joinWaitlist_rejectsEndBeforeStart() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        assertThrows(RuntimeException.class, () ->
                waitlistService.joinWaitlist(10L, tomorrow, LocalTime.of(11, 0), LocalTime.of(9, 0), "student"));
    }

    @Test
    void joinWaitlist_rejectsDuplicateActiveEntry() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(waitlistRepository.existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedDateAndStatusIn(
                anyLong(), anyLong(), any(), anyList())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                waitlistService.joinWaitlist(10L, tomorrow, null, null, "student"));
        assertTrue(ex.getMessage().contains("already on the waitlist"));
    }

    // -------------------- cancelWaitlistEntry --------------------

    @Test
    void cancel_ownerCanCancelOwnEntry() {
        when(waitlistRepository.findById(50L)).thenReturn(Optional.of(entry(50L, "WAITING")));
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        WaitlistResponse resp = waitlistService.cancelWaitlistEntry(50L, "student", false);

        assertEquals("CANCELLED", resp.getStatus());
    }

    @Test
    void cancel_strangerWithoutManagerRoleRejected() {
        when(waitlistRepository.findById(50L)).thenReturn(Optional.of(entry(50L, "WAITING")));

        assertThrows(RuntimeException.class, () ->
                waitlistService.cancelWaitlistEntry(50L, "someone-else", false));
        verify(waitlistRepository, never()).save(any());
    }

    @Test
    void cancel_managerCanCancelAnyEntry() {
        when(waitlistRepository.findById(50L)).thenReturn(Optional.of(entry(50L, "NOTIFIED")));
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        WaitlistResponse resp = waitlistService.cancelWaitlistEntry(50L, "mgr", true);

        assertEquals("CANCELLED", resp.getStatus());
    }

    @Test
    void cancel_rejectsTerminalEntry() {
        when(waitlistRepository.findById(50L)).thenReturn(Optional.of(entry(50L, "CONVERTED")));

        assertThrows(RuntimeException.class, () ->
                waitlistService.cancelWaitlistEntry(50L, "student", false));
    }

    // -------------------- notifyNextInLine --------------------

    @Test
    void notifyNextInLine_marksNotifiedAndAlertsOnEveryChannel() {
        Waitlist next = entry(50L, "WAITING");
        when(waitlistRepository.findNextWaiting(10L, tomorrow)).thenReturn(Optional.of(next));
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        waitlistService.notifyNextInLine(10L, tomorrow);

        assertEquals("NOTIFIED", next.getStatus());
        assertNotNull(next.getNotifiedAt());
        // The claim is time-boxed, so this goes out urgent (in-app + email + SMS + push)
        // rather than as a routine in-app notice.
        verify(notificationService).notifyUrgent(eq(user), eq("WAITLIST"), anyString(),
                anyString(), anyString(), anyString());
    }

    @Test
    void notifyNextInLine_noopWhenQueueEmpty() {
        when(waitlistRepository.findNextWaiting(10L, tomorrow)).thenReturn(Optional.empty());

        waitlistService.notifyNextInLine(10L, tomorrow);

        verify(waitlistRepository, never()).save(any());
        verifyNoInteractions(notificationService);
    }

    // -------------------- offer expiry --------------------

    @Test
    void notifyNextInLine_setsOfferDeadline() {
        Waitlist next = entry(50L, "WAITING");
        when(waitlistRepository.findOutstandingOffer(10L, tomorrow)).thenReturn(Optional.empty());
        when(waitlistRepository.findNextWaiting(10L, tomorrow)).thenReturn(Optional.of(next));
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        waitlistService.notifyNextInLine(10L, tomorrow);

        // Without a deadline the claim would never lapse and the queue would stall behind it
        assertNotNull(next.getOfferExpiresAt());
        assertTrue(next.getOfferExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void notifyNextInLine_leavesLiveOfferAlone() {
        // Someone already holds this slot and their window has not run out — handing the same slot
        // to a second person would be worse than making the newly-freed one wait
        Waitlist held = entry(50L, "NOTIFIED");
        held.setOfferExpiresAt(LocalDateTime.now().plusHours(6));
        when(waitlistRepository.findOutstandingOffer(10L, tomorrow)).thenReturn(Optional.of(held));

        waitlistService.notifyNextInLine(10L, tomorrow);

        verify(waitlistRepository, never()).findNextWaiting(anyLong(), any());
        verify(waitlistRepository, never()).save(any());
    }

    @Test
    void notifyNextInLine_releasesLapsedOfferThenPromotes() {
        Waitlist lapsed = entry(50L, "NOTIFIED");
        lapsed.setOfferExpiresAt(LocalDateTime.now().minusHours(1));
        Waitlist next = entry(51L, "WAITING");

        when(waitlistRepository.findOutstandingOffer(10L, tomorrow)).thenReturn(Optional.of(lapsed));
        when(waitlistRepository.findNextWaiting(10L, tomorrow)).thenReturn(Optional.of(next));
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        waitlistService.notifyNextInLine(10L, tomorrow);

        assertEquals("EXPIRED", lapsed.getStatus());
        assertEquals("NOTIFIED", next.getStatus());
        assertNotNull(next.getOfferExpiresAt());
    }

    @Test
    void expireLapsedOffers_passesSlotToNextInLine() {
        Waitlist lapsed = entry(50L, "NOTIFIED");
        lapsed.setOfferExpiresAt(LocalDateTime.now().minusHours(2));
        Waitlist next = entry(51L, "WAITING");

        when(waitlistRepository.findLapsedOffers(any())).thenReturn(List.of(lapsed));
        when(waitlistRepository.findNextWaiting(10L, tomorrow)).thenReturn(Optional.of(next));
        when(waitlistRepository.findStaleByDate(any())).thenReturn(List.of());
        when(waitlistRepository.save(any(Waitlist.class))).thenAnswer(inv -> inv.getArgument(0));

        int released = waitlistService.expireLapsedOffers();

        assertEquals(1, released);
        assertEquals("EXPIRED", lapsed.getStatus());
        assertEquals("NOTIFIED", next.getStatus());
        // The user whose claim ran out is told (routine — the slot is already gone), and the
        // next in line is offered it urgently (their new claim is on a clock).
        verify(notificationService).notifyInApp(any(), eq("WAITLIST"), anyString(), anyString(), anyString());
        verify(notificationService).notifyUrgent(any(), eq("WAITLIST"), anyString(), anyString(),
                anyString(), anyString());
    }

    @Test
    void expireLapsedOffers_closesEntriesForPastDates() {
        Waitlist stale = entry(60L, "WAITING");
        stale.setRequestedDate(LocalDate.now().minusDays(3));

        when(waitlistRepository.findLapsedOffers(any())).thenReturn(List.of());
        when(waitlistRepository.findStaleByDate(any())).thenReturn(List.of(stale));

        int released = waitlistService.expireLapsedOffers();

        assertEquals(0, released); // no offers were released, but the dead entry is closed out
        assertEquals("EXPIRED", stale.getStatus());
        verify(waitlistRepository).saveAll(anyList());
    }

    // -------------------- markConvertedIfNotified --------------------

    @Test
    void markConverted_convertsNotifiedEntryOnBooking() {
        Waitlist notified = entry(50L, "NOTIFIED");
        when(waitlistRepository.findNotifiedEntry(1L, 10L, tomorrow)).thenReturn(Optional.of(notified));

        waitlistService.markConvertedIfNotified(1L, 10L, tomorrow);

        assertEquals("CONVERTED", notified.getStatus());
        verify(waitlistRepository).save(notified);
    }
}
