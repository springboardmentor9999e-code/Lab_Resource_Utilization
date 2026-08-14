package com.example.hello.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ============================================================
    // GET CURRENT USER
    // ============================================================

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));
    }


    // ============================================================
    // GET CURRENT INSTITUTION ID
    // ============================================================

    public Integer getCurrentInstitutionId(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));

        return user.getInstitutionId();
    }


    // ============================================================
    // GET CURRENT DEPARTMENT ID
    // ============================================================

    public Integer getCurrentDepartmentId(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));

        if (user.getDepartmentId() == null) {

            throw new RuntimeException(
                    "Department Head is not assigned to a department"
            );
        }

        return user.getDepartmentId();
    }
}