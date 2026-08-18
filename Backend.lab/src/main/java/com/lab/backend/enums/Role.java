package com.lab.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    STUDENT,
    TECHNICIAN,
    MANAGER,
    DEPARTMENT_HEAD,
    INSTITUTION_ADMIN,
    SYSTEM_ADMINISTRATOR,
    ADMIN;

    @JsonCreator
    public static Role fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return STUDENT;
        }
        String normalized = roleStr.trim().toUpperCase().replace(" ", "_");
        switch (normalized) {
            case "ADMIN":
            case "SYSTEM_ADMIN":
            case "SYSTEM_ADMINISTRATOR":
                return SYSTEM_ADMINISTRATOR;
            case "MANAGER":
            case "LAB_MANAGER":
                return MANAGER;
            case "TECHNICIAN":
            case "LAB_TECHNICIAN":
                return TECHNICIAN;
            case "DEPARTMENT_HEAD":
            case "DEPT_HEAD":
                return DEPARTMENT_HEAD;
            case "INSTITUTION_ADMIN":
            case "INSTITUTION_ADMINISTRATOR":
                return INSTITUTION_ADMIN;
            case "STUDENT":
                return STUDENT;
            default:
                return STUDENT;
        }
    }
}
