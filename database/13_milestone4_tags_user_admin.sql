-- ============================================================
-- Migration 13 — Milestone 4 gap-closure
--   (1) Equipment free-form tags (categorization & tagging)
--   Run: psql -U postgres -d lab_resource_db -f 13_milestone4_tags_user_admin.sql
-- ============================================================

-- ---------- (1) Equipment tagging ----------
-- Comma-separated, normalized-lowercase tags, e.g. 'high-voltage,shared,teaching-lab'.
-- Searched by the equipment list endpoint (?search=) alongside name/code/category.
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS tags TEXT;

-- Speeds up ILIKE '%tag%' searches on larger catalogs
CREATE INDEX IF NOT EXISTS idx_equipment_tags ON equipment(tags);

-- Note: profile management (PUT /api/users/me, POST /api/users/me/change-password)
-- and admin user/role management (GET /api/users, PUT /api/users/{id}/roles,
-- PATCH /api/users/{id}/active) reuse existing app_user / role / user_role tables —
-- no schema change required for them.
