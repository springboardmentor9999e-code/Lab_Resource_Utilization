package com.labresource.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String email;
    private String password;
    // No "role" field — role always comes from the database during login, never from client input
}