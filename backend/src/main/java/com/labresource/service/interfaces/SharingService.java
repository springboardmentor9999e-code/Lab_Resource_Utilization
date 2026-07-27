package com.labresource.service.interfaces;

import com.labresource.dto.request.SharingAgreementCreate;
import com.labresource.dto.request.SharingRequestCreate;
import com.labresource.dto.response.PartnershipReportResponse;
import com.labresource.dto.response.SharedEquipmentResponse;
import com.labresource.dto.response.SharingAgreementResponse;
import com.labresource.dto.response.SharingRequestResponse;

import java.util.List;

public interface SharingService {

    List<SharedEquipmentResponse> discoverShareableEquipment(String username, String search, String category);

    SharingRequestResponse createRequest(String username, SharingRequestCreate request);

    List<SharingRequestResponse> listIncoming(String username);

    List<SharingRequestResponse> listOutgoing(String username);

    SharingRequestResponse approve(Long id, String username, String remarks);

    SharingRequestResponse reject(Long id, String username, String remarks);

    void cancel(Long id, String username);

    // ---- Sharing agreements: the standing framework requests are evaluated under ----

    /** Agreements the caller's institution is party to, in either direction. */
    List<SharingAgreementResponse> listAgreements(String username);

    /** Proposes an agreement letting the caller's institution borrow from the named partner. */
    SharingAgreementResponse proposeAgreement(String username, SharingAgreementCreate request);

    /**
     * Moves an agreement to a new status. Activating is the owning institution's call — only they
     * can grant access to their own equipment.
     */
    SharingAgreementResponse updateAgreementStatus(Long agreementId, String status, String username);

    // ---- Partnership reporting ----

    /** Per-partner sharing activity and value for the caller's institution. */
    PartnershipReportResponse getPartnershipReport(String username, int days);
}
