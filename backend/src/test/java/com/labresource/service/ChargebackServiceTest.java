package com.labresource.service;

import com.labresource.entity.*;
import com.labresource.event.BookingStatusChangedEvent;
import com.labresource.repository.*;
import com.labresource.service.impl.ChargebackService;
import com.labresource.service.impl.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for internal chargeback posting.
 *
 * The rules under test that are easy to get backwards:
 *  - usage is charged to the booking user's department, not the equipment owner's;
 *  - maintenance is charged the other way round, to the owning department;
 *  - nothing is posted twice, and nothing is posted for a zero rate or zero cost.
 */
@ExtendWith(MockitoExtension.class)
class ChargebackServiceTest {

    @Mock private DepartmentChargeRepository departmentChargeRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private ChargebackService chargebackService;

    private Department chemistry;   // the consumer
    private Department physics;     // the equipment owner
    private AppUser consumer;
    private Equipment equipment;
    private Booking booking;

    @BeforeEach
    void setUp() {
        chemistry = Department.builder().departmentId(1L).name("Chemistry").build();
        physics = Department.builder().departmentId(2L).name("Physics").build();

        consumer = AppUser.builder().userId(10L).username("riya").department(chemistry).build();

        equipment = Equipment.builder()
                .equipmentId(30L).equipmentName("NMR Spectrometer").equipmentCode("EQ-030")
                .department(physics)
                .hourlyRate(new BigDecimal("400.00"))
                .build();

        booking = Booking.builder()
                .bookingId(70L).user(consumer).equipment(equipment)
                .bookingDate(LocalDate.of(2026, 7, 20))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 30))
                .status("COMPLETED")
                .build();
    }

    private BookingStatusChangedEvent completedEvent() {
        return BookingStatusChangedEvent.builder()
                .bookingId(70L).equipmentId(30L).userId(10L)
                .oldStatus("IN_USE").newStatus("COMPLETED")
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime()).endTime(booking.getEndTime())
                .build();
    }

    // ---------- usage ----------

    @Test
    void completedBooking_chargesConsumerDepartmentAtHourlyRate() {
        when(departmentChargeRepository.existsByBooking_BookingId(70L)).thenReturn(false);
        when(bookingRepository.findById(70L)).thenReturn(Optional.of(booking));

        chargebackService.onBookingStatusChanged(completedEvent());

        ArgumentCaptor<DepartmentCharge> captor = ArgumentCaptor.forClass(DepartmentCharge.class);
        verify(departmentChargeRepository).save(captor.capture());
        DepartmentCharge charge = captor.getValue();

        // 2.5 h at 400/hr
        assertEquals(0, new BigDecimal("1000.00").compareTo(charge.getAmount()));
        assertEquals(2.5, charge.getHours());
        assertEquals(DepartmentCharge.TYPE_USAGE, charge.getChargeType());
        // The point of the whole feature: Chemistry pays, even though Physics owns the kit.
        assertEquals("Chemistry", charge.getDepartment().getName());
        assertEquals(booking.getBookingDate(), charge.getChargeDate());
    }

    @Test
    void nonCompletedTransition_postsNothing() {
        BookingStatusChangedEvent inUse = BookingStatusChangedEvent.builder()
                .bookingId(70L).equipmentId(30L).userId(10L)
                .oldStatus("CONFIRMED").newStatus("IN_USE")
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime()).endTime(booking.getEndTime())
                .build();

        chargebackService.onBookingStatusChanged(inUse);

        verifyNoInteractions(departmentChargeRepository);
    }

    @Test
    void alreadyChargedBooking_isNotChargedAgain() {
        when(departmentChargeRepository.existsByBooking_BookingId(70L)).thenReturn(true);

        chargebackService.onBookingStatusChanged(completedEvent());

        verify(departmentChargeRepository, never()).save(any());
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void freeEquipment_postsNoZeroValueLine() {
        equipment.setHourlyRate(BigDecimal.ZERO);
        when(departmentChargeRepository.existsByBooking_BookingId(70L)).thenReturn(false);
        when(bookingRepository.findById(70L)).thenReturn(Optional.of(booking));

        chargebackService.onBookingStatusChanged(completedEvent());

        verify(departmentChargeRepository, never()).save(any());
    }

    @Test
    void userWithoutDepartment_isSkippedRatherThanCrashing() {
        consumer.setDepartment(null);
        when(departmentChargeRepository.existsByBooking_BookingId(70L)).thenReturn(false);
        when(bookingRepository.findById(70L)).thenReturn(Optional.of(booking));

        chargebackService.onBookingStatusChanged(completedEvent());

        verify(departmentChargeRepository, never()).save(any());
    }

    @Test
    void failureToPostDoesNotEscapeTheListener() {
        when(departmentChargeRepository.existsByBooking_BookingId(70L)).thenReturn(false);
        when(bookingRepository.findById(70L)).thenThrow(new RuntimeException("db down"));

        // A billing failure must never roll back the booking that triggered it.
        assertDoesNotThrow(() -> chargebackService.onBookingStatusChanged(completedEvent()));
    }

    // ---------- maintenance ----------

    @Test
    void completedMaintenance_chargesOwningDepartment() {
        MaintenanceRequest request = MaintenanceRequest.builder()
                .requestId(88L).equipment(equipment)
                .cost(new BigDecimal("7500.00"))
                .completedAt(LocalDateTime.of(2026, 7, 21, 16, 0))
                .status("COMPLETED")
                .build();
        when(departmentChargeRepository.existsByMaintenanceRequest_RequestId(88L)).thenReturn(false);
        when(maintenanceRequestRepository.findById(88L)).thenReturn(Optional.of(request));

        chargebackService.postMaintenanceCharge(88L);

        ArgumentCaptor<DepartmentCharge> captor = ArgumentCaptor.forClass(DepartmentCharge.class);
        verify(departmentChargeRepository).save(captor.capture());
        DepartmentCharge charge = captor.getValue();

        assertEquals(0, new BigDecimal("7500.00").compareTo(charge.getAmount()));
        assertEquals(DepartmentCharge.TYPE_MAINTENANCE, charge.getChargeType());
        // Upkeep follows the asset, so Physics pays here — the opposite of the usage case.
        assertEquals("Physics", charge.getDepartment().getName());
        assertNull(charge.getHours());
        assertEquals(LocalDate.of(2026, 7, 21), charge.getChargeDate());
    }

    @Test
    void maintenanceWithNoCostRecorded_postsNothing() {
        MaintenanceRequest request = MaintenanceRequest.builder()
                .requestId(89L).equipment(equipment).cost(null).status("COMPLETED").build();
        when(departmentChargeRepository.existsByMaintenanceRequest_RequestId(89L)).thenReturn(false);
        when(maintenanceRequestRepository.findById(89L)).thenReturn(Optional.of(request));

        chargebackService.postMaintenanceCharge(89L);

        verify(departmentChargeRepository, never()).save(any());
    }

    // ---------- budget alerts ----------

    @Test
    void crossingBudget_alertsDepartmentLeadershipUrgently() {
        physics.setAnnualBudget(new BigDecimal("10000.00"));
        AppUser head = AppUser.builder().userId(99L).username("phys_head").department(physics).build();

        MaintenanceRequest request = MaintenanceRequest.builder()
                .requestId(90L).equipment(equipment)
                .cost(new BigDecimal("12000.00"))
                .completedAt(LocalDateTime.now())
                .status("COMPLETED").build();
        when(departmentChargeRepository.existsByMaintenanceRequest_RequestId(90L)).thenReturn(false);
        when(maintenanceRequestRepository.findById(90L)).thenReturn(Optional.of(request));
        when(departmentChargeRepository.sumForDepartment(eq(2L), any(), any()))
                .thenReturn(new BigDecimal("12000.00"));
        when(appUserRepository.findActiveInDepartmentByRoles(eq(2L), anyCollection()))
                .thenReturn(List.of(head));

        chargebackService.postMaintenanceCharge(90L);

        verify(notificationService).notifyUrgent(eq(head), eq("BILLING"),
                contains("Budget Exceeded"), anyString(), anyString());
        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    @Test
    void eightyPercentBudget_warnsWithoutEscalating() {
        physics.setAnnualBudget(new BigDecimal("10000.00"));
        AppUser head = AppUser.builder().userId(99L).username("phys_head").department(physics).build();

        MaintenanceRequest request = MaintenanceRequest.builder()
                .requestId(91L).equipment(equipment)
                .cost(new BigDecimal("500.00"))
                .completedAt(LocalDateTime.now())
                .status("COMPLETED").build();
        when(departmentChargeRepository.existsByMaintenanceRequest_RequestId(91L)).thenReturn(false);
        when(maintenanceRequestRepository.findById(91L)).thenReturn(Optional.of(request));
        when(departmentChargeRepository.sumForDepartment(eq(2L), any(), any()))
                .thenReturn(new BigDecimal("8500.00"));
        when(appUserRepository.findActiveInDepartmentByRoles(eq(2L), anyCollection()))
                .thenReturn(List.of(head));

        chargebackService.postMaintenanceCharge(91L);

        verify(notificationService).notify(eq(head), eq("BILLING"),
                contains("Budget Warning"), anyString(), anyString());
        verify(notificationService, never()).notifyUrgent(any(), any(), any(), any(), any());
    }

    @Test
    void departmentWithNoBudget_isNeverAlerted() {
        physics.setAnnualBudget(null);
        MaintenanceRequest request = MaintenanceRequest.builder()
                .requestId(92L).equipment(equipment)
                .cost(new BigDecimal("5000.00"))
                .completedAt(LocalDateTime.now())
                .status("COMPLETED").build();
        when(departmentChargeRepository.existsByMaintenanceRequest_RequestId(92L)).thenReturn(false);
        when(maintenanceRequestRepository.findById(92L)).thenReturn(Optional.of(request));

        chargebackService.postMaintenanceCharge(92L);

        verify(departmentChargeRepository).save(any());   // the charge is still posted
        verifyNoInteractions(notificationService);        // there is just nothing to breach
    }

    // ---------- budget maintenance ----------

    @Test
    void setAnnualBudget_rejectsNegativeAmounts() {
        assertThrows(IllegalArgumentException.class,
                () -> chargebackService.setAnnualBudget(1L, new BigDecimal("-1")));
        verifyNoInteractions(departmentRepository);
    }

    @Test
    void setAnnualBudget_nullClearsTheBudget() {
        chemistry.setAnnualBudget(new BigDecimal("50000"));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(chemistry));
        when(departmentRepository.save(chemistry)).thenReturn(chemistry);

        Department saved = chargebackService.setAnnualBudget(1L, null);

        assertNull(saved.getAnnualBudget());
    }
}
