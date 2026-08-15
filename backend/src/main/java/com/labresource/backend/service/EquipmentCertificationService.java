package com.labresource.backend.service;

import com.labresource.backend.entity.EquipmentCertification;
//import org.springframework.core.io.Resource;
import java.util.List;

//import org.springframework.http.ResponseEntity;

public interface EquipmentCertificationService {

    EquipmentCertification save(EquipmentCertification certification);

    List<EquipmentCertification> getAll();

    EquipmentCertification getById(Long id);

    EquipmentCertification update(Long id, EquipmentCertification certification);

    void delete(Long id);

    List<EquipmentCertification> getExpiringCertificates();

    List<EquipmentCertification> getExpiredCertificates();
    List<EquipmentCertification> getRenewalReminders();
    
    List<EquipmentCertification> getInstitutionCertificates();

    List<EquipmentCertification> getLaboratoryCertificates();
}