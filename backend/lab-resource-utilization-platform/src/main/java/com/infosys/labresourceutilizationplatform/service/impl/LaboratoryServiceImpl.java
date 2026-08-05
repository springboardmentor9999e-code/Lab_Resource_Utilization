package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Department;
import com.infosys.labresourceutilizationplatform.entity.Laboratory;
import com.infosys.labresourceutilizationplatform.repository.DepartmentRepository;
import com.infosys.labresourceutilizationplatform.repository.LaboratoryRepository;
import com.infosys.labresourceutilizationplatform.service.LaboratoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratoryServiceImpl implements LaboratoryService {

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public Laboratory addLaboratory(Laboratory laboratory) {

        if (laboratoryRepository.existsByLabNameAndDepartmentDepartmentId(
                laboratory.getLabName(), laboratory.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Laboratory with this name already exists in the department.");
        }

        Department department = departmentRepository.findById(
                laboratory.getDepartment().getDepartmentId()
        ).orElseThrow(() -> new RuntimeException("Department not found"));

        laboratory.setDepartment(department);

        return laboratoryRepository.save(laboratory);
    }

    @Override
    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }

    @Override
    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laboratory not found"));
    }

    @Override
    public List<Laboratory> getLaboratoriesByDepartment(Long departmentId) {
        return laboratoryRepository.findByDepartmentDepartmentId(departmentId);
    }

    @Override
    public Laboratory updateLaboratory(Long id, Laboratory laboratory) {

        if (laboratoryRepository.existsByLabNameAndDepartmentDepartmentIdAndLabIdNot(
                laboratory.getLabName(), laboratory.getDepartment().getDepartmentId(), id)) {
            throw new RuntimeException("Laboratory with this name already exists in the department.");
        }

        Laboratory existingLab = getLaboratoryById(id);

        Department department = departmentRepository.findById(
                laboratory.getDepartment().getDepartmentId()
        ).orElseThrow(() -> new RuntimeException("Department not found"));

        existingLab.setLabName(laboratory.getLabName());
        existingLab.setDepartment(department);
        existingLab.setDescription(laboratory.getDescription());

        return laboratoryRepository.save(existingLab);
    }

    @Override
    public void deleteLaboratory(Long id) {

        Laboratory laboratory = getLaboratoryById(id);

        laboratoryRepository.delete(laboratory);
    }
}