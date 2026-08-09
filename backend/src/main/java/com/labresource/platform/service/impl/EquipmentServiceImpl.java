package com.labresource.platform.service.impl;

import com.labresource.platform.dto.CreateEquipmentRequest;
import com.labresource.platform.dto.EquipmentResponse;
import com.labresource.platform.dto.UpdateEquipmentRequest;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.exception.DuplicateEquipmentException;
import com.labresource.platform.exception.EquipmentNotFoundException;
import com.labresource.platform.exception.LabNotFoundException;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.LabRepository;
import com.labresource.platform.service.EquipmentService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final LabRepository labRepository;

    public EquipmentServiceImpl(
            EquipmentRepository equipmentRepository,
            LabRepository labRepository
    ) {
        this.equipmentRepository = equipmentRepository;
        this.labRepository = labRepository;
    }

    @Override
    @Transactional
    public EquipmentResponse createEquipment(CreateEquipmentRequest request) {
        String serialNumber = normalize(request.serialNumber());
        validateQuantities(request.quantity(), request.availableQuantity());

        if (equipmentRepository.existsBySerialNumber(serialNumber)) {
            throw new DuplicateEquipmentException("Equipment with this serial number already exists");
        }

        Lab lab = findLabById(request.labId());

        Equipment equipment = Equipment.builder()
                .name(normalize(request.name()))
                .category(normalize(request.category()))
                .manufacturer(normalize(request.manufacturer()))
                .serialNumber(serialNumber)
                .quantity(request.quantity())
                .availableQuantity(request.availableQuantity())
                .status(request.status())
                .purchaseDate(request.purchaseDate())
                .lab(lab)
                .build();

        return EquipmentResponse.from(equipmentRepository.saveAndFlush(equipment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepository.findAll()
                .stream()
                .map(EquipmentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        return EquipmentResponse.from(findEquipmentById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getEquipmentByLab(Long labId) {
        findLabById(labId);

        return equipmentRepository.findByLabId(labId)
                .stream()
                .map(EquipmentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getEquipmentByStatus(EquipmentStatus status) {
        return equipmentRepository.findByStatus(status)
                .stream()
                .map(EquipmentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getEquipmentByLabAndStatus(Long labId, EquipmentStatus status) {
        findLabById(labId);

        return equipmentRepository.findByLabIdAndStatus(labId, status)
                .stream()
                .map(EquipmentResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public EquipmentResponse updateEquipment(Long id, UpdateEquipmentRequest request) {
        Equipment equipment = findEquipmentById(id);
        String serialNumber = normalize(request.serialNumber());
        validateQuantities(request.quantity(), request.availableQuantity());

        if (!equipment.getSerialNumber().equals(serialNumber)
                && equipmentRepository.existsBySerialNumber(serialNumber)) {
            throw new DuplicateEquipmentException("Equipment with this serial number already exists");
        }

        Lab lab = findLabById(request.labId());

        equipment.setName(normalize(request.name()));
        equipment.setCategory(normalize(request.category()));
        equipment.setManufacturer(normalize(request.manufacturer()));
        equipment.setSerialNumber(serialNumber);
        equipment.setQuantity(request.quantity());
        equipment.setAvailableQuantity(request.availableQuantity());
        equipment.setStatus(request.status());
        equipment.setPurchaseDate(request.purchaseDate());
        equipment.setLab(lab);

        return EquipmentResponse.from(equipmentRepository.saveAndFlush(equipment));
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = findEquipmentById(id);
        equipmentRepository.delete(equipment);
    }

    private Equipment findEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment with id " + id + " was not found"));
    }

    private Lab findLabById(Long id) {
        return labRepository.findById(id)
                .orElseThrow(() -> new LabNotFoundException("Lab with id " + id + " was not found"));
    }

    private void validateQuantities(Integer quantity, Integer availableQuantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        if (availableQuantity == null || availableQuantity < 0) {
            throw new IllegalArgumentException("Available quantity must not be negative");
        }

        if (availableQuantity > quantity) {
            throw new IllegalArgumentException("Available quantity must not be greater than quantity");
        }
    }

    private String normalize(String value) {
        return value.trim();
    }
}
