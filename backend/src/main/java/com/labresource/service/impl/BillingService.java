package com.labresource.service.impl;

import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Cost tracking & inter-institution billing:
 *  - usage cost per equipment  = booked hours x hourlyRate
 *  - maintenance cost          = completed work order costs
 *  - invoices                  = generated from APPROVED sharing requests with a fee
 */
@Service
@RequiredArgsConstructor
public class BillingService {

    private static final Set<String> MANAGER_AUTHORITIES = Set.of(
            "ROLE_" + Roles.SYSTEM_ADMIN, "ROLE_" + Roles.INSTITUTION_ADMIN,
            "ROLE_" + Roles.DEPARTMENT_HEAD, "ROLE_" + Roles.LAB_MANAGER);

    private final DepartmentRepository departmentRepository;
    private final DepartmentChargeRepository departmentChargeRepository;
    private final InvoiceRepository invoiceRepository;
    private final SharingRequestRepository sharingRequestRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UtilizationBookingRepository utilizationBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    // ------------------------------------------------------------------
    // Cost analysis
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEquipmentCosts(int days) {
        LocalDate from = LocalDate.now().minusDays(days);
        LocalDateTime fromDateTime = from.atStartOfDay();

        // Booked minutes per equipment over the window
        List<Booking> bookings = utilizationBookingRepository.findInWindow(
                from, LocalDate.now(), List.of("CONFIRMED", "APPROVED", "IN_USE", "COMPLETED"));
        Map<Long, Long> minutesByEquipment = new HashMap<>();
        for (Booking b : bookings) {
            long minutes = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
            minutesByEquipment.merge(b.getEquipment().getEquipmentId(), minutes, Long::sum);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Equipment eq : equipmentRepository.findAll()) {
            long minutes = minutesByEquipment.getOrDefault(eq.getEquipmentId(), 0L);
            double hours = Math.round(minutes / 60.0 * 100) / 100.0;

            BigDecimal rate = eq.getHourlyRate() != null ? eq.getHourlyRate() : BigDecimal.ZERO;
            BigDecimal usageCost = rate.multiply(BigDecimal.valueOf(minutes))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal maintenanceCost = maintenanceRequestRepository
                    .sumCompletedCostForEquipmentSince(eq.getEquipmentId(), fromDateTime);

            BigDecimal cost = eq.getCost() != null ? eq.getCost() : BigDecimal.ZERO;
            BigDecimal netReturn = usageCost.subtract(maintenanceCost);
            double roiPercent = cost.signum() > 0 
                    ? netReturn.multiply(BigDecimal.valueOf(100)).divide(cost, 2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            LocalDate today = LocalDate.now();
            LocalDate pDate = eq.getPurchaseDate() != null ? eq.getPurchaseDate() : today.minusYears(1);
            long daysOld = java.time.temporal.ChronoUnit.DAYS.between(pDate, today);
            double ageInYears = Math.max(0.1, Math.round(daysOld / 365.25 * 10.0) / 10.0);

            // 8-year useful life depreciation
            double depFraction = Math.min(1.0, ageInYears / 8.0);
            BigDecimal currentBookValue = cost.multiply(BigDecimal.valueOf(1.0 - depFraction)).setScale(2, RoundingMode.HALF_UP);

            String warrantyStatus = "NONE";
            if (eq.getWarrantyExpiry() != null) {
                warrantyStatus = eq.getWarrantyExpiry().isBefore(today) ? "EXPIRED" : "ACTIVE";
            }

            String lifecyclePhase;
            if (ageInYears < 2.0) {
                lifecyclePhase = "OPTIMAL";
            } else if (ageInYears < 5.0) {
                lifecyclePhase = "STABLE";
            } else if (ageInYears < 8.0) {
                lifecyclePhase = "MAINTENANCE_WATCH";
            } else {
                lifecyclePhase = "REPLACEMENT_DUE";
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("equipmentId", eq.getEquipmentId());
            row.put("equipmentName", eq.getEquipmentName());
            row.put("equipmentCode", eq.getEquipmentCode());
            row.put("category", eq.getCategory());
            row.put("departmentName", eq.getDepartment() != null ? eq.getDepartment().getName() : "—");
            row.put("acquisitionCost", cost);
            row.put("hourlyRate", eq.getHourlyRate());
            row.put("usageHours", hours);
            row.put("usageCost", usageCost);
            row.put("maintenanceCost", maintenanceCost);
            row.put("totalOperatingCost", usageCost.add(maintenanceCost));
            row.put("netReturn", netReturn);
            row.put("roiPercent", roiPercent);
            row.put("purchaseDate", eq.getPurchaseDate());
            row.put("warrantyExpiry", eq.getWarrantyExpiry());
            row.put("warrantyStatus", warrantyStatus);
            row.put("ageInYears", ageInYears);
            row.put("currentBookValue", currentBookValue);
            row.put("lifecyclePhase", lifecyclePhase);
            rows.add(row);
        }
        rows.sort((a, b) -> ((BigDecimal) b.get("totalOperatingCost"))
                .compareTo((BigDecimal) a.get("totalOperatingCost")));
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDepartmentCosts(int days) {
        Map<Long, Department> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, d -> d, (a, b) -> a));

        Map<String, Map<String, Object>> byDept = new LinkedHashMap<>();
        for (Map<String, Object> row : getEquipmentCosts(days)) {
            String dept = (String) row.get("departmentName");
            Map<String, Object> agg = byDept.computeIfAbsent(dept, d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("departmentName", d);
                m.put("equipmentCount", 0);
                m.put("usageHours", 0.0);
                m.put("usageCost", BigDecimal.ZERO);
                m.put("maintenanceCost", BigDecimal.ZERO);
                m.put("totalOperatingCost", BigDecimal.ZERO);
                
                // Find matching department entity for budget
                Department dEnt = deptMap.values().stream()
                        .filter(deptEntity -> deptEntity.getName().equalsIgnoreCase(d))
                        .findFirst().orElse(null);

                // Null when the department has no budget on record. Do not substitute a
                // figure here: an invented budget produces an invented utilization
                // percentage, and a report that looks authoritative while being fictional
                // is worse than one that says the number is missing.
                m.put("departmentId", dEnt != null ? dEnt.getDepartmentId() : null);
                m.put("annualBudget", dEnt != null ? dEnt.getAnnualBudget() : null);
                return m;
            });
            agg.put("equipmentCount", (int) agg.get("equipmentCount") + 1);
            agg.put("usageHours", Math.round(((double) agg.get("usageHours")
                    + (double) row.get("usageHours")) * 100) / 100.0);
            agg.put("usageCost", ((BigDecimal) agg.get("usageCost")).add((BigDecimal) row.get("usageCost")));
            agg.put("maintenanceCost", ((BigDecimal) agg.get("maintenanceCost")).add((BigDecimal) row.get("maintenanceCost")));
            agg.put("totalOperatingCost", ((BigDecimal) agg.get("totalOperatingCost")).add((BigDecimal) row.get("totalOperatingCost")));
        }

        for (Map<String, Object> m : byDept.values()) {
            BigDecimal budget = (BigDecimal) m.get("annualBudget");
            BigDecimal totalOp = (BigDecimal) m.get("totalOperatingCost");
            // Both stay null when no budget is set, so the UI can print "not set" rather
            // than "0% used" — which reads as healthy when in fact nothing is tracked.
            boolean tracked = budget != null && budget.signum() > 0;
            m.put("budgetUtilizedPercent", tracked
                    ? totalOp.multiply(BigDecimal.valueOf(100))
                            .divide(budget, 1, RoundingMode.HALF_UP).doubleValue()
                    : null);
            m.put("remainingBudget", tracked ? budget.subtract(totalOp) : null);
        }
        return new ArrayList<>(byDept.values());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDepartmentCharges(Long departmentId, int days) {
        LocalDate from = LocalDate.now().minusDays(days);
        LocalDate to = LocalDate.now();
        List<DepartmentCharge> charges = departmentChargeRepository
                .findByDepartment_DepartmentIdAndChargeDateBetweenOrderByChargeDateDescChargeIdDesc(departmentId, from, to);
        
        List<Map<String, Object>> list = new ArrayList<>();
        for (DepartmentCharge c : charges) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("chargeId", c.getChargeId());
            m.put("equipmentName", c.getEquipment() != null ? c.getEquipment().getEquipmentName() : "N/A");
            m.put("chargeType", c.getChargeType());
            m.put("amount", c.getAmount());
            m.put("hours", c.getHours());
            m.put("chargeDate", c.getChargeDate());
            m.put("description", c.getDescription());
            list.add(m);
        }
        return list;
    }

