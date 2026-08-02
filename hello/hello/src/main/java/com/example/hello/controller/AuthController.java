package com.example.hello.controller;

import com.example.hello.dto.LoginRequest;
import com.example.hello.dto.LoginResponse;
import com.example.hello.dto.RegisterRequest;
import com.example.hello.service.RegisterService;
import com.example.hello.repository.UserRepository;
import com.example.hello.entity.User;
import com.example.hello.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final RegisterService registerService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtil jwtUtil, RegisterService registerService,UserRepository userRepository) {

        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.registerService = registerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        return registerService.register(request);

    }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.getEmail());

        String token = jwtUtil.generateToken(userDetails);
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fullName = user.getFullName();
        String role = user.getRole().getRoleName();

        return new LoginResponse(token, fullName, role);

    }
}
