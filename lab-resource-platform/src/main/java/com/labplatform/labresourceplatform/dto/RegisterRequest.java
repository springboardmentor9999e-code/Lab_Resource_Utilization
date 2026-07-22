package com.labplatform.labresourceplatform.dto;

import com.labplatform.labresourceplatform.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String name;

    private String email;

    private String password;

    // NOTE: this is the user's *desired* role, not their actual account role.
    // AuthService.register() always creates the account as STUDENT/RESEARCHER
    // and, if this differs from that default, opens a pending RoleChangeRequest
    // for an admin to review. The client field name is kept as "role" so the
    // existing frontend registration form doesn't need to change its payload shape.
    private Role role;

    private Long institutionId;
}
