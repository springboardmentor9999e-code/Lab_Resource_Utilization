package com.labresource.backend.service.impl;

import com.labresource.backend.dto.BillingResponse;
import com.labresource.backend.dto.BillingSummaryResponse;
import com.labresource.backend.dto.DepartmentCostResponse;
import com.labresource.backend.repository.BillingRepository;
import com.labresource.backend.repository.UserRepository;
import com.labresource.backend.service.BillingService;
import com.labresource.backend.entity.Booking;
//import java.time.LocalDate;
import org.springframework.stereotype.Service;
import com.labresource.backend.entity.Billing;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.Authentication;
import com.labresource.backend.entity.User;

@Service
public class BillingServiceImpl implements BillingService {

    private final BillingRepository billingRepository;
    private final UserRepository userRepository;
    public BillingServiceImpl(
        BillingRepository billingRepository,
        UserRepository userRepository) {

    this.billingRepository = billingRepository;
    this.userRepository = userRepository;
}

    @Override
    public BillingSummaryResponse getBillingSummary() {

        List<Billing> billingList = billingRepository.findAll();

        double totalRevenue = billingList.stream()
                .mapToDouble(Billing::getTotalCost)
                .sum();

        long totalInvoices = billingList.size();

        long pendingPayments = billingList.stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getPaymentStatus()))
                .count();

        long paidInvoices = billingList.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getPaymentStatus()))
                .count();

        double averageInvoiceValue = 0;

        if (!billingList.isEmpty()) {

            averageInvoiceValue = totalRevenue / totalInvoices;

        }

        return new BillingSummaryResponse(

                totalRevenue,

                totalInvoices,

                pendingPayments,

                paidInvoices,

                averageInvoiceValue

        );

    }

    @Override
    public List<BillingResponse> getAllBilling() {

        List<BillingResponse> response = new ArrayList<>();

        List<Billing> billingList = billingRepository.findAll();

        for (Billing billing : billingList) {

            BillingResponse dto = new BillingResponse();

            dto.setBillingId(billing.getBillingId());

            if (billing.getBooking() != null) {

                Booking booking = billing.getBooking();

                dto.setBookingId(booking.getBookingId());

                if (booking.getUser() != null) {

                    dto.setDepartmentName(
                            booking.getUser().getDepartment()
                    );

                }

                if (booking.getLaboratory() != null) {

                    dto.setLaboratoryName(
                            booking.getLaboratory().getLabName()
                    );

                }

                if (booking.getEquipment() != null) {

                    dto.setEquipmentName(
                            booking.getEquipment().getEquipmentName()
                    );

                }

            }

            if (billing.getInstitution() != null) {

                dto.setInstitutionName(
                        billing.getInstitution().getInstitutionName()
                );

            }

            dto.setEquipmentCost(billing.getEquipmentCost());

            dto.setLaboratoryCost(billing.getLaboratoryCost());

            dto.setTotalCost(billing.getTotalCost());

            dto.setPaymentStatus(billing.getPaymentStatus());

            if (billing.getGeneratedDate() != null) {

                dto.setGeneratedDate(
                        billing.getGeneratedDate().toString()
                );

            }

            response.add(dto);

        }

        return response;

    }

    @Override
    public List<DepartmentCostResponse> getDepartmentWiseCost() {

        List<Object[]> rows = billingRepository.getDepartmentWiseCost();

        List<DepartmentCostResponse> result = new ArrayList<>();

        for (Object[] row : rows) {

            DepartmentCostResponse dto = new DepartmentCostResponse();

            dto.setDepartmentName((String) row[0]);

            dto.setTotalBookings(
                    ((Number) row[1]).longValue()
            );

            dto.setTotalCost(
                    ((Number) row[2]).doubleValue()
            );
            result.add(dto);
        }

        return result;
    }

    @Override
public Billing markAsPaid(Long billingId) {

    Billing billing = billingRepository.findById(billingId)
            .orElseThrow(() ->
                    new RuntimeException("Billing not found"));

    billing.setPaymentStatus("PAID");

    return billingRepository.save(billing);
}

@Override
public List<BillingResponse> getMyBilling(Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    List<Billing> billings =
            billingRepository.findByDepartmentHeadUserId(user.getUserId());

    return convertToBillingResponse(billings);
}

@Override
public List<BillingResponse> getDepartmentBilling(Long userId) {

    List<Billing> billings =
            billingRepository.findByDepartmentHeadUserId(userId);

    return convertToBillingResponse(billings);
}

@Override
public List<BillingResponse> getInstitutionBilling(Long institutionId) {

    List<Billing> billings =
            billingRepository.findByInstitutionInstitutionId(institutionId);

    return convertToBillingResponse(billings);
}

private List<BillingResponse> convertToBillingResponse(
        List<Billing> billingList) {

    List<BillingResponse> response = new ArrayList<>();

    for (Billing billing : billingList) {

        BillingResponse dto = new BillingResponse();

        dto.setBillingId(billing.getBillingId());

        if (billing.getBooking() != null) {

            Booking booking = billing.getBooking();

            dto.setBookingId(booking.getBookingId());

            if (booking.getUser() != null) {
                dto.setDepartmentName(
                        booking.getUser().getDepartment());
            }

            if (booking.getLaboratory() != null) {
                dto.setLaboratoryName(
                        booking.getLaboratory().getLabName());
            }

            if (booking.getEquipment() != null) {
                dto.setEquipmentName(
                        booking.getEquipment().getEquipmentName());
            }
        }

        if (billing.getInstitution() != null) {
            dto.setInstitutionName(
                    billing.getInstitution().getInstitutionName());
        }

        dto.setEquipmentCost(billing.getEquipmentCost());
        dto.setLaboratoryCost(billing.getLaboratoryCost());
        dto.setTotalCost(billing.getTotalCost());
        dto.setPaymentStatus(billing.getPaymentStatus());

        if (billing.getGeneratedDate() != null) {
            dto.setGeneratedDate(
                    billing.getGeneratedDate().toString());
        }

        response.add(dto);
    }

    return response;
}

}