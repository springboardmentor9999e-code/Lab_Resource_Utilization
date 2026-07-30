package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Laboratory;

import java.util.List;

public interface LaboratoryService {

    Laboratory addLaboratory(Laboratory laboratory);

    List<Laboratory> getAllLaboratories();

    Laboratory getLaboratoryById(Long id);

    List<Laboratory> getLaboratoriesByDepartment(Long departmentId);

    Laboratory updateLaboratory(Long id, Laboratory laboratory);

    void deleteLaboratory(Long id);
}