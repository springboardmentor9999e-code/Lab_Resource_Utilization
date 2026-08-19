package com.rems.service;

import com.rems.dto.EquipmentRequest;
import com.rems.dto.EquipmentResponse;
import com.rems.entity.Department;
import com.rems.entity.Equipment;
import com.rems.entity.Institution;
import com.rems.entity.User;
import com.rems.enums.EquipmentStatus;
import com.rems.exception.ApiException;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.InstitutionRepository;
import com.rems.repository.LabRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.UtilizationMetricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LabRepository labRepository;

    @Mock
    private UtilizationMetricRepository utilizationMetricRepository;

    @Mock
    private InAppNotificationService inAppNotificationService;

    @InjectMocks
    private EquipmentService equipmentService;

    private User managerUser;
    private Department testDept;
    private Institution testInst;

    @BeforeEach
    void setUp() {
        testInst = Institution.builder().institutionId(1L).name("Tech Uni").build();
        testDept = Department.builder().departmentId(10L).name("Physics").institution(testInst).build();
        managerUser = User.builder()
                .userId(5L)
                .email("manager@tech.edu")
                .institution(testInst)
                .department(testDept)
                .build();
    }

    @Test
    void createEquipment_Success() {
        EquipmentRequest request = EquipmentRequest.builder()
                .name("Spectrometer 3000")
                .category("Optics")
                .amount(5)
                .cost(new BigDecimal("150.00"))
                .purchaseDate(LocalDate.of(2025, 1, 1))
                .build();

        when(userRepository.findByEmail("manager@tech.edu")).thenReturn(Optional.of(managerUser));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> {
            Equipment eq = invocation.getArgument(0);
            eq.setEquipmentId(99L);
            return eq;
        });

        EquipmentResponse response = equipmentService.createEquipment(request, "manager@tech.edu");

        assertNotNull(response);
        assertEquals(99L, response.getEquipmentId());
        assertEquals("Spectrometer 3000", response.getName());
        assertEquals(EquipmentStatus.AVAILABLE.getValue(), response.getStatus());
        verify(equipmentRepository).save(any(Equipment.class));
    }

    @Test
    void getEquipmentById_NotFound_ThrowsException() {
        when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> equipmentService.getEquipmentById(999L));
        assertTrue(ex.getMessage().contains("Equipment not found with id 999"));
    }
}
