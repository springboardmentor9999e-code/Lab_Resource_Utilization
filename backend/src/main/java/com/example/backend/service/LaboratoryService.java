package com.example.backend.service;

import com.example.backend.entity.Laboratory;
import java.util.List;

public interface LaboratoryService {

    Laboratory saveLaboratory(Laboratory laboratory);

    List<Laboratory> getAllLaboratories();

    Laboratory getLaboratoryById(Integer id);

    void deleteLaboratory(Integer id);
}