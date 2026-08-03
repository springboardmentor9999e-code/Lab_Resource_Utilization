package com.labresource.dto;

import com.labresource.entity.ProfileType;
import com.labresource.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role desiredRole;
    private ProfileType profileType;     // NEW — optional, defaults to STUDENT
    private Long institutionId;          // NEW — optional
}