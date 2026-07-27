package com.labresource.service.interfaces;

import com.labresource.dto.request.CalibrationCreate;
import com.labresource.dto.request.MaintenanceRequestCreate;
import com.labresource.dto.request.MaintenanceScheduleCreate;
import com.labresource.dto.response.CalibrationResponse;
import com.labresource.dto.response.MaintenanceRequestResponse;
import com.labresource.dto.response.MaintenanceScheduleResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface MaintenanceService {

    // ----- Work orders -----
    MaintenanceRequestResponse createRequest(MaintenanceRequestCreate request, String username);

    /** Managers/technicians see all; other users only their own reports. */
    List<MaintenanceRequestResponse> getRequests(String username);

    List<MaintenanceRequestResponse> getMyAssigned(String username);

    MaintenanceRequestResponse assign(Long requestId, Long technicianId, String username);

    /**
     * OPEN -> ASSIGNED (via assign) | CANCELLED; ASSIGNED -> IN_PROGRESS | CANCELLED;
     * IN_PROGRESS -> COMPLETED. Equipment is UNDER_MAINTENANCE while IN_PROGRESS,
     * restored to AVAILABLE on COMPLETED/CANCELLED. Downtime recorded on completion.
     */
    MaintenanceRequestResponse updateStatus(Long requestId, String status,
                                            String resolutionNotes, BigDecimal cost, String username);

    List<Map<String, Object>> getTechnicians();

    // ----- Calibration & certification -----
    CalibrationResponse addCalibration(CalibrationCreate request, String username);

    List<CalibrationResponse> getCalibrations(Long equipmentId);

    List<CalibrationResponse> getExpiringCalibrations(int days);

    // ----- Preventive schedules -----
    MaintenanceScheduleResponse createSchedule(MaintenanceScheduleCreate request, String username);

    List<MaintenanceScheduleResponse> getSchedules();

    MaintenanceScheduleResponse toggleSchedule(Long scheduleId, String username);

    // ----- Dashboard summary -----
    Map<String, Object> getSummary();
}
