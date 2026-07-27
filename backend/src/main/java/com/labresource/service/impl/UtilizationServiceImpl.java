package com.labresource.service.impl;

import com.labresource.dto.response.BenchmarkResponse;
import com.labresource.dto.response.DemandAnalysisResponse;
import com.labresource.dto.response.EquipmentUtilizationResponse;
import com.labresource.dto.response.HeatmapCellResponse;
import com.labresource.dto.response.IdleEquipmentResponse;
import com.labresource.dto.response.PeakUsageResponse;
import com.labresource.dto.response.SharedUsageResponse;
import com.labresource.dto.response.TargetComparisonResponse;
import com.labresource.dto.response.UtilizationSummaryResponse;
import com.labresource.entity.Booking;
import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.Waitlist;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.EquipmentUsageRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.UtilizationBookingRepository;
import com.labresource.repository.WaitlistRepository;
import com.labresource.service.interfaces.UtilizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilizationServiceImpl implements UtilizationService {

    // Operating day 08:00-20:00 = 720 bookable minutes per day
    private static final int OPERATING_MINUTES_PER_DAY = 720;
    private static final int DAY_START_HOUR = 8;
    private static final int DAY_END_HOUR = 20;

    private static final List<String> ACTIVE_STATUSES = List.of("CONFIRMED", "IN_USE", "COMPLETED");
    private static final Set<String> EXCLUDED_EQUIPMENT_STATUSES =
            Set.of("UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED", "LOST");

    /**
     * Statuses that represent a request someone actually made — granted or refused.
     * PENDING is included because an undecided request is still demand; CANCELLED is not,
     * because the requester withdrew it themselves.
     */
    private static final List<String> DEMAND_STATUSES =
            List.of("PENDING", "CONFIRMED", "APPROVED", "IN_USE", "COMPLETED", "NO_SHOW", "REJECTED");
    /** Of the above, the ones that mean the platform said no. */
    private static final Set<String> REJECTED_STATUSES = Set.of("REJECTED");

    private static final String OVERSUBSCRIBED = "OVERSUBSCRIBED";

    /** Within this many points of target counts as ON_TRACK rather than a miss in either direction. */
    private static final double TARGET_TOLERANCE_POINTS = 5.0;

    /** Fallback target for a department/institution that has not set one of its own. */
    @Value("${app.utilization.default-target-percent:60}")
    private double defaultTargetPercent;

    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageRepository equipmentUsageRepository;
    private final UtilizationBookingRepository utilizationBookingRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final WaitlistRepository waitlistRepository;

    @Override
    @Transactional(readOnly = true)
    public EquipmentUtilizationResponse getEquipmentUtilization(Long equipmentId, int days) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days);
        List<Booking> bookings = utilizationBookingRepository
                .findInWindowForEquipment(equipmentId, from, today, ACTIVE_STATUSES);

        long usedMinutes = equipmentUsageRepository.sumUsedMinutes(equipmentId, from.atStartOfDay());
        return buildUtilization(equipment, bookings, usedMinutes, days);
    }

    @Override
    @Transactional(readOnly = true)
    public UtilizationSummaryResponse getSummary(int days) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days);

        List<Booking> bookings = utilizationBookingRepository.findInWindow(from, today, ACTIVE_STATUSES);
        Map<Long, List<Booking>> bookingsByEquipment = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentId()));

        List<Equipment> allEquipment = equipmentRepository.findAll();

        // Single grouped query instead of one sumUsedMinutes query per equipment
        Map<Long, Long> usedMinutesByEquipment = new HashMap<>();
        for (Object[] row : equipmentUsageRepository.sumUsedMinutesPerEquipment(from.atStartOfDay())) {
            usedMinutesByEquipment.put((Long) row[0], ((Number) row[1]).longValue());
        }

        List<EquipmentUtilizationResponse> perEquipment = allEquipment.stream()
                .map(eq -> buildUtilization(
                        eq,
                        bookingsByEquipment.getOrDefault(eq.getEquipmentId(), List.of()),
                        usedMinutesByEquipment.getOrDefault(eq.getEquipmentId(), 0L),
                        days))
                .sorted(Comparator.comparingDouble(EquipmentUtilizationResponse::getUtilizationRate).reversed())
                .collect(Collectors.toList());

        long totalBooked = perEquipment.stream().mapToLong(EquipmentUtilizationResponse::getBookedMinutes).sum();
        long totalUsed = perEquipment.stream().mapToLong(EquipmentUtilizationResponse::getUsedMinutes).sum();
        long capacity = (long) allEquipment.size() * days * OPERATING_MINUTES_PER_DAY;
        double overallRate = capacity == 0 ? 0.0 : round1(Math.min(100.0, totalBooked * 100.0 / capacity));

        Map<String, Double> departmentUtilization = perEquipment.stream()
                .filter(e -> e.getDepartmentName() != null)
                .collect(Collectors.groupingBy(
                        EquipmentUtilizationResponse::getDepartmentName,
                        TreeMap::new,
                        Collectors.averagingDouble(EquipmentUtilizationResponse::getUtilizationRate)));
        departmentUtilization.replaceAll((k, v) -> round1(v));

        Map<String, Double> institutionUtilization = perEquipment.stream()
                .filter(e -> e.getInstitutionName() != null)
                .collect(Collectors.groupingBy(
                        EquipmentUtilizationResponse::getInstitutionName,
                        TreeMap::new,
                        Collectors.averagingDouble(EquipmentUtilizationResponse::getUtilizationRate)));
        institutionUtilization.replaceAll((k, v) -> round1(v));

        List<EquipmentUtilizationResponse> mostUtilized = perEquipment.stream()
                .limit(5).collect(Collectors.toList());
        List<EquipmentUtilizationResponse> leastUtilized = perEquipment.stream()
                .sorted(Comparator.comparingDouble(EquipmentUtilizationResponse::getUtilizationRate))
                .limit(5).collect(Collectors.toList());

        long idleCount = getIdleEquipment(14).size();

        return UtilizationSummaryResponse.builder()
                .days(days)
                .overallUtilizationRate(overallRate)
                .totalBookedMinutes(totalBooked)
                .totalUsedMinutes(totalUsed)
                .totalBookings(bookings.size())
                .equipmentCount(allEquipment.size())
                .idleEquipmentCount(idleCount)
                .equipment(perEquipment)
                .mostUtilized(mostUtilized)
                .leastUtilized(leastUtilized)
                .departmentUtilization(departmentUtilization)
                .institutionUtilization(institutionUtilization)
                .departmentTargets(buildDepartmentTargets(allEquipment, perEquipment))
                .institutionTargets(buildInstitutionTargets(allEquipment, perEquipment))
                .benchmark(buildBenchmark(days, perEquipment, overallRate, totalBooked, bookings.size()))
                .sharedUsage(buildSharedUsage(days, allEquipment, perEquipment))
                .build();
    }

    // ------------------------------------------------------------------
    // Utilization dimension: Department vs. Institutional Targets
    // ------------------------------------------------------------------

    private List<TargetComparisonResponse> buildDepartmentTargets(
            List<Equipment> allEquipment, List<EquipmentUtilizationResponse> perEquipment) {

        // Average the equipment rates per department, matching how departmentUtilization is built
        Map<String, List<EquipmentUtilizationResponse>> byDepartment = perEquipment.stream()
                .filter(e -> e.getDepartmentName() != null)
                .collect(Collectors.groupingBy(EquipmentUtilizationResponse::getDepartmentName));

        // One representative Equipment per department name, to reach its Department entity
        Map<String, Department> departmentByName = new HashMap<>();
        for (Equipment eq : allEquipment) {
            if (eq.getDepartment() != null) {
                departmentByName.putIfAbsent(eq.getDepartment().getName(), eq.getDepartment());
            }
        }

        List<TargetComparisonResponse> targets = new ArrayList<>();
        byDepartment.forEach((name, equipmentList) -> {
            Department department = departmentByName.get(name);
            double actual = round1(equipmentList.stream()
                    .mapToDouble(EquipmentUtilizationResponse::getUtilizationRate)
                    .average().orElse(0.0));

            ResolvedTarget resolved = resolveDepartmentTarget(department);
            targets.add(comparison(
                    department == null ? null : department.getDepartmentId(),
                    name, "DEPARTMENT", actual, resolved, equipmentList.size()));
        });

        targets.sort(Comparator.comparingDouble(TargetComparisonResponse::getVariancePercent));
        return targets;
    }

    private List<TargetComparisonResponse> buildInstitutionTargets(
            List<Equipment> allEquipment, List<EquipmentUtilizationResponse> perEquipment) {

        Map<String, List<EquipmentUtilizationResponse>> byInstitution = perEquipment.stream()
                .filter(e -> e.getInstitutionName() != null)
                .collect(Collectors.groupingBy(EquipmentUtilizationResponse::getInstitutionName));

        Map<String, Institution> institutionByName = new HashMap<>();
        for (Equipment eq : allEquipment) {
            if (eq.getInstitution() != null) {
                institutionByName.putIfAbsent(eq.getInstitution().getName(), eq.getInstitution());
            }
        }

        List<TargetComparisonResponse> targets = new ArrayList<>();
        byInstitution.forEach((name, equipmentList) -> {
            Institution institution = institutionByName.get(name);
            double actual = round1(equipmentList.stream()
                    .mapToDouble(EquipmentUtilizationResponse::getUtilizationRate)
                    .average().orElse(0.0));

            ResolvedTarget resolved = (institution != null && institution.getUtilizationTargetPercent() != null)
                    ? new ResolvedTarget(institution.getUtilizationTargetPercent(), "OWN")
                    : new ResolvedTarget(defaultTargetPercent, "DEFAULT");

            targets.add(comparison(
                    institution == null ? null : institution.getInstitutionId(),
                    name, "INSTITUTION", actual, resolved, equipmentList.size()));
        });

        targets.sort(Comparator.comparingDouble(TargetComparisonResponse::getVariancePercent));
        return targets;
    }

    @Override
    @Transactional
    public Double setDepartmentTarget(Long departmentId, Double targetPercent) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        department.setUtilizationTargetPercent(validatedTarget(targetPercent));
        departmentRepository.save(department);
        return department.getUtilizationTargetPercent();
    }

    @Override
    @Transactional
    public Double setInstitutionTarget(Long institutionId, Double targetPercent) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
        institution.setUtilizationTargetPercent(validatedTarget(targetPercent));
        institutionRepository.save(institution);
        return institution.getUtilizationTargetPercent();
    }

    /** Null clears the target; anything else must be a sane percentage. */
    private Double validatedTarget(Double targetPercent) {
        if (targetPercent == null) {
            return null;
        }
        if (targetPercent < 0 || targetPercent > 100) {
            throw new IllegalArgumentException("Utilization target must be between 0 and 100");
        }
        return targetPercent;
    }

    /**
     * A department's own target wins; failing that it inherits its institution's; failing that the
     * configured platform default. An unset target must never be read as a target of zero.
     */
    private ResolvedTarget resolveDepartmentTarget(Department department) {
        if (department == null) {
            return new ResolvedTarget(defaultTargetPercent, "DEFAULT");
        }
        if (department.getUtilizationTargetPercent() != null) {
            return new ResolvedTarget(department.getUtilizationTargetPercent(), "OWN");
        }
        Institution institution = department.getInstitution();
        if (institution != null && institution.getUtilizationTargetPercent() != null) {
            return new ResolvedTarget(institution.getUtilizationTargetPercent(), "INHERITED");
        }
        return new ResolvedTarget(defaultTargetPercent, "DEFAULT");
    }

    private TargetComparisonResponse comparison(Long id, String name, String scope,
                                                double actual, ResolvedTarget target, int equipmentCount) {
        double variance = round1(actual - target.percent());
        String status;
        if (Math.abs(variance) <= TARGET_TOLERANCE_POINTS) {
            status = "ON_TRACK";
        } else {
            status = variance < 0 ? "BELOW" : "ABOVE";
        }

        return TargetComparisonResponse.builder()
                .id(id)
                .name(name)
                .scope(scope)
                .actualPercent(actual)
                .targetPercent(round1(target.percent()))
                .variancePercent(variance)
                .targetSource(target.source())
                .status(status)
                .equipmentCount(equipmentCount)
                .build();
    }

    private record ResolvedTarget(double percent, String source) {
    }

    // ------------------------------------------------------------------
    // Utilization dimension: Current vs. Historical Benchmarks
    // ------------------------------------------------------------------

    private BenchmarkResponse buildBenchmark(int days,
                                             List<EquipmentUtilizationResponse> current,
                                             double currentRate,
                                             long currentBookedMinutes,
                                             long currentBookings) {
        LocalDate today = LocalDate.now();
        // The equal-length window immediately before the current one. Ends a day early so the two
        // windows do not both count the boundary date.
        LocalDate previousTo = today.minusDays(days + 1L);
        LocalDate previousFrom = today.minusDays(2L * days);

        List<Booking> previousBookings =
                utilizationBookingRepository.findInWindow(previousFrom, previousTo, ACTIVE_STATUSES);

        Map<Long, List<Booking>> previousByEquipment = previousBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentId()));

        long previousBookedMinutes = previousBookings.stream()
                .mapToLong(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())
                .filter(m -> m > 0)
                .sum();

        // Measure the previous window over the same equipment set, so a newly-registered asset
        // does not make the past look artificially busy or idle
        int equipmentCount = current.size();
        long previousCapacity = (long) equipmentCount * days * OPERATING_MINUTES_PER_DAY;
        double previousRate = previousCapacity == 0 ? 0.0
                : round1(Math.min(100.0, previousBookedMinutes * 100.0 / previousCapacity));

        double changePoints = round1(currentRate - previousRate);
        double changePercent = previousRate == 0.0
                ? (currentRate > 0 ? 100.0 : 0.0)
                : round1((currentRate - previousRate) / previousRate * 100.0);
        String trend = Math.abs(changePoints) < 0.5 ? "FLAT" : (changePoints > 0 ? "UP" : "DOWN");

        // Per-equipment movement between the windows
        long windowCapacity = (long) days * OPERATING_MINUTES_PER_DAY;
        List<BenchmarkResponse.EquipmentTrend> trends = current.stream()
                .map(e -> {
                    long prevMinutes = previousByEquipment
                            .getOrDefault(e.getEquipmentId(), List.of()).stream()
                            .mapToLong(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())
                            .filter(m -> m > 0)
                            .sum();
                    double prevRate = windowCapacity == 0 ? 0.0
                            : round1(Math.min(100.0, prevMinutes * 100.0 / windowCapacity));
                    return BenchmarkResponse.EquipmentTrend.builder()
                            .equipmentId(e.getEquipmentId())
                            .equipmentName(e.getEquipmentName())
                            .equipmentCode(e.getEquipmentCode())
                            .currentRate(e.getUtilizationRate())
                            .previousRate(prevRate)
                            .changePercentagePoints(round1(e.getUtilizationRate() - prevRate))
                            .build();
                })
                .filter(t -> Math.abs(t.getChangePercentagePoints()) >= 0.1)
                .collect(Collectors.toList());

        List<BenchmarkResponse.EquipmentTrend> risers = trends.stream()
                .sorted(Comparator.comparingDouble(
                        BenchmarkResponse.EquipmentTrend::getChangePercentagePoints).reversed())
                .limit(5)
                .collect(Collectors.toList());
        List<BenchmarkResponse.EquipmentTrend> fallers = trends.stream()
                .sorted(Comparator.comparingDouble(
                        BenchmarkResponse.EquipmentTrend::getChangePercentagePoints))
                .limit(5)
                .collect(Collectors.toList());

        String summary;
        if (previousBookings.isEmpty()) {
            summary = "No usage in the preceding " + days + " days, so there is no baseline to"
                    + " compare against yet.";
        } else if ("FLAT".equals(trend)) {
            summary = "Utilization is essentially unchanged against the previous " + days + " days ("
                    + currentRate + "% vs " + previousRate + "%).";
        } else {
            summary = "Utilization is " + ("UP".equals(trend) ? "up" : "down") + " "
                    + Math.abs(changePoints) + " points against the previous " + days + " days ("
                    + currentRate + "% vs " + previousRate + "%).";
        }

        return BenchmarkResponse.builder()
                .days(days)
                .currentUtilizationRate(currentRate)
                .previousUtilizationRate(previousRate)
                .changePercentagePoints(changePoints)
                .changePercent(changePercent)
                .trend(trend)
                .currentBookedMinutes(currentBookedMinutes)
                .previousBookedMinutes(previousBookedMinutes)
                .currentBookings(currentBookings)
                .previousBookings(previousBookings.size())
                .biggestRisers(risers)
                .biggestFallers(fallers)
                .summary(summary)
                .build();
    }

    // ------------------------------------------------------------------
    // Utilization dimension: Shared vs. Exclusive Usage Patterns
    // ------------------------------------------------------------------

    private SharedUsageResponse buildSharedUsage(int days,
                                                 List<Equipment> allEquipment,
                                                 List<EquipmentUtilizationResponse> perEquipment) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days);

        Set<Long> shareableIds = allEquipment.stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsShareable()))
                .map(Equipment::getEquipmentId)
                .collect(Collectors.toSet());

        long shareableCount = shareableIds.size();
        long exclusiveCount = allEquipment.size() - shareableCount;

        List<Booking> bookings =
                utilizationBookingRepository.findInWindowWithParties(from, today, ACTIVE_STATUSES);

        long sharedMinutes = 0;
        long exclusiveMinutes = 0;
        long externalMinutes = 0;
        Map<Long, Long> externalBookingsByEquipment = new HashMap<>();
        Map<Long, Long> internalBookingsByEquipment = new HashMap<>();

        for (Booking b : bookings) {
            long minutes = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
            if (minutes <= 0) {
                continue;
            }
            Long equipmentId = b.getEquipment().getEquipmentId();
            boolean shareable = shareableIds.contains(equipmentId);

            if (shareable) {
                sharedMinutes += minutes;
                if (isExternalBooking(b)) {
                    externalMinutes += minutes;
                    externalBookingsByEquipment.merge(equipmentId, 1L, Long::sum);
                } else {
                    internalBookingsByEquipment.merge(equipmentId, 1L, Long::sum);
                }
            } else {
                exclusiveMinutes += minutes;
            }
        }

        long shareableCapacity = shareableCount * days * OPERATING_MINUTES_PER_DAY;
        long exclusiveCapacity = exclusiveCount * days * OPERATING_MINUTES_PER_DAY;
        double shareableRate = shareableCapacity == 0 ? 0.0
                : round1(Math.min(100.0, sharedMinutes * 100.0 / shareableCapacity));
        double exclusiveRate = exclusiveCapacity == 0 ? 0.0
                : round1(Math.min(100.0, exclusiveMinutes * 100.0 / exclusiveCapacity));

        long totalMinutes = sharedMinutes + exclusiveMinutes;
        double sharedPercent = totalMinutes == 0 ? 0.0 : round1(sharedMinutes * 100.0 / totalMinutes);
        double externalPercent = sharedMinutes == 0 ? 0.0
                : round1(externalMinutes * 100.0 / sharedMinutes);

        // Shareable on paper, never actually booked from outside
        Map<Long, EquipmentUtilizationResponse> utilizationById = perEquipment.stream()
                .collect(Collectors.toMap(EquipmentUtilizationResponse::getEquipmentId, e -> e, (a, b) -> a));

        List<SharedUsageResponse.UnderSharedEquipment> unrealised = allEquipment.stream()
                .filter(e -> shareableIds.contains(e.getEquipmentId()))
                .filter(e -> !externalBookingsByEquipment.containsKey(e.getEquipmentId()))
                .map(e -> SharedUsageResponse.UnderSharedEquipment.builder()
                        .equipmentId(e.getEquipmentId())
                        .equipmentName(e.getEquipmentName())
                        .equipmentCode(e.getEquipmentCode())
                        .institutionName(e.getInstitution() != null ? e.getInstitution().getName() : null)
                        .utilizationRate(utilizationById.containsKey(e.getEquipmentId())
                                ? utilizationById.get(e.getEquipmentId()).getUtilizationRate() : 0.0)
                        .internalBookings(internalBookingsByEquipment.getOrDefault(e.getEquipmentId(), 0L))
                        .build())
                .sorted(Comparator.comparingDouble(
                        SharedUsageResponse.UnderSharedEquipment::getUtilizationRate))
                .limit(10)
                .collect(Collectors.toList());

        List<String> insights = new ArrayList<>();
        if (allEquipment.isEmpty()) {
            insights.add("No equipment registered yet.");
        } else {
            insights.add(shareableCount + " of " + allEquipment.size() + " assets ("
                    + round1(allEquipment.isEmpty() ? 0.0 : shareableCount * 100.0 / allEquipment.size())
                    + "%) are listed for inter-institution sharing.");

            if (shareableCount > 0 && externalMinutes == 0) {
                insights.add("None of the shareable equipment was booked by another institution in"
                        + " this window — it is shared on paper but exclusive in practice.");
            } else if (shareableCount > 0) {
                insights.add(externalPercent + "% of time booked on shareable assets came from"
                        + " another institution.");
            }

            if (shareableCount > 0 && exclusiveCount > 0) {
                insights.add(shareableRate >= exclusiveRate
                        ? "Shareable assets run hotter than exclusive ones (" + shareableRate
                                + "% vs " + exclusiveRate + "%) — sharing is pulling real demand."
                        : "Shareable assets run cooler than exclusive ones (" + shareableRate
                                + "% vs " + exclusiveRate + "%) — the sharing listings are not"
                                + " attracting outside use.");
            }

            if (!unrealised.isEmpty()) {
                insights.add(unrealised.size() + " shareable asset(s) saw no external booking at all"
                        + " — worth promoting to partner institutions or de-listing.");
            }
        }

        return SharedUsageResponse.builder()
                .shareableEquipmentCount(shareableCount)
                .exclusiveEquipmentCount(exclusiveCount)
                .shareablePercent(allEquipment.isEmpty() ? 0.0
                        : round1(shareableCount * 100.0 / allEquipment.size()))
                .sharedBookedMinutes(sharedMinutes)
                .exclusiveBookedMinutes(exclusiveMinutes)
                .sharedMinutesPercent(sharedPercent)
                .externalBookedMinutes(externalMinutes)
                .externalUtilizationPercent(externalPercent)
                .shareableUtilizationRate(shareableRate)
                .exclusiveUtilizationRate(exclusiveRate)
                .unrealisedSharing(unrealised)
                .insights(insights)
                .build();
    }

    /** True when the booking's user belongs to a different institution than the equipment. */
    private boolean isExternalBooking(Booking booking) {
        Institution equipmentInstitution = booking.getEquipment().getInstitution();
        Institution userInstitution = booking.getUser().getInstitution();
        if (equipmentInstitution == null || userInstitution == null) {
            // Unmapped either side — cannot claim it crossed an institution boundary
            return false;
        }
        return !equipmentInstitution.getInstitutionId().equals(userInstitution.getInstitutionId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeatmapCellResponse> getHeatmap(int days, Long equipmentId) {
        UsageGrid grid = buildUsageGrid(days, equipmentId);

        List<HeatmapCellResponse> cells = new ArrayList<>();
        for (int dow = 1; dow <= 7; dow++) {
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                cells.add(HeatmapCellResponse.builder()
                        .dayOfWeek(dow)
                        .hour(hour)
                        .bookings(grid.counts[dow][hour])
                        .minutes(grid.minutes[dow][hour])
                        .build());
            }
        }
        return cells;
    }

    @Override
    @Transactional(readOnly = true)
    public PeakUsageResponse getPeakUsage(int days, Long equipmentId) {
        UsageGrid grid = buildUsageGrid(days, equipmentId);

        // Collapse the grid along each axis
        Map<String, Long> minutesByHour = new LinkedHashMap<>();
        long[] hourTotals = new long[24];
        for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
            long total = 0;
            for (int dow = 1; dow <= 7; dow++) {
                total += grid.minutes[dow][hour];
            }
            hourTotals[hour] = total;
            minutesByHour.put(hourLabel(hour), total);
        }

        Map<String, Long> minutesByDay = new LinkedHashMap<>();
        long[] dayTotals = new long[8];
        for (int dow = 1; dow <= 7; dow++) {
            long total = 0;
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                total += grid.minutes[dow][hour];
            }
            dayTotals[dow] = total;
            minutesByDay.put(dayLabel(dow), total);
        }

        Integer peakHour = extremeIndex(hourTotals, DAY_START_HOUR, DAY_END_HOUR, true);
        Integer quietHour = extremeIndex(hourTotals, DAY_START_HOUR, DAY_END_HOUR, false);
        Integer peakDay = extremeIndex(dayTotals, 1, 8, true);
        Integer quietDay = extremeIndex(dayTotals, 1, 8, false);

        // Rank every bookable cell so we can report both ends of the distribution
        List<PeakUsageResponse.PeakSlot> allSlots = new ArrayList<>();
        long busiestCell = 0;
        for (int dow = 1; dow <= 7; dow++) {
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                busiestCell = Math.max(busiestCell, grid.minutes[dow][hour]);
            }
        }
        for (int dow = 1; dow <= 7; dow++) {
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                long mins = grid.minutes[dow][hour];
                allSlots.add(PeakUsageResponse.PeakSlot.builder()
                        .dayOfWeek(dow)
                        .dayLabel(dayLabel(dow))
                        .hour(hour)
                        .hourLabel(hourLabel(hour))
                        .minutes(mins)
                        .bookings(grid.counts[dow][hour])
                        .intensityPercent(busiestCell == 0 ? 0.0 : round1(mins * 100.0 / busiestCell))
                        .build());
            }
        }

        List<PeakUsageResponse.PeakSlot> busiest = allSlots.stream()
                .sorted(Comparator.comparingLong(PeakUsageResponse.PeakSlot::getMinutes).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Quietest is only meaningful on weekdays — a dead Sunday is not a schedulable opportunity
        List<PeakUsageResponse.PeakSlot> quietest = allSlots.stream()
                .filter(s -> s.getDayOfWeek() <= 5)
                .sorted(Comparator.comparingLong(PeakUsageResponse.PeakSlot::getMinutes))
                .limit(5)
                .collect(Collectors.toList());

        int operatingHours = DAY_END_HOUR - DAY_START_HOUR;
        long totalMinutes = Arrays.stream(hourTotals).sum();
        double meanHourly = totalMinutes / (double) operatingHours;
        double peakToAverage = meanHourly == 0 ? 0.0
                : round1(hourTotals[peakHour == null ? DAY_START_HOUR : peakHour] / meanHourly);

        // How much of the load lands in the busiest quarter of the operating day
        int topQuarter = Math.max(1, operatingHours / 4);
        long topQuarterMinutes = Arrays.stream(hourTotals, DAY_START_HOUR, DAY_END_HOUR)
                .boxed()
                .sorted(Comparator.reverseOrder())
                .limit(topQuarter)
                .mapToLong(Long::longValue)
                .sum();
        double concentration = totalMinutes == 0 ? 0.0
                : round1(topQuarterMinutes * 100.0 / totalMinutes);

        return PeakUsageResponse.builder()
                .days(days)
                .equipmentId(equipmentId)
                .peakHour(peakHour)
                .peakHourLabel(peakHour == null ? null : hourLabel(peakHour))
                .peakHourMinutes(peakHour == null ? 0 : hourTotals[peakHour])
                .quietestHour(quietHour)
                .quietestHourLabel(quietHour == null ? null : hourLabel(quietHour))
                .quietestHourMinutes(quietHour == null ? 0 : hourTotals[quietHour])
                .peakDayOfWeek(peakDay)
                .peakDayLabel(peakDay == null ? null : dayLabel(peakDay))
                .peakDayMinutes(peakDay == null ? 0 : dayTotals[peakDay])
                .quietestDayOfWeek(quietDay)
                .quietestDayLabel(quietDay == null ? null : dayLabel(quietDay))
                .quietestDayMinutes(quietDay == null ? 0 : dayTotals[quietDay])
                .minutesByHour(minutesByHour)
                .minutesByDay(minutesByDay)
                .busiestSlots(busiest)
                .quietestSlots(quietest)
                .peakToAverageRatio(peakToAverage)
                .concentrationPercent(concentration)
                .insights(buildInsights(totalMinutes, peakToAverage, concentration,
                        peakHour, quietHour, peakDay, busiest, quietest))
                .build();
    }

    /**
     * Accumulates booked minutes and booking counts into a [dayOfWeek 1-7][hour] grid.
     * Shared by the heatmap and the peak analysis so both always agree on the numbers.
     */
    private UsageGrid buildUsageGrid(int days, Long equipmentId) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days);

        List<Booking> bookings = equipmentId == null
                ? utilizationBookingRepository.findInWindow(from, today, ACTIVE_STATUSES)
                : utilizationBookingRepository.findInWindowForEquipment(equipmentId, from, today, ACTIVE_STATUSES);

        UsageGrid grid = new UsageGrid();
        for (Booking b : bookings) {
            int dow = b.getBookingDate().getDayOfWeek().getValue(); // 1 = Monday
            int startMin = b.getStartTime().toSecondOfDay() / 60;
            int endMin = b.getEndTime().toSecondOfDay() / 60;
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                int slotStart = hour * 60;
                int slotEnd = slotStart + 60;
                int overlap = Math.min(endMin, slotEnd) - Math.max(startMin, slotStart);
                if (overlap > 0) {
                    grid.minutes[dow][hour] += overlap;
                    grid.counts[dow][hour]++;
                }
            }
        }
        grid.bookingCount = bookings.size();
        return grid;
    }

    private static final class UsageGrid {
        final long[][] minutes = new long[8][DAY_END_HOUR];
        final long[][] counts = new long[8][DAY_END_HOUR];
        int bookingCount;
    }

    /** Index of the largest (or smallest) value in [fromInclusive, toExclusive); null if all zero. */
    private Integer extremeIndex(long[] totals, int fromInclusive, int toExclusive, boolean max) {
        Integer best = null;
        for (int i = fromInclusive; i < toExclusive; i++) {
            if (best == null || (max ? totals[i] > totals[best] : totals[i] < totals[best])) {
                best = i;
            }
        }
        // An all-zero window has no meaningful peak — report nothing rather than a bogus 08:00
        if (best != null && max && totals[best] == 0) {
            return null;
        }
        return best;
    }

    private List<String> buildInsights(long totalMinutes, double peakToAverage, double concentration,
                                       Integer peakHour, Integer quietHour, Integer peakDay,
                                       List<PeakUsageResponse.PeakSlot> busiest,
                                       List<PeakUsageResponse.PeakSlot> quietest) {
        List<String> insights = new ArrayList<>();

        if (totalMinutes == 0) {
            insights.add("No confirmed usage in this window — there is no demand pattern to analyse yet.");
            return insights;
        }

        if (peakHour != null && peakDay != null) {
            insights.add("Demand peaks on " + dayLabel(peakDay) + " around " + hourLabel(peakHour) + ".");
        }

        if (peakToAverage >= 2.0) {
            insights.add("The busiest hour carries " + peakToAverage
                    + "x the average hourly load — demand is heavily bunched, so staggering bookings"
                    + " would free capacity without buying equipment.");
        } else if (peakToAverage > 0) {
            insights.add("Load is spread fairly evenly across the day (peak is only "
                    + peakToAverage + "x the average).");
        }

        if (concentration >= 50.0) {
            insights.add(concentration + "% of all booked time falls in just a quarter of the"
                    + " operating day — the schedule is top-heavy.");
        }

        if (!busiest.isEmpty() && busiest.get(0).getMinutes() > 0) {
            PeakUsageResponse.PeakSlot top = busiest.get(0);
            insights.add("Busiest single slot: " + top.getDayLabel() + " " + top.getHourLabel()
                    + " (" + top.getBookings() + " booking(s), " + top.getMinutes() + " minutes).");
        }

        if (!quietest.isEmpty()) {
            PeakUsageResponse.PeakSlot quiet = quietest.get(0);
            insights.add("Quietest weekday slot: " + quiet.getDayLabel() + " " + quiet.getHourLabel()
                    + " — steer flexible work here to relieve the peak.");
        } else if (quietHour != null) {
            insights.add("Quietest hour of the day is " + hourLabel(quietHour) + ".");
        }

        return insights;
    }

    private String hourLabel(int hour) {
        return String.format("%02d:00", hour);
    }

    private String dayLabel(int dayOfWeek) {
        return DayOfWeek.of(dayOfWeek).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdleEquipmentResponse> getIdleEquipment(int idleDays) {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.minusDays(idleDays);

        Map<Long, LocalDate> lastBookingByEquipment = new HashMap<>();
        for (Object[] row : utilizationBookingRepository.findLastBookingDates(ACTIVE_STATUSES)) {
            lastBookingByEquipment.put((Long) row[0], (LocalDate) row[1]);
        }

        return equipmentRepository.findAll().stream()
                .filter(eq -> !EXCLUDED_EQUIPMENT_STATUSES.contains(eq.getStatus()))
                .filter(eq -> {
                    LocalDate last = lastBookingByEquipment.get(eq.getEquipmentId());
                    return last == null || last.isBefore(cutoff);
                })
                .map(eq -> {
                    LocalDate last = lastBookingByEquipment.get(eq.getEquipmentId());
                    long idle = last == null ? idleDays : ChronoUnit.DAYS.between(last, today);
                    return IdleEquipmentResponse.builder()
                            .equipmentId(eq.getEquipmentId())
                            .equipmentName(eq.getEquipmentName())
                            .equipmentCode(eq.getEquipmentCode())
                            .labName(eq.getLab() != null ? eq.getLab().getName() : null)
                            .status(eq.getStatus())
                            .lastBookingDate(last)
                            .idleDays(idle)
                            .build();
                })
                .sorted(Comparator.comparingLong(IdleEquipmentResponse::getIdleDays).reversed())
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Demand analysis — the demand-side counterpart to utilization
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public DemandAnalysisResponse getDemandAnalysis(int days) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days);

        List<Equipment> allEquipment = equipmentRepository.findAll().stream()
                .filter(eq -> !EXCLUDED_EQUIPMENT_STATUSES.contains(eq.getStatus()))
                .collect(Collectors.toList());

        // Granted and denied come from bookings; waitlisted comes from the queue. A denied
        // booking and a waitlist entry are both demand the platform refused, so both count.
        List<Booking> bookings = utilizationBookingRepository
                .findInWindow(from, today, DEMAND_STATUSES);
        Map<Long, List<Booking>> bookingsByEquipment = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentId()));

        List<Waitlist> waitlist = waitlistRepository.findInWindow(from, today);
        Map<Long, List<Waitlist>> waitlistByEquipment = waitlist.stream()
                .collect(Collectors.groupingBy(w -> w.getEquipment().getEquipmentId()));

        long capacityPerEquipment = (long) days * OPERATING_MINUTES_PER_DAY;

        List<DemandAnalysisResponse.EquipmentDemand> perEquipment = allEquipment.stream()
                .map(eq -> buildEquipmentDemand(
                        eq,
                        bookingsByEquipment.getOrDefault(eq.getEquipmentId(), List.of()),
                        waitlistByEquipment.getOrDefault(eq.getEquipmentId(), List.of()),
                        capacityPerEquipment))
                .sorted(Comparator
                        .comparingDouble(DemandAnalysisResponse.EquipmentDemand::getContentionIndex)
                        .reversed())
                .collect(Collectors.toList());

        long totalCapacity = capacityPerEquipment * allEquipment.size();
        long totalRequested = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getRequestedMinutes);
        long totalGranted = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getGrantedMinutes);
        long totalUnmet = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getUnmetMinutes);

        long grantedRequests = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getGrantedRequests);
        long deniedRequests = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getDeniedRequests);
        long waitlistedRequests = sumOf(perEquipment, DemandAnalysisResponse.EquipmentDemand::getWaitlistedRequests);
        long totalRequests = grantedRequests + deniedRequests + waitlistedRequests;

        List<DemandAnalysisResponse.EquipmentDemand> oversubscribed = perEquipment.stream()
                .filter(e -> OVERSUBSCRIBED.equals(e.getDemandLevel()))
                .collect(Collectors.toList());
        List<DemandAnalysisResponse.EquipmentDemand> underutilised = perEquipment.stream()
                .filter(e -> "LOW".equals(e.getDemandLevel()) || "DORMANT".equals(e.getDemandLevel()))
                .sorted(Comparator.comparingDouble(DemandAnalysisResponse.EquipmentDemand::getContentionIndex))
                .collect(Collectors.toList());

        List<DemandAnalysisResponse.CategoryDemand> categories =
                buildCategoryDemand(allEquipment, perEquipment);

        return DemandAnalysisResponse.builder()
                .windowDays(days)
                .from(from)
                .to(today)
                .totalCapacityMinutes(totalCapacity)
                .totalRequestedMinutes(totalRequested)
                .totalGrantedMinutes(totalGranted)
                .totalUnmetMinutes(totalUnmet)
                .totalRequests(totalRequests)
                .grantedRequests(grantedRequests)
                .deniedRequests(deniedRequests)
                .waitlistedRequests(waitlistedRequests)
                .fulfilmentRate(percentage(grantedRequests, totalRequests))
                .contentionIndex(ratio(totalRequested, totalCapacity))
                .oversubscribed(oversubscribed)
                .underutilised(underutilised)
                .equipment(perEquipment)
                .categories(categories)
                .recommendations(buildDemandRecommendations(
                        oversubscribed, underutilised, categories,
                        ratio(totalRequested, totalCapacity),
                        percentage(grantedRequests, totalRequests),
                        waitlistedRequests, deniedRequests))
                .build();
    }

    private DemandAnalysisResponse.EquipmentDemand buildEquipmentDemand(
            Equipment equipment, List<Booking> bookings, List<Waitlist> waitlist, long capacityMinutes) {

        long grantedMinutes = 0, deniedMinutes = 0;
        long grantedCount = 0, deniedCount = 0;
        for (Booking b : bookings) {
            long minutes = minutesBetween(b.getStartTime(), b.getEndTime());
            if (REJECTED_STATUSES.contains(b.getStatus())) {
                deniedMinutes += minutes;
                deniedCount++;
            } else {
                grantedMinutes += minutes;
                grantedCount++;
            }
        }

        long waitlistedMinutes = 0;
        for (Waitlist w : waitlist) {
            waitlistedMinutes += minutesBetween(w.getStartTime(), w.getEndTime());
        }

        // Deepest single-day queue, not the window total — five people queued on one day is a
        // capacity problem, five spread over five days is not.
        long peakQueueDepth = waitlist.stream()
                .collect(Collectors.groupingBy(Waitlist::getRequestedDate, Collectors.counting()))
                .values().stream().mapToLong(Long::longValue).max().orElse(0L);

        long unmetMinutes = deniedMinutes + waitlistedMinutes;
        long requestedMinutes = grantedMinutes + unmetMinutes;
        long totalRequests = grantedCount + deniedCount + waitlist.size();

        double contention = ratio(requestedMinutes, capacityMinutes);
        double utilization = capacityMinutes == 0
                ? 0.0
                : round1(Math.min(100.0, grantedMinutes * 100.0 / capacityMinutes));

        return DemandAnalysisResponse.EquipmentDemand.builder()
                .equipmentId(equipment.getEquipmentId())
                .equipmentName(equipment.getEquipmentName())
                .equipmentCode(equipment.getEquipmentCode())
                .category(equipment.getCategory())
                .departmentName(equipment.getDepartment() != null ? equipment.getDepartment().getName() : null)
                .capacityMinutes(capacityMinutes)
                .requestedMinutes(requestedMinutes)
                .grantedMinutes(grantedMinutes)
                .deniedMinutes(deniedMinutes)
                .waitlistedMinutes(waitlistedMinutes)
                .unmetMinutes(unmetMinutes)
                .totalRequests(totalRequests)
                .grantedRequests(grantedCount)
                .deniedRequests(deniedCount)
                .waitlistedRequests(waitlist.size())
                .peakQueueDepth(peakQueueDepth)
                .utilizationRate(utilization)
                .fulfilmentRate(percentage(grantedCount, totalRequests))
                .contentionIndex(contention)
                .demandLevel(classifyDemand(contention, unmetMinutes, totalRequests))
                .build();
    }

    /**
     * Demand bands. OVERSUBSCRIBED is deliberately reachable two ways: contention at or over
     * capacity, or any unmet minutes at all on an item already running hot — an instrument at
     * 85% with a queue behind it is a procurement case even though contention is under 1.0.
     */
    private String classifyDemand(double contention, long unmetMinutes, long totalRequests) {
        if (totalRequests == 0) return "DORMANT";
        if (contention >= 1.0 || (contention >= 0.8 && unmetMinutes > 0)) return OVERSUBSCRIBED;
        if (contention >= 0.6) return "HIGH";
        if (contention >= 0.25) return "BALANCED";
        return "LOW";
    }

    private List<DemandAnalysisResponse.CategoryDemand> buildCategoryDemand(
            List<Equipment> allEquipment, List<DemandAnalysisResponse.EquipmentDemand> perEquipment) {

        Map<Long, String> categoryByEquipment = allEquipment.stream()
                .collect(Collectors.toMap(
                        Equipment::getEquipmentId,
                        eq -> eq.getCategory() == null || eq.getCategory().isBlank()
                                ? "Uncategorised" : eq.getCategory().trim()));

        Map<String, List<DemandAnalysisResponse.EquipmentDemand>> grouped = perEquipment.stream()
                .collect(Collectors.groupingBy(
                        e -> categoryByEquipment.getOrDefault(e.getEquipmentId(), "Uncategorised"),
                        TreeMap::new,
                        Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<DemandAnalysisResponse.EquipmentDemand> items = entry.getValue();
                    long capacity = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getCapacityMinutes);
                    long requested = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getRequestedMinutes);
                    long granted = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getGrantedMinutes);
                    long unmet = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getUnmetMinutes);
                    long grantedReq = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getGrantedRequests);
                    long allReq = sumOf(items, DemandAnalysisResponse.EquipmentDemand::getTotalRequests);

                    return DemandAnalysisResponse.CategoryDemand.builder()
                            .category(entry.getKey())
                            .equipmentCount(items.size())
                            .capacityMinutes(capacity)
                            .requestedMinutes(requested)
                            .grantedMinutes(granted)
                            .unmetMinutes(unmet)
                            .contentionIndex(ratio(requested, capacity))
                            .fulfilmentRate(percentage(grantedReq, allReq))
                            .oversubscribedCount((int) items.stream()
                                    .filter(i -> OVERSUBSCRIBED.equals(i.getDemandLevel())).count())
                            .dormantCount((int) items.stream()
                                    .filter(i -> "DORMANT".equals(i.getDemandLevel())).count())
                            .build();
                })
                .sorted(Comparator
                        .comparingDouble(DemandAnalysisResponse.CategoryDemand::getContentionIndex)
                        .reversed())
                .collect(Collectors.toList());
    }

    private List<String> buildDemandRecommendations(
            List<DemandAnalysisResponse.EquipmentDemand> oversubscribed,
            List<DemandAnalysisResponse.EquipmentDemand> underutilised,
            List<DemandAnalysisResponse.CategoryDemand> categories,
            double contentionIndex, double fulfilmentRate,
            long waitlistedRequests, long deniedRequests) {

        List<String> out = new ArrayList<>();

        if (oversubscribed.isEmpty() && waitlistedRequests == 0 && deniedRequests == 0) {
            out.add("No unmet demand in this window — every request was served by existing capacity.");
        }

        if (!oversubscribed.isEmpty()) {
            DemandAnalysisResponse.EquipmentDemand worst = oversubscribed.get(0);
            out.add(String.format(
                    "%d item%s oversubscribed. Worst is %s at %.0f%% of capacity with %d hour%s of unmet demand.",
                    oversubscribed.size(), oversubscribed.size() == 1 ? "" : "s",
                    worst.getEquipmentName(), worst.getContentionIndex() * 100,
                    worst.getUnmetMinutes() / 60, worst.getUnmetMinutes() / 60 == 1 ? "" : "s"));
        }

        // The most useful single finding: pressure in a category that also has idle units,
        // because that is solved by redeployment rather than by a purchase order.
        categories.stream()
                .filter(c -> c.getOversubscribedCount() > 0 && c.getDormantCount() > 0)
                .findFirst()
                .ifPresent(c -> out.add(String.format(
                        "%s has %d oversubscribed item%s and %d sitting unused — redeploy before purchasing.",
                        c.getCategory(), c.getOversubscribedCount(),
                        c.getOversubscribedCount() == 1 ? "" : "s", c.getDormantCount())));

        categories.stream()
                .filter(c -> c.getContentionIndex() >= 1.0 && c.getDormantCount() == 0)
                .findFirst()
                .ifPresent(c -> out.add(String.format(
                        "%s is oversubscribed as a whole (%.0f%% of capacity requested) with no spare units — "
                                + "additional capacity is the only remedy.",
                        c.getCategory(), c.getContentionIndex() * 100)));

        if (waitlistedRequests > 0) {
            out.add(String.format(
                    "%d waitlist entr%s in this window. Queue depth is the clearest signal of demand "
                            + "the schedule could not absorb.",
                    waitlistedRequests, waitlistedRequests == 1 ? "y" : "ies"));
        }

        if (fulfilmentRate > 0 && fulfilmentRate < 80.0) {
            out.add(String.format(
                    "Fulfilment rate is %.0f%% — roughly one request in %d was turned away.",
                    fulfilmentRate, Math.max(2, Math.round(100.0 / Math.max(1.0, 100.0 - fulfilmentRate)))));
        }

        if (contentionIndex > 0 && contentionIndex < 0.3 && underutilised.size() > 2) {
            out.add(String.format(
                    "Platform-wide demand is only %.0f%% of capacity with %d under-used item%s — "
                            + "consider consolidating or opening capacity to partner institutions.",
                    contentionIndex * 100, underutilised.size(), underutilised.size() == 1 ? "" : "s"));
        }

        return out;
    }

    private static long minutesBetween(java.time.LocalTime start, java.time.LocalTime end) {
        if (start == null || end == null) return 0L;
        return Math.max(0L, Duration.between(start, end).toMinutes());
    }

    private static <T> long sumOf(List<T> items, java.util.function.ToLongFunction<T> field) {
        return items.stream().mapToLong(field).sum();
    }

    /** Percentage of {@code total}, rounded to one place. Zero total reads as zero, not NaN. */
    private double percentage(long part, long total) {
        return total == 0 ? 0.0 : round1(part * 100.0 / total);
    }

    /** Unbounded ratio — deliberately allowed above 1.0, which is the oversubscription signal. */
    private double ratio(long part, long total) {
        return total == 0 ? 0.0 : Math.round(part * 1000.0 / total) / 1000.0;
    }

    private EquipmentUtilizationResponse buildUtilization(Equipment equipment, List<Booking> bookings,
                                                          long usedMinutes, int days) {
        long bookedMinutes = bookings.stream()
                .mapToLong(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())
                .filter(m -> m > 0)
                .sum();

        long capacity = (long) days * OPERATING_MINUTES_PER_DAY;
        double rate = capacity == 0 ? 0.0 : round1(Math.min(100.0, bookedMinutes * 100.0 / capacity));

        return EquipmentUtilizationResponse.builder()
                .equipmentId(equipment.getEquipmentId())
                .equipmentName(equipment.getEquipmentName())
                .equipmentCode(equipment.getEquipmentCode())
                .status(equipment.getStatus())
                .departmentName(equipment.getDepartment() != null ? equipment.getDepartment().getName() : null)
                .institutionName(equipment.getInstitution() != null ? equipment.getInstitution().getName() : null)
                .labName(equipment.getLab() != null ? equipment.getLab().getName() : null)
                .bookingCount(bookings.size())
                .bookedMinutes(bookedMinutes)
                .usedMinutes(usedMinutes)
                .utilizationRate(rate)
                .build();
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
