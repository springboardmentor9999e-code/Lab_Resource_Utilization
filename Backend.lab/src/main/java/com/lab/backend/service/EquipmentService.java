package com.lab.backend.service;

import com.lab.backend.entity.Equipment;
import com.lab.backend.enums.BookingStatus;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.exception.CustomExceptions;
import com.lab.backend.repository.BookingRepository;
import com.lab.backend.repository.EquipmentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            BookingRepository bookingRepository) {
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
    }

    // Add Equipment
    public Equipment addEquipment(Equipment equipment) {
        if (equipment.getQuantity() <= 0) {
            throw new CustomExceptions.BadRequestException("Equipment quantity must be greater than zero");
        }
        if (equipment.getAvailableQuantity() < 0) {
            throw new CustomExceptions.BadRequestException("Available quantity cannot be negative");
        }
        if (equipment.getStatus() == null) {
            equipment.setStatus(equipment.getAvailableQuantity() > 0 ? EquipmentStatus.AVAILABLE : EquipmentStatus.BOOKED);
        }
        return equipmentRepository.save(equipment);
    }

    // Get All Equipment
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // Search and Filter Equipment
    public List<Equipment> searchAndFilterEquipment(String name, Long laboratoryId, String category, EquipmentStatus status) {
        List<Equipment> list = equipmentRepository.findAll();

        return list.stream()
                .filter(e -> name == null || name.trim().isEmpty() ||
                        e.getName().toLowerCase().contains(name.trim().toLowerCase()) ||
                        (e.getDescription() != null && e.getDescription().toLowerCase().contains(name.trim().toLowerCase())))
                .filter(e -> category == null || category.trim().isEmpty() || category.equalsIgnoreCase("All") ||
                        e.getCategory().equalsIgnoreCase(category.trim()))
                .filter(e -> status == null || e.getStatus() == status)
                .filter(e -> laboratoryId == null || (e.getLaboratory() != null && e.getLaboratory().getId().equals(laboratoryId)))
                .collect(Collectors.toList());
    }

    // Get Equipment By ID
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + id));
    }

    // Update Equipment
    public Equipment updateEquipment(Long id, Equipment equipment) {
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + id));

        if (equipment.getQuantity() <= 0) {
            throw new CustomExceptions.BadRequestException("Equipment quantity must be greater than zero");
        }

        existing.setName(equipment.getName());
        existing.setDescription(equipment.getDescription());
        existing.setCategory(equipment.getCategory());
        existing.setQuantity(equipment.getQuantity());
        existing.setAvailableQuantity(equipment.getAvailableQuantity());
        if (equipment.getStatus() != null) {
            existing.setStatus(equipment.getStatus());
        }
        if (equipment.getLaboratory() != null) {
            existing.setLaboratory(equipment.getLaboratory());
        }

        return equipmentRepository.save(existing);
    }

    // Delete Equipment - Prevent deletion if equipment has active bookings
    public String deleteEquipment(Long id) {
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + id));

        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING,
                BookingStatus.APPROVED,
                BookingStatus.ISSUED
        );

        boolean hasActiveBookings = bookingRepository.existsByEquipmentIdAndStatusIn(id, activeStatuses);
        if (hasActiveBookings) {
            throw new CustomExceptions.BadRequestException("Cannot delete equipment: Equipment has active bookings (PENDING, APPROVED, or ISSUED).");
        }

        equipmentRepository.delete(existing);
        return "Equipment deleted successfully";
    }
}