/**
 * Renders the platform's EER diagram to a 4K-ready SVG.
 *
 *   node database/tools/generate_eer_diagram.mjs
 *
 * Writes database/eer-diagram.svg (3840 x 2160) plus eer-diagram.html, which
 * exists only so a headless browser can rasterize it to a 4K PNG:
 *
 *   # Windows
 *   "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless \
 *     --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
 *     --window-size=3840,2160 \
 *     --screenshot=database/eer-diagram-4k.png database/eer-diagram.html
 *
 *   # Linux / macOS — any of chromium, google-chrome, rsvg-convert, or:
 *   magick -density 96 database/eer-diagram.svg database/eer-diagram-4k.png
 *
 * The schema below mirrors database/EER_DIAGRAM.md and the numbered migration
 * scripts. Change a column here only when a migration changes it, so the
 * picture cannot drift away from the database.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const W = 3840;
const H = 2160;
const MARGIN = 40;
const TITLE_H = 118;

const CARD_W = 580;
const CARD_HEAD_H = 42;
const ROW_H = 24;
const CARD_PAD_B = 6;
const CARD_GAP = 20;

const SEC_PAD = 14;
const SEC_HEAD_H = 38;
const SEC_GAP = 22;
const ROW_GAP = 28;

const BAND_H = 118;

const cardHeight = (n) => CARD_HEAD_H + n * ROW_H + CARD_PAD_B;

// ---------------------------------------------------------------------------
// Schema — 25 tables. [name, type, keys, refTable]
// ---------------------------------------------------------------------------

const T = {
  institution: [
    ['institution_id', 'BIGSERIAL', 'PK'],
    ['name', 'VARCHAR(150)', 'UK'],
    ['code', 'VARCHAR(30)', 'UK'],
    ['email', 'VARCHAR(150)'],
    ['phone', 'VARCHAR(20)'],
    ['address', 'VARCHAR(255)'],
    ['website', 'VARCHAR(150)'],
    ['is_active', 'BOOLEAN'],
    ['utilization_target_percent', 'DOUBLE'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  department: [
    ['department_id', 'BIGSERIAL', 'PK'],
    ['institution_id', 'BIGINT', 'FK', 'institution'],
    ['name', 'VARCHAR(150)'],
    ['code', 'VARCHAR(30)'],
    ['description', 'VARCHAR(255)'],
    ['is_active', 'BOOLEAN'],
    ['annual_budget', 'DECIMAL(14,2)'],
    ['utilization_target_percent', 'DOUBLE'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  role: [
    ['role_id', 'BIGSERIAL', 'PK'],
    ['role_name', 'VARCHAR(50)', 'UK'],
    ['description', 'VARCHAR(255)'],
    ['is_system_role', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  app_user: [
    ['user_id', 'BIGSERIAL', 'PK'],
    ['institution_id', 'BIGINT', 'FK', 'institution'],
    ['department_id', 'BIGINT', 'FK', 'department'],
    ['username', 'VARCHAR(50)', 'UK'],
    ['email', 'VARCHAR(150)', 'UK'],
    ['password', 'VARCHAR(255)'],
    ['first_name', 'VARCHAR(50)'],
    ['last_name', 'VARCHAR(50)'],
    ['phone', 'VARCHAR(20)'],
    ['gender', 'VARCHAR(10)'],
    ['status', 'VARCHAR(20)'],
    ['auth_provider', 'VARCHAR(20)'],
    ['is_active', 'BOOLEAN'],
    ['is_verified', 'BOOLEAN'],
    ['sms_notifications_enabled', 'BOOLEAN'],
    ['push_notifications_enabled', 'BOOLEAN'],
    ['last_login_at', 'TIMESTAMP'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  user_role: [
    ['user_id', 'BIGINT', 'PK,FK', 'app_user'],
    ['role_id', 'BIGINT', 'PK,FK', 'role'],
    ['created_at', 'TIMESTAMP'],
  ],
  refresh_token: [
    ['token_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['token', 'VARCHAR(255)', 'UK'],
    ['expires_at', 'TIMESTAMP'],
    ['revoked', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
  ],
  password_reset_token: [
    ['token_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['token', 'VARCHAR(255)', 'UK'],
    ['otp', 'VARCHAR(10)'],
    ['otp_verified', 'BOOLEAN'],
    ['attempts', 'INTEGER'],
    ['expires_at', 'TIMESTAMP'],
    ['is_used', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
  ],

  lab: [
    ['lab_id', 'BIGSERIAL', 'PK'],
    ['name', 'VARCHAR(150)'],
    ['code', 'VARCHAR(30)', 'UK'],
    ['capacity', 'INTEGER'],
    ['location', 'VARCHAR(255)'],
    ['department_id', 'BIGINT', 'FK', 'department'],
    ['institution_id', 'BIGINT', 'FK', 'institution'],
    ['is_active', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  equipment: [
    ['equipment_id', 'BIGSERIAL', 'PK'],
    ['equipment_name', 'VARCHAR(150)'],
    ['equipment_code', 'VARCHAR(50)', 'UK'],
    ['category', 'VARCHAR(80)'],
    ['manufacturer', 'VARCHAR(120)'],
    ['model', 'VARCHAR(120)'],
    ['serial_number', 'VARCHAR(120)'],
    ['purchase_date', 'DATE'],
    ['warranty_expiry', 'DATE'],
    ['vendor', 'VARCHAR(150)'],
    ['cost', 'DECIMAL(14,2)'],
    ['hourly_rate', 'DECIMAL(10,2)'],
    ['status', 'VARCHAR(30)'],
    ['current_location', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['specifications', 'TEXT'],
    ['tags', 'VARCHAR(255)'],
    ['qr_code', 'VARCHAR(255)'],
    ['rfid_tag', 'VARCHAR(120)'],
    ['is_shareable', 'BOOLEAN'],
    ['lab_id', 'BIGINT', 'FK', 'lab'],
    ['department_id', 'BIGINT', 'FK', 'department'],
    ['institution_id', 'BIGINT', 'FK', 'institution'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  equipment_image: [
    ['image_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['image_url', 'VARCHAR(500)'],
    ['file_name', 'VARCHAR(255)'],
    ['is_primary', 'BOOLEAN'],
    ['uploaded_by', 'VARCHAR(50)'],
    ['uploaded_at', 'TIMESTAMP'],
  ],
  equipment_document: [
    ['document_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['document_type', 'VARCHAR(50)'],
    ['title', 'VARCHAR(255)'],
    ['file_url', 'VARCHAR(500)'],
    ['file_name', 'VARCHAR(255)'],
    ['file_size', 'BIGINT'],
    ['uploaded_by', 'VARCHAR(50)'],
    ['uploaded_at', 'TIMESTAMP'],
  ],

  booking: [
    ['booking_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['recurring_id', 'BIGINT', 'FK', 'recurring_booking'],
    ['booking_date', 'DATE'],
    ['start_time', 'TIME'],
    ['end_time', 'TIME'],
    ['status', 'VARCHAR(30)'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  booking_history: [
    ['history_id', 'BIGSERIAL', 'PK'],
    ['booking_id', 'BIGINT', 'FK', 'booking'],
    ['old_status', 'VARCHAR(30)'],
    ['new_status', 'VARCHAR(30)'],
    ['changed_by', 'VARCHAR(50)'],
    ['remarks', 'VARCHAR(500)'],
    ['changed_at', 'TIMESTAMP'],
  ],
  recurring_booking: [
    ['recurring_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['frequency', 'VARCHAR(20)'],
    ['start_date', 'DATE'],
    ['end_date', 'DATE'],
    ['start_time', 'TIME'],
    ['end_time', 'TIME'],
    ['status', 'VARCHAR(20)'],
    ['occurrences_created', 'INTEGER'],
    ['occurrences_skipped', 'INTEGER'],
    ['created_at', 'TIMESTAMP'],
  ],
  waitlist: [
    ['waitlist_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['requested_date', 'DATE'],
    ['start_time', 'TIME'],
    ['end_time', 'TIME'],
    ['priority', 'INTEGER'],
    ['status', 'VARCHAR(20)'],
    ['requested_at', 'TIMESTAMP'],
    ['notified_at', 'TIMESTAMP'],
    ['offer_expires_at', 'TIMESTAMP'],
  ],

  equipment_usage: [
    ['usage_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['booking_id', 'BIGINT', 'FK', 'booking'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['start_time', 'TIMESTAMP'],
    ['end_time', 'TIMESTAMP'],
    ['usage_duration_min', 'INTEGER'],
    ['created_at', 'TIMESTAMP'],
  ],

  maintenance_request: [
    ['request_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['requested_by', 'BIGINT', 'FK', 'app_user'],
    ['assigned_to', 'BIGINT', 'FK', 'app_user'],
    ['type', 'VARCHAR(30)'],
    ['priority', 'VARCHAR(20)'],
    ['title', 'VARCHAR(200)'],
    ['description', 'TEXT'],
    ['status', 'VARCHAR(30)'],
    ['scheduled_date', 'DATE'],
    ['started_at', 'TIMESTAMP'],
    ['completed_at', 'TIMESTAMP'],
    ['downtime_minutes', 'INTEGER'],
    ['resolution_notes', 'TEXT'],
    ['cost', 'DECIMAL(12,2)'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  maintenance_schedule: [
    ['schedule_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['created_by', 'BIGINT', 'FK', 'app_user'],
    ['maintenance_type', 'VARCHAR(30)'],
    ['interval_days', 'INTEGER'],
    ['next_due_date', 'DATE'],
    ['last_generated_date', 'DATE'],
    ['notes', 'VARCHAR(500)'],
    ['active', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
  ],
  equipment_calibration: [
    ['calibration_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['calibration_date', 'DATE'],
    ['next_due_date', 'DATE'],
    ['certificate_number', 'VARCHAR(100)'],
    ['calibrated_by', 'VARCHAR(150)'],
    ['remarks', 'VARCHAR(500)'],
    ['created_by', 'BIGINT', 'FK', 'app_user'],
    ['reminder_sent', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
  ],

  sharing_agreement: [
    ['agreement_id', 'BIGSERIAL', 'PK'],
    ['from_institution_id', 'BIGINT', 'FK', 'institution'],
    ['to_institution_id', 'BIGINT', 'FK', 'institution'],
    ['title', 'VARCHAR(200)'],
    ['status', 'VARCHAR(20)'],
    ['start_date', 'DATE'],
    ['end_date', 'DATE'],
    ['discount_percent', 'DECIMAL(5,2)'],
    ['max_hours_per_month', 'INTEGER'],
    ['auto_approve', 'BOOLEAN'],
    ['terms', 'TEXT'],
    ['created_by', 'BIGINT', 'FK', 'app_user'],
    ['approved_by', 'BIGINT', 'FK', 'app_user'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  sharing_request: [
    ['sharing_request_id', 'BIGSERIAL', 'PK'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['from_institution_id', 'BIGINT', 'FK', 'institution'],
    ['to_institution_id', 'BIGINT', 'FK', 'institution'],
    ['agreement_id', 'BIGINT', 'FK', 'sharing_agreement'],
    ['requested_by', 'BIGINT', 'FK', 'app_user'],
    ['approved_by', 'BIGINT', 'FK', 'app_user'],
    ['purpose', 'VARCHAR(500)'],
    ['requested_date', 'DATE'],
    ['start_time', 'TIME'],
    ['end_time', 'TIME'],
    ['status', 'VARCHAR(20)'],
    ['hourly_rate', 'DECIMAL(10,2)'],
    ['discount_percent', 'DECIMAL(5,2)'],
    ['estimated_fee', 'DECIMAL(12,2)'],
    ['remarks', 'VARCHAR(500)'],
    ['created_at', 'TIMESTAMP'],
    ['updated_at', 'TIMESTAMP'],
  ],
  invoice: [
    ['invoice_id', 'BIGSERIAL', 'PK'],
    ['invoice_number', 'VARCHAR(40)', 'UK'],
    ['sharing_request_id', 'BIGINT', 'FK,UK', 'sharing_request'],
    ['from_institution_id', 'BIGINT', 'FK', 'institution'],
    ['to_institution_id', 'BIGINT', 'FK', 'institution'],
    ['amount', 'DECIMAL(12,2)'],
    ['status', 'VARCHAR(20)'],
    ['issued_date', 'DATE'],
    ['due_date', 'DATE'],
    ['paid_date', 'DATE'],
    ['description', 'VARCHAR(500)'],
    ['created_by', 'BIGINT', 'FK', 'app_user'],
    ['created_at', 'TIMESTAMP'],
  ],

  department_charge: [
    ['charge_id', 'BIGSERIAL', 'PK'],
    ['department_id', 'BIGINT', 'FK', 'department'],
    ['equipment_id', 'BIGINT', 'FK', 'equipment'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['booking_id', 'BIGINT', 'FK,UK', 'booking'],
    ['maintenance_request_id', 'BIGINT', 'FK,UK', 'maintenance_request'],
    ['charge_type', 'VARCHAR(20)'],
    ['amount', 'DECIMAL(12,2)'],
    ['hours', 'DECIMAL(8,2)'],
    ['charge_date', 'DATE'],
    ['description', 'VARCHAR(500)'],
    ['created_at', 'TIMESTAMP'],
  ],

  notification: [
    ['notification_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['type', 'VARCHAR(40)'],
    ['title', 'VARCHAR(200)'],
    ['message', 'VARCHAR(1000)'],
    ['link', 'VARCHAR(255)'],
    ['is_read', 'BOOLEAN'],
    ['created_at', 'TIMESTAMP'],
  ],
  user_device_token: [
    ['device_token_id', 'BIGSERIAL', 'PK'],
    ['user_id', 'BIGINT', 'FK', 'app_user'],
    ['token', 'VARCHAR(512)', 'UK'],
    ['platform', 'VARCHAR(20)'],
    ['created_at', 'TIMESTAMP'],
    ['last_seen_at', 'TIMESTAMP'],
  ],
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const SECTIONS = {
  auth: {
    no: 1,
    title: 'AUTHENTICATION & ORGANIZATION',
    color: '#7C3AED',
    tint: '#F5F1FE',
    subcols: [
      ['institution', 'department', 'app_user'],
      ['role', 'user_role', 'refresh_token', 'password_reset_token'],
    ],
  },
  equipment: {
    no: 2,
    title: 'LABS, EQUIPMENT & INVENTORY',
    color: '#0E7490',
    tint: '#EDF9FC',
    subcols: [
      ['equipment'],
      ['lab', 'equipment_image', 'equipment_document'],
    ],
  },
  booking: {
    no: 3,
    title: 'BOOKING & SCHEDULING',
    color: '#1D4ED8',
    tint: '#EEF3FE',
    subcols: [['booking', 'booking_history', 'recurring_booking', 'waitlist']],
  },
  utilization: {
    no: 4,
    title: 'UTILIZATION MONITORING',
    color: '#047857',
    tint: '#ECFAF4',
    subcols: [['equipment_usage']],
  },
  billing: {
    no: 5,
    title: 'BILLING & CHARGEBACK',
    color: '#4D7C0F',
    tint: '#F4FAEA',
    subcols: [['department_charge']],
  },
  notifications: {
    no: 6,
    title: 'NOTIFICATIONS & ALERTS',
    color: '#4338CA',
    tint: '#EFEFFE',
    subcols: [['notification', 'user_device_token']],
  },
  maintenance: {
    no: 7,
    title: 'MAINTENANCE & CALIBRATION',
    color: '#B45309',
    tint: '#FEF6EA',
    subcols: [['maintenance_request'], ['maintenance_schedule'], ['equipment_calibration']],
  },
  sharing: {
    no: 8,
    title: 'INTER-INSTITUTION RESOURCE SHARING',
    color: '#BE185D',
    tint: '#FDEFF5',
    subcols: [['sharing_request'], ['sharing_agreement'], ['invoice']],
  },
};

// Each entry is one horizontal band; each inner array is a vertical stack of sections.
const GRID = [
  [['auth'], ['equipment'], ['booking'], ['utilization', 'billing', 'notifications']],
  [['maintenance'], ['sharing']],
];

// Relationships that are 1:1 rather than 1:N (the child FK carries a UNIQUE).
const ONE_TO_ONE = new Set([
  'invoice.sharing_request_id',
  'department_charge.booking_id',
  'department_charge.maintenance_request_id',
]);

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const sectionWidth = (s) => s.subcols.length * CARD_W + (s.subcols.length - 1) * CARD_GAP + 2 * SEC_PAD;

const sectionInnerHeight = (s) =>
  Math.max(
    ...s.subcols.map((col) => col.reduce((h, t) => h + cardHeight(T[t].length) + CARD_GAP, -CARD_GAP)),
  );

const sectionHeight = (s) => SEC_HEAD_H + sectionInnerHeight(s) + SEC_PAD;

/** Absolute box for every section and card, plus the row index of each column. */
const placed = { sections: {}, cards: {} };

