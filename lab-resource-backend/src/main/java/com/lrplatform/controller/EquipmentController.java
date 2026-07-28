package com.lrplatform.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.AvailabilitySlotResponse;
import com.lrplatform.dto.response.EquipmentResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.dto.response.UtilizationIntelligenceResponse.EquipmentUtilization;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.EquipmentTag;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.EquipmentAvailabilityService;
import com.lrplatform.service.EquipmentService;
import com.lrplatform.service.UtilizationIntelligenceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final EquipmentAvailabilityService equipmentAvailabilityService;
    private final CurrentUserUtil currentUserUtil;
    private final UtilizationIntelligenceService utilizationIntelligenceService;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<PaginatedResponse<EquipmentResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long institutionId,
            HttpServletRequest httpRequest) {
        Pageable pageable = PageRequest.of(page, size);

        Long resolvedDeptId = departmentId;
        Long resolvedInstId = institutionId;

        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        String role = currentUser.getRole().name();
        if (role.equals("DEPARTMENT_HEAD") && currentUser.getDepartment() != null) {
            resolvedDeptId = currentUser.getDepartment().getId();
        } else if (role.equals("INSTITUTION_ADMIN") && currentUser.getInstitution() != null) {
            resolvedInstId = currentUser.getInstitution().getId();
        }

        List<Equipment> all;
        if (resolvedDeptId != null) {
            all = equipmentService.getEquipmentByDepartmentId(resolvedDeptId);
        } else if (resolvedInstId != null) {
            all = equipmentService.getEquipmentByInstitutionId(resolvedInstId);
        } else {
            all = equipmentService.getAllEquipment();
        }
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), all.size());
        List<Equipment> pageContent = start < all.size() ? all.subList(start, end) : List.of();

        PaginatedResponse<EquipmentResponse> response = PaginatedResponse.<EquipmentResponse>builder()
                .content(pageContent.stream().map(this::toDto).toList())
                .totalElements(all.size())
                .totalPages((int) Math.ceil((double) all.size() / pageable.getPageSize()))
                .currentPage(page)
                .pageSize(pageable.getPageSize())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(equipmentService.getEquipmentById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EquipmentResponse>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(equipmentService.searchEquipment(name, categoryId, laboratoryId, status)
                .stream().map(this::toDto).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> create(@RequestBody Equipment equipment) {
        equipmentService.createEquipment(equipment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Equipment created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @RequestBody Equipment equipment) {
        equipmentService.updateEquipment(id, equipment);
        return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id, @RequestParam EquipmentStatus status) {
        equipmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Equipment status updated"));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('LAB_TECHNICIAN') or hasRole('LAB_MANAGER') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            equipmentService.uploadImage(id, file);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/qr-code")
    @SuppressWarnings("null")
    public ResponseEntity<?> generateQrCode(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.getEquipmentById(id);
            
            String qrContent = String.format("Equipment Code: %s\nName: %s\nManufacturer: %s\nModel: %s\nSerial: %s",
                    equipment.getEquipmentCode(),
                    equipment.getEquipmentName(),
                    equipment.getManufacturer() != null ? equipment.getManufacturer() : "N/A",
                    equipment.getModelNumber() != null ? equipment.getModelNumber() : "N/A",
                    equipment.getSerialNumber() != null ? equipment.getSerialNumber() : "N/A");
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 300, 300);
            
            Path qrCodeDir = Paths.get(uploadDir, "qr-codes").toAbsolutePath().normalize();
            if (!qrCodeDir.toFile().exists()) {
                qrCodeDir.toFile().mkdirs();
            }
            
            Path qrCodePath = qrCodeDir.resolve("equipment_" + id + ".png");
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", qrCodePath);
            
            FileSystemResource resource = new FileSystemResource(qrCodePath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"qr_" + equipment.getEquipmentCode() + ".png\"")
                    .body(resource);
        } catch (WriterException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate QR code: " + e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to save QR code file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate QR code: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilitySlotResponse> getAvailability(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "#{T(java.time.LocalDate).now()}") LocalDate date) {
        return ResponseEntity.ok(equipmentAvailabilityService.getAvailability(id, date));
    }

    @GetMapping("/{id}/availability/range")
    public ResponseEntity<List<AvailabilitySlotResponse>> getAvailabilityRange(
            @PathVariable Long id,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(equipmentAvailabilityService.getAvailabilityRange(id, startDate, endDate));
    }

    @GetMapping("/{id}/utilization")
    public ResponseEntity<EquipmentUtilization> getEquipmentUtilization(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        var response = utilizationIntelligenceService.getUtilizationIntelligence(start, end);
        EquipmentUtilization util = response.getEquipmentUtilizations().stream()
                .filter(e -> e.getEquipmentId().equals(id))
                .findFirst()
                .orElseThrow(() -> new com.lrplatform.exception.BadRequestException("Equipment not found in utilization data"));
        return ResponseEntity.ok(util);
    }

    @GetMapping("/tags/search")
    public ResponseEntity<List<EquipmentTag>> searchTags(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(equipmentService.searchTags(query));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<EquipmentResponse>> getRecommendations(HttpServletRequest httpRequest) {
        User user = currentUserUtil.getCurrentUser(httpRequest);
        return ResponseEntity.ok(equipmentService.getRecommendations(user.getId())
                .stream().map(this::toDto).toList());
    }

    private EquipmentResponse toDto(Equipment e) {
        return EquipmentResponse.builder()
                .id(e.getId())
                .equipmentCode(e.getEquipmentCode())
                .equipmentName(e.getEquipmentName())
                .categoryId(e.getCategory() != null ? e.getCategory().getId() : null)
                .categoryName(e.getCategory() != null ? e.getCategory().getCategoryName() : null)
                .laboratoryId(e.getLaboratory() != null ? e.getLaboratory().getId() : null)
                .laboratoryName(e.getLaboratory() != null ? e.getLaboratory().getLaboratoryName() : null)
                .manufacturer(e.getManufacturer())
                .modelNumber(e.getModelNumber())
                .serialNumber(e.getSerialNumber())
                .purchaseDate(e.getPurchaseDate())
                .purchaseCost(e.getPurchaseCost())
                .hourlyRate(e.getHourlyRate())
                .warrantyExpiry(e.getWarrantyExpiry())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .qrCode(e.getQrCode())
                .imageUrl(e.getImageUrl())
                .maxBookingHours(e.getMaxBookingHours())
                .calibrationDueDate(e.getCalibrationDueDate())
                .description(e.getDescription())
                .assignedTechnicianId(e.getAssignedTechnicianId())
                .specifications(e.getSpecifications())
                .tags(e.getTags() != null ? e.getTags().stream().map(EquipmentTag::getTagName).toList() : List.of())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
