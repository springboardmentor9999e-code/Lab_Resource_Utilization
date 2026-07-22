package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Lab;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.LabRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final LabRepository labRepository;

    public EquipmentService(EquipmentRepository equipmentRepository, LabRepository labRepository){
        this.equipmentRepository = equipmentRepository;
        this.labRepository = labRepository;
    }

    public List<Equipment> getAllEquipment(){
        return equipmentRepository.findAll();
    }

    public List<Equipment> getEquipment(Long labId, Long institutionId){
        if (labId != null && institutionId != null) {
            return equipmentRepository.findByLab_LabIdAndLab_Institution_InstitutionId(labId, institutionId);
        }
        if (labId != null) {
            return equipmentRepository.findByLab_LabId(labId);
        }
        if (institutionId != null) {
            return equipmentRepository.findByLab_Institution_InstitutionId(institutionId);
        }
        return getAllEquipment();
    }

    public Equipment getEquipmentById(Long id){
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
    }

    public Equipment createEquipment(Equipment equipment){
        // The client only sends { lab: { labId: N } }. Re-fetch the real,
        // fully-loaded Lab before saving so the create response (and this
        // equipment's row until a full reload) shows the actual lab name
        // instead of falling back to a bare id placeholder in the UI.
        if (equipment.getLab() != null) {
            equipment.setLab(fetchLab(equipment.getLab().getLabId()));
        }
        return equipmentRepository.save(equipment);
    }

    private Lab fetchLab(Long labId){
        return labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found with id: " + labId));
    }

    // Narrow update used by LAB_TECHNICIAN, who per the Role-Operation Matrix
    // may update equipment status but not other fields.
    public Equipment updateEquipmentStatus(Long id, String status){
        Equipment existing = getEquipmentById(id);
        existing.setStatus(status);
        return equipmentRepository.save(existing);
    }

    // Statuses that a technician sets manually and that booking activity should
    // never silently override - equipment pulled for maintenance/out-of-service/
    // retired stays that way regardless of what happens to its bookings.
    private static final List<String> MANUALLY_CONTROLLED_STATUSES =
            List.of("Under Maintenance", "Out of Service", "Retired");

    // Called by BookingService when a booking's status changes in a way that
    // should affect equipment availability (item #10). Never overrides a
    // manually-set maintenance-type status, and only ever sets exactly
    // "Available" or "Booked" - the two states booking activity owns.
    public void applyBookingDrivenStatus(Long equipmentId, String desiredStatus){
        Equipment existing = getEquipmentById(equipmentId);
        if (MANUALLY_CONTROLLED_STATUSES.contains(existing.getStatus())) {
            return;
        }
        if (!desiredStatus.equals(existing.getStatus())) {
            existing.setStatus(desiredStatus);
            equipmentRepository.save(existing);
        }
    }

    // Called by MaintenanceService when a maintenance record's status changes.
    // A Scheduled or In Progress maintenance record puts the equipment into
    // "Under Maintenance" - taking priority over whatever booking-driven status
    // it had, since equipment being worked on shouldn't look Available/Booked.
    // Completed/Cancelled releases it back to Available, UNLESS the equipment
    // was already Out of Service/Retired (a separate manual decision this
    // shouldn't undo) - the caller is responsible for checking whether any
    // *other* maintenance record is still active before calling this with
    // "Available" (see MaintenanceService.reconcileEquipmentStatus).
    public void applyMaintenanceDrivenStatus(Long equipmentId, String desiredStatus){
        Equipment existing = getEquipmentById(equipmentId);
        if ("Under Maintenance".equals(desiredStatus)) {
            if (!"Under Maintenance".equals(existing.getStatus())) {
                existing.setStatus("Under Maintenance");
                equipmentRepository.save(existing);
            }
            return;
        }
        // Releasing back to Available - don't touch Out of Service/Retired,
        // those are separate manual states outside maintenance-record tracking.
        if (List.of("Out of Service", "Retired").contains(existing.getStatus())) {
            return;
        }
        if (!desiredStatus.equals(existing.getStatus())) {
            existing.setStatus(desiredStatus);
            equipmentRepository.save(existing);
        }
    }

    public Equipment updateEquipment(Long id, Equipment updatedEquipment){

        Equipment existing = getEquipmentById(id);

        if(updatedEquipment.getEquipmentName() != null)
            existing.setEquipmentName(updatedEquipment.getEquipmentName());

        if(updatedEquipment.getCategory() != null)
            existing.setCategory(updatedEquipment.getCategory());

        if(updatedEquipment.getSpecification() != null)
            existing.setSpecification(updatedEquipment.getSpecification());

        if(updatedEquipment.getStatus() != null)
            existing.setStatus(updatedEquipment.getStatus());

        if(updatedEquipment.getDocumentationUrl() != null)
            existing.setDocumentationUrl(updatedEquipment.getDocumentationUrl());

        if(updatedEquipment.getLab() != null)
            // Same re-fetch as createEquipment() above.
            existing.setLab(fetchLab(updatedEquipment.getLab().getLabId()));

        return equipmentRepository.save(existing);
    }

    public void deleteEquipment(Long id){
        equipmentRepository.deleteById(id);
    }
}
