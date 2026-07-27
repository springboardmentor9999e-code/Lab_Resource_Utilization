# Lab Resource Utilization Platform — Project Documentation

A full-stack platform that lets research institutions manage laboratory equipment
inventory, schedule shared resource access, monitor real-time utilization, track
maintenance/calibration workflows, and drive data-driven decisions through an
integrated intelligence dashboard.

---

## 1. Architecture Overview

```
┌─────────────────┐        HTTPS/REST         ┌──────────────────────┐
│  React 19 + Vite │  ───────────────────────▶ │  Spring Boot 3.5 API │
│  (Nginx in prod) │  ◀─────────────────────── │  (Java 17)           │
└─────────────────┘         JSON + JWT         └──────────┬───────────┘
                                                          │ Spring Data JPA
                                                          ▼
                                                ┌──────────────────────┐
                                                │  PostgreSQL 16        │
                                                └──────────────────────┘
```

- **Frontend** — React 19, Vite, Tailwind CSS 4, React Router 7, Axios, Recharts,
  FullCalendar, Framer Motion. Route-level code splitting keeps the initial bundle small.
- **Backend** — Spring Boot 3.5 (Spring Web, Security, Data JPA, Validation, Mail),
  stateless JWT auth with refresh tokens, `@PreAuthorize` method-level RBAC.
- **Database** — PostgreSQL, schema managed by ordered SQL migrations in `database/`.
- **Auth** — JWT access tokens + refresh tokens, Google OAuth login, OTP-based
  password reset over email.

---

## 2. Module → Requirement Mapping

The platform implements all ten feature modules from the project specification.

| # | Module | Key backend components |
|---|--------|------------------------|
| 1 | Authentication & role management (7 roles) | `AuthServiceImpl`, `SecurityConfig`, `JwtService`, `Roles` |
| 2 | Equipment inventory & cataloging | `EquipmentServiceImpl`, `Equipment`, image/document upload |
| 3 | Booking & scheduling | `BookingServiceImpl`, `RecurringBooking`, `BookingHistory` |
| 4 | Utilization monitoring | `UtilizationServiceImpl`, heatmap, idle detection |
| 5 | Inter-institution resource sharing | `SharingServiceImpl`, `SharingRequest` |
| 6 | Waitlist management | `WaitlistServiceImpl`, queue positions, next-in-line notify |
| 7 | Maintenance & calibration | `MaintenanceServiceImpl`, `MaintenanceReminderJob` |
| 8 | Cost tracking & billing | `BillingService`, `Invoice`, chargeback |
| 9 | Notifications (in-app + email) | `NotificationService`, `EmailService` |
| 10 | Analytics & reporting | `AnalyticsService`, dashboards, PDF/Excel export |

### The 7 roles (RBAC)

`SYSTEM_ADMIN`, `INSTITUTION_ADMIN`, `DEPARTMENT_HEAD`, `LAB_MANAGER`,
`LAB_TECHNICIAN`, `RESEARCHER`, `STUDENT` — enforced via `@PreAuthorize` on controllers.

---

## 3. API Reference

Base URL: `/api`. All endpoints require a `Bearer` JWT except `/api/auth/**`.

### Auth — `/api/auth`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/register` | Create account |
| POST | `/login` | Username/password → JWT + refresh token |
| POST | `/google` | Google OAuth login |
| POST | `/refresh-token` | Exchange refresh token for new access token |
| POST | `/forgot-password` | Send OTP to email |
| POST | `/verify-otp` | Verify OTP → reset session token |
| POST | `/reset-password` | Set new password |

### Equipment — `/api/equipment`
| Method | Path | Access |
|--------|------|--------|
| GET | `/` (paged, filterable) | all authenticated |
| GET | `/{id}` | all authenticated |
| POST | `/` | admin/head/manager/technician |
| PUT | `/{id}` | admin/head/manager/technician |
| DELETE | `/{id}` | admin/head/manager |
| PATCH | `/{id}/status` | admin/manager/technician |
| POST | `/{id}/upload-image`, `/{id}/upload-document` | privileged roles |
| GET | `/categories`, `/manufacturers` | all authenticated |

