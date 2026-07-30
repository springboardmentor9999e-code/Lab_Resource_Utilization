package com.rems.service;

import com.rems.entity.Booking;
import com.rems.entity.Department;
import com.rems.entity.DepartmentDemandSummary;
import com.rems.entity.DepartmentUtilizationSummary;
import com.rems.entity.DowntimeRecord;
import com.rems.entity.Equipment;
import com.rems.entity.EquipmentBlackoutDate;
import com.rems.entity.EquipmentDemandMetric;
import com.rems.entity.IdleAlert;
import com.rems.entity.Institution;
import com.rems.entity.InstitutionDemandSummary;
import com.rems.entity.InstitutionUtilizationSummary;
import com.rems.entity.UsageLog;
import com.rems.entity.UtilizationMetric;
import com.rems.entity.WaitlistEntry;
import com.rems.enums.BookingStatus;
import com.rems.repository.BookingRepository;
import com.rems.repository.DepartmentDemandSummaryRepository;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.DepartmentUtilizationSummaryRepository;
import com.rems.repository.DowntimeRecordRepository;
import com.rems.repository.EquipmentBlackoutDateRepository;
import com.rems.repository.EquipmentDemandMetricRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.IdleAlertRepository;
import com.rems.repository.InstitutionDemandSummaryRepository;
import com.rems.repository.InstitutionRepository;
import com.rems.repository.InstitutionUtilizationSummaryRepository;
import com.rems.repository.UsageLogRepository;
import com.rems.repository.UtilizationMetricRepository;
import com.rems.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RollupJobService {

    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingRepository bookingRepository;
    private final UsageLogRepository usageLogRepository;
    private final WaitlistRepository waitlistRepository;
    private final EquipmentBlackoutDateRepository blackoutDateRepository;
    private final DowntimeRecordRepository downtimeRecordRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final DepartmentUtilizationSummaryRepository departmentUtilizationSummaryRepository;
    private final InstitutionUtilizationSummaryRepository institutionUtilizationSummaryRepository;
    private final EquipmentDemandMetricRepository equipmentDemandMetricRepository;
    private final DepartmentDemandSummaryRepository departmentDemandSummaryRepository;
    private final InstitutionDemandSummaryRepository institutionDemandSummaryRepository;
    private final IdleAlertRepository idleAlertRepository;

    // Weights from application.yml
    @Value("${app.demand.weights.booking-requests:0.35}")
    private double weightBookingRequests;

    @Value("${app.demand.weights.waitlist-entries:0.30}")
    private double weightWaitlistEntries;

    @Value("${app.demand.weights.rejected-ratio:0.20}")
    private double weightRejectedRatio;

    @Value("${app.demand.weights.lead-time:0.15}")
    private double weightLeadTime;

    // Thresholds
    @Value("${app.demand.thresholds.idle-utilization:0.15}")
    private double thresholdIdleUtilization;

    /**
     * Pipeline execution triggers in sequence.
     */
    @Transactional
    public void runPipelineForDate(LocalDate targetDate) {
        log.info("Starting rollup pipeline for date: {}", targetDate);
        runUtilizationRollup(targetDate);
        runDemandRollup(targetDate);
        runAggregation(targetDate);
        runIdleDetection(targetDate);
        log.info("Rollup pipeline completed successfully for date: {}", targetDate);
    }

    /**
     * Cron jobs scheduled sequentially
     */
    @Scheduled(cron = "0 30 0 * * *") // 00:30 daily
    public void runUtilizationRollupJob() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Scheduled job: UtilizationRollupJob for {}", yesterday);
        runUtilizationRollup(yesterday);
    }

    @Scheduled(cron = "0 45 0 * * *") // 00:45 daily
    public void runDemandRollupJob() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Scheduled job: DemandRollupJob for {}", yesterday);
        runDemandRollup(yesterday);
    }

    @Scheduled(cron = "0 0 1 * * *") // 01:00 daily
    public void runAggregationJob() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Scheduled job: AggregationJob for {}", yesterday);
        runAggregation(yesterday);
    }

    @Scheduled(cron = "0 15 1 * * *") // 01:15 daily
    public void runIdleDetectionJob() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Scheduled job: IdleDetectionJob for {}", yesterday);
        runIdleDetection(yesterday);
    }

    /**
     * 1. UtilizationRollup
     */
    @Transactional
    public void runUtilizationRollup(LocalDate targetDate) {
        log.info("Running UtilizationRollup for date: {}", targetDate);
        List<Equipment> equipments = equipmentRepository.findAll();

        for (Equipment eq : equipments) {
            Institution inst = eq.getInstitution();
            double operatingHours = (inst != null && inst.getOperatingHoursPerDay() != null) 
                    ? inst.getOperatingHoursPerDay() : 24.0;
            String tzStr = (inst != null && inst.getTimezone() != null) ? inst.getTimezone() : "UTC";
            ZoneId zoneId;
            try {
                zoneId = ZoneId.of(tzStr);
            } catch (Exception e) {
                zoneId = ZoneId.of("UTC");
            }

            ZonedDateTime localStartOfDay = targetDate.atStartOfDay(zoneId);
            ZonedDateTime localEndOfDay = targetDate.plusDays(1).atStartOfDay(zoneId);
            Instant dayStart = localStartOfDay.toInstant();
            Instant dayEnd = localEndOfDay.toInstant();

            // Calculate Blackout hours
            double blackoutHours = blackoutDateRepository.findByEquipmentEquipmentIdAndBlackoutDate(eq.getEquipmentId(), targetDate)
                    .stream()
                    .mapToDouble(EquipmentBlackoutDate::getHours)
                    .sum();

            // Calculate Maintenance hours
            double maintenanceHours = 0.0;
            List<DowntimeRecord> downtimeRecords = downtimeRecordRepository.findByEquipmentEquipmentId(eq.getEquipmentId());
            for (DowntimeRecord dt : downtimeRecords) {
                Instant start = dt.getStartTime();
                Instant end = dt.getEndTime() != null ? dt.getEndTime() : Instant.now();

                if (start.isBefore(dayEnd) && end.isAfter(dayStart)) {
                    Instant overlapStart = start.isBefore(dayStart) ? dayStart : start;
                    Instant overlapEnd = end.isAfter(dayEnd) ? dayEnd : end;
                    double overlapHrs = Duration.between(overlapStart, overlapEnd).toMillis() / 3600000.0;
                    maintenanceHours += overlapHrs;
                }
            }

            double availableHours = operatingHours - blackoutHours - maintenanceHours;
            if (availableHours < 0) availableHours = 0.0;

            // Calculate Used hours
            double usedHours = 0.0;
            List<UsageLog> logs = usageLogRepository.findByEquipmentEquipmentId(eq.getEquipmentId());
            boolean hasLogs = false;
            for (UsageLog logEntry : logs) {
                ZonedDateTime logStartLocal = logEntry.getActualStartTime().atZone(zoneId);
                if (logStartLocal.toLocalDate().equals(targetDate)) {
                    double durationHrs = Duration.between(logEntry.getActualStartTime(), logEntry.getActualEndTime()).toMillis() / 3600000.0;
                    usedHours += durationHrs;
                    hasLogs = true;
                }
            }

            if (!hasLogs) {
                // Fallback to bookings
                List<Booking> bookings = bookingRepository.findByUserEmailOrderByCreatedAtDesc(eq.getDepartment() != null ? "priya.verma@iitbhu.ac.in" : "aarav.sharma@iitbhu.ac.in");
                // Actually let's query all bookings for the equipment
                // We don't have a direct query in BookingRepository, but we can filter bookings by equipment
                List<Booking> eqBookings = bookingRepository.findAll().stream()
                        .filter(b -> b.getEquipment().getEquipmentId().equals(eq.getEquipmentId()))
                        .toList();

                for (Booking b : eqBookings) {
                    ZonedDateTime bStartLocal = b.getStartTime().atZone(zoneId);
                    if (bStartLocal.toLocalDate().equals(targetDate) && 
                        (b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.IN_USE)) {
                        double durationHrs = Duration.between(b.getStartTime(), b.getEndTime()).toMillis() / 3600000.0;
                        usedHours += durationHrs;
                    }
                }
            }

            Double utilRate = null;
            Double savedAvailableHours = availableHours;
            if (availableHours > 0.0) {
                utilRate = Math.min(usedHours / availableHours, 1.0);
            } else {
                savedAvailableHours = null; // Stored as NULL utilization if available_hours == 0
            }

            // Save utilization metric
            Optional<UtilizationMetric> existing = utilizationMetricRepository.findByEquipmentEquipmentIdAndDate(eq.getEquipmentId(), targetDate);
            UtilizationMetric metric = existing.orElseGet(() -> new UtilizationMetric());
            metric.setEquipment(eq);
            metric.setDate(targetDate);
            metric.setUsedHours(usedHours);
            metric.setAvailableHours(savedAvailableHours);
            metric.setUtilizationRate(utilRate);
            utilizationMetricRepository.save(metric);
        }
    }

    /**
     * 2. DemandRollup
     */
    @Transactional
    public void runDemandRollup(LocalDate targetDate) {
        log.info("Running DemandRollup for date: {}", targetDate);
        List<Equipment> equipments = equipmentRepository.findAll();

        runDemandRollupForPeriod(equipments, targetDate, 7, "7d");
        runDemandRollupForPeriod(equipments, targetDate, 30, "30d");
    }

    private void runDemandRollupForPeriod(List<Equipment> equipments, LocalDate targetDate, int days, String periodType) {
        LocalDate periodStartLocalDate = targetDate.minusDays(days - 1);
        
        // Calculate raw metrics for all equipment first
        Map<Long, RawDemandSignals> rawSignalsMap = new HashMap<>();
        Map<String, List<RawDemandSignals>> categorySignals = new HashMap<>();

        for (Equipment eq : equipments) {
            Institution inst = eq.getInstitution();
            String tzStr = (inst != null && inst.getTimezone() != null) ? inst.getTimezone() : "UTC";
            ZoneId zoneId = ZoneId.of(tzStr);

            ZonedDateTime periodStartLocal = periodStartLocalDate.atStartOfDay(zoneId);
            ZonedDateTime periodEndLocal = targetDate.plusDays(1).atStartOfDay(zoneId);
            Instant startInstant = periodStartLocal.toInstant();
            Instant endInstant = periodEndLocal.toInstant();

            // Bookings requests created in period
            List<Booking> periodBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getEquipment().getEquipmentId().equals(eq.getEquipmentId()) &&
                            !b.getCreatedAt().isBefore(startInstant) && !b.getCreatedAt().isAfter(endInstant))
                    .toList();

            long bookingRequests = periodBookings.size();
            long rejectedBookings = periodBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                    .count();

            // Waitlist entries created in period
            List<WaitlistEntry> waitlistEntries = waitlistRepository.findByEquipmentEquipmentIdAndCreatedAtBetween(eq.getEquipmentId(), startInstant, endInstant);
            long waitlistCount = waitlistEntries.size();

            // Avg waitlist wait hours
            double totalWaitHours = 0.0;
            long waitWithNotificationCount = 0;
            for (WaitlistEntry w : waitlistEntries) {
                if (w.getNotifiedAt() != null) {
                    double hours = Duration.between(w.getCreatedAt(), w.getNotifiedAt()).toMillis() / 3600000.0;
                    totalWaitHours += hours;
                    waitWithNotificationCount++;
                }
            }
            double avgWaitlistWaitHours = waitWithNotificationCount > 0 ? (totalWaitHours / waitWithNotificationCount) : 0.0;

            // Avg lead time hours
            double totalLeadHours = 0.0;
            for (Booking b : periodBookings) {
                double hours = Duration.between(b.getCreatedAt(), b.getStartTime()).toMillis() / 3600000.0;
                totalLeadHours += hours;
            }
            double avgLeadTimeHours = bookingRequests > 0 ? (totalLeadHours / bookingRequests) : 0.0;

            String category = eq.getCategory() != null ? eq.getCategory() : "General";

            RawDemandSignals signals = new RawDemandSignals(
                    eq,
                    bookingRequests,
                    rejectedBookings,
                    waitlistCount,
                    avgWaitlistWaitHours,
                    avgLeadTimeHours
            );

            rawSignalsMap.put(eq.getEquipmentId(), signals);
            categorySignals.computeIfAbsent(category, k -> new ArrayList<>()).add(signals);
        }

        // Min-max normalize within category
        for (Map.Entry<String, List<RawDemandSignals>> entry : categorySignals.entrySet()) {
            List<RawDemandSignals> list = entry.getValue();

            // Extract min & max
            double minRequests = list.stream().mapToDouble(s -> s.requests).min().orElse(0.0);
            double maxRequests = list.stream().mapToDouble(s -> s.requests).max().orElse(0.0);

            double minWaitlist = list.stream().mapToDouble(s -> s.waitlist).min().orElse(0.0);
            double maxWaitlist = list.stream().mapToDouble(s -> s.waitlist).max().orElse(0.0);

            double minRejectedRatio = list.stream().mapToDouble(RawDemandSignals::getRejectedRatio).min().orElse(0.0);
            double maxRejectedRatio = list.stream().mapToDouble(RawDemandSignals::getRejectedRatio).max().orElse(0.0);

            // Shorter lead time = higher pressure. Signal: 1 / avg_lead_time_hours. Guard against divide by zero.
            double minInvLeadTime = list.stream().mapToDouble(RawDemandSignals::getInvLeadTime).min().orElse(0.0);
            double maxInvLeadTime = list.stream().mapToDouble(RawDemandSignals::getInvLeadTime).max().orElse(0.0);

            for (RawDemandSignals s : list) {
                double normRequests = normalize(s.requests, minRequests, maxRequests);
                double normWaitlist = normalize(s.waitlist, minWaitlist, maxWaitlist);
                double normRejectedRatio = normalize(s.getRejectedRatio(), minRejectedRatio, maxRejectedRatio);
                double normInvLead = normalize(s.getInvLeadTime(), minInvLeadTime, maxInvLeadTime);

                double demandScore = weightBookingRequests * normRequests
                        + weightWaitlistEntries * normWaitlist
                        + weightRejectedRatio * normRejectedRatio
                        + weightLeadTime * normInvLead;

                // Save
                Optional<EquipmentDemandMetric> existing = equipmentDemandMetricRepository
                        .findByEquipmentEquipmentIdAndPeriodStartAndPeriodEndAndPeriodType(
                                s.equipment.getEquipmentId(), periodStartLocalDate, targetDate, periodType);

                EquipmentDemandMetric metric = existing.orElseGet(() -> new EquipmentDemandMetric());
                metric.setEquipment(s.equipment);
                metric.setPeriodStart(periodStartLocalDate);
                metric.setPeriodEnd(targetDate);
                metric.setPeriodType(periodType);
                metric.setBookingRequests(s.requests);
                metric.setRejectedBookings(s.rejected);
                metric.setWaitlistEntries(s.waitlist);
                metric.setAvgWaitlistWaitHours(s.avgWaitHours);
                metric.setAvgLeadTimeHours(s.avgLeadHours);
                metric.setDemandScore(demandScore);

                equipmentDemandMetricRepository.save(metric);
            }
        }
    }

    private double normalize(double x, double min, double max) {
        if (max == min) return 0.5; // Neutral
        return (x - min) / (max - min);
    }

    /**
     * 3. Aggregation
     */
    @Transactional
    public void runAggregation(LocalDate targetDate) {
        log.info("Running Aggregation for date: {}", targetDate);

        // Roll up utilization for departments
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            List<UtilizationMetric> metrics = utilizationMetricRepository
                    .findByEquipmentDepartmentDepartmentIdAndDateBetween(dept.getDepartmentId(), targetDate, targetDate);

            double sumUsedHours = 0.0;
            double sumAvailableHours = 0.0;
            boolean hasAvailable = false;

            for (UtilizationMetric m : metrics) {
                if (m.getAvailableHours() != null) {
                    sumUsedHours += m.getUsedHours();
                    sumAvailableHours += m.getAvailableHours();
                    hasAvailable = true;
                }
            }

            if (hasAvailable && sumAvailableHours > 0.0) {
                double deptRate = Math.min(sumUsedHours / sumAvailableHours, 1.0);
                Optional<DepartmentUtilizationSummary> existing = departmentUtilizationSummaryRepository
                        .findByDepartmentDepartmentIdAndDate(dept.getDepartmentId(), targetDate);
                DepartmentUtilizationSummary summary = existing.orElseGet(() -> new DepartmentUtilizationSummary());
                summary.setDepartment(dept);
                summary.setDate(targetDate);
                summary.setUsedHours(sumUsedHours);
                summary.setAvailableHours(sumAvailableHours);
                summary.setUtilizationRate(deptRate);
                departmentUtilizationSummaryRepository.save(summary);
            }
        }

        // Roll up utilization for institutions
        List<Institution> institutions = institutionRepository.findAll();
        for (Institution inst : institutions) {
            // Find all department summaries in this institution
            List<DepartmentUtilizationSummary> deptSummaries = departmentUtilizationSummaryRepository.findAll().stream()
                    .filter(ds -> ds.getDepartment().getInstitution().getInstitutionId().equals(inst.getInstitutionId()) && ds.getDate().equals(targetDate))
                    .toList();

            double sumUsedHours = 0.0;
            double sumAvailableHours = 0.0;
            boolean hasAvailable = false;

            for (DepartmentUtilizationSummary ds : deptSummaries) {
                sumUsedHours += ds.getUsedHours();
                sumAvailableHours += ds.getAvailableHours();
                hasAvailable = true;
            }

            if (hasAvailable && sumAvailableHours > 0.0) {
                double instRate = Math.min(sumUsedHours / sumAvailableHours, 1.0);
                Optional<InstitutionUtilizationSummary> existing = institutionUtilizationSummaryRepository
                        .findByInstitutionInstitutionIdAndDate(inst.getInstitutionId(), targetDate);
                InstitutionUtilizationSummary summary = existing.orElseGet(() -> new InstitutionUtilizationSummary());
                summary.setInstitution(inst);
                summary.setDate(targetDate);
                summary.setUsedHours(sumUsedHours);
                summary.setAvailableHours(sumAvailableHours);
                summary.setUtilizationRate(instRate);
                institutionUtilizationSummaryRepository.save(summary);
            }
        }

        // Roll up demand summaries (7d and 30d)
        for (String type : List.of("7d", "30d")) {
            for (Department dept : departments) {
                List<EquipmentDemandMetric> metrics = equipmentDemandMetricRepository
                        .findByEquipmentDepartmentDepartmentIdAndPeriodType(dept.getDepartmentId(), type).stream()
                        .filter(m -> m.getPeriodEnd().equals(targetDate))
                        .toList();

                if (!metrics.isEmpty()) {
                    double avgScore = metrics.stream().mapToDouble(EquipmentDemandMetric::getDemandScore).average().orElse(0.5);
                    LocalDate periodStart = metrics.get(0).getPeriodStart();
                    
                    Optional<DepartmentDemandSummary> existing = departmentDemandSummaryRepository
                            .findByDepartmentDepartmentIdAndPeriodStartAndPeriodEndAndPeriodType(
                                    dept.getDepartmentId(), periodStart, targetDate, type);
                    
                    DepartmentDemandSummary summary = existing.orElseGet(() -> new DepartmentDemandSummary());
                    summary.setDepartment(dept);
                    summary.setPeriodStart(periodStart);
                    summary.setPeriodEnd(targetDate);
                    summary.setPeriodType(type);
                    summary.setAvgDemandScore(avgScore);
                    departmentDemandSummaryRepository.save(summary);
                }
            }

            for (Institution inst : institutions) {
                List<EquipmentDemandMetric> metrics = equipmentDemandMetricRepository
                        .findByEquipmentInstitutionInstitutionIdAndPeriodTypeOrderByDemandScoreDesc(inst.getInstitutionId(), type).stream()
                        .filter(m -> m.getPeriodEnd().equals(targetDate))
                        .toList();

                if (!metrics.isEmpty()) {
                    double avgScore = metrics.stream().mapToDouble(EquipmentDemandMetric::getDemandScore).average().orElse(0.5);
                    LocalDate periodStart = metrics.get(0).getPeriodStart();

                    Optional<InstitutionDemandSummary> existing = institutionDemandSummaryRepository
                            .findByInstitutionInstitutionIdAndPeriodStartAndPeriodEndAndPeriodType(
                                    inst.getInstitutionId(), periodStart, targetDate, type);

                    InstitutionDemandSummary summary = existing.orElseGet(() -> new InstitutionDemandSummary());
                    summary.setInstitution(inst);
                    summary.setPeriodStart(periodStart);
                    summary.setPeriodEnd(targetDate);
                    summary.setPeriodType(type);
                    summary.setAvgDemandScore(avgScore);
                    institutionDemandSummaryRepository.save(summary);
                }
            }
        }
    }

    /**
     * 4. IdleDetection
     */
    @Transactional
    public void runIdleDetection(LocalDate targetDate) {
        log.info("Running IdleDetection for date: {}", targetDate);
        List<Equipment> equipments = equipmentRepository.findAll();

        for (Equipment eq : equipments) {
            // Guard: skip equipment with fewer than 14 days of history entirely
            Instant createdAt = eq.getCreatedAt();
            LocalDate createdDate = createdAt != null ? createdAt.atZone(ZoneId.systemDefault()).toLocalDate() : targetDate.minusDays(30); // fallback to old
            if (createdDate.isAfter(targetDate.minusDays(14))) {
                log.debug("Skipping Idle Detection for equipment {} because history is < 14 days", eq.getName());
                continue;
            }

            // Calculate trailing avg over last 14 days, ignoring NULL (unavailable) days
            List<UtilizationMetric> history = utilizationMetricRepository
                    .findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(eq.getEquipmentId(), targetDate.minusDays(13), targetDate);

            double sumRates = 0.0;
            int countValidDays = 0;
            for (UtilizationMetric m : history) {
                if (m.getUtilizationRate() != null) {
                    sumRates += m.getUtilizationRate();
                    countValidDays++;
                }
            }

            if (countValidDays < 7) {
                // Insufficient data
                log.debug("Skipping Idle Detection for equipment {} because of insufficient history days", eq.getName());
                continue;
            }

            double trailingAvg = sumRates / countValidDays;

            Optional<IdleAlert> existingAlert = idleAlertRepository.findByEquipmentEquipmentIdAndResolvedFalse(eq.getEquipmentId());
            if (trailingAvg < thresholdIdleUtilization) {
                if (existingAlert.isEmpty()) {
                    IdleAlert alert = IdleAlert.builder()
                            .equipment(eq)
                            .detectedAt(Instant.now())
                            .idleDurationDays(14)
                            .resolved(false)
                            .build();
                    idleAlertRepository.save(alert);
                    log.info("Idle alert raised for equipment: {}", eq.getName());
                }
            } else {
                if (existingAlert.isPresent()) {
                    IdleAlert alert = existingAlert.get();
                    alert.setResolved(true);
                    alert.setResolvedAt(Instant.now());
                    idleAlertRepository.save(alert);
                    log.info("Idle alert resolved for equipment: {}", eq.getName());
                }
            }
        }
    }

    /**
     * Backfill pipeline chronologically
     */
    public void backfillPipeline(LocalDate start, LocalDate end) {
        log.info("Running backfill from {} to {}", start, end);
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            runPipelineForDate(curr);
            curr = curr.plusDays(1);
        }
        log.info("Backfill completed from {} to {}", start, end);
    }

    // Class to hold raw demand signals before normalization
    private static class RawDemandSignals {
        final Equipment equipment;
        final long requests;
        final long rejected;
        final long waitlist;
        final double avgWaitHours;
        final double avgLeadHours;

        RawDemandSignals(Equipment eq, long requests, long rejected, long waitlist, double avgWaitHours, double avgLeadHours) {
            this.equipment = eq;
            this.requests = requests;
            this.rejected = rejected;
            this.waitlist = waitlist;
            this.avgWaitHours = avgWaitHours;
            this.avgLeadHours = avgLeadHours;
        }

        double getRejectedRatio() {
            return requests > 0 ? ((double) rejected / requests) : 0.0;
        }

        double getInvLeadTime() {
            return avgLeadHours > 0 ? (1.0 / avgLeadHours) : 0.0;
        }
    }
}
