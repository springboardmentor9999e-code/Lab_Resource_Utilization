package com.lab.backend.service;

import com.lab.backend.dto.ReportDTO;
import com.lab.backend.repository.BookingRepository;
import com.lab.backend.repository.CalibrationRepository;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.LaboratoryRepository;
import com.lab.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final CalibrationRepository calibrationRepository;
    private final MaintenanceRepository maintenanceRepository;

    public ReportService(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            LaboratoryRepository laboratoryRepository,
            CalibrationRepository calibrationRepository,
            MaintenanceRepository maintenanceRepository) {

        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.calibrationRepository = calibrationRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public ReportDTO getDashboardReport() {

        ReportDTO report = new ReportDTO();

        report.setTotalLaboratories(laboratoryRepository.count());
        report.setTotalEquipment(equipmentRepository.count());
        report.setTotalBookings(bookingRepository.count());
        report.setTotalCalibrations(calibrationRepository.count());
        report.setTotalMaintenances(maintenanceRepository.count());

        return report;
    }
}