package com.labresource.service;

import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.service.impl.BillingService;
import com.labresource.service.impl.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for inter-institution invoice generation rules.
 */
@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private SharingRequestRepository sharingRequestRepository;
    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private UtilizationBookingRepository utilizationBookingRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private BillingService billingService;

    private Institution owner;
    private Institution requesterInst;
    private AppUser issuer;
    private AppUser requester;
    private Equipment equipment;
    private SharingRequest sharingRequest;

    @BeforeEach
    void setUp() {
        owner = Institution.builder().institutionId(1L).name("Owner University").build();
        requesterInst = Institution.builder().institutionId(2L).name("Partner College").build();
        issuer = AppUser.builder().userId(5L).username("owner_mgr").firstName("Owen").lastName("Manager")
                .institution(owner).build();
        requester = AppUser.builder().userId(6L).username("partner_user").firstName("Pat").lastName("Requester")
                .email("pat@partner.local").institution(requesterInst).build();
        equipment = Equipment.builder().equipmentId(20L).equipmentName("Mass Spectrometer").build();

        sharingRequest = SharingRequest.builder()
                .sharingRequestId(50L).equipment(equipment)
                .fromInstitution(requesterInst).toInstitution(owner)
                .requestedBy(requester)
                .requestedDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .status("APPROVED").hourlyRate(new BigDecimal("500.00")).estimatedFee(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    void generateInvoice_createsInvoiceForApprovedRequestWithFee() {
        when(appUserRepository.findByUsername("owner_mgr")).thenReturn(Optional.of(issuer));
        when(sharingRequestRepository.findById(50L)).thenReturn(Optional.of(sharingRequest));
        when(invoiceRepository.existsBySharingRequest_SharingRequestId(50L)).thenReturn(false);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            if (i.getInvoiceId() == null) i.setInvoiceId(999L);
            i.prePersist(); // simulate JPA lifecycle (sets issuedDate/dueDate/status)
            return i;
        });

        var result = billingService.generateInvoiceFromSharing(50L, "owner_mgr");

        assertEquals(new BigDecimal("1000.00"), result.get("amount"));
        assertEquals("Owner University", result.get("fromInstitutionName")); // owner issues/receives
        assertEquals("Partner College", result.get("toInstitutionName"));    // requester is billed
        assertEquals("PENDING", result.get("status"));
        verify(notificationService).notify(eq(requester), eq("BILLING"), anyString(), anyString(), anyString());
    }

    @Test
    void generateInvoice_rejectsWhenNoFee() {
        sharingRequest.setEstimatedFee(BigDecimal.ZERO);
        when(appUserRepository.findByUsername("owner_mgr")).thenReturn(Optional.of(issuer));
        when(sharingRequestRepository.findById(50L)).thenReturn(Optional.of(sharingRequest));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                billingService.generateInvoiceFromSharing(50L, "owner_mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("no usage fee"));
    }

    @Test
    void generateInvoice_rejectsWhenNotApproved() {
        sharingRequest.setStatus("PENDING");
        when(appUserRepository.findByUsername("owner_mgr")).thenReturn(Optional.of(issuer));
        when(sharingRequestRepository.findById(50L)).thenReturn(Optional.of(sharingRequest));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                billingService.generateInvoiceFromSharing(50L, "owner_mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("approved"));
    }

    @Test
    void generateInvoice_rejectsWhenIssuerNotOwningInstitution() {
        issuer.setInstitution(requesterInst); // issuer belongs to the WRONG institution
        when(appUserRepository.findByUsername("owner_mgr")).thenReturn(Optional.of(issuer));
        when(sharingRequestRepository.findById(50L)).thenReturn(Optional.of(sharingRequest));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                billingService.generateInvoiceFromSharing(50L, "owner_mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("owning institution"));
    }

    @Test
    void generateInvoice_rejectsDuplicate() {
        when(appUserRepository.findByUsername("owner_mgr")).thenReturn(Optional.of(issuer));
        when(sharingRequestRepository.findById(50L)).thenReturn(Optional.of(sharingRequest));
        when(invoiceRepository.existsBySharingRequest_SharingRequestId(50L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                billingService.generateInvoiceFromSharing(50L, "owner_mgr"));
        assertTrue(ex.getMessage().toLowerCase().contains("already exists"));
    }
}
