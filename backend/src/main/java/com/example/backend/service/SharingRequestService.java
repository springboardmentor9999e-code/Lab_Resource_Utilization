package com.example.backend.service;

import com.example.backend.entity.SharingRequest;
import com.example.backend.repository.SharingRequestRepository;
import org.springframework.stereotype.Service;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Equipment;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.SharingRequestRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SharingRequestService {

    private final SharingRequestRepository repository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public SharingRequestService(
            SharingRequestRepository repository,
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository) {

        this.repository = repository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
    }
    public SharingRequest createRequest(SharingRequest request) {

        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        return repository.save(request);
    }

    public List<SharingRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<SharingRequest> getPendingRequests() {
        return repository.findByStatus("PENDING");
    }

    public SharingRequest approveRequest(Long requestId) {

        SharingRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Sharing request not found"));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId().intValue())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getAvailableQuantity() <= 0) {
            throw new RuntimeException("Equipment is not available");
        }

        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);

        equipmentRepository.save(equipment);

        Booking booking = new Booking();

        booking.setUserId(request.getRequesterId());

        booking.setEquipmentId(request.getEquipmentId());

        booking.setBookingDate(request.getBookingDate());

        booking.setStartTime(request.getStartTime());

        booking.setEndTime(request.getEndTime());

        booking.setStatus("APPROVED");

        bookingRepository.save(booking);

        request.setStatus("APPROVED");

        return repository.save(request);
    }

    public SharingRequest rejectRequest(Long requestId, String remarks) {

        SharingRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        request.setRemarks(remarks);

        return repository.save(request);
    }

}