package com.example.backend.service.impl;

import com.example.backend.entity.Maintenance;
import com.example.backend.entity.Notification;
import com.example.backend.entity.Equipment;
import com.example.backend.security.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.backend.repository.MaintenanceRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.EquipmentRepository;

import com.example.backend.service.MaintenanceService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {


    private final MaintenanceRepository repository;
    private final NotificationRepository notificationRepository;
    private final EquipmentRepository equipmentRepository;
    private final JwtUtil jwtUtil;


    public MaintenanceServiceImpl(
            MaintenanceRepository repository,
            NotificationRepository notificationRepository,
            EquipmentRepository equipmentRepository,
            JwtUtil jwtUtil) {

        this.repository = repository;
        this.notificationRepository = notificationRepository;
        this.equipmentRepository = equipmentRepository;
        this.jwtUtil = jwtUtil;
    }



    @Override
    public List<Maintenance> getAllMaintenance() {

        return repository.findAll();
    }



    @Override
    public Maintenance getMaintenanceById(Integer id) {

        return repository.findById(id).orElse(null);
    }



    @Override
    public Maintenance saveMaintenance(Maintenance maintenance) {


        // Save maintenance details
        Maintenance savedMaintenance = repository.save(maintenance);



        // Fetch equipment name using resourceId
        Equipment equipment = equipmentRepository
                .findById(maintenance.getResourceId())
                .orElse(null);



        String equipmentName;

        if (equipment != null) {
            equipmentName = equipment.getEquipmentName();
        } else {
            equipmentName = "Unknown Equipment";
        }



        // Create notification
        Notification notification = new Notification();


        // Temporary user id
        // Later replace with logged-in user's id
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        Integer userId = null;

        if(authentication != null) {

            String token = authentication
                    .getCredentials()
                    .toString();

            userId = jwtUtil.extractUserId(token);
        }


        notification.setUserId(userId);


        notification.setTitle("Maintenance Scheduled");


        notification.setMessage(
                "Maintenance has been scheduled for "
                        + equipmentName
        );


        notification.setType("MAINTENANCE");


        notification.setStatus("UNREAD");



        // Save notification
        notificationRepository.save(notification);



        return savedMaintenance;
    }




    @Override
    public Maintenance updateMaintenance(Integer id,
                                         Maintenance maintenance) {


        Maintenance existing =
                repository.findById(id).orElse(null);



        if (existing != null) {


            existing.setResourceId(
                    maintenance.getResourceId()
            );


            existing.setMaintenanceDate(
                    maintenance.getMaintenanceDate()
            );


            existing.setDescription(
                    maintenance.getDescription()
            );


            existing.setStatus(
                    maintenance.getStatus()
            );


            existing.setMaintenanceType(
                    maintenance.getMaintenanceType()
            );


            existing.setCost(
                    maintenance.getCost()
            );


            existing.setVendor(
                    maintenance.getVendor()
            );


            existing.setStartDate(
                    maintenance.getStartDate()
            );


            existing.setEndDate(
                    maintenance.getEndDate()
            );


            existing.setNextDueDate(
                    maintenance.getNextDueDate()
            );



            return repository.save(existing);

        }


        return null;
    }




    @Override
    public void deleteMaintenance(Integer id) {

        repository.deleteById(id);

    }

}