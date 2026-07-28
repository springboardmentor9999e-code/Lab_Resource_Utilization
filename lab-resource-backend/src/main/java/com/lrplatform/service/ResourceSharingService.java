package com.lrplatform.service;

import com.lrplatform.dto.request.ExternalBookingRequestDto;
import com.lrplatform.dto.request.PartnershipRequest;
import com.lrplatform.dto.request.ShareEquipmentRequest;
import com.lrplatform.dto.response.ExternalBookingRequestResponse;
import com.lrplatform.dto.response.PartnershipResponse;
import com.lrplatform.dto.response.SharingAnalyticsResponse;
import com.lrplatform.dto.response.SharedEquipmentResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.*;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class ResourceSharingService {

    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final InstitutionPartnershipRepository institutionPartnershipRepository;
    private final ExternalBookingRequestRepository externalBookingRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    // ==================== Shared Equipment ====================

    public List<SharedEquipmentResponse> getAllSharedEquipment() {
        return sharedEquipmentRepository.findAll().stream()
                .map(this::toSharedEquipmentResponse)
                .toList();
    }

    public List<SharedEquipmentResponse> getAllSharedEquipmentByInstitution(Long institutionId) {
        return sharedEquipmentRepository.findAll().stream()
                .filter(se -> se.getEquipment() != null
                        && se.getEquipment().getLaboratory() != null
                        && se.getEquipment().getLaboratory().getDepartment() != null
                        && se.getEquipment().getLaboratory().getDepartment().getInstitution() != null
                        && se.getEquipment().getLaboratory().getDepartment().getInstitution().getId().equals(institutionId))
                .map(this::toSharedEquipmentResponse)
                .toList();
    }

    public SharedEquipmentResponse getSharedEquipmentById(Long id) {
        SharedEquipment sharedEquipment = sharedEquipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shared equipment not found with id: " + id));
        return toSharedEquipmentResponse(sharedEquipment);
    }

    @Transactional
    public SharedEquipmentResponse shareEquipment(ShareEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        if (sharedEquipmentRepository.existsByEquipmentId(request.getEquipmentId())) {
            throw new BadRequestException("Equipment is already shared with id: " + request.getEquipmentId());
        }

        SharedEquipment sharedEquipment = SharedEquipment.builder()
                .equipment(equipment)
                .hourlyRate(request.getHourlyRate())
                .dailyRate(request.getDailyRate())
                .securityDeposit(request.getSecurityDeposit())
                .sharingStatus("ACTIVE")
                .build();

        SharedEquipment saved = sharedEquipmentRepository.save(sharedEquipment);
        log.info("Equipment shared successfully with id: {}", saved.getId());
        return toSharedEquipmentResponse(saved);
    }

    @Transactional
    public SharedEquipmentResponse updateSharedEquipment(Long id, ShareEquipmentRequest request) {
        SharedEquipment sharedEquipment = sharedEquipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shared equipment not found with id: " + id));

        sharedEquipment.setHourlyRate(request.getHourlyRate());
        sharedEquipment.setDailyRate(request.getDailyRate());
        sharedEquipment.setSecurityDeposit(request.getSecurityDeposit());

        SharedEquipment updated = sharedEquipmentRepository.save(sharedEquipment);
        log.info("Shared equipment updated successfully with id: {}", updated.getId());
        return toSharedEquipmentResponse(updated);
    }

    @Transactional
    public void stopSharing(Long id) {
        SharedEquipment sharedEquipment = sharedEquipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shared equipment not found with id: " + id));

        sharedEquipment.setSharingStatus("INACTIVE");
        sharedEquipmentRepository.save(sharedEquipment);
        log.info("Sharing stopped for equipment with id: {}", id);
    }

    // ==================== Partnerships ====================

    public List<PartnershipResponse> getAllPartnerships() {
        return institutionPartnershipRepository.findAll().stream()
                .map(this::toPartnershipResponse)
                .toList();
    }

    public List<PartnershipResponse> getAllPartnershipsByInstitution(Long institutionId) {
        return institutionPartnershipRepository.findAll().stream()
                .filter(p -> (p.getInstitutionA() != null && p.getInstitutionA().getId().equals(institutionId))
                        || (p.getInstitutionB() != null && p.getInstitutionB().getId().equals(institutionId)))
                .map(this::toPartnershipResponse)
                .toList();
    }

    public PartnershipResponse getPartnershipById(Long id) {
        InstitutionPartnership partnership = institutionPartnershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with id: " + id));
        return toPartnershipResponse(partnership);
    }

    @Transactional
    public PartnershipResponse createPartnership(PartnershipRequest request) {
        Institution institutionA = institutionRepository.findById(request.getInstitutionAId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + request.getInstitutionAId()));

        Institution institutionB = institutionRepository.findById(request.getInstitutionBId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + request.getInstitutionBId()));

        if (request.getInstitutionAId().equals(request.getInstitutionBId())) {
            throw new BadRequestException("Cannot create partnership with the same institution");
        }

        if (institutionPartnershipRepository.existsByInstitutionAIdAndInstitutionBIdAndStatus(
                request.getInstitutionAId(), request.getInstitutionBId(), "ACTIVE")) {
            throw new BadRequestException("An active partnership already exists between these institutions");
        }

        InstitutionPartnership partnership = InstitutionPartnership.builder()
                .institutionA(institutionA)
                .institutionB(institutionB)
                .agreementStart(request.getAgreementStart())
                .agreementEnd(request.getAgreementEnd())
                .status("ACTIVE")
                .build();

        InstitutionPartnership saved = institutionPartnershipRepository.save(partnership);
        log.info("Partnership created successfully with id: {}", saved.getId());
        return toPartnershipResponse(saved);
    }

    @Transactional
    public PartnershipResponse updatePartnership(Long id, PartnershipRequest request) {
        InstitutionPartnership partnership = institutionPartnershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with id: " + id));

        partnership.setAgreementStart(request.getAgreementStart());
        partnership.setAgreementEnd(request.getAgreementEnd());

        InstitutionPartnership updated = institutionPartnershipRepository.save(partnership);
        log.info("Partnership updated successfully with id: {}", updated.getId());
        return toPartnershipResponse(updated);
    }

    @Transactional
    public void deletePartnership(Long id) {
        InstitutionPartnership partnership = institutionPartnershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with id: " + id));

        institutionPartnershipRepository.delete(partnership);
        log.info("Partnership deleted successfully with id: {}", id);
    }

    // ==================== External Booking Requests ====================

    public List<ExternalBookingRequestResponse> getAllExternalBookingRequests() {
        return externalBookingRequestRepository.findAll().stream()
                .map(this::toExternalBookingRequestResponse)
                .toList();
    }

    public List<ExternalBookingRequestResponse> getAllExternalBookingRequestsByInstitution(Long institutionId) {
        return externalBookingRequestRepository.findAll().stream()
                .filter(ebr -> {
                    if (ebr.getSharedEquipment() != null && ebr.getSharedEquipment().getEquipment() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment().getInstitution() != null) {
                        return ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment().getInstitution().getId().equals(institutionId);
                    }
                    if (ebr.getRequestingInstitution() != null) {
                        return ebr.getRequestingInstitution().getId().equals(institutionId);
                    }
                    return false;
                })
                .map(this::toExternalBookingRequestResponse)
                .toList();
    }

    public List<ExternalBookingRequestResponse> getAllExternalBookingRequestsByDepartment(Long departmentId) {
        return externalBookingRequestRepository.findByEquipmentDepartmentId(departmentId).stream()
                .map(this::toExternalBookingRequestResponse)
                .toList();
    }

    public List<ExternalBookingRequestResponse> getExternalBookingRequestsByStatus(String status) {
        return externalBookingRequestRepository.findByStatus(status).stream()
                .map(this::toExternalBookingRequestResponse)
                .toList();
    }

    @Transactional
    public ExternalBookingRequestResponse createExternalBookingRequest(ExternalBookingRequestDto request, Long userId) {
        SharedEquipment sharedEquipment = sharedEquipmentRepository.findById(request.getSharedEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shared equipment not found with id: " + request.getSharedEquipmentId()));

        if (!"ACTIVE".equals(sharedEquipment.getSharingStatus())) {
            throw new BadRequestException("Shared equipment is not currently available for booking");
        }

        Institution requestingInstitution = institutionRepository.findById(request.getRequestingInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + request.getRequestingInstitutionId()));

        User requestedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ExternalBookingRequest bookingRequest = ExternalBookingRequest.builder()
                .sharedEquipment(sharedEquipment)
                .requestingInstitution(requestingInstitution)
                .requestedBy(requestedBy)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .status("PENDING")
                .build();

        ExternalBookingRequest saved = externalBookingRequestRepository.save(bookingRequest);
        log.info("External booking request created successfully with id: {}", saved.getId());
        return toExternalBookingRequestResponse(saved);
    }

    @Transactional
    public ExternalBookingRequestResponse approveExternalBookingRequest(Long id, Long approvedByUserId) {
        ExternalBookingRequest bookingRequest = externalBookingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("External booking request not found with id: " + id));

        if (!"PENDING".equals(bookingRequest.getStatus())) {
            throw new BadRequestException("Only pending requests can be approved");
        }

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + approvedByUserId));

        if (approvedBy.getRole() == com.lrplatform.model.enums.UserRole.DEPARTMENT_HEAD) {
            validateExternalBookingBelongsToDepartment(bookingRequest, approvedBy);
        }

        bookingRequest.setStatus("APPROVED");
        bookingRequest.setApprovedBy(approvedBy);

        ExternalBookingRequest saved = externalBookingRequestRepository.save(bookingRequest);
        log.info("External booking request approved with id: {}", id);
        return toExternalBookingRequestResponse(saved);
    }

    @Transactional
    public ExternalBookingRequestResponse rejectExternalBookingRequest(Long id, Long approvedByUserId) {
        ExternalBookingRequest bookingRequest = externalBookingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("External booking request not found with id: " + id));

        if (!"PENDING".equals(bookingRequest.getStatus())) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + approvedByUserId));

        if (approvedBy.getRole() == com.lrplatform.model.enums.UserRole.DEPARTMENT_HEAD) {
            validateExternalBookingBelongsToDepartment(bookingRequest, approvedBy);
        }

        bookingRequest.setStatus("REJECTED");
        bookingRequest.setApprovedBy(approvedBy);

        ExternalBookingRequest saved = externalBookingRequestRepository.save(bookingRequest);
        log.info("External booking request rejected with id: {}", id);
        return toExternalBookingRequestResponse(saved);
    }

    // ==================== Analytics ====================

    public SharingAnalyticsResponse getSharingAnalytics() {
        List<SharedEquipment> allShared = sharedEquipmentRepository.findAll();
        List<InstitutionPartnership> allPartnerships = institutionPartnershipRepository.findAll();
        List<ExternalBookingRequest> allBookings = externalBookingRequestRepository.findAll();

        return buildSharingAnalytics(allShared, allPartnerships, allBookings);
    }

    public SharingAnalyticsResponse getSharingAnalyticsByInstitution(Long institutionId) {
        List<SharedEquipment> allShared = sharedEquipmentRepository.findAll().stream()
                .filter(se -> se.getEquipment() != null
                        && se.getEquipment().getLaboratory() != null
                        && se.getEquipment().getLaboratory().getDepartment() != null
                        && se.getEquipment().getLaboratory().getDepartment().getInstitution() != null
                        && se.getEquipment().getLaboratory().getDepartment().getInstitution().getId().equals(institutionId))
                .toList();

        List<InstitutionPartnership> allPartnerships = institutionPartnershipRepository.findAll().stream()
                .filter(p -> (p.getInstitutionA() != null && p.getInstitutionA().getId().equals(institutionId))
                        || (p.getInstitutionB() != null && p.getInstitutionB().getId().equals(institutionId)))
                .toList();

        List<ExternalBookingRequest> allBookings = externalBookingRequestRepository.findAll().stream()
                .filter(ebr -> {
                    if (ebr.getSharedEquipment() != null && ebr.getSharedEquipment().getEquipment() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment() != null
                            && ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment().getInstitution() != null) {
                        return ebr.getSharedEquipment().getEquipment().getLaboratory().getDepartment().getInstitution().getId().equals(institutionId);
                    }
                    if (ebr.getRequestingInstitution() != null) {
                        return ebr.getRequestingInstitution().getId().equals(institutionId);
                    }
                    return false;
                })
                .toList();

        return buildSharingAnalytics(allShared, allPartnerships, allBookings);
    }

    private SharingAnalyticsResponse buildSharingAnalytics(List<SharedEquipment> allShared, List<InstitutionPartnership> allPartnerships, List<ExternalBookingRequest> allBookings) {
        long activeSharedEquipment = allShared.stream()
                .filter(se -> "ACTIVE".equals(se.getSharingStatus()))
                .count();

        long activePartnerships = allPartnerships.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();

        long pendingBookings = allBookings.stream()
                .filter(b -> "PENDING".equals(b.getStatus()))
                .count();

        long approvedBookings = allBookings.stream()
                .filter(b -> "APPROVED".equals(b.getStatus()))
                .count();

        long rejectedBookings = allBookings.stream()
                .filter(b -> "REJECTED".equals(b.getStatus()))
                .count();

        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> "APPROVED".equals(b.getStatus()) && b.getSharedEquipment() != null)
                .map(b -> b.getSharedEquipment().getDailyRate() != null ? b.getSharedEquipment().getDailyRate() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SharingAnalyticsResponse.builder()
                .totalSharedEquipment(allShared.size())
                .activeSharedEquipment(activeSharedEquipment)
                .totalPartnerships(allPartnerships.size())
                .activePartnerships(activePartnerships)
                .totalExternalBookings(allBookings.size())
                .pendingExternalBookings(pendingBookings)
                .approvedExternalBookings(approvedBookings)
                .rejectedExternalBookings(rejectedBookings)
                .totalApprovedRevenue(totalRevenue)
                .build();
    }

    // ==================== Private Helpers ====================

    private SharedEquipmentResponse toSharedEquipmentResponse(SharedEquipment sharedEquipment) {
        Equipment equipment = sharedEquipment.getEquipment();
        return SharedEquipmentResponse.builder()
                .id(sharedEquipment.getId())
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getEquipmentName())
                .equipmentCode(equipment.getEquipmentCode())
                .labName(equipment.getLaboratory().getLaboratoryName())
                .institutionName(equipment.getLaboratory().getDepartment().getInstitution().getInstitutionName())
                .hourlyRate(sharedEquipment.getHourlyRate())
                .dailyRate(sharedEquipment.getDailyRate())
                .securityDeposit(sharedEquipment.getSecurityDeposit())
                .sharingStatus(sharedEquipment.getSharingStatus())
                .createdAt(sharedEquipment.getCreatedAt())
                .build();
    }

    private PartnershipResponse toPartnershipResponse(InstitutionPartnership partnership) {
        return PartnershipResponse.builder()
                .id(partnership.getId())
                .institutionAId(partnership.getInstitutionA().getId())
                .institutionAName(partnership.getInstitutionA().getInstitutionName())
                .institutionBId(partnership.getInstitutionB().getId())
                .institutionBName(partnership.getInstitutionB().getInstitutionName())
                .agreementStart(partnership.getAgreementStart())
                .agreementEnd(partnership.getAgreementEnd())
                .status(partnership.getStatus())
                .createdAt(partnership.getCreatedAt())
                .build();
    }

    private void validateExternalBookingBelongsToDepartment(ExternalBookingRequest bookingRequest, User manager) {
        if (manager.getDepartment() == null) {
            throw new BadRequestException("No department assigned to your account");
        }
        Long departmentId = manager.getDepartment().getId();
        if (bookingRequest.getSharedEquipment() == null
                || bookingRequest.getSharedEquipment().getEquipment() == null
                || bookingRequest.getSharedEquipment().getEquipment().getLaboratory() == null
                || bookingRequest.getSharedEquipment().getEquipment().getLaboratory().getDepartment() == null
                || !bookingRequest.getSharedEquipment().getEquipment().getLaboratory().getDepartment().getId().equals(departmentId)) {
            throw new BadRequestException("You can only approve/reject external bookings for your department's equipment");
        }
    }

    private ExternalBookingRequestResponse toExternalBookingRequestResponse(ExternalBookingRequest bookingRequest) {
        return ExternalBookingRequestResponse.builder()
                .id(bookingRequest.getId())
                .sharedEquipmentId(bookingRequest.getSharedEquipment().getId())
                .equipmentName(bookingRequest.getSharedEquipment().getEquipment().getEquipmentName())
                .requestingInstitutionId(bookingRequest.getRequestingInstitution().getId())
                .requestingInstitutionName(bookingRequest.getRequestingInstitution().getInstitutionName())
                .requestedByUserId(bookingRequest.getRequestedBy().getId())
                .requestedByUserName(bookingRequest.getRequestedBy().getFullName())
                .bookingDate(bookingRequest.getBookingDate())
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .purpose(bookingRequest.getPurpose())
                .status(bookingRequest.getStatus())
                .approvedByUserId(bookingRequest.getApprovedBy() != null ? bookingRequest.getApprovedBy().getId() : null)
                .approvedByUserName(bookingRequest.getApprovedBy() != null ? bookingRequest.getApprovedBy().getFullName() : null)
                .createdAt(bookingRequest.getCreatedAt())
                .build();
    }
}
