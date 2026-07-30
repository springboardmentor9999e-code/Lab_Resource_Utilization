package com.example.labresourceplatform.controller;

import com.example.labresourceplatform.config.JwtUtil;
import com.example.labresourceplatform.dto.LoginRequest;
import com.example.labresourceplatform.dto.LoginResponse;
import com.example.labresourceplatform.dto.RegisterRequest;
import com.example.labresourceplatform.entity.User;
import com.example.labresourceplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userService.findByEmail(request.getEmail()).orElseThrow();

        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(
                "Login Successful",
                token,
                user.getRole().name()
        );
    }
}