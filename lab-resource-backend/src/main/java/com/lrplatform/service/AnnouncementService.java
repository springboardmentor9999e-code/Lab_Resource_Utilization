package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.AnnouncementRequest;
import com.lrplatform.dto.response.AnnouncementResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Announcement;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.AnnouncementRepository;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveAnnouncements(Long institutionId, Long departmentId) {
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now(), institutionId, departmentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getMyAnnouncements(Long userId) {
        return announcementRepository.findByCreatedByOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
        return toResponse(announcement);
    }

    @Auditable(module = "ANNOUNCEMENT", action = "CREATE", entityType = "Announcement")
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .announcementType(request.getAnnouncementType() != null ? request.getAnnouncementType() : "GENERAL")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "ALL")
                .createdBy(user)
                .published(request.getPublished() != null ? request.getPublished() : false)
                .expiresAt(request.getExpiresAt())
                .build();

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            announcement.setInstitution(institution);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            announcement.setDepartment(department);
        }

        if (announcement.getPublished()) {
            announcement.setPublishedAt(LocalDateTime.now());
        }

        announcementRepository.save(announcement);
        log.info("Announcement created: {} by user: {}", announcement.getTitle(), user.getEmail());
        return toResponse(announcement);
    }

    @Auditable(module = "ANNOUNCEMENT", action = "UPDATE", entityType = "Announcement")
    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request, Long userId) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));

        if (request.getTitle() != null) announcement.setTitle(request.getTitle());
        if (request.getContent() != null) announcement.setContent(request.getContent());
        if (request.getAnnouncementType() != null) announcement.setAnnouncementType(request.getAnnouncementType());
        if (request.getPriority() != null) announcement.setPriority(request.getPriority());
        if (request.getTargetAudience() != null) announcement.setTargetAudience(request.getTargetAudience());
        if (request.getExpiresAt() != null) announcement.setExpiresAt(request.getExpiresAt());

        if (request.getPublished() != null && request.getPublished() && !announcement.getPublished()) {
            announcement.setPublished(true);
            announcement.setPublishedAt(LocalDateTime.now());
        } else if (request.getPublished() != null) {
            announcement.setPublished(request.getPublished());
        }

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            announcement.setInstitution(institution);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            announcement.setDepartment(department);
        }

        announcementRepository.save(announcement);
        log.info("Announcement updated: {}", announcement.getTitle());
        return toResponse(announcement);
    }

    @Auditable(module = "ANNOUNCEMENT", action = "DELETE", entityType = "Announcement")
    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
        announcementRepository.delete(announcement);
        log.info("Announcement deleted: {}", announcement.getTitle());
    }

    @Auditable(module = "ANNOUNCEMENT", action = "PUBLISH", entityType = "Announcement")
    @Transactional
    public AnnouncementResponse publishAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
        
        announcement.setPublished(true);
        announcement.setPublishedAt(LocalDateTime.now());
        announcementRepository.save(announcement);
        log.info("Announcement published: {}", announcement.getTitle());
        return toResponse(announcement);
    }

    @Auditable(module = "ANNOUNCEMENT", action = "UNPUBLISH", entityType = "Announcement")
    @Transactional
    public AnnouncementResponse unpublishAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
        
        announcement.setPublished(false);
        announcementRepository.save(announcement);
        log.info("Announcement unpublished: {}", announcement.getTitle());
        return toResponse(announcement);
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .announcementType(announcement.getAnnouncementType())
                .priority(announcement.getPriority())
                .targetAudience(announcement.getTargetAudience())
                .institutionId(announcement.getInstitution() != null ? announcement.getInstitution().getId() : null)
                .institutionName(announcement.getInstitution() != null ? announcement.getInstitution().getInstitutionName() : null)
                .departmentId(announcement.getDepartment() != null ? announcement.getDepartment().getId() : null)
                .departmentName(announcement.getDepartment() != null ? announcement.getDepartment().getDepartmentName() : null)
                .createdBy(announcement.getCreatedBy() != null ? announcement.getCreatedBy().getId() : null)
                .createdByName(announcement.getCreatedBy() != null ? 
                    announcement.getCreatedBy().getFirstName() + " " + announcement.getCreatedBy().getLastName() : null)
                .published(announcement.getPublished())
                .publishedAt(announcement.getPublishedAt())
                .expiresAt(announcement.getExpiresAt())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }
}
