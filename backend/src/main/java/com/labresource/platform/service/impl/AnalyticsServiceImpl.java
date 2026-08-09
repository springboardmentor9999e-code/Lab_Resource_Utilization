package com.labresource.platform.service.impl;

import com.labresource.platform.dto.AnalyticsOverviewResponse;
import com.labresource.platform.dto.BookingStatusAnalyticsResponse;
import com.labresource.platform.dto.DashboardSummaryResponse;
import com.labresource.platform.dto.EquipmentStatusAnalyticsResponse;
import com.labresource.platform.dto.EquipmentUtilizationResponse;
import com.labresource.platform.dto.LabUtilizationResponse;
import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.repository.BookingRepository;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.repository.LabRepository;
import com.labresource.platform.repository.MaintenanceRepository;
import com.labresource.platform.service.AnalyticsService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final List<MaintenanceStatus> ACTIVE_MAINTENANCE_STATUSES = List.of(
            MaintenanceStatus.SCHEDULED,
            MaintenanceStatus.IN_PROGRESS
    );

    private final LabRepository labRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;

    public AnalyticsServiceImpl(
            LabRepository labRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository
    ) {
        this.labRepository = labRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        return new DashboardSummaryResponse(
                labRepository.count(),
                labRepository.countByActiveTrue(),
                equipmentRepository.count(),
                defaultZero(equipmentRepository.sumQuantity()),
                defaultZero(equipmentRepository.sumAvailableQuantity()),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                maintenanceRepository.countByStatusIn(ACTIVE_MAINTENANCE_STATUSES)
        );
    }

    @Override
    public BookingStatusAnalyticsResponse getBookingStatusAnalytics() {
        return new BookingStatusAnalyticsResponse(
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                bookingRepository.countByStatus(BookingStatus.REJECTED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED)
        );
    }

    @Override
    public EquipmentStatusAnalyticsResponse getEquipmentStatusAnalytics() {
        return new EquipmentStatusAnalyticsResponse(
                equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE),
                equipmentRepository.countByStatus(EquipmentStatus.IN_USE),
                equipmentRepository.countByStatus(EquipmentStatus.MAINTENANCE),
                equipmentRepository.countByStatus(EquipmentStatus.OUT_OF_SERVICE)
        );
    }

    @Override
    public List<LabUtilizationResponse> getLabUtilization(LocalDateTime from, LocalDateTime to) {
        UtilizationSnapshot snapshot = buildUtilizationSnapshot(from, to);

        return snapshot.labs().stream()
                .map(lab -> toLabUtilizationResponse(lab, snapshot.labStats().get(lab.getId())))
                .toList();
    }

    @Override
    public List<EquipmentUtilizationResponse> getEquipmentUtilization(LocalDateTime from, LocalDateTime to) {
        UtilizationSnapshot snapshot = buildUtilizationSnapshot(from, to);

        return snapshot.equipment().stream()
                .map(equipment -> toEquipmentUtilizationResponse(
                        equipment,
                        snapshot.equipmentStats().get(equipment.getId()),
                        snapshot.analyticsRangeHours()
                ))
                .toList();
    }

    @Override
    public AnalyticsOverviewResponse getAnalyticsOverview(LocalDateTime from, LocalDateTime to) {
        UtilizationSnapshot snapshot = buildUtilizationSnapshot(from, to);
        List<LabUtilizationResponse> labUtilization = snapshot.labs().stream()
                .map(lab -> toLabUtilizationResponse(lab, snapshot.labStats().get(lab.getId())))
                .toList();
        List<EquipmentUtilizationResponse> equipmentUtilization = snapshot.equipment().stream()
                .map(equipment -> toEquipmentUtilizationResponse(
                        equipment,
                        snapshot.equipmentStats().get(equipment.getId()),
                        snapshot.analyticsRangeHours()
                ))
                .toList();

        return new AnalyticsOverviewResponse(
                getDashboardSummary(),
                getBookingStatusAnalytics(),
                getEquipmentStatusAnalytics(),
                labUtilization,
                equipmentUtilization
        );
    }

    private UtilizationSnapshot buildUtilizationSnapshot(LocalDateTime from, LocalDateTime to) {
        validateRange(from, to);

        double analyticsRangeHours = hoursBetween(from, to);
        List<Lab> labs = labRepository.findAll();
        List<Equipment> equipmentList = equipmentRepository.findAllWithLab();
        List<Booking> approvedBookings = bookingRepository.findOverlappingByStatus(BookingStatus.APPROVED, from, to);

        Map<Long, LabUtilizationAccumulator> labStats = new LinkedHashMap<>();
        labs.forEach(lab -> labStats.put(lab.getId(), new LabUtilizationAccumulator()));

        Map<Long, EquipmentUtilizationAccumulator> equipmentStats = new LinkedHashMap<>();
        for (Equipment equipment : equipmentList) {
            equipmentStats.put(equipment.getId(), new EquipmentUtilizationAccumulator());

            Lab lab = equipment.getLab();
            LabUtilizationAccumulator labAccumulator = labStats.computeIfAbsent(
                    lab.getId(),
                    ignored -> new LabUtilizationAccumulator()
            );
            labAccumulator.addEquipment(equipment, analyticsRangeHours);
        }

        for (Booking booking : approvedBookings) {
            if (booking.getStatus() != BookingStatus.APPROVED) {
                continue;
            }

            Equipment equipment = booking.getEquipment();
            double overlapHours = calculateOverlapHours(booking, from, to);

            if (overlapHours == 0) {
                continue;
            }

            long quantity = booking.getQuantity();

            EquipmentUtilizationAccumulator equipmentAccumulator = equipmentStats.computeIfAbsent(
                    equipment.getId(),
                    ignored -> new EquipmentUtilizationAccumulator()
            );
            equipmentAccumulator.addBooking(quantity, overlapHours);

            Lab lab = equipment.getLab();
            LabUtilizationAccumulator labAccumulator = labStats.computeIfAbsent(
                    lab.getId(),
                    ignored -> new LabUtilizationAccumulator()
            );
            labAccumulator.addBooking(quantity, overlapHours);
        }

        return new UtilizationSnapshot(labs, equipmentList, labStats, equipmentStats, analyticsRangeHours);
    }

    private LabUtilizationResponse toLabUtilizationResponse(
            Lab lab,
            LabUtilizationAccumulator accumulator
    ) {
        LabUtilizationAccumulator stats = accumulator == null
                ? new LabUtilizationAccumulator()
                : accumulator;

        return new LabUtilizationResponse(
                lab.getId(),
                lab.getName(),
                lab.getBuilding(),
                lab.getRoomNumber(),
                lab.getCapacity(),
                stats.equipmentRecords(),
                stats.equipmentUnits(),
                stats.approvedBookingCount(),
                stats.approvedBookedUnits(),
                roundPercentage(stats.utilizationPercentage())
        );
    }

    private EquipmentUtilizationResponse toEquipmentUtilizationResponse(
            Equipment equipment,
            EquipmentUtilizationAccumulator accumulator,
            double analyticsRangeHours
    ) {
        EquipmentUtilizationAccumulator stats = accumulator == null
                ? new EquipmentUtilizationAccumulator()
                : accumulator;

        double capacityUnitHours = equipment.getQuantity() * analyticsRangeHours;

        return new EquipmentUtilizationResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getCategory(),
                equipment.getSerialNumber(),
                equipment.getQuantity(),
                stats.approvedBookingCount(),
                stats.approvedBookedUnits(),
                roundPercentage(calculateUtilizationPercentage(stats.reservedUnitHours(), capacityUnitHours))
        );
    }

    private void validateRange(LocalDateTime from, LocalDateTime to) {
        if (from == null) {
            throw new IllegalArgumentException("From date-time is required");
        }

        if (to == null) {
            throw new IllegalArgumentException("To date-time is required");
        }

        if (!from.isBefore(to)) {
            throw new IllegalArgumentException("From date-time must be before to date-time");
        }
    }

    private double calculateOverlapHours(Booking booking, LocalDateTime from, LocalDateTime to) {
        LocalDateTime overlapStart = booking.getStartTime().isAfter(from) ? booking.getStartTime() : from;
        LocalDateTime overlapEnd = booking.getEndTime().isBefore(to) ? booking.getEndTime() : to;

        if (!overlapStart.isBefore(overlapEnd)) {
            return 0;
        }

        return hoursBetween(overlapStart, overlapEnd);
    }

    private double hoursBetween(LocalDateTime start, LocalDateTime end) {
        return Duration.between(start, end).toNanos() / 3_600_000_000_000.0;
    }

    private double calculateUtilizationPercentage(double reservedUnitHours, double capacityUnitHours) {
        if (capacityUnitHours == 0) {
            return 0;
        }

        return reservedUnitHours / capacityUnitHours * 100;
    }

    private double roundPercentage(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private long defaultZero(Long value) {
        return value == null ? 0 : value;
    }

    private record UtilizationSnapshot(
            List<Lab> labs,
            List<Equipment> equipment,
            Map<Long, LabUtilizationAccumulator> labStats,
            Map<Long, EquipmentUtilizationAccumulator> equipmentStats,
            double analyticsRangeHours
    ) {
    }

    private static class LabUtilizationAccumulator {

        private long equipmentRecords;
        private long equipmentUnits;
        private long approvedBookingCount;
        private long approvedBookedUnits;
        private double reservedUnitHours;
        private double capacityUnitHours;

        void addEquipment(Equipment equipment, double analyticsRangeHours) {
            equipmentRecords++;
            equipmentUnits += equipment.getQuantity();
            capacityUnitHours += equipment.getQuantity() * analyticsRangeHours;
        }

        void addBooking(long quantity, double overlapHours) {
            approvedBookingCount++;
            approvedBookedUnits += quantity;
            reservedUnitHours += overlapHours * quantity;
        }

        long equipmentRecords() {
            return equipmentRecords;
        }

        long equipmentUnits() {
            return equipmentUnits;
        }

        long approvedBookingCount() {
            return approvedBookingCount;
        }

        long approvedBookedUnits() {
            return approvedBookedUnits;
        }

        double utilizationPercentage() {
            if (capacityUnitHours == 0) {
                return 0;
            }

            return reservedUnitHours / capacityUnitHours * 100;
        }
    }

    private static class EquipmentUtilizationAccumulator {

        private long approvedBookingCount;
        private long approvedBookedUnits;
        private double reservedUnitHours;

        void addBooking(long quantity, double overlapHours) {
            approvedBookingCount++;
            approvedBookedUnits += quantity;
            reservedUnitHours += overlapHours * quantity;
        }

        long approvedBookingCount() {
            return approvedBookingCount;
        }

        long approvedBookedUnits() {
            return approvedBookedUnits;
        }

        double reservedUnitHours() {
            return reservedUnitHours;
        }
    }
}
