package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.dto.EquipmentUtilizationDto;
import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.EquipmentUtilizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentUtilizationServiceImpl implements EquipmentUtilizationService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<EquipmentUtilizationDto> getUtilizationStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().getRoleName();
        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Equipment> filteredEquipment = new ArrayList<>();

        // Role-based filtering of equipment
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role) || "INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
            filteredEquipment = allEquipment;
        } else if ("DEPARTMENT_HEAD".equalsIgnoreCase(role) || "LAB_MANAGER".equalsIgnoreCase(role) || "LAB_TECHNICIAN".equalsIgnoreCase(role)) {
            filteredEquipment = allEquipment.stream()
                    .filter(eq -> eq.getLaboratory() != null 
                            && eq.getLaboratory().getDepartment() != null 
                            && eq.getLaboratory().getDepartment().getDepartmentId().equals(Long.valueOf(user.getDepartmentId())))
                    .collect(Collectors.toList());
        } else if ("STUDENT".equalsIgnoreCase(role) || "RESEARCHER".equalsIgnoreCase(role)) {
            // Students/Researchers only see equipment they have booked
            List<Booking> userBookings = bookingRepository.findByUserUserId(user.getUserId());
            List<Long> bookedEquipmentIds = userBookings.stream()
                    .filter(b -> b.getEquipment() != null)
                    .map(b -> b.getEquipment().getId())
                    .distinct()
                    .collect(Collectors.toList());

            filteredEquipment = allEquipment.stream()
                    .filter(eq -> bookedEquipmentIds.contains(eq.getId()))
                    .collect(Collectors.toList());
        }

        List<EquipmentUtilizationDto> statsList = new ArrayList<>();

        for (Equipment eq : filteredEquipment) {
            List<Booking> bookings = bookingRepository.findByEquipmentId(eq.getId());

            // Filter bookings that count as active/completed utilization
            List<Booking> utilizationBookings = bookings.stream()
                    .filter(b -> "Completed".equalsIgnoreCase(b.getStatus()) 
                            || "In Use".equalsIgnoreCase(b.getStatus()) 
                            || "Confirmed".equalsIgnoreCase(b.getStatus()) 
                            || "Approved".equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.toList());

            // For Student/Researcher, calculate statistics based ONLY on their own bookings
            if ("STUDENT".equalsIgnoreCase(role) || "RESEARCHER".equalsIgnoreCase(role)) {
                utilizationBookings = utilizationBookings.stream()
                        .filter(b -> b.getUser() != null && b.getUser().getUserId().equals(user.getUserId()))
                        .collect(Collectors.toList());
            }

            long usageCount = utilizationBookings.size();
            double totalHoursUsed = 0.0;

            for (Booking b : utilizationBookings) {
                if (b.getStartTime() != null && b.getEndTime() != null) {
                    double durationMinutes = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
                    totalHoursUsed += durationMinutes / 60.0;
                }
            }

            // Available Hours: 24h * days since purchase (default 30 days)
            LocalDate purchaseDate = eq.getPurchaseDate() != null ? eq.getPurchaseDate() : LocalDate.now().minusDays(30);
            long days = ChronoUnit.DAYS.between(purchaseDate, LocalDate.now());
            if (days <= 0) {
                days = 1;
            }
            double availableHours = days * 24.0;
            double utilizationPercentage = (totalHoursUsed / availableHours) * 100.0;
            if (utilizationPercentage > 100.0) {
                utilizationPercentage = 100.0;
            }

            // Round values for cleanliness
            totalHoursUsed = Math.round(totalHoursUsed * 100.0) / 100.0;
            utilizationPercentage = Math.round(utilizationPercentage * 100.0) / 100.0;
            double costPerHour = eq.getCostPerHour() != null ? eq.getCostPerHour() : 0.0;
            double totalCost = Math.round((totalHoursUsed * costPerHour) * 100.0) / 100.0;

            String labName = eq.getLaboratory() != null ? eq.getLaboratory().getLabName() : "N/A";
            String deptName = eq.getLaboratory() != null && eq.getLaboratory().getDepartment() != null 
                    ? eq.getLaboratory().getDepartment().getDepartmentName() : "N/A";
            String instName = eq.getLaboratory() != null && eq.getLaboratory().getDepartment() != null 
                    && eq.getLaboratory().getDepartment().getInstitution() != null 
                    ? eq.getLaboratory().getDepartment().getInstitution().getInstitutionName() : "N/A";

            statsList.add(new EquipmentUtilizationDto(
                    eq.getId(),
                    eq.getEquipmentName(),
                    eq.getCategory(),
                    eq.getSerialNumber(),
                    costPerHour,
                    usageCount,
                    totalHoursUsed,
                    utilizationPercentage,
                    totalCost,
                    labName,
                    deptName,
                    instName
            ));
        }

        return statsList;
    }
}
