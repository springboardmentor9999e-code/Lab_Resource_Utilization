package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.User;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ==========================================================
    // GET ALL USERS
    // Institution Admin, Department Head & System Admin
    // ==========================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public List<User> getAllUsers() {

        return userRepository.findAll();

    }

    // ==========================================================
    // GET USER BY ID
    // ==========================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public User getUserById(@PathVariable Integer id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

    }

    // ==========================================================
    // UPDATE USER
    // System Admin & Institution Admin
    // ==========================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public User updateUser(
            @PathVariable Integer id,
            @RequestBody User updatedUser
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setIsActive(updatedUser.getIsActive());
        user.setRole(updatedUser.getRole());

        return userRepository.save(user);

    }

    // ==========================================================
    // DELETE USER
    // System Admin Only
    // ==========================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public String deleteUser(@PathVariable Integer id) {

        userRepository.deleteById(id);

        return "User deleted successfully";

    }

    // ==========================================================
    // ACTIVATE / DEACTIVATE USER
    // System Admin & Institution Admin
    // ==========================================================
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public User changeStatus(
            @PathVariable Integer id,
            @RequestParam Boolean active
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setIsActive(active);

        return userRepository.save(user);

    }

}