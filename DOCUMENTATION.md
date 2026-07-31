# Lab Resource Utilization Platform — Final Project Documentation

A full-stack platform for research institutions to catalogue laboratory equipment,
schedule shared access, monitor utilization in real time, run maintenance and calibration
workflows, settle inter-institution costs, and drive decisions from an analytics dashboard.

| | |
|---|---|
| **Backend** | Spring Boot 3.5.16 · Java 17 · Spring Security + JWT · Spring Data JPA / Hibernate 6.6 · Spring WebSocket |
| **Frontend** | React 19 · Vite 8 · Tailwind CSS 4 · React Router 7 · Recharts · FullCalendar |
| **Database** | PostgreSQL 17 — 25 tables, 272 columns, 53 foreign keys |
| **Infrastructure** | Docker · Docker Compose · Nginx · GitHub Actions · AWS EC2 / Azure VM |
| **Scale** | 15 REST controllers · 104 endpoints · 27 JPA entities · 154 automated tests |

Companion documents:

* **[README.md](README.md)** — setup, local run, quick start
* **[DEPLOYMENT.md](DEPLOYMENT.md)** — Docker + cloud deployment, CD, backups, troubleshooting
* **[database/EER_DIAGRAM.md](database/EER_DIAGRAM.md)** — full EER diagram and cardinality table
* **[PRESENTATION.md](PRESENTATION.md)** — demo walkthrough script

---

## Table of contents

