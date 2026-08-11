package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.dto.ResourceSharingAnalyticsDTO;
import com.infosys.labresourceutilizationplatform.dto.ResourceSharingRequestDTO;
import com.infosys.labresourceutilizationplatform.entity.*;
import com.infosys.labresourceutilizationplatform.repository.*;
import com.infosys.labresourceutilizationplatform.service.NotificationService;
import com.infosys.labresourceutilizationplatform.service.ResourceSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    @Autowired
    private ResourceSharingRepository resourceSharingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public ResourceSharing createSharingRequest(ResourceSharingRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Equipment equipment = equipmentRepository.findById(dto.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found with ID: " + dto.getEquipmentId()));

        // Check equipment availability status
        String eqStatus = equipment.getStatus() != null ? equipment.getStatus().toUpperCase() : "";
        if (eqStatus.contains("MAINTENANCE") || eqStatus.contains("RETIRED") || eqStatus.contains("OUT OF SERVICE") || eqStatus.contains("DAMAGED")) {
            throw new RuntimeException("Equipment '" + equipment.getEquipmentName() + "' is currently " + equipment.getStatus() + " and cannot be requested for sharing.");
        }

        Institution ownerInst = null;
        if (equipment.getLaboratory() != null &&
            equipment.getLaboratory().getDepartment() != null &&
            equipment.getLaboratory().getDepartment().getInstitution() != null) {
            ownerInst = equipment.getLaboratory().getDepartment().getInstitution();
        } else {
            throw new RuntimeException("Equipment does not have an associated owner institution.");
        }

        if (user.getInstitutionId() == null) {
            throw new RuntimeException("User does not belong to any registered institution.");
        }

        Institution userInst = institutionRepository.findById(Long.valueOf(user.getInstitutionId()))
                .orElseThrow(() -> new RuntimeException("User's institution not found."));

        if (ownerInst.getInstitutionId().equals(userInst.getInstitutionId())) {
            throw new RuntimeException("Cannot create an inter-institute sharing request for equipment owned by your own institution. Please use standard booking.");
        }

        // Date & Time Validations
        if (dto.getBookingDate() == null || dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new RuntimeException("Booking Date, Start Time, and End Time are required.");
        }

        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        LocalDateTime bookingStart = LocalDateTime.of(dto.getBookingDate(), dto.getStartTime());
        LocalDateTime bookingEnd = LocalDateTime.of(dto.getBookingDate(), dto.getEndTime());

        if (bookingStart.isBefore(now)) {
            throw new RuntimeException("Sharing requests cannot be made for past dates or times.");
        }

        if (!bookingEnd.isAfter(bookingStart)) {
            throw new RuntimeException("End time must be later than start time.");
        }

        double durationMinutes = Duration.between(bookingStart, bookingEnd).toMinutes();
        if (durationMinutes <= 0) {
            throw new RuntimeException("Duration must be greater than zero.");
        }
        double durationHrs = durationMinutes / 60.0;

        // Check for duplicate pending requests or overlapping approved sharing
        List<ResourceSharing> existingSharings = resourceSharingRepository.findByEquipmentIdAndStatusIn(
                equipment.getId(), List.of("Pending", "Approved", "Active"));

        for (ResourceSharing existing : existingSharings) {
            if (existing.getBookingDate() != null && existing.getBookingDate().equals(dto.getBookingDate())) {
                LocalTime exStart = existing.getStartTime();
                LocalTime exEnd = existing.getEndTime();
                if (exStart != null && exEnd != null) {
                    boolean overlaps = !(dto.getEndTime().compareTo(exStart) <= 0 || dto.getStartTime().compareTo(exEnd) >= 0);
                    if (overlaps) {
                        if ("Pending".equalsIgnoreCase(existing.getStatus())) {
                            throw new RuntimeException("A pending sharing request already exists for this equipment during the requested time window (" + exStart + " - " + exEnd + ").");
                        } else {
                            throw new RuntimeException("This equipment is already reserved for resource sharing during the requested time window (" + exStart + " - " + exEnd + ").");
                        }
                    }
                }
            }
        }

        // Check for conflicting internal bookings on that equipment
        List<Booking> existingBookings = bookingRepository.findByEquipmentIdAndBookingDate(equipment.getId(), dto.getBookingDate());
        for (Booking b : existingBookings) {
            String bStatus = b.getStatus() != null ? b.getStatus() : "";
            if ("Confirmed".equalsIgnoreCase(bStatus) || "In Use".equalsIgnoreCase(bStatus) || "Approved".equalsIgnoreCase(bStatus)) {
                LocalTime bStart = b.getStartTime();
                LocalTime bEnd = b.getEndTime();
                if (bStart != null && bEnd != null) {
                    boolean overlaps = !(dto.getEndTime().compareTo(bStart) <= 0 || dto.getStartTime().compareTo(bEnd) >= 0);
                    if (overlaps) {
                        throw new RuntimeException("This equipment has a conflicting active booking from " + bStart + " to " + bEnd + " on " + dto.getBookingDate() + ".");
                    }
                }
            }
        }

        // Utilization cost: external default ₹5/hr or custom equipment costPerHour
        double rate = (equipment.getCostPerHour() != null && equipment.getCostPerHour() > 0) ? equipment.getCostPerHour() : 5.0;
        double estimatedCost = durationHrs * rate;

        ResourceSharing sharing = new ResourceSharing();
        sharing.setEquipment(equipment);
        sharing.setOwnerInstitution(ownerInst);
        sharing.setSharedWithInstitution(userInst);
        sharing.setStatus("Pending");
        sharing.setRequestDate(LocalDate.now());
        sharing.setBookingDate(dto.getBookingDate());
        sharing.setStartTime(dto.getStartTime());
        sharing.setEndTime(dto.getEndTime());
        sharing.setDuration(durationHrs);
        sharing.setHourlyRate(rate);
        sharing.setEstimatedCost(estimatedCost);
        sharing.setRequestedBy(user);
        sharing.setPurpose(dto.getPurpose());

        ResourceSharing saved = resourceSharingRepository.save(sharing);

        // Notifications
        String eqName = equipment.getEquipmentName();
        String ownerName = ownerInst.getInstitutionName();
        String reqInstName = userInst.getInstitutionName();
        String reqUserName = user.getFullName();

        String alertMsg = "New inter-institute sharing request received from " + reqUserName + " (" + reqInstName + ") for " + eqName + " (" + ownerName + ").";

        // Notify Owner Institution Admin & System Admin
        notificationService.sendNotification(null, "INSTITUTION_ADMIN", ownerInst.getInstitutionId(), "Resource Sharing Request", alertMsg, "BOOKING", "High");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Resource Sharing Request", alertMsg, "SYSTEM", "High");

        // Notify Requester (Admin/Staff who requested)
        notificationService.sendNotification(Long.valueOf(user.getUserId()), null, Long.valueOf(user.getInstitutionId()), "Sharing Request Submitted",
                "Your sharing request for " + eqName + " has been submitted to " + ownerName + " and is pending approval.", "BOOKING", "Medium");

        return saved;
    }

    @Override
    @Transactional
    public ResourceSharing approveSharingRequest(Long sharingId, String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found: " + approverEmail));

        ResourceSharing sharing = resourceSharingRepository.findById(sharingId)
                .orElseThrow(() -> new RuntimeException("Resource sharing request not found with ID: " + sharingId));

        String approverRole = approver.getRole() != null ? approver.getRole().getRoleName() : "";
        if ("SYSTEM_ADMIN".equalsIgnoreCase(approverRole)) {
            throw new RuntimeException("System Administrators cannot approve or reject resource sharing requests. System Administrator has read-only monitoring authority.");
        }

        Long ownerInstId = sharing.getOwnerInstitution() != null ? sharing.getOwnerInstitution().getInstitutionId() : null;
        Integer approverInstId = approver.getInstitutionId();
        if (ownerInstId == null || approverInstId == null || !ownerInstId.equals(Long.valueOf(approverInstId))) {
            throw new RuntimeException("Only the Institution Administrator of the owning institution (" + 
                    (sharing.getOwnerInstitution() != null ? sharing.getOwnerInstitution().getInstitutionName() : "Owner Institute") + 
                    ") can approve or reject this request.");
        }

        if (!"Pending".equalsIgnoreCase(sharing.getStatus())) {
            throw new RuntimeException("Only Pending sharing requests can be approved. Current status: " + sharing.getStatus());
        }

        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        LocalDateTime bookingStart = LocalDateTime.of(sharing.getBookingDate(), sharing.getStartTime());
        if (bookingStart.isBefore(now)) {
            sharing.setStatus("Expired");
            resourceSharingRepository.save(sharing);
            throw new RuntimeException("This sharing request has expired because the requested time has already passed.");
        }

        sharing.setStatus("Approved");
        sharing.setApprovalDate(LocalDate.now());
        sharing.setApprovedBy(approver);

        // Automatically create & confirm a booking in the Booking table
        Booking booking = new Booking();
        booking.setEquipment(sharing.getEquipment());
        booking.setUser(sharing.getRequestedBy());
        booking.setBookingDate(sharing.getBookingDate());
        booking.setStartTime(sharing.getStartTime());
        booking.setEndTime(sharing.getEndTime());
        booking.setDuration(sharing.getDuration());
        booking.setUtilizationCost(sharing.getEstimatedCost());
        booking.setPurpose("[Shared from " + sharing.getOwnerInstitution().getInstitutionName() + "] " + (sharing.getPurpose() != null ? sharing.getPurpose() : ""));
        booking.setStatus("Confirmed");

        Booking savedBooking = bookingRepository.save(booking);
        sharing.setBooking(savedBooking);

        ResourceSharing saved = resourceSharingRepository.save(sharing);

        // Notifications
        String eqName = sharing.getEquipment().getEquipmentName();
        String ownerName = sharing.getOwnerInstitution().getInstitutionName();
        String reqInstName = sharing.getSharedWithInstitution() != null ? sharing.getSharedWithInstitution().getInstitutionName() : "Partner Institute";
        Long reqInstId = sharing.getSharedWithInstitution() != null ? sharing.getSharedWithInstitution().getInstitutionId() : null;

        // 1. Notify Requesting Institution Administrator
        if (reqInstId != null) {
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", reqInstId, "Sharing Request Approved",
                    "Your inter-institute sharing request for " + eqName + " on " + sharing.getBookingDate() + " has been approved by " + ownerName + ".", "BOOKING", "High");
        }

        // 2. Notify Owning Institution Administrator
        if (ownerInstId != null) {
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", ownerInstId, "Sharing Request Approved",
                    "You approved inter-institute sharing request for " + eqName + " requested by " + reqInstName + ".", "BOOKING", "Medium");
        }

        // 3. Notify System Administrator
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Sharing Request Approved",
                "Sharing request for " + eqName + " approved by " + ownerName + " for " + reqInstName + ".", "SYSTEM", "Medium");

        return saved;
    }

    @Override
    @Transactional
    public ResourceSharing rejectSharingRequest(Long sharingId, String reason, String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found: " + approverEmail));

        ResourceSharing sharing = resourceSharingRepository.findById(sharingId)
                .orElseThrow(() -> new RuntimeException("Resource sharing request not found with ID: " + sharingId));

        String approverRole = approver.getRole() != null ? approver.getRole().getRoleName() : "";
        if ("SYSTEM_ADMIN".equalsIgnoreCase(approverRole)) {
            throw new RuntimeException("System Administrators cannot approve or reject resource sharing requests. System Administrator has read-only monitoring authority.");
        }

        Long ownerInstId = sharing.getOwnerInstitution() != null ? sharing.getOwnerInstitution().getInstitutionId() : null;
        Integer approverInstId = approver.getInstitutionId();
        if (ownerInstId == null || approverInstId == null || !ownerInstId.equals(Long.valueOf(approverInstId))) {
            throw new RuntimeException("Only the Institution Administrator of the owning institution (" + 
                    (sharing.getOwnerInstitution() != null ? sharing.getOwnerInstitution().getInstitutionName() : "Owner Institute") + 
                    ") can approve or reject this request.");
        }

        sharing.setStatus("Rejected");
        sharing.setApprovalDate(LocalDate.now());
        sharing.setApprovedBy(approver);
        sharing.setRejectionReason(reason != null ? reason : "Request declined by institution administrator.");

        ResourceSharing saved = resourceSharingRepository.save(sharing);

        // Notifications
        String eqName = sharing.getEquipment().getEquipmentName();
        String ownerName = sharing.getOwnerInstitution().getInstitutionName();
        String reqInstName = sharing.getSharedWithInstitution() != null ? sharing.getSharedWithInstitution().getInstitutionName() : "Partner Institute";
        Long reqInstId = sharing.getSharedWithInstitution() != null ? sharing.getSharedWithInstitution().getInstitutionId() : null;

        // 1. Notify Requesting Institution Administrator
        if (reqInstId != null) {
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", reqInstId, "Sharing Request Rejected",
                    "Your inter-institute sharing request for " + eqName + " was rejected by " + ownerName + ". Reason: " + sharing.getRejectionReason(), "BOOKING", "High");
        }

        // 2. Notify Owning Institution Administrator
        if (ownerInstId != null) {
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", ownerInstId, "Sharing Request Rejected",
                    "You rejected inter-institute sharing request for " + eqName + " from " + reqInstName + ".", "BOOKING", "Medium");
        }

        // 3. Notify System Administrator
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Sharing Request Rejected",
                "Sharing request for " + eqName + " rejected by " + ownerName + " for " + reqInstName + ".", "SYSTEM", "Medium");

        return saved;
    }

    @Override
    @Transactional
    public ResourceSharing cancelSharingRequest(Long sharingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        ResourceSharing sharing = resourceSharingRepository.findById(sharingId)
                .orElseThrow(() -> new RuntimeException("Resource sharing request not found with ID: " + sharingId));

        String userRole = user.getRole() != null ? user.getRole().getRoleName() : "";
        Long reqInstId = sharing.getSharedWithInstitution() != null ? sharing.getSharedWithInstitution().getInstitutionId() : null;
        Integer userInstId = user.getInstitutionId();
        Integer reqUserId = sharing.getRequestedBy() != null ? sharing.getRequestedBy().getUserId() : null;

        boolean isRequester = (reqUserId != null && reqUserId.equals(user.getUserId())) ||
                (reqInstId != null && userInstId != null && reqInstId.equals(Long.valueOf(userInstId)));

        if (!isRequester && !"INSTITUTION_ADMIN".equalsIgnoreCase(userRole)) {
            throw new RuntimeException("Only the requesting institution administrator or original requester can cancel this request.");
        }

        sharing.setStatus("Cancelled");
        return resourceSharingRepository.save(sharing);
    }

    private void updateSharingLifecycleStatuses(List<ResourceSharing> list) {
        if (list == null || list.isEmpty()) return;
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        boolean changed = false;

        for (ResourceSharing sharing : list) {
            if (sharing.getBookingDate() == null || sharing.getStartTime() == null || sharing.getEndTime() == null) continue;
            LocalDateTime start = LocalDateTime.of(sharing.getBookingDate(), sharing.getStartTime());
            LocalDateTime end = LocalDateTime.of(sharing.getBookingDate(), sharing.getEndTime());
            String status = sharing.getStatus() != null ? sharing.getStatus().trim() : "";

            if ("Pending".equalsIgnoreCase(status) && start.isBefore(now)) {
                sharing.setStatus("Expired");
                changed = true;
            } else if ("Approved".equalsIgnoreCase(status)) {
                if (now.isAfter(end)) {
                    sharing.setStatus("Completed");
                    changed = true;
                } else if (now.isAfter(start) && now.isBefore(end)) {
                    sharing.setStatus("Active");
                    changed = true;
                }
            } else if ("Active".equalsIgnoreCase(status) && now.isAfter(end)) {
                sharing.setStatus("Completed");
                changed = true;
            }
        }

        if (changed) {
            resourceSharingRepository.saveAll(list);
        }
    }

    @Override
    public List<ResourceSharing> getIncomingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        String role = user.getRole().getRoleName();
        List<ResourceSharing> results;
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            results = resourceSharingRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getInstitutionId() == null) {
            return new ArrayList<>();
        } else {
            results = resourceSharingRepository.findByOwnerInstitutionInstitutionId(Long.valueOf(user.getInstitutionId()));
        }

        updateSharingLifecycleStatuses(results);
        return results;
    }

    @Override
    public List<ResourceSharing> getOutgoingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        String role = user.getRole().getRoleName();
        List<ResourceSharing> results;
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            results = resourceSharingRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getInstitutionId() == null) {
            return new ArrayList<>();
        } else {
            results = resourceSharingRepository.findBySharedWithInstitutionInstitutionId(Long.valueOf(user.getInstitutionId()));
        }

        updateSharingLifecycleStatuses(results);
        return results;
    }

    @Override
    public List<ResourceSharing> getMyRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        List<ResourceSharing> results = resourceSharingRepository.findByRequestedByUserId(user.getUserId());
        updateSharingLifecycleStatuses(results);
        return results;
    }

    @Override
    public List<ResourceSharing> getAllRequests(String userEmail) {
        List<ResourceSharing> results = resourceSharingRepository.findAllByOrderByCreatedAtDesc();
        updateSharingLifecycleStatuses(results);
        return results;
    }

    @Override
    public List<Equipment> getAvailableEquipmentForSharing(String userEmail, Long targetInstitutionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Long userInstId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;

        List<Equipment> all = equipmentRepository.findAll();

        return all.stream().filter(eq -> {
            if (eq.getLaboratory() == null ||
                eq.getLaboratory().getDepartment() == null ||
                eq.getLaboratory().getDepartment().getInstitution() == null) {
                return false;
            }

            Long eqInstId = eq.getLaboratory().getDepartment().getInstitution().getInstitutionId();

            // Must NOT belong to user's own institute
            if (userInstId != null && userInstId.equals(eqInstId)) {
                return false;
            }

            // If a specific target institution filter is requested
            if (targetInstitutionId != null && !targetInstitutionId.equals(eqInstId)) {
                return false;
            }

            // Only available equipment
            String status = eq.getStatus() != null ? eq.getStatus().toUpperCase() : "";
            return !status.contains("RETIRED") && !status.contains("OUT OF SERVICE") && !status.contains("MAINTENANCE");
        }).collect(Collectors.toList());
    }

    @Override
    public List<Equipment> getActiveSharedEquipmentForInstitution(Long institutionId) {
        List<ResourceSharing> activeSharings = resourceSharingRepository
                .findBySharedWithInstitutionInstitutionIdAndStatusIn(institutionId, List.of("Approved", "Active"));

        return activeSharings.stream()
                .map(ResourceSharing::getEquipment)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public ResourceSharing getSharingRequestById(Long sharingId) {
        return resourceSharingRepository.findById(sharingId)
                .orElseThrow(() -> new RuntimeException("Resource sharing request not found: " + sharingId));
    }

    @Override
    public Map<String, Object> getSharingStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        String role = user.getRole().getRoleName();
        Map<String, Object> stats = new HashMap<>();

        List<ResourceSharing> allSharings = resourceSharingRepository.findAll();
        List<Equipment> allEquipment = equipmentRepository.findAll();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            long totalOwnedEquipment = allEquipment.size();
            long totalSharedEquipment = allSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .map(s -> s.getEquipment().getId())
                    .distinct()
                    .count();
            long activeRequests = allSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()))
                    .count();
            long pendingRequests = allSharings.stream()
                    .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                    .count();
            long approvedRequests = allSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .count();
            double totalRevenue = allSharings.stream()
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .mapToDouble(s -> s.getEstimatedCost() != null ? s.getEstimatedCost() : 0.0)
                    .sum();

            stats.put("totalOwnedEquipment", totalOwnedEquipment);
            stats.put("totalSharedEquipment", totalSharedEquipment);
            stats.put("totalActiveSharingRequests", activeRequests);
            stats.put("pendingRequests", pendingRequests);
            stats.put("approvedRequests", approvedRequests);
            stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        } else {
            Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : 0L;

            long totalOwnedEquipment = allEquipment.stream()
                    .filter(e -> e.getLaboratory() != null && e.getLaboratory().getDepartment() != null 
                            && e.getLaboratory().getDepartment().getInstitution() != null 
                            && e.getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                    .count();

            long totalSharedWithOthers = allSharings.stream()
                    .filter(s -> s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .map(s -> s.getEquipment().getId())
                    .distinct()
                    .count();

            long totalSharedFromOthers = allSharings.stream()
                    .filter(s -> s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .map(s -> s.getEquipment().getId())
                    .distinct()
                    .count();

            long activeRequests = allSharings.stream()
                    .filter(s -> (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId)) 
                            || (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId)))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()))
                    .count();

            long pendingRequests = allSharings.stream()
                    .filter(s -> s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                    .count();

            long approvedRequests = allSharings.stream()
                    .filter(s -> (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId)) 
                            || (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(instId)))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .count();

            double totalRevenue = allSharings.stream()
                    .filter(s -> s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(instId))
                    .filter(s -> "Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus()))
                    .mapToDouble(s -> s.getEstimatedCost() != null ? s.getEstimatedCost() : 0.0)
                    .sum();

            stats.put("totalOwnedEquipment", totalOwnedEquipment);
            stats.put("totalEquipmentSharedWithOthers", totalSharedWithOthers);
            stats.put("totalEquipmentSharedFromOthers", totalSharedFromOthers);
            stats.put("totalActiveSharingRequests", activeRequests);
            stats.put("pendingRequests", pendingRequests);
            stats.put("approvedRequests", approvedRequests);
            stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        }

        return stats;
    }

    @Override
    public ResourceSharingAnalyticsDTO getSharingAnalytics(
            String timeframe, LocalDate startDate, LocalDate endDate,
            Long institutionId, Long departmentId, Long laboratoryId, Long equipmentId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        List<ResourceSharing> list = resourceSharingRepository.findAll();

        // If user is institution admin, scope to their institution unless system admin
        if (!"SYSTEM_ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
            Long userInstId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
            if (userInstId != null) {
                list = list.stream().filter(s -> 
                        (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(userInstId)) ||
                        (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(userInstId))
                ).collect(Collectors.toList());
            }
        }

        // Apply Timeframe Filter
        LocalDate today = LocalDate.now();
        LocalDate start = null;
        LocalDate end = today;

        if ("day".equalsIgnoreCase(timeframe)) {
            start = today;
        } else if ("week".equalsIgnoreCase(timeframe)) {
            start = today.minusDays(7);
        } else if ("month".equalsIgnoreCase(timeframe)) {
            start = today.minusDays(30);
        } else if ("year".equalsIgnoreCase(timeframe)) {
            start = today.minusDays(365);
        } else if ("custom".equalsIgnoreCase(timeframe)) {
            start = startDate != null ? startDate : today.minusDays(30);
            end = endDate != null ? endDate : today;
        }

        if (start != null) {
            final LocalDate fStart = start;
            final LocalDate fEnd = end;
            list = list.stream().filter(s -> {
                LocalDate reqDate = s.getRequestDate() != null ? s.getRequestDate() : (s.getBookingDate() != null ? s.getBookingDate() : LocalDate.now());
                return !reqDate.isBefore(fStart) && !reqDate.isAfter(fEnd);
            }).collect(Collectors.toList());
        }

        // Apply entity filters
        if (institutionId != null) {
            list = list.stream().filter(s -> 
                    (s.getOwnerInstitution() != null && s.getOwnerInstitution().getInstitutionId().equals(institutionId)) ||
                    (s.getSharedWithInstitution() != null && s.getSharedWithInstitution().getInstitutionId().equals(institutionId))
            ).collect(Collectors.toList());
        }

        if (equipmentId != null) {
            list = list.stream().filter(s -> s.getEquipment() != null && s.getEquipment().getId().equals(equipmentId)).collect(Collectors.toList());
        }

        if (laboratoryId != null) {
            list = list.stream().filter(s -> s.getEquipment() != null && s.getEquipment().getLaboratory() != null && s.getEquipment().getLaboratory().getLabId().equals(laboratoryId)).collect(Collectors.toList());
        }

        if (departmentId != null) {
            list = list.stream().filter(s -> s.getEquipment() != null && s.getEquipment().getLaboratory() != null && s.getEquipment().getLaboratory().getDepartment() != null && s.getEquipment().getLaboratory().getDepartment().getDepartmentId().equals(departmentId)).collect(Collectors.toList());
        }

        ResourceSharingAnalyticsDTO dto = new ResourceSharingAnalyticsDTO();

        long total = list.size();
        long approved = list.stream().filter(s -> "Approved".equalsIgnoreCase(s.getStatus())).count();
        long rejected = list.stream().filter(s -> "Rejected".equalsIgnoreCase(s.getStatus())).count();
        long pending = list.stream().filter(s -> "Pending".equalsIgnoreCase(s.getStatus())).count();
        long active = list.stream().filter(s -> "Active".equalsIgnoreCase(s.getStatus()) || "Approved".equalsIgnoreCase(s.getStatus())).count();
        long completed = list.stream().filter(s -> "Completed".equalsIgnoreCase(s.getStatus())).count();

        double totalHours = list.stream()
                .filter(s -> !"Rejected".equalsIgnoreCase(s.getStatus()) && !"Cancelled".equalsIgnoreCase(s.getStatus()))
                .mapToDouble(s -> s.getDuration() != null ? s.getDuration() : 0.0)
                .sum();

        double totalRev = list.stream()
                .filter(s -> !"Rejected".equalsIgnoreCase(s.getStatus()) && !"Cancelled".equalsIgnoreCase(s.getStatus()))
                .mapToDouble(s -> s.getEstimatedCost() != null ? s.getEstimatedCost() : 0.0)
                .sum();

        double approvalRate = total > 0 ? ((double) (approved + completed) / (double) total) * 100.0 : 0.0;

        dto.setTotalRequests(total);
        dto.setApprovedRequests(approved);
        dto.setRejectedRequests(rejected);
        dto.setPendingRequests(pending);
        dto.setActiveShares(active);
        dto.setCompletedShares(completed);
        dto.setTotalDurationHours(Math.round(totalHours * 10.0) / 10.0);
        dto.setTotalRevenue(Math.round(totalRev * 100.0) / 100.0);
        dto.setApprovalRate(Math.round(approvalRate * 10.0) / 10.0);

        // 1. Shares by institute (Inflow vs Outflow)
        Map<String, int[]> instFlow = new HashMap<>(); // [inflow (borrowed), outflow (lent)]
        for (ResourceSharing s : list) {
            if (s.getOwnerInstitution() != null) {
                String ownerName = s.getOwnerInstitution().getInstitutionName();
                instFlow.putIfAbsent(ownerName, new int[]{0, 0});
                instFlow.get(ownerName)[1]++; // outflow
            }
            if (s.getSharedWithInstitution() != null) {
                String borrowerName = s.getSharedWithInstitution().getInstitutionName();
                instFlow.putIfAbsent(borrowerName, new int[]{0, 0});
                instFlow.get(borrowerName)[0]++; // inflow
            }
        }
        List<Map<String, Object>> sharesByInstList = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : instFlow.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("instituteName", entry.getKey());
            map.put("inflowCount", entry.getValue()[0]);
            map.put("outflowCount", entry.getValue()[1]);
            sharesByInstList.add(map);
        }
        dto.setSharesByInstitute(sharesByInstList);

        // 2. Most frequently shared equipment
        Map<String, Map<String, Object>> equipMap = new HashMap<>();
        for (ResourceSharing s : list) {
            if (s.getEquipment() != null) {
                String name = s.getEquipment().getEquipmentName();
                String category = s.getEquipment().getCategory() != null ? s.getEquipment().getCategory() : "General";
                equipMap.putIfAbsent(name, new HashMap<>());
                Map<String, Object> eqData = equipMap.get(name);
                eqData.put("equipmentName", name);
                eqData.put("category", category);
                eqData.put("count", (int) eqData.getOrDefault("count", 0) + 1);
                double dur = s.getDuration() != null ? s.getDuration() : 0.0;
                eqData.put("totalHours", (double) eqData.getOrDefault("totalHours", 0.0) + dur);
            }
        }
        List<Map<String, Object>> topEquip = equipMap.values().stream()
                .sorted((a, b) -> Integer.compare((int) b.get("count"), (int) a.get("count")))
                .limit(8)
                .collect(Collectors.toList());
        dto.setMostFrequentlySharedEquipment(topEquip);

        // 3. Monthly Trends
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Map<String, Integer>> monthMap = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            String mKey = today.minusMonths(i).format(monthFmt);
            Map<String, Integer> counts = new HashMap<>();
            counts.put("requests", 0);
            counts.put("approved", 0);
            counts.put("rejected", 0);
            monthMap.put(mKey, counts);
        }
        for (ResourceSharing s : list) {
            LocalDate d = s.getRequestDate() != null ? s.getRequestDate() : s.getBookingDate();
            if (d != null) {
                String mKey = d.format(monthFmt);
                if (monthMap.containsKey(mKey)) {
                    Map<String, Integer> counts = monthMap.get(mKey);
                    counts.put("requests", counts.get("requests") + 1);
                    if ("Approved".equalsIgnoreCase(s.getStatus()) || "Active".equalsIgnoreCase(s.getStatus()) || "Completed".equalsIgnoreCase(s.getStatus())) {
                        counts.put("approved", counts.get("approved") + 1);
                    } else if ("Rejected".equalsIgnoreCase(s.getStatus())) {
                        counts.put("rejected", counts.get("rejected") + 1);
                    }
                }
            }
        }
        List<Map<String, Object>> trends = new ArrayList<>();
        for (Map.Entry<String, Map<String, Integer>> entry : monthMap.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", entry.getKey());
            map.put("requests", entry.getValue().get("requests"));
            map.put("approved", entry.getValue().get("approved"));
            map.put("rejected", entry.getValue().get("rejected"));
            trends.add(map);
        }
        dto.setMonthlyTrends(trends);

        // 4. Status Breakdown
        Map<String, Long> statusCounts = list.stream()
                .collect(Collectors.groupingBy(s -> s.getStatus() != null ? s.getStatus() : "Unknown", Collectors.counting()));
        List<Map<String, Object>> statusBreakdownList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : statusCounts.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("status", entry.getKey());
            map.put("count", entry.getValue());
            statusBreakdownList.add(map);
        }
        dto.setStatusBreakdown(statusBreakdownList);

        // 5. Duration Distribution
        int d1 = 0, d2 = 0, d3 = 0, d4 = 0;
        for (ResourceSharing s : list) {
            double hrs = s.getDuration() != null ? s.getDuration() : 0.0;
            if (hrs <= 2.0) d1++;
            else if (hrs <= 4.0) d2++;
            else if (hrs <= 8.0) d3++;
            else d4++;
        }
        List<Map<String, Object>> durList = List.of(
                Map.of("range", "1 - 2 Hours", "count", d1),
                Map.of("range", "3 - 4 Hours", "count", d2),
                Map.of("range", "5 - 8 Hours", "count", d3),
                Map.of("range", "8+ Hours", "count", d4)
        );
        dto.setDurationDistribution(durList);

        // 6. Institute Comparison Routes
        Map<String, Map<String, Object>> routeMap = new HashMap<>();
        for (ResourceSharing s : list) {
            if (s.getOwnerInstitution() != null && s.getSharedWithInstitution() != null) {
                String src = s.getOwnerInstitution().getInstitutionName();
                String tgt = s.getSharedWithInstitution().getInstitutionName();
                String key = src + " -> " + tgt;
                routeMap.putIfAbsent(key, new HashMap<>());
                Map<String, Object> rData = routeMap.get(key);
                rData.put("sourceInstitute", src);
                rData.put("targetInstitute", tgt);
                rData.put("count", (int) rData.getOrDefault("count", 0) + 1);
                double cost = s.getEstimatedCost() != null ? s.getEstimatedCost() : 0.0;
                rData.put("totalCost", (double) rData.getOrDefault("totalCost", 0.0) + cost);
            }
        }
        dto.setInstituteComparison(new ArrayList<>(routeMap.values()));

        // 7. Activity Heatmap (Day of Week x Time Slots)
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        String[] slots = {"08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"};

        Map<String, Integer> heatMapCounts = new HashMap<>();
        for (String day : days) {
            for (String slot : slots) {
                heatMapCounts.put(day + "|" + slot, 0);
            }
        }

        for (ResourceSharing s : list) {
            if (s.getBookingDate() != null) {
                String dayName = s.getBookingDate().getDayOfWeek().name();
                String formattedDay = dayName.substring(0, 1) + dayName.substring(1).toLowerCase();

                LocalTime st = s.getStartTime() != null ? s.getStartTime() : LocalTime.of(10, 0);
                int hour = st.getHour();
                String slot;
                if (hour < 10) slot = "08:00 - 10:00";
                else if (hour < 12) slot = "10:00 - 12:00";
                else if (hour < 14) slot = "12:00 - 14:00";
                else if (hour < 16) slot = "14:00 - 16:00";
                else if (hour < 18) slot = "16:00 - 18:00";
                else slot = "18:00 - 20:00";

                String k = formattedDay + "|" + slot;
                heatMapCounts.put(k, heatMapCounts.getOrDefault(k, 0) + 1);
            }
        }

        List<Map<String, Object>> heatmapList = new ArrayList<>();
        for (String day : days) {
            for (String slot : slots) {
                Map<String, Object> pt = new HashMap<>();
                pt.put("dayOfWeek", day);
                pt.put("hourSlot", slot);
                pt.put("count", heatMapCounts.get(day + "|" + slot));
                heatmapList.add(pt);
            }
        }
        dto.setActivityHeatmap(heatmapList);

        return dto;
    }
}
