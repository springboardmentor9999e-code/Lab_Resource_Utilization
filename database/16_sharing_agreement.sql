-- ============================================================
-- Migration 16: sharing_agreement
--
-- Backfills DDL that was never written. The SharingAgreement entity has existed
-- since the inter-institution sharing work (migration 10), but only Hibernate's
-- ddl-auto=update ever created its table -- so a clone of this repo that builds
-- its database from these files alone ended up without it, and ddl-auto=validate
-- could not be turned on.
--
-- IF NOT EXISTS is load-bearing here, not boilerplate: existing databases already
-- have this table courtesy of Hibernate, and this migration must be a no-op there.
-- ============================================================

CREATE TABLE IF NOT EXISTS sharing_agreement (
    agreement_id          BIGSERIAL PRIMARY KEY,

    -- Direction matters. from_institution is granted access to equipment owned by
    -- to_institution. A reciprocal arrangement is two rows, so each direction can
    -- carry its own rate and quota.
    from_institution_id   BIGINT NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    to_institution_id     BIGINT NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,

    title                 VARCHAR(150) NOT NULL,

    -- PROPOSED | ACTIVE | SUSPENDED | EXPIRED | TERMINATED
    status                VARCHAR(20) NOT NULL DEFAULT 'PROPOSED',

    start_date            DATE NOT NULL,
    -- NULL means open-ended: the agreement runs until somebody terminates it.
    end_date              DATE,

    discount_percent      DECIMAL(5,2) DEFAULT 0,
    max_hours_per_month   INTEGER,
    auto_approve          BOOLEAN DEFAULT FALSE,
    terms                 TEXT,

    -- SET NULL rather than CASCADE: deleting the staff member who drafted an
    -- agreement must not delete the agreement between the two institutions.
    created_by            BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    approved_by           BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,

    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- An institution sharing with itself is not an agreement, it is a data error.
    CONSTRAINT ck_agreement_distinct_parties CHECK (from_institution_id <> to_institution_id),
    CONSTRAINT ck_agreement_discount_range   CHECK (discount_percent >= 0 AND discount_percent <= 100),
    -- end_date NULL is allowed; when present it may not precede the start.
    CONSTRAINT ck_agreement_date_order       CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Index names match the @Index declarations on the entity so that a future
-- ddl-auto=validate run sees the same schema Hibernate would have produced.
CREATE INDEX IF NOT EXISTS idx_agreement_from ON sharing_agreement(from_institution_id);
CREATE INDEX IF NOT EXISTS idx_agreement_to   ON sharing_agreement(to_institution_id);

-- SharingAgreementExpiryJob scans for ACTIVE agreements whose end_date has passed.
CREATE INDEX IF NOT EXISTS idx_agreement_status_end ON sharing_agreement(status, end_date);