let bandY = TITLE_H + MARGIN;
for (const band of GRID) {
  let x = MARGIN;
  let bandH = 0;
  for (const stack of band) {
    const stackW = Math.max(...stack.map((id) => sectionWidth(SECTIONS[id])));
    let y = bandY;
    for (const id of stack) {
      const s = SECTIONS[id];
      const h = sectionHeight(s);
      placed.sections[id] = { x, y, w: sectionWidth(s), h };

      let cx = x + SEC_PAD;
      for (const col of s.subcols) {
        let cy = y + SEC_HEAD_H;
        for (const t of col) {
          placed.cards[t] = { x: cx, y: cy, w: CARD_W, h: cardHeight(T[t].length), section: id };
          cy += cardHeight(T[t].length) + CARD_GAP;
        }
        cx += CARD_W + CARD_GAP;
      }
      y += h + SEC_GAP;
    }
    bandH = Math.max(bandH, y - SEC_GAP - bandY);
    x += stackW + SEC_GAP;
  }
  if (x - SEC_GAP > W - MARGIN) {
    console.warn(`Band overflows width: needs ${x - SEC_GAP}, have ${W - MARGIN}`);
  }
  bandY += bandH + ROW_GAP;
}

// The legend band is pinned to the bottom of the 16:9 canvas so the output is
// exactly 3840x2160. If the tables ever grow past it the canvas grows instead of
// silently overlapping them — that's a prompt to re-balance GRID, not to clip.
const contentBottom = bandY - ROW_GAP;
const overflows = contentBottom + 16 > H - MARGIN - BAND_H;
const bandTop = overflows ? contentBottom + ROW_GAP : H - MARGIN - BAND_H;
const canvasH = overflows ? bandTop + BAND_H + MARGIN : H;
if (overflows) {
  console.warn(`Tables need ${contentBottom}px; canvas grown to ${canvasH} (target ${H}).`);
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const parts = [];
const push = (...s) => parts.push(...s);

const text = (x, y, str, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 16}" font-weight="${o.weight ?? 400}" fill="${
    o.fill ?? '#0F172A'
  }"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${
    o.style ? ` font-style="${o.style}"` : ''
  }${o.family ? ` font-family="${o.family}"` : ''}${
    o.spacing ? ` letter-spacing="${o.spacing}"` : ''
  }>${esc(str)}</text>`;

const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${
    o.fill ?? 'none'
  }"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}"` : ''}${
    o.opacity ? ` opacity="${o.opacity}"` : ''
  }/>`;

// ---------------------------------------------------------------------------
// Background + title
// ---------------------------------------------------------------------------

push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${canvasH}" viewBox="0 0 ${W} ${canvasH}" font-family="Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif">`,
  `<defs>
     <linearGradient id="titleBg" x1="0" y1="0" x2="1" y2="0">
       <stop offset="0" stop-color="#0B1220"/><stop offset="1" stop-color="#1E293B"/>
     </linearGradient>
     <filter id="cardShadow" x="-6%" y="-6%" width="112%" height="112%">
       <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.14"/>
     </filter>
   </defs>`,
  rect(0, 0, W, canvasH, { fill: '#F1F5F9' }),
  rect(0, 0, W, TITLE_H, { fill: 'url(#titleBg)' }),
  text(MARGIN, 52, 'LAB RESOURCE UTILIZATION PLATFORM', {
    size: 40,
    weight: 700,
    fill: '#FFFFFF',
    spacing: 1.4,
  }),
  text(MARGIN, 90, 'Enhanced Entity–Relationship (EER) Diagram · PostgreSQL 17 · 25 tables · 53 foreign keys', {
    size: 20,
    fill: '#94A3B8',
  }),
  text(W - MARGIN, 52, '8 FUNCTIONAL SUBSYSTEMS', {
    size: 22,
    weight: 600,
    fill: '#E2E8F0',
    anchor: 'end',
    spacing: 1.2,
  }),
  text(W - MARGIN, 88, 'Source of truth: database/01–17_*.sql  ·  See database/EER_DIAGRAM.md', {
    size: 17,
    fill: '#94A3B8',
    anchor: 'end',
  }),
);

