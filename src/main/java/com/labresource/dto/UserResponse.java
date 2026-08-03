package com.labresource.dto;

import com.labresource.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    // No "password" field — never return the password hash to the client
}