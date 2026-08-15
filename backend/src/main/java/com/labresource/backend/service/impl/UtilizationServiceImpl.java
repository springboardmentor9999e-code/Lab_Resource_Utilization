package com.labresource.backend.service.impl;

import com.labresource.backend.dto.EquipmentUtilizationResponse;
import com.labresource.backend.dto.UtilizationResponse;
import com.labresource.backend.entity.Equipment;
import com.labresource.backend.repository.EquipmentRepository;
import com.labresource.backend.service.UtilizationService;
import com.labresource.backend.entity.Booking;
import com.labresource.backend.service.BookingService;
import com.labresource.backend.repository.InstitutionRepository;
import com.labresource.backend.dto.InstitutionUtilizationResponse;
import com.labresource.backend.entity.Institution;
import java.util.Comparator;
import com.labresource.backend.dto.UtilizationTrendResponse;
import com.labresource.backend.dto.UtilizationHeatmapResponse;
import java.time.LocalDate;
import com.labresource.backend.dto.DepartmentUtilizationResponse;
import java.util.HashMap;
import java.util.Map;
import com.labresource.backend.dto.PeakUsageResponse;
import java.util.List;
import java.util.ArrayList;
import com.labresource.backend.dto.IdleEquipmentResponse;
import java.time.temporal.ChronoUnit;
import com.labresource.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;

@Service
public class UtilizationServiceImpl implements UtilizationService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final InstitutionRepository institutionRepository;

   public UtilizationServiceImpl(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            BookingService bookingService,
            InstitutionRepository institutionRepository
    ) {
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.institutionRepository = institutionRepository;
    }

    @Override
