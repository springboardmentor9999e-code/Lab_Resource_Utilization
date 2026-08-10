package com.example.backend.service;

import com.example.backend.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User saveUser(User user);

    List<User> getAllUsers();

    Optional<User> getUserById(Integer id);

    void deleteUser(Integer id);

    Optional<User> findByEmail(String email);

    // Forgot Password methods
    void sendOtp(String email);

    boolean verifyOtp(String email, String otp);

    void resetPassword(String email, String newPassword);
}