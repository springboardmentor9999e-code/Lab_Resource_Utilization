package com.lab.backend.service;

import com.lab.backend.entity.User;
import com.lab.backend.enums.Role;
import com.lab.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }



    // Register User
    public User register(User user) {


        // Duplicate email check
        if(userRepository.findByEmail(user.getEmail()) != null){

            throw new RuntimeException("Email already exists");

        }


        // Default role
        if(user.getRole() == null){

            user.setRole(Role.STUDENT);

        }


        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );


        return userRepository.save(user);

    }



    // Find user by email
    public User findByEmail(String email){

        return userRepository.findByEmail(email);

    }

}