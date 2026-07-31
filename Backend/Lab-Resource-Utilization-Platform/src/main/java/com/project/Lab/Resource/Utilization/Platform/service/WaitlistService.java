package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.dto.WaitlistRequestDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.WaitlistResponseDTO;
import com.project.Lab.Resource.Utilization.Platform.entity.Waitlist;
import com.project.Lab.Resource.Utilization.Platform.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    @Autowired
    private WaitlistRepository waitlistRepository;

    public WaitlistResponseDTO joinWaitlist(WaitlistRequestDTO request) {

        if (waitlistRepository.existsByEquipmentIdAndUserId(
                request.getEquipmentId(),
                request.getUserId())) {

            throw new RuntimeException("User already exists in waitlist.");
        }

        Waitlist waitlist = new Waitlist();

        waitlist.setEquipmentId(request.getEquipmentId());
        waitlist.setUserId(request.getUserId());
        waitlist.setPriority(1);
        waitlist.setStatus("WAITING");
        waitlist.setCreatedAt(LocalDateTime.now());

        Waitlist saved = waitlistRepository.save(waitlist);

        return map(saved);
    }

    public List<WaitlistResponseDTO> getMyWaitlist(Integer userId) {

        return waitlistRepository.findByUserId(userId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public List<WaitlistResponseDTO> getEquipmentWaitlist(Integer equipmentId) {

        return waitlistRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    public void removeFromWaitlist(Integer waitlistId) {

        waitlistRepository.deleteById(waitlistId);

    }public WaitlistResponseDTO getNextUser(Integer equipmentId) {

        Waitlist waitlist = waitlistRepository
                .findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
                        equipmentId,
                        "WAITING")
                .orElse(null);

        if (waitlist == null) {
            return null;
        }

        waitlist.setStatus("NOTIFIED");
        waitlistRepository.save(waitlist);

        return map(waitlist);
    }

    private WaitlistResponseDTO map(Waitlist waitlist) {

        return new WaitlistResponseDTO(

                waitlist.getWaitlistId(),
                waitlist.getEquipmentId(),
                waitlist.getUserId(),
                waitlist.getPriority(),
                waitlist.getStatus(),
                waitlist.getCreatedAt()


        );

    }

}