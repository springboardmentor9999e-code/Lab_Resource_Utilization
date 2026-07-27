package com.labresource.service.impl;

import com.labresource.dto.request.SharingAgreementCreate;
import com.labresource.dto.request.SharingRequestCreate;
import com.labresource.dto.response.PartnershipReportResponse;
import com.labresource.dto.response.SharedEquipmentResponse;
import com.labresource.dto.response.SharingAgreementResponse;
import com.labresource.dto.response.SharingRequestResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.SharingAgreement;
import com.labresource.entity.SharingRequest;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.SharedEquipmentRepository;
import com.labresource.repository.SharingAgreementRepository;
import com.labresource.repository.SharingRequestRepository;
import com.labresource.security.Roles;
import com.labresource.service.interfaces.SharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharingServiceImpl implements SharingService {

    private static final Set<String> APPROVER_ROLES = Set.of(
            Roles.SYSTEM_ADMIN, Roles.INSTITUTION_ADMIN, Roles.DEPARTMENT_HEAD, Roles.LAB_MANAGER
    );

    private final SharingRequestRepository sharingRequestRepository;
    private final SharingAgreementRepository sharingAgreementRepository;
    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final BookingRepository bookingRepository;
    private final com.labresource.repository.BookingHistoryRepository bookingHistoryRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // ------------------------------------------------------------------
    // Discovery
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<SharedEquipmentResponse> discoverShareableEquipment(String username, String search, String category) {
        AppUser user = requireUser(username);
        Long institutionId = user.getInstitution().getInstitutionId();

        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        String normalizedCategory = (category == null || category.isBlank()) ? null : category.trim();

        return sharedEquipmentRepository
                .findShareableForInstitution(institutionId, normalizedSearch, normalizedCategory)
                .stream()
                .map(this::mapToSharedEquipment)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Request lifecycle
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public SharingRequestResponse createRequest(String username, SharingRequestCreate request) {
        AppUser requester = requireUser(username);

        Equipment equipment = sharedEquipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (!Boolean.TRUE.equals(equipment.getIsShareable())) {
            throw new RuntimeException("This equipment is not listed for inter-institution sharing");
        }

        Institution ownerInstitution = equipment.getInstitution();
        if (ownerInstitution == null) {
            throw new RuntimeException("Equipment has no owning institution and cannot be shared");
        }

        Institution requesterInstitution = requester.getInstitution();
        if (requesterInstitution.getInstitutionId().equals(ownerInstitution.getInstitutionId())) {
            throw new RuntimeException("Equipment belongs to your own institution — use a regular booking instead");
        }

        if (request.getRequestedDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Requested date cannot be in the past");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        boolean duplicate = sharingRequestRepository.existsPendingDuplicate(
                requester.getUserId(), equipment.getEquipmentId(), request.getRequestedDate());
        if (duplicate) {
            throw new RuntimeException("You already have a pending sharing request for this equipment on the selected date");
        }

        // A standing agreement, if one is live, sets the terms: discounted rate, monthly quota,
        // and whether this can skip manual approval.
        SharingAgreement agreement = sharingAgreementRepository.findEffective(
                requesterInstitution.getInstitutionId(),
                ownerInstitution.getInstitutionId(),
                request.getRequestedDate()).orElse(null);

        double requestedHours = hoursBetween(request.getStartTime(), request.getEndTime());
        if (agreement != null && agreement.getMaxHoursPerMonth() != null) {
            double usedThisMonth = hoursUsedInMonth(agreement, request.getRequestedDate());
            if (usedThisMonth + requestedHours > agreement.getMaxHoursPerMonth()) {
                throw new RuntimeException(String.format(
                        "This request would exceed the agreement's monthly cap of %d hours "
                                + "(%.1f already used, %.1f requested). Ask the partner institution "
                                + "to raise the cap or book a shorter slot.",
                        agreement.getMaxHoursPerMonth(), usedThisMonth, requestedHours));
            }
        }

        BigDecimal discount = agreement == null ? BigDecimal.ZERO : agreement.getDiscountPercent();
        boolean autoApprove = agreement != null && Boolean.TRUE.equals(agreement.getAutoApprove());

        SharingRequest sharingRequest = SharingRequest.builder()
                .equipment(equipment)
                .fromInstitution(requesterInstitution)
                .toInstitution(ownerInstitution)
                .requestedBy(requester)
                .agreement(agreement)
                .purpose(request.getPurpose().trim())
                .requestedDate(request.getRequestedDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("PENDING")
                .hourlyRate(equipment.getHourlyRate())
                .discountPercent(discount)
                .estimatedFee(computeEstimatedFee(
                        equipment, request.getStartTime(), request.getEndTime(), discount))
                .build();

        SharingRequest saved = sharingRequestRepository.save(sharingRequest);

        // Under an auto-approve agreement the booking is created immediately — the agreement is
        // the approval, so queueing for a second human decision would defeat its purpose.
        if (autoApprove) {
            try {
                return grantRequest(saved, null,
                        "Auto-approved under sharing agreement #" + agreement.getAgreementId());
            } catch (RuntimeException ex) {
                // The slot went while we were writing — fall back to a normal pending request
                // rather than failing the whole submission
                saved.setRemarks("Auto-approval could not be applied: " + ex.getMessage());
                saved = sharingRequestRepository.save(saved);
            }
        }

        if (ownerInstitution.getEmail() != null && !ownerInstitution.getEmail().isBlank()) {
            emailService.sendNotificationEmail(
                    ownerInstitution.getEmail(),
                    "New inter-institution sharing request for " + equipment.getEquipmentName(),
                    """
                    A new inter-institution resource sharing request has been submitted.

                    Equipment : %s (%s)
                    Requested by : %s %s (%s)
                    Institution : %s
                    Date : %s
                    Time : %s - %s
                    Purpose : %s

                    Please log in to the Lab Resource Platform to review and approve or reject this request.

                    — Lab Resource Platform
                    """.formatted(
                            equipment.getEquipmentName(), equipment.getEquipmentCode(),
                            requester.getFirstName(), requester.getLastName(), requester.getEmail(),
                            requesterInstitution.getName(),
                            saved.getRequestedDate(),
                            saved.getStartTime(), saved.getEndTime(),
                            saved.getPurpose()
                    )
            );
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SharingRequestResponse> listIncoming(String username) {
        AppUser user = requireUser(username);
        Long institutionId = user.getInstitution().getInstitutionId();
        return sharingRequestRepository
                .findByToInstitution_InstitutionIdOrderByCreatedAtDesc(institutionId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SharingRequestResponse> listOutgoing(String username) {
        AppUser user = requireUser(username);

        if (hasApproverRole(user)) {
            // Managers see all outgoing requests made from their institution
            return sharingRequestRepository
                    .findByFromInstitution_InstitutionIdOrderByCreatedAtDesc(user.getInstitution().getInstitutionId())
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return sharingRequestRepository
                .findByRequestedBy_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SharingRequestResponse approve(Long id, String username, String remarks) {
        AppUser approver = requireUser(username);
        SharingRequest request = requireRequest(id);

        validateApprover(approver, request);

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        return grantRequest(request, approver, trimRemarks(remarks));
    }

    /**
     * Turns an approved sharing request into a real confirmed booking.
     *
     * Shared by the manual approval path and by auto-approval under an agreement, so both produce
     * identical state — one code path means the audit trail cannot diverge between them.
     *
     * @param approver the human who approved, or null when an agreement granted it automatically
     */
    private SharingRequestResponse grantRequest(SharingRequest request, AppUser approver, String remarks) {
        Equipment equipment = request.getEquipment();

        // Verify the requested slot is still free before creating the external booking
        boolean conflict = bookingRepository.hasOverlappingBooking(
                equipment.getEquipmentId(),
                request.getRequestedDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (conflict) {
            throw new RuntimeException("Slot no longer available");
        }

        Booking booking = Booking.builder()
                .user(request.getRequestedBy())
                .equipment(equipment)
                .bookingDate(request.getRequestedDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("CONFIRMED")
                .build();
        bookingRepository.save(booking);

        String changedBy = approver != null ? approver.getUsername() : "system";
        bookingHistoryRepository.save(com.labresource.entity.BookingHistory.builder()
                .booking(booking)
                .oldStatus(null)
                .newStatus("CONFIRMED")
                .changedBy(changedBy)
                .remarks("Created via inter-institution sharing approval (request #"
                        + request.getSharingRequestId() + ")")
                .build());

        equipment.setStatus("RESERVED");
        sharedEquipmentRepository.save(equipment);

        request.setStatus("APPROVED");
        request.setApprovedBy(approver);
        request.setRemarks(remarks);
        SharingRequest saved = sharingRequestRepository.save(request);

        notifyRequesterOutcome(saved, true);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SharingRequestResponse reject(Long id, String username, String remarks) {
        AppUser approver = requireUser(username);
        SharingRequest request = requireRequest(id);

        validateApprover(approver, request);

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        request.setStatus("REJECTED");
        request.setApprovedBy(approver);
        request.setRemarks(trimRemarks(remarks));
        SharingRequest saved = sharingRequestRepository.save(request);

        notifyRequesterOutcome(saved, false);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void cancel(Long id, String username) {
        AppUser user = requireUser(username);
        SharingRequest request = requireRequest(id);

        if (!request.getRequestedBy().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Only the requester can cancel a sharing request");
        }
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }

        request.setStatus("CANCELLED");
        sharingRequestRepository.save(request);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private AppUser requireUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    private SharingRequest requireRequest(Long id) {
        return sharingRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sharing request not found"));
    }

    private boolean hasApproverRole(AppUser user) {
        if (user.getUserRoles() == null) {
            return false;
        }
        return user.getUserRoles().stream()
                .map(ur -> ur.getRole().getRoleName())
                .anyMatch(APPROVER_ROLES::contains);
    }

    private void validateApprover(AppUser approver, SharingRequest request) {
        Long approverInstitutionId = approver.getInstitution().getInstitutionId();
        Long toInstitutionId = request.getToInstitution().getInstitutionId();
        if (!approverInstitutionId.equals(toInstitutionId)) {
            throw new RuntimeException("You can only act on sharing requests addressed to your own institution");
        }
        if (!hasApproverRole(approver)) {
            throw new RuntimeException("You do not have permission to approve or reject sharing requests");
        }
    }

    private String trimRemarks(String remarks) {
        if (remarks == null || remarks.isBlank()) {
            return null;
        }
        String trimmed = remarks.trim();
        return trimmed.length() > 255 ? trimmed.substring(0, 255) : trimmed;
    }

    private void notifyRequesterOutcome(SharingRequest request, boolean approved) {
        AppUser requester = request.getRequestedBy();

        // In-app alert (works even when the user has no email configured)
        notificationService.notifyInApp(
                requester,
                "SHARING",
                approved ? "Sharing Request Approved" : "Sharing Request Rejected",
                "Your request for " + request.getEquipment().getEquipmentName()
                        + " on " + request.getRequestedDate() + " was "
                        + (approved ? "approved — a confirmed booking has been created for you." : "rejected."),
                "/dashboard/sharing");

        if (requester.getEmail() == null || requester.getEmail().isBlank()) {
            return;
        }
        String equipmentName = request.getEquipment().getEquipmentName();
        String subject = approved
                ? "Sharing request approved — " + equipmentName
                : "Sharing request rejected — " + equipmentName;
        String outcomeLine = approved
                ? "Your request has been APPROVED and a confirmed booking has been created for you."
                : "Your request has been REJECTED.";
        String body = """
                Hi %s,

                Your inter-institution sharing request for %s (%s) at %s has been reviewed.

                %s

                Date : %s
                Time : %s - %s
                Remarks : %s

                — Lab Resource Platform
                """.formatted(
                requester.getFirstName(),
                equipmentName, request.getEquipment().getEquipmentCode(),
                request.getToInstitution().getName(),
                outcomeLine,
                request.getRequestedDate(),
                request.getStartTime(), request.getEndTime(),
                request.getRemarks() == null ? "—" : request.getRemarks()
        );
        emailService.sendNotificationEmail(requester.getEmail(), subject, body);
    }

    private SharedEquipmentResponse mapToSharedEquipment(Equipment equipment) {
        String primaryImageUrl = null;
        if (equipment.getImages() != null && !equipment.getImages().isEmpty()) {
            // Images are ordered isPrimary DESC, uploadedAt ASC — first is the primary
            primaryImageUrl = equipment.getImages().get(0).getImageUrl();
        }

        return SharedEquipmentResponse.builder()
                .equipmentId(equipment.getEquipmentId())
                .name(equipment.getEquipmentName())
                .code(equipment.getEquipmentCode())
                .category(equipment.getCategory())
                .manufacturer(equipment.getManufacturer())
                .model(equipment.getModel())
                .status(equipment.getStatus())
                .institutionId(equipment.getInstitution() != null ? equipment.getInstitution().getInstitutionId() : null)
                .institutionName(equipment.getInstitution() != null ? equipment.getInstitution().getName() : null)
                .departmentName(equipment.getDepartment() != null ? equipment.getDepartment().getName() : null)
                .labName(equipment.getLab() != null ? equipment.getLab().getName() : null)
                .primaryImageUrl(primaryImageUrl)
                .hourlyRate(equipment.getHourlyRate())
                .build();
    }

    private SharingRequestResponse mapToResponse(SharingRequest request) {
        AppUser requester = request.getRequestedBy();
        AppUser approver = request.getApprovedBy();

        return SharingRequestResponse.builder()
                .sharingRequestId(request.getSharingRequestId())
                .equipmentId(request.getEquipment().getEquipmentId())
                .equipmentName(request.getEquipment().getEquipmentName())
                .equipmentCode(request.getEquipment().getEquipmentCode())
                .equipmentCategory(request.getEquipment().getCategory())
                .fromInstitutionId(request.getFromInstitution().getInstitutionId())
                .fromInstitutionName(request.getFromInstitution().getName())
                .toInstitutionId(request.getToInstitution().getInstitutionId())
                .toInstitutionName(request.getToInstitution().getName())
                .requestedById(requester.getUserId())
                .requestedByName(requester.getFirstName() + " " + requester.getLastName())
                .requestedByEmail(requester.getEmail())
                .approvedById(approver != null ? approver.getUserId() : null)
                .approvedByName(approver != null ? approver.getFirstName() + " " + approver.getLastName() : null)
                .purpose(request.getPurpose())
                .requestedDate(request.getRequestedDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .remarks(request.getRemarks())
                .hourlyRate(request.getHourlyRate())
                .durationHours(computeDurationHours(request.getStartTime(), request.getEndTime()))
                .estimatedFee(request.getEstimatedFee())
                .createdAt(request.getCreatedAt())
                .build();
    }

    /** Duration in hours rounded to 2 decimals (e.g. 09:00-10:30 -> 1.5). */
    private Double computeDurationHours(java.time.LocalTime start, java.time.LocalTime end) {
        if (start == null || end == null) {
            return null;
        }
        long minutes = java.time.Duration.between(start, end).toMinutes();
        return Math.round(minutes / 60.0 * 100.0) / 100.0;
    }

    /**
     * Usage fee = equipment hourlyRate x requested hours, less any agreement discount,
     * snapshotted onto the request so a later rate or agreement change doesn't alter
     * already-created requests. Free equipment (null/zero rate) yields a zero fee.
     */
    private BigDecimal computeEstimatedFee(Equipment equipment,
                                           java.time.LocalTime start,
                                           java.time.LocalTime end,
                                           BigDecimal discountPercent) {
        BigDecimal rate = equipment.getHourlyRate();
        if (rate == null || rate.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        long minutes = java.time.Duration.between(start, end).toMinutes();
        BigDecimal gross = rate.multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        if (discountPercent == null || discountPercent.signum() <= 0) {
            return gross;
        }
        BigDecimal multiplier = BigDecimal.ONE.subtract(
                discountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return gross.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    private double hoursBetween(java.time.LocalTime start, java.time.LocalTime end) {
        return java.time.Duration.between(start, end).toMinutes() / 60.0;
    }

    /** Hours already committed under an agreement in the calendar month containing {@code onDate}. */
    private double hoursUsedInMonth(SharingAgreement agreement, LocalDate onDate) {
        LocalDate monthStart = onDate.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

        // Cancelled and rejected requests never consumed the quota, so they must not count
        return sharingRequestRepository
                .findByAgreementInMonth(agreement.getAgreementId(), monthStart, monthEnd,
                        List.of("PENDING", "APPROVED", "COMPLETED"))
                .stream()
                .mapToDouble(r -> hoursBetween(r.getStartTime(), r.getEndTime()))
                .sum();
    }

    // ------------------------------------------------------------------
    // Sharing agreements
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<SharingAgreementResponse> listAgreements(String username) {
        AppUser user = requireUser(username);
        return sharingAgreementRepository
                .findForInstitution(user.getInstitution().getInstitutionId())
                .stream()
                .map(this::mapToAgreementResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SharingAgreementResponse proposeAgreement(String username, SharingAgreementCreate request) {
        AppUser proposer = requireUser(username);
        if (!hasApproverRole(proposer)) {
            throw new RuntimeException("You do not have permission to propose sharing agreements");
        }

        Institution from = proposer.getInstitution();
        Institution to = institutionRepository.findById(request.getToInstitutionId())
                .orElseThrow(() -> new RuntimeException("Partner institution not found"));

        if (from.getInstitutionId().equals(to.getInstitutionId())) {
            throw new RuntimeException("An institution cannot hold a sharing agreement with itself");
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must not be before the start date");
        }
        // One live arrangement per direction, otherwise which discount applies is ambiguous
        boolean duplicate = sharingAgreementRepository
                .existsByFromInstitution_InstitutionIdAndToInstitution_InstitutionIdAndStatus(
                        from.getInstitutionId(), to.getInstitutionId(), "ACTIVE");
        if (duplicate) {
            throw new RuntimeException("An active agreement already governs access from "
                    + from.getName() + " to " + to.getName());
        }

        SharingAgreement agreement = SharingAgreement.builder()
                .fromInstitution(from)
                .toInstitution(to)
                .title(request.getTitle().trim())
                .status("PROPOSED")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .discountPercent(request.getDiscountPercent() == null
                        ? BigDecimal.ZERO : request.getDiscountPercent())
                .maxHoursPerMonth(request.getMaxHoursPerMonth())
                .autoApprove(Boolean.TRUE.equals(request.getAutoApprove()))
                .terms(request.getTerms())
                .createdBy(proposer)
                .build();

        SharingAgreement saved = sharingAgreementRepository.save(agreement);

        if (to.getEmail() != null && !to.getEmail().isBlank()) {
            emailService.sendNotificationEmail(
                    to.getEmail(),
                    "New sharing agreement proposed by " + from.getName(),
                    """
                    %s has proposed an inter-institution sharing agreement.

                    Title : %s
                    Runs : %s to %s
                    Discount : %s%%
                    Monthly cap : %s
                    Auto-approve : %s

                    Log in to the Lab Resource Platform to review and activate it.

                    — Lab Resource Platform
                    """.formatted(
                            from.getName(),
                            saved.getTitle(),
                            saved.getStartDate(),
                            saved.getEndDate() == null ? "open-ended" : saved.getEndDate(),
                            saved.getDiscountPercent(),
                            saved.getMaxHoursPerMonth() == null ? "none" : saved.getMaxHoursPerMonth() + " hours",
                            Boolean.TRUE.equals(saved.getAutoApprove()) ? "yes" : "no"));
        }

        return mapToAgreementResponse(saved);
    }

    @Override
    @Transactional
    public SharingAgreementResponse updateAgreementStatus(Long agreementId, String status, String username) {
        AppUser actor = requireUser(username);
        SharingAgreement agreement = sharingAgreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Sharing agreement not found"));

        String newStatus = status == null ? "" : status.trim().toUpperCase();
        Set<String> allowed = Set.of("ACTIVE", "SUSPENDED", "TERMINATED", "EXPIRED");
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException("Status must be one of ACTIVE, SUSPENDED, TERMINATED or EXPIRED");
        }
        if (!hasApproverRole(actor)) {
            throw new RuntimeException("You do not have permission to change sharing agreements");
        }

        Long actorInstitutionId = actor.getInstitution().getInstitutionId();
        boolean isOwner = agreement.getToInstitution().getInstitutionId().equals(actorInstitutionId);
        boolean isBorrower = agreement.getFromInstitution().getInstitutionId().equals(actorInstitutionId);

        if (!isOwner && !isBorrower) {
            throw new RuntimeException("Your institution is not a party to this agreement");
        }
        // Activating grants access to the owner's equipment, so only the owner may do it.
        // Either party may walk away, which is why TERMINATED/SUSPENDED are not restricted.
        if ("ACTIVE".equals(newStatus) && !isOwner) {
            throw new RuntimeException("Only " + agreement.getToInstitution().getName()
                    + " can activate this agreement — it grants access to their equipment");
        }

        agreement.setStatus(newStatus);
        if ("ACTIVE".equals(newStatus)) {
            agreement.setApprovedBy(actor);
        }
        SharingAgreement saved = sharingAgreementRepository.save(agreement);
        return mapToAgreementResponse(saved);
    }

    private SharingAgreementResponse mapToAgreementResponse(SharingAgreement a) {
        double usedThisMonth = hoursUsedInMonth(a, LocalDate.now());
        Double remaining = a.getMaxHoursPerMonth() == null
                ? null
                : Math.max(0.0, a.getMaxHoursPerMonth() - usedThisMonth);

        return SharingAgreementResponse.builder()
                .agreementId(a.getAgreementId())
                .fromInstitutionId(a.getFromInstitution().getInstitutionId())
                .fromInstitutionName(a.getFromInstitution().getName())
                .toInstitutionId(a.getToInstitution().getInstitutionId())
                .toInstitutionName(a.getToInstitution().getName())
                .title(a.getTitle())
                .status(a.getStatus())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .discountPercent(a.getDiscountPercent())
                .maxHoursPerMonth(a.getMaxHoursPerMonth())
                .autoApprove(a.getAutoApprove())
                .terms(a.getTerms())
                .createdByName(a.getCreatedBy() != null
                        ? a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName() : null)
                .approvedByName(a.getApprovedBy() != null
                        ? a.getApprovedBy().getFirstName() + " " + a.getApprovedBy().getLastName() : null)
                .createdAt(a.getCreatedAt())
                .effective(a.isCurrentlyEffective())
                .hoursUsedThisMonth(Math.round(usedThisMonth * 10.0) / 10.0)
                .hoursRemainingThisMonth(remaining == null ? null : Math.round(remaining * 10.0) / 10.0)
                .build();
    }

    // ------------------------------------------------------------------
    // Partnership reporting
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PartnershipReportResponse getPartnershipReport(String username, int days) {
        AppUser user = requireUser(username);
        Institution home = user.getInstitution();
        Long homeId = home.getInstitutionId();
        LocalDate from = LocalDate.now().minusDays(days);

        List<SharingRequest> inbound = sharingRequestRepository
                .findByToInstitution_InstitutionIdOrderByCreatedAtDesc(homeId).stream()
                .filter(r -> !r.getRequestedDate().isBefore(from))
                .collect(Collectors.toList());
        List<SharingRequest> outbound = sharingRequestRepository
                .findByFromInstitution_InstitutionIdOrderByCreatedAtDesc(homeId).stream()
                .filter(r -> !r.getRequestedDate().isBefore(from))
                .collect(Collectors.toList());

        // Group each direction by the counterparty, then zip into one row per partner
        Map<Long, List<SharingRequest>> inboundByPartner = inbound.stream()
                .collect(Collectors.groupingBy(r -> r.getFromInstitution().getInstitutionId()));
        Map<Long, List<SharingRequest>> outboundByPartner = outbound.stream()
                .collect(Collectors.groupingBy(r -> r.getToInstitution().getInstitutionId()));

        Map<Long, String> partnerNames = new HashMap<>();
        inbound.forEach(r -> partnerNames.put(
                r.getFromInstitution().getInstitutionId(), r.getFromInstitution().getName()));
        outbound.forEach(r -> partnerNames.put(
                r.getToInstitution().getInstitutionId(), r.getToInstitution().getName()));

        List<SharingAgreement> agreements = sharingAgreementRepository.findForInstitution(homeId);
        Set<Long> inboundAgreementPartners = agreements.stream()
                .filter(SharingAgreement::isCurrentlyEffective)
                .filter(a -> a.getToInstitution().getInstitutionId().equals(homeId))
                .map(a -> a.getFromInstitution().getInstitutionId())
                .collect(Collectors.toSet());
        Set<Long> outboundAgreementPartners = agreements.stream()
                .filter(SharingAgreement::isCurrentlyEffective)
                .filter(a -> a.getFromInstitution().getInstitutionId().equals(homeId))
                .map(a -> a.getToInstitution().getInstitutionId())
                .collect(Collectors.toSet());
        // Agreements naming this institution as a partner may exist without any request activity,
        // so seed the partner set from them too
        agreements.forEach(a -> {
            Long other = a.getFromInstitution().getInstitutionId().equals(homeId)
                    ? a.getToInstitution().getInstitutionId()
                    : a.getFromInstitution().getInstitutionId();
            partnerNames.putIfAbsent(other, a.getFromInstitution().getInstitutionId().equals(homeId)
                    ? a.getToInstitution().getName() : a.getFromInstitution().getName());
        });

        List<PartnershipReportResponse.Partner> partners = new ArrayList<>();
        for (Map.Entry<Long, String> entry : partnerNames.entrySet()) {
            Long partnerId = entry.getKey();
            List<SharingRequest> in = inboundByPartner.getOrDefault(partnerId, List.of());
            List<SharingRequest> out = outboundByPartner.getOrDefault(partnerId, List.of());

            long inApproved = countGranted(in);
            long outApproved = countGranted(out);

            partners.add(PartnershipReportResponse.Partner.builder()
                    .institutionId(partnerId)
                    .institutionName(entry.getValue())
                    .inboundRequests(in.size())
                    .outboundRequests(out.size())
                    .inboundApproved(inApproved)
                    .outboundApproved(outApproved)
                    .inboundApprovalRate(rate(inApproved, in.size()))
                    .outboundApprovalRate(rate(outApproved, out.size()))
                    .inboundHours(grantedHours(in))
                    .outboundHours(grantedHours(out))
                    .inboundRevenue(grantedFees(in))
                    .outboundCost(grantedFees(out))
                    .hasInboundAgreement(inboundAgreementPartners.contains(partnerId))
                    .hasOutboundAgreement(outboundAgreementPartners.contains(partnerId))
                    .topEquipment(topEquipment(in, out))
                    .build());
        }

        partners.sort(Comparator.comparingDouble(
                (PartnershipReportResponse.Partner p) -> p.getInboundHours() + p.getOutboundHours())
                .reversed());

        double inboundHours = grantedHours(inbound);
        double outboundHours = grantedHours(outbound);
        double netHours = round1(inboundHours - outboundHours);
        String posture = Math.abs(netHours) < 1.0 ? "BALANCED" : (netHours > 0 ? "LENDER" : "BORROWER");

        long activeAgreements = agreements.stream()
                .filter(SharingAgreement::isCurrentlyEffective)
                .count();

        return PartnershipReportResponse.builder()
                .institutionId(homeId)
                .institutionName(home.getName())
                .days(days)
                .totalPartners(partners.size())
                .inboundRequests(inbound.size())
                .outboundRequests(outbound.size())
                .inboundApproved(countGranted(inbound))
                .outboundApproved(countGranted(outbound))
                .inboundHours(round1(inboundHours))
                .outboundHours(round1(outboundHours))
                .inboundRevenue(grantedFees(inbound))
                .outboundCost(grantedFees(outbound))
                .netHours(netHours)
                .posture(posture)
                .activeAgreements((int) activeAgreements)
                .partners(partners)
                .insights(buildPartnershipInsights(
                        partners, inboundHours, outboundHours, posture, activeAgreements))
                .build();
    }

    /** Only granted requests represent real shared usage — pending and rejected ones do not. */
    private long countGranted(List<SharingRequest> requests) {
        return requests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()) || "COMPLETED".equals(r.getStatus()))
                .count();
    }

    private double grantedHours(List<SharingRequest> requests) {
        return requests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()) || "COMPLETED".equals(r.getStatus()))
                .mapToDouble(r -> hoursBetween(r.getStartTime(), r.getEndTime()))
                .sum();
    }

    private BigDecimal grantedFees(List<SharingRequest> requests) {
        return requests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()) || "COMPLETED".equals(r.getStatus()))
                .map(r -> r.getEstimatedFee() == null ? BigDecimal.ZERO : r.getEstimatedFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private List<String> topEquipment(List<SharingRequest> inbound, List<SharingRequest> outbound) {
        Map<String, Long> counts = new HashMap<>();
        for (SharingRequest r : inbound) {
            counts.merge(r.getEquipment().getEquipmentName(), 1L, Long::sum);
        }
        for (SharingRequest r : outbound) {
            counts.merge(r.getEquipment().getEquipmentName(), 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double rate(long numerator, long denominator) {
        return denominator == 0 ? 0.0 : round1(numerator * 100.0 / denominator);
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private List<String> buildPartnershipInsights(List<PartnershipReportResponse.Partner> partners,
                                                  double inboundHours, double outboundHours,
                                                  String posture, long activeAgreements) {
        List<String> insights = new ArrayList<>();

        if (partners.isEmpty()) {
            insights.add("No inter-institution sharing activity in this window.");
            return insights;
        }

        insights.add(switch (posture) {
            case "LENDER" -> "Net lender: " + round1(inboundHours) + " hours lent out against "
                    + round1(outboundHours) + " borrowed.";
            case "BORROWER" -> "Net borrower: " + round1(outboundHours) + " hours borrowed against "
                    + round1(inboundHours) + " lent out.";
            default -> "Sharing is broadly balanced between what you lend and what you borrow.";
        });

        if (activeAgreements == 0) {
            insights.add("No agreements are currently in force — every request is being negotiated"
                    + " one at a time. A standing agreement would set rates and skip repeat approvals.");
        }

        partners.stream()
                .filter(p -> p.getInboundRequests() > 0 && p.getInboundApprovalRate() < 50.0)
                .findFirst()
                .ifPresent(p -> insights.add("Only " + p.getInboundApprovalRate() + "% of requests from "
                        + p.getInstitutionName() + " are approved — worth reviewing whether that"
                        + " partnership is working."));

        partners.stream()
                .filter(p -> (p.getInboundHours() + p.getOutboundHours()) > 0)
                .filter(p -> !p.isHasInboundAgreement() && !p.isHasOutboundAgreement())
                .findFirst()
                .ifPresent(p -> insights.add("Active sharing with " + p.getInstitutionName()
                        + " has no agreement behind it — formalising it would lock in terms."));

        return insights;
    }
}
