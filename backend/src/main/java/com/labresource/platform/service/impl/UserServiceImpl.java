package com.labresource.platform.service.impl;

import com.labresource.platform.dto.UpdateUserRoleRequest;
import com.labresource.platform.dto.UserResponse;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.UserNotFoundException;
import com.labresource.platform.repository.UserRepository;
import com.labresource.platform.service.UserService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserResponse.from(findUserById(id));
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = findUserById(id);
        user.setRole(request.role());

        return UserResponse.from(userRepository.saveAndFlush(user));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " was not found"));
    }
}
