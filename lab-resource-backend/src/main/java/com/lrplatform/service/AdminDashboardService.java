package com.lrplatform.service;

import com.lrplatform.dto.response.AdminDashboardStats;
import com.lrplatform.model.enums.BookingStatus;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceWorkOrderRepository maintenanceWorkOrderRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        return buildStats(
                userRepository.count(),
                institutionRepository.count(),
                equipmentRepository.count(),
                bookingRepository.count(),
                maintenanceWorkOrderRepository.count(),
                userRepository.countByStatus(true),
                userRepository.countByStatus(false),
                buildUsersByRole(role -> userRepository.countByRole(role)),
                buildEquipmentByStatus(status -> equipmentRepository.countByStatus(status)),
                buildBookingsByStatus(status -> bookingRepository.countByStatus(status))
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStatsByInstitution(Long institutionId) {
        long totalUsers = userRepository.findByInstitutionId(institutionId).size();
        long activeUsers = userRepository.countByInstitutionIdAndStatus(institutionId, true);
        long inactiveUsers = userRepository.countByInstitutionIdAndStatus(institutionId, false);
        long totalEquipment = equipmentRepository.countByLaboratoryDepartmentInstitutionId(institutionId);
        long totalBookings = bookingRepository.countByEquipmentLaboratoryDepartmentInstitutionId(institutionId);
        long totalWorkOrders = maintenanceWorkOrderRepository.countByEquipmentLaboratoryDepartmentInstitutionId(institutionId);

        return buildStats(
                totalUsers,
                1,
                totalEquipment,
                totalBookings,
                totalWorkOrders,
                activeUsers,
                inactiveUsers,
                buildUsersByRoleScoped(institutionId),
                buildEquipmentByStatusScoped(institutionId),
                buildBookingsByStatusScoped(institutionId)
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStatsByDepartment(Long departmentId) {
        long totalUsers = userRepository.findByDepartmentId(departmentId).size();
        long activeUsers = userRepository.countByDepartmentIdAndStatus(departmentId, true);
        long inactiveUsers = userRepository.countByDepartmentIdAndStatus(departmentId, false);
        long totalEquipment = equipmentRepository.countByLaboratoryDepartmentId(departmentId);
        long totalBookings = bookingRepository.countByEquipmentLaboratoryDepartmentId(departmentId);
        long totalWorkOrders = maintenanceWorkOrderRepository.countByEquipmentLaboratoryDepartmentId(departmentId);

        return buildStats(
                totalUsers,
                0,
                totalEquipment,
                totalBookings,
                totalWorkOrders,
                activeUsers,
                inactiveUsers,
                buildUsersByRoleDeptScoped(departmentId),
                buildEquipmentByStatusDeptScoped(departmentId),
                buildBookingsByStatusDeptScoped(departmentId)
        );
    }

    private AdminDashboardStats buildStats(
            long totalUsers, long totalInstitutions, long totalEquipment,
            long totalBookings, long totalWorkOrders, long activeUsers, long inactiveUsers,
            Map<String, Long> usersByRole, Map<String, Long> equipmentByStatus,
            Map<String, Long> bookingsByStatus) {
        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalInstitutions(totalInstitutions)
                .totalEquipment(totalEquipment)
                .totalBookings(totalBookings)
                .totalWorkOrders(totalWorkOrders)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .usersByRole(usersByRole)
                .equipmentByStatus(equipmentByStatus)
                .bookingsByStatus(bookingsByStatus)
                .build();
    }

    private Map<String, Long> buildUsersByRole(java.util.function.Function<UserRole, Long> counter) {
        Map<String, Long> usersByRole = new HashMap<>();
        for (UserRole role : UserRole.values()) {
            usersByRole.put(role.name(), counter.apply(role));
        }
        return usersByRole;
    }

    private Map<String, Long> buildUsersByRoleScoped(Long institutionId) {
        Map<String, Long> usersByRole = new HashMap<>();
        List<com.lrplatform.model.entity.User> users = userRepository.findByInstitutionId(institutionId);
        for (UserRole role : UserRole.values()) {
            long count = users.stream().filter(u -> u.getRole() == role).count();
            usersByRole.put(role.name(), count);
        }
        return usersByRole;
    }

    private Map<String, Long> buildUsersByRoleDeptScoped(Long departmentId) {
        Map<String, Long> usersByRole = new HashMap<>();
        List<com.lrplatform.model.entity.User> users = userRepository.findByDepartmentId(departmentId);
        for (UserRole role : UserRole.values()) {
            long count = users.stream().filter(u -> u.getRole() == role).count();
            usersByRole.put(role.name(), count);
        }
        return usersByRole;
    }

    private Map<String, Long> buildEquipmentByStatus(java.util.function.Function<EquipmentStatus, Long> counter) {
        Map<String, Long> equipmentByStatus = new HashMap<>();
        for (EquipmentStatus status : EquipmentStatus.values()) {
            equipmentByStatus.put(status.name(), counter.apply(status));
        }
        return equipmentByStatus;
    }

    private Map<String, Long> buildEquipmentByStatusScoped(Long institutionId) {
        Map<String, Long> equipmentByStatus = new HashMap<>();
        List<Object[]> results = equipmentRepository.countByStatusGroupedByInstitutionId(institutionId);
        for (Object[] row : results) {
            equipmentByStatus.put(row[0].toString(), (Long) row[1]);
        }
        return equipmentByStatus;
    }

    private Map<String, Long> buildEquipmentByStatusDeptScoped(Long departmentId) {
        Map<String, Long> equipmentByStatus = new HashMap<>();
        List<Object[]> results = equipmentRepository.countByStatusGroupedByDepartmentId(departmentId);
        for (Object[] row : results) {
            equipmentByStatus.put(row[0].toString(), (Long) row[1]);
        }
        return equipmentByStatus;
    }

    private Map<String, Long> buildBookingsByStatus(java.util.function.Function<BookingStatus, Long> counter) {
        Map<String, Long> bookingsByStatus = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            bookingsByStatus.put(status.name(), counter.apply(status));
        }
        return bookingsByStatus;
    }

    private Map<String, Long> buildBookingsByStatusScoped(Long institutionId) {
        Map<String, Long> bookingsByStatus = new HashMap<>();
        List<Object[]> results = bookingRepository.countByStatusGroupedByInstitutionId(institutionId);
        for (Object[] row : results) {
            bookingsByStatus.put(row[0].toString(), (Long) row[1]);
        }
        return bookingsByStatus;
    }

    private Map<String, Long> buildBookingsByStatusDeptScoped(Long departmentId) {
        Map<String, Long> bookingsByStatus = new HashMap<>();
        List<Object[]> results = bookingRepository.countByStatusGroupedByDepartmentId(departmentId);
        for (Object[] row : results) {
            bookingsByStatus.put(row[0].toString(), (Long) row[1]);
        }
        return bookingsByStatus;
    }
}
