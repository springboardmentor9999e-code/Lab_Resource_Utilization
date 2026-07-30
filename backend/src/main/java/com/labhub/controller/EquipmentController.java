package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.dto.equipment.EquipmentRequest;
import com.labhub.dto.equipment.EquipmentResponse;
import com.labhub.entity.EquipmentCategory;
import com.labhub.enums.EquipmentStatus;
import com.labhub.repository.EquipmentCategoryRepository;
import com.labhub.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for equipment CRUD and search.
 */
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final EquipmentCategoryRepository categoryRepository;

    /**
     * GET /api/equipment?search=&categoryId=&status=&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentResponse>>> getAllEquipment(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        Page<EquipmentResponse> result = equipmentService.getAll(search, categoryId, status, departmentId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/equipment/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getById(id)));
    }

    /**
     * POST /api/equipment — ADMIN/LAB_MANAGER only
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(
            @Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Equipment created successfully", response));
    }

    /**
     * PUT /api/equipment/{id} — ADMIN/LAB_MANAGER only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(
            @PathVariable UUID id,
            @Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully", response));
    }

    /**
     * DELETE /api/equipment/{id} — ADMIN only (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(@PathVariable UUID id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment deleted successfully", null));
    }

    /**
     * GET /api/equipment/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<EquipmentCategory>>> getCategories() {
        List<EquipmentCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
