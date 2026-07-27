package com.labresource.service.interfaces;

import com.labresource.dto.request.EquipmentRequest;
import com.labresource.dto.response.CategoryStatsResponse;
import com.labresource.dto.response.EquipmentDocumentResponse;
import com.labresource.dto.response.EquipmentImageResponse;
import com.labresource.dto.response.EquipmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EquipmentService {

    EquipmentResponse addEquipment(EquipmentRequest request);

    EquipmentResponse createEquipment(EquipmentRequest request);

    Page<EquipmentResponse> searchEquipment(String search, String category, Long labId,
                                            Long departmentId, String status, String manufacturer,
                                            String tag, int page, int size);

    EquipmentResponse getEquipment(Long id);

    EquipmentResponse getEquipmentById(Long id);

    EquipmentResponse updateEquipment(Long id, EquipmentRequest request);

    void deleteEquipment(Long id);

    EquipmentResponse changeStatus(Long id, String status);

    List<String> getCategories();

    List<String> getManufacturers();

    /** Distinct normalized tags across the whole catalog, sorted alphabetically. */
    List<String> getTags();

    // ---- Taxonomy management (categorization & tagging) ----

    /** Every category with the number of assets filed under it, busiest first. */
    List<CategoryStatsResponse> getCategoryStats();

    /**
     * Renames a category across the catalog. If the target already exists the two
     * are merged. Returns the number of assets moved.
     */
    int renameCategory(String from, String to);

    /**
     * Removes a category by moving its assets to {@code reassignTo}. Returns the
     * number of assets reassigned.
     */
    int deleteCategory(String category, String reassignTo);

    /** Renames a tag across the catalog. Returns the number of assets touched. */
    int renameTag(String from, String to);

    /** Strips a tag from every asset that carries it. Returns the number of assets touched. */
    int deleteTag(String tag);

    // ---- Images ----
    EquipmentImageResponse uploadImage(Long equipmentId, MultipartFile file, boolean primary, String username);

    void deleteImage(Long equipmentId, Long imageId);

    EquipmentImageResponse setPrimaryImage(Long equipmentId, Long imageId);

    // ---- Documents ----
    EquipmentDocumentResponse uploadDocument(Long equipmentId, MultipartFile file,
                                             String documentType, String title, String username);

    void deleteDocument(Long equipmentId, Long documentId);
}
