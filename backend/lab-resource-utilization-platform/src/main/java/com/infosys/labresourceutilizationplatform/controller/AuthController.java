package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.dto.LoginRequest;
import com.infosys.labresourceutilizationplatform.dto.LoginResponse;
import com.infosys.labresourceutilizationplatform.dto.RegisterRequest;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        return userService.registerUser(request);

    }

    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        return userService.getPendingUsers();
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        return userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );
    }
}