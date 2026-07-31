package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.WaitlistRequestDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.WaitlistResponseDTO;
import com.project.Lab.Resource.Utilization.Platform.service.WaitlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin("*")
public class WaitlistController {

    @Autowired
    private WaitlistService waitlistService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','RESEARCHER')")
    public WaitlistResponseDTO joinWaitlist(
            @RequestBody WaitlistRequestDTO request) {

        return waitlistService.joinWaitlist(request);

    }

    @GetMapping("/my/{userId}")
    @PreAuthorize("isAuthenticated()")
    public List<WaitlistResponseDTO> getMyWaitlist(
            @PathVariable Integer userId) {

        return waitlistService.getMyWaitlist(userId);

    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public List<WaitlistResponseDTO> getEquipmentWaitlist(
            @PathVariable Integer equipmentId) {

        return waitlistService.getEquipmentWaitlist(equipmentId);

    }

    @DeleteMapping("/{waitlistId}")
    @PreAuthorize("isAuthenticated()")
    public String removeFromWaitlist(
            @PathVariable Integer waitlistId) {

        waitlistService.removeFromWaitlist(waitlistId);

        return "Removed Successfully";

    }

}