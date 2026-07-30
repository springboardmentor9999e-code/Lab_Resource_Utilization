package com.labhub.service;

import com.labhub.dto.user.UserDTO;
import com.labhub.enums.UserStatus;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserDTO> getAllUsers();
    List<UserDTO> getUsersForCurrentUser(String currentUserEmail);
    UserDTO getUserById(UUID id);
    UserDTO updateStatus(UUID id, UserStatus status);
}
