package com.labresource.platform.service;

import com.labresource.platform.dto.CreateLabRequest;
import com.labresource.platform.dto.LabResponse;
import com.labresource.platform.dto.UpdateLabRequest;
import java.util.List;

public interface LabService {

    LabResponse createLab(CreateLabRequest request);

    List<LabResponse> getAllLabs();

    LabResponse getLabById(Long id);

    LabResponse updateLab(Long id, UpdateLabRequest request);

    void deleteLab(Long id);
}
