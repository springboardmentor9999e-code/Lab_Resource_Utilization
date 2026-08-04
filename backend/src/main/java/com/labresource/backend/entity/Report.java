package com.labresource.backend.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    private Long totalBookings;

    private Long approvedBookings;

    private Long pendingBookings;

    private Long rejectedBookings;

    private Long totalEquipment;

    private Long availableEquipment;

    private Long maintenanceEquipment;

    private Long totalLaboratories;

    private Long totalMaintenance;

    private Long resolvedMaintenance;

    private Long pendingMaintenance;

}