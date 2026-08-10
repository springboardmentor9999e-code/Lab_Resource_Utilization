package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "sharing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "requester_id", nullable = false)
    private Long requesterId;

    @Column(name = "requester_institution_id", nullable = false)
    private Integer requesterInstitutionId;

    @Column(name = "owner_institution_id", nullable = false)
    private Integer ownerInstitutionId;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}