-- ==========================================================
-- Lab Resource Utilization Platform - Database Schema
-- Database: lab_resource_db
-- Target Engine: PostgreSQL
-- ==========================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    otp VARCHAR(10),
    otp_verified BOOLEAN DEFAULT FALSE
);

-- Table: institutions
CREATE TABLE IF NOT EXISTS institutions (
    institution_id SERIAL PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    contact_email VARCHAR(255)
);

-- Table: laboratories
CREATE TABLE IF NOT EXISTS laboratories (
    laboratory_id SERIAL PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    institution_id INT,
    department VARCHAR(100)
);

-- Table: equipment
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    status VARCHAR(50),
    quantity INT,
    available_quantity INT,
    institution_id INT,
    laboratory_id INT,
    image VARCHAR(255),
    document_url VARCHAR(255)
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    resource_id BIGINT,
    equipment_id BIGINT,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR(50)
);

-- Table: utilization
CREATE TABLE IF NOT EXISTS utilization (
    utilization_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT,
    equipment_id BIGINT,
    user_id BIGINT,
    usage_date DATE,
    hours_used NUMERIC(10, 2),
    remarks TEXT
);

-- Table: maintenance
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    maintenance_date DATE,
    description TEXT,
    status VARCHAR(50),
    maintenance_type VARCHAR(50),
    cost NUMERIC(10, 2),
    vendor VARCHAR(255),
    start_date DATE,
    end_date DATE,
    next_due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: calibration
CREATE TABLE IF NOT EXISTS calibration (
    calibration_id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT,
    calibration_date DATE,
    next_due_date DATE,
    performed_by VARCHAR(255),
    certificate_file VARCHAR(255),
    remarks TEXT,
    status VARCHAR(50)
);

-- Table: billings (Inter-Institution Billing & Cost Tracking)
CREATE TABLE IF NOT EXISTS billings (
    billing_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT,
    equipment_id BIGINT,
    user_id BIGINT,
    requester_institution_id INT,
    owner_institution_id INT,
    hours_used NUMERIC(10, 2),
    hourly_rate NUMERIC(10, 2),
    total_cost NUMERIC(10, 2),
    billing_date DATE,
    status VARCHAR(20) DEFAULT 'UNPAID',
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: sharing_requests
CREATE TABLE IF NOT EXISTS sharing_requests (
    request_id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    requester_institution_id INT NOT NULL,
    owner_institution_id INT NOT NULL,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    purpose TEXT,
    status VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: waiting_list
CREATE TABLE IF NOT EXISTS waiting_list (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'WAITING',
    notified_at TIMESTAMP,
    expires_at TIMESTAMP
);
