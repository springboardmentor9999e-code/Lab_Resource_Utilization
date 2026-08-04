package com.labresource.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MaintenanceRequest {

    private Long equipmentId;

    private Long reportedById;

    private String issueDescription;

    private String status;

    private LocalDate reportedDate;

}