1. [Architecture](#1-architecture)
2. [Requirement traceability](#2-requirement-traceability)
3. [Security model](#3-security-model)
4. [Data model](#4-data-model)
5. [API reference](#5-api-reference)
6. [Background jobs and real-time feed](#6-background-jobs-and-real-time-feed)
7. [Frontend structure](#7-frontend-structure)
8. [Design decisions](#8-design-decisions)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Known limitations and future work](#11-known-limitations-and-future-work)

---

## 1. Architecture

A modular monolith. Each functional area is a package-level module with its own
controller, service and repositories, sharing one Spring context, one database and one
deployable artifact. At this scale that beats microservices: booking, utilization and
billing all read the same equipment and booking rows, and one transaction boundary is what
keeps a chargeback from being posted against a booking that later rolls back.

```
                        Browser
                           │
                    HTTP/1.1 · WSS
                           ▼
        ┌──────────────────────────────────────────┐
        │  Nginx                                   │
        │  · serves the Vite build (SPA fallback)  │
        │  · /api/  → backend   (same origin)      │
        │  · /ws/   → backend   (Upgrade proxied)  │
        │  · /uploads/ → backend                   │
        └────────────────────┬─────────────────────┘
                             ▼
        ┌──────────────────────────────────────────┐
        │  Spring Boot 3.5 (Java 17)               │
        │                                          │
        │  Filter chain                            │
        │    RateLimitFilter → JwtAuthFilter       │
        │                                          │
        │  Controllers (15)  ── @PreAuthorize       │
        │        ▼                                  │
        │  Services (@Transactional)                │
        │        ▼                                  │
        │  Repositories (Spring Data JPA)           │
        │                                          │
        │  @Scheduled jobs   @Async notifications   │
        │  WebSocket broadcaster                    │
        └────────────────────┬─────────────────────┘
                             ▼
                  ┌────────────────────┐
                  │   PostgreSQL 17    │
                  └────────────────────┘

External (all optional, all degrade to logging):
  SMTP (OTP + email) · Twilio (SMS) · Firebase FCM (push) · Google Identity (OAuth2)
```

### Request lifecycle

1. **`RateLimitFilter`** — token bucket per client IP, two tiers: 20 req/min on
   `/api/auth/**`, 200 req/min elsewhere. Runs *before* authentication, so a credential
   stuffing attempt is rejected without ever touching the user table.
2. **`JwtAuthenticationFilter`** — validates the `Bearer` token, loads authorities from
   `user_role`, populates the `SecurityContext`. Stateless: no server session.
3. **Controller** — `@PreAuthorize` gates the method by role before any business code runs.
4. **Service** — `@Transactional`; all invariants enforced here, not in the controller.
5. **Repository** — Spring Data JPA. `open-in-view=false`, so a lazy association cannot
   be resolved from the view layer and hide an N+1 query behind the JSON serializer.

### Package layout

```
com.labresource
├── config/          SecurityConfig, WebSocketConfig, AsyncConfig, CorsConfig
├── controller/      15 REST controllers
├── dto/             request/response records — entities never cross the HTTP boundary
├── entity/          27 JPA entities
├── repository/      Spring Data interfaces + @Query projections
├── security/        JwtService, JwtAuthenticationFilter, RateLimitFilter, Roles
└── service/
    ├── (interfaces)
    └── impl/        service implementations, @Scheduled jobs, integrations
```

---

## 2. Requirement traceability

### The 11 functional modules

| # | Module | Backend | Frontend | Notes |
|---|--------|---------|----------|-------|
| 1 | Authentication & authorization | `AuthServiceImpl`, `JwtService`, `SecurityConfig` | `LoginPage`, `RegisterPage`, `ForgotPasswordPage` | JWT + refresh, Google OAuth2, OTP reset |
| 2 | User & role management (7 roles) | `UserServiceImpl`, `RoleServiceImpl`, `Roles` | `UserManagementPage` | `@PreAuthorize` per endpoint |
| 3 | Equipment inventory & cataloguing | `EquipmentServiceImpl`, `FileStorageService` | `EquipmentPage`, `EquipmentDetailsPage` | images, documents, QR/RFID, specs |
| 4 | Lab & organization management | `LabServiceImpl`, `InstitutionServiceImpl`, `DepartmentServiceImpl` | `LabPage` | institution → department → lab hierarchy |
| 5 | Booking & scheduling | `BookingServiceImpl`, `SchedulingOptimizerService` | `BookingPage` | conflict detection, recurring series, calendar, audit trail |
| 6 | Waitlist management | `WaitlistServiceImpl`, `WaitlistOfferExpiryJob` | `BookingPage` | priority queue, timed offer, auto-promotion |
| 7 | Utilization monitoring | `UtilizationServiceImpl`, `UtilizationLiveBroadcaster`, `IdleEquipmentAlertJob` | `UtilizationPage` | live WebSocket feed, heatmap, idle detection |
| 8 | Inter-institution resource sharing | `SharingServiceImpl`, `SharingAgreementExpiryJob` | `SharingPage` | discovery, agreements, approval, fees |
| 9 | Maintenance & calibration | `MaintenanceServiceImpl`, `MaintenanceReminderJob` | `MaintenancePage` | work orders, preventive schedules, calibration certificates, downtime |
| 10 | Cost tracking & billing | `BillingService`, `ChargebackService` | `BillingPage` | ROI, depreciation, budget chargeback, invoices |
| 11 | Notifications & alerts | `NotificationService`, `EmailService`, `SmsService`, `PushNotificationService` | notification bell, `ProfilePage` toggles | 4-channel escalation ladder |

Analytics and reporting cut across all eleven: `AnalyticsService` +
`AnalyticsPage` / `ReportsPage` / `DashboardPage`, with PDF (jsPDF) and Excel (`xlsx`)
export.

### Milestone coverage

| Milestone | Deliverable | Where |
|---|---|---|
| 1 | Requirements, ER design, tech stack, environment | `database/EER_DIAGRAM.md`, `database/01–04_*.sql`, README |
| 1 | Auth + role-based access | modules 1–2 |
| 2 | Equipment inventory, booking, utilization, sharing | modules 3–8 |
| 3 | Maintenance, billing, notifications, analytics | modules 9–11 + analytics |
| 4 | Testing (unit, integration, UAT) | [§9](#9-testing) |
| 4 | Deploy with Docker and cloud environments | [DEPLOYMENT.md](DEPLOYMENT.md) |
| 4 | Final documentation and presentation | this file + [PRESENTATION.md](PRESENTATION.md) |

---

## 3. Security model

### The 7 roles

`SYSTEM_ADMIN` · `INSTITUTION_ADMIN` · `DEPARTMENT_HEAD` · `LAB_MANAGER` ·
`LAB_TECHNICIAN` · `RESEARCHER` · `STUDENT`

Roles are rows in `role`, joined to users through `user_role` (composite PK), so a user
can hold several. Authorities are materialized as `ROLE_<NAME>` at token validation.
Names are centralized in `security/Roles.java` — a typo in a `@PreAuthorize` string is a
silently open endpoint, so nothing hard-codes the literal.

### Authentication

* **Password login** — BCrypt hashes. On success: a JWT access token (24 h) plus a
  refresh token row (7 d, revocable).
* **Google OAuth2** — the browser obtains a Google ID token; `GoogleTokenVerifierService`
  verifies signature, issuer, audience and expiry server-side before any account is
  created or matched. The client is never trusted with identity claims.
* **Password reset** — email OTP with an attempt counter, single-use token, and an expiry.
  A verified OTP yields a short-lived reset token; the new password is set with that, so
  the OTP itself is never a password-change credential.

### Defence in depth

| Concern | Measure |
|---|---|
| Brute force | `RateLimitFilter` token bucket, before authentication, 20/min on auth routes |
| Privilege escalation | `@PreAuthorize` on every non-public method + ownership checks inside services |
| Cross-tenant data access | Services scope queries by the caller's institution, not by a client-supplied id |
| CORS | Explicit origin allow-list; `"*"` is impossible because credentials are enabled |
| Information disclosure in prod | `include-stacktrace=never`, `include-message=never`; only `/actuator/health` exposed |
| Schema tampering on deploy | `ddl-auto=validate` in prod — Hibernate refuses to start if entities and tables disagree |
| Secrets in the repo | Every credential reads from an environment variable; `.gitignore` covers `.env*`, `application-local.properties`, `*-secrets.properties`, keystores, service-account JSON |
| Logs leaking PII | Phone numbers masked to the last 4 digits before logging |
| Double billing | UNIQUE constraints on `department_charge.booking_id` and `.maintenance_request_id` — the database, not the code, makes chargeback idempotent |

---

## 4. Data model

Full diagram: **[database/EER_DIAGRAM.md](database/EER_DIAGRAM.md)** ·
4K image: **[database/eer-diagram-4k.png](database/eer-diagram-4k.png)**

![EER diagram](database/eer-diagram-4k.png)

25 tables in 8 subsystems:

| Subsystem | Tables |
|---|---|
| Authentication & organization | `institution`, `department`, `role`, `app_user`, `user_role`, `refresh_token`, `password_reset_token` |
| Labs, equipment & inventory | `lab`, `equipment`, `equipment_image`, `equipment_document` |
| Booking & scheduling | `booking`, `booking_history`, `recurring_booking`, `waitlist` |
| Utilization monitoring | `equipment_usage` |
| Maintenance & calibration | `maintenance_request`, `maintenance_schedule`, `equipment_calibration` |
| Inter-institution sharing | `sharing_agreement`, `sharing_request`, `invoice` |
| Billing & chargeback | `department_charge` |
| Notifications & alerts | `notification`, `user_device_token` |

### EER constructs

* **M:N via association entity** — `app_user` ↔ `role` through `user_role`, composite
  primary key `(user_id, role_id)`.
* **Weak entities with `ON DELETE CASCADE`** — `equipment_image`, `equipment_document`,
  `booking_history`, `notification`, `user_device_token`. None is meaningful without its
  parent, so the parent's deletion takes them with it.
* **Dual role / recursive reference** — `sharing_request`, `sharing_agreement` and
  `invoice` each reference `institution` twice (`from_` and `to_`). A `CHECK` forbids an
  agreement between an institution and itself.
* **1:1 via UNIQUE FK** — `invoice.sharing_request_id`, `department_charge.booking_id`,
  `department_charge.maintenance_request_id`.
* **Deliberate NULLs** — `department.annual_budget`, `equipment.hourly_rate`,
  `*.utilization_target_percent` have no default. "Not set" and "zero" mean different
  things: a 0 % budget-used figure reads as healthy when in fact nothing is tracked, so
  the API returns `null` and the UI prints "not set".

### Migrations

`database/` holds the ordered, idempotent scripts that are the schema's source of truth.
Docker Compose runs them alphabetically on first container start.

| File | Contents |
|---|---|
| `01_schema_auth_organization.sql` | institutions, departments, roles, users, user_roles, refresh tokens |
| `02_schema_labs_equipment.sql` | labs, equipment, images, documents |
| `03_schema_booking.sql` | bookings, booking_history |
| `04_seed_data.sql` | the 7 roles (the only seeded rows) |
| `05_migration_otp_oauth.sql` | password reset tokens, OTP fields |
| `06_migration_roles_equipment_inventory.sql` | inventory extensions |
| `07_oauth_google.sql` | Google auth provider fields |
| `08_booking_status_waitlist.sql` | booking status values, waitlist |
| `09_utilization_monitoring.sql` | equipment_usage |
| `10_inter_institution_sharing.sql` | sharing_request |
| `11_recurring_audit_calendar_fees.sql` | recurring bookings, fees |
| `12_milestone3_maintenance_billing_notifications.sql` | maintenance, calibration, invoices, notifications |
| `13_milestone4_tags_user_admin.sql` | tags, user administration fields |
| `14_notification_channels.sql` | SMS/push preferences, device tokens |
| `15_budget_department_chargeback.sql` | budgets, `department_charge` |
| `16_sharing_agreement.sql` | `sharing_agreement` + CHECK constraints |
| `17_schema_drift_backfill.sql` | reconciles a dev database built under `ddl-auto=update` |

Applying migration 18 and beyond in production is a manual step — see
[DEPLOYMENT.md §8](DEPLOYMENT.md#applying-a-new-migration).

**Reset without reinstalling:** `database/tools/reset_operational_data.sql` truncates every
operational table and preserves only `role`. It lives in `tools/` precisely so Docker's
`docker-entrypoint-initdb.d` does not run it.

---

## 5. API reference

Base URL `/api`. Every route requires `Authorization: Bearer <jwt>` except `/api/auth/**`.
104 endpoints across 15 controllers. Access column lists the roles that pass
`@PreAuthorize`; "any" means any authenticated user.

### Auth — `/api/auth`

| Method | Path | Purpose |
|---|---|---|
| POST | `/register` | create account |
| POST | `/login` | credentials → access + refresh token |
| POST | `/google` | Google ID token → session |
| POST | `/refresh-token` | rotate the access token |
| POST | `/forgot-password` | email an OTP |
| POST | `/verify-otp` | OTP → short-lived reset token |
| POST | `/reset-password` | set the new password |

### Users — `/api/users` (6)

`GET /me` · `PUT /me` · `POST /me/change-password` · `GET /` ·
`PUT /{userId}/roles` · `PATCH /{userId}/active`

Self-service routes are scoped to the caller from the token, never from a path id. The
listing and the two administration routes are `SYSTEM_ADMIN` / `INSTITUTION_ADMIN`.

### Organization (3)

`GET /api/institutions` · `GET /api/departments` — read-only pickers, open to any
authenticated user. Rows are created by the first-run bootstrap and managed through the
database; there is no public write surface for them.
`/api/labs` — full CRUD (5 routes): `POST /` · `GET /` · `GET /{id}` · `PUT /{id}` ·
`DELETE /{id}`, for admin · department head · lab manager.

### Equipment — `/api/equipment` (19)

| Method | Path | Access |
|---|---|---|
| GET | `/` (paged; filter by category / status / lab / department / tag / free-text) | any |
| GET | `/{id}` | any |
| POST · PUT | `/`, `/{id}` | admin · head · manager · technician |
| DELETE | `/{id}` | admin · head · manager |
| PATCH | `/{id}/status` | admin · manager · technician |
| POST | `/{id}/upload-image`, `/{id}/upload-document` | admin · institution admin · technician |
| DELETE | `/{id}/images/{imageId}`, `/{id}/documents/{documentId}` | privileged |
| PATCH | `/{id}/images/{imageId}/primary` | privileged |
| GET | `/categories`, `/manufacturers`, `/tags` | any |
| GET | `/categories/stats` | admin · head |
| PUT | `/categories/rename`, `/tags/rename` | admin · head |
| DELETE | `/categories`, `/tags/{tag}` | admin · head |

The last four rows are the taxonomy manager: categories and tags live on the equipment rows
rather than in a lookup table, so renaming or retiring one has to be an explicit bulk
operation instead of an update to a single parent row.

### Bookings — `/api/bookings` (9)

`POST /` · `GET /` · `GET /{id}/history` · `GET /calendar` · `PUT /{id}/status` ·
`GET /suggestions` · `POST /recurring` · `GET /recurring/my` · `DELETE /recurring/{id}`

`GET /` serves both "all bookings" and "my bookings" — the caller's role decides the scope,
so there is no separate `/my` route that a privileged user could widen. Cancelling is a
`PUT /{id}/status` transition, not a `DELETE`, because the row is an audit record.

Creating a booking checks overlap against every non-cancelled booking on that equipment,
the equipment's status, and any active maintenance window. Status transitions are a state
machine (`PENDING → CONFIRMED → IN_USE → COMPLETED`, with `REJECTED`, `CANCELLED` and
`NO_SHOW` exits); every transition writes a `booking_history` row.

`GET /suggestions` is the rule-based scheduling optimizer: when a slot is taken it proposes
alternatives under six explainable rules — keep the requested time, shift the least,
load-balance across units, avoid peak hours, never propose an unbookable slot, prefer the
same department.

### Waitlist — `/api/waitlist` (4)

`POST /` · `GET /my` · `GET /` · `DELETE /{id}`

When a booking is cancelled, the next entry in priority order is offered the slot and
notified. The offer carries an `offer_expires_at`; a sweep job expires it and passes the
slot to the following entry, so the queue cannot stall on someone who never answers.

### Utilization — `/api/utilization` (9)

`GET /equipment/{id}` · `GET /summary` · `GET /heatmap` · `GET /peak` · `GET /demand` ·
`GET /idle` · `POST /idle/alert` · `PUT /targets/department/{departmentId}` ·
`PUT /targets/institution/{institutionId}`
Live feed: `WS /ws/utilization?token=<jwt>`

`GET /summary` carries all four utilization dimensions the specification asks for:
per-equipment rate against capacity, department and institution rates against their
targets, the same metrics over the preceding equal-length window (historical benchmark),
and a shared-versus-exclusive usage split.

### Sharing — `/api/sharing` (11)

`GET /discover` · `POST /requests` · `GET /requests/incoming` · `GET /requests/outgoing` ·
`PATCH /requests/{id}/approve` · `PATCH /requests/{id}/reject` · `DELETE /requests/{id}` ·
`POST /agreements` · `GET /agreements` · `PATCH /agreements/{id}/status` ·
`GET /partnerships`

`GET /partnerships` is the sharing analytics surface: per-counterparty volume, fees and
approval rates, with inbound and outbound kept separate — an institution that lends ten
instruments and borrows none has a very different partnership than the reverse, and a single
netted figure would hide that.

`discover` returns only equipment flagged `is_shareable` from *other* institutions. An
active agreement supplies the discount and may auto-approve; the fee is computed from
`hourly_rate`, the duration, and the agreement discount.

### Maintenance — `/api/maintenance` (13)

`POST /requests` · `GET /requests` · `GET /requests/my-assigned` ·
`PATCH /requests/{id}/assign` · `PATCH /requests/{id}/status` · `GET /technicians` ·
`POST /calibrations` · `GET /calibrations` · `GET /calibrations/expiring` ·
`POST /schedules` · `GET /schedules` · `PATCH /schedules/{id}/toggle` · `GET /summary`

Moving a work order to `IN_PROGRESS` puts the equipment `UNDER_MAINTENANCE`, which blocks
new bookings. Completing it records downtime and cost, releases the equipment, and posts a
maintenance chargeback against the *owning* department.

### Billing — `/api/billing` (9)

`GET /costs/equipment` · `GET /costs/departments` ·
`GET /department-charges/{departmentId}` · `PUT /departments/{departmentId}/budget` ·
`POST /invoices/from-sharing/{sharingRequestId}` · `GET /invoices/outgoing` ·
`GET /invoices/incoming` · `PATCH /invoices/{id}/status` · `GET /summary`

`costs/equipment` returns usage cost, maintenance cost, net return, ROI %, straight-line
book value on an 8-year life, warranty status and a lifecycle phase per asset. Only the
equipment-owning institution can issue an invoice; only the issuer can cancel one.

### Notifications — `/api/notifications` (8)

`GET /` · `GET /unread-count` · `PATCH /{id}/read` · `PATCH /read-all` ·
`GET /preferences` · `PATCH /preferences` · `POST /device-tokens` · `DELETE /device-tokens`

Per-channel preferences and FCM device tokens live here rather than under `/api/users`,
because they are properties of how a user receives notifications, not of the account.

### Analytics & dashboard (2)

`GET /api/analytics/dashboard` · `GET /api/dashboard/stats`

One analytics endpoint, not one per widget: it returns a role-shaped payload — a common
block plus a personal, manager or admin block depending on the caller's authorities — so the
server decides what a role may see instead of the client choosing which endpoints to call.

---

## 6. Background jobs and real-time feed

`@EnableScheduling` + `@EnableAsync`.

| Job | Cadence | Behaviour |
|---|---|---|
| `BookingReminderJob` | hourly | reminds users of bookings starting soon |
| `WaitlistOfferExpiryJob` | every few minutes | expires unanswered slot offers, promotes the next entry |
| `MaintenanceReminderJob` | daily | generates work orders from due preventive schedules; warns on calibrations nearing expiry |
| `IdleEquipmentAlertJob` | daily | flags equipment below its utilization target and notifies the owning department |
| `SharingAgreementExpiryJob` | daily | marks agreements past `end_date` as expired |

`BookingUsageEventListener` closes the loop between booking and utilization: completing a
booking writes the `equipment_usage` row that the utilization module aggregates, so the
usage figures cannot drift from the booking record.

### Live utilization feed

`UtilizationWebSocketHandler` authenticates the JWT **during the handshake** — a WebSocket
upgrade request cannot carry an `Authorization` header, so the token arrives as a query
parameter and an invalid one is rejected before the socket opens.

`UtilizationLiveBroadcaster` pushes a *change* signal, not a payload: subscribers refetch
through the normal authorized REST endpoint. That keeps authorization in one place — the
socket never becomes a second, unguarded read path — and the client debounces bursts
(approving a batch of bookings, cancelling a recurring series) into one refetch.

### Notification escalation

Three entry points, increasing in reach:

| Method | Channels |
|---|---|
| `notifyInApp` | bell only |
| `notify` | bell + email |
| `notifyUrgent` | bell + email + SMS + push |

Every channel is `@Async` and swallows its own failures: an SMTP timeout must not roll back
the booking that triggered the message. With credentials absent the body is logged instead
of sent, so every flow stays demonstrable without a paid Twilio or Firebase account.

---

## 7. Frontend structure

```
frontend/src
├── pages/        16 route pages
├── components/   reusable UI (tables, dialogs, forms, charts, notification bell)
├── layouts/      DashboardLayout — sidebar filtered by the user's permissions
├── routes/       React Router 7 config + ProtectedRoute
├── context/      AuthContext — token, user, roles
├── services/     api.js (Axios + interceptors), authService, utilizationSocket
└── utils/        permission helpers, formatters
```

* **Axios interceptors** attach the JWT and, on a 401, attempt a single refresh-token
  exchange before redirecting to login — so a token expiring mid-session does not throw the
  user out of a half-filled form.
* **`ProtectedRoute`** gates by authentication *and* required roles; the sidebar is built
  from the same permission helpers, so a user is never shown a link to a 403.
* **Route-level code splitting** keeps the initial bundle small; charts, the calendar and
  the PDF library load only on the pages that use them.
* **Exports** — jsPDF for PDF, `xlsx` for Excel, generated client-side from data already
  fetched, so no export endpoint or server-side rendering is needed.

---

## 8. Design decisions

**Modular monolith over microservices.** Booking, utilization and billing share the same
equipment and booking rows. Splitting them would replace one transaction with a distributed
one and buy nothing at this scale.

**`REQUIRES_NEW` for chargeback, and IDs rather than entities across that boundary.** A
failed billing posting must not mark the booking transaction rollback-only. Because the
posting runs in its own transaction, any entity passed into it arrives detached and its
lazy associations are unusable — so the API takes IDs and reloads. This is the kind of
constraint that is invisible until it produces a `LazyInitializationException` in
production.

**Idempotency in the schema, not the service.** `department_charge.booking_id` and
`.maintenance_request_id` are UNIQUE. A cheap pre-check avoids the common case; the
constraint is what actually prevents a double charge under a retry or a concurrent call.

**`ddl-auto=validate` in production, `update` in development.** `update` is convenient
while the model moves. In production it would quietly alter a table holding real data;
`validate` turns a missing migration into a failed deploy instead.

**Failures in notification and billing are contained, not propagated.** Both are
side-effects of a user action that has already succeeded. An SMTP timeout that rolls back a
confirmed booking is a worse outcome than a missing email.

**`null` is not `0`.** Optional budgets, rates and targets stay null so the UI can say "not
set". Substituting zero would render an invented percentage that reads as authoritative.

**The WebSocket carries signals, not data.** One authorization path, and no second read
surface to secure.

---

## 9. Testing

```bash
cd backend  && ./mvnw test     # 128 tests
cd frontend && npm test        # 26 tests
```

Both suites run on every push and pull request via
[.github/workflows/ci.yml](.github/workflows/ci.yml), alongside the frontend lint and a
production build.

### Backend — 128 JUnit 5 + Mockito tests, 14 classes

| Layer | Coverage |
|---|---|
| Service unit tests | booking state machine and conflict detection; equipment rules; utilization math; waitlist priority and offer expiry; sharing approval, discount and fee calculation; maintenance lifecycle and downtime; billing ROI/depreciation; chargeback idempotency and budget thresholds; auth and OTP flow |
| Web-slice (`@WebMvcTest`) | auth endpoints; equipment RBAC — each role asserted against each verb |
| Context smoke test | boots the full Spring context, which parses every `@Query` in every repository at startup — a malformed JPQL string fails the build rather than the first request that hits it |
| Failure-containment tests | force the database down mid-notification and mid-chargeback and assert the triggering transaction still commits. **These log `ERROR` lines on purpose** (`Failed to post usage chargeback…`, `Failed to store notification…`) — that output in a green run is the assertion passing, not a failure |

### Frontend — 26 Vitest + React Testing Library tests

Axios interceptor (token attach, 401 refresh-and-retry, redirect on refresh failure), auth
service, `ProtectedRoute` role gating, and `ConfirmDialog`.

### Manual / acceptance testing

Milestone 4 asks for user acceptance testing. The end-to-end paths exercised by hand, per
role, are scripted in **[PRESENTATION.md](PRESENTATION.md)** — that walkthrough doubles as
the UAT checklist: register → approve → catalogue → book → conflict → waitlist → utilize →
share → invoice → maintain → charge back → analyse → export.

---

## 10. Deployment

Three containers behind one Nginx entry point, on any Docker host — AWS EC2, Azure VM, GCP,
a droplet, or on-prem. Only Nginx publishes a port.

```bash
cp .env.prod.example .env && chmod 600 .env
# fill POSTGRES_PASSWORD, JWT_SECRET, BOOTSTRAP_ADMIN_PASSWORD
docker compose -f docker-compose.prod.yml up -d
```

**Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)** — AWS EC2 and Azure VM walkthroughs, Azure
Container Apps, HTTPS with Certbot, GitHub Actions CD wiring, backups, migration procedure,
and a troubleshooting table.

**CI/CD.** `ci.yml` runs both test suites on every push and PR. `deploy.yml` builds both
images with Buildx (GHA layer cache), pushes them to GHCR tagged `latest` and the commit
SHA, then SSHes into the cloud host and rolls the stack onto that SHA — pinning the tag so a
concurrent push cannot swap a different build onto the host — and waits for the backend
container to report healthy before declaring success.

---

## 11. Known limitations and future work

Stated plainly, because a documentation section that claims no limitations is not credible.

| Limitation | Consequence | Mitigation / next step |
|---|---|---|
| Migrations after the first boot are applied manually | a forgotten script fails the deploy at `ddl-auto=validate` | fails loudly rather than corrupting data; adopting Flyway or Liquibase would automate it |
| Uploads live on a Docker volume on one host | horizontal scale-out would not share them | mount S3 / Azure Files, or move to object storage |
| Rate limiting is per-instance, in memory | the limit multiplies behind more than one replica | move the buckets to Redis |
| Utilization aggregates are computed per request | fine at this data volume, will slow as `equipment_usage` grows | materialize a nightly summary table |
| No multi-factor authentication | password + OTP-reset only | TOTP enrolment on top of the existing OTP infrastructure |
| Single database, no read replica | reporting queries compete with transactional load | route analytics to a replica |
| Email, SMS and push degrade to logging when unconfigured | a demo without credentials silently "sends" nothing | intentional for evaluation; the log line records what would have been sent |
