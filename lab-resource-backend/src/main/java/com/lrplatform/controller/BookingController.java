package com.lrplatform.controller;

import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.BookingResponse;
import com.lrplatform.dto.response.BookingWaitlistResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<PaginatedResponse<BookingResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        List<Booking> all = bookingService.getFilteredBookings(user);
        int start = page * size;
        int end = Math.min(start + size, all.size());
        List<Booking> pageContent = start < all.size() ? all.subList(start, end) : List.of();

        return ResponseEntity.ok(PaginatedResponse.<BookingResponse>builder()
                .content(pageContent.stream().map(this::toDto).toList())
                .totalElements(all.size())
                .totalPages((int) Math.ceil((double) all.size() / size))
                .currentPage(page)
                .pageSize(size)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@RequestBody Booking booking, HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        bookingService.createBooking(booking, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(bookingService.getMyBookings(userId).stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(bookingService.getBookingById(id)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getPendingApprovals(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        List<Booking> pending;
        switch (currentUser.getRole()) {
            case DEPARTMENT_HEAD, LAB_MANAGER -> pending = currentUser.getDepartment() != null
                    ? bookingService.getPendingApprovalsByDepartment(currentUser.getDepartment().getId())
                    : List.of();
            case INSTITUTION_ADMIN -> pending = currentUser.getInstitution() != null
                    ? bookingService.getPendingApprovals().stream()
                        .filter(b -> b.getEquipment() != null
                                && b.getEquipment().getLaboratory() != null
                                && b.getEquipment().getLaboratory().getDepartment() != null
                                && b.getEquipment().getLaboratory().getDepartment().getInstitution() != null
                                && b.getEquipment().getLaboratory().getDepartment().getInstitution().getId()
                                    .equals(currentUser.getInstitution().getId()))
                        .toList()
                    : List.of();
            default -> pending = bookingService.getPendingApprovals();
        }
        return ResponseEntity.ok(pending.stream().map(this::toDto).toList());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> approve(@PathVariable Long id,
                                               @RequestBody(required = false) Map<String, String> body,
                                               HttpServletRequest request) {
        Long managerId = currentUserUtil.getCurrentUserId(request);
        String remarks = body != null ? body.get("remarks") : "Approved";
        bookingService.approveBooking(id, managerId, remarks);
        return ResponseEntity.ok(ApiResponse.success("Booking approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> reject(@PathVariable Long id,
                                              @RequestBody(required = false) Map<String, String> body,
                                              HttpServletRequest request) {
        Long managerId = currentUserUtil.getCurrentUserId(request);
        String remarks = body != null ? body.get("remarks") : "Rejected";
        bookingService.rejectBooking(id, managerId, remarks);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('RESEARCHER', 'STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> cancel(@PathVariable Long id, HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled"));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> complete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        bookingService.completeBooking(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Booking completed and invoice generated"));
    }

    @PostMapping("/waitlist")
    public ResponseEntity<ApiResponse> joinWaitlist(@RequestBody Map<String, Long> body,
                                                     HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        Long equipmentId = body.get("equipmentId");
        bookingService.joinWaitlist(equipmentId, userId);
        return ResponseEntity.ok(ApiResponse.success("Added to waitlist"));
    }

    @GetMapping("/waitlist")
    public ResponseEntity<List<BookingWaitlistResponse>> getWaitlist(
            @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(bookingService.getWaitlistByEquipment(equipmentId));
    }

    @DeleteMapping("/waitlist/{id}")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> removeFromWaitlist(@PathVariable Long id, HttpServletRequest request) {
        Long managerId = currentUserUtil.getCurrentUserId(request);
        bookingService.removeFromWaitlist(id, managerId);
        return ResponseEntity.ok(ApiResponse.success("Removed from waitlist"));
    }

    @PutMapping("/waitlist/{id}/promote")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> promoteFromWaitlist(@PathVariable Long id, HttpServletRequest request) {
        Long managerId = currentUserUtil.getCurrentUserId(request);
        bookingService.promoteFromWaitlistManual(id, managerId);
        return ResponseEntity.ok(ApiResponse.success("User promoted from waitlist"));
    }

    private BookingResponse toDto(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .equipmentId(b.getEquipment() != null ? b.getEquipment().getId() : null)
                .equipmentName(b.getEquipment() != null ? b.getEquipment().getEquipmentName() : null)
                .equipmentCode(b.getEquipment() != null ? b.getEquipment().getEquipmentCode() : null)
                .userId(b.getUser() != null ? b.getUser().getId() : null)
                .userFullName(b.getUser() != null ? b.getUser().getFirstName() + " " + b.getUser().getLastName() : null)
                .userEmail(b.getUser() != null ? b.getUser().getEmail() : null)
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .approvedById(b.getApprovedBy() != null ? b.getApprovedBy().getId() : null)
                .approvedByName(b.getApprovedBy() != null ? b.getApprovedBy().getFirstName() + " " + b.getApprovedBy().getLastName() : null)
                .approvedAt(b.getApprovedAt())
                .remarks(b.getRemarks())
                .userRole(b.getUser() != null && b.getUser().getRole() != null ? b.getUser().getRole().name() : null)
                .userInstitutionName(b.getUser() != null && b.getUser().getInstitution() != null ? b.getUser().getInstitution().getInstitutionName() : null)
                .userDepartmentName(b.getUser() != null && b.getUser().getDepartment() != null ? b.getUser().getDepartment().getDepartmentName() : null)
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
