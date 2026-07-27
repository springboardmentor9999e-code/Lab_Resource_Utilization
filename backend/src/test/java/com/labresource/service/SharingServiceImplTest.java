package com.labresource.service;

import com.labresource.dto.request.SharingRequestCreate;
import com.labresource.dto.response.SharingRequestResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.service.impl.EmailService;
import com.labresource.service.impl.NotificationService;
import com.labresource.service.impl.SharingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the inter-institution sharing workflow: request validation,
 * fee snapshotting, approval permissions and the auto-created external booking.
 * Pure Mockito — no Spring context or database required.
 */
@ExtendWith(MockitoExtension.class)
class SharingServiceImplTest {

    @Mock private SharingRequestRepository sharingRequestRepository;
    @Mock private SharingAgreementRepository sharingAgreementRepository;
    @Mock private SharedEquipmentRepository sharedEquipmentRepository;
    @Mock private InstitutionRepository institutionRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private BookingHistoryRepository bookingHistoryRepository;
    @Mock private EmailService emailService;
    @Mock private NotificationService notificationService;

    @InjectMocks private SharingServiceImpl sharingService;

    private Institution ownerInst;
    private Institution requesterInst;
    private AppUser requester;
    private AppUser approver;
    private Equipment equipment;

    private final LocalDate tomorrow = LocalDate.now().plusDays(1);

    @BeforeEach
    void setUp() {
        ownerInst = Institution.builder().institutionId(1L).name("Owner University")
                .code("OU").email("admin@owner.edu").build();
        requesterInst = Institution.builder().institutionId(2L).name("Requester College").code("RC").build();

        requester = AppUser.builder()
                .userId(1L).username("researcher").firstName("Rita").lastName("Researcher")
                .email("rita@rc.edu").institution(requesterInst).userRoles(new HashSet<>()).build();

        approver = withRole(AppUser.builder()
                .userId(2L).username("labmgr").firstName("Mo").lastName("Manager")
                .email("mo@owner.edu").institution(ownerInst).userRoles(new HashSet<>()).build(),
                "LAB_MANAGER");

        equipment = Equipment.builder()
                .equipmentId(10L).equipmentName("Electron Microscope").equipmentCode("EQ-1")
                .status("AVAILABLE").isShareable(true).institution(ownerInst)
                .hourlyRate(new BigDecimal("100.00")).build();
    }

    private AppUser withRole(AppUser user, String roleName) {
        Role role = Role.builder().roleId(99L).roleName(roleName).build();
        user.getUserRoles().add(UserRole.builder()
                .id(new UserRoleId(user.getUserId(), role.getRoleId()))
                .user(user).role(role).build());
        return user;
    }

