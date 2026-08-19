package com.rems.service;

import com.rems.dto.BookingRequest;
import com.rems.dto.BookingResponse;
import com.rems.entity.Booking;
import com.rems.entity.Department;
import com.rems.entity.Equipment;
import com.rems.entity.User;
import com.rems.enums.BookingStatus;
import com.rems.enums.EquipmentStatus;
import com.rems.exception.ApiException;
import com.rems.repository.BookingRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.WaitlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EquipmentService equipmentService;

    @Mock
    private WaitlistService waitlistService;

    @Mock
    private WaitlistRepository waitlistRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private InAppNotificationService inAppNotificationService;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private User testManager;
    private Department testDept;
    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        testDept = Department.builder().departmentId(10L).name("Physics").build();

        testUser = User.builder()
                .userId(1L)
                .name("Alice Researcher")
                .email("alice@test.com")
                .build();

        testManager = User.builder()
                .userId(2L)
                .name("Bob Manager")
                .email("bob@test.com")
                .department(testDept)
                .build();

        testEquipment = Equipment.builder()
                .equipmentId(100L)
                .name("Oscilloscope")
                .status(EquipmentStatus.AVAILABLE)
                .amount(2)
                .department(testDept)
                .build();
    }

    @Test
    void createBooking_Success() {
        Instant now = Instant.now();
        BookingRequest request = BookingRequest.builder()
                .equipmentId(100L)
                .startTime(now.plus(1, ChronoUnit.HOURS))
                .endTime(now.plus(3, ChronoUnit.HOURS))
                .purpose("Experimentation")
                .build();

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(testUser));
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(testEquipment));
        when(waitlistRepository.findByEquipmentEquipmentIdAndStatus(100L, "Notified"))
                .thenReturn(Collections.emptyList());

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setBookingId(500L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request, "alice@test.com");

        assertNotNull(response);
        assertEquals("Pending Approval", response.getStatus());
        assertEquals("alice@test.com", response.getUserEmail());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_ThrowsException_WhenStartTimeAfterEndTime() {
        Instant now = Instant.now();
        BookingRequest request = BookingRequest.builder()
                .equipmentId(100L)
                .startTime(now.plus(5, ChronoUnit.HOURS))
                .endTime(now.plus(2, ChronoUnit.HOURS))
                .purpose("Invalid times")
                .build();

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(testUser));
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(testEquipment));
        when(waitlistRepository.findByEquipmentEquipmentIdAndStatus(100L, "Notified"))
                .thenReturn(Collections.emptyList());

        ApiException ex = assertThrows(ApiException.class, () -> bookingService.createBooking(request, "alice@test.com"));
        assertTrue(ex.getMessage().contains("start time must be before end time"));
    }

    @Test
    void approveBooking_Success() {
        Booking pendingBooking = Booking.builder()
                .bookingId(500L)
                .equipment(testEquipment)
                .user(testUser)
                .status(BookingStatus.PENDING_APPROVAL)
                .startTime(Instant.now().plus(1, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(3, ChronoUnit.HOURS))
                .build();

        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(testManager));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse response = bookingService.approveBooking(500L, "bob@test.com");

        assertNotNull(response);
        assertEquals(BookingStatus.IN_USE.getValue(), response.getStatus());
        assertEquals(1, testEquipment.getAmount());
        verify(equipmentRepository).save(testEquipment);
    }

    @Test
    void approveBooking_ThrowsException_WhenManagerBelongsToDifferentDept() {
        Department otherDept = Department.builder().departmentId(99L).name("Biology").build();
        User wrongManager = User.builder()
                .userId(3L)
                .email("charlie@test.com")
                .department(otherDept)
                .build();

        Booking pendingBooking = Booking.builder()
                .bookingId(500L)
                .equipment(testEquipment)
                .user(testUser)
                .status(BookingStatus.PENDING_APPROVAL)
                .build();

        when(userRepository.findByEmail("charlie@test.com")).thenReturn(Optional.of(wrongManager));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(pendingBooking));

        ApiException ex = assertThrows(ApiException.class, () -> bookingService.approveBooking(500L, "charlie@test.com"));
        assertTrue(ex.getMessage().contains("Manager is not authorized"));
    }
}
