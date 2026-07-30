package com.labhub.dto.rolerequest;

import com.labhub.enums.RoleName;
import com.labhub.enums.RoleRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RoleRequestResponse {
    private UUID id;
    private UUID userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private RoleName currentRole;
    private RoleName requestedRole;
    private String reason;
    private RoleRequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private String reviewedByEmail;
}
