--
-- PostgreSQL database dump
--

\restrict FarfhmgKD5x8YOIK9vnH4CTNTjnxwD0vnuYhztjaa1Gu6rHqmcWGqt1dCcgPHFq

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    announcement_type character varying(50) DEFAULT 'GENERAL'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    target_audience character varying(50) DEFAULT 'ALL'::character varying NOT NULL,
    institution_id bigint,
    department_id bigint,
    created_by bigint NOT NULL,
    published boolean DEFAULT false NOT NULL,
    published_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    module character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    entity_type character varying(50),
    entity_id bigint,
    old_value text,
    new_value text,
    ip_address character varying(50),
    user_agent character varying(500),
    result character varying(20) DEFAULT 'SUCCESS'::character varying NOT NULL,
    action_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: booking_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_history (
    id bigint NOT NULL,
    booking_id bigint NOT NULL,
    status character varying(30) NOT NULL,
    remarks text,
    updated_by bigint,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.booking_history OWNER TO postgres;

--
-- Name: booking_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_history_id_seq OWNER TO postgres;

--
-- Name: booking_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_history_id_seq OWNED BY public.booking_history.id;


--
-- Name: booking_waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_waitlist (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    user_id bigint NOT NULL,
    "position" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.booking_waitlist OWNER TO postgres;

--
-- Name: booking_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_waitlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_waitlist_id_seq OWNER TO postgres;

--
-- Name: booking_waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_waitlist_id_seq OWNED BY public.booking_waitlist.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    user_id bigint NOT NULL,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    purpose text,
    booking_status character varying(30) DEFAULT 'PENDING_APPROVAL'::character varying NOT NULL,
    approved_by bigint,
    approved_at timestamp without time zone,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    recurrence_pattern character varying(20),
    recurrence_end_date date,
    recurrence_parent_id bigint
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: calibration_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calibration_records (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    calibration_date date NOT NULL,
    next_due_date date NOT NULL,
    certificate_url character varying(255),
    calibrated_by character varying(200),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.calibration_records OWNER TO postgres;

--
-- Name: calibration_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calibration_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calibration_records_id_seq OWNER TO postgres;

--
-- Name: calibration_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calibration_records_id_seq OWNED BY public.calibration_records.id;


--
-- Name: department_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department_budgets (
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    fiscal_year integer NOT NULL,
    budget_amount numeric(12,2) DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.department_budgets OWNER TO postgres;

--
-- Name: department_budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.department_budgets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_budgets_id_seq OWNER TO postgres;

--
-- Name: department_budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.department_budgets_id_seq OWNED BY public.department_budgets.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    institution_id bigint NOT NULL,
    department_name character varying(200) NOT NULL,
    hod_user_id bigint,
    status boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id bigint NOT NULL,
    equipment_code character varying(50) NOT NULL,
    equipment_name character varying(200) NOT NULL,
    category_id bigint NOT NULL,
    laboratory_id bigint NOT NULL,
    manufacturer character varying(200),
    model_number character varying(100),
    serial_number character varying(100),
    purchase_date date,
    purchase_cost numeric(12,2),
    warranty_expiry date,
    status character varying(30) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    qr_code character varying(255),
    image_url character varying(255),
    max_booking_hours integer DEFAULT 8,
    calibration_due_date date,
    description text,
    assigned_technician_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hourly_rate numeric(10,2),
    specifications jsonb
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_categories (
    id bigint NOT NULL,
    category_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_categories OWNER TO postgres;

--
-- Name: equipment_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_categories_id_seq OWNER TO postgres;

--
-- Name: equipment_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_categories_id_seq OWNED BY public.equipment_categories.id;


--
-- Name: equipment_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_documents (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    document_type character varying(50) NOT NULL,
    file_url character varying(255) NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_documents OWNER TO postgres;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_documents_id_seq OWNER TO postgres;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_documents_id_seq OWNED BY public.equipment_documents.id;


--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_tag_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_tag_mappings (
    equipment_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.equipment_tag_mappings OWNER TO postgres;

--
-- Name: equipment_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_tags (
    id bigint NOT NULL,
    tag_name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_tags OWNER TO postgres;

--
-- Name: equipment_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_tags_id_seq OWNER TO postgres;

--
-- Name: equipment_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_tags_id_seq OWNED BY public.equipment_tags.id;


--
-- Name: external_booking_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_booking_requests (
    id bigint NOT NULL,
    shared_equipment_id bigint NOT NULL,
    requesting_institution_id bigint NOT NULL,
    requested_by bigint NOT NULL,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    purpose text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    approved_by bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.external_booking_requests OWNER TO postgres;

--
-- Name: external_booking_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_booking_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_booking_requests_id_seq OWNER TO postgres;

--
-- Name: external_booking_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_booking_requests_id_seq OWNED BY public.external_booking_requests.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: institution_partnerships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institution_partnerships (
    id bigint NOT NULL,
    institution_a_id bigint NOT NULL,
    institution_b_id bigint NOT NULL,
    agreement_start date NOT NULL,
    agreement_end date NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.institution_partnerships OWNER TO postgres;

--
-- Name: institution_partnerships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.institution_partnerships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.institution_partnerships_id_seq OWNER TO postgres;

--
-- Name: institution_partnerships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.institution_partnerships_id_seq OWNED BY public.institution_partnerships.id;


--
-- Name: institutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institutions (
    id bigint NOT NULL,
    institution_code character varying(20) NOT NULL,
    institution_name character varying(200) NOT NULL,
    email character varying(255),
    phone character varying(20),
    website character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    pincode character varying(20),
    logo_url character varying(255),
    status boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.institutions OWNER TO postgres;

--
-- Name: institutions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.institutions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.institutions_id_seq OWNER TO postgres;

--
-- Name: institutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.institutions_id_seq OWNED BY public.institutions.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    invoice_number character varying(50) NOT NULL,
    institution_id bigint NOT NULL,
    booking_id bigint,
    total_amount numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0,
    payment_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    due_date date NOT NULL,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: laboratories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laboratories (
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    laboratory_name character varying(200) NOT NULL,
    lab_manager_id bigint,
    location character varying(255),
    status boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.laboratories OWNER TO postgres;

--
-- Name: laboratories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.laboratories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.laboratories_id_seq OWNER TO postgres;

--
-- Name: laboratories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.laboratories_id_seq OWNED BY public.laboratories.id;


--
-- Name: maintenance_work_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_work_orders (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    maintenance_type character varying(30) NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying,
    assigned_to bigint,
    created_by bigint NOT NULL,
    status character varying(30) DEFAULT 'CREATED'::character varying NOT NULL,
    description text,
    scheduled_date date,
    completion_date date,
    downtime_hours numeric(8,2),
    total_cost numeric(12,2),
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    labor_hours numeric(8,2),
    parts_used text
);


ALTER TABLE public.maintenance_work_orders OWNER TO postgres;

--
-- Name: maintenance_work_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_work_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_work_orders_id_seq OWNER TO postgres;

--
-- Name: maintenance_work_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_work_orders_id_seq OWNED BY public.maintenance_work_orders.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    notification_type character varying(50) NOT NULL,
    email_enabled boolean DEFAULT true NOT NULL,
    in_app_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sms_enabled boolean DEFAULT false NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_id_seq OWNER TO postgres;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notification_retry_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_retry_queue (
    id bigint NOT NULL,
    notification_id bigint,
    channel character varying(20) NOT NULL,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    next_retry_at timestamp without time zone,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    last_error text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_retry_queue OWNER TO postgres;

--
-- Name: notification_retry_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_retry_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_retry_queue_id_seq OWNER TO postgres;

--
-- Name: notification_retry_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_retry_queue_id_seq OWNED BY public.notification_retry_queue.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    notification_type character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    status character varying(20) DEFAULT 'UNREAD'::character varying NOT NULL,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expiry timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    payment_reference character varying(100),
    amount_paid numeric(12,2) NOT NULL,
    payment_method character varying(50),
    payment_date timestamp without time zone NOT NULL,
    payment_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: report_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_history (
    id bigint NOT NULL,
    report_type character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    format character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'COMPLETED'::character varying NOT NULL,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    generated_by bigint,
    generated_by_name character varying(200),
    created_at timestamp(6) without time zone
);


ALTER TABLE public.report_history OWNER TO postgres;

--
-- Name: report_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_history_id_seq OWNER TO postgres;

--
-- Name: report_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_history_id_seq OWNED BY public.report_history.id;


--
-- Name: role_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_config (
    id bigint NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_config OWNER TO postgres;

--
-- Name: role_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_config_id_seq OWNER TO postgres;

--
-- Name: role_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_config_id_seq OWNED BY public.role_config.id;


--
-- Name: shared_equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_equipment (
    id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    hourly_rate numeric(10,2),
    daily_rate numeric(10,2),
    security_deposit numeric(10,2),
    sharing_status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shared_equipment OWNER TO postgres;

--
-- Name: shared_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shared_equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shared_equipment_id_seq OWNER TO postgres;

--
-- Name: shared_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shared_equipment_id_seq OWNED BY public.shared_equipment.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    institution_id bigint,
    department_id bigint,
    role character varying(30) DEFAULT 'RESEARCHER'::character varying NOT NULL,
    status boolean DEFAULT true NOT NULL,
    profile_image_url character varying(255),
    oauth_provider character varying(50),
    oauth_provider_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: booking_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_history ALTER COLUMN id SET DEFAULT nextval('public.booking_history_id_seq'::regclass);


--
-- Name: booking_waitlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_waitlist ALTER COLUMN id SET DEFAULT nextval('public.booking_waitlist_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: calibration_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calibration_records ALTER COLUMN id SET DEFAULT nextval('public.calibration_records_id_seq'::regclass);


--
-- Name: department_budgets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_budgets ALTER COLUMN id SET DEFAULT nextval('public.department_budgets_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories ALTER COLUMN id SET DEFAULT nextval('public.equipment_categories_id_seq'::regclass);


--
-- Name: equipment_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents ALTER COLUMN id SET DEFAULT nextval('public.equipment_documents_id_seq'::regclass);


--
-- Name: equipment_tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tags ALTER COLUMN id SET DEFAULT nextval('public.equipment_tags_id_seq'::regclass);


--
-- Name: external_booking_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests ALTER COLUMN id SET DEFAULT nextval('public.external_booking_requests_id_seq'::regclass);


--
-- Name: institution_partnerships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_partnerships ALTER COLUMN id SET DEFAULT nextval('public.institution_partnerships_id_seq'::regclass);


--
-- Name: institutions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institutions ALTER COLUMN id SET DEFAULT nextval('public.institutions_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: laboratories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratories ALTER COLUMN id SET DEFAULT nextval('public.laboratories_id_seq'::regclass);


--
-- Name: maintenance_work_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_work_orders ALTER COLUMN id SET DEFAULT nextval('public.maintenance_work_orders_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notification_retry_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_retry_queue ALTER COLUMN id SET DEFAULT nextval('public.notification_retry_queue_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: report_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history ALTER COLUMN id SET DEFAULT nextval('public.report_history_id_seq'::regclass);


--
-- Name: role_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_config ALTER COLUMN id SET DEFAULT nextval('public.role_config_id_seq'::regclass);


--
-- Name: shared_equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_equipment ALTER COLUMN id SET DEFAULT nextval('public.shared_equipment_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, announcement_type, priority, target_audience, institution_id, department_id, created_by, published, published_at, expires_at, created_at, updated_at) FROM stdin;
2	Equipments	All the equipments where scheduled fo rmaintaninance	GENERAL	MEDIUM	ALL	\N	\N	1	t	2026-07-26 09:49:48.565167	\N	2026-07-24 19:19:00.874666	2026-07-26 09:49:48.643991
1	Equipments	Can't book for 5 days	MAINTENANCE	MEDIUM	ALL	\N	\N	1	f	2026-07-24 10:06:25.104426	2026-07-25 00:00:00	2026-07-24 10:06:25.105426	2026-07-26 09:50:21.808502
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, module, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, result, action_time) FROM stdin;
1	1	DEPARTMENT	UPDATE	Department	1	\N	{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 22:47:50.440336
2	1	DEPARTMENT	UPDATE	Department	1	\N	{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 22:47:50.991107
3	1	DEPARTMENT	UPDATE	Department	2	\N	{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:26:36.912322
5	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	1	\N	{"id":1,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:39:54.080183
4	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	2	\N	{"id":2,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:39:54.080183
6	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	1	\N	{"id":1,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":"2026-07-22T23:39:58.43503"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:39:58.43503
7	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	2	\N	{"id":2,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":"2026-07-22T23:40:02.9590562"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:02.961063
36	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:57:34.164072
8	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	1	\N	{"id":1,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":"2026-07-22T23:40:15.9303012"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:15.948176
10	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	3	\N	{"id":3,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:40:39.301786","updatedAt":"2026-07-22T23:40:47.1485305"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:47.152531
13	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	4	\N	{"id":4,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:41:15.036892","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:41:15.039904
14	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	4	\N	{"id":4,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:41:15.036892","updatedAt":"2026-07-22T23:41:50.5159721"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:41:50.519063
15	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	4	\N	{"id":4,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:41:15.036892","updatedAt":"2026-07-22T23:44:50.9287044"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:44:50.939157
37	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:57:38.219992
38	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:57:41.318815
39	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:57:54.960536
115	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":false}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:11:19.367892
9	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	3	\N	{"id":3,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:40:39.301786","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:39.305788
11	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	3	\N	{"id":3,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:40:39.301786","updatedAt":"2026-07-22T23:40:49.007501"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:49.014583
12	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	2	\N	{"id":2,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:39:54.057722","updatedAt":"2026-07-22T23:40:57.8393078"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:40:57.844261
16	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	5	\N	{"id":5,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:44:59.298614","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:44:59.307272
19	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	8	\N	{"id":8,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":"2026-07-22","completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.410449","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:46:07.417555
116	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":true}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:11:21.325017
141	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:05:20.901131
187	2	AUTH	LOGIN	User	2	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:18:35.814596
17	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	6	\N	{"id":6,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:45:49.49875","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:45:49.49875
18	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	7	\N	{"id":7,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":"2026-07-22","completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.408441","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:46:07.410449
20	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	6	\N	{"id":6,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:45:49.49875","updatedAt":"2026-07-22T23:49:42.3265167"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:49:42.378116
21	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	10	\N	{"id":10,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:51:49.535201","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:51:49.548198
22	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	7	\N	{"id":7,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":"2026-07-22","completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.408441","updatedAt":"2026-07-22T23:52:01.1905978"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:01.197943
23	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	11	\N	{"id":11,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:52:34.702644","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:34.708214
24	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	6	\N	{"id":6,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:45:49.49875","updatedAt":"2026-07-22T23:52:41.6975041"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:41.703586
27	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	8	\N	{"id":8,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":"2026-07-22","completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.410449","updatedAt":"2026-07-22T23:52:44.9319039"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:44.934216
29	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	10	\N	{"id":10,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:51:49.535201","updatedAt":"2026-07-22T23:52:46.9798437"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:46.98782
32	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	8	\N	{"id":8,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":"2026-07-22","completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.410449","updatedAt":"2026-07-22T23:52:49.0868841"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:49.09516
34	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	11	\N	{"id":11,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:52:34.702644","updatedAt":"2026-07-22T23:52:52.0726679"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:52.077675
35	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	12	\N	{"id":12,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:53:06.986091","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:53:06.989075
25	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	7	\N	{"id":7,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":"2026-07-22","completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:46:07.408441","updatedAt":"2026-07-22T23:52:42.6405391"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:42.650758
26	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	5	\N	{"id":5,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:44:59.298614","updatedAt":"2026-07-22T23:52:44.0936691"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:44.097798
28	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	9	\N	{"id":9,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"CORRECTIVE","priority":"HIGH","assignedTo":{"id":3,"firstName":"Rajesh","lastName":"Kumar","email":"rajesh@demouniversity.edu","phone":"+91-9876543211","role":"LAB_TECHNICIAN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Rajesh Kumar"},"createdBy":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"status":"COMPLETED","description":"3D Printer nozzle replacement and calibration","scheduledDate":"2026-07-22","completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:47:59.369344","updatedAt":"2026-07-22T23:52:45.5758635"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:45.584568
30	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	11	\N	{"id":11,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:52:34.702644","updatedAt":"2026-07-22T23:52:47.5300572"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:47.536059
31	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	5	\N	{"id":5,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:44:59.298614","updatedAt":"2026-07-22T23:52:47.9379792"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:47.94428
33	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	10	\N	{"id":10,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:51:49.535201","updatedAt":"2026-07-22T23:52:50.9452009"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:52:50.950935
40	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:58:15.215229","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:15.232058
41	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:29.07582
42	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:33.842647
43	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:36.635421
44	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:39.854831
45	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:43.032653
46	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:45.846317
47	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:58:15.215229","updatedAt":"2026-07-22T23:58:51.7856733"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:51.790672
48	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:58:15.215229","updatedAt":"2026-07-22T23:58:51.800666"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:51.804122
49	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:58:15.215229","updatedAt":"2026-07-22T23:58:54.5041192"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:54.518565
50	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-22","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-22T23:58:15.215229","updatedAt":"2026-07-22T23:58:54.5456875"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-22 23:58:54.551107
51	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-23 00:10:41.386955
52	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	14	\N	{"id":14,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:18:01.59831","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:18:01.606996
53	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	14	\N	{"id":14,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:18:01.59831","updatedAt":"2026-07-23T00:18:06.6952297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:18:06.697226
54	1	MAINTENANCE	DELETE	MaintenanceWorkOrder	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:18:24.848512
55	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	15	\N	{"id":15,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:03.222925","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:20:03.225894
56	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	15	\N	{"id":15,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:03.222925","updatedAt":"2026-07-23T00:20:08.1506031"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:20:08.152705
57	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	16	\N	{"id":16,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:14.225579","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:20:14.231597
58	5	BOOKING	CREATE	Booking	1	\N	{"id":1,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":5,"firstName":"Sneha","lastName":"Patel","email":"sneha@demouniversity.edu","phone":"+91-9876543213","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Sneha Patel"},"bookingDate":"2026-07-22","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"history":[],"createdAt":"2026-07-23T00:24:52.997174","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 00:24:53.055718
59	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	15	\N	{"id":15,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-23","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:03.222925","updatedAt":"2026-07-23T15:01:48.6399723"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:01:48.672808
60	4	BOOKING	CREATE	Booking	2	\N	{"id":2,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T15:14:28.887233","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:14:28.910922
61	4	BOOKING	CREATE	Booking	3	\N	{"id":3,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T15:14:39.334172","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:14:39.344844
63	1	BOOKING	APPROVE	Booking	1	\N	{"id":1,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":5,"firstName":"Sneha","lastName":"Patel","email":"sneha@demouniversity.edu","phone":"+91-9876543213","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Sneha Patel"},"bookingDate":"2026-07-22","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"APPROVED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":"2026-07-23T15:22:49.6977201","remarks":"Approved","createdAt":"2026-07-23T00:24:52.997174","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:22:49.717501
64	1	INSTITUTION	CREATE	Institution	2	\N	{"id":2,"institutionCode":"SIMATS","institutionName":"SIMATS Engineering","email":"simats.sse@saveetha.com","phone":"","website":null,"address":"","city":"Chennai","state":"Tamil Nadu","country":"","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-23T15:24:34.172598","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:24:34.177467
65	1	BOOKING	REJECT	Booking	2	\N	{"id":2,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"REJECTED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":null,"remarks":"Rejected","createdAt":"2026-07-23T15:14:28.887233","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 15:27:01.034174
85	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:01.811968
117	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:37:19.792141
66	2	BOOKING	CREATE	Booking	4	\N	{"id":4,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T16:14:13.508125","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 16:14:13.530322
67	4	BOOKING	CREATE	Booking	5	\N	{"id":5,"equipment":{"id":4,"equipmentCode":"GPU-001","equipmentName":"GPU Server","category":{"id":4,"categoryName":"Computer Science","description":"Computing equipment including GPU servers, workstations, networking gear","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":4,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"High Performance Computing Lab","labManager":null,"location":"Block B, Room 202","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"NVIDIA","modelNumber":"DGX A100","serialNumber":"SN-2024-004","purchaseDate":"2024-01-05","purchaseCost":15000000.00,"warrantyExpiry":"2027-01-05","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":24,"calibrationDueDate":null,"description":"High-performance GPU server for AI/ML workloads","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T16:25:12.914223","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 16:25:12.935643
70	4	BOOKING	CREATE	Booking	6	\N	{"id":6,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"13:00:00","endTime":"12:30:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T16:29:06.750518","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 16:29:06.767384
74	4	BOOKING	CREATE	Booking	7	\N	{"id":7,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-25","startTime":"10:00:00","endTime":"12:00:00","purpose":"test booking","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T16:37:34.530261","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-23 16:37:34.584295
75	4	BOOKING	CREATE	Booking	8	\N	{"id":8,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-24","startTime":"09:30:00","endTime":"12:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T16:38:56.856587","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 16:38:56.866107
86	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:01.833521"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:05.006282
118	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":false}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:39:51.701367
120	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:48:28.539969
121	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":false}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:48:38.439856
76	1	BOOKING	APPROVE	Booking	3	\N	{"id":3,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"APPROVED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":"2026-07-23T17:06:54.269357","remarks":"Approved","createdAt":"2026-07-23T15:14:39.334172","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 17:06:54.300742
77	1	BOOKING	APPROVE	Booking	5	\N	{"id":5,"equipment":{"id":4,"equipmentCode":"GPU-001","equipmentName":"GPU Server","category":{"id":4,"categoryName":"Computer Science","description":"Computing equipment including GPU servers, workstations, networking gear","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":4,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"High Performance Computing Lab","labManager":null,"location":"Block B, Room 202","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"NVIDIA","modelNumber":"DGX A100","serialNumber":"SN-2024-004","purchaseDate":"2024-01-05","purchaseCost":15000000.00,"warrantyExpiry":"2027-01-05","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":24,"calibrationDueDate":null,"description":"High-performance GPU server for AI/ML workloads","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"APPROVED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":"2026-07-23T17:10:03.2474094","remarks":"Approved","createdAt":"2026-07-23T16:25:12.914223","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 17:10:03.264316
79	6	BOOKING	CREATE	Booking	9	\N	{"id":9,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":6,"firstName":"Selvakumar","lastName":"K","email":"selvakumarkprof@gmail.com","phone":null,"role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":"google","oauthProviderId":"109821194330815595851","createdAt":"2026-07-23T20:05:56.387051","updatedAt":"2026-07-23T20:05:56.387051","fullName":"Selvakumar K"},"bookingDate":"2026-07-24","startTime":"14:00:00","endTime":"15:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-23T20:07:29.814401","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 20:07:29.850765
80	1	BOOKING	APPROVE	Booking	9	\N	{"id":9,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":6,"firstName":"Selvakumar","lastName":"K","email":"selvakumarkprof@gmail.com","phone":null,"role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":"google","oauthProviderId":"109821194330815595851","createdAt":"2026-07-23T20:05:56.387051","updatedAt":"2026-07-23T20:05:56.387051","fullName":"Selvakumar K"},"bookingDate":"2026-07-24","startTime":"14:00:00","endTime":"15:00:00","purpose":"","status":"APPROVED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":"2026-07-23T20:28:28.4594473","remarks":"Approved","createdAt":"2026-07-23T20:07:29.814401","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 20:28:28.628599
81	1	USER_MANAGEMENT	UPDATE	User	6	\N	{"id":6,"firstName":"Selvakumar","lastName":"K","fullName":"Selvakumar K","email":"selvakumarkprof@gmail.com","phone":"07639072595","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":2,"institutionName":"SIMATS Engineering","departmentId":null,"departmentName":null,"createdAt":"2026-07-23T20:05:56.387051","updatedAt":"2026-07-23T20:43:21.22228"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 21:07:57.397909
82	1	DEPARTMENT	CREATE	Department	4	\N	{"id":4,"institution":{"id":2,"institutionCode":null,"institutionName":null,"email":null,"phone":null,"website":null,"address":null,"city":null,"state":null,"country":null,"pincode":null,"logoUrl":null,"status":true,"createdAt":null,"updatedAt":null},"departmentName":"CSE","status":true,"createdAt":"2026-07-23T21:25:12.257151","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 21:25:12.275785
83	1	DEPARTMENT	CREATE	Department	5	\N	{"id":5,"institution":{"id":2,"institutionCode":null,"institutionName":null,"email":null,"phone":null,"website":null,"address":null,"city":null,"state":null,"country":null,"pincode":null,"logoUrl":null,"status":true,"createdAt":null,"updatedAt":null},"departmentName":"IT","status":true,"createdAt":"2026-07-23T21:25:17.646616","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 21:25:17.652733
84	1	USER_MANAGEMENT	UPDATE	User	6	\N	{"id":6,"firstName":"Selvakumar","lastName":"K","fullName":"Selvakumar K","email":"selvakumarkprof@gmail.com","phone":"07639072595","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":2,"institutionName":"SIMATS Engineering","departmentId":5,"departmentName":"IT","createdAt":"2026-07-23T20:05:56.387051","updatedAt":"2026-07-23T21:07:57.415717"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-23 21:25:39.910075
222	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 13:20:36.917179
87	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:05.015787"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:07.867621
88	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:07.87982"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:07.934334
89	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:07.943093"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:11.830039
90	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:11.830039"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:21.720458
92	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:21.834949"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:23.858757
91	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:21.720458"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 09:15:21.830376
93	1	ANNOUNCEMENT	CREATE	Announcement	1	\N	{"id":1,"title":"sdfdsfds","content":"sdfsdfdsfds","announcementType":"GENERAL","priority":"MEDIUM","targetAudience":"ALL","institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdBy":1,"createdByName":"Admin System","published":true,"publishedAt":"2026-07-24T10:06:25.1044257","expiresAt":null,"createdAt":"2026-07-24T10:06:25.105426","updatedAt":"2026-07-24T10:06:25.105426"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 10:06:25.124341
94	1	ANNOUNCEMENT	UPDATE	Announcement	1	\N	{"id":1,"title":"Equipments","content":"Can't book for 5 days","announcementType":"MAINTENANCE","priority":"MEDIUM","targetAudience":"ALL","institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdBy":1,"createdByName":"Admin System","published":true,"publishedAt":"2026-07-24T10:06:25.104426","expiresAt":"2026-07-25T00:00:00","createdAt":"2026-07-24T10:06:25.105426","updatedAt":"2026-07-24T10:06:25.105426"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 10:17:35.378283
96	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":false}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 11:18:48.063202
100	4	BOOKING	CREATE	Booking	10	\N	{"id":10,"equipment":{"id":3,"equipmentCode":"OSC-001","equipmentName":"Digital Oscilloscope","category":{"id":3,"categoryName":"Electronics","description":"Electronics equipment including oscilloscopes, signal generators, multimeters","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":6,"department":{"id":3,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Electronics & Communication","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Signal Processing Lab","labManager":null,"location":"Block C, Room 302","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Tektronix","modelNumber":"MDO3024","serialNumber":"SN-2024-003","purchaseDate":"2023-06-10","purchaseCost":250000.00,"warrantyExpiry":"2026-06-10","status":"AVAILABLE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_3_99116aa3.webp","maxBookingHours":6,"calibrationDueDate":null,"description":"200MHz 4-channel digital oscilloscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:23.865621","fullName":"Arun Kumar"},"bookingDate":"2026-07-25","startTime":"14:00:00","endTime":"16:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-24T11:19:42.956041","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 11:19:42.99433
101	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":true}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 12:39:09.98825
119	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":true}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:39:52.95103
122	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:48:42.970856
223	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-29 18:25:45.171915
102	2	NOTIFICATION_PREFERENCE	UPDATE_ALL	NotificationPreference	2	\N	[{"id":1,"notificationType":"BOOKING_CREATED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":2,"notificationType":"BOOKING_APPROVED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":3,"notificationType":"BOOKING_REJECTED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":4,"notificationType":"BOOKING_CANCELLED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":5,"notificationType":"BOOKING_REMINDER","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":6,"notificationType":"MAINTENANCE_SCHEDULED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":7,"notificationType":"MAINTENANCE_COMPLETED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":8,"notificationType":"CALIBRATION_DUE","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":9,"notificationType":"EQUIPMENT_AVAILABLE","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":10,"notificationType":"WAITLIST_PROMOTED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":11,"notificationType":"PARTNERSHIP_INVITATION","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":12,"notificationType":"ANNOUNCEMENT","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":13,"notificationType":"PASSWORD_RESET","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":14,"notificationType":"GENERAL","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true}]	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 14:22:00.876862
109	1	USER_MANAGEMENT	TOGGLE_STATUS	User	8	\N	{"id":8,"firstName":"Suresh","lastName":"Nair","fullName":"Suresh Nair","email":"suresh@demouniversity.edu","phone":"+91-9876543215","role":"INSTITUTION_ADMIN","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":null,"departmentName":null,"createdAt":"2026-07-23T20:34:25.248855","updatedAt":"2026-07-23T20:34:25.248855"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:17:22.182897
103	4	BOOKING	CREATE	Booking	11	\N	{"id":11,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:23.865621","fullName":"Arun Kumar"},"bookingDate":"2026-07-24","startTime":"10:00:00","endTime":"14:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-24T15:16:31.400659","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 15:16:31.479644
104	8	BOOKING	APPROVE	Booking	4	\N	{"id":4,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"bookingDate":"2026-07-23","startTime":"09:00:00","endTime":"10:00:00","purpose":"","status":"APPROVED","approvedBy":{"id":8,"firstName":"Suresh","lastName":"Nair","email":"suresh@demouniversity.edu","phone":"+91-9876543215","role":"INSTITUTION_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-23T20:34:25.248855","updatedAt":"2026-07-23T20:34:25.248855","fullName":"Suresh Nair"},"approvedAt":"2026-07-24T15:18:05.3386599","remarks":"Approved","createdAt":"2026-07-23T16:14:13.508125","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 15:18:05.399752
105	1	MAINTENANCE	CREATE	MaintenanceWorkOrder	17	\N	{"id":17,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_6_8f236014.jpeg","maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"CREATED","description":"","scheduledDate":"2026-07-24","completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-24T19:15:07.823924","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:15:08.306078
106	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	16	\N	{"id":16,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"IN_PROGRESS","description":"","scheduledDate":null,"completionDate":null,"downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:14.225579","updatedAt":"2026-07-24T19:15:49.8978583"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:15:49.925011
107	1	MAINTENANCE	UPDATE_STATUS	MaintenanceWorkOrder	16	\N	{"id":16,"equipment":{"id":2,"equipmentCode":"CNC-002","equipmentName":"CNC Lathe","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"DMG Mori","modelNumber":"CLX 350","serialNumber":"SN-2024-002","purchaseDate":"2023-03-20","purchaseCost":3500000.00,"warrantyExpiry":"2026-03-20","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"CNC lathe for turning operations","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"maintenanceType":"PREVENTIVE","priority":"MEDIUM","assignedTo":null,"createdBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"status":"COMPLETED","description":"","scheduledDate":null,"completionDate":"2026-07-24","downtimeHours":null,"totalCost":null,"remarks":null,"createdAt":"2026-07-23T00:20:14.225579","updatedAt":"2026-07-24T19:15:58.1298255"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:15:58.291031
108	1	BOOKING	APPROVE	Booking	6	\N	{"id":6,"equipment":{"id":6,"equipmentCode":"MIC-001","equipmentName":"Electron Microscope","category":{"id":5,"categoryName":"Biomedical","description":"Biomedical engineering equipment including microscopes, centrifuges","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":3,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Programming Lab","labManager":null,"location":"Block B, Room 201","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"JEOL","modelNumber":"JSM-7600F","serialNumber":"SN-2024-006","purchaseDate":"2022-06-15","purchaseCost":25000000.00,"warrantyExpiry":"2025-06-15","status":"UNDER_MAINTENANCE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_6_8f236014.jpeg","maxBookingHours":4,"calibrationDueDate":null,"description":"Field emission scanning electron microscope","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:23.865621","fullName":"Arun Kumar"},"bookingDate":"2026-07-23","startTime":"13:00:00","endTime":"12:30:00","purpose":"","status":"APPROVED","approvedBy":{"id":1,"firstName":"Admin","lastName":"System","email":"admin@demouniversity.edu","phone":"+91-9999999999","role":"SYSTEM_ADMIN","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Admin System"},"approvedAt":"2026-07-24T19:16:56.824325","remarks":"Approved","createdAt":"2026-07-23T16:29:06.750518","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:16:56.939337
110	1	USER_MANAGEMENT	TOGGLE_STATUS	User	8	\N	{"id":8,"firstName":"Suresh","lastName":"Nair","fullName":"Suresh Nair","email":"suresh@demouniversity.edu","phone":"+91-9876543215","role":"INSTITUTION_ADMIN","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":null,"departmentName":null,"createdAt":"2026-07-23T20:34:25.248855","updatedAt":"2026-07-24T19:17:22.188432"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:17:27.721244
111	1	ANNOUNCEMENT	CREATE	Announcement	2	\N	{"id":2,"title":"Equipments","content":"All the equipments where scheduled fo rmaintaninance","announcementType":"GENERAL","priority":"MEDIUM","targetAudience":"ALL","institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdBy":1,"createdByName":"Admin System","published":false,"publishedAt":null,"expiresAt":null,"createdAt":"2026-07-24T19:19:00.874666","updatedAt":"2026-07-24T19:19:00.874666"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:19:00.883724
112	4	BOOKING	CREATE	Booking	12	\N	{"id":12,"equipment":{"id":5,"equipmentCode":"3DP-001","equipmentName":"3D Printer","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":2,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"Manufacturing Lab","labManager":null,"location":"Block A, Room 102","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Stratasys","modelNumber":"F123","serialNumber":"SN-2024-005","purchaseDate":"2023-09-01","purchaseCost":1200000.00,"warrantyExpiry":"2025-09-01","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"Industrial grade 3D printer for rapid prototyping","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:23.865621","fullName":"Arun Kumar"},"bookingDate":"2026-07-25","startTime":"09:00:00","endTime":"13:00:00","purpose":"","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-24T19:21:12.415322","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-24 19:21:12.456269
113	1	ANNOUNCEMENT	PUBLISH	Announcement	2	\N	{"id":2,"title":"Equipments","content":"All the equipments where scheduled fo rmaintaninance","announcementType":"GENERAL","priority":"MEDIUM","targetAudience":"ALL","institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdBy":1,"createdByName":"Admin System","published":true,"publishedAt":"2026-07-26T09:49:48.5651673","expiresAt":null,"createdAt":"2026-07-24T19:19:00.874666","updatedAt":"2026-07-24T19:19:00.874666"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-26 09:49:48.590931
114	1	ANNOUNCEMENT	UNPUBLISH	Announcement	1	\N	{"id":1,"title":"Equipments","content":"Can't book for 5 days","announcementType":"MAINTENANCE","priority":"MEDIUM","targetAudience":"ALL","institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdBy":1,"createdByName":"Admin System","published":false,"publishedAt":"2026-07-24T10:06:25.104426","expiresAt":"2026-07-25T00:00:00","createdAt":"2026-07-24T10:06:25.105426","updatedAt":"2026-07-24T10:17:35.387866"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-26 09:50:21.80651
123	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:57:26.252898
125	1	ROLE_MANAGEMENT	UPDATE	RoleConfig	1	\N	{"id":1,"roleName":"RESEARCHER","userCount":3,"description":"Can view and book equipment","enabled":true}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:57:51.29484
127	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:59:15.033797
129	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:11:49.462865
142	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":false,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T20:50:41.547967"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:06:07.775276
161	1	INVOICE	CREATE	Invoice	1	\N	{"id":1,"invoiceNumber":"INV-2026-000001","institutionId":1,"institutionName":"Demo University","bookingId":null,"equipmentName":null,"bookingUser":null,"totalAmount":50000,"taxAmount":14,"amountPaid":0,"amountDue":50000,"paymentStatus":"PENDING","dueDate":"2026-07-27","generatedAt":"2026-07-27T22:02:42.934087"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 22:02:43.008191
167	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:08:42.640908
169	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 22:10:07.004905
188	2	INVOICE	CREATE	Invoice	2	\N	{"id":2,"invoiceNumber":"INV-2026-000002","institutionId":1,"institutionName":"Demo University","bookingId":13,"equipmentName":"CNC Milling Machine","bookingUser":"Arun Kumar","totalAmount":10000000.00,"taxAmount":0,"amountPaid":0,"amountDue":10000000.00,"paymentStatus":"PENDING","dueDate":"2026-08-26","generatedAt":"2026-07-27T22:18:37.070608"}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:18:37.145374
189	2	BOOKING	COMPLETE	Booking	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-28","startTime":"10:00:00","endTime":"12:00:00","purpose":"E2E test booking for CNC Milling Machine","status":"COMPLETED","approvedBy":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"approvedAt":"2026-07-27T22:14:32.365495","remarks":"Approved for E2E test","createdAt":"2026-07-27T22:14:06.107758","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:18:37.286034
190	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:20:26.598164
191	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:20:49.146695
192	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:21:10.208135
194	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:21:58.208939
195	15	PAYMENT	CREATE	Payment	2	\N	{"id":2,"invoiceId":2,"invoiceNumber":"INV-2026-000002","amountPaid":10000000,"paymentReference":"MOCK-TXN-001","paymentMethod":"CREDIT_CARD","paymentDate":"2026-07-27T22:20:00","paymentStatus":"PAID","createdAt":"2026-07-27T22:21:58.539966"}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:21:58.56855
196	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:22:12.915271
197	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:22:43.764845
198	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:22:57.032938
224	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-29 18:25:54.254531
124	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:57:47.522871
128	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:59:37.141142
144	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":true,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T21:06:07.777102"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:06:32.019504
162	1	PAYMENT	CREATE	Payment	1	\N	{"id":1,"invoiceId":1,"invoiceNumber":"INV-2026-000001","amountPaid":50014,"paymentReference":"PAY-20260727-XDC2","paymentMethod":"BANK_TRANSFER","paymentDate":"2026-07-27T22:02:52.74788","paymentStatus":"PAID","createdAt":"2026-07-27T22:02:52.75609"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 22:02:52.782872
199	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:29:01.370305
200	4	BOOKING	CREATE	Booking	14	\N	{"id":14,"equipment":{"id":4,"equipmentCode":"GPU-001","equipmentName":"GPU Server","category":{"id":4,"categoryName":"Computer Science","description":"Computing equipment including GPU servers, workstations, networking gear","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":4,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"High Performance Computing Lab","labManager":null,"location":"Block B, Room 202","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"NVIDIA","modelNumber":"DGX A100","serialNumber":"SN-2024-004","purchaseDate":"2024-01-05","purchaseCost":15000000.00,"hourlyRate":2000.00,"warrantyExpiry":"2027-01-05","status":"AVAILABLE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_4_0c719029.jpeg","maxBookingHours":24,"calibrationDueDate":null,"description":"High-performance GPU server for AI/ML workloads","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-29","startTime":"09:00:00","endTime":"11:00:00","purpose":"E2E test - verify hourly rate calculation","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-27T22:29:01.975638","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:29:02.116924
201	2	AUTH	LOGIN	User	2	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:29:19.422841
202	2	BOOKING	APPROVE	Booking	14	\N	{"id":14,"equipment":{"id":4,"equipmentCode":"GPU-001","equipmentName":"GPU Server","category":{"id":4,"categoryName":"Computer Science","description":"Computing equipment including GPU servers, workstations, networking gear","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":4,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"High Performance Computing Lab","labManager":null,"location":"Block B, Room 202","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"NVIDIA","modelNumber":"DGX A100","serialNumber":"SN-2024-004","purchaseDate":"2024-01-05","purchaseCost":15000000.00,"hourlyRate":2000.00,"warrantyExpiry":"2027-01-05","status":"AVAILABLE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_4_0c719029.jpeg","maxBookingHours":24,"calibrationDueDate":null,"description":"High-performance GPU server for AI/ML workloads","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-29","startTime":"09:00:00","endTime":"11:00:00","purpose":"E2E test - verify hourly rate calculation","status":"APPROVED","approvedBy":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"approvedAt":"2026-07-27T22:29:19.5408557","remarks":"Approved","createdAt":"2026-07-27T22:29:01.975638","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:29:19.565189
203	2	INVOICE	CREATE	Invoice	3	\N	{"id":3,"invoiceNumber":"INV-2026-000003","institutionId":1,"institutionName":"Demo University","bookingId":14,"equipmentName":"GPU Server","bookingUser":"Arun Kumar","totalAmount":4000.00,"taxAmount":0,"amountPaid":0,"amountDue":4000.00,"paymentStatus":"PENDING","dueDate":"2026-08-26","generatedAt":"2026-07-27T22:29:19.682565"}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:29:19.699188
204	2	BOOKING	COMPLETE	Booking	14	\N	{"id":14,"equipment":{"id":4,"equipmentCode":"GPU-001","equipmentName":"GPU Server","category":{"id":4,"categoryName":"Computer Science","description":"Computing equipment including GPU servers, workstations, networking gear","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":4,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"High Performance Computing Lab","labManager":null,"location":"Block B, Room 202","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"NVIDIA","modelNumber":"DGX A100","serialNumber":"SN-2024-004","purchaseDate":"2024-01-05","purchaseCost":15000000.00,"hourlyRate":2000.00,"warrantyExpiry":"2027-01-05","status":"AVAILABLE","qrCode":null,"imageUrl":"/uploads/equipment/equipment_4_0c719029.jpeg","maxBookingHours":24,"calibrationDueDate":null,"description":"High-performance GPU server for AI/ML workloads","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-29","startTime":"09:00:00","endTime":"11:00:00","purpose":"E2E test - verify hourly rate calculation","status":"COMPLETED","approvedBy":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"approvedAt":"2026-07-27T22:29:19.540856","remarks":"Approved","createdAt":"2026-07-27T22:29:01.975638","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:29:19.743536
205	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:29:26.91592
206	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 10:34:44.684692
126	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 19:57:57.046097
145	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":false,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T21:06:32.019504"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:21:16.902897
152	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:32.344279"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:35.392661
154	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":true,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T21:21:16.948341"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:39.8421
165	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:03:52.891346
168	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:09:49.366771
207	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 11:48:15.944665
130	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:12:25.854562
131	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:13:07.927323
132	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:13:29.134896
146	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:21:33.433954
147	1	USER_MANAGEMENT	TOGGLE_STATUS	User	5	\N	{"id":5,"firstName":"Sneha","lastName":"Patel","fullName":"Sneha Patel","email":"sneha@demouniversity.edu","phone":"+91-9876543213","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":2,"departmentName":"Computer Science","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:21:44.306193
148	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-24T09:15:23.865621"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:21:51.966068
170	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:11:44.34096
210	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-28 12:22:13.757284
211	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-28 12:22:23.718271
212	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-28 12:24:35.94745
133	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:19:13.639012
149	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:25.647449
150	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:21:51.966068"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:32.300871
153	1	USER_MANAGEMENT	TOGGLE_STATUS	User	5	\N	{"id":5,"firstName":"Sneha","lastName":"Patel","fullName":"Sneha Patel","email":"sneha@demouniversity.edu","phone":"+91-9876543213","role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":2,"departmentName":"Computer Science","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:21:44.306193"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:37.481269
171	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:11:56.47822
175	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:12:59.076559
181	2	AUTH	LOGIN	User	2	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:14:25.232313
213	8	AUTH	LOGIN	User	8	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 12:47:24.413946
214	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 12:47:50.384129
134	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:19:18.353586
151	1	USER_MANAGEMENT	TOGGLE_STATUS	User	4	\N	{"id":4,"firstName":"Arun","lastName":"Kumar","fullName":"Arun Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":1,"institutionName":"Demo University","departmentId":1,"departmentName":"Mechanical Engineering","createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:32.300871"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:22:32.340446
172	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:12:09.96945
182	2	AUTH	LOGIN	User	2	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:14:32.231021
215	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 12:52:55.682647
135	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:25:12.181871
155	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":false,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T21:22:39.845836"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:31:16.135361
157	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:32:32.366979
173	15	BUDGET	CREATE	DepartmentBudget	1	\N	{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"fiscalYear":2026,"budgetAmount":5000000,"description":"E2E test budget","createdAt":"2026-07-27T22:12:10.113438","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:12:10.118351
176	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:13:20.654961
183	2	BOOKING	APPROVE	Booking	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-28","startTime":"10:00:00","endTime":"12:00:00","purpose":"E2E test booking for CNC Milling Machine","status":"APPROVED","approvedBy":{"id":2,"firstName":"Priya","lastName":"Sharma","email":"priya@demouniversity.edu","phone":"+91-9876543210","role":"LAB_MANAGER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297","fullName":"Priya Sharma"},"approvedAt":"2026-07-27T22:14:32.3654945","remarks":"Approved for E2E test","createdAt":"2026-07-27T22:14:06.107758","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:14:32.424613
216	1	BUDGET	CREATE	DepartmentBudget	2	\N	{"id":2,"department":{"id":2,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Computer Science","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"fiscalYear":2026,"budgetAmount":100000,"description":"","createdAt":"2026-07-28T12:53:52.345835","updatedAt":null}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 12:53:52.360267
217	1	NOTIFICATION_PREFERENCE	UPDATE_ALL	NotificationPreference	1	\N	[{"id":15,"notificationType":"BOOKING_CREATED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":16,"notificationType":"BOOKING_APPROVED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":17,"notificationType":"BOOKING_REJECTED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":18,"notificationType":"BOOKING_CANCELLED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":19,"notificationType":"BOOKING_REMINDER","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":20,"notificationType":"MAINTENANCE_SCHEDULED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":21,"notificationType":"MAINTENANCE_COMPLETED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":22,"notificationType":"CALIBRATION_DUE","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":23,"notificationType":"EQUIPMENT_AVAILABLE","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":24,"notificationType":"WAITLIST_PROMOTED","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":25,"notificationType":"PARTNERSHIP_INVITATION","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":26,"notificationType":"ANNOUNCEMENT","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":27,"notificationType":"PASSWORD_RESET","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true},{"id":28,"notificationType":"GENERAL","emailEnabled":true,"inAppEnabled":true,"smsEnabled":false,"pushEnabled":true}]	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 12:56:21.559798
136	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:32:04.47417
137	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:41:55.602322
138	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"RESEARCHER","status":false,"profileImageUrl":null,"institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T20:37:30.975991"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:42:03.240929
179	4	BOOKING	CREATE	Booking	13	\N	{"id":13,"equipment":{"id":1,"equipmentCode":"CNC-001","equipmentName":"CNC Milling Machine","category":{"id":1,"categoryName":"Mechanical","description":"Mechanical engineering equipment including CNC machines, lathes, milling machines","createdAt":"2026-07-22T21:28:54.034297"},"laboratory":{"id":1,"department":{"id":1,"institution":{"id":1,"institutionCode":"DEMO001","institutionName":"Demo University","email":"admin@demouniversity.edu","phone":"+91-1234567890","website":"https://demouniversity.edu","address":null,"city":"Bangalore","state":"Karnataka","country":"India","pincode":null,"logoUrl":null,"status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"departmentName":"Mechanical Engineering","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"laboratoryName":"CNC Machining Lab","labManager":null,"location":"Block A, Room 101","status":true,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"manufacturer":"Haas Automation","modelNumber":"VF-2","serialNumber":"SN-2024-001","purchaseDate":"2023-01-15","purchaseCost":5000000.00,"warrantyExpiry":"2026-01-15","status":"AVAILABLE","qrCode":null,"imageUrl":null,"maxBookingHours":8,"calibrationDueDate":null,"description":"3-axis CNC milling machine for precision machining","assignedTechnicianId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-22T21:28:54.034297"},"user":{"id":4,"firstName":"Arun","lastName":"Kumar","email":"arun@demouniversity.edu","phone":"+91-9876543212","role":"RESEARCHER","status":true,"profileImageUrl":null,"oauthProvider":null,"oauthProviderId":null,"createdAt":"2026-07-22T21:28:54.034297","updatedAt":"2026-07-27T21:22:35.398664","fullName":"Arun Kumar"},"bookingDate":"2026-07-28","startTime":"10:00:00","endTime":"12:00:00","purpose":"E2E test booking for CNC Milling Machine","status":"PENDING_APPROVAL","approvedBy":null,"approvedAt":null,"remarks":null,"createdAt":"2026-07-27T22:14:06.107758","updatedAt":null}	0:0:0:0:0:0:0:1	curl/8.21.0	SUCCESS	2026-07-27 22:14:06.179815
180	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:14:15.75071
218	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 13:10:22.703305
219	8	AUTH	LOGIN	User	8	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 13:11:18.729721
139	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"RESEARCHER","status":true,"profileImageUrl":null,"institutionId":null,"institutionName":null,"departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T20:42:03.248862"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:42:06.156529
158	1	USER_MANAGEMENT	TOGGLE_STATUS	User	14	\N	{"id":14,"firstName":"SELVAKUMAR","lastName":"K","fullName":"SELVAKUMAR K","email":"selvakumark1059.sse@saveetha.com","phone":null,"role":"STUDENT","status":true,"profileImageUrl":null,"institutionId":3,"institutionName":"SEC","departmentId":null,"departmentName":null,"createdAt":"2026-07-27T20:37:30.975991","updatedAt":"2026-07-27T21:31:16.163857"}	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:32:40.979501
178	4	AUTH	LOGIN	User	4	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:14:05.914738
220	8	AUTH	LOGIN	User	8	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 13:20:04.043207
140	14	AUTH	OAUTH_SETUP_COMPLETE	User	14	\N	Role set to STUDENT	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 20:50:41.513459
143	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 21:06:25.55814
164	15	AUTH	REGISTER	User	15	\N	User registered with role RESEARCHER	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:03:45.506158
166	15	AUTH	LOGIN	User	15	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:07:41.529975
184	2	AUTH	LOGIN	User	2	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.8894	SUCCESS	2026-07-27 22:14:48.173458
186	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-27 22:15:11.275304
221	1	AUTH	LOGIN	User	1	\N	User logged in	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	SUCCESS	2026-07-28 13:20:30.275565
\.


--
-- Data for Name: booking_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_history (id, booking_id, status, remarks, updated_by, updated_at) FROM stdin;
1	1	PENDING_APPROVAL	Booking created	5	2026-07-23 00:24:53.012695
2	2	PENDING_APPROVAL	Booking created	4	2026-07-23 15:14:28.894658
3	3	PENDING_APPROVAL	Booking created	4	2026-07-23 15:14:39.334172
4	1	APPROVED	Approved	1	2026-07-23 15:22:49.698036
5	2	REJECTED	Rejected	1	2026-07-23 15:27:01.019717
6	4	PENDING_APPROVAL	Booking created	2	2026-07-23 16:14:13.512268
7	5	PENDING_APPROVAL	Booking created	4	2026-07-23 16:25:12.917222
8	6	PENDING_APPROVAL	Booking created	4	2026-07-23 16:29:06.750518
9	7	PENDING_APPROVAL	Booking created	4	2026-07-23 16:37:34.535978
10	8	PENDING_APPROVAL	Booking created	4	2026-07-23 16:38:56.858679
11	3	APPROVED	Approved	1	2026-07-23 17:06:54.283824
12	5	APPROVED	Approved	1	2026-07-23 17:10:03.249951
13	9	PENDING_APPROVAL	Booking created	6	2026-07-23 20:07:29.832614
14	9	APPROVED	Approved	1	2026-07-23 20:28:28.516074
15	10	PENDING_APPROVAL	Booking created	4	2026-07-24 11:19:42.960966
16	11	PENDING_APPROVAL	Booking created	4	2026-07-24 15:16:31.404658
17	4	APPROVED	Approved	8	2026-07-24 15:18:05.34666
18	6	APPROVED	Approved	1	2026-07-24 19:16:56.848012
19	12	PENDING_APPROVAL	Booking created	4	2026-07-24 19:21:12.422413
20	13	PENDING_APPROVAL	Booking created	4	2026-07-27 22:14:06.107758
21	13	APPROVED	Approved for E2E test	2	2026-07-27 22:14:32.365494
22	13	COMPLETED	Booking marked as completed	2	2026-07-27 22:18:37.013344
23	14	PENDING_APPROVAL	Booking created	4	2026-07-27 22:29:01.98152
24	14	APPROVED	Approved	2	2026-07-27 22:29:19.540855
25	14	COMPLETED	Booking marked as completed	2	2026-07-27 22:29:19.66774
\.


--
-- Data for Name: booking_waitlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_waitlist (id, equipment_id, user_id, "position", active, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, equipment_id, user_id, booking_date, start_time, end_time, purpose, booking_status, approved_by, approved_at, remarks, created_at, updated_at, recurrence_pattern, recurrence_end_date, recurrence_parent_id) FROM stdin;
1	3	5	2026-07-22	09:00:00	10:00:00		APPROVED	1	2026-07-23 15:22:49.69772	Approved	2026-07-23 00:24:52.997174	\N	\N	\N	\N
2	3	4	2026-07-23	09:00:00	10:00:00		REJECTED	1	\N	Rejected	2026-07-23 15:14:28.887233	\N	\N	\N	\N
7	1	4	2026-07-25	10:00:00	12:00:00	test booking	PENDING_APPROVAL	\N	\N	\N	2026-07-23 16:37:34.530261	\N	\N	\N	\N
8	3	4	2026-07-24	09:30:00	12:00:00		PENDING_APPROVAL	\N	\N	\N	2026-07-23 16:38:56.856587	\N	\N	\N	\N
3	5	4	2026-07-23	09:00:00	10:00:00		APPROVED	1	2026-07-23 17:06:54.269357	Approved	2026-07-23 15:14:39.334172	\N	\N	\N	\N
5	4	4	2026-07-23	09:00:00	10:00:00		APPROVED	1	2026-07-23 17:10:03.247409	Approved	2026-07-23 16:25:12.914223	\N	\N	\N	\N
9	3	6	2026-07-24	14:00:00	15:00:00		APPROVED	1	2026-07-23 20:28:28.459447	Approved	2026-07-23 20:07:29.814401	\N	\N	\N	\N
10	3	4	2026-07-25	14:00:00	16:00:00		PENDING_APPROVAL	\N	\N	\N	2026-07-24 11:19:42.956041	\N	\N	\N	\N
11	6	4	2026-07-24	10:00:00	14:00:00		PENDING_APPROVAL	\N	\N	\N	2026-07-24 15:16:31.400659	\N	\N	\N	\N
4	6	2	2026-07-23	09:00:00	10:00:00		APPROVED	8	2026-07-24 15:18:05.33866	Approved	2026-07-23 16:14:13.508125	\N	\N	\N	\N
6	6	4	2026-07-23	13:00:00	12:30:00		APPROVED	1	2026-07-24 19:16:56.824325	Approved	2026-07-23 16:29:06.750518	\N	\N	\N	\N
12	5	4	2026-07-25	09:00:00	13:00:00		PENDING_APPROVAL	\N	\N	\N	2026-07-24 19:21:12.415322	\N	\N	\N	\N
13	1	4	2026-07-28	10:00:00	12:00:00	E2E test booking for CNC Milling Machine	COMPLETED	2	2026-07-27 22:14:32.365495	Approved for E2E test	2026-07-27 22:14:06.107758	\N	\N	\N	\N
14	4	4	2026-07-29	09:00:00	11:00:00	E2E test - verify hourly rate calculation	COMPLETED	2	2026-07-27 22:29:19.540856	Approved	2026-07-27 22:29:01.975638	\N	\N	\N	\N
\.


--
-- Data for Name: calibration_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calibration_records (id, equipment_id, calibration_date, next_due_date, certificate_url, calibrated_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: department_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department_budgets (id, department_id, fiscal_year, budget_amount, description, created_at, updated_at) FROM stdin;
1	1	2026	5000000.00	E2E test budget	2026-07-27 22:12:10.113438	\N
2	2	2026	100000.00		2026-07-28 12:53:52.345835	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, institution_id, department_name, hod_user_id, status, created_at, updated_at) FROM stdin;
3	1	Electronics & Communication	2	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
1	1	Mechanical Engineering	\N	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
2	1	Computer Science	\N	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
4	2	CSE	\N	t	2026-07-23 21:25:12.257151	\N
5	2	IT	\N	t	2026-07-23 21:25:17.646616	\N
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, equipment_code, equipment_name, category_id, laboratory_id, manufacturer, model_number, serial_number, purchase_date, purchase_cost, warranty_expiry, status, qr_code, image_url, max_booking_hours, calibration_due_date, description, assigned_technician_id, created_at, updated_at, hourly_rate, specifications) FROM stdin;
1	CNC-001	CNC Milling Machine	1	1	Haas Automation	VF-2	SN-2024-001	2023-01-15	5000000.00	2026-01-15	AVAILABLE	\N	\N	8	\N	3-axis CNC milling machine for precision machining	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	500.00	\N
2	CNC-002	CNC Lathe	1	1	DMG Mori	CLX 350	SN-2024-002	2023-03-20	3500000.00	2026-03-20	AVAILABLE	\N	\N	8	\N	CNC lathe for turning operations	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	350.00	\N
3	OSC-001	Digital Oscilloscope	3	6	Tektronix	MDO3024	SN-2024-003	2023-06-10	250000.00	2026-06-10	AVAILABLE	\N	/uploads/equipment/equipment_3_99116aa3.webp	6	\N	200MHz 4-channel digital oscilloscope	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	150.00	\N
4	GPU-001	GPU Server	4	4	NVIDIA	DGX A100	SN-2024-004	2024-01-05	15000000.00	2027-01-05	AVAILABLE	\N	/uploads/equipment/equipment_4_0c719029.jpeg	24	\N	High-performance GPU server for AI/ML workloads	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	2000.00	\N
5	3DP-001	3D Printer	1	2	Stratasys	F123	SN-2024-005	2023-09-01	1200000.00	2025-09-01	AVAILABLE	\N	\N	8	\N	Industrial grade 3D printer for rapid prototyping	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	250.00	\N
6	MIC-001	Electron Microscope	5	3	JEOL	JSM-7600F	SN-2024-006	2022-06-15	25000000.00	2025-06-15	UNDER_MAINTENANCE	\N	/uploads/equipment/equipment_6_8f236014.jpeg	4	\N	Field emission scanning electron microscope	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297	1500.00	\N
\.


--
-- Data for Name: equipment_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_categories (id, category_name, description, created_at) FROM stdin;
1	Mechanical	Mechanical engineering equipment including CNC machines, lathes, milling machines	2026-07-22 21:28:54.034297
2	Electrical	Electrical engineering equipment including transformers, motors, generators	2026-07-22 21:28:54.034297
3	Electronics	Electronics equipment including oscilloscopes, signal generators, multimeters	2026-07-22 21:28:54.034297
4	Computer Science	Computing equipment including GPU servers, workstations, networking gear	2026-07-22 21:28:54.034297
5	Biomedical	Biomedical engineering equipment including microscopes, centrifuges	2026-07-22 21:28:54.034297
6	Civil Engineering	Civil engineering equipment including concrete testing, soil testing	2026-07-22 21:28:54.034297
7	Chemical Engineering	Chemical engineering equipment including spectrometers, chromatographs	2026-07-22 21:28:54.034297
8	Physics	Physics lab equipment including lasers, interferometers	2026-07-22 21:28:54.034297
9	Chemistry	Chemistry lab equipment including analytical balances, fume hoods	2026-07-22 21:28:54.034297
10	Biology	Biology lab equipment including PCR machines, incubators	2026-07-22 21:28:54.034297
\.


--
-- Data for Name: equipment_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_documents (id, equipment_id, file_name, document_type, file_url, uploaded_at) FROM stdin;
\.


--
-- Data for Name: equipment_tag_mappings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_tag_mappings (equipment_id, tag_id) FROM stdin;
\.


--
-- Data for Name: equipment_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_tags (id, tag_name, created_at) FROM stdin;
1	CNC	2026-07-28 11:37:35.810169
2	5-Axis	2026-07-28 11:37:35.810169
3	Precision	2026-07-28 11:37:35.810169
4	High-Power	2026-07-28 11:37:35.810169
5	Digital	2026-07-28 11:37:35.810169
6	Analog	2026-07-28 11:37:35.810169
7	Portable	2026-07-28 11:37:35.810169
8	Desktop	2026-07-28 11:37:35.810169
9	Industrial	2026-07-28 11:37:35.810169
10	Research-Grade	2026-07-28 11:37:35.810169
11	Automated	2026-07-28 11:37:35.810169
12	Manual	2026-07-28 11:37:35.810169
13	IoT-Enabled	2026-07-28 11:37:35.810169
14	Networked	2026-07-28 11:37:35.810169
15	Standalone	2026-07-28 11:37:35.810169
\.


--
-- Data for Name: external_booking_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_booking_requests (id, shared_equipment_id, requesting_institution_id, requested_by, booking_date, start_time, end_time, purpose, status, approved_by, created_at) FROM stdin;
1	1	2	1	2026-07-27	09:06:00	13:06:00		APPROVED	1	2026-07-26 13:06:11.91725
2	1	2	8	2026-07-27	14:19:00	15:19:00		PENDING	\N	2026-07-26 14:19:23.299624
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init schema	SQL	V1__init_schema.sql	2086206240	postgres	2026-07-26 14:53:18.627701	191	t
2	2	seed data	SQL	V2__seed_data.sql	616683128	postgres	2026-07-26 14:53:18.903281	21	t
3	3	add maintenance work order	SQL	V3__add_maintenance_work_order.sql	1365367665	postgres	2026-07-26 14:53:18.9425	11	t
4	4	seed missing roles	SQL	V4__seed_missing_roles.sql	1949511901	postgres	2026-07-26 14:53:18.963241	2	t
5	5	add role config	SQL	V5__add_role_config.sql	-951647849	postgres	2026-07-26 14:53:18.978595	14	t
6	6	add announcements	SQL	V6__add_announcements.sql	1993695311	postgres	2026-07-26 14:53:19.00935	24	t
7	7	add notification preferences	SQL	V7__add_notification_preferences.sql	217725740	postgres	2026-07-26 14:53:19.041009	10	t
8	8	add sms push notification channels	SQL	V8__add_sms_push_notification_channels.sql	1920225571	postgres	2026-07-26 14:53:19.060481	5	t
9	9	add missing maintenance columns	SQL	V9__add_missing_maintenance_columns.sql	-1199172459	postgres	2026-07-26 14:53:19.079915	4	t
10	10	add department budgets	SQL	V10__add_department_budgets.sql	-508722469	postgres	2026-07-27 22:11:01.66486	74	t
11	11	add hourly rate to equipment	SQL	V11__add_hourly_rate_to_equipment.sql	1406362498	postgres	2026-07-27 22:26:35.081035	367	t
12	12	add specs tags recurring reports retry	SQL	V12__add_specs_tags_recurring_reports_retry.sql	1286226865	postgres	2026-07-28 11:37:35.77717	105	t
\.


--
-- Data for Name: institution_partnerships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institution_partnerships (id, institution_a_id, institution_b_id, agreement_start, agreement_end, status, created_at) FROM stdin;
5	1	2	2026-07-26	2026-07-27	ACTIVE	2026-07-26 14:18:53.611213
\.


--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institutions (id, institution_code, institution_name, email, phone, website, address, city, state, country, pincode, logo_url, status, created_at, updated_at) FROM stdin;
1	DEMO001	Demo University	admin@demouniversity.edu	+91-1234567890	https://demouniversity.edu	\N	Bangalore	Karnataka	India	\N	\N	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
2	SIMATS	SIMATS Engineering	simats.sse@saveetha.com		\N		Chennai	Tamil Nadu		\N	\N	t	2026-07-23 15:24:34.172598	\N
3	CUSTOM-41403	SEC	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-07-27 20:50:41.441228	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, institution_id, booking_id, total_amount, tax_amount, payment_status, due_date, generated_at) FROM stdin;
1	INV-2026-000001	1	\N	50000.00	14.00	PAID	2026-07-27	2026-07-27 22:02:42.934087
2	INV-2026-000002	1	13	10000000.00	0.00	PAID	2026-08-26	2026-07-27 22:18:37.070608
3	INV-2026-000003	1	14	4000.00	0.00	PENDING	2026-08-26	2026-07-27 22:29:19.682565
\.


--
-- Data for Name: laboratories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laboratories (id, department_id, laboratory_name, lab_manager_id, location, status, created_at, updated_at) FROM stdin;
1	1	CNC Machining Lab	\N	Block A, Room 101	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
2	1	Manufacturing Lab	\N	Block A, Room 102	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
3	2	Programming Lab	\N	Block B, Room 201	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
4	2	High Performance Computing Lab	\N	Block B, Room 202	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
5	3	VLSI Design Lab	\N	Block C, Room 301	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
6	3	Signal Processing Lab	\N	Block C, Room 302	t	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
\.


--
-- Data for Name: maintenance_work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_work_orders (id, equipment_id, maintenance_type, priority, assigned_to, created_by, status, description, scheduled_date, completion_date, downtime_hours, total_cost, remarks, created_at, updated_at, labor_hours, parts_used) FROM stdin;
11	5	PREVENTIVE	MEDIUM	\N	1	COMPLETED		\N	2026-07-22	\N	\N	\N	2026-07-22 23:52:34.702644	2026-07-22 23:52:52.072668	\N	\N
13	1	PREVENTIVE	MEDIUM	\N	1	COMPLETED		\N	2026-07-22	\N	\N	\N	2026-07-22 23:58:15.215229	2026-07-22 23:58:54.545688	\N	\N
15	1	PREVENTIVE	MEDIUM	\N	1	COMPLETED		\N	2026-07-23	\N	\N	\N	2026-07-23 00:20:03.222925	2026-07-23 15:01:48.639972	\N	\N
17	6	PREVENTIVE	MEDIUM	\N	1	CREATED		2026-07-24	\N	\N	\N	\N	2026-07-24 19:15:07.823924	\N	\N	\N
16	2	PREVENTIVE	MEDIUM	\N	1	COMPLETED		\N	2026-07-24	\N	\N	\N	2026-07-23 00:20:14.225579	2026-07-24 19:15:58.129826	\N	\N
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, user_id, notification_type, email_enabled, in_app_enabled, created_at, updated_at, sms_enabled, push_enabled) FROM stdin;
1	2	BOOKING_CREATED	t	t	2026-07-24 14:22:00.801459	2026-07-24 14:22:00.803467	f	t
2	2	BOOKING_APPROVED	t	t	2026-07-24 14:22:00.813797	2026-07-24 14:22:00.813797	f	t
3	2	BOOKING_REJECTED	t	t	2026-07-24 14:22:00.819289	2026-07-24 14:22:00.819289	f	t
4	2	BOOKING_CANCELLED	t	t	2026-07-24 14:22:00.819798	2026-07-24 14:22:00.819798	f	t
5	2	BOOKING_REMINDER	t	t	2026-07-24 14:22:00.826991	2026-07-24 14:22:00.826991	f	t
6	2	MAINTENANCE_SCHEDULED	t	t	2026-07-24 14:22:00.840201	2026-07-24 14:22:00.840201	f	t
7	2	MAINTENANCE_COMPLETED	t	t	2026-07-24 14:22:00.843965	2026-07-24 14:22:00.843965	f	t
8	2	CALIBRATION_DUE	t	t	2026-07-24 14:22:00.846344	2026-07-24 14:22:00.846344	f	t
9	2	EQUIPMENT_AVAILABLE	t	t	2026-07-24 14:22:00.85203	2026-07-24 14:22:00.85203	f	t
10	2	WAITLIST_PROMOTED	t	t	2026-07-24 14:22:00.855228	2026-07-24 14:22:00.855228	f	t
11	2	PARTNERSHIP_INVITATION	t	t	2026-07-24 14:22:00.8602	2026-07-24 14:22:00.8602	f	t
12	2	ANNOUNCEMENT	t	t	2026-07-24 14:22:00.8602	2026-07-24 14:22:00.8602	f	t
13	2	PASSWORD_RESET	t	t	2026-07-24 14:22:00.8602	2026-07-24 14:22:00.8602	f	t
14	2	GENERAL	t	t	2026-07-24 14:22:00.8602	2026-07-24 14:22:00.8602	f	t
15	1	BOOKING_CREATED	t	t	2026-07-28 12:56:21.504608	2026-07-28 12:56:21.504608	f	t
16	1	BOOKING_APPROVED	t	t	2026-07-28 12:56:21.512708	2026-07-28 12:56:21.512708	f	t
17	1	BOOKING_REJECTED	t	t	2026-07-28 12:56:21.519974	2026-07-28 12:56:21.519974	f	t
18	1	BOOKING_CANCELLED	t	t	2026-07-28 12:56:21.519974	2026-07-28 12:56:21.519974	f	t
19	1	BOOKING_REMINDER	t	t	2026-07-28 12:56:21.53004	2026-07-28 12:56:21.53004	f	t
20	1	MAINTENANCE_SCHEDULED	t	t	2026-07-28 12:56:21.5329	2026-07-28 12:56:21.5329	f	t
21	1	MAINTENANCE_COMPLETED	t	t	2026-07-28 12:56:21.536548	2026-07-28 12:56:21.536548	f	t
22	1	CALIBRATION_DUE	t	t	2026-07-28 12:56:21.536548	2026-07-28 12:56:21.536548	f	t
23	1	EQUIPMENT_AVAILABLE	t	t	2026-07-28 12:56:21.536548	2026-07-28 12:56:21.536548	f	t
24	1	WAITLIST_PROMOTED	t	t	2026-07-28 12:56:21.546583	2026-07-28 12:56:21.546583	f	t
25	1	PARTNERSHIP_INVITATION	t	t	2026-07-28 12:56:21.546583	2026-07-28 12:56:21.546583	f	t
26	1	ANNOUNCEMENT	t	t	2026-07-28 12:56:21.551392	2026-07-28 12:56:21.551392	f	t
27	1	PASSWORD_RESET	t	t	2026-07-28 12:56:21.554847	2026-07-28 12:56:21.554847	f	t
28	1	GENERAL	t	t	2026-07-28 12:56:21.554847	2026-07-28 12:56:21.554847	f	t
\.


--
-- Data for Name: notification_retry_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_retry_queue (id, notification_id, channel, retry_count, max_retries, next_retry_at, status, last_error, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, notification_type, priority, status, read_at, created_at) FROM stdin;
1	1	Work Order Completed	Work order #1 for CNC Milling Machine has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:45:40.523117	2026-07-22 23:40:15.940818
2	1	Work Order Completed	Work order #3 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:45:40.523117	2026-07-22 23:40:49.008498
3	1	Work Order Completed	Work order #2 for CNC Milling Machine has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:45:40.523117	2026-07-22 23:40:57.840307
4	1	Work Order Completed	Work order #4 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:45:40.523117	2026-07-22 23:44:50.939157
5	1	Work Order Completed	Work order #6 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:41.699515
6	1	Work Order Completed	Work order #7 for Electron Microscope has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:42.643143
8	1	Work Order Completed	Work order #5 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:47.937979
9	1	Work Order Completed	Work order #8 for Electron Microscope has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:49.086884
10	1	Work Order Completed	Work order #10 for CNC Lathe has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:50.947309
11	1	Work Order Completed	Work order #11 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-22 23:53:32.634096	2026-07-22 23:52:52.072667
12	1	Work Order Completed	Work order #13 for CNC Milling Machine has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-23 00:18:29.621102	2026-07-22 23:58:54.504119
13	1	Work Order Completed	Work order #13 for CNC Milling Machine has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-23 00:18:29.621102	2026-07-22 23:58:54.547706
7	2	Work Order Completed	Work order #9 for 3D Printer has been completed.	MAINTENANCE_COMPLETED	MEDIUM	READ	2026-07-23 00:22:34.507394	2026-07-22 23:52:45.575863
14	2	New Booking Request	Sneha Patel has requested to book Digital Oscilloscope on 2026-07-22	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 00:24:53.023708
16	2	New Booking Request	Arun Kumar has requested to book Digital Oscilloscope on 2026-07-23	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 15:14:28.902739
17	2	New Booking Request	Arun Kumar has requested to book 3D Printer on 2026-07-23	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 15:14:39.344844
18	5	Booking Approved	Your booking for Digital Oscilloscope on 2026-07-22 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-23 15:22:49.705928
19	4	Booking Rejected	Your booking for Digital Oscilloscope on 2026-07-23 has been rejected. Reason: Rejected	BOOKING_REJECTED	HIGH	UNREAD	\N	2026-07-23 15:27:01.022718
20	2	New Booking Request	Priya Sharma has requested to book Electron Microscope on 2026-07-23	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 16:14:13.522743
21	2	New Booking Request	Arun Kumar has requested to book GPU Server on 2026-07-23	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 16:25:12.930617
22	2	New Booking Request	Arun Kumar has requested to book Electron Microscope on 2026-07-23	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 16:29:06.761178
23	2	New Booking Request	Arun Kumar has requested to book CNC Milling Machine on 2026-07-25	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 16:37:34.555469
24	2	New Booking Request	Arun Kumar has requested to book Digital Oscilloscope on 2026-07-24	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 16:38:56.863686
25	4	Booking Approved	Your booking for 3D Printer on 2026-07-23 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-23 17:06:54.292381
26	4	Booking Approved	Your booking for GPU Server on 2026-07-23 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-23 17:10:03.257497
27	2	New Booking Request	Selvakumar K has requested to book Digital Oscilloscope on 2026-07-24	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-23 20:07:29.840946
28	6	Booking Approved	Your booking for Digital Oscilloscope on 2026-07-24 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-23 20:28:28.524309
29	2	New Booking Request	Arun Kumar has requested to book Digital Oscilloscope on 2026-07-25	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-24 11:19:42.976836
30	2	New Booking Request	Arun Kumar has requested to book Electron Microscope on 2026-07-24	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-24 15:16:31.418661
31	2	Booking Approved	Your booking for Electron Microscope on 2026-07-23 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-24 15:18:05.353666
32	1	Work Order Completed	Work order #16 for CNC Lathe has been completed.	MAINTENANCE_COMPLETED	MEDIUM	UNREAD	\N	2026-07-24 19:15:58.143354
33	4	Booking Approved	Your booking for Electron Microscope on 2026-07-23 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-24 19:16:56.879201
34	2	New Booking Request	Arun Kumar has requested to book 3D Printer on 2026-07-25	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-24 19:21:12.432649
35	2	New Booking Request	Arun Kumar has requested to book CNC Milling Machine on 2026-07-28	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-27 22:14:06.12361
36	4	Booking Approved	Your booking for CNC Milling Machine on 2026-07-28 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-27 22:14:32.365494
37	4	Booking Completed	Your booking for CNC Milling Machine on 2026-07-28 has been marked as completed.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-27 22:18:37.152094
38	2	New Booking Request	Arun Kumar has requested to book GPU Server on 2026-07-29	BOOKING_CREATED	MEDIUM	UNREAD	\N	2026-07-27 22:29:02.012722
39	4	Booking Approved	Your booking for GPU Server on 2026-07-29 has been approved.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-27 22:29:19.549329
40	4	Booking Completed	Your booking for GPU Server on 2026-07-29 has been marked as completed.	BOOKING_APPROVED	MEDIUM	UNREAD	\N	2026-07-27 22:29:19.707665
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expiry, used) FROM stdin;
1	6	e6bc7b6a-0ad7-4437-a7d7-4687212942df	2026-07-23 21:30:47.949036	f
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, invoice_id, payment_reference, amount_paid, payment_method, payment_date, payment_status, created_at) FROM stdin;
1	1	PAY-20260727-XDC2	50014.00	BANK_TRANSFER	2026-07-27 22:02:52.74788	PAID	2026-07-27 22:02:52.75609
2	2	MOCK-TXN-001	10000000.00	CREDIT_CARD	2026-07-27 22:20:00	PAID	2026-07-27 22:21:58.539966
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expiry_date, revoked) FROM stdin;
1	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzU5NTMsImV4cCI6MTc4NTM0MDc1MywidHlwZSI6InJlZnJlc2gifQ.wAovpC6U-jL20mpVk6rI7XilhkCE0gy7-88TZ8aWgSIfyo-8qaVbdIj6wWcFIg6L	2026-07-29 21:29:13.204772	f
2	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYwMDEsImV4cCI6MTc4NTM0MDgwMSwidHlwZSI6InJlZnJlc2gifQ.FbrBQb52pvDtdLSrGYX9fcqdMgFne_oY1zsN0ph6dp9Toyhb6BVqHm8_Gt75PkaK	2026-07-29 21:30:01.551509	f
3	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYyMzksImV4cCI6MTc4NTM0MTAzOSwidHlwZSI6InJlZnJlc2gifQ.JCsGFqgQIZOzaE6nlHT-i1RyjIbiWGRvovtxI1ciEmd-QcP1TdJyNMgUcFW9H2gv	2026-07-29 21:33:59.476111	f
4	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYyNzIsImV4cCI6MTc4NTM0MTA3MiwidHlwZSI6InJlZnJlc2gifQ.t_29t3Wsm6TgHorPCES3O_xEfix3JZJwty-YZNPdNPQz_tKjB9Wa4EXh_r2fC7kb	2026-07-29 21:34:32.111387	f
5	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYyOTAsImV4cCI6MTc4NTM0MTA5MCwidHlwZSI6InJlZnJlc2gifQ.37ILxvV194mSV9dF2JKycUJvrfSFpXTvYkdurw9CZ6M7ZQoWDQi217WQJ9FtMf82	2026-07-29 21:34:50.677877	f
6	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYzMjksImV4cCI6MTc4NTM0MTEyOSwidHlwZSI6InJlZnJlc2gifQ.S4xax5Iu_hs1H1uh1RQD99heu3Asjkfn09sLzjO3N8cEmfKYTw_6NgILvTjG0OUM	2026-07-29 21:35:29.643778	f
7	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzYzNDMsImV4cCI6MTc4NTM0MTE0MywidHlwZSI6InJlZnJlc2gifQ.eEjAw-QIDfWx_OkA31CQVfDPD3z17ZOGbvI-gWJJKT_LZaPlCNlO3oGAuH6CErLW	2026-07-29 21:35:43.406374	f
8	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzY2MzIsImV4cCI6MTc4NTM0MTQzMiwidHlwZSI6InJlZnJlc2gifQ.dPyu6qHw1I7rk6RCpupl_YOWizbc62GKe-JdlWgyhZ3JE9ElRI24PWq4WvOXEMLo	2026-07-29 21:40:32.78881	f
9	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzcwNTksImV4cCI6MTc4NTM0MTg1OSwidHlwZSI6InJlZnJlc2gifQ.6umy3p2wMBbft2e139F5XvKNYgzbEKIjUNIPfyxKs6gDw20qA9TdqcgKlvezOeSb	2026-07-29 21:47:39.54858	f
10	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzkwMDAsImV4cCI6MTc4NTM0MzgwMCwidHlwZSI6InJlZnJlc2gifQ.ndKu64xx9Iosi4n0tcp8uFIBVVi-79MBnqmfsnmCxT3klOsldXMMgPlJHifynNAC	2026-07-29 22:20:00.603895	f
11	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzkxODgsImV4cCI6MTc4NTM0Mzk4OCwidHlwZSI6InJlZnJlc2gifQ.7z89BdbkALhuiCF2gIGKFDferj8WQKsyOBHZ5sVZk83NwGI0HW1M1oGGUup5XsL3	2026-07-29 22:23:08.041343	f
12	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzkyMDEsImV4cCI6MTc4NTM0NDAwMSwidHlwZSI6InJlZnJlc2gifQ.k7b3E0OhpkO2okwcR7hkAmPnzoRcPJPFY1p1Cy2lZminJSQCG0DWlTfTNOrS2ITo	2026-07-29 22:23:21.529277	f
13	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3MzkyMjMsImV4cCI6MTc4NTM0NDAyMywidHlwZSI6InJlZnJlc2gifQ.a312dYGMjXWH5ySa6RzYv4MEYA6S163-KjF3kNvx17OnBc9L97t1gammjob8_nkj	2026-07-29 22:23:43.725108	f
14	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDE0NzAsImV4cCI6MTc4NTM0NjI3MCwidHlwZSI6InJlZnJlc2gifQ.IHrD3zUbTRp-V4sUQF6oUezWxeS7fOTSprEHtJN0djr0h3Ecrn9Is3yH-oHyM5EL	2026-07-29 23:01:10.330994	f
15	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU0MDAsImV4cCI6MTc4NTM1MDIwMCwidHlwZSI6InJlZnJlc2gifQ.bGAMF8GPgCkNtz6XNISY3DDpWc5XLB8k46knl4cliJbG0pdSxqkThu3N6oP8eXvE	2026-07-30 00:06:40.428211	f
16	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU1OTcsImV4cCI6MTc4NTM1MDM5NywidHlwZSI6InJlZnJlc2gifQ.jMXIlF0MVl62IMsnfmQBqUNlztZupJSevQutGFuvuar3R_7Kge4LgwEne1IA-M6U	2026-07-30 00:09:57.38671	f
17	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU2MDQsImV4cCI6MTc4NTM1MDQwNCwidHlwZSI6InJlZnJlc2gifQ.PyuWmg0nsEjMw3Uponw2gHs9jYZvKezZFJisLf97SVJXxQWnXIIEhEobCC5-pIFO	2026-07-30 00:10:04.695445	f
18	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU2MTUsImV4cCI6MTc4NTM1MDQxNSwidHlwZSI6InJlZnJlc2gifQ.GqJrfeMvUrX99sC8X3VnQTRa4_bh8tzbixuU2MVAG0EnkhTs8XLdYTAIONXP68vK	2026-07-30 00:10:15.382988	f
19	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU2MjIsImV4cCI6MTc4NTM1MDQyMiwidHlwZSI6InJlZnJlc2gifQ.twIruh9hbDvqKt_I6ihHYgwrsxZdp7pybw-53m7Kx1H2hu3Isuea2yc2QBZ3jaz0	2026-07-30 00:10:22.975805	f
20	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU2MzEsImV4cCI6MTc4NTM1MDQzMSwidHlwZSI6InJlZnJlc2gifQ.rgJg3w-HuKk4pl9JzlajnK1JSL2kO91s8oASHejOawUGmj6BuQe77U90KJgK7cWV	2026-07-30 00:10:31.635974	f
21	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU2NDEsImV4cCI6MTc4NTM1MDQ0MSwidHlwZSI6InJlZnJlc2gifQ.VSGiw2UwhFWlvQmI9MvgjFDeah4FXfH3ACwDI5GjuVQD-bVi6hyAUIgLhyKmTSrr	2026-07-30 00:10:41.28603	f
22	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU5NjIsImV4cCI6MTc4NTM1MDc2MiwidHlwZSI6InJlZnJlc2gifQ.oG6K-PUoYBM6twpNh2VdWoPSCvGiEQocVfRuv1JCttejjPHiKfVWGuxrQhPhJJB0	2026-07-30 00:16:02.171899	f
23	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU5NzAsImV4cCI6MTc4NTM1MDc3MCwidHlwZSI6InJlZnJlc2gifQ.Mi6LN1YKxjKMRhKRiJKij_8SbSLwgLeA9mjYuiIC7URYL2dRo5p5w7RG-nQvM7R4	2026-07-30 00:16:10.287635	f
24	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDU5NzgsImV4cCI6MTc4NTM1MDc3OCwidHlwZSI6InJlZnJlc2gifQ.Kgzaqmblnb7nd2f5YzOBdOiLsUcYo3M5kKL8X3C6JnNE6ShlVMQTtP6VInw8Tf3F	2026-07-30 00:16:18.941661	f
25	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDYwNjEsImV4cCI6MTc4NTM1MDg2MSwidHlwZSI6InJlZnJlc2gifQ.tCgkZgTI8XCVMzYdPPGsYVSYoRZi8uKkrwZR_h8N8WPtRdu-hgMfjfVOjFAdI97k	2026-07-30 00:17:41.624752	f
26	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDYzNDEsImV4cCI6MTc4NTM1MTE0MSwidHlwZSI6InJlZnJlc2gifQ.DdaRse3MKOp4J6VSHKoL54-hnMZS8GfAZINZ-cQ-l4HE3HUsJDC-g8MAuOu_7BoE	2026-07-30 00:22:21.05624	f
27	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDYzNzYsImV4cCI6MTc4NTM1MTE3NiwidHlwZSI6InJlZnJlc2gifQ.5v4waVlC6Q6lw5xPdS6HWW_rc74JpTVZWZ740OLgJJPnvVJ_MZ_0MMmO-Hc_gKNZ	2026-07-30 00:22:56.822197	f
28	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0NzQ2Mzk1LCJleHAiOjE3ODUzNTExOTUsInR5cGUiOiJyZWZyZXNoIn0.pG1mw91feLM3l2biqbv1WqHHXXlYC9SUn7hZPtkCZAGJXlBSPIAlj6h5yhtTJ5bp	2026-07-30 00:23:16.014838	f
29	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDc0NjQzNSwiZXhwIjoxNzg1MzUxMjM1LCJ0eXBlIjoicmVmcmVzaCJ9.QlPU_jMac1Y28kr_PI2T_A94AJMkWi-Eovv1fOUrGtNUy0eT1J8-aHqTEF2oh0TG	2026-07-30 00:23:55.748692	f
30	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDY0ODIsImV4cCI6MTc4NTM1MTI4MiwidHlwZSI6InJlZnJlc2gifQ.n0Mb2gki2i44MnzKlVc0byHgW38iuw8HX21GsI99QbBXexvS8QXokgzJDtlAjkJj	2026-07-30 00:24:42.154569	f
31	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3NDY1MjcsImV4cCI6MTc4NTM1MTMyNywidHlwZSI6InJlZnJlc2gifQ.bf6crHlBBSKzSIMdQP0VYijlWoMZpVzQBcOE7fuAH9-WxzeBb-e3Tc4XtXjDLB2I	2026-07-30 00:25:27.454037	f
32	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTc4MDgsImV4cCI6MTc4NTQwMjYwOCwidHlwZSI6InJlZnJlc2gifQ.84zJMgm24mjE1xc7GZDjC4kEJKIDjgjZX0JFlIx4sTtUWKEGTVG5qQDyTVFQUdXM	2026-07-30 14:40:08.383133	f
33	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTc5MTUsImV4cCI6MTc4NTQwMjcxNSwidHlwZSI6InJlZnJlc2gifQ.QaI87lKxcCbhWOMnkNdZzEf0QhorBkbCn4qZskah34owtFjSUp-pIlW4EvTxssSq	2026-07-30 14:41:55.446713	f
34	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgxMDcsImV4cCI6MTc4NTQwMjkwNywidHlwZSI6InJlZnJlc2gifQ.5IqjcfnK56qPG6g5qOnyjeJC70MUYjYBi-nOSkarzvvvCcogc2xC6D2cJ4DkypBV	2026-07-30 14:45:07.067903	f
35	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgxMDksImV4cCI6MTc4NTQwMjkwOSwidHlwZSI6InJlZnJlc2gifQ.-mTEXKOZEm4xLFB1WmqZ7eC3Za9tStMBEp4KFjU8KzLsXluVl0OBPmsF8jOAqFU8	2026-07-30 14:45:09.018415	f
36	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgxMTIsImV4cCI6MTc4NTQwMjkxMiwidHlwZSI6InJlZnJlc2gifQ.3GpcvfgfC68pO3F5hXP159vfN5Vt2qCJ2QwckjhI2kuUsUCvfmugf6TopYxWAmC3	2026-07-30 14:45:12.585069	f
37	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgxMjYsImV4cCI6MTc4NTQwMjkyNiwidHlwZSI6InJlZnJlc2gifQ.yoFgW2jlE_BI8GF7kYhegxyx810cGfRLLyd1KXjLtaYeTcvWdrJ84BxIAAigYLOe	2026-07-30 14:45:26.334794	f
38	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgxNjMsImV4cCI6MTc4NTQwMjk2MywidHlwZSI6InJlZnJlc2gifQ.oyX2d2uxQple7b23a5Zt7AdX3n9dp0UF7C9qZ2jlb2tPSgZZw6wbgB-o6efM4l4h	2026-07-30 14:46:03.259219	f
39	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTgzNDcsImV4cCI6MTc4NTQwMzE0NywidHlwZSI6InJlZnJlc2gifQ.sk2wRnI0LGScUExQb-QZ0ESndN_DbfG3d9JPW2f8ScgrXOYfkmPpU0X9v6ENjNA_	2026-07-30 14:49:07.102071	f
40	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk3MTgsImV4cCI6MTc4NTQwNDUxOCwidHlwZSI6InJlZnJlc2gifQ.gYN9TF8hEEenbaXcr9aRJ2Uwe4LzzxhimxOmZcYX6CkhuNvy3pr5f-AYwY3zjuDq	2026-07-30 15:11:58.873849	f
41	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk3MjUsImV4cCI6MTc4NTQwNDUyNSwidHlwZSI6InJlZnJlc2gifQ.mn8eEYXRnH1kx0M_YI-BoHGa3J6XNBBfr6bTbGF0EC-LIZumacYLHvA3n0v3SG1K	2026-07-30 15:12:05.334005	f
42	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk3MzcsImV4cCI6MTc4NTQwNDUzNywidHlwZSI6InJlZnJlc2gifQ.xRxWgzCfmv68wN6VcHwEsKyejHSlcwgxpmuHwRRnrTTFzGnXCzCnw87tcBWz0w8R	2026-07-30 15:12:17.023006	f
43	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDc5OTgwMSwiZXhwIjoxNzg1NDA0NjAxLCJ0eXBlIjoicmVmcmVzaCJ9.UlL6VoCWXtIxhj_Gdu0s5ZhPisadjtFtt8lQBQOzkFunFu_khEeL6QUe8SVXRzse	2026-07-30 15:13:21.67527	f
44	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk5MDQsImV4cCI6MTc4NTQwNDcwNCwidHlwZSI6InJlZnJlc2gifQ.nszIhGXxmCECaj0JXLW8j3utlFX_khOVLka1wIiUlZcZ23Q84YLaOSumyCSZJr5C	2026-07-30 15:15:04.479245	f
45	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk5MzQsImV4cCI6MTc4NTQwNDczNCwidHlwZSI6InJlZnJlc2gifQ.TL8wftmicQ4w9Op6uJJ6Qg15ayfi3DQx0lwEQfUuwwUxGo42DN4-qO5fswojgTfM	2026-07-30 15:15:34.629583	f
46	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ3OTk5NTEsImV4cCI6MTc4NTQwNDc1MSwidHlwZSI6InJlZnJlc2gifQ.3nETRPnrjvFaLX5jE8NSd8NJM8DTe22tliH0qYjNEzJM4OUb3tMVG37-IYmt-0D5	2026-07-30 15:15:51.769069	f
47	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDA2NzMsImV4cCI6MTc4NTQwNTQ3MywidHlwZSI6InJlZnJlc2gifQ.zyrq6JrTEYDRSIA5eYaLPVYz62s61_fs9fClWFbTckrC_iLVa6g4fBD5vlSxD1u5	2026-07-30 15:27:53.171059	f
48	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwMTk0MSwiZXhwIjoxNzg1NDA2NzQxLCJ0eXBlIjoicmVmcmVzaCJ9.bVzaUZSyyDMli2xfNTWhL1c8w_Ou7SOezb_rrqp-oMFVUtI_JL43M48BrhMMfBVC	2026-07-30 15:49:01.550559	f
49	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDMzNjEsImV4cCI6MTc4NTQwODE2MSwidHlwZSI6InJlZnJlc2gifQ.vlGNaEXcJcAB_uUmn8kNmWZ6-JKBUIlHImxqxPYYufu9ZLahKlZDnti7PVu4ymAF	2026-07-30 16:12:41.150336	f
50	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwMzQwNSwiZXhwIjoxNzg1NDA4MjA1LCJ0eXBlIjoicmVmcmVzaCJ9.ypuKEt07x03VQmfWoVatHNZIS0PckFcEPLwJSRJFxscFAjOJs7WXQSZwUig3WYeJ	2026-07-30 16:13:25.710479	f
51	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDM0NDEsImV4cCI6MTc4NTQwODI0MSwidHlwZSI6InJlZnJlc2gifQ.iU0jvN4jhevVKYKulbiuFf5ue2GwEwhgLrqKtvGorw-lbSzPaf6ORpsk_MMUhakg	2026-07-30 16:14:01.931425	f
52	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDM2NjAsImV4cCI6MTc4NTQwODQ2MCwidHlwZSI6InJlZnJlc2gifQ.QZ6IxjFWgB7KpD2YTqAYVuyn3PWKVv3OwjT5_0j7MwoYUi79PfShNaoqw2yaB-fa	2026-07-30 16:17:40.669639	f
53	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNDAxMSwiZXhwIjoxNzg1NDA4ODExLCJ0eXBlIjoicmVmcmVzaCJ9.5bixzd_SuE0nJgw4AzcNdg7uXrkcfdtARsE43Dj4MMr2gRvwMn3Z0XY5E9rirWtD	2026-07-30 16:23:31.98388	f
54	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNDA3MCwiZXhwIjoxNzg1NDA4ODcwLCJ0eXBlIjoicmVmcmVzaCJ9.jjKQ0WRFXyh6fmfQvqjwYWENqs_RPK--bF9kSVNDNqMXuI_Vh_klNbkpQhSgeVRT	2026-07-30 16:24:30.855981	f
55	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDQxNzksImV4cCI6MTc4NTQwODk3OSwidHlwZSI6InJlZnJlc2gifQ.msyd0Eplut_ZkOm1tjsdw0OmmpHMB_vx4HdDHIEdbvxcIqfZgMSVCll5MH7HE7xW	2026-07-30 16:26:19.189864	f
56	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDQxOTEsImV4cCI6MTc4NTQwODk5MSwidHlwZSI6InJlZnJlc2gifQ.UzFgBpPbXTzl4UhYX7KvKPiyB0sETUfP7GDMV4Xue2e9JpiNZ_ezRGW3-1Ry7CRh	2026-07-30 16:26:31.161214	f
57	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNDIyNywiZXhwIjoxNzg1NDA5MDI3LCJ0eXBlIjoicmVmcmVzaCJ9.XO_9yh_3i0sb-k70QCPWkryw9_aSbMi1xwbySP3lAGKZ-leh_XTBl_h-a_Rm4dB1	2026-07-30 16:27:07.989037	f
58	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNDg1MywiZXhwIjoxNzg1NDA5NjUzLCJ0eXBlIjoicmVmcmVzaCJ9.X4OSC0nAUHGg_QOjx1TM2Gb-h-qfDoU3tCuIqyBGilN-FraGWr3SsSw6wJ_8MVxJ	2026-07-30 16:37:33.675475	f
59	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDUwMjQsImV4cCI6MTc4NTQwOTgyNCwidHlwZSI6InJlZnJlc2gifQ.G4YEKwldOv__JhilCrj0YqvCdRuYEOmfrHLTUsLioAHQWDgRhQgFoVOtUdgTQrfU	2026-07-30 16:40:24.637168	f
60	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDUwMzAsImV4cCI6MTc4NTQwOTgzMCwidHlwZSI6InJlZnJlc2gifQ.fGL8YEcpkeGEXqeE9aa02XRufQXvEQNoD6ngOfvyo9yxt7Tef-9dKM-xAQ6hW8EP	2026-07-30 16:40:30.921627	f
61	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODA1MDQxLCJleHAiOjE3ODU0MDk4NDEsInR5cGUiOiJyZWZyZXNoIn0.vt0PgvIxPUPjezUx66uKUL2B74pnlMA65ffi_xsdjknWVbyLMikiF1rb6MRGOWde	2026-07-30 16:40:41.005957	f
62	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDUwNDgsImV4cCI6MTc4NTQwOTg0OCwidHlwZSI6InJlZnJlc2gifQ.fMhoZmJcjGPzlJvFNXaPsgfg8trcPavbgS-XAgRN-OYpSrCMvxyKB_4pM7pgqU7q	2026-07-30 16:40:48.651902	f
63	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDUwOTUsImV4cCI6MTc4NTQwOTg5NSwidHlwZSI6InJlZnJlc2gifQ.fZlCJqv3qzDMWWTjxFrCQAqe_EI-xQBcbzXW1AkvJP_6Deecuw1Iep3pX5y8MzdC	2026-07-30 16:41:35.932222	f
64	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDU0MTIsImV4cCI6MTc4NTQxMDIxMiwidHlwZSI6InJlZnJlc2gifQ.4XX01r6pkupQJl8uKMHgX51sZiSehRlXyxCGah_xWkvFWrG8PgBzbmQayovmYDXm	2026-07-30 16:46:52.858877	f
65	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDU0MjUsImV4cCI6MTc4NTQxMDIyNSwidHlwZSI6InJlZnJlc2gifQ.KSQ0e82VR9Ohb0yC8hx9GQyqY5Nsx-4UAfLhKuYFqj9YX3j4VZj6g0-JdczhXU6A	2026-07-30 16:47:05.886064	f
66	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDU0MjcsImV4cCI6MTc4NTQxMDIyNywidHlwZSI6InJlZnJlc2gifQ.UW_UQ0la8BlnDFDwYE1ihdOkLqrLDo3fM6dwHnzStmm9LVfJ1OTbXJwpyV4156b2	2026-07-30 16:47:07.707625	f
67	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDU0NTMsImV4cCI6MTc4NTQxMDI1MywidHlwZSI6InJlZnJlc2gifQ.ANrtZ5Ue5f6r_AGbwM6ytL2mmuybD11zO4MpW8K2AO0z4hCh4RsWMgy3q7-Wuo5z	2026-07-30 16:47:33.280863	f
68	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDU1ODUsImV4cCI6MTc4NTQxMDM4NSwidHlwZSI6InJlZnJlc2gifQ.873Z4S-BLXOinYR4t7WhNaNJcBxtZQTLdlQHv6uZqqbAjqMSipM_Tqq7zwkzmHKW	2026-07-30 16:49:45.853101	f
69	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDYxNDYsImV4cCI6MTc4NTQxMDk0NiwidHlwZSI6InJlZnJlc2gifQ.hx2SAxksMukepyNGuRBe5UHQ9rkpeGcaDLAvFSclQsFuU6OaqSiEvDmCMUurOn2w	2026-07-30 16:59:06.578895	f
70	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNjE1MiwiZXhwIjoxNzg1NDEwOTUyLCJ0eXBlIjoicmVmcmVzaCJ9.cjk3SzfbPi1G83Wpl4btbqZ5pFAS9CVz7N_--e13wYCdXgVnSPCUEt9ePx_vfuXc	2026-07-30 16:59:12.567663	f
71	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDYyMTksImV4cCI6MTc4NTQxMTAxOSwidHlwZSI6InJlZnJlc2gifQ.7MNXXuPJ6tlpnNLvpXN5LbFBAFHU6_vO_98a_0cFRf3Gq1OW4YU6G6WEsfe9CUs9	2026-07-30 17:00:19.420037	f
72	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODA2MjMxLCJleHAiOjE3ODU0MTEwMzEsInR5cGUiOiJyZWZyZXNoIn0.mm7lg3pJ7nVujPXpWkVMXfa-8_GYqJo0NoQ06xLcLXg_r8b926WTiMIzhFbWL02g	2026-07-30 17:00:31.048873	f
73	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDYzMTIsImV4cCI6MTc4NTQxMTExMiwidHlwZSI6InJlZnJlc2gifQ.8oqCMRIpVgpHIyNa2oaNhbkyHqr9Q7Gv6ZbBB2TF9ZVM31eFuV9yQtq-K8JfygKG	2026-07-30 17:01:52.541073	f
74	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwNjgxMSwiZXhwIjoxNzg1NDExNjExLCJ0eXBlIjoicmVmcmVzaCJ9.HyH0CaUDNuIBYVo30VCssLWHOnNksRZm9iROz_E1z0ikv986Oas53IZ34MmWAvVK	2026-07-30 17:10:11.291332	f
75	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDc0NjcsImV4cCI6MTc4NTQxMjI2NywidHlwZSI6InJlZnJlc2gifQ.5jDzaM7Xy81-pLuz2rYnyPxbkRs0RMQQ72ojwvO8Fg9Y6v-EzanuFswb2XI02-Kn	2026-07-30 17:21:07.113309	f
76	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDc1NzgsImV4cCI6MTc4NTQxMjM3OCwidHlwZSI6InJlZnJlc2gifQ.vZAPyi4EmiLFfRQXetYPNXzvOP8vBDXrhDOFJAv8yOGUfcSSJTiKNLQhBgBk7SHq	2026-07-30 17:22:58.943618	f
77	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDc5ODIsImV4cCI6MTc4NTQxMjc4MiwidHlwZSI6InJlZnJlc2gifQ.DCePtPKbfAPIyQjPv-PwqLKMzUWX_cypNNtjz9EAhbWaaNyEK7H-g38ba75tToQH	2026-07-30 17:29:42.038988	f
78	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgwODMyMCwiZXhwIjoxNzg1NDEzMTIwLCJ0eXBlIjoicmVmcmVzaCJ9.Xy32CVZjIg_yQRBJzUd_5GLdgSjdhpVBYAWNxoU5RHy4loMfnScT-gixlCj2n9Vu	2026-07-30 17:35:20.233499	f
79	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDgzMzksImV4cCI6MTc4NTQxMzEzOSwidHlwZSI6InJlZnJlc2gifQ.wR8x8yLEuz15ocTuWojzczjCWB8A5-VZrQ7yu2a8XlthyaaZsZ7mu584-fY4BdF9	2026-07-30 17:35:39.448989	f
80	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDgzNTksImV4cCI6MTc4NTQxMzE1OSwidHlwZSI6InJlZnJlc2gifQ.0pC7HeEVGgKWv2ZpyHCTZiI4j_fPquecXNldrt-IQab0xpHf6dBjYLE3Lh2yL3jU	2026-07-30 17:35:59.723511	f
81	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDkyMDEsImV4cCI6MTc4NTQxNDAwMSwidHlwZSI6InJlZnJlc2gifQ.EN-Bvc9Bt9DJESeCjtAxYSnqqViiuwKRiXPbPv2sTfoHCMvIW2HIVUw5Z_iQtg3G	2026-07-30 17:50:01.106873	f
82	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MDkzNjQsImV4cCI6MTc4NTQxNDE2NCwidHlwZSI6InJlZnJlc2gifQ.6J6GC1WQQDf5IxXn8P6YBXpTUonmcYFcIgOns5v3XcuxstoBzcdmW7GYmdTi4LKi	2026-07-30 17:52:45.016877	f
83	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTA1MDAsImV4cCI6MTc4NTQxNTMwMCwidHlwZSI6InJlZnJlc2gifQ.WIJIflL1ZRCgjYWkEGXNPHzLVrd_LMKsHXQgZOusEUy4YPmbWoS-Mc4w39xp1A5F	2026-07-30 18:11:40.461753	f
84	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTA2MzgsImV4cCI6MTc4NTQxNTQzOCwidHlwZSI6InJlZnJlc2gifQ.YbfncoITUgeJ0iR7_VsynipxTmTBiQ7Nted97GTEZc4__g9pIm7KKMAyQCi_9WK0	2026-07-30 18:13:58.465552	f
85	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgxMDg4MSwiZXhwIjoxNzg1NDE1NjgxLCJ0eXBlIjoicmVmcmVzaCJ9.NEIWiuxBrawU9IoHot_H2mDaE1AyAdi7lED7jg42an0-YVe28pXRMtiPIoc8eake	2026-07-30 18:18:01.440867	f
86	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTEwNjksImV4cCI6MTc4NTQxNTg2OSwidHlwZSI6InJlZnJlc2gifQ.A2sCdHE2vsnxIfZJ0q01DyWJusUmx-yK78_CpN494m--IWNxHs8_p3Ft7qMIGkmz	2026-07-30 18:21:09.711458	f
87	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTE1NzIsImV4cCI6MTc4NTQxNjM3MiwidHlwZSI6InJlZnJlc2gifQ.uFYI1RnY-JvR-WaetLH7mJrJHYCm4gVsJ46AwXppOj1DmnPsnynXRjIhzRf-3xD2	2026-07-30 18:29:32.878422	f
88	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTI1NDksImV4cCI6MTc4NTQxNzM0OSwidHlwZSI6InJlZnJlc2gifQ.pP0YT0KSuZabn18cvy0KlPorae20Ojopo7IDy6rY08WomUQjvsl8sfpXQWwA4c-w	2026-07-30 18:45:49.746803	f
89	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTI1NzQsImV4cCI6MTc4NTQxNzM3NCwidHlwZSI6InJlZnJlc2gifQ.e0br4o-drNnIBqzJvJbvAP7fsBxDXQxegD_ySDdv-afefP6k5Lg9m_Zf7F-ICCSA	2026-07-30 18:46:14.60465	f
90	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTMwMTEsImV4cCI6MTc4NTQxNzgxMSwidHlwZSI6InJlZnJlc2gifQ.Ep4r_8TFOc4aFyp1a132mvXPRli_IXBEpEw0uvqv1O_DeCUSCJdwu0tTnsB-ES1R	2026-07-30 18:53:31.314657	f
91	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTMzOTcsImV4cCI6MTc4NTQxODE5NywidHlwZSI6InJlZnJlc2gifQ.ifp4pBYiXvK_UWKvCqDa9qFs4Af3JEfRx-9ID15PXLaoddPYhAUh0jtvwfHzsDWt	2026-07-30 18:59:57.76193	f
92	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTQwNjgsImV4cCI6MTc4NTQxODg2OCwidHlwZSI6InJlZnJlc2gifQ.f-FMpubVVS8Frgj0R3ugXMRDw7ERenQfEanLtuzBvBMsFN-q6CiVo6hau1rOOLzE	2026-07-30 19:11:08.568847	f
93	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTUxMzEsImV4cCI6MTc4NTQxOTkzMSwidHlwZSI6InJlZnJlc2gifQ.IebYbqfVYl1LXitKi0NfEkoaPyFDYjL1U02sJu4q3gA2niJucmQ-Q3J75F82qcEC	2026-07-30 19:28:51.875628	f
94	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTUxODAsImV4cCI6MTc4NTQxOTk4MCwidHlwZSI6InJlZnJlc2gifQ.whxxlQlrC6zKbqAVFOVy1quMowkIE6WGjT5vdCGwdf4e_kbzZtkVL_iUudsU2i9d	2026-07-30 19:29:40.725782	f
95	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTU0MjcsImV4cCI6MTc4NTQyMDIyNywidHlwZSI6InJlZnJlc2gifQ.ZTFE_oHSVajPmGpGglfsGQwYdekZNknoRx_Bckmb0aI_ZqRCa6g6OXt4YgMbOlPW	2026-07-30 19:33:47.354241	f
96	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTYwOTQsImV4cCI6MTc4NTQyMDg5NCwidHlwZSI6InJlZnJlc2gifQ.zxGZwC3vyLw1AxcgmOzdNc7C7PAqqf3HmzBjVNAefAMh3Dyc5TKZRhcOolaCY0g1	2026-07-30 19:44:54.915121	f
97	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTY1NDIsImV4cCI6MTc4NTQyMTM0MiwidHlwZSI6InJlZnJlc2gifQ.RsX76eoRh7eYVK1xvcG5m_4hrPIRtoNZ6t8sDZn6IKUrfKSw5_wgaKiY48rynpPr	2026-07-30 19:52:22.543263	f
98	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTY1NTAsImV4cCI6MTc4NTQyMTM1MCwidHlwZSI6InJlZnJlc2gifQ.xPSWJf6Udp95_ftUcAeQB_U8SRR20F78Zm7mfYLgNMoedvKRrvIWdZSDDqaYfV4M	2026-07-30 19:52:30.535251	f
99	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTY1NzAsImV4cCI6MTc4NTQyMTM3MCwidHlwZSI6InJlZnJlc2gifQ.4IYYk0STMHjVp3pw0A1G-9_G0lQs92dA9c8r4y4wjiSfLAMfgiNSPXUXhjg7WOdf	2026-07-30 19:52:50.107039	f
100	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTY2NzUsImV4cCI6MTc4NTQyMTQ3NSwidHlwZSI6InJlZnJlc2gifQ.A9Yos84AazoUElK99sgXcEdyiR3C-bEcQD7CRhxchIy05J9LsZd71byNCRlDmIX2	2026-07-30 19:54:35.877308	f
101	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODE4MDY1LCJleHAiOjE3ODU0MjI4NjUsInR5cGUiOiJyZWZyZXNoIn0.tgsFsJZnPBctir5HdQfKUvQRN77lbBnf7i_ULvNJAneCgFbE5zL2p68OwL1PZECW	2026-07-30 20:17:45.267849	f
102	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTgwODUsImV4cCI6MTc4NTQyMjg4NSwidHlwZSI6InJlZnJlc2gifQ.J1I0nzI3u1oeX8_uUGHNWldtVXhBY2i54oqqYWYnSo2mCDkw30sq0qTcVtMVLV4O	2026-07-30 20:18:05.603354	f
103	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgxODEzMywiZXhwIjoxNzg1NDIyOTMzLCJ0eXBlIjoicmVmcmVzaCJ9.aoQsbJoUWDyk0FaharsIPY3sHnzPRe2AXOiXv4Pg6hcso5JRVaxDKQfn7TW70O64	2026-07-30 20:18:53.599192	f
104	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTgxNTksImV4cCI6MTc4NTQyMjk1OSwidHlwZSI6InJlZnJlc2gifQ.EjDu9JrMLDtPi-SlyuhTKfMMqQx5KusYNNrHfK3gzrXE3NLIZQmDTkUtQ8u8xIUz	2026-07-30 20:19:19.337631	f
105	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTgzMjEsImV4cCI6MTc4NTQyMzEyMSwidHlwZSI6InJlZnJlc2gifQ.cjqgrDrRKJFZJW8uqfk7X5zkas9wyrIYgCqQg3NE3mLRvhAU5IHxLsLMqQ6b29nT	2026-07-30 20:22:01.244464	f
106	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTgzMzYsImV4cCI6MTc4NTQyMzEzNiwidHlwZSI6InJlZnJlc2gifQ.qX1-HjtrvbHe8V4FV0ny0JuHTrqyKwH1G90V1b2Svyik4YmkluwjcXwOuGoKyiIJ	2026-07-30 20:22:16.718642	f
107	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTg2ODQsImV4cCI6MTc4NTQyMzQ4NCwidHlwZSI6InJlZnJlc2gifQ.RXve9Dx7rONpp-bkWSYoU4M3WKlCEYWpqBGOfLteI6Qo403w8iSdyk4LIDnVZQac	2026-07-30 20:28:04.759824	f
108	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTg4NjksImV4cCI6MTc4NTQyMzY2OSwidHlwZSI6InJlZnJlc2gifQ.CZ82QGtXI75uqVyVQeFlodNQiXMc6UxKGZYkKuUqQpKW_GC9kE_E_B8w6cjfQk9k	2026-07-30 20:31:09.47146	f
109	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1MDUsImV4cCI6MTc4NTQyNDMwNSwidHlwZSI6InJlZnJlc2gifQ.g7YapHpqI5GIwjRpuymMFalKjWPRQpWuJwKxehE7WUPZ-8wf8J6IZEo4WuG0l6A7	2026-07-30 20:41:45.257682	f
110	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1MTMsImV4cCI6MTc4NTQyNDMxMywidHlwZSI6InJlZnJlc2gifQ.cvAM0hl1XEucEomKRU83I91YZMTDRUi55tLhAOJMk1Wm_y0vPCkClgIHIq-uadfA	2026-07-30 20:41:53.652674	f
111	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1MTMsImV4cCI6MTc4NTQyNDMxMywidHlwZSI6InJlZnJlc2gifQ.ZPErpEPPIZHhom906FMrMrONSZ1sEQfG4Ei9uMoypxjMuIpr0frx-3wD1W3moYVz	2026-07-30 20:41:53.948066	f
112	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODE5NTE0LCJleHAiOjE3ODU0MjQzMTQsInR5cGUiOiJyZWZyZXNoIn0.hFQU2vPdxX3Ku54YADoo2zvSmR7_pXqG5dZS8e2tApWh8RkKMHflsvY5Jreg7PYh	2026-07-30 20:41:54.129464	f
113	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgxOTUxNCwiZXhwIjoxNzg1NDI0MzE0LCJ0eXBlIjoicmVmcmVzaCJ9.HP9II7d3v3MoVe-bR5DozrVGnJrmx9UTdte3_22lUISphD4bqZmnwCgivMWL_6e2	2026-07-30 20:41:54.298527	f
114	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1ODUsImV4cCI6MTc4NTQyNDM4NSwidHlwZSI6InJlZnJlc2gifQ.J2NwC_J3-DfEmfvKp0Td3RB3X9X2W0w8_pXn6vSoAeF29KTZL9BFr4abo71gySLa	2026-07-30 20:43:05.526152	f
115	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODE5NTg1LCJleHAiOjE3ODU0MjQzODUsInR5cGUiOiJyZWZyZXNoIn0.WsMTo5cDvYGWTm-t5kMK7LQ1PIYooNd2b9mUpwBmHAPGhjhpO1cUOenJxdkKeWKM	2026-07-30 20:43:05.826401	f
116	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1ODYsImV4cCI6MTc4NTQyNDM4NiwidHlwZSI6InJlZnJlc2gifQ.OOt9edPqd5iHLwgYhXDVnOQfihIktft3DXSOj8TFW8r1YB6-NM4p6GzFXc8J_LkI	2026-07-30 20:43:06.084763	f
117	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk1ODYsImV4cCI6MTc4NTQyNDM4NiwidHlwZSI6InJlZnJlc2gifQ.zGFMmxlmGTyQx5uX58arrocLhL3G61MckyFPaDQ4elgpptaI6vF-osiSBZ-Fp7FB	2026-07-30 20:43:06.325316	f
118	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODE5NTg2LCJleHAiOjE3ODU0MjQzODYsInR5cGUiOiJyZWZyZXNoIn0.3AxCimITu30JumJ4MmCud-abpkXBVoZpEiGPn9KrpPsaYpT0iuYlIER7HbF2KY2t	2026-07-30 20:43:06.511482	f
119	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgxOTU4NiwiZXhwIjoxNzg1NDI0Mzg2LCJ0eXBlIjoicmVmcmVzaCJ9.RSTKHmTJDBgfy_7ECn37v9K4uXaYaAW_e0tsYUkgUx_P_Y1kbrecbxEwbgPqjhTl	2026-07-30 20:43:06.742283	f
120	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MTk2MzgsImV4cCI6MTc4NTQyNDQzOCwidHlwZSI6InJlZnJlc2gifQ.ROUM61F__pGrZFhjI5jLLRahGDUZAx_kx73HqVzm6gasl_jJPKNegq_RfeEwOeAn	2026-07-30 20:43:58.477499	f
121	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgyMDM4OSwiZXhwIjoxNzg1NDI1MTg5LCJ0eXBlIjoicmVmcmVzaCJ9.mZXaJXYn1YW_1sRDQcX9sa-vNkAO1KOuE8Fa5qSQ4domLlztp1ighTcJNWQnWwpw	2026-07-30 20:56:29.061976	f
122	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjA0MzEsImV4cCI6MTc4NTQyNTIzMSwidHlwZSI6InJlZnJlc2gifQ.bwNGG8yZm32GmrGCrvfhn2NC-CxMwOxkvFud-79AL2_AH9FOaPibsCR2P_p1N39p	2026-07-30 20:57:11.785383	f
123	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODIwNDgxLCJleHAiOjE3ODU0MjUyODEsInR5cGUiOiJyZWZyZXNoIn0.f6eZYv7DIG3XCoQG2rherdMtMZW3opKvLWOhF8UP0eY0ZPsNiONVB2WhseqhqfuX	2026-07-30 20:58:01.185415	f
124	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjA1MTksImV4cCI6MTc4NTQyNTMxOSwidHlwZSI6InJlZnJlc2gifQ.K0phn4SggVelSKO7XaWXX3ubpsXfumK62AptjwnzpqXRqQilxWqbPvZXJ4qx9QBi	2026-07-30 20:58:39.63524	f
125	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDgyMDUyOCwiZXhwIjoxNzg1NDI1MzI4LCJ0eXBlIjoicmVmcmVzaCJ9.I9L_P2NbbyPkyD8GDVqLQz7UNwLMim-vvnyH-REhxml2hGsxjtW2LekjdWgmod6Y	2026-07-30 20:58:48.597662	f
126	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjA1MzUsImV4cCI6MTc4NTQyNTMzNSwidHlwZSI6InJlZnJlc2gifQ.TXKjY3ldqS2E3zZQ8e3Oc5ZGgrRc8dX4WCbKQD1y5_LAE2yICA5OSbYNS58fuLP9	2026-07-30 20:58:55.981013	f
127	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjA1NDIsImV4cCI6MTc4NTQyNTM0MiwidHlwZSI6InJlZnJlc2gifQ.7nooTqTNSWdLX2Z3pl08q_xquuZunaV37ec4iOM1dIiyhJzfc_7elDErYuUt4OGG	2026-07-30 20:59:02.509664	f
128	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjA5NzUsImV4cCI6MTc4NTQyNTc3NSwidHlwZSI6InJlZnJlc2gifQ.b3aY2fXk0JI27toaWvQrjiP2drYd-48wuvruBZnIvwQ9HyzOW4w--amPHOvEEzgX	2026-07-30 21:06:15.359124	f
129	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjIwODAsImV4cCI6MTc4NTQyNjg4MCwidHlwZSI6InJlZnJlc2gifQ.aeluZ-Dk2dWx-t-QEHsMmo_RPB5jzNlZvPwTpxHM7IId656cDieF_kPiZgDkN7l1	2026-07-30 21:24:40.063163	f
130	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjI3MDcsImV4cCI6MTc4NTQyNzUwNywidHlwZSI6InJlZnJlc2gifQ.vt722RhWX_GbcWQuVKdmHNz1K_BL6fpwSH6G-VbH2dPAWeQIY8xQLuB5h90Sfjr0	2026-07-30 21:35:07.535598	f
131	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjM1MTAsImV4cCI6MTc4NTQyODMxMCwidHlwZSI6InJlZnJlc2gifQ.mG65jKBA3YqXPepUCWujGiMxgkNIGLBb-TGY9KwUGYHjJu5rAhyUW7akJSPlT6So	2026-07-30 21:48:30.200872	f
132	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjQwNTgsImV4cCI6MTc4NTQyODg1OCwidHlwZSI6InJlZnJlc2gifQ.GIh2xh2OeidCecdmpqyRJnjVo9e0LFQkLtDvTJh3zKjGWHLruTO7UW1DHwuFMGcR	2026-07-30 21:57:38.345052	f
133	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjQwNjMsImV4cCI6MTc4NTQyODg2MywidHlwZSI6InJlZnJlc2gifQ.8ihTack6nV0RbDLVqWRruDUV52GW2Yi_-j8oq5D4WCMj8v607uNzruL2AsU8abvj	2026-07-30 21:57:43.528992	f
134	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjQwNzksImV4cCI6MTc4NTQyODg3OSwidHlwZSI6InJlZnJlc2gifQ.Lwb7Ht9yWArKHB6oZTK20piUThQvTNO1E8PVgwnchdjBl6PfJiGNCWsHHj3-0TX8	2026-07-30 21:57:59.651815	f
135	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjQzMzksImV4cCI6MTc4NTQyOTEzOSwidHlwZSI6InJlZnJlc2gifQ.NriOTVTdZKy8pEm8wMOr6aQa7unGBMBOQlfA6jutFpsIB7FAgLHO_w41kW7bDt_j	2026-07-30 22:02:19.588033	f
136	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODI0MzYwLCJleHAiOjE3ODU0MjkxNjAsInR5cGUiOiJyZWZyZXNoIn0.qNqOSUyuj6pWYlhSmz9zcdjFGgs7ZgWVEqfJmV7eG3bWcgLTKasSI3vCKWfEJJ8T	2026-07-30 22:02:40.885457	f
137	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODI0Mzc1LCJleHAiOjE3ODU0MjkxNzUsInR5cGUiOiJyZWZyZXNoIn0.FTuY52KvFA9EPSltg2O24cTL8zuTFTKfPSJEvmMeeFbHAVnSXqYcKKDVbUWPyiHB	2026-07-30 22:02:55.443598	f
138	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4MjQ1NzIsImV4cCI6MTc4NTQyOTM3MiwidHlwZSI6InJlZnJlc2gifQ.OO1AaYnpEu2CsKSYMrK8JJyX14oxm_9oMpcaz8kR426NqBKIlRzGFv3ohRKFQ6K7	2026-07-30 22:06:12.426921	f
139	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NjQ2ODAsImV4cCI6MTc4NTQ2OTQ4MCwidHlwZSI6InJlZnJlc2gifQ.hN6ik9PFnZYPqDVVgaVje-MtuE3xbXq8-BLidiYE_Or1J1WIEWyOeg96sGdndm1e	2026-07-31 09:14:40.407542	f
140	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njc3MjIsImV4cCI6MTc4NTQ3MjUyMiwidHlwZSI6InJlZnJlc2gifQ.C2woVNJI8NscDILSnjhVfzrbQNraRIYmtIooEwIglLfQTj3eCq62FOr2ur3zwe-Z	2026-07-31 10:05:22.199241	f
141	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg2Nzc5OSwiZXhwIjoxNzg1NDcyNTk5LCJ0eXBlIjoicmVmcmVzaCJ9.LAzGytxiykCSVR41ci-qF80I0rq1xZEOXpibPnUp3ftnbonrxYZ799J0FE95QFP6	2026-07-31 10:06:39.918942	f
142	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njc4MTgsImV4cCI6MTc4NTQ3MjYxOCwidHlwZSI6InJlZnJlc2gifQ.qJO6j_r5G4T8QXemxHXAMyYkpJWaTEggYhnpJi5kDfKdAlKDuvuFcV4lt9txP-85	2026-07-31 10:06:58.858612	f
143	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NjgxOTYsImV4cCI6MTc4NTQ3Mjk5NiwidHlwZSI6InJlZnJlc2gifQ.xhjGwdAucK8aRk7DaTTfgXolEf11zieu2ZKVPhJLyxQY0XqMTO8g2TnltDGKcqne	2026-07-31 10:13:16.082857	f
144	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg2ODMzNSwiZXhwIjoxNzg1NDczMTM1LCJ0eXBlIjoicmVmcmVzaCJ9.eqOrjfrg0yy2rU7IrvK4q_499SJtHNvt6EjIDBiEMoICh0PIIPPHlJ73_7LFbJQv	2026-07-31 10:15:35.23179	f
145	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg2ODM2MywiZXhwIjoxNzg1NDczMTYzLCJ0eXBlIjoicmVmcmVzaCJ9.3FIETlfw92iluDXqpeZ-BBhdDBWSnx0CUSeZrLxFH2kwrUhORMaTCZg1bKyOgkKw	2026-07-31 10:16:03.973535	f
146	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NjgzNzYsImV4cCI6MTc4NTQ3MzE3NiwidHlwZSI6InJlZnJlc2gifQ.LHoopHWZrJ1XXEiWX368pfQhEaTLMP6kNjH2iObEE-W4dKP1OhEiW6UQhc6lgpd4	2026-07-31 10:16:16.691293	f
147	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODY4MzkwLCJleHAiOjE3ODU0NzMxOTAsInR5cGUiOiJyZWZyZXNoIn0.6V9ThYo3U3z9A6M4IjPEBqfDnHRyZZMnqp1QbLzm6wMZ12HBConKrhXs7RaJH0K-	2026-07-31 10:16:30.574955	f
148	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njg0MTAsImV4cCI6MTc4NTQ3MzIxMCwidHlwZSI6InJlZnJlc2gifQ.dk147BAMS2CimyezgpdC-Ss7Yxcs8cSenuZgbKtVDL1bVbpRvdKf6yCWiCA4ZvSx	2026-07-31 10:16:50.483157	f
149	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg2ODQ2MSwiZXhwIjoxNzg1NDczMjYxLCJ0eXBlIjoicmVmcmVzaCJ9.uP1YZPaZKbDCtbBukX0yDI5R9Fdu-2TRKBjWPUz3v4YnX0G_D4Jf3jZKMxVsrr_r	2026-07-31 10:17:41.565315	f
150	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njg2NzEsImV4cCI6MTc4NTQ3MzQ3MSwidHlwZSI6InJlZnJlc2gifQ.1y62_eMuHx3BeCNChSzEhx7Hkq-s50oOweTYqSDEKJPjPShnRoqTiUBCzP6SC94k	2026-07-31 10:21:11.95162	f
151	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njg2ODIsImV4cCI6MTc4NTQ3MzQ4MiwidHlwZSI6InJlZnJlc2gifQ.7tkaW192gZAHYisnaqj4oiPTZa03GcshnzvEYPeGZ7mAWsqTRzqZvu3jt6uKnDel	2026-07-31 10:21:22.843212	f
152	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4Njk0NzEsImV4cCI6MTc4NTQ3NDI3MSwidHlwZSI6InJlZnJlc2gifQ.5lzcC9UkkUrKbHoZq_pK1Z-Z_24y_IAizeTQSo4-Gt_yGDE0Yc1XOSmlshEjeNQl	2026-07-31 10:34:31.390574	f
153	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzAzOTEsImV4cCI6MTc4NTQ3NTE5MSwidHlwZSI6InJlZnJlc2gifQ.sGlDtgRKIf4f6LvrtIiVU2pqU3tKsBQ8GQjewTCXj0t2aOhsQeJIrHQGyVSKF_rQ	2026-07-31 10:49:51.636086	f
154	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA0MDQsImV4cCI6MTc4NTQ3NTIwNCwidHlwZSI6InJlZnJlc2gifQ.HfllNEgjqmT0AtN0fqEdCNDAniAOV9XVIpG5UVp4cFqtcHIIqc_nkq27QHaW5Mus	2026-07-31 10:50:04.495521	f
155	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA0MTIsImV4cCI6MTc4NTQ3NTIxMiwidHlwZSI6InJlZnJlc2gifQ.6yXmABJorXFgpPRKZVmu9unPTIaCAV1QkGgMH4WnOfLz7X4He1KjJuqJ_IgVh4Zj	2026-07-31 10:50:12.896151	f
156	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA0MjAsImV4cCI6MTc4NTQ3NTIyMCwidHlwZSI6InJlZnJlc2gifQ.S9YjRU8_b3bLVwMQ4cHrStuNmOavE0jErTZudaFXxTpJfIrCk5bC0pbVh-3HGhYO	2026-07-31 10:50:20.917291	f
157	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA0MzEsImV4cCI6MTc4NTQ3NTIzMSwidHlwZSI6InJlZnJlc2gifQ.Ov4bhlaaPgRDHLSyk3__UtuPxPU0_fO7iNaTV-pGezM9MZBwQ30moss447dPE4b3	2026-07-31 10:50:31.744338	f
158	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA1NjUsImV4cCI6MTc4NTQ3NTM2NSwidHlwZSI6InJlZnJlc2gifQ.COXB9-JHUy95vS4D6Oc68TNAJQapI1RES6UGd4JpOkIzZ_Yj_BGE2e1SJz7Z4pre	2026-07-31 10:52:45.525473	f
159	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA4NDgsImV4cCI6MTc4NTQ3NTY0OCwidHlwZSI6InJlZnJlc2gifQ.OSawQDrGsZHxJwBVyWJkx5aRVehiW6dVopRgKnOBXLWznS6Q1J3JRi0IN1njlyaV	2026-07-31 10:57:28.848898	f
160	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg3MDg3MSwiZXhwIjoxNzg1NDc1NjcxLCJ0eXBlIjoicmVmcmVzaCJ9.vXAYpH5qkG6Gv488ZALN9zM2nGC8le8K3FeR8kmhB7GKHSoc6R1ALXpuxr8FoaPV	2026-07-31 10:57:51.305974	f
161	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA4NzgsImV4cCI6MTc4NTQ3NTY3OCwidHlwZSI6InJlZnJlc2gifQ.Iy2fY9HGgsxuouU-eInSoK-HHxHORxfWRI4uqIDWSaoiT5_Gay7sXg0tZL23vi-f	2026-07-31 10:57:58.719783	f
162	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzA5OTIsImV4cCI6MTc4NTQ3NTc5MiwidHlwZSI6InJlZnJlc2gifQ.artgxf2s9PhIqtFday1tF8dXhzI0VrwyyOLrUWAJuAJZ2J8qY1kPCiWWA8YoGXAK	2026-07-31 10:59:52.310566	f
163	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzExNDcsImV4cCI6MTc4NTQ3NTk0NywidHlwZSI6InJlZnJlc2gifQ.11K3Z8emWZKLrFPaV5Q52nhfDw-zSbkk6jRHpcF3cmFc9fPOtqSuHV2Zlf_pBYlu	2026-07-31 11:02:27.807491	f
164	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg3MTc3MiwiZXhwIjoxNzg1NDc2NTcyLCJ0eXBlIjoicmVmcmVzaCJ9.9yy-9ZeZbv-M0pfD4PefDX_xIbcQoeOkBHllfT9FNvFpa-HyAjf0AYIQmcXznybF	2026-07-31 11:12:52.17056	f
165	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzE4MzIsImV4cCI6MTc4NTQ3NjYzMiwidHlwZSI6InJlZnJlc2gifQ.fgla8wSZe9peRtWHGplmsjppvLp31vCKbGHSWmsr_5ByGBvrx6aLutl4U4shgtIm	2026-07-31 11:13:52.591357	f
166	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzIwMDMsImV4cCI6MTc4NTQ3NjgwMywidHlwZSI6InJlZnJlc2gifQ.aKZbfdMchBuO_DExMjRsT8TrKdJQSi45chsFufAklYz4RJ06mgOCpDqISWqm5nWZ	2026-07-31 11:16:43.552445	f
167	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg3MjE0MCwiZXhwIjoxNzg1NDc2OTQwLCJ0eXBlIjoicmVmcmVzaCJ9.l2k41FGJ8qUutXcTu-jV9l5ecWzy0zmIwkLurr5Q6Y6F45X5fm0tCG0KT2Qql4ej	2026-07-31 11:19:00.630904	f
168	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzIxOTIsImV4cCI6MTc4NTQ3Njk5MiwidHlwZSI6InJlZnJlc2gifQ.BwOBz9XZX4x5yAzkxoBWVcv8Ls257XamH1capAj7I1CxJLDKQjZS2cHj447T4_C5	2026-07-31 11:19:52.198577	f
169	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg3NDIyNywiZXhwIjoxNzg1NDc5MDI3LCJ0eXBlIjoicmVmcmVzaCJ9.BjLGRzUq9IWB8r1faZUlwV5NdklLUGPbeeS3nV3bax58TD1AKVDDc0bWGX4LiLcC	2026-07-31 11:53:47.573548	f
170	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzQ0MzIsImV4cCI6MTc4NTQ3OTIzMiwidHlwZSI6InJlZnJlc2gifQ.GODrJYCosfJLFVLTYqtIbbZAtx0S5nvcAStbnwtrIDlyzurJUVrQW0PNB_N8Jvym	2026-07-31 11:57:12.016066	f
171	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4NzgxMzUsImV4cCI6MTc4NTQ4MjkzNSwidHlwZSI6InJlZnJlc2gifQ.w_fFoOl_GzvS4YqZ0wEKQ0uq3s1RYOfAR7-jXkIQYmIJRjFnQNOrANBO7Pm_nveE	2026-07-31 12:58:55.532869	f
172	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODE3OTIsImV4cCI6MTc4NTQ4NjU5MiwidHlwZSI6InJlZnJlc2gifQ.yPLVrEr8f_nmEEjsDx0wVtvq6haE0b8F6Qg1dYPCbaqkRSoXEGVIXj5VnYwHs3CZ	2026-07-31 13:59:52.795858	f
173	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODIyNjYsImV4cCI6MTc4NTQ4NzA2NiwidHlwZSI6InJlZnJlc2gifQ.ModRE5UiT58x_-CXsK8sdHL5Fq9EDRRzRp_DyXO0XKNeYw-jZxN3eKFFzWGbJ90c	2026-07-31 14:07:46.49167	f
174	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODI5NjIsImV4cCI6MTc4NTQ4Nzc2MiwidHlwZSI6InJlZnJlc2gifQ.seZK5-DG8xKaUl8Qfwc00jpDV_2TgiuhiIl6tXaCKWoBzHprYReKyvzS0FYfJ3uJ	2026-07-31 14:19:22.481428	f
175	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg4MzI0NywiZXhwIjoxNzg1NDg4MDQ3LCJ0eXBlIjoicmVmcmVzaCJ9.xejJeBLP_XeooubyUQ3_32ppwKGmLMqS490y3quOwd-e2ILRagnPLUxKxAr40fmU	2026-07-31 14:24:07.364723	f
176	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODgzMjg2LCJleHAiOjE3ODU0ODgwODYsInR5cGUiOiJyZWZyZXNoIn0.qAD-Key_nZXh-k6Uc7EIVTvWvBF49D2BAueD4chKFJQoSNzG2ZEFKcWLelbtu-Eu	2026-07-31 14:24:46.501943	f
177	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODMzMDYsImV4cCI6MTc4NTQ4ODEwNiwidHlwZSI6InJlZnJlc2gifQ.2IKHGRlEopqag50Utbu3cBMxne_gPM1PJvPoiqQFFuvxdxb1jYazR_cBXUoyGi9J	2026-07-31 14:25:06.319711	f
178	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODMzMTYsImV4cCI6MTc4NTQ4ODExNiwidHlwZSI6InJlZnJlc2gifQ.9TXqOjN98sGRn_W2l4i62GO5rVecT33Jwd8rB6DIE2nE8OEcpQcXo08fkJBDiHev	2026-07-31 14:25:16.751692	f
179	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODQ0NDIsImV4cCI6MTc4NTQ4OTI0MiwidHlwZSI6InJlZnJlc2gifQ.sMdM9FQUo9cLv3alI6p4vKklHWahEsJSQzUfv3r4nhpSK7EfArAmEO2XqkQZnHu6	2026-07-31 14:44:02.581555	f
180	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg4NDcwNiwiZXhwIjoxNzg1NDg5NTA2LCJ0eXBlIjoicmVmcmVzaCJ9.MtSJxn5vyVYpL17nFpRBArBSqv77c-p8t44PTmUzY0z5s4PPYE-xfq0TH7Meqbky	2026-07-31 14:48:26.048798	f
181	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODQ3NDAsImV4cCI6MTc4NTQ4OTU0MCwidHlwZSI6InJlZnJlc2gifQ.Pvu0jOZBbmNtqaWe0wXxIkn4wC11HPGmKkGUJftLhdKXP3iIFLkP6MSoBsYhrF9V	2026-07-31 14:49:00.69045	f
182	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODQ3NzgsImV4cCI6MTc4NTQ4OTU3OCwidHlwZSI6InJlZnJlc2gifQ.snqWOKrKM8oL2g5fbUGue4lWMKSIifOJpM0dT0s317Kds2KvSkW6GPwmP0kKGdeg	2026-07-31 14:49:38.704396	f
183	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODYzMDEsImV4cCI6MTc4NTQ5MTEwMSwidHlwZSI6InJlZnJlc2gifQ.SBAwZo1oKNRypMF9reuwkJM9PA-jD_Rkm0-fqigso8nsPZL481tpdOjAFXccfGPN	2026-07-31 15:15:01.973282	f
184	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDg4NjM2OSwiZXhwIjoxNzg1NDkxMTY5LCJ0eXBlIjoicmVmcmVzaCJ9.0ZtLJCyuDXx4xCCsBTGTXCO_VSSaazlc4KP-HFghtvjO7v7IIwZ34GUGMVWDqNBC	2026-07-31 15:16:09.335621	f
185	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODY0NDUsImV4cCI6MTc4NTQ5MTI0NSwidHlwZSI6InJlZnJlc2gifQ.eREF_oi-Av8lLU96t-JY7U7BKtjTGOhTvWdeHAn5JFxDc_J9Lq2Xb8AcaxUmnaEw	2026-07-31 15:17:25.640382	f
186	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg0ODg2NDc1LCJleHAiOjE3ODU0OTEyNzUsInR5cGUiOiJyZWZyZXNoIn0.rp6AjaKdx-TKke2-rpPr8wdY5tbF-SeJnZCC_HChRvRZWWBUeQdntUnNa1St_5Cd	2026-07-31 15:17:55.360276	f
187	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODY1MDMsImV4cCI6MTc4NTQ5MTMwMywidHlwZSI6InJlZnJlc2gifQ.Xx1YTlnlF3XX8m5UHUOMUDMkWIXuPUUv6UcNMb_ru39GytdOh0gf6o1hSxhVl14f	2026-07-31 15:18:23.195821	f
188	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ4ODY1MTgsImV4cCI6MTc4NTQ5MTMxOCwidHlwZSI6InJlZnJlc2gifQ.SctKSZ-d5kjWnW6dcbYHYu244mgz60bdI2Eedqvxy7GAVLaehvdz82NBie5VO6eQ	2026-07-31 15:18:38.478538	f
189	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5MDAzNDIsImV4cCI6MTc4NTUwNTE0MiwidHlwZSI6InJlZnJlc2gifQ.RkUc9ax-izptl_mfCy_O6YTJftwLVR9Zku-lguSqs5izj-r-fy8bbkKazWUjKMpa	2026-07-31 19:09:02.788647	f
190	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5MDAzNjYsImV4cCI6MTc4NTUwNTE2NiwidHlwZSI6InJlZnJlc2gifQ.kWzbqWz02XrSWfJJJOrUq9pht0VzbUEbAL69Gn6KjP8bI93lZ00tr5a73lsiGiRI	2026-07-31 19:09:26.515818	f
191	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5MDA0MzIsImV4cCI6MTc4NTUwNTIzMiwidHlwZSI6InJlZnJlc2gifQ.m-ohJ1F0XkTDI9s_6Nqs_2fXXvYXb8dDMCxK6eLiFFdnjW6ZvftCGrSaBqfH3rkB	2026-07-31 19:10:32.159339	f
192	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5MDA2MTEsImV4cCI6MTc4NTUwNTQxMSwidHlwZSI6InJlZnJlc2gifQ.f6soReGX6TSkGH-aEHuqqZTv320WfWx20IN5wl4BADeAcL_2Kwzi6p0jgSx-pW1L	2026-07-31 19:13:31.146686	f
193	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDkwMTAxNywiZXhwIjoxNzg1NTA1ODE3LCJ0eXBlIjoicmVmcmVzaCJ9.qK3mYaglaCg2n0I9S6He7g4ZCdL_HwBdhnAfTowM6RCFTTQRvrSv29RFHEBlB1Fx	2026-07-31 19:20:17.803147	f
194	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDkwMjkxOCwiZXhwIjoxNzg1NTA3NzE4LCJ0eXBlIjoicmVmcmVzaCJ9.tFbW5xGIOK4EOEvzuxsPyzz4WT2cIrk-d6zq4PL9xkFpyGoOYUtusfEkCp6lKedv	2026-07-31 19:51:58.098578	f
195	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NDk5NTk5NiwiZXhwIjoxNzg1NjAwNzk2LCJ0eXBlIjoicmVmcmVzaCJ9.ApAGq7HjS8TCRKunn6DMhKe8NGJDLfFi5t82WYXQDd8n8YrJ0lunT_K8i4dgaidW	2026-08-01 21:43:16.852557	f
196	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5OTYwMDQsImV4cCI6MTc4NTYwMDgwNCwidHlwZSI6InJlZnJlc2gifQ.AIt1wU0_BYbyTjcyFsIc6LZPSGOrc-SIrQtaa5nECHha2fR26lqrT5ixQy2zpaDG	2026-08-01 21:43:24.819224	f
197	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODQ5OTY0MDUsImV4cCI6MTc4NTYwMTIwNSwidHlwZSI6InJlZnJlc2gifQ.y8X-_gMx7p92jZJQwLlQ1HeE8RG_wRIi07MHMwucCoHp-CTN8UeSz03LhpoH5Th-	2026-08-01 21:50:05.824486	f
198	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwMzg0NjQsImV4cCI6MTc4NTY0MzI2NCwidHlwZSI6InJlZnJlc2gifQ.5vU_bTqsjxH4r5zO1V-LcZBFGRhhXJ76arCmhIKkahOuBEPNcO2rybPSYhKgjE1s	2026-08-02 09:31:04.307462	f
199	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTAzOTEwNSwiZXhwIjoxNzg1NjQzOTA1LCJ0eXBlIjoicmVmcmVzaCJ9.LdmKIyg8cQlJGXSOnhxJF9WSiQvqN2GPeDXJ5sAMEr1xgGxMRpZ7lFJ_87TILMjF	2026-08-02 09:41:45.522678	f
200	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDM5Mjg1LCJleHAiOjE3ODU2NDQwODUsInR5cGUiOiJyZWZyZXNoIn0.jM0tfdypTxCTejBTassCRqLjtPdupWjxUQPVshW6AkFCYmitwUGbRXt1Yx5d97k1	2026-08-02 09:44:45.043968	f
201	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDM5MzA3LCJleHAiOjE3ODU2NDQxMDcsInR5cGUiOiJyZWZyZXNoIn0.tnai8iWeCOFHgUKvjKZsO95jP9BU-Q58TO-bUlKpRq0c44tPuyxHr4AGBvwV938O	2026-08-02 09:45:07.666856	f
202	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwMzkzMjEsImV4cCI6MTc4NTY0NDEyMSwidHlwZSI6InJlZnJlc2gifQ.3DQaypnSN5il8N2DMoWEKvFG4RQX4dOGNfWsU6An7J9R87t3fu2fl8lvBECRMMPl	2026-08-02 09:45:21.950828	f
203	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDM5NTQ5LCJleHAiOjE3ODU2NDQzNDksInR5cGUiOiJyZWZyZXNoIn0.N1N7euAKHNeTWeFyab4gmeYTwy0PrNBosxMlHkIyP-zWTtDQHHNCjH8dG3vV3C_T	2026-08-02 09:49:09.694738	f
204	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwMzk1NjAsImV4cCI6MTc4NTY0NDM2MCwidHlwZSI6InJlZnJlc2gifQ.QoDXotmKg5ObTsE2WNaVUKoTni3HzggsD1a9-tm5JhBVeNtD61k43bSsfE6bhdiX	2026-08-02 09:49:20.457444	f
205	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTAzOTU5NiwiZXhwIjoxNzg1NjQ0Mzk2LCJ0eXBlIjoicmVmcmVzaCJ9.lA6S2XNInUgbSW-Uk8euNTWxY50CrMZ6H1Co1lpvAEEcJp66KM9cV8Nb-05BmLSk	2026-08-02 09:49:56.320877	f
206	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTAzOTYwNCwiZXhwIjoxNzg1NjQ0NDA0LCJ0eXBlIjoicmVmcmVzaCJ9.EWRNK0-AgEt0PKPxl7Tfsn36F2fY0QMa0vqiHZvJ85HjdndkCYTvdQoGTx4nsgJW	2026-08-02 09:50:04.489162	f
207	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwMzk2MTEsImV4cCI6MTc4NTY0NDQxMSwidHlwZSI6InJlZnJlc2gifQ.apEF3S1pFOFJsaTPqSIoCg42RxNAMj6R4TK3adynPQjQLCWVP2YARePDPdPm67IA	2026-08-02 09:50:11.42895	f
208	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA0MDMxMywiZXhwIjoxNzg1NjQ1MTEzLCJ0eXBlIjoicmVmcmVzaCJ9.eKXba2wLtUVW1XZgsZmo5E-OdGx2z5RdeSRCgL6lxLR_3BeypZq1wj6rcknxGtAl	2026-08-02 10:01:53.452416	f
209	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDAzNDUsImV4cCI6MTc4NTY0NTE0NSwidHlwZSI6InJlZnJlc2gifQ.AhtpfBI91csLO03Q5hf2Lt7D5fWLAj_rgiaguR0G72Nz4WuTY5mmIwUyF3wNbtyT	2026-08-02 10:02:25.419272	f
210	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQwMzU0LCJleHAiOjE3ODU2NDUxNTQsInR5cGUiOiJyZWZyZXNoIn0.2ur7ZiBbO1axQnL2kjeWGXgCvQD0fu07v1gDq1X0-GuKO5v-3xK-xPv8jj4eHNeL	2026-08-02 10:02:34.877593	f
211	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDA3MzcsImV4cCI6MTc4NTY0NTUzNywidHlwZSI6InJlZnJlc2gifQ.9YosuqkWfuaCCBJksAKfaRCRySBezFHoqWV06i9OaVF8lbJFeKnWuk6ZdukX-QkI	2026-08-02 10:08:57.613737	f
212	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQwNzQ1LCJleHAiOjE3ODU2NDU1NDUsInR5cGUiOiJyZWZyZXNoIn0.Z_CeJ_RJoTt6lnt_-salcUSMcsPkKRamA4SmcbOW7O_TxstlKSqftl_R5LQz1UQh	2026-08-02 10:09:05.112346	f
213	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQxMjI5LCJleHAiOjE3ODU2NDYwMjksInR5cGUiOiJyZWZyZXNoIn0.whkLbnhV703xEwEOyrDPiq4R1C_K9rqhEi_ZDQ4Kpq96w9433_jr5v-_xWjQoT51	2026-08-02 10:17:09.533074	f
214	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQxOTI1LCJleHAiOjE3ODU2NDY3MjUsInR5cGUiOiJyZWZyZXNoIn0.yQXfhguU3ykICRaegs8Cipig7DO9jWnhSZuRPNJwz4ctHeMKi_U7IYkbjSX93Sn9	2026-08-02 10:28:45.952437	f
215	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA0MjIyNCwiZXhwIjoxNzg1NjQ3MDI0LCJ0eXBlIjoicmVmcmVzaCJ9.xHxhzSBG9nM8togOHit1rpaS4eWiN-pCQNqlTDbH8FOXzqOQOJ_DEDe-nBsQiWEs	2026-08-02 10:33:44.186789	f
216	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQyMjM0LCJleHAiOjE3ODU2NDcwMzQsInR5cGUiOiJyZWZyZXNoIn0.9GpFltUIos9Fwi9dDUVErTzVRgCPUUDo8Ag27aeJK5BkBTzdI3j3KiCE5khq0wWz	2026-08-02 10:33:54.103989	f
217	3	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJyYWplc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQyMjUzLCJleHAiOjE3ODU2NDcwNTMsInR5cGUiOiJyZWZyZXNoIn0.fHtJjflTIdYBOUPwkIOPOarNwDwN9oi_UF2nWBIETUaLUpOcsuY3OQknFuSVUNkZ	2026-08-02 10:34:13.506712	f
218	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDIyNzEsImV4cCI6MTc4NTY0NzA3MSwidHlwZSI6InJlZnJlc2gifQ.LlBXzYOs813ZvLGAP9e_iC2TpHKJrq1aq3hadgDcsiRJNLoYNQGTa-6djaSXz9W_	2026-08-02 10:34:31.264826	f
219	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQyOTgzLCJleHAiOjE3ODU2NDc3ODMsInR5cGUiOiJyZWZyZXNoIn0.8UzqBApOKpKZr8YHI2WLUdVfsoGmDPeYC4a-cSdFqUXsTpqpXYPWgjkt77uHwWb2	2026-08-02 10:46:23.556804	f
220	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDU4MzMsImV4cCI6MTc4NTY1MDYzMywidHlwZSI6InJlZnJlc2gifQ.OMx4lZu4MxdiADp1xlKrTmgUfi3OQ11NvAiX6tSRRCZbw9kAhacnekO21-8sKghR	2026-08-02 11:33:53.137909	f
221	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQ3MzYwLCJleHAiOjE3ODU2NTIxNjAsInR5cGUiOiJyZWZyZXNoIn0.0vfYE8f5kc2FDqhjLJgnc8qajt5rUO7BAv1TnFFFXLMxSqJMpEppXsjQCNX7oeT5	2026-08-02 11:59:20.694541	f
222	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDc4NTgsImV4cCI6MTc4NTY1MjY1OCwidHlwZSI6InJlZnJlc2gifQ.xM_7x6Zy2ssD4T3b_w42rFnpbZs624I4r0-G69pz2pH50YVuHH8Y6wpFzd8h-rH9	2026-08-02 12:07:38.452487	f
223	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDc4NzksImV4cCI6MTc4NTY1MjY3OSwidHlwZSI6InJlZnJlc2gifQ.UD6vJMLiHjQsDuc4kSjTuCQ5mbzNkdMzW-MQq3qZ-9N-z4cb9C_I5_SFrJWCBmwy	2026-08-02 12:07:59.507763	f
224	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQ3ODk0LCJleHAiOjE3ODU2NTI2OTQsInR5cGUiOiJyZWZyZXNoIn0.4ndrUDqSRr4ToXsKeuRNKbz74PqGgQo2Krk3IcSZtuy8MxAB-8B_Fz1Z9F910aRO	2026-08-02 12:08:14.596748	f
225	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDkzNTQsImV4cCI6MTc4NTY1NDE1NCwidHlwZSI6InJlZnJlc2gifQ.9-_FfAOW7aCNGxPLTBxT4F_VndJrKvJ1-D2WZoNoDKeAnGNQaiO0ReIdCuNIC0Ks	2026-08-02 12:32:34.860261	f
226	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDQ5Mzc0LCJleHAiOjE3ODU2NTQxNzQsInR5cGUiOiJyZWZyZXNoIn0.aVFKnNQiqI3bhx9C0QaK_9dFeamwda1nD38G7tYVYvRrxrjHMec3NarM1b5kwPbW	2026-08-02 12:32:54.742745	f
227	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNDk1OTMsImV4cCI6MTc4NTY1NDM5MywidHlwZSI6InJlZnJlc2gifQ.iVgPDOAjEtnSpbqraFDfUSTYXUWXFbPdeRfQoqkM1QLp-fEUiSfnnY95RPpSx3VX	2026-08-02 12:36:33.439185	f
228	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDUwNTUzLCJleHAiOjE3ODU2NTUzNTMsInR5cGUiOiJyZWZyZXNoIn0.wNn_K4CvSLRjidMG5cnLk2s9SNkkgBadc7NGFJ4ev0LosdFhaZ0hrcpRTo3UHXOH	2026-08-02 12:52:33.258642	f
229	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTA1NjYsImV4cCI6MTc4NTY1NTM2NiwidHlwZSI6InJlZnJlc2gifQ.3eWDNAUy3MPM3kFxUYZM5ZNFrrc1d_05oc2JgS6axF1Pb97EHczC1OA0mvOIhn0D	2026-08-02 12:52:46.065808	f
230	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDUwNTk2LCJleHAiOjE3ODU2NTUzOTYsInR5cGUiOiJyZWZyZXNoIn0.4XBVc13ArgSXRS5hdPkpYHZ8RQuAAfmy7zt4GGMcXQLgWyhmYaiKsmynQa6cdprL	2026-08-02 12:53:16.786609	f
231	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTExMzMsImV4cCI6MTc4NTY1NTkzMywidHlwZSI6InJlZnJlc2gifQ.F22kBxDHnlUPvAPXsPEzOAz54d7sOmf4gmnkX9U5HSpxH5kZqg9ulA_pVptRJhbI	2026-08-02 13:02:13.319025	f
232	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTE2NTQsImV4cCI6MTc4NTY1NjQ1NCwidHlwZSI6InJlZnJlc2gifQ.9V1uLx6_z5Gw2XMKNXcNADBvmPc2ZAXRf0raXPu9rocZvov0Kzd7yIcolG1c0jxE	2026-08-02 13:10:54.588106	f
233	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTUxMDMsImV4cCI6MTc4NTY1OTkwMywidHlwZSI6InJlZnJlc2gifQ.LrL8GssSMpdqBg6SJ3OxnAzFoohJKvinLwEqGB1WXQS1Z9QSmHjPE8ra11IW76Ft	2026-08-02 14:08:23.232369	f
234	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA1NTEyNiwiZXhwIjoxNzg1NjU5OTI2LCJ0eXBlIjoicmVmcmVzaCJ9.TINgYZsYEhu_FhFz6-Il3KMXHAxgyBzychLc9fW-IgNm6RwFj_eJxgdq3C5cmRVq	2026-08-02 14:08:46.040447	f
235	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA1NTQ4NCwiZXhwIjoxNzg1NjYwMjg0LCJ0eXBlIjoicmVmcmVzaCJ9.W6rzPLTQClwSMPxancC3Ch-D_FdHevkrg-qcNpATY8cUF7qLWmNFR_jwBZC1S5L4	2026-08-02 14:14:44.906255	f
236	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU0OTQsImV4cCI6MTc4NTY2MDI5NCwidHlwZSI6InJlZnJlc2gifQ.Moq7zDkAfyCJmB-y1FyQ3FIZVKfjrwExzdKaDkjsgwBaxj9wsO6b7Y0E8SMDoMvO	2026-08-02 14:14:54.862677	f
237	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU1MTEsImV4cCI6MTc4NTY2MDMxMSwidHlwZSI6InJlZnJlc2gifQ.NMOMKNah_txG303I_N-GYt7D73UMRsV3M1W4QH6vNQlV1kWB8SW8Gg6TYQXSEA5D	2026-08-02 14:15:11.23905	f
238	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU2NTQsImV4cCI6MTc4NTY2MDQ1NCwidHlwZSI6InJlZnJlc2gifQ.24wmzEvfBDOU_avI7o6NoVKF7UbvqCcc4jCp4g6ZIvltbqZ0lYZTYvGUR6tuLg8t	2026-08-02 14:17:34.432683	f
239	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MDU1NzE3LCJleHAiOjE3ODU2NjA1MTcsInR5cGUiOiJyZWZyZXNoIn0.ZOBpMqZ53_EmVDJvyrd1DKlkBrI6-ISngt1COGioQa-xgj9a69JYfBAgmaAby0EN	2026-08-02 14:18:37.393475	f
240	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU4MTgsImV4cCI6MTc4NTY2MDYxOCwidHlwZSI6InJlZnJlc2gifQ._h0Xv0hu8oFM7-5s8kJJZYurLcT33LuWokHWifpP8SiHCMET50xV3g0s7fBxNDMi	2026-08-02 14:20:18.39483	f
241	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA1NTgzMiwiZXhwIjoxNzg1NjYwNjMyLCJ0eXBlIjoicmVmcmVzaCJ9.TV1mF6wZQ2dZ9z5NpoVmI630SuF-DyCLnKjnft3gCLju2ewgUA8lBkd1g5wMpoDe	2026-08-02 14:20:32.587733	f
242	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU4NDEsImV4cCI6MTc4NTY2MDY0MSwidHlwZSI6InJlZnJlc2gifQ.J3SpbzaibteF4l3x7Sxk9JHPdM2MHlbeEzGvZo_1Z6H_xrb89TJxkF0q66TNVlFm	2026-08-02 14:20:41.005764	f
243	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU4NDUsImV4cCI6MTc4NTY2MDY0NSwidHlwZSI6InJlZnJlc2gifQ.aOF8RQ2SZkRrE2WoWjkSnU46e4xwQNXUGTK_9J_o7kxvcWUOm9xDgIRTS4b2Qt2A	2026-08-02 14:20:45.841815	f
244	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTU4NjAsImV4cCI6MTc4NTY2MDY2MCwidHlwZSI6InJlZnJlc2gifQ.hdiqbG0TXRe6_9XWedOQMo972xxyI0PIWYZ6b-zftS2BybEmUR-OwuoLVbSfNKit	2026-08-02 14:21:00.775491	f
245	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA1NjEyNCwiZXhwIjoxNzg1NjYwOTI0LCJ0eXBlIjoicmVmcmVzaCJ9.zn_dMke9LI3vUIpB0sQkJpevDleH8OlkTZQt7rrO8m-WScEARtCB5q4c5yCEOpAV	2026-08-02 14:25:24.886625	f
246	5	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzbmVoYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTYxNDEsImV4cCI6MTc4NTY2MDk0MSwidHlwZSI6InJlZnJlc2gifQ.wRgWCydxt7AI5-tNEAxw-VMPLJt5Q16QUtxs2F-BY_ebMYDmGddQZ4VP79aw5bp7	2026-08-02 14:25:41.676965	f
247	7	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtZWVuYUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTYxNjIsImV4cCI6MTc4NTY2MDk2MiwidHlwZSI6InJlZnJlc2gifQ.xJ5WgtGS7ygdSJwAPPtivVC799X0LoIJyTR_9MTT_WWpvXJtd35mejJD2Hpm5M5S	2026-08-02 14:26:02.686782	f
248	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNTY1NDUsImV4cCI6MTc4NTY2MTM0NSwidHlwZSI6InJlZnJlc2gifQ.Tlbbvdd-vk77zARH-Q2i-8NFsmWAqE1xyUCqbv_Vc8R4bqjjqiUvKi1DhC8xzIVv	2026-08-02 14:32:25.861305	f
249	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTA2MDQ0NSwiZXhwIjoxNzg1NjY1MjQ1LCJ0eXBlIjoicmVmcmVzaCJ9.8VLBKiamGG62l3Vch5SQxaBFY12CAtdPA0sL3jHcncMvwLNBTyJQpneD4UammbtI	2026-08-02 15:37:25.12622	f
250	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUwNjA0NTgsImV4cCI6MTc4NTY2NTI1OCwidHlwZSI6InJlZnJlc2gifQ.5zCmO8udQY26n_AXJq7fHp4mRqxg3aIPLVKKCxg8p6Ze3HItbORLj4Pc2jWBNpux	2026-08-02 15:37:38.536883	f
251	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNTQ3NDMsImV4cCI6MTc4NTc1OTU0MywidHlwZSI6InJlZnJlc2gifQ.c9RLdQarnse7BA3SDHRRRpS392O9hP-GjCHjLFLt2saL4BwteAm0OJ_QraD2UWAR	2026-08-03 17:49:03.989028	f
252	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNTY3MjYsImV4cCI6MTc4NTc2MTUyNiwidHlwZSI6InJlZnJlc2gifQ.FeWNBf4wfF-juV5fgUQqv_fpa-IFhwlx2nrMzJIWZ8TV2eshlJrXhUhS2TNSIjFo	2026-08-03 18:22:06.078644	f
253	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNTk4MDIsImV4cCI6MTc4NTc2NDYwMiwidHlwZSI6InJlZnJlc2gifQ.kKNRRtHp2tzm1zOAyLyzwbn2HYr4LgOpSMkDhfPJ74gQEQXh6QhuZJYCg1mGTgYM	2026-08-03 19:13:22.485633	f
254	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjEyMzksImV4cCI6MTc4NTc2NjAzOSwidHlwZSI6InJlZnJlc2gifQ.GinoorU9yReBzKUQuKrUPuIayzz2DG2VHUC_cMYT4AIMdA-3CUcNd1mARkvu82zi	2026-08-03 19:37:19.624192	f
255	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjE5MDgsImV4cCI6MTc4NTc2NjcwOCwidHlwZSI6InJlZnJlc2gifQ.uhbIDRAutirVgelHHBslAqQ4wjoKJzO-iKwYZngtOufyRlP6KiOj2EXVKUaZ46j_	2026-08-03 19:48:28.464841	f
256	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE2MTkyMiwiZXhwIjoxNzg1NzY2NzIyLCJ0eXBlIjoicmVmcmVzaCJ9.uvXoSdIb8Oe_4Tsf1aIzyhYNjWYrniBOuGdfuwm4-nYaUfA9ic0cgV1wtelbCalV	2026-08-03 19:48:42.961965	f
257	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjI0NDYsImV4cCI6MTc4NTc2NzI0NiwidHlwZSI6InJlZnJlc2gifQ.ip4dtw2sFcMuGk0i_Y36pVT9i8-rhSBBGObdRm7AFvgmpD07pCDuF39g30ElASpx	2026-08-03 19:57:26.196416	f
258	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjI0NjcsImV4cCI6MTc4NTc2NzI2NywidHlwZSI6InJlZnJlc2gifQ.-OBeDiD5mnJJOB5A6ldT21VVPM2wPNraw9pK7znaas1tRGN64ozXIiIcmXkv-OJ1	2026-08-03 19:57:47.518708	f
259	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE2MjQ3NywiZXhwIjoxNzg1NzY3Mjc3LCJ0eXBlIjoicmVmcmVzaCJ9.3bkhNhd6AFc0ok9Dh5_tZncaesKQtUd5lTNmueuWBfQ3m74JLNKtE4EhVeUvrEWe	2026-08-03 19:57:57.037844	f
260	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjI1NTUsImV4cCI6MTc4NTc2NzM1NSwidHlwZSI6InJlZnJlc2gifQ._0iWaoU89qHKcniZlGeWTmNKItK0a8eAtRif4zxQDBf_arBFz84gN3Sjz-cV7Pcd	2026-08-03 19:59:15.017522	f
261	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjI1NzcsImV4cCI6MTc4NTc2NzM3NywidHlwZSI6InJlZnJlc2gifQ.Db8_rtk17z8q2eJUARqt1BEXdkRDPKi3RzMvlf3NmdaDu9dZWUvEjg_4jVJSB4FG	2026-08-03 19:59:37.133137	f
262	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjMzMDksImV4cCI6MTc4NTc2ODEwOSwidHlwZSI6InJlZnJlc2gifQ.dcmYovYZHRZ2HaHKvBpbV1nklUTYvs9a5cxlIY7hSahxayVGdZ44SgmjAFKdw8wW	2026-08-03 20:11:49.429552	f
263	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjMzNDUsImV4cCI6MTc4NTc2ODE0NSwidHlwZSI6InJlZnJlc2gifQ.YBwuxfC9RcYeWwMv4drhd7z67UJUU5r31T5JxmkPp4jQ0fPiczc5P1gAuThRp1Ee	2026-08-03 20:12:25.805084	f
264	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE2MzM4NywiZXhwIjoxNzg1NzY4MTg3LCJ0eXBlIjoicmVmcmVzaCJ9.-JEeS6j7OBRECLLyOkkqXvjQKUWQz20HfJ-Oz5vwcBkG75T9FHdUy6KNKeRZJsMz	2026-08-03 20:13:07.910151	f
265	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjM0MDksImV4cCI6MTc4NTc2ODIwOSwidHlwZSI6InJlZnJlc2gifQ.6rmZQap94qD7QxGDrC0C1Iurc2FXVbpaQH1DMXGUcewaYQ4nBxFkT2U8Jbw9RU0l	2026-08-03 20:13:29.134896	f
266	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE2Mzc1MywiZXhwIjoxNzg1NzY4NTUzLCJ0eXBlIjoicmVmcmVzaCJ9.KRljXEKbeIX0yAFygtETJsw-WrXTTVgOSewn34zOrKcximnLJy0HbgWMc1Osdept	2026-08-03 20:19:13.588955	f
267	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjM3NTgsImV4cCI6MTc4NTc2ODU1OCwidHlwZSI6InJlZnJlc2gifQ.2ANlRXdC0I12iza_nqMS16a3jAddpUTsz4DelNa_8W1nvzLRbtKblTg47foRf-pG	2026-08-03 20:19:18.353587	f
268	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjQxMTIsImV4cCI6MTc4NTc2ODkxMiwidHlwZSI6InJlZnJlc2gifQ.umqxI7HuhbM4zhFIRAkbpJpUJwSPQq39DJGTqQrPELc_f0xDbsz5I1a9Mr_zZKZC	2026-08-03 20:25:12.144467	f
269	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjQ1MjQsImV4cCI6MTc4NTc2OTMyNCwidHlwZSI6InJlZnJlc2gifQ.c40VFtgBNaN9EyT15oNeEQ55tsOFuvpNGsHZ337A1zzfP3-Bo4KCNdYc1v4X7cAF	2026-08-03 20:32:04.41472	f
270	6	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFya3Byb2ZAZ21haWwuY29tIiwiaWF0IjoxNzg1MTY0NTM1LCJleHAiOjE3ODU3NjkzMzUsInR5cGUiOiJyZWZyZXNoIn0.WEJ7ZWeoT5tt6unrEW28DeUU-t1t5GRDpdu0fALanbECbc_g8q3VJkHBaeAMC81a	2026-08-03 20:32:15.918241	f
271	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjUxMTUsImV4cCI6MTc4NTc2OTkxNSwidHlwZSI6InJlZnJlc2gifQ.ra4BvBxmnzhMEukK-uX0lwTlxXLdvrjfCBIwnE6kGVAyhauce4YteTIGaIohFY1t	2026-08-03 20:41:55.567499	f
272	14	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFyazEwNTkuc3NlQHNhdmVldGhhLmNvbSIsImlhdCI6MTc4NTE2NTY0MSwiZXhwIjoxNzg1NzcwNDQxLCJ0eXBlIjoicmVmcmVzaCJ9.vKxOZs9ruoLHhL8i4ssgoLYnLXv0CUhbRhVqqjOwG7KUmJ5mbZ5JzNPWuJwTMfVC	2026-08-03 20:50:41.500876	f
273	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjY1MjAsImV4cCI6MTc4NTc3MTMyMCwidHlwZSI6InJlZnJlc2gifQ.dYDkTz_KlsOqLOJBm2DtSUh4qSmrzFV-LciD9b3mqdc-4uHbe9vnGJ6FssWUWd0s	2026-08-03 21:05:20.879023	f
274	14	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFyazEwNTkuc3NlQHNhdmVldGhhLmNvbSIsImlhdCI6MTc4NTE2NjU3OSwiZXhwIjoxNzg1NzcxMzc5LCJ0eXBlIjoicmVmcmVzaCJ9.EsaERn8l_eIfdlHG7OVtD00E2V7CLNU2mJaIVoU86tYAE8vUc-LtgXwOxuGaAZCO	2026-08-03 21:06:19.516913	f
275	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjY1ODUsImV4cCI6MTc4NTc3MTM4NSwidHlwZSI6InJlZnJlc2gifQ.gvoBxvWhG6-0NuZlTS-5wDRp4wA7o72bai1TNiJF_jU4y3Iw3peJM0PttSTGZrJI	2026-08-03 21:06:25.558141	f
276	14	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFyazEwNTkuc3NlQHNhdmVldGhhLmNvbSIsImlhdCI6MTc4NTE2NzQ4NywiZXhwIjoxNzg1NzcyMjg3LCJ0eXBlIjoicmVmcmVzaCJ9.w49kz9GUG6hcoN2gU6SZFGC8MaUfm-8gNyXGaMm3M6uCErXTomkRzbKPv1wYvznu	2026-08-03 21:21:27.949794	f
277	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjc0OTMsImV4cCI6MTc4NTc3MjI5MywidHlwZSI6InJlZnJlc2gifQ.kXriUYqG4aHL42h3j-ndHS0B4GTG0u2-ysi1Tfxkd5eRjyY9BSbARpcHoclrx4ka	2026-08-03 21:21:33.433031	f
278	14	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFyazEwNTkuc3NlQHNhdmVldGhhLmNvbSIsImlhdCI6MTc4NTE2NzUzNiwiZXhwIjoxNzg1NzcyMzM2LCJ0eXBlIjoicmVmcmVzaCJ9.1QOVBcmJ7-mD4NIZoTWn_w_3CACJZM1aGMpKg0tf4GoltvtGZizttW0KkYNk6b5S	2026-08-03 21:22:16.14752	f
279	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjc1NDUsImV4cCI6MTc4NTc3MjM0NSwidHlwZSI6InJlZnJlc2gifQ.IsEj-IRKr30bcmzgOx2W5xkFUVLfuZd4P2Vi2zH9eDwh_7D0_P8UHsD1ugdl_OnQ	2026-08-03 21:22:25.641233	f
280	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNjgxNTIsImV4cCI6MTc4NTc3Mjk1MiwidHlwZSI6InJlZnJlc2gifQ.O7pl2jkuuh9G_2REmicnyUkrRHepU7ndOisl3YiymEIX82SLOXhFhPV0XEwjCGqY	2026-08-03 21:32:32.360618	f
281	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDAzMiwiZXhwIjoxNzg1Nzc0ODMyLCJ0eXBlIjoicmVmcmVzaCJ9.yunK5YGHAgjxp_yRhExnEnMpyhZGD8e4bM6GJBnxRdZ7BMh52umNW1LKlZSEwFRH	2026-08-03 22:03:52.883726	f
282	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDI2MSwiZXhwIjoxNzg1Nzc1MDYxLCJ0eXBlIjoicmVmcmVzaCJ9.tsbB9hDFo1bRfXtWqDxzk-uHFnRT8BuRaFu38vOTgHdy5S62ZVMkLE3jBQ4ZELg0	2026-08-03 22:07:41.489968	f
283	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDMyMiwiZXhwIjoxNzg1Nzc1MTIyLCJ0eXBlIjoicmVmcmVzaCJ9.g3KPDPyLly1gOmtr_V6nIt_7gXG8F8zaUVo08pt7IST2K2C5gsMsObGL7psvXKiF	2026-08-03 22:08:42.630752	f
284	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDM4OSwiZXhwIjoxNzg1Nzc1MTg5LCJ0eXBlIjoicmVmcmVzaCJ9.D-AscfJd_Bi_vV12HpEYle-ixo_ar37Bc7-NNvR6w_RPhjB2uGjefDYKV9XJbqgt	2026-08-03 22:09:49.356418	f
285	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA0MDYsImV4cCI6MTc4NTc3NTIwNiwidHlwZSI6InJlZnJlc2gifQ.N31tNu56zadQbNJVnPtObnduRojMjej9QYgJE_2jU5q9P9Uip0wNUk3JkbHjdl9G	2026-08-03 22:10:06.99646	f
286	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDUwNCwiZXhwIjoxNzg1Nzc1MzA0LCJ0eXBlIjoicmVmcmVzaCJ9.xYavwjca-VDQOobEE5y30I4gwOZQh3Jf8WAkU_qB8kNoHjjo7tD0uXrNByQOXTQi	2026-08-03 22:11:44.301945	f
287	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDUxNiwiZXhwIjoxNzg1Nzc1MzE2LCJ0eXBlIjoicmVmcmVzaCJ9.AOCzpexpjNETppMRi-8qGdjbzj3HuXLzx7XoSd0wBajrNWg-ZuSCkNyvXpQuhW9u	2026-08-03 22:11:56.478221	f
288	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MDUyOSwiZXhwIjoxNzg1Nzc1MzI5LCJ0eXBlIjoicmVmcmVzaCJ9.Tp8tEDtsVhRoJNQV60ugGEbsj7hO6ozGC4OzpEEjY8wLEV8TJhFZ_ruCg1xorZCt	2026-08-03 22:12:09.965078	f
289	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MDU3OSwiZXhwIjoxNzg1Nzc1Mzc5LCJ0eXBlIjoicmVmcmVzaCJ9.GlsKBiku8tJot6aaEM9w2KEAf5v_d20pK8WhdwI9SoDiGWiDgwaV_Czlo3nVrWOq	2026-08-03 22:12:59.073547	f
290	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MDYwMCwiZXhwIjoxNzg1Nzc1NDAwLCJ0eXBlIjoicmVmcmVzaCJ9.6wf0v-QJ5UVCPLg0B_H8_sH54vNytKvb6zqUeXRCXQb6JyVMckMqFt9GeASEMolB	2026-08-03 22:13:20.654961	f
291	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MDY0NSwiZXhwIjoxNzg1Nzc1NDQ1LCJ0eXBlIjoicmVmcmVzaCJ9.LJbIOaMF6RlvtWMSxox8zPHNuWoICXHZEqoG3wbZJuDiZrM-WhgdvMdlfRvdnvef	2026-08-03 22:14:05.899653	f
292	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MDY1NSwiZXhwIjoxNzg1Nzc1NDU1LCJ0eXBlIjoicmVmcmVzaCJ9.2VlRVCzD7exDXPKEtTkywFJm1bSQx0o1LSOjbs2-9n0huJ4wXUKOZ9pYIjiohxpN	2026-08-03 22:14:15.74186	f
293	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA2NjUsImV4cCI6MTc4NTc3NTQ2NSwidHlwZSI6InJlZnJlc2gifQ.QzilVilbEHvchWv-MkWbs5oBfpySn3Tq2HcHZj2l_lFD4WngdcbOehvQa6Fs7m_R	2026-08-03 22:14:25.229372	f
294	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA2NzIsImV4cCI6MTc4NTc3NTQ3MiwidHlwZSI6InJlZnJlc2gifQ.5iDgZZN0onXtKzGLZukMZN9yZrKogKyMZRhBqByMcfHYqgVPdLNB1nUCb7qXXrV_	2026-08-03 22:14:32.231022	f
295	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA2ODgsImV4cCI6MTc4NTc3NTQ4OCwidHlwZSI6InJlZnJlc2gifQ.EaXXUVcf17AqtqGiVDlMtkISurT_AX1586olipjLzzD1562WoIBgB92ZQsLnjhZl	2026-08-03 22:14:48.169446	f
296	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA3MTEsImV4cCI6MTc4NTc3NTUxMSwidHlwZSI6InJlZnJlc2gifQ.998UXszR2eDmnHxmTYUc-p4jxBTXtsGZHm8R42-jBQcOwyGKgwFFsdDH5gHgVmHg	2026-08-03 22:15:11.275304	f
297	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzA5MTUsImV4cCI6MTc4NTc3NTcxNSwidHlwZSI6InJlZnJlc2gifQ.JKz4BQHCSPJmEuglhUjB1U43eXW-QAKYerwqqVBtcFYL2pFFUYvLdccLXLr83y-r	2026-08-03 22:18:35.585143	f
298	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTAyNiwiZXhwIjoxNzg1Nzc1ODI2LCJ0eXBlIjoicmVmcmVzaCJ9.6PyjomZ9dcUlP8UdiIJbW-0InWbNCGpcweVADHPKbhSaO38NIGJXV6RTdox2byDx	2026-08-03 22:20:26.549297	f
299	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTA0OSwiZXhwIjoxNzg1Nzc1ODQ5LCJ0eXBlIjoicmVmcmVzaCJ9.CIifkNcVa49yAfLTaxV5Ru7-QeEE-3hoF0bSzTyxupGsfLJ4r4_zV2_vLcdOoRnT	2026-08-03 22:20:49.146696	f
300	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTA3MCwiZXhwIjoxNzg1Nzc1ODcwLCJ0eXBlIjoicmVmcmVzaCJ9.P_3dE8BcZ4Nvck2XBNZUeotP683QDxXiRTtmZ-KvK3OuL-_vVQxpdMJ37z2B6PTJ	2026-08-03 22:21:10.202264	f
301	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTExOCwiZXhwIjoxNzg1Nzc1OTE4LCJ0eXBlIjoicmVmcmVzaCJ9.v2wejkcqWPIqvgUHJdDuqRTFro22OvevGt67yWQVH1yAwF6AOI60Y7rH0moeb2GX	2026-08-03 22:21:58.199139	f
302	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTEzMiwiZXhwIjoxNzg1Nzc1OTMyLCJ0eXBlIjoicmVmcmVzaCJ9.fOuiBSfcIMAIbwkMlzQ-IxgHWGcf_wEJT8qBg1YSH72IFrbwwVh-z-qSrCUM5ke6	2026-08-03 22:22:12.907241	f
303	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTE2MywiZXhwIjoxNzg1Nzc1OTYzLCJ0eXBlIjoicmVmcmVzaCJ9.fbLLdqjl2p0SwVabWMMpikDkoqcGRa6vdFjypUwQW6Ab9-GJ0x4AA7BSpqshL2Yy	2026-08-03 22:22:43.764846	f
304	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MTE3NywiZXhwIjoxNzg1Nzc1OTc3LCJ0eXBlIjoicmVmcmVzaCJ9.SYqYoCoyUiYD_8jn3jtRePK3Zbgi5wgFtFVSmHDNPMVtAQ3tYy6TodLq1zFj_04j	2026-08-03 22:22:57.030931	f
305	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTE3MTU0MSwiZXhwIjoxNzg1Nzc2MzQxLCJ0eXBlIjoicmVmcmVzaCJ9.5834mtXM-aGh3W3rBWSoZbPlVPtCAgdh5Rglh92YYODi88kLAxW1U3xQ2T3mqGfF	2026-08-03 22:29:01.272919	f
306	2	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJwcml5YUBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUxNzE1NTksImV4cCI6MTc4NTc3NjM1OSwidHlwZSI6InJlZnJlc2gifQ.6HlqzuTN733qPgCDLsSwMs2OczDaBMJa2gLPzlwIv_MDekqIDA_TdkGA0djmDLPD	2026-08-03 22:29:19.414568	f
307	15	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBscnVwLmNvbSIsImlhdCI6MTc4NTE3MTU2NiwiZXhwIjoxNzg1Nzc2MzY2LCJ0eXBlIjoicmVmcmVzaCJ9.psjnJOuUqFgbJM0LbL_KCp1nN7xCo1H7_1mHw4ePLSq2RSgppzGONbC6wJXTI6AB	2026-08-03 22:29:26.912262	f
308	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMTUwODQsImV4cCI6MTc4NTgxOTg4NCwidHlwZSI6InJlZnJlc2gifQ.UG74ddr6qgGi07UBObCotwkNuqV54dOVmSp-TAe_Pun4Gbms8SFaEhJJPsBXWyrd	2026-08-04 10:34:44.617044	f
309	6	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFya3Byb2ZAZ21haWwuY29tIiwiaWF0IjoxNzg1MjE2Mjk0LCJleHAiOjE3ODU4MjEwOTQsInR5cGUiOiJyZWZyZXNoIn0.pGJkRc_XTJBbbuw9S4XJZSEzfc-uUNFMBWG1KdMCjoX2Se4yYVjFRbe6PeaoKFEr	2026-08-04 10:54:54.154734	f
310	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMTk0OTUsImV4cCI6MTc4NTgyNDI5NSwidHlwZSI6InJlZnJlc2gifQ.NjsbroagEkxS8oA0c3YnZGAy1r7eMeWBnOx-xsdHPRYWN33GnYDA8dcDZVJkikLp	2026-08-04 11:48:15.844024	f
311	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjE1MzMsImV4cCI6MTc4NTgyNjMzMywidHlwZSI6InJlZnJlc2gifQ.ntmujKPD0GOOfWfbbESj0JtVfyHdNgTXby46eGIxBsujva0u9xfeHqwS6WV6YsUW	2026-08-04 12:22:13.724867	f
312	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjE1NDMsImV4cCI6MTc4NTgyNjM0MywidHlwZSI6InJlZnJlc2gifQ.Z4q98hPJpaf_5lhBvchJRC57vTv-H9pJNnuBCaOC7k9rvKNdRjyXWcx7f8LhumqB	2026-08-04 12:22:23.708904	f
313	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjE2NzUsImV4cCI6MTc4NTgyNjQ3NSwidHlwZSI6InJlZnJlc2gifQ.DZfYVeCgDZSxEEphpbTGRQnyk9fulyXzWHiptuAyWC9IABN0ljG7oWokG5PrKE9b	2026-08-04 12:24:35.94745	f
314	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MjIzMDQ0LCJleHAiOjE3ODU4Mjc4NDQsInR5cGUiOiJyZWZyZXNoIn0.uq2neh36OohuBYEyRb5QcXt59eklse4whHafkHS8u34qUQFT_MRyolB80BZf0b23	2026-08-04 12:47:24.3891	f
315	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjMwNzAsImV4cCI6MTc4NTgyNzg3MCwidHlwZSI6InJlZnJlc2gifQ.-yAgTVyy8WnMVAcU7h7aq2XxAiqUK5rLf2t4pYyLc8tweX5XPy0vQxLr5coTzMNX	2026-08-04 12:47:50.380892	f
316	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjMzNzUsImV4cCI6MTc4NTgyODE3NSwidHlwZSI6InJlZnJlc2gifQ.di90KnbVdtPMUD-a7OHEe-SJVhtnZ4TtyYAJ7bJOJiKp0QPUs4NvHRqi6REXFt27	2026-08-04 12:52:55.632535	f
317	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjQ0MjIsImV4cCI6MTc4NTgyOTIyMiwidHlwZSI6InJlZnJlc2gifQ.XMqt8CoWzAI0jR6QNdG1ZbsLylbSbypGekKuvX8W29Gu-6gaWL5NMwfw59hG6EF6	2026-08-04 13:10:22.653755	f
318	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MjI0NDc4LCJleHAiOjE3ODU4MjkyNzgsInR5cGUiOiJyZWZyZXNoIn0.crelZ5WwGRUmgnbdVezJsefKia1kr8aLoSJ-Y4UPp7oKAuYZNfBRub815ZLV5o0x	2026-08-04 13:11:18.712674	f
319	6	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzZWx2YWt1bWFya3Byb2ZAZ21haWwuY29tIiwiaWF0IjoxNzg1MjI0NzcyLCJleHAiOjE3ODU4Mjk1NzIsInR5cGUiOiJyZWZyZXNoIn0.stIvz6GFTZgpgvVnrbjMHBRjsWzAIUelNHa-ew8uSeIpc7xzSvMtir2i2qhi_337	2026-08-04 13:16:12.645256	f
320	8	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdXJlc2hAZGVtb3VuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzg1MjI1MDAzLCJleHAiOjE3ODU4Mjk4MDMsInR5cGUiOiJyZWZyZXNoIn0.fc-zsluI13sNcxzJ8UFSwsSOexY7yrKa2cmIgBvTghLvOd1Y__r-jqtO_QbKYCEG	2026-08-04 13:20:03.992178	f
321	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUyMjUwMzAsImV4cCI6MTc4NTgyOTgzMCwidHlwZSI6InJlZnJlc2gifQ.2XqPMH97U3GtnvdiHC8B6-MmY1FJseJJfINGolugGwiJk-lSu2ehUgjnqwShn-Z0	2026-08-04 13:20:30.269116	f
322	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTIyNTAzNiwiZXhwIjoxNzg1ODI5ODM2LCJ0eXBlIjoicmVmcmVzaCJ9.BpwDa72x3HSkIH9X4oQoAhzBOY6YT0NFpYAz_3RU5wwdFT3Hia2YcEThpzGq3b6X	2026-08-04 13:20:36.902002	f
323	4	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcnVuQGRlbW91bml2ZXJzaXR5LmVkdSIsImlhdCI6MTc4NTMyOTc0NSwiZXhwIjoxNzg1OTM0NTQ1LCJ0eXBlIjoicmVmcmVzaCJ9.yFnpk0aUZfnHFWVT8xnXN3fDU8gAASbk8EF0yfn8jblUDLqR1U5y5-kwktScyd5t	2026-08-05 18:25:45.116038	f
324	1	eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBkZW1vdW5pdmVyc2l0eS5lZHUiLCJpYXQiOjE3ODUzMjk3NTQsImV4cCI6MTc4NTkzNDU1NCwidHlwZSI6InJlZnJlc2gifQ.E8zhD0GhobrfAp3tkRYhODbtIu1HsTmyAOgrpT2WpLlp5gaWNLeUTwQlU0bECoYE	2026-08-05 18:25:54.248655	f
\.


--
-- Data for Name: report_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_history (id, report_type, file_name, file_path, format, status, generated_at, generated_by, generated_by_name, created_at) FROM stdin;
1	EQUIPMENT_UTILIZATION	equipment_utilization_report_20260728_114858.xlsx	D:\\Placement\\Infosys\\Springboard\\lab_resource_management\\lab-resource-backend\\.\\uploads\\reports\\equipment_utilization_report_20260728_114858.xlsx	EXCEL	COMPLETED	2026-07-28 11:48:59.724833	1	Admin System	2026-07-28 11:48:59.724832
\.


--
-- Data for Name: role_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_config (id, role_name, description, enabled, created_at, updated_at) FROM stdin;
2	STUDENT	Students with equipment access	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
3	LAB_TECHNICIAN	Technical staff for equipment maintenance	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
4	LAB_MANAGER	Manages laboratory operations	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
5	DEPARTMENT_HEAD	Head of department	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
6	INSTITUTION_ADMIN	Manages institution-level operations	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
7	SYSTEM_ADMIN	Full system access	t	2026-07-24 09:59:46.81243	2026-07-24 09:59:46.81243
1	RESEARCHER	Can view and book equipment	t	2026-07-24 09:59:46.81243	2026-07-27 19:57:51.29484
\.


--
-- Data for Name: shared_equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shared_equipment (id, equipment_id, hourly_rate, daily_rate, security_deposit, sharing_status, created_at) FROM stdin;
1	1	500.00	1000.00	250.00	ACTIVE	2026-07-26 12:07:00.203787
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, phone, password, institution_id, department_id, role, status, profile_image_url, oauth_provider, oauth_provider_id, created_at, updated_at) FROM stdin;
1	Admin	System	admin@demouniversity.edu	+91-9999999999	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	\N	SYSTEM_ADMIN	t	\N	\N	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
2	Priya	Sharma	priya@demouniversity.edu	+91-9876543210	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	1	LAB_MANAGER	t	\N	\N	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
3	Rajesh	Kumar	rajesh@demouniversity.edu	+91-9876543211	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	1	LAB_TECHNICIAN	t	\N	\N	\N	2026-07-22 21:28:54.034297	2026-07-22 21:28:54.034297
7	Meena	Iyer	meena@demouniversity.edu	+91-9876543214	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	1	DEPARTMENT_HEAD	t	\N	\N	\N	2026-07-23 20:34:25.248855	2026-07-23 20:34:25.248855
6	Selvakumar	K	selvakumarkprof@gmail.com	07639072595	OAUTH_USER_NO_PASSWORD	2	5	RESEARCHER	t	\N	google	109821194330815595851	2026-07-23 20:05:56.387051	2026-07-23 21:25:39.913072
8	Suresh	Nair	suresh@demouniversity.edu	+91-9876543215	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	\N	INSTITUTION_ADMIN	t	\N	\N	\N	2026-07-23 20:34:25.248855	2026-07-24 19:17:27.725319
4	Arun	Kumar	arun@demouniversity.edu	+91-9876543212	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	1	RESEARCHER	t	\N	\N	\N	2026-07-22 21:28:54.034297	2026-07-27 21:22:35.398664
5	Sneha	Patel	sneha@demouniversity.edu	+91-9876543213	$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK	1	2	RESEARCHER	t	\N	\N	\N	2026-07-22 21:28:54.034297	2026-07-27 21:22:37.481269
14	SELVAKUMAR	K	selvakumark1059.sse@saveetha.com	\N	$2a$10$zqe8jQ88uubWqWrc9xlyb.Zer8xbONEMkQQ/zpagFJ2C6xOtxV59u	3	\N	STUDENT	t	\N	google	110932315771297634851	2026-07-27 20:37:30.975991	2026-07-27 21:32:40.98225
15	System	Admin	admin@lrup.com	\N	$2a$10$VjN6F93n24qT8FmhkUJOI.A/U8jbaiVLzLpI5lj82vZIZpOex4F32	1	1	SYSTEM_ADMIN	t	\N	\N	\N	2026-07-27 22:03:45.49506	2026-07-27 22:03:45.49506
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 2, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 224, true);


--
-- Name: booking_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_history_id_seq', 25, true);


--
-- Name: booking_waitlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_waitlist_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 14, true);


--
-- Name: calibration_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calibration_records_id_seq', 1, false);


--
-- Name: department_budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_budgets_id_seq', 2, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 5, true);


--
-- Name: equipment_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_categories_id_seq', 10, true);


--
-- Name: equipment_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_documents_id_seq', 1, false);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 6, true);


--
-- Name: equipment_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_tags_id_seq', 15, true);


--
-- Name: external_booking_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_booking_requests_id_seq', 2, true);


--
-- Name: institution_partnerships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.institution_partnerships_id_seq', 5, true);


--
-- Name: institutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.institutions_id_seq', 3, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 3, true);


--
-- Name: laboratories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.laboratories_id_seq', 6, true);


--
-- Name: maintenance_work_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_work_orders_id_seq', 17, true);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 28, true);


--
-- Name: notification_retry_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_retry_queue_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 40, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 2, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 324, true);


--
-- Name: report_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_history_id_seq', 1, true);


--
-- Name: role_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_config_id_seq', 7, true);


--
-- Name: shared_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shared_equipment_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_history booking_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_history
    ADD CONSTRAINT booking_history_pkey PRIMARY KEY (id);


--
-- Name: booking_waitlist booking_waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_waitlist
    ADD CONSTRAINT booking_waitlist_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: calibration_records calibration_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calibration_records
    ADD CONSTRAINT calibration_records_pkey PRIMARY KEY (id);


--
-- Name: department_budgets department_budgets_department_id_fiscal_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_budgets
    ADD CONSTRAINT department_budgets_department_id_fiscal_year_key UNIQUE (department_id, fiscal_year);


--
-- Name: department_budgets department_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_budgets
    ADD CONSTRAINT department_budgets_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: equipment_categories equipment_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories
    ADD CONSTRAINT equipment_categories_category_name_key UNIQUE (category_name);


--
-- Name: equipment_categories equipment_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories
    ADD CONSTRAINT equipment_categories_pkey PRIMARY KEY (id);


--
-- Name: equipment_documents equipment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_equipment_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_equipment_code_key UNIQUE (equipment_code);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: equipment_tag_mappings equipment_tag_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_mappings
    ADD CONSTRAINT equipment_tag_mappings_pkey PRIMARY KEY (equipment_id, tag_id);


--
-- Name: equipment_tags equipment_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tags
    ADD CONSTRAINT equipment_tags_pkey PRIMARY KEY (id);


--
-- Name: equipment_tags equipment_tags_tag_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tags
    ADD CONSTRAINT equipment_tags_tag_name_key UNIQUE (tag_name);


--
-- Name: external_booking_requests external_booking_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests
    ADD CONSTRAINT external_booking_requests_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: institution_partnerships institution_partnerships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_partnerships
    ADD CONSTRAINT institution_partnerships_pkey PRIMARY KEY (id);


--
-- Name: institutions institutions_institution_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_institution_code_key UNIQUE (institution_code);


--
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: laboratories laboratories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT laboratories_pkey PRIMARY KEY (id);


--
-- Name: maintenance_work_orders maintenance_work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_work_orders
    ADD CONSTRAINT maintenance_work_orders_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_notification_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_notification_type_key UNIQUE (user_id, notification_type);


--
-- Name: notification_retry_queue notification_retry_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_retry_queue
    ADD CONSTRAINT notification_retry_queue_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: report_history report_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_pkey PRIMARY KEY (id);


--
-- Name: role_config role_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_config
    ADD CONSTRAINT role_config_pkey PRIMARY KEY (id);


--
-- Name: role_config role_config_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_config
    ADD CONSTRAINT role_config_role_name_key UNIQUE (role_name);


--
-- Name: shared_equipment shared_equipment_equipment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_equipment
    ADD CONSTRAINT shared_equipment_equipment_id_key UNIQUE (equipment_id);


--
-- Name: shared_equipment shared_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_equipment
    ADD CONSTRAINT shared_equipment_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences ukcpgk6y52p40u03cbnceol2x3f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT ukcpgk6y52p40u03cbnceol2x3f UNIQUE (user_id, notification_type);


--
-- Name: department_budgets ukrck7v6udlpf39u7s7w09tsmx6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_budgets
    ADD CONSTRAINT ukrck7v6udlpf39u7s7w09tsmx6 UNIQUE (department_id, fiscal_year);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_announcements_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_created_by ON public.announcements USING btree (created_by);


--
-- Name: idx_announcements_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_priority ON public.announcements USING btree (priority);


--
-- Name: idx_announcements_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_published ON public.announcements USING btree (published);


--
-- Name: idx_announcements_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_type ON public.announcements USING btree (announcement_type);


--
-- Name: idx_audit_logs_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_module ON public.audit_logs USING btree (module);


--
-- Name: idx_audit_logs_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_time ON public.audit_logs USING btree (action_time);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_bookings_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);


--
-- Name: idx_bookings_equipment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_equipment ON public.bookings USING btree (equipment_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (booking_status);


--
-- Name: idx_bookings_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_user ON public.bookings USING btree (user_id);


--
-- Name: idx_equipment_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_category ON public.equipment USING btree (category_id);


--
-- Name: idx_equipment_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_code ON public.equipment USING btree (equipment_code);


--
-- Name: idx_equipment_laboratory; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_laboratory ON public.equipment USING btree (laboratory_id);


--
-- Name: idx_equipment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_status ON public.equipment USING btree (status);


--
-- Name: idx_maintenance_equipment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_equipment ON public.maintenance_work_orders USING btree (equipment_id);


--
-- Name: idx_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_status ON public.maintenance_work_orders USING btree (status);


--
-- Name: idx_notification_preferences_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_preferences_user ON public.notification_preferences USING btree (user_id);


--
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_report_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_history_user ON public.report_history USING btree (generated_by);


--
-- Name: idx_retry_queue_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retry_queue_pending ON public.notification_retry_queue USING btree (status, next_retry_at) WHERE ((status)::text = 'PENDING'::text);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_department ON public.users USING btree (department_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_institution; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_institution ON public.users USING btree (institution_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: announcements announcements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: announcements announcements_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: booking_history booking_history_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_history
    ADD CONSTRAINT booking_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_history booking_history_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_history
    ADD CONSTRAINT booking_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: booking_waitlist booking_waitlist_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_waitlist
    ADD CONSTRAINT booking_waitlist_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: booking_waitlist booking_waitlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_waitlist
    ADD CONSTRAINT booking_waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: bookings bookings_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: bookings bookings_recurrence_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_recurrence_parent_id_fkey FOREIGN KEY (recurrence_parent_id) REFERENCES public.bookings(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: calibration_records calibration_records_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calibration_records
    ADD CONSTRAINT calibration_records_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: department_budgets department_budgets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_budgets
    ADD CONSTRAINT department_budgets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: departments departments_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: equipment equipment_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.equipment_categories(id);


--
-- Name: equipment_documents equipment_documents_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment equipment_laboratory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_laboratory_id_fkey FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(id);


--
-- Name: equipment_tag_mappings equipment_tag_mappings_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_mappings
    ADD CONSTRAINT equipment_tag_mappings_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_tag_mappings equipment_tag_mappings_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_mappings
    ADD CONSTRAINT equipment_tag_mappings_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.equipment_tags(id) ON DELETE CASCADE;


--
-- Name: external_booking_requests external_booking_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests
    ADD CONSTRAINT external_booking_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: external_booking_requests external_booking_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests
    ADD CONSTRAINT external_booking_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: external_booking_requests external_booking_requests_requesting_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests
    ADD CONSTRAINT external_booking_requests_requesting_institution_id_fkey FOREIGN KEY (requesting_institution_id) REFERENCES public.institutions(id);


--
-- Name: external_booking_requests external_booking_requests_shared_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_booking_requests
    ADD CONSTRAINT external_booking_requests_shared_equipment_id_fkey FOREIGN KEY (shared_equipment_id) REFERENCES public.shared_equipment(id);


--
-- Name: departments fk_dept_hod; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_dept_hod FOREIGN KEY (hod_user_id) REFERENCES public.users(id);


--
-- Name: users fk_user_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users fk_user_institution; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: institution_partnerships institution_partnerships_institution_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_partnerships
    ADD CONSTRAINT institution_partnerships_institution_a_id_fkey FOREIGN KEY (institution_a_id) REFERENCES public.institutions(id);


--
-- Name: institution_partnerships institution_partnerships_institution_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_partnerships
    ADD CONSTRAINT institution_partnerships_institution_b_id_fkey FOREIGN KEY (institution_b_id) REFERENCES public.institutions(id);


--
-- Name: invoices invoices_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: invoices invoices_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: laboratories laboratories_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT laboratories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: laboratories laboratories_lab_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT laboratories_lab_manager_id_fkey FOREIGN KEY (lab_manager_id) REFERENCES public.users(id);


--
-- Name: maintenance_work_orders maintenance_work_orders_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_work_orders
    ADD CONSTRAINT maintenance_work_orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: maintenance_work_orders maintenance_work_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_work_orders
    ADD CONSTRAINT maintenance_work_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: maintenance_work_orders maintenance_work_orders_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_work_orders
    ADD CONSTRAINT maintenance_work_orders_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_retry_queue notification_retry_queue_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_retry_queue
    ADD CONSTRAINT notification_retry_queue_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: report_history report_history_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: shared_equipment shared_equipment_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_equipment
    ADD CONSTRAINT shared_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- PostgreSQL database dump complete
--

\unrestrict FarfhmgKD5x8YOIK9vnH4CTNTjnxwD0vnuYhztjaa1Gu6rHqmcWGqt1dCcgPHFq

