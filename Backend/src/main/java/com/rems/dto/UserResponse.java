package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String status;
    private Integer roleId;
    private List<Integer> roleIds;
    private String roleName;
    private List<String> permissions;
    private Set<String> roles;

    // Null when the user isn't tied to an institution/department.
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private Long labId;
    private String labName;

    private Instant createdAt;
    private Instant updatedAt;
}