// ---------------------------------------------------------------------------
// Relationship connectors — drawn first so cards sit on top of them
// ---------------------------------------------------------------------------

const rowCenterY = (table, colIndex) =>
  placed.cards[table].y + CARD_HEAD_H + colIndex * ROW_H + ROW_H / 2;

const edges = [];
for (const [child, cols] of Object.entries(T)) {
  cols.forEach(([col, , keys, ref], i) => {
    if (!ref) return;
    const parentPk = T[ref].findIndex((c) => (c[2] || '').includes('PK'));
    edges.push({
      parent: ref,
      parentRow: parentPk < 0 ? 0 : parentPk,
      child,
      childRow: i,
      oneToOne: ONE_TO_ONE.has(`${child}.${col}`),
    });
  });
}

const lines = [];
for (const e of edges) {
  const p = placed.cards[e.parent];
  const c = placed.cards[e.child];
  const py = rowCenterY(e.parent, e.parentRow);
  const cy = rowCenterY(e.child, e.childRow);

  // Leave on the side that faces the other card; when the two overlap
  // horizontally (same sub-column) loop out to the right of both.
  let px, cx, pdx, cdx;
  if (c.x >= p.x + p.w) {
    px = p.x + p.w; cx = c.x; pdx = 1; cdx = -1;
  } else if (c.x + c.w <= p.x) {
    px = p.x; cx = c.x + c.w; pdx = -1; cdx = 1;
  } else {
    px = p.x + p.w; cx = c.x + c.w; pdx = 1; cdx = 1;
  }

  const span = Math.max(Math.abs(cx - px), 60);
  const bow = Math.min(Math.max(span * 0.42, 46), 300);
  const color = SECTIONS[p.section].color;

  lines.push(
    `<path d="M ${px} ${py} C ${px + pdx * bow} ${py}, ${cx + cdx * bow} ${cy}, ${cx} ${cy}" ` +
      `fill="none" stroke="${color}" stroke-width="2.2" opacity="0.5"/>`,
    // "one" end
    `<line x1="${px + pdx * 9}" y1="${py - 7}" x2="${px + pdx * 9}" y2="${py + 7}" stroke="${color}" stroke-width="2.4" opacity="0.85"/>`,
  );

  if (e.oneToOne) {
    lines.push(
      `<line x1="${cx + cdx * 9}" y1="${cy - 7}" x2="${cx + cdx * 9}" y2="${cy + 7}" stroke="${color}" stroke-width="2.4" opacity="0.85"/>`,
    );
  } else {
    // crow's foot = "many"
    const t = cx + cdx * 15;
    lines.push(
      `<path d="M ${cx} ${cy} L ${t} ${cy - 8} M ${cx} ${cy} L ${t} ${cy} M ${cx} ${cy} L ${t} ${cy + 8}" ` +
        `fill="none" stroke="${color}" stroke-width="2.2" opacity="0.9"/>`,
    );
  }
}
push(`<g>${lines.join('')}</g>`);

