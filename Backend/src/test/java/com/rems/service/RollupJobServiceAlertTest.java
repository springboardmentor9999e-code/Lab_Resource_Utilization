package com.rems.service;

import com.rems.entity.Equipment;
import com.rems.entity.IdleAlert;
import com.rems.entity.UtilizationMetric;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.IdleAlertRepository;
import com.rems.repository.UtilizationMetricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RollupJobServiceAlertTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private UtilizationMetricRepository utilizationMetricRepository;

    @Mock
    private IdleAlertRepository idleAlertRepository;

    @InjectMocks
    private RollupJobService rollupJobService;

    private Equipment testEquipment;
    private LocalDate targetDate;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(rollupJobService, "thresholdIdleUtilization", 0.15);

        targetDate = LocalDate.of(2026, 8, 1);
        testEquipment = Equipment.builder()
                .equipmentId(1L)
                .name("Spectrometer X")
                .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
                .build();
    }

    @Test
    void testRunIdleDetection_CreatesAlertWhenUtilizationBelowThreshold() {
        when(equipmentRepository.findAll()).thenReturn(List.of(testEquipment));

        List<UtilizationMetric> metrics = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            metrics.add(UtilizationMetric.builder()
                    .equipment(testEquipment)
                    .date(targetDate.minusDays(13 - i))
                    .utilizationRate(0.05) // 5% < 15% threshold
                    .build());
        }
        when(utilizationMetricRepository.findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(
                eq(1L), any(LocalDate.class), eq(targetDate)))
                .thenReturn(metrics);

        when(idleAlertRepository.findByEquipmentEquipmentIdAndResolvedFalse(1L))
                .thenReturn(Optional.empty());

        rollupJobService.runIdleDetection(targetDate);

        ArgumentCaptor<IdleAlert> captor = ArgumentCaptor.forClass(IdleAlert.class);
        verify(idleAlertRepository, times(1)).save(captor.capture());

        IdleAlert savedAlert = captor.getValue();
        assertNotNull(savedAlert);
        assertEquals(testEquipment, savedAlert.getEquipment());
        assertFalse(savedAlert.getResolved());
        assertEquals(14, savedAlert.getIdleDurationDays());
    }

    @Test
    void testRunIdleDetection_ResolvesExistingAlertWhenUtilizationRecovers() {
        when(equipmentRepository.findAll()).thenReturn(List.of(testEquipment));

        List<UtilizationMetric> metrics = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            metrics.add(UtilizationMetric.builder()
                    .equipment(testEquipment)
                    .date(targetDate.minusDays(13 - i))
                    .utilizationRate(0.50) // 50% > 15% threshold
                    .build());
        }
        when(utilizationMetricRepository.findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(
                eq(1L), any(LocalDate.class), eq(targetDate)))
                .thenReturn(metrics);

        IdleAlert existingAlert = IdleAlert.builder()
                .id(10L)
                .equipment(testEquipment)
                .detectedAt(Instant.now().minus(7, ChronoUnit.DAYS))
                .idleDurationDays(14)
                .resolved(false)
                .build();

        when(idleAlertRepository.findByEquipmentEquipmentIdAndResolvedFalse(1L))
                .thenReturn(Optional.of(existingAlert));

        rollupJobService.runIdleDetection(targetDate);

        ArgumentCaptor<IdleAlert> captor = ArgumentCaptor.forClass(IdleAlert.class);
        verify(idleAlertRepository, times(1)).save(captor.capture());

        IdleAlert resolvedAlert = captor.getValue();
        assertNotNull(resolvedAlert);
        assertTrue(resolvedAlert.getResolved());
        assertNotNull(resolvedAlert.getResolvedAt());
    }

    @Test
    void testRunIdleDetection_SkipsWhenHistoryDaysLessThanSeven() {
        when(equipmentRepository.findAll()).thenReturn(List.of(testEquipment));

        List<UtilizationMetric> metrics = new ArrayList<>();
        for (int i = 0; i < 5; i++) { // Only 5 valid days
            metrics.add(UtilizationMetric.builder()
                    .equipment(testEquipment)
                    .date(targetDate.minusDays(4 - i))
                    .utilizationRate(0.02)
                    .build());
        }
        when(utilizationMetricRepository.findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(
                eq(1L), any(LocalDate.class), eq(targetDate)))
                .thenReturn(metrics);

        rollupJobService.runIdleDetection(targetDate);

        verify(idleAlertRepository, never()).save(any(IdleAlert.class));
    }
}
