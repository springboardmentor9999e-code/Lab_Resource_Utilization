package com.example.labresourceplatform.service;

import com.example.labresourceplatform.dto.DashboardResponse;
import com.example.labresourceplatform.repository.BookingRepository;
import com.example.labresourceplatform.repository.DepartmentRepository;
import com.example.labresourceplatform.repository.EquipmentRepository;
import com.example.labresourceplatform.repository.InstitutionRepository;
import com.example.labresourceplatform.repository.LaboratoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public DashboardResponse getDashboardData() {

        DashboardResponse response = new DashboardResponse();

        response.setTotalInstitutions(institutionRepository.count());
        response.setTotalDepartments(departmentRepository.count());
        response.setTotalLaboratories(laboratoryRepository.count());
        response.setTotalEquipment(equipmentRepository.count());
        response.setTotalBookings(bookingRepository.count());

        return response;
    }
}