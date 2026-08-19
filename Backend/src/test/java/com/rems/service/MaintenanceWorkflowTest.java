package com.rems.service;

import com.rems.dto.MaintenanceDTO;
import com.rems.entity.DowntimeRecord;
import com.rems.entity.Equipment;
import com.rems.enums.EquipmentStatus;
import com.rems.repository.DowntimeRecordRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.UtilizationMetricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceWorkflowTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private DowntimeRecordRepository downtimeRecordRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UtilizationMetricRepository utilizationMetricRepository;

    @Mock
    private InAppNotificationService inAppNotificationService;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        testEquipment = Equipment.builder()
                .equipmentId(10L)
                .name("Electron Microscope")
                .status(EquipmentStatus.AVAILABLE)
                .amount(1)
                .build();
    }

    @Test
    void putInMaintenance_Success_UpdatesStatusToMaintenance() {
        MaintenanceDTO.Request request = MaintenanceDTO.Request.builder()
                .equipmentId(10L)
                .reason("Lens Calibration Required")
                .isAll(true)
                .build();

        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.empty());
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(testEquipment));
        when(downtimeRecordRepository.save(any(DowntimeRecord.class))).thenAnswer(invocation -> {
            DowntimeRecord record = invocation.getArgument(0);
            record.setRecordId(101L);
            return record;
        });

        MaintenanceDTO.Response response = maintenanceService.putInMaintenance(request, "tech@test.com");

        assertNotNull(response);
        assertEquals(101L, response.getRecordId());
        assertEquals(EquipmentStatus.MAINTENANCE, testEquipment.getStatus());
        verify(equipmentRepository).save(testEquipment);
        verify(downtimeRecordRepository).save(any(DowntimeRecord.class));
    }

    @Test
    void makeAvailable_Success_RestoresEquipmentStatusToAvailable() {
        DowntimeRecord record = DowntimeRecord.builder()
                .recordId(101L)
                .equipment(testEquipment)
                .startTime(Instant.now().minusSeconds(3600))
                .status("Under Maintenance")
                .build();

        testEquipment.setStatus(EquipmentStatus.MAINTENANCE);

        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.empty());
        when(downtimeRecordRepository.findById(101L)).thenReturn(Optional.of(record));
        when(downtimeRecordRepository.save(any(DowntimeRecord.class))).thenAnswer(i -> i.getArgument(0));
        when(downtimeRecordRepository.findByEquipmentEquipmentIdAndEndTimeIsNull(10L))
                .thenReturn(Collections.emptyList());

        MaintenanceDTO.Response response = maintenanceService.makeAvailable(101L, "tech@test.com");

        assertNotNull(response);
        assertEquals("Completed", record.getStatus());
        assertNotNull(record.getEndTime());
        assertEquals(EquipmentStatus.AVAILABLE, testEquipment.getStatus());
        verify(equipmentRepository).save(testEquipment);
    }
}
