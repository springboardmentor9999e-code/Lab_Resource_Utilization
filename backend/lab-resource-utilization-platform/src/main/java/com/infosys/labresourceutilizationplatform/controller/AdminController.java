package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        return userService.getPendingUsers();
    }

    @PutMapping("/approve/{userId}")
    public String approveUser(@PathVariable Integer userId) {
        return userService.approveUser(userId);
    }

    @PutMapping("/reject/{userId}")
    public String rejectUser(@PathVariable Integer userId) {
        return userService.rejectUser(userId);
    }
}