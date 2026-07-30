package com.labhub.service;

import com.labhub.dto.auth.AuthResponse;
import com.labhub.dto.auth.InstitutionRegisterRequest;
import com.labhub.dto.auth.LoginRequest;
import com.labhub.dto.auth.RegisterRequest;
import com.labhub.dto.institution.InstitutionDTO;
import com.labhub.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    InstitutionDTO registerInstitution(InstitutionRegisterRequest request);
    AuthResponse login(LoginRequest request);
    User getCurrentUser(String email);
}

