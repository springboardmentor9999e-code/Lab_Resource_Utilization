package com.labhub.dto.user;

import com.labhub.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UserStatus status;
    private List<String> roles;
    private UUID departmentId;
    private String departmentName;
    private String institutionName;
    private LocalDateTime createdAt;
}