    // ------------------------------------------------------------------
    // Invoices
    // ------------------------------------------------------------------

    @Transactional
    public Map<String, Object> generateInvoiceFromSharing(Long sharingRequestId, String username) {
        AppUser issuer = requireUser(username);
        SharingRequest request = sharingRequestRepository.findById(sharingRequestId)
                .orElseThrow(() -> new RuntimeException("Sharing request not found"));

        if (!"APPROVED".equals(request.getStatus()) && !"COMPLETED".equals(request.getStatus())) {
            throw new RuntimeException("Only approved or completed sharing requests can be invoiced");
        }
        if (request.getEstimatedFee() == null || request.getEstimatedFee().signum() <= 0) {
            throw new RuntimeException("This sharing request has no usage fee — nothing to invoice");
        }
        // The issuer must belong to the equipment-owning institution
        if (!issuer.getInstitution().getInstitutionId()
                .equals(request.getToInstitution().getInstitutionId())) {
            throw new RuntimeException("Only the equipment-owning institution can issue this invoice");
        }
        if (invoiceRepository.existsBySharingRequest_SharingRequestId(sharingRequestId)) {
            throw new RuntimeException("An invoice already exists for this sharing request");
        }

        Invoice invoice = invoiceRepository.save(Invoice.builder()
                .sharingRequest(request)
                .fromInstitution(request.getToInstitution())   // owner bills
                .toInstitution(request.getFromInstitution())   // requester pays
                .amount(request.getEstimatedFee())
                .description("Usage fee for " + request.getEquipment().getEquipmentName()
                        + " on " + request.getRequestedDate()
                        + " (" + request.getStartTime() + " - " + request.getEndTime() + ")"
                        + (request.getHourlyRate() != null
                            ? " @ " + request.getHourlyRate() + "/hr" : ""))
                .createdBy(issuer)
                .build());

        invoice.setInvoiceNumber(String.format("INV-%d-%04d",
                invoice.getIssuedDate().getYear(), invoice.getInvoiceId()));
        invoice = invoiceRepository.save(invoice);

        notificationService.notify(request.getRequestedBy(), "BILLING",
                "Invoice Issued — " + invoice.getInvoiceNumber(),
                "An invoice of " + invoice.getAmount() + " has been issued to "
                        + invoice.getToInstitution().getName() + " for your shared usage of "
                        + request.getEquipment().getEquipmentName() + ". Due "
                        + invoice.getDueDate() + ".",
                "/dashboard/billing");

        return mapInvoice(invoice);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOutgoingInvoices(String username) {
        Long institutionId = requireUser(username).getInstitution().getInstitutionId();
        return invoiceRepository.findByFromInstitution_InstitutionIdOrderByCreatedAtDesc(institutionId)
                .stream().map(this::mapInvoice).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getIncomingInvoices(String username) {
        Long institutionId = requireUser(username).getInstitution().getInstitutionId();
        return invoiceRepository.findByToInstitution_InstitutionIdOrderByCreatedAtDesc(institutionId)
                .stream().map(this::mapInvoice).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> updateInvoiceStatus(Long invoiceId, String status, String username) {
        AppUser caller = requireUser(username);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        String newStatus = status == null ? "" : status.trim().toUpperCase();
        if (!Set.of("PAID", "CANCELLED").contains(newStatus)) {
            throw new RuntimeException("Invoice status can only be changed to PAID or CANCELLED");
        }
        if (!"PENDING".equals(invoice.getStatus())) {
            throw new RuntimeException("Only pending invoices can be updated");
        }

        Long callerInstitution = caller.getInstitution().getInstitutionId();
        boolean isIssuer = callerInstitution.equals(invoice.getFromInstitution().getInstitutionId());
        boolean isPayer = callerInstitution.equals(invoice.getToInstitution().getInstitutionId());
        if (!hasManagerAuthority() || (!isIssuer && !isPayer)) {
            throw new RuntimeException("Only managers of the involved institutions can update this invoice");
        }
        if ("CANCELLED".equals(newStatus) && !isIssuer) {
            throw new RuntimeException("Only the issuing institution can cancel an invoice");
        }

        invoice.setStatus(newStatus);
        if ("PAID".equals(newStatus)) {
            invoice.setPaidDate(LocalDate.now());
        }
        return mapInvoice(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBillingSummary(String username, int days) {
        Long institutionId = requireUser(username).getInstitution().getInstitutionId();
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("receivablePending", invoiceRepository.sumByFromInstitutionAndStatus(institutionId, "PENDING"));
        summary.put("receivedPaid", invoiceRepository.sumByFromInstitutionAndStatus(institutionId, "PAID"));
        summary.put("payablePending", invoiceRepository.sumByToInstitutionAndStatus(institutionId, "PENDING"));
        summary.put("paidOut", invoiceRepository.sumByToInstitutionAndStatus(institutionId, "PAID"));
        summary.put("maintenanceCost", maintenanceRequestRepository.sumCompletedCostSince(since));
        BigDecimal totalUsageCost = getEquipmentCosts(days).stream()
                .map(r -> (BigDecimal) r.get("usageCost"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("usageCost", totalUsageCost);
        summary.put("windowDays", days);
        return summary;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private AppUser requireUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean hasManagerAuthority() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().map(Object::toString).anyMatch(MANAGER_AUTHORITIES::contains);
    }

    private Map<String, Object> mapInvoice(Invoice i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("invoiceId", i.getInvoiceId());
        m.put("invoiceNumber", i.getInvoiceNumber());
        m.put("sharingRequestId", i.getSharingRequest() != null
                ? i.getSharingRequest().getSharingRequestId() : null);
        m.put("equipmentName", i.getSharingRequest() != null
                ? i.getSharingRequest().getEquipment().getEquipmentName() : null);
        m.put("fromInstitutionId", i.getFromInstitution().getInstitutionId());
        m.put("fromInstitutionName", i.getFromInstitution().getName());
        m.put("toInstitutionId", i.getToInstitution().getInstitutionId());
        m.put("toInstitutionName", i.getToInstitution().getName());
        m.put("amount", i.getAmount());
        m.put("status", i.getStatus());
        m.put("issuedDate", i.getIssuedDate());
        m.put("dueDate", i.getDueDate());
        m.put("paidDate", i.getPaidDate());
        m.put("description", i.getDescription());
        m.put("createdByName", i.getCreatedBy().getFirstName() + " " + i.getCreatedBy().getLastName());
        return m;
    }
}
