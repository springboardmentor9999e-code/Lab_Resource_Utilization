package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.Notification;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.NotificationRepository;
import com.labplatform.labresourceplatform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    // Don't re-notify the same person about the same equipment/alert-type
    // combination more than once within this window, even if the scheduled job
    // runs multiple times while the underlying condition persists (e.g. an
    // idle piece of equipment stays idle for weeks - one alert per day is
    // enough, not one per job run).
    private static final int DEDUPE_WINDOW_HOURS = 24;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                EquipmentRepository equipmentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByRecipient_UserIdOrderByCreatedAtDesc(user.getUserId());
    }

    public List<Notification> getUnreadForUser(User user) {
        return notificationRepository.findByRecipient_UserIdAndIsReadFalseOrderByCreatedAtDesc(user.getUserId());
    }

    public Notification markRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        if (!notification.getRecipient().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You can only mark your own notifications as read.");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllRead(User currentUser) {
        List<Notification> unread = getUnreadForUser(currentUser);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    // Creates a notification for every user in roles that should hear about
    // equipment-level alerts (staff who can act on it: technicians, lab
    // managers, department heads, and both admin tiers) within the equipment's
    // own institution - a STUDENT/RESEARCHER has no action to take on "this
    // equipment is idle" or "maintenance is due", so they're deliberately
    // excluded from the recipient list.
    //
    // Deduplicates per (recipient, type, equipment) within DEDUPE_WINDOW_HOURS
    // so a daily job run doesn't spam the same alert repeatedly while the
    // underlying condition persists.
    //
    // Takes an equipmentId, not an Equipment object, and re-fetches it fresh
    // here rather than trusting whatever the caller passes in. This is the
    // actual fix for the startup LazyInitializationException: AlertGenerationJob
    // calls equipmentRepository.findById(...) in ITS OWN short-lived
    // transaction (each Spring Data repository method is transactional on its
    // own), which closes and detaches the entity before this method is even
    // called. A lazy proxy is bound to the specific session that created it -
    // wrapping THIS method in @Transactional does NOT retroactively reattach
    // an already-detached object from a different, already-closed session; it
    // only helps a fresh load performed inside this same transaction. So
    // instead of receiving a possibly-detached Equipment and hoping its lazy
    // fields resolve, this re-fetches by id inside its own @Transactional
    // boundary - guaranteeing equipment.getLab().getInstitution() and every
    // recipient.getInstitution() below are loaded in a session that's still
    // open when they're accessed, whether this is called from a web request,
    // the daily @Scheduled job, or the startup CommandLineRunner.
    @Transactional
    public void notifyEquipmentStaff(Long equipmentId, String type, String message) {
        Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
        if (equipment == null || equipment.getLab() == null || equipment.getLab().getInstitution() == null) {
            return;
        }
        Long institutionId = equipment.getLab().getInstitution().getInstitutionId();

        List<Role> notifiableRoles = List.of(
                Role.LAB_TECHNICIAN, Role.LAB_MANAGER, Role.DEPARTMENT_HEAD,
                Role.INSTITUTION_ADMINISTRATOR, Role.SYSTEM_ADMINISTRATOR
        );

        for (Role role : notifiableRoles) {
            for (User recipient : userRepository.findByRole(role)) {
                boolean sameInstitution = role == Role.SYSTEM_ADMINISTRATOR
                        || (recipient.getInstitution() != null
                            && institutionId.equals(recipient.getInstitution().getInstitutionId()));
                if (!sameInstitution) {
                    continue;
                }
                createIfNotDuplicate(recipient, equipment, type, message);
            }
        }
    }

    private void createIfNotDuplicate(User recipient, Equipment equipment, String type, String message) {
        var recent = notificationRepository
                .findFirstByRecipient_UserIdAndTypeAndEquipment_EquipmentIdOrderByCreatedAtDesc(
                        recipient.getUserId(), type, equipment.getEquipmentId());

        if (recent.isPresent()
                && recent.get().getCreatedAt().isAfter(LocalDateTime.now().minusHours(DEDUPE_WINDOW_HOURS))) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setEquipment(equipment);
        notificationRepository.save(notification);
    }
}
