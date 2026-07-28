package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.DuplicateResourceException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.Laboratory;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.LaboratoryRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Institution getInstitutionById(Long id) {
        return institutionRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));
    }

    @Auditable(module = "INSTITUTION", action = "CREATE", entityType = "Institution")
    @Transactional
    public Institution createInstitution(Institution institution) {
        if (institutionRepository.existsByInstitutionCode(institution.getInstitutionCode())) {
            throw new DuplicateResourceException("Institution code already exists: " + institution.getInstitutionCode());
        }
        return institutionRepository.save(institution);
    }

    @Auditable(module = "INSTITUTION", action = "UPDATE", entityType = "Institution")
    @Transactional
    public Institution updateInstitution(Long id, Institution updated) {
        Institution institution = getInstitutionById(id);
        institution.setInstitutionName(updated.getInstitutionName());
        institution.setEmail(updated.getEmail());
        institution.setPhone(updated.getPhone());
        institution.setWebsite(updated.getWebsite());
        institution.setAddress(updated.getAddress());
        institution.setCity(updated.getCity());
        institution.setState(updated.getState());
        institution.setCountry(updated.getCountry());
        return institutionRepository.save(institution);
    }

    @Auditable(module = "INSTITUTION", action = "DELETE", entityType = "Institution")
    @Transactional
    public void deleteInstitution(Long id) {
        Institution institution = getInstitutionById(id);
        List<Department> departments = departmentRepository.findByInstitutionId(id);
        if (!departments.isEmpty()) {
            throw new BadRequestException("Cannot delete institution with " + departments.size() + " department(s). Remove all departments first.");
        }
        institutionRepository.delete(Objects.requireNonNull(institution));
    }

    // Department methods
    @Transactional(readOnly = true)
    public List<Department> getDepartmentsByInstitution(Long institutionId) {
        return departmentRepository.findByInstitutionId(institutionId);
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    @Auditable(module = "DEPARTMENT", action = "CREATE", entityType = "Department")
    @Transactional
    public Department createDepartment(Department department) {
        if (department.getHod() != null && department.getHod().getId() != null) {
            User hodUser = userRepository.findById(department.getHod().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("HOD user not found"));
            if (hodUser.getRole() != UserRole.DEPARTMENT_HEAD) {
                throw new BadRequestException("HOD user must have DEPARTMENT_HEAD role");
            }
            department.setHod(hodUser);
        } else {
            department.setHod(null);
        }
        return departmentRepository.save(Objects.requireNonNull(department));
    }

    @Auditable(module = "DEPARTMENT", action = "UPDATE", entityType = "Department")
    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department dept = departmentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        dept.setDepartmentName(updated.getDepartmentName());
        if (updated.getHod() != null && updated.getHod().getId() != null) {
            User hodUser = userRepository.findById(updated.getHod().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("HOD user not found"));
            if (hodUser.getRole() != UserRole.DEPARTMENT_HEAD) {
                throw new BadRequestException("HOD user must have DEPARTMENT_HEAD role");
            }
            dept.setHod(hodUser);
        } else {
            dept.setHod(null);
        }
        return departmentRepository.save(dept);
    }

    @Auditable(module = "DEPARTMENT", action = "DELETE", entityType = "Department")
    @Transactional
    public void deleteDepartment(Long id) {
        List<Laboratory> labs = laboratoryRepository.findByDepartmentId(id);
        if (!labs.isEmpty()) {
            throw new BadRequestException("Cannot delete department with " + labs.size() + " laboratory(ies). Remove all laboratories first.");
        }
        departmentRepository.deleteById(Objects.requireNonNull(id));
    }

    // Laboratory methods
    @Transactional(readOnly = true)
    public List<Laboratory> getLaboratoriesByDepartment(Long departmentId) {
        return laboratoryRepository.findByDepartmentId(departmentId);
    }

    @Transactional(readOnly = true)
    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found"));
    }

    @Auditable(module = "LABORATORY", action = "CREATE", entityType = "Laboratory")
    @Transactional
    public Laboratory createLaboratory(Laboratory laboratory) {
        return laboratoryRepository.save(Objects.requireNonNull(laboratory));
    }

    @Auditable(module = "LABORATORY", action = "UPDATE", entityType = "Laboratory")
    @Transactional
    public Laboratory updateLaboratory(Long id, Laboratory updated) {
        Laboratory lab = laboratoryRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found"));
        lab.setLaboratoryName(updated.getLaboratoryName());
        lab.setLabManager(updated.getLabManager());
        lab.setLocation(updated.getLocation());
        return laboratoryRepository.save(lab);
    }

    @Auditable(module = "LABORATORY", action = "DELETE", entityType = "Laboratory")
    @Transactional
    public void deleteLaboratory(Long id) {
        laboratoryRepository.deleteById(Objects.requireNonNull(id));
    }
}
