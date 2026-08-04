package com.labresource.backend.dto;

import lombok.Data;

@Data
public class UserRequest {

    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String department;

    private Long roleId;
    private Long labId;
    private Long institutionId;
}