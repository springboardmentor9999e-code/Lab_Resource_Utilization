package com.labresource.service;

import com.labresource.dto.response.EquipmentUtilizationResponse;
import com.labresource.dto.response.HeatmapCellResponse;
import com.labresource.dto.response.IdleEquipmentResponse;
import com.labresource.dto.response.UtilizationSummaryResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.EquipmentUsageRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UtilizationBookingRepository;
import com.labresource.service.impl.UtilizationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for utilization-rate math, heatmap slot aggregation and idle
 * equipment detection. Pure Mockito — no Spring context or database required.
 */
@ExtendWith(MockitoExtension.class)
class UtilizationServiceImplTest {

    @Mock private EquipmentRepository equipmentRepository;
    @Mock private EquipmentUsageRepository equipmentUsageRepository;
    @Mock private UtilizationBookingRepository utilizationBookingRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private InstitutionRepository institutionRepository;

    @InjectMocks private UtilizationServiceImpl utilizationService;

    private Equipment equipment;
    private AppUser user;
    private Department dept;
    private Institution institution;

    @BeforeEach
    void setUp() {
        institution = Institution.builder().institutionId(1L).name("Owner University").code("OU").build();
        dept = Department.builder()
                .departmentId(1L).name("Physics").code("PHY").institution(institution).build();
        equipment = Equipment.builder()
                .equipmentId(10L).equipmentName("Oscilloscope").equipmentCode("EQ-1")
                .status("AVAILABLE").department(dept).institution(institution).build();
        user = AppUser.builder().userId(1L).username("student").institution(institution).build();

        // @Value is not applied without a Spring context; without this the default target would be
        // 0% and every department would read as wildly ABOVE target
        ReflectionTestUtils.setField(utilizationService, "defaultTargetPercent", 60.0);
    }

    private Booking booking(LocalDate date, LocalTime start, LocalTime end) {
        return Booking.builder()
                .bookingId(1L).user(user).equipment(equipment)
                .bookingDate(date).startTime(start).endTime(end)
                .status("CONFIRMED").build();
    }

    // -------------------- getEquipmentUtilization --------------------

    @Test
    void utilizationRate_computedAgainstOperatingCapacity() {
        // 1 day window -> capacity 720 min; one 6h booking = 360 min -> 50%
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(utilizationBookingRepository.findInWindowForEquipment(eq(10L), any(), any(), anyList()))
                .thenReturn(List.of(booking(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(15, 0))));
        when(equipmentUsageRepository.sumUsedMinutes(eq(10L), any())).thenReturn(300L);

        EquipmentUtilizationResponse resp = utilizationService.getEquipmentUtilization(10L, 1);

        assertEquals(360L, resp.getBookedMinutes());
        assertEquals(300L, resp.getUsedMinutes());
        assertEquals(50.0, resp.getUtilizationRate());
        assertEquals(1, resp.getBookingCount());
    }

    @Test
    void utilizationRate_cappedAt100Percent() {
        // 1 day window but 2 bookings of 12h each -> raw rate > 100, must clamp
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(utilizationBookingRepository.findInWindowForEquipment(eq(10L), any(), any(), anyList()))
                .thenReturn(List.of(
                        booking(LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(20, 0)),
                        booking(LocalDate.now().minusDays(1), LocalTime.of(8, 0), LocalTime.of(20, 0))));
        when(equipmentUsageRepository.sumUsedMinutes(eq(10L), any())).thenReturn(0L);

        EquipmentUtilizationResponse resp = utilizationService.getEquipmentUtilization(10L, 1);

        assertEquals(100.0, resp.getUtilizationRate());
    }

