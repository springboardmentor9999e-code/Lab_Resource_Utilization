package com.labresource.backend.service.impl;

import com.labresource.backend.entity.EquipmentCertification;
import com.labresource.backend.repository.EquipmentCertificationRepository;
import com.labresource.backend.service.EquipmentCertificationService;
//import org.springframework.core.io.UrlResource;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
//import org.springframework.core.io.Resource;
//import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class EquipmentCertificationServiceImpl
        implements EquipmentCertificationService {

    private final EquipmentCertificationRepository repository;
private final UserRepository userRepository;

public EquipmentCertificationServiceImpl(
        EquipmentCertificationRepository repository,
        UserRepository userRepository) {

    this.repository = repository;
    this.userRepository = userRepository;
}

    @Override
    public EquipmentCertification save(
            EquipmentCertification certification) {

        certification.setStatus(
                calculateStatus(certification.getExpiryDate())
        );

        return repository.save(certification);
    }

    @Override
    public List<EquipmentCertification> getAll() {

        return repository.findAll();
    }

    @Override
    public EquipmentCertification getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Certification not found"));
    }

    @Override
    public EquipmentCertification update(
            Long id,
            EquipmentCertification certification) {

        EquipmentCertification existing = getById(id);

        existing.setEquipment(certification.getEquipment());
        existing.setCertificateType(certification.getCertificateType());
        existing.setCertificateNumber(certification.getCertificateNumber());
        existing.setIssuedBy(certification.getIssuedBy());
        existing.setIssueDate(certification.getIssueDate());
        existing.setExpiryDate(certification.getExpiryDate());
        existing.setLastCalibrationDate(certification.getLastCalibrationDate());
        existing.setNextCalibrationDate(certification.getNextCalibrationDate());
        existing.setStatus(
        calculateStatus(certification.getExpiryDate()) );
        existing.setDocumentPath(certification.getDocumentPath());
        existing.setRemarks(certification.getRemarks());

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {

        repository.deleteById(id);
    }

    @Override
    public List<EquipmentCertification> getExpiringCertificates() {

        LocalDate next30Days = LocalDate.now().plusDays(30);

        return repository.findByExpiryDateBefore(next30Days);
    }

    @Override
    public List<EquipmentCertification> getExpiredCertificates() {

        return repository.findByStatus("Expired");
    }

    private String calculateStatus(LocalDate expiryDate) {

    if (expiryDate == null) {
        return "Unknown";
    }

    if (expiryDate.isBefore(LocalDate.now())) {
        return "Expired";
    }

    if (expiryDate.isBefore(LocalDate.now().plusDays(30))) {
        return "Expiring Soon";
    }

    return "Valid";
}

@Override
public List<EquipmentCertification> getRenewalReminders() {

    LocalDate today = LocalDate.now();
    LocalDate next30Days = today.plusDays(30);

    return repository.findAll()
            .stream()
            .filter(cert ->
                    cert.getExpiryDate() != null &&
                    !cert.getExpiryDate().isBefore(today) &&
                    !cert.getExpiryDate().isAfter(next30Days))
            .toList();
}

private User getLoggedInUser() {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    return userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));
}

@Override
public List<EquipmentCertification> getInstitutionCertificates() {

    User user = getLoggedInUser();

    return repository.findByEquipmentLaboratoryInstitutionInstitutionId(
            user.getInstitution().getInstitutionId()
    );
}

@Override
public List<EquipmentCertification> getLaboratoryCertificates() {

    User user = getLoggedInUser();

    return repository.findByEquipmentLaboratoryLabId(
            user.getLaboratory().getLabId()
    );
}

}