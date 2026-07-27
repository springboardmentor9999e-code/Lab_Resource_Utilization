package com.labresource.service;

import com.labresource.dto.request.BookingRequest;
import com.labresource.dto.response.BookingResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.service.impl.BookingServiceImpl;
import com.labresource.service.impl.EmailService;
import com.labresource.service.impl.NotificationService;
import com.labresource.service.interfaces.WaitlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the booking state machine and validation rules.
 * Pure Mockito — no Spring context or database required.
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingHistoryRepository bookingHistoryRepository;
    @Mock private RecurringBookingRepository recurringBookingRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private WaitlistService waitlistService;
    @Mock private EmailService emailService;
    @Mock private NotificationService notificationService;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private BookingServiceImpl bookingService;

    private AppUser user;
    private Equipment equipment;

    @BeforeEach
    void setUp() {
        user = AppUser.builder()
                .userId(1L).username("student").firstName("Sam").lastName("Student")
                .email("sam@test.local").build();
        equipment = Equipment.builder()
                .equipmentId(10L).equipmentName("Oscilloscope").equipmentCode("EQ-1")
                .status("AVAILABLE").build();
    }

    private void authenticateAs(String username, String... roles) {
        var authorities = java.util.Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new).toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, "x", authorities));
    }

    private BookingRequest request(LocalDate date, LocalTime start, LocalTime end) {
        BookingRequest r = new BookingRequest();
        r.setEquipmentId(10L);
        r.setBookingDate(date);
        r.setStartTime(start);
        r.setEndTime(end);
        return r;
    }

    // -------------------- createBooking --------------------

    @Test
    void createBooking_savesPendingBooking_whenSlotFree() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(bookingRepository.hasOverlappingBooking(any(), any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setBookingId(100L);
            return b;
        });

        BookingResponse resp = bookingService.createBooking(
                request(LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0)), "student");

        assertEquals("PENDING", resp.getStatus());
        assertEquals(10L, resp.getEquipmentId());
        verify(bookingRepository).save(any(Booking.class));
        verify(bookingHistoryRepository).save(any(BookingHistory.class)); // audit trail entry
    }

    @Test
    void createBooking_rejectsPastDate() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(
                        request(LocalDate.now().minusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0)), "student"));
        assertTrue(ex.getMessage().toLowerCase().contains("past"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_rejectsEndBeforeStart() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(
                        request(LocalDate.now().plusDays(1), LocalTime.of(11, 0), LocalTime.of(9, 0)), "student"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_signalsSlotTaken_whenOverlap() {
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(bookingRepository.hasOverlappingBooking(any(), any(), any(), any())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(
                        request(LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0)), "student"));
        assertTrue(ex.getMessage().startsWith("SLOT_TAKEN:"));
    }

    // -------------------- updateBookingStatus (state machine) --------------------

    private Booking pendingBooking() {
        return Booking.builder()
                .bookingId(100L).user(user).equipment(equipment)
                .bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .status("PENDING").build();
    }

    @Test
    void updateStatus_managerConfirmsPending_setsEquipmentReserved() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        Booking booking = pendingBooking();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse resp = bookingService.updateBookingStatus(100L, "CONFIRMED", "mgr");

        assertEquals("CONFIRMED", resp.getStatus());
        assertEquals("RESERVED", equipment.getStatus());
    }

    @Test
    void updateStatus_studentCannotConfirm() {
        authenticateAs("student", "ROLE_STUDENT");
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(pendingBooking()));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.updateBookingStatus(100L, "CONFIRMED", "student"));
        assertTrue(ex.getMessage().toLowerCase().contains("approve"));
    }

    @Test
    void updateStatus_rejectsIllegalTransition_pendingToCompleted() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(pendingBooking()));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.updateBookingStatus(100L, "COMPLETED", "mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("illegal"));
    }

    @Test
    void updateStatus_cancellingFreesWaitlist() {
        authenticateAs("student", "ROLE_STUDENT");
        Booking booking = pendingBooking();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        bookingService.updateBookingStatus(100L, "CANCELLED", "student"); // owner cancels

        verify(waitlistService).notifyNextInLine(eq(10L), eq(booking.getBookingDate()));
    }

    @Test
    void updateStatus_recordsAuditHistory() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(pendingBooking()));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        bookingService.updateBookingStatus(100L, "REJECTED", "mgr");

        verify(bookingHistoryRepository).save(any(BookingHistory.class));
    }
}
