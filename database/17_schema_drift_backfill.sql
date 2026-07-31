-- ============================================================
-- Migration 17: backfill columns that only ever existed via ddl-auto=update
--
-- These five columns are declared on entities but were never added to any script in
-- this directory, so they existed only in databases Hibernate had been allowed to
-- alter. That made the committed SQL an incomplete description of the schema and
-- blocked ddl-auto=validate in production.
--
-- Found by diffing a database built from these scripts against one built by Hibernate
-- from the entities; the types below are copied from what Hibernate itself emits, so
-- validate agrees rather than merely tolerating them.
--
-- All are nullable with no default, matching the entity declarations: absent means
-- "not configured", which the utilization and sharing code already handles.
-- ============================================================

-- Utilization target: the percentage a department/institution is measured against.
-- NULL falls back to app.utilization.default-target-percent.
ALTER TABLE department
    ADD COLUMN IF NOT EXISTS utilization_target_percent DOUBLE PRECISION;

ALTER TABLE institution
    ADD COLUMN IF NOT EXISTS utilization_target_percent DOUBLE PRECISION;

-- Links a single access request to the standing agreement it was granted under, and
-- records the rate actually applied. Both are NULL for ad-hoc requests made with no
-- agreement in place, which remains a valid path.
ALTER TABLE sharing_request
    ADD COLUMN IF NOT EXISTS agreement_id BIGINT;

ALTER TABLE sharing_request
    ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);

-- Added separately from the column so re-running against a database where Hibernate
-- already created the column (but not the constraint) still installs it.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_sharing_request_agreement'
    ) THEN
        ALTER TABLE sharing_request
            ADD CONSTRAINT fk_sharing_request_agreement
            FOREIGN KEY (agreement_id) REFERENCES sharing_agreement(agreement_id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Deadline for a notified user to claim a freed slot before it passes to the next in
-- line. Swept by WaitlistOfferExpiryJob; NULL means no offer is outstanding.
ALTER TABLE waitlist
    ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_waitlist_offer_expires ON waitlist(offer_expires_at);
