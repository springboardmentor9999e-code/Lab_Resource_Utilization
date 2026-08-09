package com.labresource.platform.config;

import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RoleDataMigration implements ApplicationRunner {

    private static final Map<String, String> LEGACY_ROLE_MAPPINGS = Map.of(
            "ROLE_USER", "ROLE_STUDENT",
            "ROLE_RESEARCHER", "ROLE_ASSISTANT_PROFESSOR",
            "ROLE_TECHNICIAN", "ROLE_LAB_ASSISTANT",
            "ROLE_MANAGER", "ROLE_HOD",
            "ROLE_DEPARTMENT_HEAD", "ROLE_HOD",
            "ROLE_INSTITUTION_ADMIN", "ROLE_SYSTEM_ADMIN"
    );

    private static final List<String> ACADEMIC_ROLES = List.of(
            "ROLE_STUDENT",
            "ROLE_LAB_ASSISTANT",
            "ROLE_ASSISTANT_PROFESSOR",
            "ROLE_PROFESSOR",
            "ROLE_HOD",
            "ROLE_SYSTEM_ADMIN"
    );

    private final JdbcTemplate jdbcTemplate;

    public RoleDataMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        dropRoleCheckConstraint();

        LEGACY_ROLE_MAPPINGS.forEach((legacyRole, academicRole) ->
                jdbcTemplate.update(
                        "UPDATE users SET role = ? WHERE role = ?",
                        academicRole,
                        legacyRole
                )
        );

        Long invalidRoleCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role NOT IN (?, ?, ?, ?, ?, ?)",
                Long.class,
                ACADEMIC_ROLES.toArray()
        );

        if (invalidRoleCount != null && invalidRoleCount > 0) {
            throw new IllegalStateException("Unknown user role values remain in users.role after academic role migration");
        }

        addRoleCheckConstraint();
    }

    private void dropRoleCheckConstraint() {
        jdbcTemplate.execute("""
                ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
                """);
    }

    private void addRoleCheckConstraint() {
        jdbcTemplate.execute("""
                ALTER TABLE users ADD CONSTRAINT users_role_check
                CHECK (role IN (
                    'ROLE_STUDENT',
                    'ROLE_LAB_ASSISTANT',
                    'ROLE_ASSISTANT_PROFESSOR',
                    'ROLE_PROFESSOR',
                    'ROLE_HOD',
                    'ROLE_SYSTEM_ADMIN'
                ))
                """);
    }
}
