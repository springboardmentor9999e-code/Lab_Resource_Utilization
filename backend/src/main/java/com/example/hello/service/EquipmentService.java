package com.example.hello.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.entity.Equipment;
import com.example.hello.entity.Institution;
import com.example.hello.repository.BookingRepository;
import com.example.hello.repository.EquipmentRepository;
import com.example.hello.repository.InstitutionRepository;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository repository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private BookingRepository bookingRepository;


    // =========================================================
    // SYSTEM ADMIN
    // Get ALL equipment
    // =========================================================

    public List<Equipment> getAllEquipment() {

        List<Equipment> equipmentList =
                repository.findAll(
                        Sort.by(
                                Sort.Direction.ASC,
                                "equipmentId"
                        )
                );

        addInstitutionNames(equipmentList);

        return equipmentList;
    }


    // =========================================================
    // INSTITUTION ADMIN
    // Get equipment belonging to their institution
    // =========================================================

    public List<Equipment> getEquipmentByInstitution(
            Integer institutionId) {

        List<Equipment> equipmentList =
                repository.findByInstitutionId(
                        institutionId,
                        Sort.by(
                                Sort.Direction.ASC,
                                "equipmentId"
                        )
                );

        addInstitutionNames(equipmentList);

        return equipmentList;
    }


    // =========================================================
    // DEPARTMENT HEAD
    // Get equipment belonging to their department
    // =========================================================

    public List<Equipment> getEquipmentByDepartment(
            Integer departmentId) {

        List<Equipment> equipmentList =
                repository.findByDepartmentId(
                        departmentId,
                        Sort.by(
                                Sort.Direction.ASC,
                                "equipmentId"
                        )
                );

        addInstitutionNames(equipmentList);

        return equipmentList;
    }


    // =========================================================
    // Add institution names
    // =========================================================

    private void addInstitutionNames(
            List<Equipment> equipmentList) {

        for (Equipment equipment : equipmentList) {

            if (equipment.getInstitutionId() != null) {

                Institution institution =
                        institutionRepository.findById(
                                equipment.getInstitutionId()
                        ).orElse(null);

                if (institution != null) {

                    equipment.setInstitutionName(
                            institution.getInstitutionName()
                    );
                }
            }
        }
    }


    // =========================================================
    // SAVE EQUIPMENT
    // =========================================================

    public Equipment saveEquipment(
            Equipment equipment) {

        return repository.save(equipment);
    }


    // =========================================================
    // DELETE EQUIPMENT
    // =========================================================

    @Transactional
    public void deleteEquipment(Integer id) {

        // -----------------------------------------------------
        // Check whether equipment has existing bookings
        // -----------------------------------------------------

        if (bookingRepository.existsByEquipmentId(id)) {

            throw new RuntimeException(
                    "Equipment cannot be deleted because it has existing bookings."
            );
        }

        // -----------------------------------------------------
        // Delete equipment
        // -----------------------------------------------------

        repository.deleteById(id);
    }
}