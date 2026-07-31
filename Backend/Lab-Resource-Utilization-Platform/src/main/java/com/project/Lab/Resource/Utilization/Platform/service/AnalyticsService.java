package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.DashboardStatsDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.DepartmentStatDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.HeatmapDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.UtilizationPointDTO;
import com.project.Lab.Resource.Utilization.Platform.entity.Equipment;
import com.project.Lab.Resource.Utilization.Platform.repository.BookingRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.DepartmentRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.EquipmentRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    // =========================================================
    // ROLE BASED DASHBOARD
    // =========================================================

    public DashboardStatsDTO getDashboardStats(String role) {

        role = role.toUpperCase();

        switch (role) {

            case "STUDENT":
            case "RESEARCHER":
            case "LAB_TECHNICIAN":
            case "LAB_MANAGER":
            case "DEPARTMENT_HEAD":
            case "INSTITUTION_ADMIN":
            case "SYSTEM_ADMIN":
                break;

            default:
                throw new RuntimeException("Invalid Role : " + role);

        }

        Long totalBookings =
                bookingRepository.count();

        Long pendingBookings =
                bookingRepository.countByStatus("PENDING");

        Long approvedBookings =
                bookingRepository.countByStatus("APPROVED");

        Long completedBookings =
                bookingRepository.countByStatus("COMPLETED");

        Long totalEquipment =
                equipmentRepository.count();

        Long availableEquipment =
                equipmentRepository.countByStatus("AVAILABLE");

        Long bookedEquipment =
                equipmentRepository.countByStatus("BOOKED");

        Long totalUsers =
                userRepository.count();

        Long activeUsers =
                userRepository.countByIsActive(true);

        return new DashboardStatsDTO(
                totalBookings,
                pendingBookings,
                approvedBookings,
                completedBookings,
                totalEquipment,
                availableEquipment,
                bookedEquipment,
                totalUsers,
                activeUsers
        );
    }
    // =========================================================
    // WEEKLY UTILIZATION
    // =========================================================

    public List<UtilizationPointDTO> getWeeklyUtilization() {

        List<Object[]> result =
                bookingRepository.getWeeklyUtilization();

        List<UtilizationPointDTO> response =
                new ArrayList<>();

        for (Object[] row : result) {

            String day = row[0].toString().trim();

            Long usage =
                    ((Number) row[1]).longValue();

            response.add(
                    new UtilizationPointDTO(
                            day,
                            usage
                    )
            );
        }

        return response;
    }
    // =========================================================
    // DEPARTMENT STATISTICS
    // =========================================================

    public List<DepartmentStatDTO> getDepartmentStatistics() {

        List<Object[]> result =
                departmentRepository.getDepartmentStatistics();

        List<DepartmentStatDTO> response =
                new ArrayList<>();

        for (Object[] row : result) {

            response.add(

                    new DepartmentStatDTO(

                            row[0].toString(),

                            ((Number) row[1]).longValue()

                    )

            );

        }

        return response;
    }
    // =========================================================
    // EQUIPMENT HEATMAP
    // =========================================================

    public List<HeatmapDTO> getEquipmentHeatmap() {

        List<Object[]> usageData =
                bookingRepository.getEquipmentUsage();

        List<HeatmapDTO> response =
                new ArrayList<>();

        Long totalBookings = bookingRepository.count();

        for (Object[] row : usageData) {

            Integer equipmentId =
                    ((Number) row[0]).intValue();

            Long bookings =
                    ((Number) row[1]).longValue();

            Equipment equipment =
                    equipmentRepository.findById(equipmentId)
                            .orElse(null);

            String equipmentName =
                    equipment != null
                            ? equipment.getEquipmentName()
                            : "Unknown Equipment";

            Double utilization = 0.0;

            if (totalBookings > 0) {
                utilization =
                        (bookings * 100.0) / totalBookings;
            }

            response.add(
                    new HeatmapDTO(
                            equipmentId,
                            equipmentName,
                            bookings,
                            Math.round(utilization * 100.0) / 100.0
                    )
            );
        }

        return response;
    }

    // =========================================================
    // TOP UTILIZED EQUIPMENT
    // =========================================================

    public List<HeatmapDTO> getTopUtilizedEquipment() {

        List<HeatmapDTO> heatmap =
                getEquipmentHeatmap();

        return heatmap.stream()
                .limit(10)
                .toList();
    }

}