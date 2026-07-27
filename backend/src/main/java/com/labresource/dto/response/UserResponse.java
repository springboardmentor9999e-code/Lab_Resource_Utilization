package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {
    
    private Long userId;
    
    private String username;
    
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    private String phone;

    private String gender;

    private String institution;

    private String department;

    private Set<String> roles;

    private boolean active;
}