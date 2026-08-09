package com.labresource.platform.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.BookingStatusAnalyticsResponse;
import com.labresource.platform.dto.DashboardSummaryResponse;
import com.labresource.platform.dto.EquipmentStatusAnalyticsResponse;
import com.labresource.platform.dto.EquipmentUtilizationResponse;
import com.labresource.platform.dto.LabUtilizationResponse;
import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.repository.BookingRepository;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.LabRepository;
import com.labresource.platform.repository.MaintenanceRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceImplTest {

    private static final LocalDateTime FROM = LocalDateTime.of(2026, 1, 10, 10, 0);
    private static final LocalDateTime TO = LocalDateTime.of(2026, 1, 10, 14, 0);

    @Mock
    private LabRepository labRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    @Test
    void getDashboardSummaryReturnsCountsAndSums() {
        when(labRepository.count()).thenReturn(3L);
        when(labRepository.countByActiveTrue()).thenReturn(2L);
        when(equipmentRepository.count()).thenReturn(4L);
        when(equipmentRepository.sumQuantity()).thenReturn(12L);
        when(equipmentRepository.sumAvailableQuantity()).thenReturn(7L);
        when(bookingRepository.countByStatus(BookingStatus.PENDING)).thenReturn(5L);
        when(bookingRepository.countByStatus(BookingStatus.APPROVED)).thenReturn(6L);
        when(maintenanceRepository.countByStatusIn(List.of(
                MaintenanceStatus.SCHEDULED,
                MaintenanceStatus.IN_PROGRESS
        ))).thenReturn(2L);

        DashboardSummaryResponse response = analyticsService.getDashboardSummary();

        assertThat(response.totalLabs()).isEqualTo(3L);
        assertThat(response.activeLabs()).isEqualTo(2L);
        assertThat(response.totalEquipmentRecords()).isEqualTo(4L);
        assertThat(response.totalEquipmentUnits()).isEqualTo(12L);
        assertThat(response.availableEquipmentUnits()).isEqualTo(7L);
        assertThat(response.pendingBookings()).isEqualTo(5L);
        assertThat(response.approvedBookings()).isEqualTo(6L);
        assertThat(response.activeMaintenanceRecords()).isEqualTo(2L);
    }

    @Test
    void getDashboardSummaryDefaultsEmptySumsToZero() {
        when(equipmentRepository.sumQuantity()).thenReturn(null);
        when(equipmentRepository.sumAvailableQuantity()).thenReturn(null);

        DashboardSummaryResponse response = analyticsService.getDashboardSummary();

        assertThat(response.totalLabs()).isZero();
        assertThat(response.activeLabs()).isZero();
        assertThat(response.totalEquipmentRecords()).isZero();
        assertThat(response.totalEquipmentUnits()).isZero();
        assertThat(response.availableEquipmentUnits()).isZero();
        assertThat(response.pendingBookings()).isZero();
        assertThat(response.approvedBookings()).isZero();
        assertThat(response.activeMaintenanceRecords()).isZero();
    }

    @Test
    void getBookingStatusAnalyticsReturnsEveryStatusCount() {
        when(bookingRepository.countByStatus(BookingStatus.PENDING)).thenReturn(1L);
        when(bookingRepository.countByStatus(BookingStatus.APPROVED)).thenReturn(2L);
        when(bookingRepository.countByStatus(BookingStatus.REJECTED)).thenReturn(3L);
        when(bookingRepository.countByStatus(BookingStatus.CANCELLED)).thenReturn(4L);
        when(bookingRepository.countByStatus(BookingStatus.COMPLETED)).thenReturn(5L);

        BookingStatusAnalyticsResponse response = analyticsService.getBookingStatusAnalytics();

        assertThat(response.pending()).isEqualTo(1L);
        assertThat(response.approved()).isEqualTo(2L);
        assertThat(response.rejected()).isEqualTo(3L);
        assertThat(response.cancelled()).isEqualTo(4L);
        assertThat(response.completed()).isEqualTo(5L);
    }

    @Test
    void getEquipmentStatusAnalyticsReturnsEveryStatusCount() {
        when(equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE)).thenReturn(6L);
        when(equipmentRepository.countByStatus(EquipmentStatus.IN_USE)).thenReturn(7L);
        when(equipmentRepository.countByStatus(EquipmentStatus.MAINTENANCE)).thenReturn(8L);
        when(equipmentRepository.countByStatus(EquipmentStatus.OUT_OF_SERVICE)).thenReturn(9L);

        EquipmentStatusAnalyticsResponse response = analyticsService.getEquipmentStatusAnalytics();

        assertThat(response.available()).isEqualTo(6L);
        assertThat(response.inUse()).isEqualTo(7L);
        assertThat(response.maintenance()).isEqualTo(8L);
        assertThat(response.outOfService()).isEqualTo(9L);
    }

    @Test
    void getEquipmentUtilizationRejectsRangeWhereFromEqualsTo() {
        assertThatThrownBy(() -> analyticsService.getEquipmentUtilization(FROM, FROM))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("From date-time must be before to date-time");

        verifyNoInteractions(labRepository, equipmentRepository, bookingRepository);
    }

    @Test
    void getLabUtilizationRejectsRangeWhereFromIsAfterTo() {
        assertThatThrownBy(() -> analyticsService.getLabUtilization(TO, FROM))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("From date-time must be before to date-time");

        verifyNoInteractions(labRepository, equipmentRepository, bookingRepository);
    }

    @Test
    void equipmentWithZeroBookingsReturnsZeroUtilization() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 4);
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(), FROM, TO);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(FROM, TO);

        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.equipmentId()).isEqualTo(equipment.getId());
            assertThat(response.approvedBookingCount()).isZero();
            assertThat(response.approvedBookedUnits()).isZero();
            assertThat(response.utilizationPercentage()).isEqualTo(0.0);
        });
    }

    @Test
    void partiallyOverlappingBookingUsesOnlyOverlapDuration() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 4);
        Booking booking = booking(
                100L,
                equipment,
                BookingStatus.APPROVED,
                2,
                FROM.minusHours(2),
                FROM.plusHours(2)
        );
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(booking), FROM, TO);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(FROM, TO);

        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.approvedBookingCount()).isEqualTo(1L);
            assertThat(response.approvedBookedUnits()).isEqualTo(2L);
            assertThat(response.utilizationPercentage()).isEqualTo(25.0);
        });
    }

    @Test
    void bookingOutsideRangeIsExcluded() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 4);
        Booking outsideBooking = booking(
                100L,
                equipment,
                BookingStatus.APPROVED,
                3,
                FROM.minusHours(4),
                FROM.minusHours(1)
        );
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(outsideBooking), FROM, TO);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(FROM, TO);

        verify(bookingRepository).findOverlappingByStatus(BookingStatus.APPROVED, FROM, TO);
        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.approvedBookingCount()).isZero();
            assertThat(response.approvedBookedUnits()).isZero();
            assertThat(response.utilizationPercentage()).isZero();
        });
    }

    @Test
    void nonApprovedBookingIsExcluded() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 4);
        Booking pendingBooking = booking(100L, equipment, BookingStatus.PENDING, 3, FROM, FROM.plusHours(2));
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(pendingBooking), FROM, TO);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(FROM, TO);

        verify(bookingRepository).findOverlappingByStatus(BookingStatus.APPROVED, FROM, TO);
        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.approvedBookingCount()).isZero();
            assertThat(response.approvedBookedUnits()).isZero();
            assertThat(response.utilizationPercentage()).isZero();
        });
    }

    @Test
    void multipleOverlappingApprovedBookingsCalculateReservedUnitHours() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 10);
        Booking firstBooking = booking(100L, equipment, BookingStatus.APPROVED, 2, FROM, FROM.plusHours(2));
        Booking secondBooking = booking(101L, equipment, BookingStatus.APPROVED, 3, FROM.plusHours(1), TO);
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(firstBooking, secondBooking), FROM, TO);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(FROM, TO);

        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.approvedBookingCount()).isEqualTo(2L);
            assertThat(response.approvedBookedUnits()).isEqualTo(5L);
            assertThat(response.utilizationPercentage()).isEqualTo(32.5);
        });
    }

    @Test
    void labUtilizationAggregatesAllEquipmentInLab() {
        Lab lab = lab(1L);
        Equipment centrifuge = equipment(10L, lab, 4);
        Equipment microscope = equipment(11L, lab, 6);
        Booking firstBooking = booking(100L, centrifuge, BookingStatus.APPROVED, 2, FROM, FROM.plusHours(2));
        Booking secondBooking = booking(101L, microscope, BookingStatus.APPROVED, 3, FROM, TO);
        mockUtilizationData(List.of(lab), List.of(centrifuge, microscope), List.of(firstBooking, secondBooking), FROM, TO);

        List<LabUtilizationResponse> responses = analyticsService.getLabUtilization(FROM, TO);

        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.labId()).isEqualTo(lab.getId());
            assertThat(response.equipmentRecords()).isEqualTo(2L);
            assertThat(response.equipmentUnits()).isEqualTo(10L);
            assertThat(response.approvedBookingCount()).isEqualTo(2L);
            assertThat(response.approvedBookedUnits()).isEqualTo(5L);
            assertThat(response.utilizationPercentage()).isEqualTo(40.0);
        });
    }

    @Test
    void labWithZeroEquipmentDoesNotDivideByZero() {
        Lab lab = lab(1L);
        mockUtilizationData(List.of(lab), List.of(), List.of(), FROM, TO);

        List<LabUtilizationResponse> responses = analyticsService.getLabUtilization(FROM, TO);

        assertThat(responses).singleElement().satisfies(response -> {
            assertThat(response.equipmentRecords()).isZero();
            assertThat(response.equipmentUnits()).isZero();
            assertThat(response.utilizationPercentage()).isEqualTo(0.0);
        });
    }

    @Test
    void percentagesAreRoundedToTwoDecimalPlaces() {
        LocalDateTime from = LocalDateTime.of(2026, 1, 10, 10, 0);
        LocalDateTime to = from.plusHours(3);
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 3);
        Booking booking = booking(100L, equipment, BookingStatus.APPROVED, 1, from, from.plusHours(1));
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(booking), from, to);

        List<EquipmentUtilizationResponse> responses = analyticsService.getEquipmentUtilization(from, to);

        assertThat(responses).singleElement().satisfies(response ->
                assertThat(response.utilizationPercentage()).isEqualTo(11.11)
        );
    }

    @Test
    void analyticsMethodsDoNotMutateEntities() {
        Lab lab = lab(1L);
        Equipment equipment = equipment(10L, lab, 4);
        Booking booking = booking(100L, equipment, BookingStatus.APPROVED, 2, FROM, FROM.plusHours(1));
        mockUtilizationData(List.of(lab), List.of(equipment), List.of(booking), FROM, TO);

        analyticsService.getEquipmentUtilization(FROM, TO);

        assertThat(lab.getName()).isEqualTo("Bio Lab 1");
        assertThat(equipment.getStatus()).isEqualTo(EquipmentStatus.AVAILABLE);
        assertThat(equipment.getQuantity()).isEqualTo(4);
        assertThat(equipment.getAvailableQuantity()).isEqualTo(4);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.APPROVED);
        assertThat(booking.getQuantity()).isEqualTo(2);
    }

    private void mockUtilizationData(
            List<Lab> labs,
            List<Equipment> equipment,
            List<Booking> bookings,
            LocalDateTime from,
            LocalDateTime to
    ) {
        when(labRepository.findAll()).thenReturn(labs);
        when(equipmentRepository.findAllWithLab()).thenReturn(equipment);
        when(bookingRepository.findOverlappingByStatus(BookingStatus.APPROVED, from, to)).thenReturn(bookings);
    }

    private Lab lab(Long id) {
        return Lab.builder()
                .id(id)
                .name("Bio Lab " + id)
                .building("Science Block")
                .roomNumber("204")
                .capacity(30)
                .active(true)
                .build();
    }

    private Equipment equipment(Long id, Lab lab, Integer quantity) {
        return Equipment.builder()
                .id(id)
                .name("Centrifuge " + id)
                .category("Sample Prep")
                .manufacturer("Eppendorf")
                .serialNumber("SN-" + id)
                .quantity(quantity)
                .availableQuantity(quantity)
                .status(EquipmentStatus.AVAILABLE)
                .purchaseDate(LocalDate.of(2024, 2, 10))
                .lab(lab)
                .build();
    }

    private Booking booking(
            Long id,
            Equipment equipment,
            BookingStatus status,
            Integer quantity,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
        return Booking.builder()
                .id(id)
                .equipment(equipment)
                .quantity(quantity)
                .startTime(startTime)
                .endTime(endTime)
                .purpose("PCR analysis")
                .status(status)
                .build();
    }
}
