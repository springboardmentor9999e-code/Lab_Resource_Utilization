package com.labhub.service.impl;

import com.labhub.entity.Equipment;
import com.labhub.entity.User;
import com.labhub.entity.Waitlist;
import com.labhub.enums.NotificationType;
import com.labhub.enums.WaitlistStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.EquipmentRepository;
import com.labhub.repository.UserRepository;
import com.labhub.repository.WaitlistRepository;
import com.labhub.service.NotificationService;
import com.labhub.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistServiceImpl implements WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Waitlist joinWaitlist(String userEmail, UUID equipmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        Optional<Waitlist> existing = waitlistRepository.findByUserIdAndEquipmentIdAndStatus(user.getId(), equipmentId, WaitlistStatus.WAITING);
        if (existing.isPresent()) {
            return existing.get();
        }

        int count = waitlistRepository.countWaitingByEquipmentId(equipmentId);

        Waitlist waitlist = Waitlist.builder()
                .user(user)
                .equipment(equipment)
                .position(count + 1)
                .status(WaitlistStatus.WAITING)
                .isActive(true)
                .build();

        waitlist = waitlistRepository.save(waitlist);

        notificationService.createNotification(
                user,
                "Joined Waitlist",
                "You have joined the waitlist for " + equipment.getName() + " at position #" + waitlist.getPosition(),
                NotificationType.WAITLIST_UPDATE,
                "/equipment/" + equipmentId
        );

        return waitlist;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Waitlist> getUserWaitlist(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return waitlistRepository.findByUserIdAndStatus(user.getId(), WaitlistStatus.WAITING);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Waitlist> getEquipmentWaitlist(UUID equipmentId) {
        return waitlistRepository.findByEquipmentIdAndStatusOrderByPositionAsc(equipmentId, WaitlistStatus.WAITING);
    }

    @Override
    @Transactional
    public void cancelWaitlist(UUID waitlistId, String userEmail) {
        Waitlist waitlist = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist", "id", waitlistId));
        waitlist.setStatus(WaitlistStatus.CANCELLED);
        waitlistRepository.save(waitlist);
    }

    @Override
    @Transactional
    public void notifyNextInWaitlist(UUID equipmentId) {
        List<Waitlist> queue = waitlistRepository.findByEquipmentIdAndStatusOrderByPositionAsc(equipmentId, WaitlistStatus.WAITING);
        if (!queue.isEmpty()) {
            Waitlist next = queue.get(0);
            next.setStatus(WaitlistStatus.NOTIFIED);
            next.setNotifiedAt(LocalDateTime.now());
            waitlistRepository.save(next);

            notificationService.createNotification(
                    next.getUser(),
                    "Equipment Available!",
                    "The equipment " + next.getEquipment().getName() + " is now available for booking!",
                    NotificationType.WAITLIST_UPDATE,
                    "/equipment/" + equipmentId
            );
        }
    }
}
