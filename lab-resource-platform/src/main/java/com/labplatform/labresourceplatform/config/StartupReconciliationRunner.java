package com.labplatform.labresourceplatform.config;

import com.labplatform.labresourceplatform.service.MaintenanceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Runs once, every time the application starts, and re-syncs every piece of
// equipment's status against its maintenance record history.
//
// Why this exists: MaintenanceService only pushes a status change onto
// Equipment at the moment a maintenance record is created, updated, or
// deleted. Any maintenance record that already existed in the database before
// that sync logic was added never triggered it, so its equipment could be
// stuck showing "Available" despite having an active (Scheduled/In Progress)
// maintenance record pointing at it - see the "equipment in maintenance still
// shows Available" bug. Rather than requiring a manual SQL backfill every time
// logic like this changes, this runs the same reconciliation across all
// existing data on every startup, so drift from past code versions (or from
// data edited directly in the database) self-heals automatically.
//
// Safe to run repeatedly: reconcileAllEquipmentWithMaintenanceHistory() only
// writes when an equipment's status doesn't already match what its
// maintenance history implies, and never touches equipment with no
// maintenance records at all, or equipment manually set to Out of
// Service/Retired.
@Component
public class StartupReconciliationRunner implements CommandLineRunner {

    private final MaintenanceService maintenanceService;

    public StartupReconciliationRunner(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @Override
    public void run(String... args) {
        maintenanceService.reconcileAllEquipmentWithMaintenanceHistory();
    }
}
