package com.labresource.platform.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.CreateEquipmentRequest;
import com.labresource.platform.dto.EquipmentResponse;
import com.labresource.platform.dto.UpdateEquipmentRequest;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.exception.DuplicateEquipmentException;
import com.labresource.platform.exception.LabNotFoundException;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.LabRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceImplTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private LabRepository labRepository;

    @Captor
    private ArgumentCaptor<Equipment> equipmentCaptor;

    @InjectMocks
    private EquipmentServiceImpl equipmentService;

    @Test
    void createEquipmentNormalizesFieldsAndReturnsResponse() {
        Lab lab = lab();
        CreateEquipmentRequest request = new CreateEquipmentRequest(
                "  Centrifuge  ",
                "  Sample Prep  ",
                "  Eppendorf  ",
                "  SN-001  ",
                4,
                3,
                EquipmentStatus.AVAILABLE,
                LocalDate.of(2024, 2, 10),
                lab.getId()
        );

        when(equipmentRepository.existsBySerialNumber("SN-001")).thenReturn(false);
        when(labRepository.findById(lab.getId())).thenReturn(Optional.of(lab));
        when(equipmentRepository.saveAndFlush(any(Equipment.class))).thenAnswer(invocation -> {
            Equipment equipment = invocation.getArgument(0);
            equipment.setId(10L);
            return equipment;
        });

        EquipmentResponse response = equipmentService.createEquipment(request);

        verify(equipmentRepository).saveAndFlush(equipmentCaptor.capture());
        Equipment savedEquipment = equipmentCaptor.getValue();

        assertThat(savedEquipment.getName()).isEqualTo("Centrifuge");
        assertThat(savedEquipment.getCategory()).isEqualTo("Sample Prep");
        assertThat(savedEquipment.getManufacturer()).isEqualTo("Eppendorf");
        assertThat(savedEquipment.getSerialNumber()).isEqualTo("SN-001");
        assertThat(savedEquipment.getLab()).isEqualTo(lab);
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.labId()).isEqualTo(lab.getId());
        assertThat(response.labName()).isEqualTo(lab.getName());
    }

    @Test
    void createEquipmentRejectsAvailableQuantityAboveQuantity() {
        CreateEquipmentRequest request = new CreateEquipmentRequest(
                "Centrifuge",
                "Sample Prep",
                "Eppendorf",
                "SN-001",
                2,
                3,
                EquipmentStatus.AVAILABLE,
                LocalDate.of(2024, 2, 10),
                1L
        );

        assertThatThrownBy(() -> equipmentService.createEquipment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Available quantity must not be greater than quantity");

        verify(equipmentRepository, never()).saveAndFlush(any(Equipment.class));
    }

    @Test
    void createEquipmentRejectsDuplicateSerialNumber() {
        CreateEquipmentRequest request = new CreateEquipmentRequest(
                "Centrifuge",
                "Sample Prep",
                "Eppendorf",
                "SN-001",
                2,
                1,
                EquipmentStatus.AVAILABLE,
                LocalDate.of(2024, 2, 10),
                1L
        );

        when(equipmentRepository.existsBySerialNumber("SN-001")).thenReturn(true);

        assertThatThrownBy(() -> equipmentService.createEquipment(request))
                .isInstanceOf(DuplicateEquipmentException.class)
                .hasMessage("Equipment with this serial number already exists");

        verify(labRepository, never()).findById(any());
        verify(equipmentRepository, never()).saveAndFlush(any(Equipment.class));
    }

    @Test
    void getEquipmentByLabRequiresExistingLab() {
        when(labRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> equipmentService.getEquipmentByLab(99L))
                .isInstanceOf(LabNotFoundException.class)
                .hasMessage("Lab with id 99 was not found");

        verify(equipmentRepository, never()).findByLabId(99L);
    }

    @Test
    void updateEquipmentRejectsDuplicateSerialNumber() {
        Lab lab = lab();
        Equipment equipment = equipment(lab);
        UpdateEquipmentRequest request = new UpdateEquipmentRequest(
                "Updated Centrifuge",
                "Sample Prep",
                "Eppendorf",
                "SN-002",
                4,
                2,
                EquipmentStatus.IN_USE,
                LocalDate.of(2024, 3, 12),
                lab.getId()
        );

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        when(equipmentRepository.existsBySerialNumber("SN-002")).thenReturn(true);

        assertThatThrownBy(() -> equipmentService.updateEquipment(equipment.getId(), request))
                .isInstanceOf(DuplicateEquipmentException.class)
                .hasMessage("Equipment with this serial number already exists");

        verify(labRepository, never()).findById(any());
        verify(equipmentRepository, never()).saveAndFlush(any(Equipment.class));
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

    private Equipment equipment(Lab lab) {
        return Equipment.builder()
                .id(5L)
                .name("Centrifuge")
                .category("Sample Prep")
                .manufacturer("Eppendorf")
                .serialNumber("SN-001")
                .quantity(4)
                .availableQuantity(3)
                .status(EquipmentStatus.AVAILABLE)
                .purchaseDate(LocalDate.of(2024, 2, 10))
                .lab(lab)
                .build();
    }
}