    private SharingRequestCreate createDto() {
        SharingRequestCreate dto = new SharingRequestCreate();
        dto.setEquipmentId(10L);
        dto.setPurpose("Nanomaterial imaging study");
        dto.setRequestedDate(tomorrow);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(11, 30));
        return dto;
    }

    private SharingRequest pendingRequest() {
        return SharingRequest.builder()
                .sharingRequestId(500L).equipment(equipment)
                .fromInstitution(requesterInst).toInstitution(ownerInst)
                .requestedBy(requester).purpose("Study")
                .requestedDate(tomorrow)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .status("PENDING").build();
    }

    // -------------------- createRequest --------------------

    @Test
    void createRequest_snapshotsFeeFromHourlyRate() {
        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(sharingRequestRepository.existsPendingDuplicate(1L, 10L, tomorrow)).thenReturn(false);
        when(sharingRequestRepository.save(any(SharingRequest.class))).thenAnswer(inv -> {
            SharingRequest r = inv.getArgument(0);
            r.setSharingRequestId(500L);
            return r;
        });

        SharingRequestResponse resp = sharingService.createRequest("researcher", createDto());

        // 2.5 h x 100.00/h = 250.00
        assertEquals(0, new BigDecimal("250.00").compareTo(resp.getEstimatedFee()));
        assertEquals("PENDING", resp.getStatus());
        // Owner institution has an email — a notification mail must go out
        verify(emailService).sendNotificationEmail(eq("admin@owner.edu"), anyString(), anyString());
    }

    // -------------------- agreements governing a request --------------------

    @Test
    void createRequest_appliesAgreementDiscountToFee() {
        SharingAgreement agreement = SharingAgreement.builder()
                .agreementId(7L).fromInstitution(requesterInst).toInstitution(ownerInst)
                .status("ACTIVE").startDate(LocalDate.now().minusDays(30))
                .discountPercent(new BigDecimal("20.00")).autoApprove(false).build();

        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(sharingRequestRepository.existsPendingDuplicate(1L, 10L, tomorrow)).thenReturn(false);
        when(sharingAgreementRepository.findEffective(2L, 1L, tomorrow))
                .thenReturn(Optional.of(agreement));
        when(sharingRequestRepository.save(any(SharingRequest.class))).thenAnswer(inv -> {
            SharingRequest r = inv.getArgument(0);
            r.setSharingRequestId(500L);
            return r;
        });

        SharingRequestResponse resp = sharingService.createRequest("researcher", createDto());

        // 2.5 h x 100.00/h = 250.00, less 20% = 200.00
        assertEquals(0, new BigDecimal("200.00").compareTo(resp.getEstimatedFee()));
        assertEquals("PENDING", resp.getStatus());
    }

    @Test
    void createRequest_autoApprovesUnderAgreementAndCreatesBooking() {
        SharingAgreement agreement = SharingAgreement.builder()
                .agreementId(7L).fromInstitution(requesterInst).toInstitution(ownerInst)
                .status("ACTIVE").startDate(LocalDate.now().minusDays(30))
                .discountPercent(BigDecimal.ZERO).autoApprove(true).build();

        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(sharingRequestRepository.existsPendingDuplicate(1L, 10L, tomorrow)).thenReturn(false);
        when(sharingAgreementRepository.findEffective(2L, 1L, tomorrow))
                .thenReturn(Optional.of(agreement));
        when(bookingRepository.hasOverlappingBooking(anyLong(), any(), any(), any())).thenReturn(false);
        when(sharingRequestRepository.save(any(SharingRequest.class))).thenAnswer(inv -> {
            SharingRequest r = inv.getArgument(0);
            r.setSharingRequestId(500L);
            return r;
        });

        SharingRequestResponse resp = sharingService.createRequest("researcher", createDto());

        // The agreement IS the approval — a second human decision would defeat its purpose
        assertEquals("APPROVED", resp.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createRequest_rejectsWhenAgreementMonthlyCapWouldBeExceeded() {
        SharingAgreement agreement = SharingAgreement.builder()
                .agreementId(7L).fromInstitution(requesterInst).toInstitution(ownerInst)
                .status("ACTIVE").startDate(LocalDate.now().minusDays(30))
                .discountPercent(BigDecimal.ZERO).autoApprove(false)
                .maxHoursPerMonth(10).build();

        // 9 hours already committed this month; this request asks for another 2.5
        SharingRequest existing = SharingRequest.builder()
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(18, 0)).build();

        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(sharingRequestRepository.existsPendingDuplicate(1L, 10L, tomorrow)).thenReturn(false);
        when(sharingAgreementRepository.findEffective(2L, 1L, tomorrow))
                .thenReturn(Optional.of(agreement));
        when(sharingRequestRepository.findByAgreementInMonth(eq(7L), any(), any(), anyList()))
                .thenReturn(java.util.List.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.createRequest("researcher", createDto()));

        assertTrue(ex.getMessage().contains("monthly cap"));
        verify(sharingRequestRepository, never()).save(any());
    }

    @Test
    void createRequest_rejectsNonShareableEquipment() {
        equipment.setIsShareable(false);
        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.createRequest("researcher", createDto()));
        assertTrue(ex.getMessage().contains("not listed"));
        verify(sharingRequestRepository, never()).save(any());
    }

    @Test
    void createRequest_rejectsOwnInstitutionEquipment() {
        requester.setInstitution(ownerInst); // same institution as the equipment
        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.createRequest("researcher", createDto()));
        assertTrue(ex.getMessage().contains("own institution"));
    }

    @Test
    void createRequest_rejectsPendingDuplicate() {
        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharedEquipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(sharingRequestRepository.existsPendingDuplicate(1L, 10L, tomorrow)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.createRequest("researcher", createDto()));
        assertTrue(ex.getMessage().contains("pending sharing request"));
    }

    // -------------------- approve --------------------

    @Test
    void approve_createsConfirmedBookingAndReservesEquipment() {
        SharingRequest request = pendingRequest();
        when(appUserRepository.findByUsername("labmgr")).thenReturn(Optional.of(approver));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(request));
        when(bookingRepository.hasOverlappingBooking(10L, tomorrow,
                request.getStartTime(), request.getEndTime())).thenReturn(false);
        when(sharingRequestRepository.save(any(SharingRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        SharingRequestResponse resp = sharingService.approve(500L, "labmgr", "ok");

        assertEquals("APPROVED", resp.getStatus());
        assertEquals("RESERVED", equipment.getStatus());
        verify(bookingRepository).save(argThat(b ->
                "CONFIRMED".equals(b.getStatus()) && b.getUser() == requester));
        verify(bookingHistoryRepository).save(any(BookingHistory.class)); // audit trail
        verify(notificationService).notifyInApp(eq(requester), eq("SHARING"), anyString(), anyString(), anyString());
    }

    @Test
    void approve_rejectedWhenSlotTakenMeanwhile() {
        SharingRequest request = pendingRequest();
        when(appUserRepository.findByUsername("labmgr")).thenReturn(Optional.of(approver));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(request));
        when(bookingRepository.hasOverlappingBooking(any(), any(), any(), any())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.approve(500L, "labmgr", null));
        assertTrue(ex.getMessage().contains("Slot no longer available"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void approve_rejectsApproverFromWrongInstitution() {
        AppUser outsider = withRole(AppUser.builder()
                .userId(3L).username("othermgr").institution(requesterInst)
                .userRoles(new HashSet<>()).build(), "LAB_MANAGER");
        when(appUserRepository.findByUsername("othermgr")).thenReturn(Optional.of(outsider));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.approve(500L, "othermgr", null));
        assertTrue(ex.getMessage().contains("your own institution"));
    }

    @Test
    void approve_rejectsUserWithoutApproverRole() {
        AppUser plainUser = AppUser.builder()
                .userId(4L).username("student").institution(ownerInst)
                .userRoles(new HashSet<>()).build();
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(plainUser));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.approve(500L, "student", null));
        assertTrue(ex.getMessage().contains("permission"));
    }

    @Test
    void approve_rejectsNonPendingRequest() {
        SharingRequest request = pendingRequest();
        request.setStatus("APPROVED");
        when(appUserRepository.findByUsername("labmgr")).thenReturn(Optional.of(approver));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(request));

        assertThrows(RuntimeException.class, () -> sharingService.approve(500L, "labmgr", null));
    }

    // -------------------- reject / cancel --------------------

    @Test
    void reject_setsStatusAndNotifiesRequester() {
        when(appUserRepository.findByUsername("labmgr")).thenReturn(Optional.of(approver));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest()));
        when(sharingRequestRepository.save(any(SharingRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        SharingRequestResponse resp = sharingService.reject(500L, "labmgr", "Not available that week");

        assertEquals("REJECTED", resp.getStatus());
        assertEquals("Not available that week", resp.getRemarks());
        verify(bookingRepository, never()).save(any()); // no booking on rejection
        verify(notificationService).notifyInApp(eq(requester), eq("SHARING"), anyString(), anyString(), anyString());
    }

    @Test
    void cancel_onlyRequesterAllowed() {
        when(appUserRepository.findByUsername("labmgr")).thenReturn(Optional.of(approver));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest()));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sharingService.cancel(500L, "labmgr"));
        assertTrue(ex.getMessage().contains("Only the requester"));
    }

    @Test
    void cancel_requesterCancelsPendingRequest() {
        SharingRequest request = pendingRequest();
        when(appUserRepository.findByUsername("researcher")).thenReturn(Optional.of(requester));
        when(sharingRequestRepository.findById(500L)).thenReturn(Optional.of(request));

        sharingService.cancel(500L, "researcher");

        assertEquals("CANCELLED", request.getStatus());
        verify(sharingRequestRepository).save(request);
    }
}
