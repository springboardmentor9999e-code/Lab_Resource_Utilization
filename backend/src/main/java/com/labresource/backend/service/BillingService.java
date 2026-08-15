package com.labresource.backend.service;

import com.labresource.backend.dto.BillingResponse;
import com.labresource.backend.dto.BillingSummaryResponse;
import com.labresource.backend.dto.DepartmentCostResponse;
import com.labresource.backend.entity.Billing;
import org.springframework.security.core.Authentication;
import java.util.List;

public interface BillingService {

    BillingSummaryResponse getBillingSummary();

    List<BillingResponse> getAllBilling();

    List<DepartmentCostResponse> getDepartmentWiseCost();

    Billing markAsPaid(Long billingId);
    // Student / Faculty
    List<BillingResponse> getMyBilling(Authentication authentication);
    // Department Head
    List<BillingResponse> getDepartmentBilling(Long userId);

    // Institute Admin
    List<BillingResponse> getInstitutionBilling(Long institutionId);

}