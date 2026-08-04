package com.labresource.backend.controller;

import com.labresource.backend.dto.LoginRequest;
import com.labresource.backend.dto.LoginResponse;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import com.labresource.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository) {

        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

       authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
        user.getUserId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole().getRoleName(),
        user.getInstitution().getInstitutionId(),
        token,
        "Login Successful"
);

        return ResponseEntity.ok(response);
    }
}
