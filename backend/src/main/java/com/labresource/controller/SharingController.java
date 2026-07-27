package com.labresource.controller;

import com.labresource.dto.request.SharingAgreementCreate;
import com.labresource.dto.request.SharingRequestCreate;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.PartnershipReportResponse;
import com.labresource.dto.response.SharedEquipmentResponse;
import com.labresource.dto.response.SharingAgreementResponse;
import com.labresource.dto.response.SharingRequestResponse;
import com.labresource.service.interfaces.SharingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Inter-Institution Resource Sharing REST API.
 *
 * Permission matrix:
 *   Discover / create / outgoing / cancel : all authenticated users
 *   Incoming / approve / reject           : SYSTEM_ADMIN, INSTITUTION_ADMIN,
 *                                           DEPARTMENT_HEAD, LAB_MANAGER
 *   (approver must additionally belong to the owning institution — enforced in service)
 */
@RestController
@RequestMapping("/api/sharing")
@RequiredArgsConstructor
public class SharingController {

    private final SharingService sharingService;

    @GetMapping("/discover")
    public ResponseEntity<List<SharedEquipmentResponse>> discover(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Principal principal) {
        return ResponseEntity.ok(
                sharingService.discoverShareableEquipment(principal.getName(), search, category));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<SharingRequestResponse>> createRequest(
            @Valid @RequestBody SharingRequestCreate request,
            Principal principal) {
        SharingRequestResponse response = sharingService.createRequest(principal.getName(), request);
        return new ResponseEntity<>(
                ApiResponse.<SharingRequestResponse>builder()
                        .success(true)
                        .message("Sharing request submitted successfully")
                        .data(response)
                        .build(),
                HttpStatus.CREATED);
    }

    @GetMapping("/requests/incoming")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<List<SharingRequestResponse>> listIncoming(Principal principal) {
        return ResponseEntity.ok(sharingService.listIncoming(principal.getName()));
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<SharingRequestResponse>> listOutgoing(Principal principal) {
        return ResponseEntity.ok(sharingService.listOutgoing(principal.getName()));
    }

    @PatchMapping("/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<SharingRequestResponse>> approve(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks,
            Principal principal) {
        SharingRequestResponse response = sharingService.approve(id, principal.getName(), remarks);
        return ResponseEntity.ok(
                ApiResponse.<SharingRequestResponse>builder()
                        .success(true)
                        .message("Sharing request approved and booking created")
                        .data(response)
                        .build());
    }

    @PatchMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<SharingRequestResponse>> reject(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks,
            Principal principal) {
        SharingRequestResponse response = sharingService.reject(id, principal.getName(), remarks);
        return ResponseEntity.ok(
                ApiResponse.<SharingRequestResponse>builder()
                        .success(true)
                        .message("Sharing request rejected")
                        .data(response)
                        .build());
    }

    // ------------------------------------------------------------------
    // Sharing agreements — the standing framework requests are judged under
    // ------------------------------------------------------------------

    @GetMapping("/agreements")
    public ResponseEntity<List<SharingAgreementResponse>> listAgreements(Principal principal) {
        return ResponseEntity.ok(sharingService.listAgreements(principal.getName()));
    }

    @PostMapping("/agreements")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<SharingAgreementResponse>> proposeAgreement(
            @Valid @RequestBody SharingAgreementCreate request, Principal principal) {
        SharingAgreementResponse created = sharingService.proposeAgreement(principal.getName(), request);
        return new ResponseEntity<>(
                new ApiResponse<>(true, "Sharing agreement proposed — awaiting the partner's activation", created),
                HttpStatus.CREATED);
    }

    @PatchMapping("/agreements/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<ApiResponse<SharingAgreementResponse>> updateAgreementStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        SharingAgreementResponse updated =
                sharingService.updateAgreementStatus(id, status, principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true,
                "Agreement is now " + updated.getStatus(), updated));
    }

    /** Sharing analytics and partnership reporting for the caller's institution. */
    @GetMapping("/partnerships")
    public ResponseEntity<PartnershipReportResponse> getPartnershipReport(
            @RequestParam(defaultValue = "90") int days,
            Principal principal) {
        return ResponseEntity.ok(sharingService.getPartnershipReport(principal.getName(), days));
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id, Principal principal) {
        sharingService.cancel(id, principal.getName());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Sharing request cancelled")
                        .build());
    }
}
