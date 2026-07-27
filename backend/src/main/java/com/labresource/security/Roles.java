package com.labresource.security;

/**
 * Central role constants for the 7-role RBAC model.
 * Permissions matrix (Equipment module):
 *  - SYSTEM_ADMIN:      add, edit, delete, upload images, upload documents, change status, view
 *  - INSTITUTION_ADMIN: add, edit, delete, upload documents, view
 *  - DEPARTMENT_HEAD:   add, edit, delete, view
 *  - LAB_MANAGER:       add, edit, delete, change status, view
 *  - LAB_TECHNICIAN:    add, edit, change status, upload images, upload documents, view
 *  - RESEARCHER:        view only
 *  - STUDENT:           view only
 */
public final class Roles {

    public static final String SYSTEM_ADMIN = "SYSTEM_ADMIN";
    public static final String INSTITUTION_ADMIN = "INSTITUTION_ADMIN";
    public static final String DEPARTMENT_HEAD = "DEPARTMENT_HEAD";
    public static final String LAB_MANAGER = "LAB_MANAGER";
    public static final String LAB_TECHNICIAN = "LAB_TECHNICIAN";
    public static final String RESEARCHER = "RESEARCHER";
    public static final String STUDENT = "STUDENT";

    private Roles() {
    }
}
