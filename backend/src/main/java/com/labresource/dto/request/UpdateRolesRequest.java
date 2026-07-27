package com.labresource.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

/**
 * Admin role assignment — replaces a user's role set with the provided one.
 */
@Data
public class UpdateRolesRequest {

    @NotEmpty(message = "A user must have at least one role")
    private Set<String> roles;
}
