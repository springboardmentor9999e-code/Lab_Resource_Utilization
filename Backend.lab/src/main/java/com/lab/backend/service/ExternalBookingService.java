package com.lab.backend.service;

import com.lab.backend.dto.ExternalBookingRequest;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.ExternalBooking;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.exception.ResourceNotFoundException;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.ExternalBookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExternalBookingService {

    private final ExternalBookingRepository externalBookingRepository;
    private final EquipmentRepository equipmentRepository;

    public ExternalBookingService(ExternalBookingRepository externalBookingRepository,
                                  EquipmentRepository equipmentRepository) {
        this.externalBookingRepository = externalBookingRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public ExternalBooking createExternalBooking(ExternalBookingRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        ExternalBooking booking = new ExternalBooking();
        booking.setExternalInstitutionName(request.getExternalInstitutionName());
        booking.setExternalUserEmail(request.getExternalUserEmail());
        booking.setExternalUserName(request.getExternalUserName());
        booking.setEquipment(equipment);
        booking.setBookingDate(request.getBookingDate());
        booking.setReturnDate(request.getReturnDate());
        booking.setPurpose(request.getPurpose());
        booking.setStatus("PENDING");

        return externalBookingRepository.save(booking);
    }

    public List<ExternalBooking> getAllExternalBookings() {
        return externalBookingRepository.findAll();
    }

    public ExternalBooking getExternalBookingById(Long id) {
        return externalBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("External booking not found with ID: " + id));
    }

    public ExternalBooking cancelExternalBooking(Long id) {
        ExternalBooking booking = getExternalBookingById(id);
        booking.setStatus("CANCELLED");
        if (booking.getEquipment() != null) {
            booking.getEquipment().setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(booking.getEquipment());
        }
        return externalBookingRepository.save(booking);
    }

    public List<ExternalBooking> getExternalBookingHistory(String email) {
        if (email != null && !email.trim().isEmpty()) {
            return externalBookingRepository.findByExternalUserEmail(email);
        }
        return externalBookingRepository.findAll();
    }
}
