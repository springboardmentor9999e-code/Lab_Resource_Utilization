package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.DashboardStatsDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.HeatmapDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.UtilizationPointDTO;
import com.project.Lab.Resource.Utilization.Platform.entity.Equipment;
import com.project.Lab.Resource.Utilization.Platform.repository.BookingRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.EquipmentRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    // =====================================================
    // DASHBOARD STATS
    // =====================================================

    public DashboardStatsDTO getDashboardStats() {

        Long totalBookings = bookingRepository.count();

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
                userRepository.count();

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

    // =====================================================
    // WEEKLY UTILIZATION
    // =====================================================

    public List<UtilizationPointDTO> getWeeklyUtilization() {

        List<Object[]> rows =
                bookingRepository.getWeeklyUtilization();

        List<UtilizationPointDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            result.add(
                    new UtilizationPointDTO(
                            row[0].toString(),
                            ((Number) row[1]).longValue()
                    )
            );
        }

        return result;
    }
    // =====================================================
    // EQUIPMENT HEATMAP
    // =====================================================

    public List<HeatmapDTO> getEquipmentHeatmap() {

        List<Object[]> usageData =
                bookingRepository.getEquipmentUsage();

        List<HeatmapDTO> heatmap = new ArrayList<>();

        Long totalBookings = bookingRepository.count();

        for (Object[] row : usageData) {

            Integer equipmentId =
                    ((Number) row[0]).intValue();

            Long bookings =
                    ((Number) row[1]).longValue();

            Equipment equipment = equipmentRepository
                    .findById(equipmentId)
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

            heatmap.add(
                    new HeatmapDTO(
                            equipmentId,
                            equipmentName,
                            bookings,
                            Math.round(utilization * 100.0) / 100.0
                    )
            );
        }

        return heatmap;
    }

}