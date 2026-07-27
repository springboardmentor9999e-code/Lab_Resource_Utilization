package com.labresource.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Proposes a sharing agreement. The proposing user's institution is always the borrower
 * ({@code fromInstitution}); only the owning side is named here, so nobody can draft an
 * agreement granting themselves access to a third party's equipment.
 */
@Data
public class SharingAgreementCreate {

    @NotNull(message = "The partner institution is required")
    private Long toInstitutionId;

    @NotBlank(message = "A title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    /** Optional — omit for an open-ended agreement. */
    private LocalDate endDate;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%")
    private BigDecimal discountPercent;

    @Min(value = 1, message = "Monthly hour cap must be at least 1 hour")
    private Integer maxHoursPerMonth;

    private Boolean autoApprove;

    @Size(max = 5000, message = "Terms must be at most 5000 characters")
    private String terms;
}
