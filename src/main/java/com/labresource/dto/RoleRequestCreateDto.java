package com.labresource.dto;

import com.labresource.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleRequestCreateDto {
    private Role requestedRole;
    private String reason;
}
