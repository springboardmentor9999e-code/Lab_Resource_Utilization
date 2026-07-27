package com.labresource.service;

import com.labresource.dto.request.MaintenanceRequestCreate;
import com.labresource.dto.response.MaintenanceRequestResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.service.impl.ChargebackService;
import com.labresource.service.impl.MaintenanceServiceImpl;
import com.labresource.service.impl.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the maintenance work-order state machine and equipment sync.
 */
@ExtendWith(MockitoExtension.class)
class MaintenanceServiceImplTest {

    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private MaintenanceScheduleRepository maintenanceScheduleRepository;
    @Mock private EquipmentCalibrationRepository calibrationRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private NotificationService notificationService;
    // Completing a work order posts a chargeback line. Billing has its own tests; here it
    // only needs to exist so the completion path does not NPE.
    @Mock private ChargebackService chargebackService;

    @InjectMocks private MaintenanceServiceImpl maintenanceService;

    private AppUser reporter;
    private AppUser technician;
    private Equipment equipment;

    @BeforeEach
    void setUp() {
        reporter = AppUser.builder().userId(1L).username("reporter").firstName("Ray").lastName("Reporter").build();
        technician = AppUser.builder().userId(2L).username("tech").firstName("Tia").lastName("Tech").build();
        equipment = Equipment.builder().equipmentId(10L).equipmentName("Centrifuge").equipmentCode("EQ-C1")
                .status("AVAILABLE").build();
    }

    private void authenticateAs(String username, String... roles) {
        var authorities = java.util.Arrays.stream(roles).map(SimpleGrantedAuthority::new).toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, "x", authorities));
    }

    private MaintenanceRequest workOrder(String status) {
        return MaintenanceRequest.builder()
                .requestId(200L).equipment(equipment).requestedBy(reporter)
                .type("CORRECTIVE").priority("HIGH").title("Rotor imbalance").status(status)
                .build();
    }

    @Test
    void createRequest_savesOpenWorkOrder_andAlertsManagers() {
        authenticateAs("reporter", "ROLE_STUDENT");
        when(appUserRepository.findByUsername("reporter")).thenReturn(Optional.of(reporter));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(appUserRepository.findActiveByRoles(anyList())).thenReturn(List.of(technician));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(inv -> {
            MaintenanceRequest m = inv.getArgument(0);
            m.setRequestId(200L);
            return m;
        });

        MaintenanceRequestCreate req = new MaintenanceRequestCreate();
        req.setEquipmentId(10L);
        req.setType("CORRECTIVE");
        req.setPriority("HIGH");
        req.setTitle("Rotor imbalance");

        MaintenanceRequestResponse resp = maintenanceService.createRequest(req, "reporter");

        assertEquals("OPEN", resp.getStatus());
        assertEquals("HIGH", resp.getPriority());
        verify(notificationService, atLeastOnce())
                .notifyInApp(any(AppUser.class), eq("MAINTENANCE"), anyString(), anyString(), anyString());
    }

    @Test
    void startWork_setsEquipmentUnderMaintenance() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        when(maintenanceRequestRepository.findById(200L)).thenReturn(Optional.of(workOrder("ASSIGNED")));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        maintenanceService.updateStatus(200L, "IN_PROGRESS", null, null, "mgr");

        assertEquals("UNDER_MAINTENANCE", equipment.getStatus());
    }

    @Test
    void completeWork_computesDowntime_andReleasesEquipment() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        MaintenanceRequest inProgress = workOrder("IN_PROGRESS");
        inProgress.setStartedAt(java.time.LocalDateTime.now().minusHours(2));
        equipment.setStatus("UNDER_MAINTENANCE");
        when(maintenanceRequestRepository.findById(200L)).thenReturn(Optional.of(inProgress));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceRequestResponse resp = maintenanceService.updateStatus(
                200L, "COMPLETED", "Replaced rotor", new java.math.BigDecimal("1500"), "mgr");

        assertEquals("COMPLETED", resp.getStatus());
        assertEquals("AVAILABLE", equipment.getStatus());
        assertNotNull(resp.getDowntimeMinutes());
        assertTrue(resp.getDowntimeMinutes() >= 115 && resp.getDowntimeMinutes() <= 125); // ~120 min
    }

    @Test
    void updateStatus_rejectsIllegalTransition_openToCompleted() {
        authenticateAs("mgr", "ROLE_LAB_MANAGER");
        when(maintenanceRequestRepository.findById(200L)).thenReturn(Optional.of(workOrder("OPEN")));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                maintenanceService.updateStatus(200L, "COMPLETED", null, null, "mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("illegal"));
    }

    @Test
    void createRequest_rejectsInvalidType() {
        authenticateAs("reporter", "ROLE_STUDENT");
        when(appUserRepository.findByUsername("reporter")).thenReturn(Optional.of(reporter));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        MaintenanceRequestCreate req = new MaintenanceRequestCreate();
        req.setEquipmentId(10L);
        req.setType("BOGUS");
        req.setTitle("x");

        assertThrows(RuntimeException.class, () -> maintenanceService.createRequest(req, "reporter"));
    }
}
