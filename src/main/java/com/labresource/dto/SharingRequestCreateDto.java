package com.labresource.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharingRequestCreateDto {
    private Long equipmentId;
    private Long requestingInstitutionId;
    private String reason;
}
