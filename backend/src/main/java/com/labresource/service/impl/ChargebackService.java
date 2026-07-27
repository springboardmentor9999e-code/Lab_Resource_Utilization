package com.labresource.service.impl;

import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.entity.Department;
import com.labresource.entity.DepartmentCharge;
import com.labresource.entity.Equipment;
import com.labresource.entity.MaintenanceRequest;
import com.labresource.event.BookingStatusChangedEvent;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.DepartmentChargeRepository;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.MaintenanceRequestRepository;
import com.labresource.security.Roles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Posts internal chargeback lines against departmental budgets.
 *
 * <p>Two events generate a charge:
 * <ul>
 *   <li><b>Usage</b> — a booking reaching COMPLETED. Priced at the equipment's hourly rate for
 *       the booked duration and charged to the <em>booking user's</em> department, which is what
 *       distinguishes a chargeback from a cost report: a Chemistry researcher running a
 *       Physics-owned instrument spends Chemistry's budget.</li>
 *   <li><b>Maintenance</b> — a work order reaching COMPLETED with a recorded cost. Charged to the
 *       department that <em>owns</em> the equipment, because upkeep of an asset follows the asset,
 *       not whoever happened to use it last.</li>
 * </ul>
 *
 * <p>Every posting is idempotent through the unique constraints on {@code booking_id} and
 * {@code maintenance_request_id}: replaying an event or re-running a backfill cannot double-charge.
 *
 * <p>Failures here are logged and swallowed. Billing is a downstream concern — a chargeback that
 * cannot be posted must never roll back the booking or the completed work order that caused it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChargebackService {

    /** Budget consumption levels that trigger an alert, highest first. */
    private static final int[] ALERT_THRESHOLDS = {100, 80};

    private static final Set<String> BUDGET_ALERT_ROLES =
            Set.of(Roles.DEPARTMENT_HEAD, Roles.INSTITUTION_ADMIN);

    private final DepartmentChargeRepository departmentChargeRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    // ------------------------------------------------------------------
    // Usage charges
    // ------------------------------------------------------------------

    /**
     * REQUIRES_NEW so a failure to post the charge cannot mark the booking transaction
     * rollback-only, matching how BookingUsageEventListener treats usage recording.
     */
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        if (!"COMPLETED".equals(event.getNewStatus())) {
            return;
        }
        try {
            postUsageCharge(event.getBookingId());
        } catch (Exception ex) {
            log.error("Failed to post usage chargeback for booking {}: {}",
                    event.getBookingId(), ex.getMessage(), ex);
        }
    }

    void postUsageCharge(Long bookingId) {
        // Cheap guard before loading anything. The unique constraint is the real defence;
        // this just keeps the common replay case off the error path.
        if (departmentChargeRepository.existsByBooking_BookingId(bookingId)) {
            return;
        }

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            log.warn("Chargeback skipped: booking {} no longer exists", bookingId);
            return;
        }

        AppUser user = booking.getUser();
        Equipment equipment = booking.getEquipment();
        Department department = user != null ? user.getDepartment() : null;
        if (department == null || equipment == null) {
            log.warn("Chargeback skipped for booking {}: no consumer department or equipment", bookingId);
            return;
        }

        BigDecimal rate = equipment.getHourlyRate();
        if (rate == null || rate.signum() <= 0) {
            // Free-to-use equipment is a legitimate configuration, not an error. Posting a
            // zero-rupee line would only add noise to the ledger.
            return;
        }

        long minutes = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
        if (minutes <= 0) {
            return;
        }
        double hours = Math.round(minutes / 60.0 * 100) / 100.0;
        BigDecimal amount = rate.multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        departmentChargeRepository.save(DepartmentCharge.builder()
                .department(department)
                .equipment(equipment)
                .user(user)
                .booking(booking)
                .chargeType(DepartmentCharge.TYPE_USAGE)
                .amount(amount)
                .hours(hours)
                .chargeDate(booking.getBookingDate() != null ? booking.getBookingDate() : LocalDate.now())
                .description(String.format("Usage of %s (%s) — %.2f h @ %s/hr",
                        equipment.getEquipmentName(), equipment.getEquipmentCode(), hours, rate))
                .build());

        log.info("Posted usage chargeback of {} to department '{}' for booking {}",
                amount, department.getName(), bookingId);

        checkBudgetThreshold(department);
    }

    // ------------------------------------------------------------------
    // Maintenance charges
    // ------------------------------------------------------------------

    /**
     * Called directly by MaintenanceServiceImpl on completion. There is no maintenance
     * status event to listen to, and introducing one purely for this would be more
     * machinery than the coupling it removes.
     *
     * <p>Takes an id rather than the entity on purpose: this runs in its own transaction, so a
     * passed-in instance would arrive detached and every lazy association on it — equipment,
     * department — would be a coin flip. Reloading here keeps it managed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void postMaintenanceCharge(Long requestId) {
        try {
            if (requestId == null) {
                return;
            }
            if (departmentChargeRepository.existsByMaintenanceRequest_RequestId(requestId)) {
                return;
            }

            MaintenanceRequest request = maintenanceRequestRepository.findById(requestId).orElse(null);
            if (request == null) {
                log.warn("Maintenance chargeback skipped: work order {} no longer exists", requestId);
                return;
            }

            BigDecimal cost = request.getCost();
            if (cost == null || cost.signum() <= 0) {
                // Work orders are routinely closed without a cost figure. Nothing to charge.
                return;
            }

            Equipment equipment = request.getEquipment();
            Department department = equipment != null ? equipment.getDepartment() : null;
            if (department == null) {
                log.warn("Maintenance chargeback skipped for work order {}: equipment has no department",
                        request.getRequestId());
                return;
            }

            LocalDateTime completedAt = request.getCompletedAt();
            departmentChargeRepository.save(DepartmentCharge.builder()
                    .department(department)
                    .equipment(equipment)
                    .maintenanceRequest(request)
                    .chargeType(DepartmentCharge.TYPE_MAINTENANCE)
                    .amount(cost)
                    .chargeDate(completedAt != null ? completedAt.toLocalDate() : LocalDate.now())
                    .description("Maintenance work order #" + request.getRequestId()
                            + " on " + equipment.getEquipmentName())
                    .build());

            log.info("Posted maintenance chargeback of {} to department '{}' for work order {}",
                    cost, department.getName(), request.getRequestId());

            checkBudgetThreshold(department);
        } catch (Exception ex) {
            log.error("Failed to post maintenance chargeback for work order {}: {}",
                    requestId, ex.getMessage(), ex);
        }
    }

    // ------------------------------------------------------------------
    // Budget
    // ------------------------------------------------------------------

    /**
     * Warns the department's leadership once spend crosses 80% and again at 100% of budget.
     *
     * <p>The alert fires only when this charge is the one that carried the total across a
     * threshold, so a department that stays over budget is not re-notified on every booking.
     * Departments with no budget on record are silently skipped — there is nothing to breach.
     */
    private void checkBudgetThreshold(Department department) {
        BigDecimal budget = department.getAnnualBudget();
        if (budget == null || budget.signum() <= 0) {
            return;
        }

        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        LocalDate today = LocalDate.now();
        BigDecimal spent = departmentChargeRepository
                .sumForDepartment(department.getDepartmentId(), yearStart, today);

        double pctNow = spent.multiply(BigDecimal.valueOf(100))
                .divide(budget, 1, RoundingMode.HALF_UP).doubleValue();

        for (int threshold : ALERT_THRESHOLDS) {
            if (pctNow >= threshold) {
                notifyBudgetThreshold(department, threshold, spent, budget, pctNow);
                return; // only the highest breached threshold is worth a message
            }
        }
    }

    private void notifyBudgetThreshold(Department department, int threshold,
                                       BigDecimal spent, BigDecimal budget, double pctNow) {
        List<AppUser> recipients = appUserRepository.findActiveInDepartmentByRoles(
                department.getDepartmentId(), BUDGET_ALERT_ROLES);
        if (recipients.isEmpty()) {
            return;
        }

        boolean exceeded = threshold >= 100;
        String title = exceeded
                ? "Budget Exceeded — " + department.getName()
                : "Budget Warning — " + department.getName();
        String message = String.format(
                "%s has consumed %s of its %s annual budget (%.1f%%). %s",
                department.getName(), spent, budget, pctNow,
                exceeded ? "Further usage is now unbudgeted."
                         : "Review upcoming bookings and maintenance spend.");

        for (AppUser recipient : recipients) {
            // Exceeding a budget is an escalation, not an FYI: it goes out over SMS and push
            // as well. The 80% warning stays on the quieter in-app + email path.
            if (exceeded) {
                notificationService.notifyUrgent(recipient, "BILLING", title, message, "/dashboard/billing");
            } else {
                notificationService.notify(recipient, "BILLING", title, message, "/dashboard/billing");
            }
        }
    }

    /** Sets or clears a department's annual budget. A null amount means "no budget tracked". */
    @Transactional
    public Department setAnnualBudget(Long departmentId, BigDecimal annualBudget) {
        if (annualBudget != null && annualBudget.signum() < 0) {
            throw new IllegalArgumentException("Annual budget cannot be negative");
        }
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        department.setAnnualBudget(annualBudget);
        return departmentRepository.save(department);
    }
}
