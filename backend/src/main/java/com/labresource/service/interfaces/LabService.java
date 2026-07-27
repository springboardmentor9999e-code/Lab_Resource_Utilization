package com.labresource.service.interfaces;

import com.labresource.dto.request.LabRequest;
import com.labresource.dto.response.LabResponse;

import java.util.List;

public interface LabService {
    
    LabResponse createLab(LabRequest request);
    
    List<LabResponse> getAllLabs();
    
    LabResponse getLabById(Long id);
    
    LabResponse updateLab(Long id, LabRequest request);
    
    void deleteLab(Long id);
}
