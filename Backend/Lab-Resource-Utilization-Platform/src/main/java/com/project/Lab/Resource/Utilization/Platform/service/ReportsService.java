package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.ReportDTO;
import com.project.Lab.Resource.Utilization.Platform.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportsService {
    @Autowired
    private BookingRepository bookingRepository;
    public List<ReportDTO> getReports() {

        List<ReportDTO> reports = new ArrayList<>();

        reports.add(new ReportDTO(
                1L,
                "Equipment Utilization Report",
                "CSV",
                LocalDateTime.now(),
                2048L
        ));

        reports.add(new ReportDTO(
                2L,
                "Booking Summary Report",
                "CSV",
                LocalDateTime.now(),
                4096L
        ));

        return reports;
    }
    public String exportCsv(String type) {

        StringBuilder csv = new StringBuilder();

        csv.append("Booking ID,Equipment ID,User ID,Status\n");

        bookingRepository.findAll().forEach(booking -> {

            csv.append(booking.getBookingId()).append(",");

            csv.append(booking.getEquipmentId()).append(",");

            csv.append(booking.getUserId()).append(",");

            csv.append(booking.getStatus()).append("\n");

        });

        return csv.toString();
    }
}