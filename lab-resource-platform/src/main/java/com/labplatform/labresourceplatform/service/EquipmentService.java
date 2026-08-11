package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Lab;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.LabRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    // New equipment status - see the meeting note: "when particular equipment
    // is registered it should be checked for calibration ... the technician
    // will receive message for calibration test ... then he can approve the
    // registered equipment." Newly registered equipment starts here instead
    // of Available, so it can't be booked until a technician has actually
    // verified it reads accurately and logged its first calibration.
    public static final String PENDING_CALIBRATION = "Pending Calibration";

    private final EquipmentRepository equipmentRepository;
    private final LabRepository labRepository;
    private final NotificationService notificationService;

    public EquipmentService(EquipmentRepository equipmentRepository, LabRepository labRepository, NotificationService notificationService){
        this.equipmentRepository = equipmentRepository;
        this.labRepository = labRepository;
        this.notificationService = notificationService;
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

        // Always starts here regardless of what status the client sent (if
        // any) - the client can't skip the calibration gate by sending
        // "Available" directly. Booking/maintenance logic below also treats
        // this as a state they must not silently override.
        equipment.setStatus(PENDING_CALIBRATION);

        Equipment saved = equipmentRepository.save(equipment);

        // "The technician will receive message for calibration test" - reuses
        // the same notification mechanism the daily alert job uses for idle/
        // maintenance/calibration-due alerts, fired immediately on
        // registration rather than waiting for the next scheduled run, since
        // this equipment can't be used at all until someone acts on it.
        notificationService.notifyEquipmentStaff(saved.getEquipmentId(), "Calibration Needed",
                "New equipment \"" + saved.getEquipmentName() + "\" needs an initial calibration check before it can be booked.");

        return saved;
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
    // retired, or not yet calibration-verified, stays that way regardless of
    // what happens to its bookings.
    private static final List<String> MANUALLY_CONTROLLED_STATUSES =
            List.of("Under Maintenance", "Out of Service", "Retired", PENDING_CALIBRATION);

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
    // was already Out of Service/Retired/Pending Calibration (separate manual
    // states this shouldn't undo) - the caller is responsible for checking
    // whether any *other* maintenance record is still active before calling
    // this with "Available" (see MaintenanceService.reconcileEquipmentStatus).
    public void applyMaintenanceDrivenStatus(Long equipmentId, String desiredStatus){
        Equipment existing = getEquipmentById(equipmentId);
        if ("Under Maintenance".equals(desiredStatus)) {
            if (!"Under Maintenance".equals(existing.getStatus())) {
                existing.setStatus("Under Maintenance");
                equipmentRepository.save(existing);
            }
            return;
        }
        // Releasing back to Available - don't touch Out of Service/Retired/
        // Pending Calibration, those are separate manual states outside
        // maintenance-record tracking.
        if (List.of("Out of Service", "Retired", PENDING_CALIBRATION).contains(existing.getStatus())) {
            return;
        }
        if (!desiredStatus.equals(existing.getStatus())) {
            existing.setStatus(desiredStatus);
            equipmentRepository.save(existing);
        }
    }

    // Called by CalibrationRecordService when a technician logs a calibration
    // for equipment that was awaiting its first one - "then he can approve the
    // registered equipment" from the meeting notes. Only acts if the equipment
    // is actually still Pending Calibration; logging a routine/renewal
    // calibration on already-Available equipment does nothing here (it's not
    // re-gating equipment that's already in normal use).
    public void approveInitialCalibration(Long equipmentId){
        Equipment existing = getEquipmentById(equipmentId);
        if (PENDING_CALIBRATION.equals(existing.getStatus())) {
            existing.setStatus("Available");
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

        if(updatedEquipment.getHourlyRate() != null)
            existing.setHourlyRate(updatedEquipment.getHourlyRate());

        if(updatedEquipment.getLab() != null)
            // Same re-fetch as createEquipment() above.
            existing.setLab(fetchLab(updatedEquipment.getLab().getLabId()));

        return equipmentRepository.save(existing);
    }

    public void deleteEquipment(Long id){
        equipmentRepository.deleteById(id);
    }
}
