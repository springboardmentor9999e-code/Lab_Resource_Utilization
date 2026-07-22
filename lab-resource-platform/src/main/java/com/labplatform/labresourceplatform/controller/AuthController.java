package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.dto.AuthResponse;
import com.labplatform.labresourceplatform.dto.LoginRequest;
import com.labplatform.labresourceplatform.dto.RegisterRequest;
import com.labplatform.labresourceplatform.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }
}
