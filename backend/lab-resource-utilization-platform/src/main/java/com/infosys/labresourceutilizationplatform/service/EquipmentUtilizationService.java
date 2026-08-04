package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.dto.EquipmentUtilizationDto;
import java.util.List;

public interface EquipmentUtilizationService {
    List<EquipmentUtilizationDto> getUtilizationStats(String email);
}
