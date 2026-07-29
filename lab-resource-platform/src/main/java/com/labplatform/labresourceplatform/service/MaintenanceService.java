package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Maintenance;
import com.labplatform.labresourceplatform.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    private static final List<String> ACTIVE_MAINTENANCE_STATUSES = List.of("Scheduled", "In Progress");

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentService equipmentService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository, EquipmentService equipmentService){
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentService = equipmentService;
    }

    public List<Maintenance> getAllMaintenance(){
        return maintenanceRepository.findAll();
    }

    public Maintenance getMaintenanceById(Long id){
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));
    }

    // Creating a maintenance record marks the equipment Under Maintenance
    // immediately, regardless of what status was set on the record itself
    // (including no status at all) - a maintenance record existing at all
    // means the equipment shouldn't look Available.
    public Maintenance createMaintenance(Maintenance maintenance){
        // Same fix as BookingService.createBooking(): the client only sends
        // { equipmentId: N }, so re-fetch the real, fully-loaded Equipment
        // before saving - otherwise the response (and the row in the
        // Maintenance UI) echoes back an equipment object with just an id and
        // no name, showing "Equipment #N" until the next full page reload.
        if (maintenance.getEquipment() != null) {
            maintenance.setEquipment(equipmentService.getEquipmentById(maintenance.getEquipment().getEquipmentId()));
        }

        Maintenance saved = maintenanceRepository.save(maintenance);
        if (saved.getEquipment() != null) {
            reconcileEquipmentStatus(saved.getEquipment().getEquipmentId());
        }
        return saved;
    }

    public Maintenance updateMaintenance(Long id, Maintenance updatedMaintenance){

        Maintenance existing = getMaintenanceById(id);
        Long previousEquipmentId = existing.getEquipment() != null ? existing.getEquipment().getEquipmentId() : null;

        if(updatedMaintenance.getEquipment() != null)
            // Same re-fetch as createMaintenance() above.
            existing.setEquipment(equipmentService.getEquipmentById(updatedMaintenance.getEquipment().getEquipmentId()));

        if(updatedMaintenance.getStartDate() != null)
            existing.setStartDate(updatedMaintenance.getStartDate());

        if(updatedMaintenance.getEndDate() != null)
            existing.setEndDate(updatedMaintenance.getEndDate());

        if(updatedMaintenance.getDescription() != null)
            existing.setDescription(updatedMaintenance.getDescription());

        if(updatedMaintenance.getStatus() != null)
            existing.setStatus(updatedMaintenance.getStatus());

        Maintenance saved = maintenanceRepository.save(existing);

        Long newEquipmentId = saved.getEquipment() != null ? saved.getEquipment().getEquipmentId() : null;
        if (newEquipmentId != null) {
            reconcileEquipmentStatus(newEquipmentId);
        }
        // If this record was reassigned to different equipment, the equipment it
        // used to point to may no longer have any active maintenance record and
        // needs to be released back to Available - otherwise it's stuck showing
        // Under Maintenance forever.
        if (previousEquipmentId != null && !previousEquipmentId.equals(newEquipmentId)) {
            reconcileEquipmentStatus(previousEquipmentId);
        }

        return saved;
    }

    public void deleteMaintenance(Long id){
        Maintenance existing = getMaintenanceById(id);
        Long equipmentId = existing.getEquipment() != null ? existing.getEquipment().getEquipmentId() : null;
        maintenanceRepository.deleteById(id);

        if (equipmentId != null) {
            reconcileEquipmentStatus(equipmentId);
        }
    }

    // Fixes the "equipment status doesn't update when I log maintenance" gap:
    // mirrors a piece of equipment's Under Maintenance / Available status onto
    // whether it has any active (Scheduled / In Progress) maintenance record.
    // "No status set" on a brand-new record is treated as active too, since a
    // maintenance record with no explicit status yet still means work is pending.
    private void reconcileEquipmentStatus(Long equipmentId){
        boolean anyActive = ACTIVE_MAINTENANCE_STATUSES.stream()
                .anyMatch(status -> !maintenanceRepository
                        .findByEquipment_EquipmentIdAndStatus(equipmentId, status)
                        .isEmpty())
                || !maintenanceRepository.findByEquipmentIdAndStatusIsNull(equipmentId).isEmpty();

        equipmentService.applyMaintenanceDrivenStatus(equipmentId, anyActive ? "Under Maintenance" : "Available");
    }

    // Public entry point for a one-time reconciliation pass across every piece
    // of equipment that has ANY maintenance record at all. Needed because the
    // per-record sync above only fires when a maintenance record is created,
    // updated, or deleted going forward - equipment whose maintenance record
    // already existed before this sync logic was added never got its status
    // corrected. Run once at startup (see StartupReconciliationRunner) so any
    // existing drift self-heals without a manual SQL backfill.
    public void reconcileAllEquipmentWithMaintenanceHistory(){
        maintenanceRepository.findDistinctEquipmentIdsWithMaintenanceHistory()
                .forEach(this::reconcileEquipmentStatus);
    }
}
