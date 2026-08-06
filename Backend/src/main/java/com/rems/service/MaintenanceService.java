package com.rems.service;

import com.rems.dto.MaintenanceDTO;
import com.rems.entity.DowntimeRecord;
import com.rems.entity.Equipment;
import com.rems.entity.User;
import com.rems.entity.UtilizationMetric;
import com.rems.enums.EquipmentStatus;
import com.rems.exception.ApiException;
import com.rems.repository.DowntimeRecordRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.UtilizationMetricRepository;
import com.rems.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final EquipmentRepository equipmentRepository;
    private final DowntimeRecordRepository downtimeRecordRepository;
    private final UserRepository userRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final InAppNotificationService inAppNotificationService;

    @Transactional
    public MaintenanceDTO.Response putInMaintenance(MaintenanceDTO.Request request, String userEmail) {
        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (user.getRoles() != null && user.getRoles().stream().anyMatch(r -> (r.getRoleId() != null && r.getRoleId().equals(4L)) || "Department Head".equalsIgnoreCase(r.getRoleName()))) {
                    throw new ApiException("Department Head is not authorized to put equipment in maintenance", HttpStatus.FORBIDDEN);
                }
            });
        }

        if (request.getEquipmentId() == null) {
            throw new ApiException("Equipment ID is required", HttpStatus.BAD_REQUEST);
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ApiException("Equipment not found with id " + request.getEquipmentId(), HttpStatus.NOT_FOUND));

        int totalAmount = equipment.getAmount() != null ? equipment.getAmount() : 1;
        int qtyToMaintain = totalAmount;

        if (Boolean.FALSE.equals(request.getIsAll()) && request.getQuantity() != null && request.getQuantity() > 0) {
            qtyToMaintain = Math.min(request.getQuantity(), totalAmount);
        }

        Instant startTime = request.getStartTime() != null ? request.getStartTime() : Instant.now();
        String reasonStatus = "Under Maintenance";
        if (request.getReason() != null && !request.getReason().trim().isEmpty()) {
            reasonStatus = "Maintenance: " + request.getReason().trim();
        }

        // Update equipment status
        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        // Create DowntimeRecord
        DowntimeRecord record = DowntimeRecord.builder()
                .equipment(equipment)
                .startTime(startTime)
                .endTime(null)
                .quantity(qtyToMaintain)
                .status(reasonStatus)
                .build();

        DowntimeRecord saved = downtimeRecordRepository.save(record);

        // Notify department staff of equipment maintenance
        if (equipment.getDepartment() != null) {
            List<User> staffMembers = userRepository.findByDepartmentDepartmentId(equipment.getDepartment().getDepartmentId());
            for (User staff : staffMembers) {
                inAppNotificationService.createNotification(staff, "Equipment Maintenance Alert", equipment.getName() + " has been placed under maintenance (" + reasonStatus + ").", NotificationType.MAINTENANCE, equipment.getEquipmentId());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public MaintenanceDTO.Response makeAvailable(Long recordId, String userEmail) {
        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (user.getRoles() != null && user.getRoles().stream().anyMatch(r -> (r.getRoleId() != null && r.getRoleId().equals(4L)) || "Department Head".equalsIgnoreCase(r.getRoleName()))) {
                    throw new ApiException("Department Head is not authorized to restore equipment availability", HttpStatus.FORBIDDEN);
                }
            });
        }

        DowntimeRecord record = downtimeRecordRepository.findById(recordId)
                .orElseThrow(() -> new ApiException("Maintenance record not found with id " + recordId, HttpStatus.NOT_FOUND));

        record.setEndTime(Instant.now());
        record.setStatus("Completed");
        DowntimeRecord updatedRecord = downtimeRecordRepository.save(record);

        Equipment equipment = record.getEquipment();
        List<DowntimeRecord> activeRecords = downtimeRecordRepository.findByEquipmentEquipmentIdAndEndTimeIsNull(equipment.getEquipmentId());
        if (activeRecords.isEmpty()) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);

            if (equipment.getDepartment() != null) {
                List<User> staffMembers = userRepository.findByDepartmentDepartmentId(equipment.getDepartment().getDepartmentId());
                for (User staff : staffMembers) {
                    inAppNotificationService.createNotification(staff, "Equipment Maintenance Completed", equipment.getName() + " is now restored to AVAILABLE.", NotificationType.MAINTENANCE, equipment.getEquipmentId());
                }
            }
        }

        return toResponse(updatedRecord);
    }

    @Transactional
    public MaintenanceDTO.Response updateStartTime(Long recordId, MaintenanceDTO.UpdateTimeRequest request) {
        DowntimeRecord record = downtimeRecordRepository.findById(recordId)
                .orElseThrow(() -> new ApiException("Maintenance record not found with id " + recordId, HttpStatus.NOT_FOUND));

        if (request.getStartTime() != null) {
            record.setStartTime(request.getStartTime());
        }

        DowntimeRecord saved = downtimeRecordRepository.save(record);
        return toResponse(saved);
    }

    public List<MaintenanceDTO.Response> getMaintenanceRecords(String userEmail) {
        User user = null;
        if (userEmail != null && !userEmail.equals("anonymousUser")) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        List<DowntimeRecord> records = downtimeRecordRepository.findAllByOrderByStartTimeDesc();

        if (user != null && user.getLab() != null) {
            Long labId = user.getLab().getLabId();
            records = records.stream()
                    .filter(r -> r.getEquipment() != null && r.getEquipment().getLab() != null && r.getEquipment().getLab().getLabId().equals(labId))
                    .toList();
        }

        return records.stream().map(this::toResponse).toList();
    }

    public MaintenanceDTO.Response toResponse(DowntimeRecord record) {
        Equipment eq = record.getEquipment();
        Double utilRate = calculate30DayUtilization(eq.getEquipmentId());
        boolean maintenanceNeeded = utilRate >= 0.60;

        return MaintenanceDTO.Response.builder()
                .recordId(record.getRecordId())
                .equipmentId(eq.getEquipmentId())
                .equipmentName(eq.getName())
                .category(eq.getCategory())
                .labName(eq.getLab() != null ? eq.getLab().getName() : "Unknown Lab")
                .location(eq.getLocation())
                .quantity(record.getQuantity() != null ? record.getQuantity() : (eq.getAmount() != null ? eq.getAmount() : 1))
                .totalAmount(eq.getAmount() != null ? eq.getAmount() : 1)
                .startTime(record.getStartTime())
                .endTime(record.getEndTime())
                .status(record.getStatus())
                .utilizationRate(utilRate)
                .maintenanceNeeded(maintenanceNeeded)
                .build();
    }

    private Double calculate30DayUtilization(Long equipmentId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<UtilizationMetric> metrics = utilizationMetricRepository
                .findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(equipmentId, start, end);

        if (metrics.isEmpty()) return 0.0;
        double sum = 0.0;
        int count = 0;
        for (UtilizationMetric m : metrics) {
            if (m.getUtilizationRate() != null) {
                sum += m.getUtilizationRate();
                count++;
            }
        }
        return count > 0 ? (sum / count) : 0.0;
    }
}
