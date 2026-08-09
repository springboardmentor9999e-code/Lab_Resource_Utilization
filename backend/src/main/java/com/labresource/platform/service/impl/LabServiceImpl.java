package com.labresource.platform.service.impl;

import com.labresource.platform.dto.CreateLabRequest;
import com.labresource.platform.dto.LabResponse;
import com.labresource.platform.dto.UpdateLabRequest;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.exception.DuplicateLabException;
import com.labresource.platform.exception.LabNotFoundException;
import com.labresource.platform.repository.LabRepository;
import com.labresource.platform.service.LabService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LabServiceImpl implements LabService {

    private final LabRepository labRepository;

    public LabServiceImpl(LabRepository labRepository) {
        this.labRepository = labRepository;
    }

    @Override
    @Transactional
    public LabResponse createLab(CreateLabRequest request) {
        String name = normalize(request.name());

        if (labRepository.existsByName(name)) {
            throw new DuplicateLabException("A lab with this name already exists");
        }

        Lab lab = Lab.builder()
                .name(name)
                .building(normalize(request.building()))
                .roomNumber(normalize(request.roomNumber()))
                .capacity(request.capacity())
                .description(normalizeOptional(request.description()))
                .active(request.active())
                .build();

        return LabResponse.from(labRepository.saveAndFlush(lab));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabResponse> getAllLabs() {
        return labRepository.findByActiveTrue()
                .stream()
                .map(LabResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LabResponse getLabById(Long id) {
        return LabResponse.from(findLabById(id));
    }

    @Override
    @Transactional
    public LabResponse updateLab(Long id, UpdateLabRequest request) {
        Lab lab = findLabById(id);
        String name = normalize(request.name());

        if (!lab.getName().equals(name) && labRepository.existsByName(name)) {
            throw new DuplicateLabException("A lab with this name already exists");
        }

        lab.setName(name);
        lab.setBuilding(normalize(request.building()));
        lab.setRoomNumber(normalize(request.roomNumber()));
        lab.setCapacity(request.capacity());
        lab.setDescription(normalizeOptional(request.description()));
        lab.setActive(request.active());

        return LabResponse.from(labRepository.saveAndFlush(lab));
    }

    @Override
    @Transactional
    public void deleteLab(Long id) {
        Lab lab = findLabById(id);
        labRepository.delete(lab);
    }

    private Lab findLabById(Long id) {
        return labRepository.findById(id)
                .orElseThrow(() -> new LabNotFoundException("Lab with id " + id + " was not found"));
    }

    private String normalize(String value) {
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
