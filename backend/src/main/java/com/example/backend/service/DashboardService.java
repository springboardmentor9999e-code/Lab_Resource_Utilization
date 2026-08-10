package com.example.backend.service;

import com.example.backend.dto.DashboardDTO;
import java.util.List;
import com.example.backend.dto.UtilizationHeatMapDTO;

public interface DashboardService {

    DashboardDTO getDashboardData();
    List<UtilizationHeatMapDTO> getHeatMapData();
}