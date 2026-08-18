package com.lab.backend.service;

import com.lab.backend.dto.DashboardDTO;
import com.lab.backend.dto.DashboardResponse;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getDashboardStats();
    DashboardDTO getDashboard();
    DashboardResponse getDashboardResponse();
}