package com.labresource.dto;

import com.labresource.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateRequest {
    private Role newRole;
}