// ---------------------------------------------------------------------------
// Section frames
// ---------------------------------------------------------------------------

for (const [id, box] of Object.entries(placed.sections)) {
  const s = SECTIONS[id];
  push(
    rect(box.x, box.y, box.w, box.h, { rx: 14, fill: s.tint, stroke: s.color, sw: 2.4 }),
    rect(box.x, box.y, box.w, 4, { fill: s.color, rx: 2 }),
    `<circle cx="${box.x + 26}" cy="${box.y + 22}" r="13" fill="${s.color}"/>`,
    text(box.x + 26, box.y + 28, String(s.no), { size: 16, weight: 700, fill: '#FFFFFF', anchor: 'middle' }),
    text(box.x + 48, box.y + 28, s.title, { size: 20, weight: 700, fill: s.color, spacing: 0.8 }),
    text(box.x + box.w - SEC_PAD, box.y + 28, s.subcols.flat().length === 1 ? '1 table' : `${s.subcols.flat().length} tables`, {
      size: 15,
      weight: 600,
      fill: s.color,
      anchor: 'end',
      opacity: 0.8,
    }),
  );
}

// ---------------------------------------------------------------------------
// Table cards
// ---------------------------------------------------------------------------

const KEY_X = 12;
const NAME_X = 72;
const TYPE_X = 298;
const REF_R = CARD_W - 12;

