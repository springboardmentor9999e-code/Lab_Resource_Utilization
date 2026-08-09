package com.labresource.platform.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.CreateMaintenanceRequest;
import com.labresource.platform.dto.MaintenanceResponse;
import com.labresource.platform.dto.UpdateMaintenanceRequest;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.entity.Maintenance;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.EquipmentNotFoundException;
import com.labresource.platform.exception.MaintenanceConflictException;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.MaintenanceRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceImplTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Captor
    private ArgumentCaptor<Maintenance> maintenanceCaptor;

    @InjectMocks
    private MaintenanceServiceImpl maintenanceService;

    @Test
    void createMaintenanceUsesAuthenticatedAdminAndReturnsScheduledResponse() {
        User admin = user(1L, Role.ROLE_SYSTEM_ADMIN);
        Equipment equipment = equipment(2L, EquipmentStatus.AVAILABLE);
        CreateMaintenanceRequest request = createRequest(equipment.getId());

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        when(maintenanceRepository.findOverlappingActiveMaintenance(
                equipment.getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        )).thenReturn(List.of());
        when(maintenanceRepository.saveAndFlush(any(Maintenance.class))).thenAnswer(invocation -> {
            Maintenance maintenance = invocation.getArgument(0);
            maintenance.setId(20L);
            return maintenance;
        });

        MaintenanceResponse response = maintenanceService.createMaintenance(request, authentication(admin));

        verify(maintenanceRepository).saveAndFlush(maintenanceCaptor.capture());
        Maintenance savedMaintenance = maintenanceCaptor.getValue();

        assertThat(savedMaintenance.getCreatedBy()).isEqualTo(admin);
        assertThat(savedMaintenance.getEquipment()).isEqualTo(equipment);
        assertThat(savedMaintenance.getTitle()).isEqualTo("Preventive calibration");
        assertThat(savedMaintenance.getStatus()).isEqualTo(MaintenanceStatus.SCHEDULED);
        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.createdByUserId()).isEqualTo(admin.getId());
        assertThat(response.equipmentId()).isEqualTo(equipment.getId());
        assertThat(response.status()).isEqualTo(MaintenanceStatus.SCHEDULED);
    }

    @Test
    void createMaintenanceRejectsMissingEquipment() {
        CreateMaintenanceRequest request = createRequest(44L);

        when(equipmentRepository.findById(44L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> maintenanceService.createMaintenance(request, authentication(user(1L, Role.ROLE_SYSTEM_ADMIN))))
                .isInstanceOf(EquipmentNotFoundException.class)
                .hasMessage("Equipment with id 44 was not found");

        verify(maintenanceRepository, never()).saveAndFlush(any(Maintenance.class));
    }

    @Test
    void createMaintenanceRejectsInvalidScheduledTimeRange() {
        Equipment equipment = equipment(2L, EquipmentStatus.AVAILABLE);
        LocalDateTime scheduledStartTime = LocalDateTime.now().plusDays(1);
        CreateMaintenanceRequest request = new CreateMaintenanceRequest(
                equipment.getId(),
                "Preventive calibration",
                "Quarterly service",
                scheduledStartTime,
                scheduledStartTime,
                "Ravi Kumar",
                "Check rotor and sensors"
        );

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));

        assertThatThrownBy(() -> maintenanceService.createMaintenance(request, authentication(user(1L, Role.ROLE_SYSTEM_ADMIN))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Scheduled start time must be before scheduled end time");

        verify(maintenanceRepository, never()).saveAndFlush(any(Maintenance.class));
    }

    @Test
    void createMaintenanceRejectsOverlappingActiveMaintenance() {
        User admin = user(1L, Role.ROLE_SYSTEM_ADMIN);
        Equipment equipment = equipment(2L, EquipmentStatus.AVAILABLE);
        CreateMaintenanceRequest request = createRequest(equipment.getId());
        Maintenance overlappingMaintenance = maintenance(30L, equipment, admin, MaintenanceStatus.SCHEDULED);

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        when(maintenanceRepository.findOverlappingActiveMaintenance(
                equipment.getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        )).thenReturn(List.of(overlappingMaintenance));

        assertThatThrownBy(() -> maintenanceService.createMaintenance(request, authentication(admin)))
                .isInstanceOf(MaintenanceConflictException.class)
                .hasMessage("Active maintenance already exists for this equipment in the requested time range");

        verify(maintenanceRepository, never()).saveAndFlush(any(Maintenance.class));
    }

    @Test
    void createMaintenanceAllowsNonOverlappingMaintenance() {
        User admin = user(1L, Role.ROLE_SYSTEM_ADMIN);
        Equipment equipment = equipment(2L, EquipmentStatus.AVAILABLE);
        CreateMaintenanceRequest request = createRequest(equipment.getId());

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        when(maintenanceRepository.findOverlappingActiveMaintenance(
                equipment.getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        )).thenReturn(List.of());
        when(maintenanceRepository.saveAndFlush(any(Maintenance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceResponse response = maintenanceService.createMaintenance(request, authentication(admin));

        assertThat(response.status()).isEqualTo(MaintenanceStatus.SCHEDULED);
    }

    @Test
    void startMaintenanceTransitionsToInProgressAndSetsEquipmentMaintenance() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.AVAILABLE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.SCHEDULED
        );

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        MaintenanceResponse response = maintenanceService.startMaintenance(maintenance.getId());

        assertThat(response.status()).isEqualTo(MaintenanceStatus.IN_PROGRESS);
        assertThat(maintenance.getActualStartTime()).isNotNull();
        assertThat(maintenance.getEquipment().getStatus()).isEqualTo(EquipmentStatus.MAINTENANCE);
        verify(equipmentRepository).saveAndFlush(maintenance.getEquipment());
    }

    @Test
    void completeMaintenanceTransitionsToCompletedAndRestoresEquipmentAvailable() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.MAINTENANCE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.IN_PROGRESS
        );

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        MaintenanceResponse response = maintenanceService.completeMaintenance(maintenance.getId());

        assertThat(response.status()).isEqualTo(MaintenanceStatus.COMPLETED);
        assertThat(maintenance.getActualEndTime()).isNotNull();
        assertThat(maintenance.getEquipment().getStatus()).isEqualTo(EquipmentStatus.AVAILABLE);
        verify(equipmentRepository).saveAndFlush(maintenance.getEquipment());
    }

    @Test
    void startMaintenanceRejectsInvalidStatusTransition() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.AVAILABLE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.COMPLETED
        );

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));

        assertThatThrownBy(() -> maintenanceService.startMaintenance(maintenance.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only scheduled maintenance can be started");

        verify(equipmentRepository, never()).saveAndFlush(any(Equipment.class));
        verify(maintenanceRepository, never()).saveAndFlush(any(Maintenance.class));
    }

    @Test
    void cancelMaintenanceCancelsScheduledMaintenance() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.AVAILABLE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.SCHEDULED
        );

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        MaintenanceResponse response = maintenanceService.cancelMaintenance(maintenance.getId());

        assertThat(response.status()).isEqualTo(MaintenanceStatus.CANCELLED);
        assertThat(maintenance.getEquipment().getStatus()).isEqualTo(EquipmentStatus.AVAILABLE);
        verify(equipmentRepository, never()).saveAndFlush(any(Equipment.class));
    }

    @Test
    void cancelInProgressMaintenanceRestoresEquipmentStatus() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.MAINTENANCE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.IN_PROGRESS
        );

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        MaintenanceResponse response = maintenanceService.cancelMaintenance(maintenance.getId());

        assertThat(response.status()).isEqualTo(MaintenanceStatus.CANCELLED);
        assertThat(maintenance.getEquipment().getStatus()).isEqualTo(EquipmentStatus.AVAILABLE);
        verify(equipmentRepository).saveAndFlush(maintenance.getEquipment());
    }

    @Test
    void updateMaintenanceUpdatesScheduledRecord() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.AVAILABLE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.SCHEDULED
        );
        Equipment newEquipment = equipment(3L, EquipmentStatus.AVAILABLE);
        UpdateMaintenanceRequest request = updateRequest(newEquipment.getId());

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(equipmentRepository.findById(newEquipment.getId())).thenReturn(Optional.of(newEquipment));
        when(maintenanceRepository.findOverlappingActiveMaintenanceExcludingId(
                maintenance.getId(),
                newEquipment.getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        )).thenReturn(List.of());
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        MaintenanceResponse response = maintenanceService.updateMaintenance(maintenance.getId(), request);

        assertThat(response.equipmentId()).isEqualTo(newEquipment.getId());
        assertThat(response.title()).isEqualTo("Emergency service");
        assertThat(response.technicianName()).isEqualTo("Priya Sharma");
    }

    @Test
    void updateMaintenanceRejectsNonScheduledRecord() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.MAINTENANCE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.IN_PROGRESS
        );
        UpdateMaintenanceRequest request = updateRequest(maintenance.getEquipment().getId());

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));

        assertThatThrownBy(() -> maintenanceService.updateMaintenance(maintenance.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only scheduled maintenance records can be edited");

        verify(equipmentRepository, never()).findById(any());
        verify(maintenanceRepository, never()).saveAndFlush(any(Maintenance.class));
    }

    @Test
    void updateMaintenanceExcludesCurrentMaintenanceFromOverlapCheck() {
        Maintenance maintenance = maintenance(
                10L,
                equipment(2L, EquipmentStatus.AVAILABLE),
                user(1L, Role.ROLE_SYSTEM_ADMIN),
                MaintenanceStatus.SCHEDULED
        );
        UpdateMaintenanceRequest request = updateRequest(maintenance.getEquipment().getId());

        when(maintenanceRepository.findById(maintenance.getId())).thenReturn(Optional.of(maintenance));
        when(equipmentRepository.findById(maintenance.getEquipment().getId())).thenReturn(Optional.of(maintenance.getEquipment()));
        when(maintenanceRepository.findOverlappingActiveMaintenanceExcludingId(
                maintenance.getId(),
                maintenance.getEquipment().getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        )).thenReturn(List.of());
        when(maintenanceRepository.saveAndFlush(maintenance)).thenReturn(maintenance);

        maintenanceService.updateMaintenance(maintenance.getId(), request);

        verify(maintenanceRepository).findOverlappingActiveMaintenanceExcludingId(
                maintenance.getId(),
                maintenance.getEquipment().getId(),
                List.of(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS),
                request.scheduledStartTime(),
                request.scheduledEndTime()
        );
    }

    private CreateMaintenanceRequest createRequest(Long equipmentId) {
        LocalDateTime scheduledStartTime = LocalDateTime.now().plusDays(1);

        return new CreateMaintenanceRequest(
                equipmentId,
                "  Preventive calibration  ",
                "Quarterly service",
                scheduledStartTime,
                scheduledStartTime.plusHours(2),
                "Ravi Kumar",
                "Check rotor and sensors"
        );
    }

    private UpdateMaintenanceRequest updateRequest(Long equipmentId) {
        LocalDateTime scheduledStartTime = LocalDateTime.now().plusDays(2);

        return new UpdateMaintenanceRequest(
                equipmentId,
                "Emergency service",
                "Inspect reported vibration",
                scheduledStartTime,
                scheduledStartTime.plusHours(3),
                "Priya Sharma",
                "Bring vibration meter"
        );
    }

    private Authentication authentication(User user) {
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    private User user(Long id, Role role) {
        return User.builder()
                .id(id)
                .firstName("Test")
                .lastName("Admin")
                .email("user" + id + "@example.com")
                .password("encoded-password")
                .role(role)
                .enabled(true)
                .build();
    }

    private Equipment equipment(Long id, EquipmentStatus status) {
        return Equipment.builder()
                .id(id)
                .name("Centrifuge")
                .category("Sample Prep")
                .manufacturer("Eppendorf")
                .serialNumber("SN-" + id)
                .quantity(4)
                .availableQuantity(4)
                .status(status)
                .purchaseDate(LocalDate.of(2024, 2, 10))
                .lab(lab())
                .build();
    }

    private Lab lab() {
        return Lab.builder()
                .id(1L)
                .name("Bio Lab")
                .building("Science Block")
                .roomNumber("204")
                .capacity(30)
                .active(true)
                .build();
    }

    private Maintenance maintenance(Long id, Equipment equipment, User createdBy, MaintenanceStatus status) {
        LocalDateTime scheduledStartTime = LocalDateTime.now().plusDays(1);

        return Maintenance.builder()
                .id(id)
                .equipment(equipment)
                .title("Preventive calibration")
                .description("Quarterly service")
                .status(status)
                .scheduledStartTime(scheduledStartTime)
                .scheduledEndTime(scheduledStartTime.plusHours(2))
                .technicianName("Ravi Kumar")
                .notes("Check rotor and sensors")
                .createdBy(createdBy)
                .build();
    }
}
