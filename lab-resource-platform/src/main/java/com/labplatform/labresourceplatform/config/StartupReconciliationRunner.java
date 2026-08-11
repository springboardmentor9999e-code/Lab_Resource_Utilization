package com.labplatform.labresourceplatform.config;

import com.labplatform.labresourceplatform.service.BookingService;
import com.labplatform.labresourceplatform.service.MaintenanceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Runs once, every time the application starts, and re-syncs:
//   1. every piece of equipment's status against its maintenance record history
//   2. every WAITLISTED sharing request against its linked booking's real status
//
// Why this exists: several places in this app only push a status change onto
// a related record at the MOMENT something happens (e.g. MaintenanceService
// only updates Equipment when a maintenance record is created/updated/
// deleted; BookingService only updates a linked SharingRequest when a
// promotion/approval actually occurs). Any record that fell out of sync
// BEFORE that trigger logic existed - or before a bug in that trigger logic
// was fixed - never gets fixed retroactively unless something re-checks it.
// Rather than requiring a manual SQL backfill every time logic like this
// changes, this runs the same reconciliation across all existing data on
// every startup, so drift self-heals automatically.
//
// Safe to run repeatedly: both reconciliation methods only write when there's
// an actual mismatch to fix.
@Component
public class StartupReconciliationRunner implements CommandLineRunner {

    private final MaintenanceService maintenanceService;
    private final BookingService bookingService;

    public StartupReconciliationRunner(MaintenanceService maintenanceService, BookingService bookingService) {
        this.maintenanceService = maintenanceService;
        this.bookingService = bookingService;
    }

    @Override
    public void run(String... args) {
        maintenanceService.reconcileAllEquipmentWithMaintenanceHistory();
        bookingService.reconcileStuckWaitlistedSharingRequests();
    }
}
