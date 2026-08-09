package com.labresource.platform.service;

import com.labresource.platform.dto.UpdateUserRoleRequest;
import com.labresource.platform.dto.UserResponse;
import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUserRole(Long id, UpdateUserRoleRequest request);
}
