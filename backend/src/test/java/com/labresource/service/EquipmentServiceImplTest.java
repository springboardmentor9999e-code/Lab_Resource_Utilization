package com.labresource.service;

import com.labresource.dto.request.EquipmentRequest;
import com.labresource.dto.response.EquipmentResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.service.impl.EquipmentServiceImpl;
import com.labresource.service.impl.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for equipment cataloging rules: unique codes, status validation,
 * lab/department/institution resolution and file cleanup on delete.
 * Pure Mockito — no Spring context or database required.
 */
@ExtendWith(MockitoExtension.class)
class EquipmentServiceImplTest {

    @Mock private EquipmentRepository equipmentRepository;
    @Mock private EquipmentImageRepository equipmentImageRepository;
    @Mock private EquipmentDocumentRepository equipmentDocumentRepository;
    @Mock private LabRepository labRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private InstitutionRepository institutionRepository;
    @Mock private FileStorageService fileStorageService;

    @InjectMocks private EquipmentServiceImpl equipmentService;

    private Institution institution;
    private Department department;
    private Lab lab;

    @BeforeEach
    void setUp() {
        institution = Institution.builder().institutionId(1L).name("Test University").code("TU").build();
        department = Department.builder().departmentId(2L).name("Physics").code("PHY")
                .institution(institution).build();
        lab = Lab.builder().labId(3L).name("Optics Lab")
                .department(department).institution(institution).build();
    }

    private EquipmentRequest request(String code) {
        EquipmentRequest r = new EquipmentRequest();
        r.setEquipmentName("Spectrometer");
        r.setEquipmentCode(code);
        r.setCategory("Scientific Equipment");
        return r;
    }

    // -------------------- createEquipment --------------------

    @Test
    void createEquipment_rejectsDuplicateCode() {
        when(equipmentRepository.findByEquipmentCode("EQ-1"))
                .thenReturn(Optional.of(Equipment.builder().equipmentId(9L).build()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> equipmentService.createEquipment(request("EQ-1")));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void createEquipment_resolvesDeptAndInstitutionFromLab() {
        EquipmentRequest req = request("EQ-2");
        req.setLabId(3L);

        when(equipmentRepository.findByEquipmentCode("EQ-2")).thenReturn(Optional.empty());
        when(labRepository.findById(3L)).thenReturn(Optional.of(lab));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(inv -> {
            Equipment e = inv.getArgument(0);
            e.setEquipmentId(100L);
            return e;
        });

        EquipmentResponse resp = equipmentService.createEquipment(req);

        assertEquals("Optics Lab", resp.getLabName());
        assertEquals("Physics", resp.getDepartmentName());
        assertEquals("Test University", resp.getInstitutionName());
        assertEquals("AVAILABLE", resp.getStatus()); // default when not provided
    }

    @Test
    void createEquipment_defaultsToFirstDepartment_whenNoLabGiven() {
        when(equipmentRepository.findByEquipmentCode("EQ-3")).thenReturn(Optional.empty());
        when(departmentRepository.findAll()).thenReturn(List.of(department));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(inv -> inv.getArgument(0));

        EquipmentResponse resp = equipmentService.createEquipment(request("EQ-3"));

        assertEquals("Physics", resp.getDepartmentName());
        assertEquals("Unallocated", resp.getLabName());
    }

    @Test
    void createEquipment_rejectsInvalidStatus() {
        EquipmentRequest req = request("EQ-4");
        req.setStatus("BROKEN"); // not in the allowed set
        when(equipmentRepository.findByEquipmentCode("EQ-4")).thenReturn(Optional.empty());
        when(departmentRepository.findAll()).thenReturn(List.of(department));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> equipmentService.createEquipment(req));
        assertTrue(ex.getMessage().contains("Invalid status"));
    }

    // -------------------- updateEquipment --------------------

    @Test
    void updateEquipment_rejectsCodeCollisionWithOtherEquipment() {
        Equipment existing = Equipment.builder()
                .equipmentId(100L).equipmentCode("EQ-5").equipmentName("Old")
                .status("AVAILABLE").department(department).institution(institution).build();
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(equipmentRepository.findByEquipmentCode("EQ-6"))
                .thenReturn(Optional.of(Equipment.builder().equipmentId(200L).build()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> equipmentService.updateEquipment(100L, request("EQ-6")));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    // -------------------- changeStatus --------------------

    @Test
    void changeStatus_acceptsValidStatus_caseInsensitive() {
        Equipment eq = Equipment.builder()
                .equipmentId(100L).equipmentCode("EQ-7").equipmentName("Laser")
                .status("AVAILABLE").build();
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(eq));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(inv -> inv.getArgument(0));

        EquipmentResponse resp = equipmentService.changeStatus(100L, "under_maintenance");

        assertEquals("UNDER_MAINTENANCE", resp.getStatus());
    }

    @Test
    void changeStatus_rejectsUnknownStatus() {
        Equipment eq = Equipment.builder()
                .equipmentId(100L).equipmentCode("EQ-8").status("AVAILABLE").build();
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(eq));

        assertThrows(RuntimeException.class, () -> equipmentService.changeStatus(100L, "EXPLODED"));
        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void changeStatus_throwsWhenEquipmentMissing() {
        when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> equipmentService.changeStatus(999L, "AVAILABLE"));
    }

    // -------------------- deleteEquipment --------------------

    @Test
    void deleteEquipment_removesStoredFilesFromDisk() {
        Equipment eq = Equipment.builder()
                .equipmentId(100L).equipmentCode("EQ-9").status("AVAILABLE").build();
        eq.getImages().add(EquipmentImage.builder()
                .imageId(1L).equipment(eq).imageUrl("/uploads/img1.png").build());
        eq.getDocuments().add(EquipmentDocument.builder()
                .documentId(2L).equipment(eq).fileUrl("/uploads/manual.pdf").build());
        when(equipmentRepository.findById(100L)).thenReturn(Optional.of(eq));

        equipmentService.deleteEquipment(100L);

        verify(fileStorageService).delete("/uploads/img1.png");
        verify(fileStorageService).delete("/uploads/manual.pdf");
        verify(equipmentRepository).delete(eq);
    }
}
