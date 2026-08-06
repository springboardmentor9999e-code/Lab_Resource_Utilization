package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Institution;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.repository.InstitutionRepository;
import com.infosys.labresourceutilizationplatform.repository.DepartmentRepository;
import com.infosys.labresourceutilizationplatform.repository.LaboratoryRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionServiceImpl implements InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private void populateMetrics(Institution inst) {
        if (inst == null) return;
        Long instId = inst.getInstitutionId();
        
        // 1. Total Departments
        long totalDepts = departmentRepository.findAll().stream()
                .filter(d -> d.getInstitution() != null && d.getInstitution().getInstitutionId().equals(instId))
                .count();
        inst.setTotalDepartments((int) totalDepts);

        // 2. Total Laboratories
        long totalLabs = laboratoryRepository.findAll().stream()
                .filter(l -> l.getDepartment() != null && l.getDepartment().getInstitution() != null 
                        && l.getDepartment().getInstitution().getInstitutionId().equals(instId))
                .count();
        inst.setTotalLaboratories((int) totalLabs);

        // 3. Total Equipment
        long totalEq = equipmentRepository.findAll().stream()
                .filter(e -> e.getLaboratory() != null && e.getLaboratory().getDepartment() != null 
                        && e.getLaboratory().getDepartment().getInstitution() != null 
                        && e.getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                .count();
        inst.setTotalEquipment((int) totalEq);

        // 4. Active Users
        long activeU = userRepository.findAll().stream()
                .filter(u -> u.getInstitutionId() != null && Long.valueOf(u.getInstitutionId()).equals(instId) 
                        && "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .count();
        inst.setActiveUsers((int) activeU);

        // 5. Institution Administrator
        String adminName = userRepository.findAll().stream()
                .filter(u -> u.getInstitutionId() != null && Long.valueOf(u.getInstitutionId()).equals(instId)
                        && u.getRole() != null && "INSTITUTION_ADMIN".equalsIgnoreCase(u.getRole().getRoleName()))
                .map(User::getFullName)
                .findFirst()
                .orElse("Not Assigned");
        inst.setInstitutionAdministrator(adminName);

        // 6. Equipment Utilization Summary
        double totalHours = bookingRepository.findAll().stream()
                .filter(b -> b.getEquipment() != null && b.getEquipment().getLaboratory() != null 
                        && b.getEquipment().getLaboratory().getDepartment() != null 
                        && b.getEquipment().getLaboratory().getDepartment().getInstitution() != null 
                        && b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()) || "In Use".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getDuration() != null ? b.getDuration() : 0.0)
                .sum();
        double avgUtil = totalEq == 0 ? 0.0 : (totalHours / (totalEq * 720.0)) * 100.0;
        if (avgUtil > 100.0) avgUtil = 100.0;
        inst.setEquipmentUtilizationSummary(String.format("%.1f hrs total usage (%.1f%% util rate)", totalHours, avgUtil));

        // 7. Resource Sharing Summary
        long incomingSharing = bookingRepository.findAll().stream()
                .filter(b -> b.getEquipment() != null && b.getEquipment().getLaboratory() != null 
                        && b.getEquipment().getLaboratory().getDepartment() != null 
                        && b.getEquipment().getLaboratory().getDepartment().getInstitution() != null 
                        && b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                .filter(b -> b.getUser() != null && b.getUser().getInstitutionId() != null && !Long.valueOf(b.getUser().getInstitutionId()).equals(instId))
                .count();

        long outgoingSharing = bookingRepository.findAll().stream()
                .filter(b -> b.getUser() != null && b.getUser().getInstitutionId() != null && Long.valueOf(b.getUser().getInstitutionId()).equals(instId))
                .filter(b -> b.getEquipment() != null && b.getEquipment().getLaboratory() != null 
                        && b.getEquipment().getLaboratory().getDepartment() != null 
                        && b.getEquipment().getLaboratory().getDepartment().getInstitution() != null 
                        && !b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(instId))
                .count();
        inst.setResourceSharingSummary(String.format("Sharing: %d Incoming, %d Outgoing requests", incomingSharing, outgoingSharing));
    }

    @Override
    public Institution addInstitution(Institution institution) {
        Institution saved = institutionRepository.save(institution);
        populateMetrics(saved);
        return saved;
    }

    @Override
    public List<Institution> getAllInstitutions() {
        List<Institution> list = institutionRepository.findAll();
        list.forEach(this::populateMetrics);
        return list;
    }

    @Override
    public Institution getInstitutionById(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
        populateMetrics(inst);
        return inst;
    }

    @Override
    public Institution updateInstitution(Long id, Institution institution) {
        Institution existingInstitution = getInstitutionById(id);

        existingInstitution.setInstitutionName(institution.getInstitutionName());
        existingInstitution.setInstitutionCode(institution.getInstitutionCode());
        existingInstitution.setAddress(institution.getAddress());
        existingInstitution.setCity(institution.getCity());
        existingInstitution.setState(institution.getState());
        existingInstitution.setPincode(institution.getPincode());
        existingInstitution.setContactEmail(institution.getContactEmail());
        existingInstitution.setContactPhone(institution.getContactPhone());
        existingInstitution.setWebsite(institution.getWebsite());
        existingInstitution.setStatus(institution.getStatus());

        Institution saved = institutionRepository.save(existingInstitution);
        populateMetrics(saved);
        return saved;
    }

    @Override
    public void deleteInstitution(Long id) {
        Institution institution = getInstitutionById(id);
        institutionRepository.delete(institution);
    }
}