    @Test
    void utilization_throwsWhenEquipmentMissing() {
        when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> utilizationService.getEquipmentUtilization(999L, 30));
    }

    // -------------------- getSummary --------------------

    @Test
    void summary_aggregatesAcrossEquipmentAndDepartments() {
        Booking b = booking(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(12, 0)); // 180 min
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of(b));
        when(equipmentRepository.findAll()).thenReturn(List.of(equipment));
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any()))
                .thenReturn(List.<Object[]>of(new Object[]{10L, 120L}));
        when(utilizationBookingRepository.findLastBookingDates(anyList()))
                .thenReturn(List.<Object[]>of(new Object[]{10L, LocalDate.now()}));

        UtilizationSummaryResponse resp = utilizationService.getSummary(1);

        assertEquals(180L, resp.getTotalBookedMinutes());
        assertEquals(120L, resp.getTotalUsedMinutes());
        assertEquals(1, resp.getEquipmentCount());
        assertEquals(25.0, resp.getOverallUtilizationRate()); // 180 / 720
        assertEquals(25.0, resp.getDepartmentUtilization().get("Physics"));
        assertEquals(0, resp.getIdleEquipmentCount()); // booked today -> not idle
    }

    // -------------------- getHeatmap --------------------

    @Test
    void heatmap_distributesBookingAcrossHourSlots() {
        // Booking 09:30-11:30 -> 30 min in slot 9, 60 in slot 10, 30 in slot 11
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList()))
                .thenReturn(List.of(booking(LocalDate.now(), LocalTime.of(9, 30), LocalTime.of(11, 30))));

        List<HeatmapCellResponse> cells = utilizationService.getHeatmap(7, null);

        int dow = LocalDate.now().getDayOfWeek().getValue();
        assertEquals(7 * 12, cells.size()); // 7 days x 12 operating hours

        long slot9 = cellMinutes(cells, dow, 9);
        long slot10 = cellMinutes(cells, dow, 10);
        long slot11 = cellMinutes(cells, dow, 11);
        assertEquals(30L, slot9);
        assertEquals(60L, slot10);
        assertEquals(30L, slot11);
        assertEquals(0L, cellMinutes(cells, dow, 8)); // untouched slot stays empty
    }

    private long cellMinutes(List<HeatmapCellResponse> cells, int dow, int hour) {
        return cells.stream()
                .filter(c -> c.getDayOfWeek() == dow && c.getHour() == hour)
                .findFirst().orElseThrow().getMinutes();
    }

    // -------------------- getIdleEquipment --------------------

    @Test
    void idleDetection_flagsNeverBookedAndStaleEquipment() {
        Equipment neverBooked = Equipment.builder()
                .equipmentId(20L).equipmentName("Centrifuge").equipmentCode("EQ-2")
                .status("AVAILABLE").build();
        Equipment recentlyUsed = Equipment.builder()
                .equipmentId(30L).equipmentName("Microscope").equipmentCode("EQ-3")
                .status("AVAILABLE").build();
        Equipment inMaintenance = Equipment.builder()
                .equipmentId(40L).equipmentName("Printer").equipmentCode("EQ-4")
                .status("UNDER_MAINTENANCE").build();

        when(equipmentRepository.findAll())
                .thenReturn(List.of(equipment, neverBooked, recentlyUsed, inMaintenance));
        when(utilizationBookingRepository.findLastBookingDates(anyList())).thenReturn(List.of(
                new Object[]{10L, LocalDate.now().minusDays(30)}, // stale
                new Object[]{30L, LocalDate.now().minusDays(2)}   // fresh
        ));

        List<IdleEquipmentResponse> idle = utilizationService.getIdleEquipment(14);

        List<Long> idleIds = idle.stream().map(IdleEquipmentResponse::getEquipmentId).toList();
        assertTrue(idleIds.contains(10L));  // last booked 30 days ago
        assertTrue(idleIds.contains(20L));  // never booked
        assertFalse(idleIds.contains(30L)); // booked 2 days ago
        assertFalse(idleIds.contains(40L)); // excluded status

        // Sorted by idle days descending — the 30-day-stale one comes first
        assertEquals(10L, idle.get(0).getEquipmentId());
        assertEquals(30L, idle.get(0).getIdleDays());
    }

    // -------------------- dimension: targets --------------------

    @Test
    void summary_measuresDepartmentAgainstItsOwnTarget() {
        dept.setUtilizationTargetPercent(10.0);
        when(equipmentRepository.findAll()).thenReturn(List.of(equipment));
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList()))
                .thenReturn(List.of(booking(LocalDate.now().minusDays(1),
                        LocalTime.of(9, 0), LocalTime.of(12, 0))));
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        UtilizationSummaryResponse summary = utilizationService.getSummary(1);

        var physics = summary.getDepartmentTargets().stream()
                .filter(t -> "Physics".equals(t.getName())).findFirst().orElseThrow();
        assertEquals("OWN", physics.getTargetSource());
        assertEquals(10.0, physics.getTargetPercent());
        // 180 booked minutes of a 720-minute day = 25%, comfortably over a 10% target
        assertEquals(25.0, physics.getActualPercent());
        assertEquals("ABOVE", physics.getStatus());
        assertEquals(15.0, physics.getVariancePercent());
    }

    @Test
    void summary_departmentInheritsInstitutionTargetWhenUnset() {
        dept.setUtilizationTargetPercent(null);
        institution.setUtilizationTargetPercent(80.0);
        when(equipmentRepository.findAll()).thenReturn(List.of(equipment));
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of());
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        UtilizationSummaryResponse summary = utilizationService.getSummary(30);

        var physics = summary.getDepartmentTargets().stream()
                .filter(t -> "Physics".equals(t.getName())).findFirst().orElseThrow();
        // An unset department target must inherit, never read as a target of zero
        assertEquals("INHERITED", physics.getTargetSource());
        assertEquals(80.0, physics.getTargetPercent());
        assertEquals("BELOW", physics.getStatus());
    }

    @Test
    void summary_fallsBackToPlatformDefaultTarget() {
        dept.setUtilizationTargetPercent(null);
        institution.setUtilizationTargetPercent(null);
        when(equipmentRepository.findAll()).thenReturn(List.of(equipment));
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of());
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        UtilizationSummaryResponse summary = utilizationService.getSummary(30);

        var physics = summary.getDepartmentTargets().stream()
                .filter(t -> "Physics".equals(t.getName())).findFirst().orElseThrow();
        assertEquals("DEFAULT", physics.getTargetSource());
        assertEquals(60.0, physics.getTargetPercent());
    }

    @Test
    void setDepartmentTarget_rejectsOutOfRangeValues() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));

        assertThrows(IllegalArgumentException.class,
                () -> utilizationService.setDepartmentTarget(1L, 150.0));
        assertThrows(IllegalArgumentException.class,
                () -> utilizationService.setDepartmentTarget(1L, -5.0));
    }

    @Test
    void setDepartmentTarget_nullClearsTheTarget() {
        dept.setUtilizationTargetPercent(45.0);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));

        Double applied = utilizationService.setDepartmentTarget(1L, null);

        assertNull(applied);
        assertNull(dept.getUtilizationTargetPercent());
    }

    // -------------------- dimension: historical benchmark --------------------

    @Test
    void summary_comparesAgainstThePreviousEqualWindow() {
        when(equipmentRepository.findAll()).thenReturn(List.of(equipment));
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        LocalDate today = LocalDate.now();
        // Current window busier than the one before it
        when(utilizationBookingRepository.findInWindow(
                eq(today.minusDays(1)), eq(today), anyList()))
                .thenReturn(List.of(booking(today.minusDays(1),
                        LocalTime.of(9, 0), LocalTime.of(15, 0)))); // 360 min
        when(utilizationBookingRepository.findInWindow(
                eq(today.minusDays(2)), eq(today.minusDays(2)), anyList()))
                .thenReturn(List.of(booking(today.minusDays(2),
                        LocalTime.of(9, 0), LocalTime.of(11, 0)))); // 120 min

        UtilizationSummaryResponse summary = utilizationService.getSummary(1);

        var benchmark = summary.getBenchmark();
        assertNotNull(benchmark);
        assertEquals(50.0, benchmark.getCurrentUtilizationRate());   // 360/720
        assertEquals(16.7, benchmark.getPreviousUtilizationRate());  // 120/720
        assertEquals("UP", benchmark.getTrend());
        assertTrue(benchmark.getChangePercentagePoints() > 0);
        assertEquals(360L, benchmark.getCurrentBookedMinutes());
        assertEquals(120L, benchmark.getPreviousBookedMinutes());
    }

    // -------------------- dimension: shared vs exclusive --------------------

    @Test
    void summary_splitsSharedFromExclusiveUsage() {
        Equipment shareable = Equipment.builder()
                .equipmentId(20L).equipmentName("Shared Microscope").equipmentCode("EQ-2")
                .status("AVAILABLE").department(dept).institution(institution)
                .isShareable(true).build();

        when(equipmentRepository.findAll()).thenReturn(List.of(equipment, shareable));
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of());
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        // An internal user booking the shareable asset — shared on paper, exclusive in practice
        Booking internal = Booking.builder()
                .bookingId(2L).user(user).equipment(shareable)
                .bookingDate(LocalDate.now().minusDays(1))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .status("CONFIRMED").build();
        when(utilizationBookingRepository.findInWindowWithParties(any(), any(), anyList()))
                .thenReturn(List.of(internal));

        UtilizationSummaryResponse summary = utilizationService.getSummary(30);

        var shared = summary.getSharedUsage();
        assertNotNull(shared);
        assertEquals(1L, shared.getShareableEquipmentCount());
        assertEquals(1L, shared.getExclusiveEquipmentCount());
        assertEquals(50.0, shared.getShareablePercent());
        assertEquals(120L, shared.getSharedBookedMinutes());
        // The booking came from inside the owning institution, so none of it is external
        assertEquals(0L, shared.getExternalBookedMinutes());
        assertEquals(0.0, shared.getExternalUtilizationPercent());
        // Listed as shareable but never booked from outside — this is the actionable finding
        assertEquals(1, shared.getUnrealisedSharing().size());
        assertEquals(20L, shared.getUnrealisedSharing().get(0).getEquipmentId());
    }

    @Test
    void summary_countsCrossInstitutionBookingsAsExternal() {
        Equipment shareable = Equipment.builder()
                .equipmentId(20L).equipmentName("Shared Microscope").equipmentCode("EQ-2")
                .status("AVAILABLE").department(dept).institution(institution)
                .isShareable(true).build();

        Institution otherInst = Institution.builder()
                .institutionId(2L).name("Partner College").code("PC").build();
        AppUser externalUser = AppUser.builder()
                .userId(9L).username("visitor").institution(otherInst).build();

        when(equipmentRepository.findAll()).thenReturn(List.of(shareable));
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of());
        when(equipmentUsageRepository.sumUsedMinutesPerEquipment(any())).thenReturn(List.of());

        Booking external = Booking.builder()
                .bookingId(3L).user(externalUser).equipment(shareable)
                .bookingDate(LocalDate.now().minusDays(1))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 0))
                .status("CONFIRMED").build();
        when(utilizationBookingRepository.findInWindowWithParties(any(), any(), anyList()))
                .thenReturn(List.of(external));

        UtilizationSummaryResponse summary = utilizationService.getSummary(30);

        var shared = summary.getSharedUsage();
        assertEquals(180L, shared.getSharedBookedMinutes());
        assertEquals(180L, shared.getExternalBookedMinutes());
        assertEquals(100.0, shared.getExternalUtilizationPercent());
        // Actually borrowed from outside, so it is not under-shared
        assertTrue(shared.getUnrealisedSharing().isEmpty());
    }
}
