package com.labhub.service;

import com.labhub.dto.institution.DepartmentDTO;
import com.labhub.dto.institution.InstitutionDTO;
import com.labhub.enums.InstitutionStatus;

import java.util.List;
import java.util.UUID;

public interface InstitutionService {
    List<InstitutionDTO> getAllInstitutions();
    List<InstitutionDTO> getApprovedInstitutions();
    List<DepartmentDTO> getDepartmentsByInstitution(UUID institutionId);
    InstitutionDTO updateInstitutionStatus(UUID id, InstitutionStatus status);
    DepartmentDTO createDepartment(UUID institutionId, String name, String description);
}

