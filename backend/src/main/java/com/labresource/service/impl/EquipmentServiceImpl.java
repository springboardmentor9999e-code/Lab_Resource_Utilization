package com.labresource.service.impl;

import com.labresource.dto.request.EquipmentRequest;
import com.labresource.dto.response.CategoryStatsResponse;
import com.labresource.dto.response.EquipmentDocumentResponse;
import com.labresource.dto.response.EquipmentImageResponse;
import com.labresource.dto.response.EquipmentResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentDocument;
import com.labresource.entity.EquipmentImage;
import com.labresource.entity.Institution;
import com.labresource.entity.Lab;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentDocumentRepository;
import com.labresource.repository.EquipmentImageRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.LabRepository;
import com.labresource.service.interfaces.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "AVAILABLE", "IN_USE", "RESERVED", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED", "LOST");

    // Seeded catalog vocabulary — merged with the categories actually in use (see getCategories)
    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Computers", "Printers", "Scientific Equipment", "Electronics",
            "Networking", "Chemical Kits", "General Labware");

    private final EquipmentRepository equipmentRepository;
    private final EquipmentImageRepository equipmentImageRepository;
    private final EquipmentDocumentRepository equipmentDocumentRepository;
    private final LabRepository labRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public EquipmentResponse addEquipment(EquipmentRequest request) {
        return createEquipment(request);
    }

    @Override
    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        if (equipmentRepository.findByEquipmentCode(request.getEquipmentCode()).isPresent()) {
            throw new RuntimeException("Equipment with code " + request.getEquipmentCode() + " already exists");
        }

        Lab lab = null;
        Department dept = null;
        Institution inst = null;

        if (request.getLabId() != null) {
            lab = labRepository.findById(request.getLabId())
                    .orElseThrow(() -> new RuntimeException("Lab not found"));
            dept = lab.getDepartment();
            inst = lab.getInstitution();
        } else {
            if (request.getDepartmentId() != null) {
                dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
            }
            if (dept == null) {
                dept = departmentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No Department exists to allocate equipment"));
            }

            if (request.getInstitutionId() != null) {
                inst = institutionRepository.findById(request.getInstitutionId()).orElse(null);
            }
            if (inst == null) {
                inst = dept.getInstitution();
            }
            if (inst == null) {
                inst = institutionRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No Institution available"));
            }
        }

        Equipment eq = Equipment.builder()
                .equipmentName(request.getEquipmentName())
                .equipmentCode(request.getEquipmentCode())
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .purchaseDate(request.getPurchaseDate())
                .status(validatedStatus(request.getStatus(), "AVAILABLE"))
                .warrantyExpiry(request.getWarrantyExpiry())
                .vendor(request.getVendor())
                .cost(request.getCost())
                .currentLocation(request.getCurrentLocation())
                .description(request.getDescription())
                .specifications(request.getSpecifications())
                .rfidTag(request.getRfidTag())
                .tags(normalizeTags(request.getTags()))
                .isShareable(request.getIsShareable() != null ? request.getIsShareable() : false)
                .hourlyRate(request.getHourlyRate())
                .lab(lab)
                .department(dept)
                .institution(inst)
                .build();

        Equipment savedEq = equipmentRepository.save(eq);
        return mapToResponse(savedEq, false);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentResponse> searchEquipment(String search, String category, Long labId,
                                                   Long departmentId, String status, String manufacturer,
                                                   String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());

        // Tags are stored normalized (trimmed + lowercase) — match the filter to that form
        String normalizedTag = tag == null ? null : tag.trim().toLowerCase();

        Page<Equipment> entities = equipmentRepository.searchEquipmentPageable(
                search, category, labId, departmentId, status, manufacturer, normalizedTag, pageable
        );

        return entities.map(e -> mapToResponse(e, false));
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipment(Long id) {
        return getEquipmentById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return mapToResponse(eq, true);
    }

    @Override
    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (!eq.getEquipmentCode().equals(request.getEquipmentCode())
                && equipmentRepository.findByEquipmentCode(request.getEquipmentCode()).isPresent()) {
            throw new RuntimeException("Equipment with code " + request.getEquipmentCode() + " already exists");
        }

        Lab lab = null;
        Department dept = eq.getDepartment();
        Institution inst = eq.getInstitution();

        if (request.getLabId() != null) {
            lab = labRepository.findById(request.getLabId())
                    .orElseThrow(() -> new RuntimeException("Lab not found"));
            dept = lab.getDepartment();
            inst = lab.getInstitution();
        } else {
            if (request.getDepartmentId() != null) {
                dept = departmentRepository.findById(request.getDepartmentId()).orElse(dept);
            }
            if (request.getInstitutionId() != null) {
                inst = institutionRepository.findById(request.getInstitutionId()).orElse(inst);
            }
        }

        eq.setEquipmentName(request.getEquipmentName());
        eq.setEquipmentCode(request.getEquipmentCode());
        eq.setCategory(request.getCategory());
        eq.setManufacturer(request.getManufacturer());
        eq.setModel(request.getModel());
        eq.setSerialNumber(request.getSerialNumber());
        eq.setPurchaseDate(request.getPurchaseDate());
        if (request.getStatus() != null) {
            eq.setStatus(validatedStatus(request.getStatus(), eq.getStatus()));
        }
        eq.setWarrantyExpiry(request.getWarrantyExpiry());
        eq.setVendor(request.getVendor());
        eq.setCost(request.getCost());
        eq.setCurrentLocation(request.getCurrentLocation());
        eq.setDescription(request.getDescription());
        eq.setSpecifications(request.getSpecifications());
        eq.setRfidTag(request.getRfidTag());
        eq.setTags(normalizeTags(request.getTags()));
        if (request.getIsShareable() != null) {
            eq.setIsShareable(request.getIsShareable());
        }
        eq.setHourlyRate(request.getHourlyRate());
        eq.setLab(lab);
        eq.setDepartment(dept);
        eq.setInstitution(inst);

        Equipment updatedEq = equipmentRepository.save(eq);
        return mapToResponse(updatedEq, true);
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // Remove stored files from disk before removing DB rows
        eq.getImages().forEach(img -> fileStorageService.delete(img.getImageUrl()));
        eq.getDocuments().forEach(doc -> fileStorageService.delete(doc.getFileUrl()));

        equipmentRepository.delete(eq);
    }

    @Override
    @Transactional
    public EquipmentResponse changeStatus(Long id, String status) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        String formatted = status == null ? "" : status.toUpperCase();
        if (!VALID_STATUSES.contains(formatted)) {
            throw new RuntimeException("Invalid status. Allowed: " + String.join(", ", VALID_STATUSES));
        }

        eq.setStatus(formatted);
        Equipment saved = equipmentRepository.save(eq);
        return mapToResponse(saved, false);
    }

    /**
     * Categorization vocabulary = the seeded defaults plus any custom category an
     * admin has typed on an equipment record, so newly created categories become
     * filterable/selectable everywhere without a separate category table.
     */
    @Override
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        Set<String> categories = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        categories.addAll(DEFAULT_CATEGORIES);
        categories.addAll(equipmentRepository.findDistinctCategories());
        return new ArrayList<>(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getManufacturers() {
        return equipmentRepository.findDistinctManufacturers();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getTags() {
        return equipmentRepository.findAllTagStrings().stream()
                .flatMap(s -> Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Taxonomy management — categorization & tagging
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<CategoryStatsResponse> getCategoryStats() {
        // Counts of categories actually in use, keyed case-insensitively so
        // "Computers" and "computers" report as one category.
        Map<String, Long> counts = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (Object[] row : equipmentRepository.countByCategory()) {
            String name = (String) row[0];
            if (name == null || name.isBlank()) {
                continue;
            }
            counts.merge(name.trim(), (Long) row[1], Long::sum);
        }

        // Seeded vocabulary appears even at zero count so it stays offerable
        Map<String, CategoryStatsResponse> result = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (String seed : DEFAULT_CATEGORIES) {
            result.put(seed, CategoryStatsResponse.builder()
                    .name(seed)
                    .equipmentCount(counts.getOrDefault(seed, 0L))
                    .seeded(true)
                    .build());
        }
        counts.forEach((name, count) -> {
            if (!result.containsKey(name)) {
                result.put(name, CategoryStatsResponse.builder()
                        .name(name)
                        .equipmentCount(count)
                        .seeded(false)
                        .build());
            }
        });

        return result.values().stream()
                .sorted(Comparator
                        .comparingLong(CategoryStatsResponse::getEquipmentCount).reversed()
                        .thenComparing(CategoryStatsResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int renameCategory(String from, String to) {
        String source = requireText(from, "Source category is required");
        String target = requireText(to, "Target category is required");

        if (source.equalsIgnoreCase(target)) {
            throw new IllegalArgumentException("Source and target categories are the same");
        }

        List<Equipment> affected = equipmentRepository.findByCategoryIgnoreCase(source);
        if (affected.isEmpty()) {
            throw new IllegalArgumentException("No equipment is filed under category '" + source + "'");
        }

        // Merge is the same operation as rename — the target simply already exists
        affected.forEach(eq -> eq.setCategory(target));
        equipmentRepository.saveAll(affected);
        return affected.size();
    }

    @Override
    @Transactional
    public int deleteCategory(String category, String reassignTo) {
        String source = requireText(category, "Category is required");
        String target = requireText(reassignTo,
                "A replacement category is required — equipment cannot be left uncategorized");

        if (source.equalsIgnoreCase(target)) {
            throw new IllegalArgumentException("Cannot reassign a category to itself");
        }

        List<Equipment> affected = equipmentRepository.findByCategoryIgnoreCase(source);
        if (affected.isEmpty()) {
            // Nothing filed under it — a seeded-only category, so there is nothing to move
            return 0;
        }

        affected.forEach(eq -> eq.setCategory(target));
        equipmentRepository.saveAll(affected);
        return affected.size();
    }

    @Override
    @Transactional
    public int renameTag(String from, String to) {
        String source = requireText(from, "Source tag is required").toLowerCase();
        String target = requireText(to, "Target tag is required").toLowerCase();

        if (source.equals(target)) {
            throw new IllegalArgumentException("Source and target tags are the same");
        }
        if (target.contains(",")) {
            throw new IllegalArgumentException("A tag cannot contain a comma");
        }

        List<Equipment> affected = equipmentRepository.findByTag(source);
        if (affected.isEmpty()) {
            throw new IllegalArgumentException("No equipment carries the tag '" + source + "'");
        }

        for (Equipment eq : affected) {
            // Swap then re-normalize: normalizeTags dedupes, so an asset that already
            // had the target tag collapses the two into one rather than duplicating it
            eq.setTags(normalizeTags(replaceTag(eq.getTags(), source, target)));
        }
        equipmentRepository.saveAll(affected);
        return affected.size();
    }

    @Override
    @Transactional
    public int deleteTag(String tag) {
        String source = requireText(tag, "Tag is required").toLowerCase();

        List<Equipment> affected = equipmentRepository.findByTag(source);
        if (affected.isEmpty()) {
            return 0;
        }

        for (Equipment eq : affected) {
            eq.setTags(normalizeTags(replaceTag(eq.getTags(), source, null)));
        }
        equipmentRepository.saveAll(affected);
        return affected.size();
    }

    /** Replaces (or, when {@code to} is null, removes) one tag inside a comma-separated list. */
    private String replaceTag(String rawTags, String from, String to) {
        if (rawTags == null || rawTags.isBlank()) {
            return rawTags;
        }
        return Arrays.stream(rawTags.split(","))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .map(t -> t.equalsIgnoreCase(from) ? to : t)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(","));
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    // ------------------------------------------------------------------
    // Images
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public EquipmentImageResponse uploadImage(Long equipmentId, MultipartFile file, boolean primary, String username) {
        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        String url = fileStorageService.storeImage(file, "equipment/" + equipmentId);

        boolean isFirstImage = eq.getImages().isEmpty();
        if (primary) {
            // demote existing primary
            eq.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .forEach(img -> img.setIsPrimary(false));
        }

        EquipmentImage image = EquipmentImage.builder()
                .equipment(eq)
                .imageUrl(url)
                .fileName(file.getOriginalFilename())
                .isPrimary(primary || isFirstImage)
                .uploadedBy(username)
                .build();

        EquipmentImage saved = equipmentImageRepository.save(image);
        return mapImage(saved);
    }

    @Override
    @Transactional
    public void deleteImage(Long equipmentId, Long imageId) {
        EquipmentImage image = equipmentImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getEquipment().getEquipmentId().equals(equipmentId)) {
            throw new RuntimeException("Image does not belong to this equipment");
        }

        fileStorageService.delete(image.getImageUrl());
        equipmentImageRepository.delete(image);
    }

    @Override
    @Transactional
    public EquipmentImageResponse setPrimaryImage(Long equipmentId, Long imageId) {
        EquipmentImage image = equipmentImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getEquipment().getEquipmentId().equals(equipmentId)) {
            throw new RuntimeException("Image does not belong to this equipment");
        }

        equipmentImageRepository.findByEquipment_EquipmentIdOrderByUploadedAtAsc(equipmentId)
                .forEach(img -> img.setIsPrimary(img.getImageId().equals(imageId)));

        return mapImage(image);
    }

    // ------------------------------------------------------------------
    // Documents
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public EquipmentDocumentResponse uploadDocument(Long equipmentId, MultipartFile file,
                                                    String documentType, String title, String username) {
        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        String url = fileStorageService.storeDocument(file, "equipment/" + equipmentId + "/docs");

        EquipmentDocument document = EquipmentDocument.builder()
                .equipment(eq)
                .documentType(documentType == null ? "OTHER" : documentType.toUpperCase())
                .title(title != null && !title.isBlank() ? title : file.getOriginalFilename())
                .fileUrl(url)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .uploadedBy(username)
                .build();

        EquipmentDocument saved = equipmentDocumentRepository.save(document);
        return mapDocument(saved);
    }

    @Override
    @Transactional
    public void deleteDocument(Long equipmentId, Long documentId) {
        EquipmentDocument document = equipmentDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getEquipment().getEquipmentId().equals(equipmentId)) {
            throw new RuntimeException("Document does not belong to this equipment");
        }

        fileStorageService.delete(document.getFileUrl());
        equipmentDocumentRepository.delete(document);
    }

    // ------------------------------------------------------------------
    // Mapping helpers
    // ------------------------------------------------------------------

    /** Trim, lowercase, dedupe, and drop blanks: " HV, Shared ,hv" -> "hv,shared". */
    private String normalizeTags(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String joined = Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.joining(","));
        return joined.isEmpty() ? null : joined;
    }

    private String validatedStatus(String status, String fallback) {
        if (status == null || status.isBlank()) {
            return fallback;
        }
        String formatted = status.toUpperCase();
        if (!VALID_STATUSES.contains(formatted)) {
            throw new RuntimeException("Invalid status. Allowed: " + String.join(", ", VALID_STATUSES));
        }
        return formatted;
    }

    private EquipmentImageResponse mapImage(EquipmentImage img) {
        return EquipmentImageResponse.builder()
                .imageId(img.getImageId())
                .imageUrl(img.getImageUrl())
                .fileName(img.getFileName())
                .isPrimary(img.getIsPrimary())
                .uploadedBy(img.getUploadedBy())
                .uploadedAt(img.getUploadedAt())
                .build();
    }

    private EquipmentDocumentResponse mapDocument(EquipmentDocument doc) {
        return EquipmentDocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .documentType(doc.getDocumentType())
                .title(doc.getTitle())
                .fileUrl(doc.getFileUrl())
                .fileName(doc.getFileName())
                .fileSize(doc.getFileSize())
                .uploadedBy(doc.getUploadedBy())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    private EquipmentResponse mapToResponse(Equipment eq, boolean includeFiles) {
        String primaryImageUrl = eq.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(EquipmentImage::getImageUrl)
                .findFirst()
                .orElse(eq.getImages().stream().map(EquipmentImage::getImageUrl).findFirst().orElse(null));

        EquipmentResponse.EquipmentResponseBuilder builder = EquipmentResponse.builder()
                .equipmentId(eq.getEquipmentId())
                .equipmentName(eq.getEquipmentName())
                .equipmentCode(eq.getEquipmentCode())
                .category(eq.getCategory())
                .manufacturer(eq.getManufacturer())
                .model(eq.getModel())
                .serialNumber(eq.getSerialNumber())
                .purchaseDate(eq.getPurchaseDate())
                .status(eq.getStatus())
                .warrantyExpiry(eq.getWarrantyExpiry())
                .vendor(eq.getVendor())
                .cost(eq.getCost())
                .currentLocation(eq.getCurrentLocation())
                .description(eq.getDescription())
                .specifications(eq.getSpecifications())
                .qrCode(eq.getQrCode())
                .rfidTag(eq.getRfidTag())
                .tags(eq.getTags())
                .isShareable(eq.getIsShareable())
                .hourlyRate(eq.getHourlyRate())
                .labId(eq.getLab() != null ? eq.getLab().getLabId() : null)
                .labName(eq.getLab() != null ? eq.getLab().getName() : "Unallocated")
                .departmentId(eq.getDepartment() != null ? eq.getDepartment().getDepartmentId() : null)
                .departmentName(eq.getDepartment() != null ? eq.getDepartment().getName() : "Unassigned")
                .institutionId(eq.getInstitution() != null ? eq.getInstitution().getInstitutionId() : null)
                .institutionName(eq.getInstitution() != null ? eq.getInstitution().getName() : "Unassigned")
                .primaryImageUrl(primaryImageUrl)
                .createdAt(eq.getCreatedAt())
                .updatedAt(eq.getUpdatedAt());

        if (includeFiles) {
            builder.images(eq.getImages().stream().map(this::mapImage).collect(Collectors.toList()))
                   .documents(eq.getDocuments().stream().map(this::mapDocument).collect(Collectors.toList()));
        }

        return builder.build();
    }
}
