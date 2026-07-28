package com.lrplatform.service;

import com.lrplatform.dto.response.DashboardAnalytics;
import com.lrplatform.dto.response.DepartmentStats;
import com.lrplatform.dto.response.UtilizationDataPoint;
import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.enums.BookingStatus;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.EquipmentRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardAnalytics getDashboardAnalytics() {
        List<Equipment> allEquipment = equipmentRepository.findAll();
        long totalBookings = bookingRepository.count();

        long totalEquipment = allEquipment.size();
        long availableEquipment = allEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE).count();
        long inUseEquipment = allEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.IN_USE).count();
        long maintenanceEquipment = allEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.UNDER_MAINTENANCE).count();

        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING_APPROVAL);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long noShowBookings = bookingRepository.countByStatus(BookingStatus.NO_SHOW);

        double utilizationRate = totalEquipment > 0 ? (double) inUseEquipment / totalEquipment * 100 : 0;

        List<UtilizationDataPoint> utilizationTrend = buildUtilizationTrend(totalEquipment);
        List<DepartmentStats> departmentStats = buildDepartmentStats();

        return DashboardAnalytics.builder()
                .totalEquipment(totalEquipment)
                .availableEquipment(availableEquipment)
                .inUseEquipment(inUseEquipment)
                .maintenanceEquipment(maintenanceEquipment)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .pendingBookings(pendingBookings)
                .cancelledBookings(cancelledBookings)
                .noShowBookings(noShowBookings)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                .utilizationTrend(utilizationTrend)
                .departmentStats(departmentStats)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardAnalytics getDashboardAnalyticsByInstitution(Long institutionId) {
        List<Department> departments = departmentRepository.findByInstitutionId(institutionId);
        List<Long> departmentIds = departments.stream().map(Department::getId).toList();

        List<Equipment> institutionEquipment = equipmentRepository.findAll().stream()
                .filter(e -> e.getLaboratory() != null
                        && e.getLaboratory().getDepartment() != null
                        && departmentIds.contains(e.getLaboratory().getDepartment().getId()))
                .toList();

        long totalEquipment = institutionEquipment.size();
        long availableEquipment = institutionEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE).count();
        long inUseEquipment = institutionEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.IN_USE).count();
        long maintenanceEquipment = institutionEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.UNDER_MAINTENANCE).count();

        List<Booking> deptBookings = new ArrayList<>();
        for (Long deptId : departmentIds) {
            deptBookings.addAll(bookingRepository.findByEquipmentDepartmentId(deptId));
        }

        long totalBookings = deptBookings.size();
        long completedBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long pendingBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL).count();
        long cancelledBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long noShowBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.NO_SHOW).count();

        double utilizationRate = totalEquipment > 0 ? (double) inUseEquipment / totalEquipment * 100 : 0;

        List<UtilizationDataPoint> utilizationTrend = buildUtilizationTrend(totalEquipment);
        List<DepartmentStats> departmentStats = buildDepartmentStatsByInstitution(departmentIds);

        return DashboardAnalytics.builder()
                .totalEquipment(totalEquipment)
                .availableEquipment(availableEquipment)
                .inUseEquipment(inUseEquipment)
                .maintenanceEquipment(maintenanceEquipment)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .pendingBookings(pendingBookings)
                .cancelledBookings(cancelledBookings)
                .noShowBookings(noShowBookings)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                .utilizationTrend(utilizationTrend)
                .departmentStats(departmentStats)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardAnalytics getDashboardAnalyticsByDepartment(Long departmentId) {
        List<Equipment> deptEquipment = equipmentRepository.findAll().stream()
                .filter(e -> e.getLaboratory() != null
                        && e.getLaboratory().getDepartment() != null
                        && e.getLaboratory().getDepartment().getId().equals(departmentId))
                .toList();

        long totalEquipment = deptEquipment.size();
        long availableEquipment = deptEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE).count();
        long inUseEquipment = deptEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.IN_USE).count();
        long maintenanceEquipment = deptEquipment.stream().filter(e -> e.getStatus() == EquipmentStatus.UNDER_MAINTENANCE).count();

        List<Booking> deptBookings = bookingRepository.findByEquipmentDepartmentId(departmentId);

        long totalBookings = deptBookings.size();
        long completedBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long pendingBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL).count();
        long cancelledBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long noShowBookings = deptBookings.stream().filter(b -> b.getStatus() == BookingStatus.NO_SHOW).count();

        double utilizationRate = totalEquipment > 0 ? (double) inUseEquipment / totalEquipment * 100 : 0;

        List<UtilizationDataPoint> utilizationTrend = buildUtilizationTrend(totalEquipment);
        List<DepartmentStats> departmentStats = buildDepartmentStatsByDepartment(departmentId);

        return DashboardAnalytics.builder()
                .totalEquipment(totalEquipment)
                .availableEquipment(availableEquipment)
                .inUseEquipment(inUseEquipment)
                .maintenanceEquipment(maintenanceEquipment)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .pendingBookings(pendingBookings)
                .cancelledBookings(cancelledBookings)
                .noShowBookings(noShowBookings)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                .utilizationTrend(utilizationTrend)
                .departmentStats(departmentStats)
                .build();
    }

    private List<UtilizationDataPoint> buildUtilizationTrend(long totalEquipment) {
        List<UtilizationDataPoint> trend = new ArrayList<>();
        YearMonth now = YearMonth.now();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 5; i >= 0; i--) {
            YearMonth month = now.minusMonths(i);
            long usedHours;
            try {
                usedHours = bookingRepository.sumCompletedBookingHoursByMonth(month.getMonthValue(), month.getYear());
            } catch (Exception e) {
                usedHours = 0;
            }
            long totalHours = (long) totalEquipment * 160L;
            double utilPercent = totalHours > 0 ? Math.round((double) usedHours / totalHours * 10000.0) / 100.0 : 0;

            trend.add(UtilizationDataPoint.builder()
                    .label(month.format(labelFormatter))
                    .utilizationPercent(utilPercent)
                    .totalHours(totalHours)
                    .usedHours(usedHours)
                    .build());
        }
        return trend;
    }

    private List<DepartmentStats> buildDepartmentStats() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentStats> stats = new ArrayList<>();

        for (Department dept : departments) {
            long equipmentCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bookingCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            long userCount = userRepository.countByDepartmentId(dept.getId());
            long inUseCount = equipmentRepository.countInUseByLaboratoryDepartmentId(dept.getId());
            double utilRate = equipmentCount > 0 ? Math.round((double) inUseCount / equipmentCount * 10000.0) / 100.0 : 0;

            stats.add(DepartmentStats.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getDepartmentName())
                    .equipmentCount(equipmentCount)
                    .bookingCount(bookingCount)
                    .userCount(userCount)
                    .utilizationRate(utilRate)
                    .build());
        }
        return stats;
    }

    private List<DepartmentStats> buildDepartmentStatsByInstitution(List<Long> departmentIds) {
        List<Department> departments = departmentRepository.findAll().stream()
                .filter(d -> departmentIds.contains(d.getId()))
                .toList();
        List<DepartmentStats> stats = new ArrayList<>();

        for (Department dept : departments) {
            long equipmentCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bookingCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            long userCount = userRepository.countByDepartmentId(dept.getId());
            long inUseCount = equipmentRepository.countInUseByLaboratoryDepartmentId(dept.getId());
            double utilRate = equipmentCount > 0 ? Math.round((double) inUseCount / equipmentCount * 10000.0) / 100.0 : 0;

            stats.add(DepartmentStats.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getDepartmentName())
                    .equipmentCount(equipmentCount)
                    .bookingCount(bookingCount)
                    .userCount(userCount)
                    .utilizationRate(utilRate)
                    .build());
        }
        return stats;
    }

    private List<DepartmentStats> buildDepartmentStatsByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId).orElse(null);
        if (dept == null) return List.of();

        long equipmentCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
        long bookingCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
        long userCount = userRepository.countByDepartmentId(dept.getId());
        long inUseCount = equipmentRepository.countInUseByLaboratoryDepartmentId(dept.getId());
        double utilRate = equipmentCount > 0 ? Math.round((double) inUseCount / equipmentCount * 10000.0) / 100.0 : 0;

        return List.of(DepartmentStats.builder()
                .departmentId(dept.getId())
                .departmentName(dept.getDepartmentName())
                .equipmentCount(equipmentCount)
                .bookingCount(bookingCount)
                .userCount(userCount)
                .utilizationRate(utilRate)
                .build());
    }
}
