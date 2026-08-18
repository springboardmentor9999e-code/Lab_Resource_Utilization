package com.lab.backend.service;

import com.lab.backend.dto.ResourceShareRequestDTO;
import com.lab.backend.entity.Equipment;
import com.lab.backend.entity.Laboratory;
import com.lab.backend.entity.ResourceShare;
import com.lab.backend.entity.User;
import com.lab.backend.enums.ResourceShareStatus;
import com.lab.backend.exception.CustomExceptions;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.LaboratoryRepository;
import com.lab.backend.repository.ResourceShareRepository;
import com.lab.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResourceShareService {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final ResourceShareRepository resourceShareRepository;

    public ResourceShareService(ResourceShareRepository resourceShareRepository,
                                UserRepository userRepository,
                                EquipmentRepository equipmentRepository,
                                LaboratoryRepository laboratoryRepository) {
        this.resourceShareRepository = resourceShareRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.laboratoryRepository = laboratoryRepository;
    }

    public ResourceShare createRequest(ResourceShareRequestDTO dto) {
        User user = userRepository.findById(dto.getRequestedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Equipment equipment = equipmentRepository.findById(dto.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        Laboratory source = laboratoryRepository.findById(dto.getSourceLaboratoryId())
                .orElseThrow(() -> new RuntimeException("Source laboratory not found"));

        Laboratory target = laboratoryRepository.findById(dto.getTargetLaboratoryId())
                .orElseThrow(() -> new RuntimeException("Target laboratory not found"));

        ResourceShare resourceShare = new ResourceShare();

        resourceShare.setRequestedBy(user);
        resourceShare.setEquipment(equipment);
        resourceShare.setSourceLaboratory(source);
        resourceShare.setTargetLaboratory(target);

        resourceShare.setStartDate(dto.getStartDate());
        resourceShare.setEndDate(dto.getEndDate());
        resourceShare.setPurpose(dto.getPurpose());

        resourceShare.setStatus(ResourceShareStatus.PENDING);

        return resourceShareRepository.save(resourceShare);
    }

    public List<ResourceShare> getAllRequests() {
        return resourceShareRepository.findAll();
    }

    public ResourceShare getRequestById(Long id) {
        return resourceShareRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                        "Resource sharing request not found with ID: " + id));
    }

    public ResourceShare approveRequest(Long id) {
        ResourceShare resourceShare = getRequestById(id);

        if (resourceShare.getStatus() != ResourceShareStatus.PENDING) {
            throw new CustomExceptions.BadRequestException("Only PENDING requests can be approved");
        }

        resourceShare.setStatus(ResourceShareStatus.APPROVED);
        return resourceShareRepository.save(resourceShare);
    }

    public ResourceShare rejectRequest(Long id) {
        ResourceShare resourceShare = getRequestById(id);

        if (resourceShare.getStatus() != ResourceShareStatus.PENDING
                && resourceShare.getStatus() != ResourceShareStatus.APPROVED) {
            throw new CustomExceptions.BadRequestException(
                    "Request cannot be rejected in current status: " + resourceShare.getStatus());
        }

        resourceShare.setStatus(ResourceShareStatus.REJECTED);
        return resourceShareRepository.save(resourceShare);
    }

    public ResourceShare completeRequest(Long id) {
        ResourceShare resourceShare = getRequestById(id);

        if (resourceShare.getStatus() != ResourceShareStatus.APPROVED) {
            throw new CustomExceptions.BadRequestException("Only APPROVED requests can be completed");
        }

        resourceShare.setStatus(ResourceShareStatus.COMPLETED);
        return resourceShareRepository.save(resourceShare);
    }
}
