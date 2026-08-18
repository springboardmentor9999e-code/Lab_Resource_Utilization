package com.lab.backend.service;

import com.lab.backend.dto.MaintenanceRequest;
import com.lab.backend.dto.MaintenanceResponse;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.Maintenance;
import com.lab.backend.entity.MaintenanceStatus;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.exception.CustomExceptions;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingService bookingService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                              EquipmentRepository equipmentRepository,
                              BookingService bookingService) {
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingService = bookingService;
    }

    public MaintenanceResponse addMaintenance(MaintenanceRequest request) {
        if (request.getEquipmentId() == null) {
            throw new CustomExceptions.BadRequestException("Equipment ID is required");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        Maintenance maintenance = new Maintenance();
        maintenance.setEquipment(equipment);
        maintenance.setMaintenanceDate(request.getMaintenanceDate());
        maintenance.setMaintenanceType(request.getMaintenanceType());
        maintenance.setDescription(request.getDescription());
        maintenance.setCost(request.getCost());
        maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);

        Maintenance saved = maintenanceRepository.save(maintenance);

        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        return mapToResponse(saved);
    }

    public Maintenance createMaintenance(Maintenance maintenance) {
        if (maintenance.getEquipment() == null || maintenance.getEquipment().getId() == null) {
            throw new CustomExceptions.BadRequestException("Equipment is required for maintenance record");
        }

        Equipment equipment = equipmentRepository.findById(maintenance.getEquipment().getId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + maintenance.getEquipment().getId()));

        if (maintenance.getStatus() == null) {
            maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);
        }

        Maintenance saved = maintenanceRepository.save(maintenance);

        if (saved.getStatus() != MaintenanceStatus.COMPLETED) {
            equipment.setStatus(EquipmentStatus.MAINTENANCE);
            equipmentRepository.save(equipment);
        } else {
            bookingService.recalculateEquipmentStatus(equipment);
        }

        return saved;
    }

    public List<Maintenance> getAllMaintenances() {
        return maintenanceRepository.findAll();
    }

    public List<MaintenanceResponse> getAllMaintenance() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getAllMaintenanceResponses() {
        return getAllMaintenance();
    }

    public List<Maintenance> searchAndFilterMaintenances(Long equipmentId, String status) {
        List<Maintenance> list = maintenanceRepository.findAll();

        return list.stream()
                .filter(m -> equipmentId == null || (m.getEquipment() != null && m.getEquipment().getId().equals(equipmentId)))
                .filter(m -> status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All") ||
                        (m.getStatus() != null && m.getStatus().name().equalsIgnoreCase(status.trim())))
                .collect(Collectors.toList());
    }

    public Maintenance getMaintenanceEntityById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Maintenance not found with ID: " + id));
    }

    public MaintenanceResponse getMaintenanceById(Long id) {
        return mapToResponse(getMaintenanceEntityById(id));
    }

    public MaintenanceResponse getMaintenanceResponseById(Long id) {
        return getMaintenanceById(id);
    }

    public Maintenance updateMaintenance(Long id, Maintenance maintenance) {
        Maintenance existing = getMaintenanceEntityById(id);

        existing.setDescription(maintenance.getDescription());
        existing.setMaintenanceDate(maintenance.getMaintenanceDate());
        existing.setMaintenanceType(maintenance.getMaintenanceType());
        existing.setCost(maintenance.getCost());
        if (maintenance.getStatus() != null) {
            existing.setStatus(maintenance.getStatus());
        }

        if (maintenance.getEquipment() != null && maintenance.getEquipment().getId() != null) {
            Equipment equipment = equipmentRepository.findById(maintenance.getEquipment().getId()).orElse(null);
            if (equipment != null) {
                existing.setEquipment(equipment);
            }
        }

        Maintenance updated = maintenanceRepository.save(existing);

        Equipment eq = updated.getEquipment();
        if (eq != null) {
            if (updated.getStatus() == MaintenanceStatus.IN_PROGRESS || updated.getStatus() == MaintenanceStatus.PENDING) {
                eq.setStatus(EquipmentStatus.MAINTENANCE);
                equipmentRepository.save(eq);
            } else {
                bookingService.recalculateEquipmentStatus(eq);
            }
        }

        return updated;
    }

    public MaintenanceResponse updateMaintenance(Long id, MaintenanceRequest request) {
        Maintenance existing = getMaintenanceEntityById(id);

        existing.setMaintenanceDate(request.getMaintenanceDate());
        existing.setMaintenanceType(request.getMaintenanceType());
        existing.setDescription(request.getDescription());
        existing.setCost(request.getCost());

        if (request.getEquipmentId() != null) {
            Equipment equipment = equipmentRepository.findById(request.getEquipmentId()).orElse(null);
            if (equipment != null) {
                existing.setEquipment(equipment);
            }
        }

        Maintenance updated = maintenanceRepository.save(existing);

        Equipment eq = updated.getEquipment();
        if (eq != null) {
            if (updated.getStatus() == MaintenanceStatus.IN_PROGRESS || updated.getStatus() == MaintenanceStatus.PENDING) {
                eq.setStatus(EquipmentStatus.MAINTENANCE);
                equipmentRepository.save(eq);
            } else {
                bookingService.recalculateEquipmentStatus(eq);
            }
        }

        return mapToResponse(updated);
    }

    public MaintenanceResponse updateStatus(Long id, MaintenanceStatus status) {
        Maintenance existing = getMaintenanceEntityById(id);
        existing.setStatus(status);

        Maintenance updated = maintenanceRepository.save(existing);

        Equipment eq = updated.getEquipment();
        if (eq != null) {
            if (updated.getStatus() == MaintenanceStatus.IN_PROGRESS || updated.getStatus() == MaintenanceStatus.PENDING) {
                eq.setStatus(EquipmentStatus.MAINTENANCE);
                equipmentRepository.save(eq);
            } else {
                bookingService.recalculateEquipmentStatus(eq);
            }
        }

        return mapToResponse(updated);
    }

    public void deleteMaintenance(Long id) {
        Maintenance existing = getMaintenanceEntityById(id);
        Equipment eq = existing.getEquipment();

        maintenanceRepository.delete(existing);

        if (eq != null) {
            bookingService.recalculateEquipmentStatus(eq);
        }
    }

    public MaintenanceResponse mapToResponse(Maintenance maintenance) {
        MaintenanceResponse response = new MaintenanceResponse();
        response.setId(maintenance.getId());
        if (maintenance.getEquipment() != null) {
            response.setEquipmentId(maintenance.getEquipment().getId());
            response.setEquipmentName(maintenance.getEquipment().getName());
        }
        response.setMaintenanceDate(maintenance.getMaintenanceDate());
        response.setMaintenanceType(maintenance.getMaintenanceType());
        response.setDescription(maintenance.getDescription());
        response.setCost(maintenance.getCost());
        if (maintenance.getStatus() != null) {
            response.setStatus(maintenance.getStatus().name());
        }
        return response;
    }
}