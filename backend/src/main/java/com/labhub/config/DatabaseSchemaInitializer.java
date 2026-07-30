package com.labhub.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.annotation.PostConstruct;

/**
 * Ensures database columns for institutions and user mappings exist in PostgreSQL
 * prior to JPA entity queries.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initSchema() {
        try {
            log.info("Ensuring PostgreSQL schema compatibility for Institutions...");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'APPROVED';");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS code VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS type VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS phone VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS website VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_admin_name VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_admin_email VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_id UUID;");
            log.info("PostgreSQL schema migration completed successfully.");
        } catch (Exception e) {
            log.warn("Schema initialization notice: {}", e.getMessage());
        }
    }
}