const KEY_STYLE = {
  PK: { fill: '#F59E0B', text: '#3D2606' },
  FK: { fill: '#3B82F6', text: '#FFFFFF' },
  UK: { fill: '#64748B', text: '#FFFFFF' },
};

for (const [name, box] of Object.entries(placed.cards)) {
  const s = SECTIONS[box.section];
  const cols = T[name];

  push(
    rect(box.x, box.y, box.w, box.h, { rx: 10, fill: '#FFFFFF', stroke: '#CBD5E1', sw: 1.4 }),
    `<path d="M ${box.x} ${box.y + 10} a 10 10 0 0 1 10 -10 h ${box.w - 20} a 10 10 0 0 1 10 10 v ${
      CARD_HEAD_H - 10
    } h -${box.w} Z" fill="${s.color}"/>`,
    text(box.x + 16, box.y + 30, name, { size: 20, weight: 700, fill: '#FFFFFF', spacing: 0.4 }),
    text(box.x + box.w - 14, box.y + 30, `${cols.length}`, {
      size: 16,
      weight: 600,
      fill: '#FFFFFF',
      anchor: 'end',
    }),
  );

  cols.forEach(([col, type, keys, ref], i) => {
    const top = box.y + CARD_HEAD_H + i * ROW_H;
    const baseline = top + 17;
    if (i % 2 === 1) push(rect(box.x + 1, top, box.w - 2, ROW_H, { fill: '#F8FAFC' }));

    let kx = box.x + KEY_X;
    for (const k of (keys || '').split(',').filter(Boolean)) {
      const st = KEY_STYLE[k];
      push(
        rect(kx, top + 4, 27, 16, { rx: 4, fill: st.fill }),
        text(kx + 13.5, baseline - 1, k, { size: 11, weight: 700, fill: st.text, anchor: 'middle' }),
      );
      kx += 30;
    }

    const isKey = (keys || '').includes('PK');
    push(
      text(box.x + NAME_X, baseline, col, {
        size: 16,
        weight: isKey ? 700 : 400,
        fill: isKey ? '#0F172A' : '#1E293B',
      }),
      text(box.x + TYPE_X, baseline, type, { size: 14, fill: '#64748B' }),
    );
    if (ref) {
      push(
        text(box.x + REF_R, baseline, `→ ${ref}`, {
          size: 13,
          weight: 600,
          fill: SECTIONS[placed.cards[ref].section].color,
          anchor: 'end',
        }),
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Legend / notes band
// ---------------------------------------------------------------------------

push(rect(MARGIN, bandTop, W - 2 * MARGIN, BAND_H, { rx: 14, fill: '#FFFFFF', stroke: '#CBD5E1', sw: 2 }));

const bx = MARGIN + 24;
const by = bandTop + 30;

push(text(bx, by, 'NOTATION', { size: 16, weight: 700, fill: '#0F172A', spacing: 1 }));
const legend = [
  ['PK', 'Primary key', '#F59E0B', '#3D2606'],
  ['FK', 'Foreign key', '#3B82F6', '#FFFFFF'],
  ['UK', 'Unique', '#64748B', '#FFFFFF'],
];
legend.forEach(([k, label, fill, tc], i) => {
  const y = by + 26 + i * 26;
  push(
    rect(bx, y - 12, 27, 16, { rx: 4, fill }),
    text(bx + 13.5, y + 1, k, { size: 11, weight: 700, fill: tc, anchor: 'middle' }),
    text(bx + 38, y + 1, label, { size: 15, fill: '#334155' }),
  );
});

const cx2 = bx + 210;
push(text(cx2, by, 'CARDINALITY', { size: 16, weight: 700, fill: '#0F172A', spacing: 1 }));
[
  ['one', 'one-to-many (crow’s foot at the many end)'],
  ['one', 'one-to-one — child FK carries a UNIQUE'],
].forEach(([, label], i) => {
  const y = by + 26 + i * 26;
  const many = i === 0;
  push(
    `<line x1="${cx2}" y1="${y - 4}" x2="${cx2 + 54}" y2="${y - 4}" stroke="#475569" stroke-width="2.2"/>`,
    `<line x1="${cx2 + 8}" y1="${y - 11}" x2="${cx2 + 8}" y2="${y + 3}" stroke="#475569" stroke-width="2.4"/>`,
    many
      ? `<path d="M ${cx2 + 54} ${y - 4} L ${cx2 + 40} ${y - 12} M ${cx2 + 54} ${y - 4} L ${cx2 + 40} ${y - 4} M ${cx2 + 54} ${y - 4} L ${cx2 + 40} ${y + 4}" fill="none" stroke="#475569" stroke-width="2.2"/>`
      : `<line x1="${cx2 + 46}" y1="${y - 11}" x2="${cx2 + 46}" y2="${y + 3}" stroke="#475569" stroke-width="2.4"/>`,
    text(cx2 + 66, y + 1, label, { size: 15, fill: '#334155' }),
  );
});

const nx = cx2 + 470;
push(text(nx, by, 'EER CONSTRUCTS IN THIS SCHEMA', { size: 16, weight: 700, fill: '#0F172A', spacing: 1 }));
[
  '• M:N resolved by association entity — app_user ↔ role via user_role (composite PK).',
  '• Weak entities, ON DELETE CASCADE — equipment_image, equipment_document, booking_history, notification, user_device_token.',
  '• Recursive / dual role — sharing_request, sharing_agreement and invoice each reference institution twice (from_ and to_).',
].forEach((line, i) => push(text(nx, by + 26 + i * 26, line, { size: 15, fill: '#334155' })));

const gx = nx + 1330;
push(text(gx, by, 'INTEGRITY RULES', { size: 16, weight: 700, fill: '#0F172A', spacing: 1 }));
[
  '• department_charge.booking_id / .maintenance_request_id are UNIQUE — the database, not the code, makes chargeback idempotent.',
  '• sharing_agreement CHECKs: distinct parties, discount 0–100, start_date ≤ end_date.',
  '• Optional money and target columns are NULL by design, never 0 — "not set" must not read as "zero".',
].forEach((line, i) => push(text(gx, by + 26 + i * 26, line, { size: 15, fill: '#334155' })));

push('</svg>');

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const svg = parts.join('\n');
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'eer-diagram.svg'), svg);
writeFileSync(
  join(OUT_DIR, 'eer-diagram.html'),
  `<!doctype html><meta charset="utf-8"><title>EER Diagram</title>
<style>html,body{margin:0;padding:0;background:#F1F5F9;overflow:hidden}svg{display:block}</style>
${svg}
`,
);

const tableCount = Object.keys(T).length;
const colCount = Object.values(T).reduce((n, c) => n + c.length, 0);
console.log(`eer-diagram.svg  ${W} x ${canvasH}`);
console.log(`  ${tableCount} tables, ${colCount} columns, ${edges.length} foreign keys`);
console.log(`  content bottom ${contentBottom}, legend band at ${bandTop}`);
