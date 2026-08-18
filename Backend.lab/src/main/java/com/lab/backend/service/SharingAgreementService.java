package com.lab.backend.service;

import com.lab.backend.dto.SharingAgreementDTO;
import com.lab.backend.entity.Laboratory;
import com.lab.backend.entity.SharingAgreement;
import com.lab.backend.enums.SharingStatus;
import com.lab.backend.exception.ResourceNotFoundException;
import com.lab.backend.repository.LaboratoryRepository;
import com.lab.backend.repository.SharingAgreementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SharingAgreementService {

    private final SharingAgreementRepository sharingAgreementRepository;
    private final LaboratoryRepository laboratoryRepository;

    public SharingAgreementService(SharingAgreementRepository sharingAgreementRepository,
                                   LaboratoryRepository laboratoryRepository) {
        this.sharingAgreementRepository = sharingAgreementRepository;
        this.laboratoryRepository = laboratoryRepository;
    }

    public SharingAgreement createAgreement(SharingAgreementDTO dto) {
        Laboratory providerLab = laboratoryRepository.findById(dto.getProviderLaboratoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider laboratory not found with ID: " + dto.getProviderLaboratoryId()));

        Laboratory requestingLab = laboratoryRepository.findById(dto.getRequestingLaboratoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Requesting laboratory not found with ID: " + dto.getRequestingLaboratoryId()));

        SharingAgreement agreement = new SharingAgreement();
        agreement.setTitle(dto.getTitle());
        agreement.setAgreementNumber(dto.getAgreementNumber() != null ? dto.getAgreementNumber() : "SA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        agreement.setProviderLaboratory(providerLab);
        agreement.setRequestingLaboratory(requestingLab);
        agreement.setStartDate(dto.getStartDate());
        agreement.setEndDate(dto.getEndDate());
        agreement.setTerms(dto.getTerms());
        agreement.setSharingQuota(dto.getSharingQuota() != null ? dto.getSharingQuota() : 10);
        agreement.setStatus(SharingStatus.PENDING);

        return sharingAgreementRepository.save(agreement);
    }

    public List<SharingAgreement> getAllAgreements() {
        return sharingAgreementRepository.findAll();
    }

    public SharingAgreement getAgreementById(Long id) {
        return sharingAgreementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sharing agreement not found with ID: " + id));
    }

    public List<SharingAgreement> getAgreementsByLabId(Long labId) {
        return sharingAgreementRepository.findByLaboratoryId(labId);
    }

    public List<SharingAgreement> getAgreementsByStatus(SharingStatus status) {
        return sharingAgreementRepository.findByStatus(status);
    }

    public SharingAgreement approveAgreement(Long id) {
        SharingAgreement agreement = getAgreementById(id);
        agreement.setStatus(SharingStatus.APPROVED);
        return sharingAgreementRepository.save(agreement);
    }

    public SharingAgreement activateAgreement(Long id) {
        SharingAgreement agreement = getAgreementById(id);
        agreement.setStatus(SharingStatus.ACTIVE);
        return sharingAgreementRepository.save(agreement);
    }

    public SharingAgreement rejectAgreement(Long id) {
        SharingAgreement agreement = getAgreementById(id);
        agreement.setStatus(SharingStatus.REJECTED);
        return sharingAgreementRepository.save(agreement);
    }

    public SharingAgreement terminateAgreement(Long id) {
        SharingAgreement agreement = getAgreementById(id);
        agreement.setStatus(SharingStatus.CANCELLED);
        return sharingAgreementRepository.save(agreement);
    }

    public void deleteAgreement(Long id) {
        SharingAgreement agreement = getAgreementById(id);
        sharingAgreementRepository.delete(agreement);
    }
}