### Bookings — `/api/bookings`
`POST /`, `GET /`, `PUT /{id}/status`, `GET /{id}/history`, `GET /calendar`,
`POST /recurring`, `GET /recurring/my`, `DELETE /recurring/{id}`

### Utilization — `/api/utilization`
`GET /equipment/{id}`, `GET /summary`, `GET /heatmap`, `GET /idle`

### Sharing — `/api/sharing`
`GET /discover`, `POST /requests`, `GET /requests/incoming`, `GET /requests/outgoing`,
`PATCH /requests/{id}/approve`, `PATCH /requests/{id}/reject`, `DELETE /requests/{id}`

### Maintenance — `/api/maintenance`
`POST/GET /requests`, `GET /requests/my-assigned`, `PATCH /requests/{id}/assign`,
`PATCH /requests/{id}/status`, `GET /technicians`, `POST/GET /calibrations`,
`GET /calibrations/expiring`, `POST/GET /schedules`, `PATCH /schedules/{id}/toggle`, `GET /summary`

### Billing — `/api/billing`
`GET /costs/equipment`, `GET /costs/departments`, `POST /invoices/from-sharing/{id}`,
`GET /invoices/outgoing`, `GET /invoices/incoming`, `PATCH /invoices/{id}/status`, `GET /summary`

### Notifications — `/api/notifications`
`GET /`, `GET /unread-count`, `PATCH /{id}/read`, `PATCH /read-all`

### Other
Analytics `GET /api/analytics/dashboard` · Dashboard `GET /api/dashboard/stats` ·
Labs `/api/labs` (CRUD) · Institutions `/api/institutions` · Departments `/api/departments` ·
Current user `GET /api/users/me`

---

## 4. Database Schema

Managed by ordered migrations in `database/` (run alphabetically):

| File | Contents |
|------|----------|
| `01_schema_auth_organization.sql` | users, roles, user_roles, institutions, departments |
| `02_schema_labs_equipment.sql` | labs, equipment, images, documents |
| `03_schema_booking.sql` | bookings, booking_history |
| `04_seed_data.sql` | seed roles, admin/student accounts, sample data |
| `05_migration_otp_oauth.sql` | password reset tokens, OAuth fields |
| `06_migration_roles_equipment_inventory.sql` | inventory extensions |
| `07_oauth_google.sql` | Google auth provider fields |
| `08_booking_status_waitlist.sql` | booking status enum, waitlist |
| `09_utilization_monitoring.sql` | equipment_usage tracking |
| `10_inter_institution_sharing.sql` | sharing_requests |
| `11_recurring_audit_calendar_fees.sql` | recurring bookings, fees |
| `12_milestone3_maintenance_billing_notifications.sql` | maintenance, invoices, notifications |

> On Docker startup these run automatically. Hibernate `ddl-auto=update` also
> reconciles the entity model, so the app is resilient to schema drift.

---

## 5. Testing

- **Backend** — 81 tests (JUnit 5 + Mockito). Service unit tests cover the booking
  state machine, equipment rules, utilization math, sharing workflow, waitlist queue,
  auth/OTP flow, billing, and maintenance. Web-slice tests (`@WebMvcTest`) verify
  auth endpoints and equipment RBAC. Run: `cd backend && ./mvnw test`.
- **Frontend** — 21 tests (Vitest + React Testing Library) covering the API
  interceptor, auth service, `ProtectedRoute`, and `ConfirmDialog`.
  Run: `cd frontend && npm test`.

---

## 6. Deployment

The whole stack runs with one command via Docker Compose:

```bash
cp .env.docker.example .env      # fill in secrets
docker compose up --build
```

- Frontend (Nginx) → http://localhost:3000
- Backend (Spring Boot) → http://localhost:8080
- PostgreSQL → localhost:5433

Nginx serves the built SPA and proxies `/api` and `/uploads` to the backend, so the
browser sees a single origin (no CORS in production). See `docker-compose.yml`,
`backend/Dockerfile`, `frontend/Dockerfile`, and `frontend/nginx.conf`.

**CI/CD** — GitHub Actions (`.github/workflows/`): `ci.yml` runs backend tests and
frontend lint/test/build on every push and PR; `docker.yml` builds both images.
