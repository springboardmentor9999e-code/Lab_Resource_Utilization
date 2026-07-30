package com.labhub.dto.rolerequest;

import com.labhub.enums.RoleName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleRequestCreate {

    @NotNull(message = "Requested role is required")
    private RoleName requestedRole;

    @NotBlank(message = "Reason is required")
    private String reason;
}