public UtilizationResponse getUtilizationSummary() {

    long totalEquipment = equipmentRepository.count();
    long maintenanceEquipment =
            equipmentRepository.countByStatusIgnoreCase("Maintenance");

    long equipmentInUse =
            bookingRepository.findByStatus("APPROVED").stream()
                    .map(booking -> booking.getEquipment().getEquipmentId())
                    .distinct()
                    .count();


    long availableEquipment =
                totalEquipment
                - equipmentInUse
                - maintenanceEquipment;

        if (availableEquipment < 0) {
            availableEquipment = 0;
        }
    
    long idleEquipment =
            totalEquipment - equipmentInUse - maintenanceEquipment;

    if (idleEquipment < 0) {
        idleEquipment = 0;
    }

    List<EquipmentUtilizationResponse> equipmentList =
            getEquipmentUtilization();

    double averageUtilization = 0;

    if (!equipmentList.isEmpty()) {

            averageUtilization =
                equipmentList.stream()
                        .mapToDouble(EquipmentUtilizationResponse::getUtilizationPercentage)
                        .average()
                        .orElse(0);

        averageUtilization =
                Math.round(averageUtilization * 100.0) / 100.0;
    }

    return new UtilizationResponse(
            totalEquipment,
            equipmentInUse,
            availableEquipment,
            maintenanceEquipment,
            idleEquipment,
            averageUtilization
    );
}

    @Override
    public List<EquipmentUtilizationResponse> getEquipmentUtilization() {

        List<Equipment> equipmentList = equipmentRepository.findAll();

        List<EquipmentUtilizationResponse> response = new ArrayList<>();

        for (Equipment equipment : equipmentList) {

            EquipmentUtilizationResponse dto =
                    new EquipmentUtilizationResponse();

            dto.setEquipmentId(equipment.getEquipmentId());

            dto.setEquipmentName(equipment.getEquipmentName());

            dto.setStatus(equipment.getStatus());

            dto.setQuantity(equipment.getQuantity());
            if (equipment.getLaboratory() != null) {

    dto.setLaboratoryName(
            equipment.getLaboratory().getLabName()
    );

    if (equipment.getLaboratory().getInstitution() != null) {

        dto.setDepartmentName(
                equipment.getLaboratory()
                        .getInstitution()
                        .getInstitutionName()
        );

    } else {

        dto.setDepartmentName("-");

    }

} else {

    dto.setLaboratoryName("-");
    dto.setDepartmentName("-");

}

            List<Booking> bookings =
            bookingRepository.findByEquipmentEquipmentId(
                    equipment.getEquipmentId()
            );

            List<Booking> completedBookings =
                    bookingRepository.findByEquipmentEquipmentIdAndStatus(
                            equipment.getEquipmentId(),
                            "COMPLETED"
                    );

            long totalBookedHours = 0;

            for (Booking booking : completedBookings) {

                if (booking.getStartTime() != null &&
                    booking.getEndTime() != null) {

                    totalBookedHours += bookingService.getBookingHours(booking);

                }

            }

            // Assume lab works 8 hours per day
            long availableHours = equipment.getQuantity() * 8;

            double utilization = 0;

            if (availableHours > 0) {

                utilization =
                        (totalBookedHours * 100.0) / availableHours;

                if (utilization > 100) {
                    utilization = 100;
                }

            }

            dto.setUtilizationPercentage(
                    Math.round(utilization * 100.0) / 100.0
            );

            if (!bookings.isEmpty()) {

                Booking latestBooking = bookings.stream()
                        .max(Comparator.comparing(Booking::getBookingDate))
                        .orElse(null);

                if (latestBooking != null) {

                    dto.setLastUsed(
                            latestBooking.getBookingDate().toString()
                    );

                } else {

                    dto.setLastUsed("N/A");

                }

            } else {

                dto.setLastUsed("Never");

            }

            if (!bookings.isEmpty()) {

            Booking latestBooking = bookings.stream()
                    .max(Comparator.comparing(Booking::getBookingDate))
                    .orElse(null);

            if (latestBooking != null) {

                dto.setLastUsed(
                        latestBooking.getBookingDate().toString()
                );

                long idleDays =
                Math.max(
                        0,
                        LocalDate.now().toEpochDay()
                        - latestBooking.getBookingDate().toEpochDay()
                );
                dto.setIdleTime(idleDays + " day(s)");

            } else {

                dto.setLastUsed("N/A");
                dto.setIdleTime("N/A");

            }

        } else {

            dto.setLastUsed("Never");
            dto.setIdleTime("Never Used");

        }

            response.add(dto);

        }

        return response;

        
    }

    @Override
    public List<InstitutionUtilizationResponse> getInstitutionUtilization() {

        List<Institution> institutions = institutionRepository.findAll();

        List<InstitutionUtilizationResponse> response = new ArrayList<>();

        for (Institution institution : institutions) {

            List<Equipment> equipmentList =
                    equipmentRepository.findByLaboratoryInstitutionInstitutionId(
                            institution.getInstitutionId()
                    );

            long totalEquipment = equipmentList.size();

            double totalUtilization = 0;

            for (Equipment equipment : equipmentList) {

                List<Booking> completedBookings =
                        bookingRepository.findByEquipmentEquipmentIdAndStatus(
                                equipment.getEquipmentId(),
                                "COMPLETED"
                        );

                long bookedHours = 0;

                for (Booking booking : completedBookings) {

                    bookedHours += bookingService.getBookingHours(booking);

                }

                long availableHours = equipment.getQuantity() * 8;

                if (availableHours > 0) {

                    totalUtilization +=
                            (bookedHours * 100.0) / availableHours;

                }

            }

            double averageUtilization = 0;

            if (totalEquipment > 0) {

                averageUtilization =
                        totalUtilization / totalEquipment;

            }

            response.add(
                    new InstitutionUtilizationResponse(
                            institution.getInstitutionId(),
                            institution.getInstitutionName(),
                            totalEquipment,
                            Math.round(averageUtilization * 100.0) / 100.0
                    )
            );

        }

        return response;
    }

    @Override
    public List<DepartmentUtilizationResponse> getDepartmentUtilization() {

        Map<String, DepartmentUtilizationResponse> departmentMap =
                new HashMap<>();

        List<Equipment> equipmentList = equipmentRepository.findAll();

        for (Equipment equipment : equipmentList) {

            String department = equipment
                    .getLaboratory()
                    .getLabName();

            DepartmentUtilizationResponse dto =
                    departmentMap.getOrDefault(
                            department,
                            new DepartmentUtilizationResponse(
                                    department,
                                    0L,
                                    0L,
                                    0.0
                            )
                    );

            dto.setTotalEquipment(dto.getTotalEquipment() + 1);

            List<Booking> completedBookings =
                    bookingRepository.findByEquipmentEquipmentIdAndStatus(
                            equipment.getEquipmentId(),
                            "COMPLETED"
                    );

            if (!completedBookings.isEmpty()) {

                dto.setEquipmentInUse(
                        dto.getEquipmentInUse() + 1
                );

            }

            departmentMap.put(department, dto);

        }

        for (DepartmentUtilizationResponse dto : departmentMap.values()) {

            if (dto.getTotalEquipment() > 0) {

                dto.setUtilizationPercentage(

                        Math.round(

                                (dto.getEquipmentInUse() * 100.0
                                        / dto.getTotalEquipment())

                                        * 100

                        ) / 100.0

                );

            }

        }

        return new ArrayList<>(departmentMap.values());

    }

    @Override
    public List<PeakUsageResponse> getPeakUsageData() {

        List<Object[]> data =
                bookingRepository.getPeakUsageData();

        List<PeakUsageResponse> response =
                new ArrayList<>();

        for (Object[] row : data) {

            Integer hour = (Integer) row[0];

            Long bookingCount =
                    ((Number) row[1]).longValue();

            response.add(

                    new PeakUsageResponse(

                            String.format("%02d:00", hour),

                            bookingCount

                    )

            );

        }

        return response;

    }

    @Override
    public List<UtilizationTrendResponse> getUtilizationTrend() {

        List<UtilizationTrendResponse> trend = new ArrayList<>();

        String[] days = {
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
        };

        for (String day : days) {

            double utilization =
                    30 + (Math.random() * 70);

            trend.add(

                    new UtilizationTrendResponse(

                            day,

                            Math.round(utilization * 100) / 100.0

                    )

            );

        }

        return trend;

    }

    @Override
    public List<IdleEquipmentResponse> getIdleEquipment() {

        List<IdleEquipmentResponse> response = new ArrayList<>();

        List<Equipment> equipmentList = equipmentRepository.findAll();

        for (Equipment equipment : equipmentList) {

            IdleEquipmentResponse dto = new IdleEquipmentResponse();

            dto.setEquipmentId(equipment.getEquipmentId());

            dto.setEquipmentName(equipment.getEquipmentName());

            dto.setLaboratoryName(
                    equipment.getLaboratory().getLabName()
            );

            dto.setInstitutionName(
                    equipment.getLaboratory()
                            .getInstitution()
                            .getInstitutionName()
            );

            List<Booking> bookings =
                    bookingRepository.findByEquipmentEquipmentId(
                            equipment.getEquipmentId()
                    );

            if (bookings.isEmpty()) {

                dto.setLastUsed("Never");

                dto.setIdleDays(null);

                dto.setAlert("Never Used");

            } else {

                Booking latestBooking =
                        bookings.stream()
                                .max(Comparator.comparing(Booking::getBookingDate))
                                .orElse(null);

                if (latestBooking != null) {

                    dto.setLastUsed(
                            latestBooking.getBookingDate().toString()
                    );

                    long idleDays = Math.max(
        0,
        ChronoUnit.DAYS.between(
                latestBooking.getBookingDate(),
                LocalDate.now()
        )
);

                    dto.setIdleDays(idleDays);

                    if (idleDays >= 30) {

                        dto.setAlert("Idle");

                    } else {

                        dto.setAlert("Active");

                    }

                }

            }

            response.add(dto);

        }

        return response;

    }

    @Override
    public List<UtilizationHeatmapResponse> getUtilizationHeatmap() {

        List<UtilizationHeatmapResponse> response = new ArrayList<>();

        String[] days = {
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
        };

        List<Equipment> equipmentList = equipmentRepository.findAll();

        for (Equipment equipment : equipmentList) {

            String labName = equipment.getLaboratory().getLabName();

            for (String day : days) {

                double utilization = Math.random() * 100;

                response.add(

                        new UtilizationHeatmapResponse(

                                labName,

                                day,

                                Math.round(utilization * 100) / 100.0

                        )

                );

            }

        }

        return response;

    }
}