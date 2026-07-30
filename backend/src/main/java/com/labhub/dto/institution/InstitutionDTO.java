package com.labhub.dto.institution;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class InstitutionDTO {
    private UUID id;
    private String name;
    private String code;
    private String type;
    private String status;
    private String address;
    private String email;
    private String phone;
    private String website;
    private String logoUrl;
    private String primaryAdminName;
    private String primaryAdminEmail;
    private int departmentCount;
    private int userCount;
}

