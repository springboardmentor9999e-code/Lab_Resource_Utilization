package com.lrplatform.controller;

import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.InstitutionResponse;
import com.lrplatform.dto.response.DepartmentResponse;
import com.lrplatform.dto.response.LaboratoryResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Laboratory;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.UserRepository;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.InstitutionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<List<InstitutionResponse>> getAll() {
        return ResponseEntity.ok(institutionService.getAllInstitutions().stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstitutionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(institutionService.getInstitutionById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> create(@RequestBody Institution institution) {
        institutionService.createInstitution(institution);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Institution created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @RequestBody Institution institution, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null || !myInstitutionId.equals(id)) {
                throw new ForbiddenException("You can only update your own institution");
            }
        }
        institutionService.updateInstitution(id, institution);
        return ResponseEntity.ok(ApiResponse.success("Institution updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        institutionService.deleteInstitution(id);
        return ResponseEntity.ok(ApiResponse.success("Institution deleted successfully"));
    }

    private InstitutionResponse toDto(Institution i) {
        return InstitutionResponse.builder()
                .id(i.getId())
                .institutionCode(i.getInstitutionCode())
                .institutionName(i.getInstitutionName())
                .email(i.getEmail())
                .phone(i.getPhone())
                .website(i.getWebsite())
                .address(i.getAddress())
                .city(i.getCity())
                .state(i.getState())
                .country(i.getCountry())
                .pincode(i.getPincode())
                .logoUrl(i.getLogoUrl())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
class DepartmentController {

    private final InstitutionService institutionService;
    private final CurrentUserUtil currentUserUtil;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getByInstitution(@RequestParam Long institutionId) {
        return ResponseEntity.ok(institutionService.getDepartmentsByInstitution(institutionId)
                .stream().map(this::toDto).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        String departmentName = (String) body.get("departmentName");
        Long institutionId = body.get("institution") instanceof Map
                ? ((Number) ((Map<?, ?>) body.get("institution")).get("id")).longValue() : null;
        Long hodId = body.get("hodId") != null ? ((Number) body.get("hodId")).longValue() : null;

        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) throw new ForbiddenException("No institution assigned to your account");
            if (institutionId == null || !myInstitutionId.equals(institutionId)) {
                throw new ForbiddenException("You can only create departments within your institution");
            }
        }

        Department department = new Department();
        department.setDepartmentName(departmentName);
        if (institutionId != null) {
            Institution institution = institutionRepository.findById(institutionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            department.setInstitution(institution);
        }
        if (hodId != null) {
            User hodUser = userRepository.findById(hodId)
                    .orElseThrow(() -> new ResourceNotFoundException("HOD user not found"));
            department.setHod(hodUser);
        }

        institutionService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        String departmentName = (String) body.get("departmentName");
        Long hodId = body.get("hodId") != null ? ((Number) body.get("hodId")).longValue() : null;

        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) throw new ForbiddenException("No institution assigned to your account");
            DepartmentResponse existing = toDto(institutionService.getDepartmentById(id));
            if (!myInstitutionId.equals(existing.getInstitutionId())) {
                throw new ForbiddenException("You can only update departments within your institution");
            }
        }

        Department updated = new Department();
        updated.setDepartmentName(departmentName);
        if (hodId != null) {
            User hodUser = userRepository.findById(hodId)
                    .orElseThrow(() -> new ResourceNotFoundException("HOD user not found"));
            updated.setHod(hodUser);
        }

        institutionService.updateDepartment(id, updated);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            DepartmentResponse existing = toDto(institutionService.getDepartmentById(id));
            if (!myInstitutionId.equals(existing.getInstitutionId())) {
                throw new ForbiddenException("You can only delete departments within your institution");
            }
        }
        institutionService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully"));
    }

    private DepartmentResponse toDto(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .institutionId(d.getInstitution() != null ? d.getInstitution().getId() : null)
                .institutionName(d.getInstitution() != null ? d.getInstitution().getInstitutionName() : null)
                .departmentName(d.getDepartmentName())
                .hodId(d.getHod() != null ? d.getHod().getId() : null)
                .hodName(d.getHod() != null ? d.getHod().getFirstName() + " " + d.getHod().getLastName() : null)
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}

@RestController
@RequestMapping("/laboratories")
@RequiredArgsConstructor
class LaboratoryController {

    private final InstitutionService institutionService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<List<LaboratoryResponse>> getByDepartment(@RequestParam Long departmentId) {
        return ResponseEntity.ok(institutionService.getLaboratoriesByDepartment(departmentId)
                .stream().map(this::toDto).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse> create(@RequestBody Laboratory laboratory, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN") || currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            if (laboratory.getDepartment() == null || laboratory.getDepartment().getId() == null) {
                throw new ForbiddenException("Department is required");
            }
            com.lrplatform.model.entity.Department dept = institutionService.getDepartmentById(laboratory.getDepartment().getId());
            if (dept.getInstitution() == null || !myInstitutionId.equals(dept.getInstitution().getId())) {
                throw new ForbiddenException("You can only create laboratories within your institution");
            }
        }
        institutionService.createLaboratory(laboratory);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Laboratory created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @RequestBody Laboratory laboratory, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN") || currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            Laboratory existingLab = institutionService.getLaboratoryById(id);
            if (existingLab.getDepartment() == null || existingLab.getDepartment().getInstitution() == null
                    || !myInstitutionId.equals(existingLab.getDepartment().getInstitution().getId())) {
                throw new ForbiddenException("You can only update laboratories within your institution");
            }
        }
        institutionService.updateLaboratory(id, laboratory);
        return ResponseEntity.ok(ApiResponse.success("Laboratory updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN") || currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            Laboratory existingLab = institutionService.getLaboratoryById(id);
            if (existingLab.getDepartment() == null || existingLab.getDepartment().getInstitution() == null
                    || !myInstitutionId.equals(existingLab.getDepartment().getInstitution().getId())) {
                throw new ForbiddenException("You can only delete laboratories within your institution");
            }
        }
        institutionService.deleteLaboratory(id);
        return ResponseEntity.ok(ApiResponse.success("Laboratory deleted successfully"));
    }

    private LaboratoryResponse toDto(Laboratory l) {
        return LaboratoryResponse.builder()
                .id(l.getId())
                .departmentId(l.getDepartment() != null ? l.getDepartment().getId() : null)
                .departmentName(l.getDepartment() != null ? l.getDepartment().getDepartmentName() : null)
                .laboratoryName(l.getLaboratoryName())
                .labManagerId(l.getLabManager() != null ? l.getLabManager().getId() : null)
                .labManagerName(l.getLabManager() != null ? l.getLabManager().getFirstName() + " " + l.getLabManager().getLastName() : null)
                .location(l.getLocation())
                .status(l.getStatus())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .build();
    }
}
