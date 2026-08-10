package com.example.backend.service.impl;

import com.example.backend.dto.DashboardDTO;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.LaboratoryRepository;
import com.example.backend.repository.MaintenanceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WaitingListRepository;
import com.example.backend.service.DashboardService;
import org.springframework.stereotype.Service;
import com.example.backend.dto.UtilizationHeatMapDTO;
import java.util.List;
import java.util.ArrayList;
@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final WaitingListRepository waitingListRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            LaboratoryRepository laboratoryRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository,
            WaitingListRepository waitingListRepository) {

        this.userRepository = userRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.waitingListRepository = waitingListRepository;
    }

    @Override
    public DashboardDTO getDashboardData() {

        DashboardDTO dashboard = new DashboardDTO();

        dashboard.setTotalUsers(userRepository.count());
        dashboard.setTotalLaboratories(laboratoryRepository.count());
        dashboard.setTotalResources(equipmentRepository.count());
        dashboard.setTotalBookings(bookingRepository.count());
        dashboard.setTotalMaintenance(maintenanceRepository.count());
        dashboard.setTotalWaitingList(waitingListRepository.count());

        return dashboard;
    }
    @Override
    public List<UtilizationHeatMapDTO> getHeatMapData() {

        List<Object[]> rows = bookingRepository.getHeatMapData();

        List<UtilizationHeatMapDTO> heatMapData = new ArrayList<>();

        for (Object[] row : rows) {

            String equipmentName = row[0].toString();

            long bookingCount = ((Number) row[1]).longValue();

            heatMapData.add(
                    new UtilizationHeatMapDTO(
                            equipmentName,
                            bookingCount
                    )
            );
        }

        return heatMapData;
    }
}