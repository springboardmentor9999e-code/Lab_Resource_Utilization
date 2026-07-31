package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.EquipmentCategory;
import com.project.Lab.Resource.Utilization.Platform.service.EquipmentCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-categories")
@CrossOrigin(origins = "*")
public class EquipmentCategoryController {

    @Autowired
    private EquipmentCategoryService equipmentCategoryService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<EquipmentCategory> getAllCategories() {
        return equipmentCategoryService.getAllCategories();
    }
}