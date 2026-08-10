package com.example.backend.service.impl;

import com.example.backend.dto.BillingDTO;
import com.example.backend.entity.Billing;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Equipment;
import com.example.backend.entity.Institution;
import com.example.backend.entity.User;
import com.example.backend.repository.BillingRepository;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.InstitutionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BillingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingServiceImpl implements BillingService {

    private final BillingRepository billingRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;

    public BillingServiceImpl(BillingRepository billingRepository,
                               BookingRepository bookingRepository,
                               EquipmentRepository equipmentRepository,
                               UserRepository userRepository,
                               InstitutionRepository institutionRepository) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
    }

    @Override
    public List<BillingDTO> getAllBillings() {
        return billingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BillingDTO getBillingById(Long id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing record not found with id: " + id));
        return convertToDTO(billing);
    }

    @Override
    public List<BillingDTO> getBillingsByUserId(Long userId) {
        return billingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BillingDTO createBilling(Billing billing) {
        if (billing.getBillingDate() == null) {
            billing.setBillingDate(LocalDate.now());
        }
        if (billing.getStatus() == null) {
            billing.setStatus("UNPAID");
        }
        Billing saved = billingRepository.save(billing);
        return convertToDTO(saved);
    }

    @Override
    public BillingDTO generateInvoiceForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        Long eqId = booking.getEquipmentId() != null ? booking.getEquipmentId() : booking.getResourceId();
        Equipment equipment = equipmentRepository.findById(eqId != null ? eqId.intValue() : 1)
                .orElse(null);

        User user = userRepository.findById(booking.getUserId() != null ? booking.getUserId().intValue() : 1)
                .orElse(null);

        long minutes = 120; // Default 2 hours if time range not given
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            minutes = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
        }

        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        BigDecimal baseRate = BigDecimal.valueOf(50.00); // Standard rate per hour
        BigDecimal totalCost = hours.multiply(baseRate).setScale(2, RoundingMode.HALF_UP);

        Billing billing = new Billing();
        billing.setBookingId(bookingId);
        billing.setEquipmentId(eqId);
        billing.setUserId(booking.getUserId());
        billing.setHoursUsed(hours);
        billing.setHourlyRate(baseRate);
        billing.setTotalCost(totalCost);
        billing.setBillingDate(LocalDate.now());
        billing.setStatus("UNPAID");

        if (equipment != null) {
            billing.setOwnerInstitutionId(equipment.getInstitutionId());
        }
        if (user != null) {
            billing.setRequesterInstitutionId(1); // Default primary institution
        }

        Billing saved = billingRepository.save(billing);
        return convertToDTO(saved);
    }

    @Override
    public BillingDTO updatePaymentStatus(Long id, String status, String paymentReference) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing not found: " + id));

        billing.setStatus(status);
        if (paymentReference != null && !paymentReference.isBlank()) {
            billing.setPaymentReference(paymentReference);
        }
        Billing updated = billingRepository.save(billing);
        return convertToDTO(updated);
    }

    @Override
    public void deleteBilling(Long id) {
        billingRepository.deleteById(id);
    }

    private BillingDTO convertToDTO(Billing billing) {
        BillingDTO dto = new BillingDTO();
        dto.setId(billing.getId());
        dto.setBookingId(billing.getBookingId());
        dto.setEquipmentId(billing.getEquipmentId());
        dto.setUserId(billing.getUserId());
        dto.setRequesterInstitutionId(billing.getRequesterInstitutionId());
        dto.setOwnerInstitutionId(billing.getOwnerInstitutionId());
        dto.setHoursUsed(billing.getHoursUsed());
        dto.setHourlyRate(billing.getHourlyRate());
        dto.setTotalCost(billing.getTotalCost());
        dto.setBillingDate(billing.getBillingDate());
        dto.setStatus(billing.getStatus());
        dto.setPaymentReference(billing.getPaymentReference());
        dto.setCreatedAt(billing.getCreatedAt());

        if (billing.getEquipmentId() != null) {
            equipmentRepository.findById(billing.getEquipmentId().intValue())
                    .ifPresent(e -> dto.setEquipmentName(e.getEquipmentName()));
        }

        if (billing.getUserId() != null) {
            userRepository.findById(billing.getUserId().intValue())
                    .ifPresent(u -> dto.setUserName(u.getName()));
        }

        if (billing.getOwnerInstitutionId() != null) {
            institutionRepository.findById(billing.getOwnerInstitutionId())
                    .ifPresent(i -> dto.setOwnerInstitutionName(i.getInstitutionName()));
        }

        if (billing.getRequesterInstitutionId() != null) {
            institutionRepository.findById(billing.getRequesterInstitutionId())
                    .ifPresent(i -> dto.setRequesterInstitutionName(i.getInstitutionName()));
        }

        return dto;
    }
}
