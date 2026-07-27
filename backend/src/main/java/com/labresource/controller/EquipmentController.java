package com.labresource.controller;

import com.labresource.dto.request.EquipmentRequest;
import com.labresource.dto.request.RenameCategoryRequest;
import com.labresource.dto.request.RenameTagRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.CategoryStatsResponse;
import com.labresource.dto.response.EquipmentDocumentResponse;
import com.labresource.dto.response.EquipmentImageResponse;
import com.labresource.dto.response.EquipmentResponse;
import com.labresource.service.interfaces.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

/**
 * Equipment Inventory REST API with role-based access control.
 *
 * Permission matrix (mentor spec):
 *   Add    : SYSTEM_ADMIN, INSTITUTION_ADMIN, DEPARTMENT_HEAD, LAB_MANAGER, LAB_TECHNICIAN
 *   Edit   : SYSTEM_ADMIN, INSTITUTION_ADMIN, DEPARTMENT_HEAD, LAB_MANAGER, LAB_TECHNICIAN
 *   Delete : SYSTEM_ADMIN, INSTITUTION_ADMIN, DEPARTMENT_HEAD, LAB_MANAGER
 *   Status : SYSTEM_ADMIN, LAB_MANAGER, LAB_TECHNICIAN
 *   Images : SYSTEM_ADMIN, LAB_TECHNICIAN
 *   Docs   : SYSTEM_ADMIN, INSTITUTION_ADMIN, LAB_TECHNICIAN
 *   View   : all authenticated users (RESEARCHER, STUDENT view-only)
 */
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentResponse> createEquipment(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.createEquipment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<EquipmentResponse>> getEquipment(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EquipmentResponse> response = equipmentService.searchEquipment(
                search, category, labId, departmentId, status, manufacturer, tag, page, size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        EquipmentResponse response = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentResponse> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        EquipmentResponse response = equipmentService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------
    // Images
    // ------------------------------------------------------------------

    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentImageResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean primary,
            Principal principal) {
        EquipmentImageResponse response = equipmentService.uploadImage(id, file, primary, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        equipmentService.deleteImage(id, imageId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/images/{imageId}/primary")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentImageResponse> setPrimaryImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        EquipmentImageResponse response = equipmentService.setPrimaryImage(id, imageId);
        return ResponseEntity.ok(response);
    }

    // ------------------------------------------------------------------
    // Documents
    // ------------------------------------------------------------------

    @PostMapping("/{id}/upload-document")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<EquipmentDocumentResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String title,
            Principal principal) {
        EquipmentDocumentResponse response = equipmentService.uploadDocument(
                id, file, documentType, title, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @PathVariable Long documentId) {
        equipmentService.deleteDocument(id, documentId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------
    // Metadata
    // ------------------------------------------------------------------

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = equipmentService.getCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/manufacturers")
    public ResponseEntity<List<String>> getManufacturers() {
        return ResponseEntity.ok(equipmentService.getManufacturers());
    }

    /** Distinct tags in use across the catalog — powers tag suggestions and tag filtering. */
    @GetMapping("/tags")
    public ResponseEntity<List<String>> getTags() {
        return ResponseEntity.ok(equipmentService.getTags());
    }

    // ------------------------------------------------------------------
    // Taxonomy management (categorization & tagging)
    //
    // These operations rewrite the category/tag of every matching asset, so
    // they sit above the normal equipment-edit permission: admins and
    // department heads only.
    // ------------------------------------------------------------------

    /** Category taxonomy with asset counts — powers the Category Manager UI. */
    @GetMapping("/categories/stats")
    public ResponseEntity<List<CategoryStatsResponse>> getCategoryStats() {
        return ResponseEntity.ok(equipmentService.getCategoryStats());
    }

    /** Renames a category catalog-wide; merges into the target if it already exists. */
    @PutMapping("/categories/rename")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<Integer>> renameCategory(
            @Valid @RequestBody RenameCategoryRequest request) {
        int moved = equipmentService.renameCategory(request.getFrom(), request.getTo());
        return ResponseEntity.ok(new ApiResponse<>(true,
                moved + " asset(s) moved to \"" + request.getTo().trim() + "\"", moved));
    }

    /** Retires a category by reassigning its assets — equipment is never left uncategorized. */
    @DeleteMapping("/categories")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<Integer>> deleteCategory(
            @RequestParam String category,
            @RequestParam String reassignTo) {
        int moved = equipmentService.deleteCategory(category, reassignTo);
        return ResponseEntity.ok(new ApiResponse<>(true,
                "Category \"" + category + "\" removed; " + moved + " asset(s) reassigned", moved));
    }

    /** Renames a tag catalog-wide; collapses into the target where both are present. */
    @PutMapping("/tags/rename")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<Integer>> renameTag(
            @Valid @RequestBody RenameTagRequest request) {
        int touched = equipmentService.renameTag(request.getFrom(), request.getTo());
        return ResponseEntity.ok(new ApiResponse<>(true,
                touched + " asset(s) retagged as \"" + request.getTo().trim().toLowerCase() + "\"", touched));
    }

    /** Strips a tag from every asset that carries it. */
    @DeleteMapping("/tags/{tag}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<Integer>> deleteTag(@PathVariable String tag) {
        int touched = equipmentService.deleteTag(tag);
        return ResponseEntity.ok(new ApiResponse<>(true,
                "Tag \"" + tag + "\" removed from " + touched + " asset(s)", touched));
    }
}
