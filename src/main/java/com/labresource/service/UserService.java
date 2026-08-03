package com.labresource.service;

import com.labresource.dto.RegisterRequest;
import com.labresource.entity.User;

public interface UserService {
    User registerUser(RegisterRequest request);
    User getUserByEmail(String email);
    String login(String email, String password);
}