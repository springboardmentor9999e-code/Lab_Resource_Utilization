package com.labresource.service;

import com.labresource.dto.response.SchedulingSuggestionResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UtilizationBookingRepository;
import com.labresource.service.impl.SchedulingOptimizerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the rule-based scheduling optimizer.
 *
 * The rules under test:
 *   R1 keep the user's requested time if any comparable asset is free then
 *   R2 otherwise shift the time on the same asset as little as possible
 *   R5 never propose an unbookable asset or an occupied slot
 *
 * Lenient because each test only stubs the overlap lookups it actually exercises; the optimizer
 * probes many candidate slots and stubbing every one would obscure what each test is asserting.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SchedulingOptimizerServiceTest {

    @Mock private EquipmentRepository equipmentRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private UtilizationBookingRepository utilizationBookingRepository;

    @InjectMocks private SchedulingOptimizerService optimizer;

    private Equipment requested;
    private Department physics;

    private final LocalDate date = LocalDate.now().plusDays(1);
    private final LocalTime start = LocalTime.of(10, 0);
    private final LocalTime end = LocalTime.of(12, 0);

    @BeforeEach
    void setUp() {
        physics = Department.builder().departmentId(1L).name("Physics").code("PHY").build();

        requested = Equipment.builder()
                .equipmentId(10L).equipmentName("Microscope A").equipmentCode("EQ-10")
                .category("Scientific Equipment").status("AVAILABLE").department(physics).build();

        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(requested));
        // No usage history by default — utilization is zero, peak profile flat
        when(utilizationBookingRepository.findInWindow(any(), any(), anyList())).thenReturn(List.of());
    }

    private Equipment alternative(Long id, String name, String status, Department dept) {
        return Equipment.builder()
                .equipmentId(id).equipmentName(name).equipmentCode("EQ-" + id)
                .category("Scientific Equipment").status(status).department(dept).build();
    }

    @Test
    void prefersComparableEquipmentAtTheRequestedTime() {
        Equipment free = alternative(11L, "Microscope B", "AVAILABLE", physics);
        when(equipmentRepository.findByCategoryIgnoreCase("Scientific Equipment"))
                .thenReturn(List.of(requested, free));
        // The alternative is free at the requested time; the original is booked solid
        when(bookingRepository.hasOverlappingBooking(eq(11L), any(), any(), any())).thenReturn(false);
        when(bookingRepository.hasOverlappingBooking(eq(10L), any(), any(), any())).thenReturn(true);

        List<SchedulingSuggestionResponse> out = optimizer.suggest(10L, date, start, end, 5);

        assertFalse(out.isEmpty());
        SchedulingSuggestionResponse top = out.get(0);
        assertEquals("ALTERNATIVE_EQUIPMENT", top.getType());
        assertEquals(11L, top.getEquipmentId());
        // Keeping the user's time means zero displacement — that is the whole point of R1
        assertEquals(0L, top.getMinutesFromRequested());
        assertEquals(start, top.getStartTime());
        assertFalse(top.getReasons().isEmpty(), "a suggestion must explain itself");
    }

    @Test
    void skipsEquipmentThatIsNotBookable() {
        Equipment broken = alternative(12L, "Microscope C", "UNDER_MAINTENANCE", physics);
        Equipment retired = alternative(13L, "Microscope D", "RETIRED", physics);
        when(equipmentRepository.findByCategoryIgnoreCase("Scientific Equipment"))
                .thenReturn(List.of(requested, broken, retired));
        when(bookingRepository.hasOverlappingBooking(anyLong(), any(), any(), any())).thenReturn(false);

        List<SchedulingSuggestionResponse> out = optimizer.suggest(10L, date, start, end, 10);

        // R5: an asset under maintenance or retired must never be proposed, however free it looks
        assertTrue(out.stream().noneMatch(s -> s.getEquipmentId().equals(12L)));
        assertTrue(out.stream().noneMatch(s -> s.getEquipmentId().equals(13L)));
    }

    @Test
    void fallsBackToShiftingTimeOnTheSameEquipment() {
        // Nothing comparable exists, so the only option is a different time on the same asset
        when(equipmentRepository.findByCategoryIgnoreCase("Scientific Equipment"))
                .thenReturn(List.of(requested));
        when(bookingRepository.hasOverlappingBooking(anyLong(), any(), any(), any())).thenReturn(false);

        List<SchedulingSuggestionResponse> out = optimizer.suggest(10L, date, start, end, 10);

        assertFalse(out.isEmpty());
        assertTrue(out.stream().allMatch(s -> s.getEquipmentId().equals(10L)));
        assertTrue(out.stream().anyMatch(s -> "SAME_EQUIPMENT_DIFFERENT_TIME".equals(s.getType())));
        // Never re-offer the exact slot the user could not have
        assertTrue(out.stream()
                .filter(s -> "SAME_EQUIPMENT_DIFFERENT_TIME".equals(s.getType()))
                .noneMatch(s -> s.getStartTime().equals(start)));
    }

    @Test
    void nearerTimesOutrankFurtherOnes() {
        when(equipmentRepository.findByCategoryIgnoreCase("Scientific Equipment"))
                .thenReturn(List.of(requested));
        when(bookingRepository.hasOverlappingBooking(anyLong(), any(), any(), any())).thenReturn(false);

        List<SchedulingSuggestionResponse> out = optimizer.suggest(10L, date, start, end, 10);

        List<SchedulingSuggestionResponse> sameDay = out.stream()
                .filter(s -> "SAME_EQUIPMENT_DIFFERENT_TIME".equals(s.getType()))
                .toList();
        assertFalse(sameDay.isEmpty());
        // Scores must fall as displacement grows, otherwise the ranking is meaningless
        for (int i = 1; i < sameDay.size(); i++) {
            assertTrue(sameDay.get(i - 1).getScore() >= sameDay.get(i).getScore(),
                    "suggestions should be ordered best-first");
        }
    }

    @Test
    void rejectsAnInvalidWindow() {
        assertThrows(IllegalArgumentException.class,
                () -> optimizer.suggest(10L, date, LocalTime.of(12, 0), LocalTime.of(10, 0), 5));
    }

    @Test
    void honoursTheRequestedLimit() {
        when(equipmentRepository.findByCategoryIgnoreCase("Scientific Equipment"))
                .thenReturn(List.of(requested));
        when(bookingRepository.hasOverlappingBooking(anyLong(), any(), any(), any())).thenReturn(false);

        List<SchedulingSuggestionResponse> out = optimizer.suggest(10L, date, start, end, 2);

        assertTrue(out.size() <= 2);
    }
}
