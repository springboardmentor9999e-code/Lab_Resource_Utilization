package com.lab.backend.service;

import com.lab.backend.dto.UtilizationRequest;
import com.lab.backend.dto.UtilizationResponse;

import java.util.List;
import java.util.Map;

public interface UtilizationService {
    UtilizationResponse startUtilization(UtilizationRequest request);
    UtilizationResponse endUtilization(Long id);
    List<UtilizationResponse> getAllUtilization();
    UtilizationResponse getUtilizationById(Long id);
    List<UtilizationResponse> getUtilizationByEquipment(Long equipmentId);
    List<UtilizationResponse> getUtilizationByDepartment(String department);
    Map<String, Object> getOverallUtilization();
    List<Map<String, Object>> getTopUsedEquipment();
}
