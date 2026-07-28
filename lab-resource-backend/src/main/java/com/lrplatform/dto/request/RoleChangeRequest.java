package com.lrplatform.dto.request;

import com.lrplatform.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleChangeRequest {

    @NotNull(message = "Role is required")
    private UserRole role;
}
