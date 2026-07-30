package com.labhub.service;

import com.labhub.entity.Waitlist;

import java.util.List;
import java.util.UUID;

public interface WaitlistService {
    Waitlist joinWaitlist(String userEmail, UUID equipmentId);
    List<Waitlist> getUserWaitlist(String userEmail);
    List<Waitlist> getEquipmentWaitlist(UUID equipmentId);
    void cancelWaitlist(UUID waitlistId, String userEmail);
    void notifyNextInWaitlist(UUID equipmentId);
}
