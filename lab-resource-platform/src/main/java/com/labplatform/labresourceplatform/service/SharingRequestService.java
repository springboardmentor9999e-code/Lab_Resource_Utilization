package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.SharingRequest;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.enums.SharingRequestStatus;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.InstitutionRepository;
import com.labplatform.labresourceplatform.repository.SharingRequestRepository;
import com.labplatform.labresourceplatform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SharingRequestService {

    private final SharingRequestRepository sharingRequestRepository;
    private final BookingService bookingService;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    public SharingRequestService(SharingRequestRepository sharingRequestRepository,
                                  BookingService bookingService,
                                  EquipmentRepository equipmentRepository,
                                  InstitutionRepository institutionRepository,
                                  UserRepository userRepository) {
        this.sharingRequestRepository = sharingRequestRepository;
        this.bookingService = bookingService;
        this.equipmentRepository = equipmentRepository;
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
    }

    public List<SharingRequest> getAllSharingRequests() {
        return sharingRequestRepository.findAll();
    }

    // Scoping consistent with the rest of the sharing-request permission matrix:
    // - Full-CRUD roles (INSTITUTION_ADMINISTRATOR / SYSTEM_ADMINISTRATOR) see everything.
    // - LAB_MANAGER / DEPARTMENT_HEAD (approve-capable) see requests involving their institution.
    // - STUDENT/RESEARCHER/LAB_TECHNICIAN (read-only per the matrix) see only their own requests.
    public List<SharingRequest> getVisibleSharingRequests(User currentUser) {
        Role role = currentUser.getRole();
        if (role == Role.SYSTEM_ADMINISTRATOR || role == Role.INSTITUTION_ADMINISTRATOR) {
            return sharingRequestRepository.findAll();
        }
        if (role == Role.LAB_MANAGER || role == Role.DEPARTMENT_HEAD) {
            Long institutionId = currentUser.getInstitution() != null
                    ? currentUser.getInstitution().getInstitutionId()
                    : null;
            return institutionId == null
                    ? List.of()
                    : sharingRequestRepository.findByInstitutionInvolved(institutionId);
        }
        return sharingRequestRepository.findByRequestedBy_UserId(currentUser.getUserId());
    }

    public SharingRequest getSharingRequestById(Long id) {
        return sharingRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sharing Request not found with id: " + id));
    }

    // Same scoping rule as the list endpoint, applied to a single request.
    public SharingRequest getSharingRequestByIdForUser(Long id, User currentUser) {
        SharingRequest request = getSharingRequestById(id);
        Role role = currentUser.getRole();

        if (role == Role.SYSTEM_ADMINISTRATOR || role == Role.INSTITUTION_ADMINISTRATOR) {
            return request;
        }

        Long ownInstitutionId = currentUser.getInstitution() != null
                ? currentUser.getInstitution().getInstitutionId()
                : null;

        if (role == Role.LAB_MANAGER || role == Role.DEPARTMENT_HEAD) {
            boolean involvesOwnInstitution = ownInstitutionId != null && (
                    (request.getRequesterInstitution() != null && ownInstitutionId.equals(request.getRequesterInstitution().getInstitutionId())) ||
                    (request.getOwnerInstitution() != null && ownInstitutionId.equals(request.getOwnerInstitution().getInstitutionId()))
            );
            if (involvesOwnInstitution) {
                return request;
            }
            throw new AccessDeniedException("You may only view sharing requests involving your own institution");
        }

        boolean isOwnRequest = request.getRequestedBy() != null
                && request.getRequestedBy().getUserId().equals(currentUser.getUserId());
        if (!isOwnRequest) {
            throw new AccessDeniedException("You may only view your own sharing requests");
        }
        return request;
    }

    // Re-fetches every nested reference the client sends as a bare id
    // ({ equipment: { equipmentId: N } }, etc) so the saved/returned entity has
    // real, fully-loaded data rather than an id-only echo. Without this, a newly
    // created sharing request shows blank/placeholder equipment and institution
    // names until the page is refreshed - same root cause as the booking and
    // maintenance "Equipment #N until refresh" bug.
    private void resolveReferences(SharingRequest request) {
        if (request.getEquipment() != null) {
            request.setEquipment(fetchEquipment(request.getEquipment().getEquipmentId()));
        }
        if (request.getRequesterInstitution() != null) {
            request.setRequesterInstitution(fetchInstitution(request.getRequesterInstitution().getInstitutionId()));
        }
        if (request.getOwnerInstitution() != null) {
            request.setOwnerInstitution(fetchInstitution(request.getOwnerInstitution().getInstitutionId()));
        }
        if (request.getRequestedBy() != null) {
            request.setRequestedBy(fetchUser(request.getRequestedBy().getUserId()));
        }
    }

    private Equipment fetchEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
    }

    private Institution fetchInstitution(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found with id: " + id));
    }

    private User fetchUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public SharingRequest createSharingRequest(SharingRequest request) {
        resolveReferences(request);
        request.setStatus(SharingRequestStatus.PENDING);
        return sharingRequestRepository.save(request);
    }

    public SharingRequest updateSharingRequest(Long id, SharingRequest updatedRequest) {

        SharingRequest existing = getSharingRequestById(id);

        if (updatedRequest.getEquipment() != null)
            existing.setEquipment(fetchEquipment(updatedRequest.getEquipment().getEquipmentId()));

        if (updatedRequest.getRequesterInstitution() != null)
            existing.setRequesterInstitution(fetchInstitution(updatedRequest.getRequesterInstitution().getInstitutionId()));

        if (updatedRequest.getOwnerInstitution() != null)
            existing.setOwnerInstitution(fetchInstitution(updatedRequest.getOwnerInstitution().getInstitutionId()));

        if (updatedRequest.getRequestedBy() != null)
            existing.setRequestedBy(fetchUser(updatedRequest.getRequestedBy().getUserId()));

        if (updatedRequest.getPurpose() != null)
            existing.setPurpose(updatedRequest.getPurpose());

        if (updatedRequest.getStartDate() != null)
            existing.setStartDate(updatedRequest.getStartDate());

        if (updatedRequest.getEndDate() != null)
            existing.setEndDate(updatedRequest.getEndDate());

        return sharingRequestRepository.save(existing);
    }

    public SharingRequest approveSharingRequest(Long id, User approver) {
        SharingRequest request = getSharingRequestById(id);
        request.setApprovedBy(approver);

        Booking createdBooking = createBookingForApprovedRequest(request);

        // Surface the real outcome: only mark APPROVED if access was actually
        // granted (booking Confirmed/Pending Approval, i.e. not bumped to the
        // waitlist by a conflict). Otherwise this would show "Approved" while the
        // requester silently got no usable access - see item #9 of the fixes spec.
        boolean waitlisted = createdBooking != null && "Waitlisted".equals(createdBooking.getStatus());
        request.setStatus(waitlisted ? SharingRequestStatus.WAITLISTED : SharingRequestStatus.APPROVED);

        return sharingRequestRepository.save(request);
    }

    // Approving a sharing request should actually grant access, not just record a
    // decision - so it creates the Booking that lets the requester use the
    // equipment during the requested window. Reuses BookingService's normal
    // create path, so the usual conflict/waitlist logic applies here too.
    // Returns the created booking (or null if there wasn't enough data to book),
    // so the caller can reflect the real outcome back on the request itself.
    private Booking createBookingForApprovedRequest(SharingRequest request) {
        if (request.getEquipment() == null || request.getRequestedBy() == null
                || request.getStartDate() == null || request.getEndDate() == null) {
            // Older sharing requests created before requestedBy/date wiring was added
            // won't have everything needed to auto-book - skip rather than fail the
            // whole approval, since the approval itself is still valid.
            return null;
        }

        Booking booking = new Booking();
        booking.setUser(request.getRequestedBy());
        booking.setEquipment(request.getEquipment());
        booking.setBookingDate(request.getStartDate().toLocalDate());
        booking.setStartTime(request.getStartDate());
        booking.setEndTime(request.getEndDate());
        return bookingService.createBooking(booking);
    }

    public SharingRequest rejectSharingRequest(Long id) {
        SharingRequest request = getSharingRequestById(id);
        request.setStatus(SharingRequestStatus.REJECTED);
        return sharingRequestRepository.save(request);
    }

    public void deleteSharingRequest(Long id) {
        sharingRequestRepository.deleteById(id);
    }
}
