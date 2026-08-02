package com.example.hello.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hello.entity.Equipment;
import com.example.hello.repository.EquipmentRepository;
import org.springframework.data.domain.Sort;
@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository repository;

    public List<Equipment> getAllEquipment() {
        return repository.findAll(Sort.by("equipmentId"));
    }

    public Equipment saveEquipment(Equipment equipment) {
        return repository.save(equipment);
    }

    public void deleteEquipment(Integer id) {
        repository.deleteById(id);
    }
}