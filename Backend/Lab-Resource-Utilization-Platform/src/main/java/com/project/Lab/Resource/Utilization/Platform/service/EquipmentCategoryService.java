package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.entity.EquipmentCategory;
import com.project.Lab.Resource.Utilization.Platform.repository.EquipmentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentCategoryService {

    @Autowired
    private EquipmentCategoryRepository equipmentCategoryRepository;

    public List<EquipmentCategory> getAllCategories() {
        return equipmentCategoryRepository.findAll();
    }
}