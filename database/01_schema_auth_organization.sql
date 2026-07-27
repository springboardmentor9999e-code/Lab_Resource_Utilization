-- =============================================================
-- Lab Resource Utilization Platform
-- 01. AUTHENTICATION & ORGANIZATION TABLES
-- Matches EER Diagram Section 1 + JPA entities (com.labresource.entity)
-- =============================================================

-- ---------------------------------------------------------
-- INSTITUTION
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS institution (
    institution_id   BIGSERIAL PRIMARY KEY,
    name             VARCHAR(150) NOT NULL UNIQUE,
    code             VARCHAR(30)  NOT NULL UNIQUE,
    email            VARCHAR(150),
    phone            VARCHAR(20),
    address          VARCHAR(255),
    website          VARCHAR(150),
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

-- ---------------------------------------------------------
-- DEPARTMENT
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS department (
    department_id    BIGSERIAL PRIMARY KEY,
    institution_id   BIGINT NOT NULL REFERENCES institution (institution_id),
    name             VARCHAR(150) NOT NULL,
    code             VARCHAR(30)  NOT NULL,
    description      VARCHAR(255),
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_department_institution ON department (institution_id);

-- ---------------------------------------------------------
-- ROLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS role (
    role_id          BIGSERIAL PRIMARY KEY,
    role_name        VARCHAR(50) NOT NULL UNIQUE,
    description      VARCHAR(255),
    is_system_role   BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

-- ---------------------------------------------------------
-- APP_USER
-- auth_provider: LOCAL | GOOGLE  (OAuth2 support)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_user (
    user_id          BIGSERIAL PRIMARY KEY,
    institution_id   BIGINT NOT NULL REFERENCES institution (institution_id),
    department_id    BIGINT NOT NULL REFERENCES department (department_id),
    username         VARCHAR(100) NOT NULL UNIQUE,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    phone            VARCHAR(20),
    gender           VARCHAR(10),
    status           VARCHAR(20)  NOT NULL,          -- ACTIVE | INACTIVE | SUSPENDED
    auth_provider    VARCHAR(20)  DEFAULT 'LOCAL',   -- LOCAL | GOOGLE
    is_active        BOOLEAN DEFAULT TRUE,
    is_verified      BOOLEAN DEFAULT FALSE,
    last_login_at    TIMESTAMP,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_user_institution ON app_user (institution_id);
CREATE INDEX IF NOT EXISTS idx_app_user_department  ON app_user (department_id);

-- ---------------------------------------------------------
-- USER_ROLE (many-to-many join: app_user <-> role)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_role (
    user_id          BIGINT NOT NULL REFERENCES app_user (user_id),
    role_id          BIGINT NOT NULL REFERENCES role (role_id),
    created_at       TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_user ON user_role (user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role ON user_role (role_id);

-- ---------------------------------------------------------
-- REFRESH_TOKEN
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_token (
    token_id         BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES app_user (user_id),
    token            VARCHAR(500) NOT NULL UNIQUE,
    expires_at       TIMESTAMP NOT NULL,
    revoked          BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user ON refresh_token (user_id);

-- ---------------------------------------------------------
-- PASSWORD_RESET_TOKEN  (OTP based password reset flow)
-- Flow: forgot-password -> OTP emailed -> verify-otp -> reset-password
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_token (
    token_id         BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES app_user (user_id),
    token            VARCHAR(255) NOT NULL UNIQUE,   -- reset-session token (returned after OTP verified)
    otp              VARCHAR(6),                     -- 6 digit one-time password sent by email
    otp_verified     BOOLEAN DEFAULT FALSE,          -- set TRUE after successful OTP verification
    attempts         INT DEFAULT 0,                  -- wrong OTP attempts (max 5)
    expires_at       TIMESTAMP NOT NULL,
    is_used          BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_user ON password_reset_token (user_id);
