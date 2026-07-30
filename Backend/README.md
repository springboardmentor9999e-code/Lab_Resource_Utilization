# REMS Backend — Auth & Institution Module

Spring Boot 3 + Spring Security + JWT + PostgreSQL.

## What's in this task

- **Role-based registration** — `users` table with `role_id` FK to a fixed `roles` table (6 roles, permissions stored inline as JSONB).
- **Institution + Department (both optional at registration)** — a user can pick an institution and department, or leave both `null` if they don't belong to one yet. If an institution is given, it must exist and already be `ACTIVE` (approved) — you can't register against a still-`PENDING` institution. If a department is given, an institution must be given too, and the department must actually belong to that institution.
- **Institution registration** — self-registers as `PENDING`, flips to `ACTIVE` only via a System-Administrator-only approval endpoint.
- **Login** — email + password + roleId. Returns a JWT plus the user's details (including `createdAt`).
- **Logout** — stateless JWT, so logout blacklists the token's `jti` (JWT ID) in a `blacklisted_tokens` table until it would've expired anyway. `JwtAuthFilter` rejects any request carrying a blacklisted jti even if the signature is still valid.
- **Token expiry** — 1 day (`app.jwt.expiration-ms: 86400000`), configurable in `application.yml`.
- **User status** — defaults to `ACTIVE` immediately on successful registration (no email verification step in this task).

## Setup

1. Create the database:
   ```sql
   CREATE DATABASE rems_db;
   ```
2. Update `src/main/resources/application.yml` with your Postgres username/password (or set env vars).
3. Set a real JWT secret before running anywhere but locally:
   ```bash
   export JWT_SECRET="a-long-random-256-bit-secret-do-not-commit-this"
   ```
4. Run:
   ```bash
   ./mvnw spring-boot:run
   ```
   `ddl-auto: update` creates the tables on first run, then `data.sql` seeds the 6 roles.

## API

### Register a user (with institution + department)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Sharma",
    "email": "aarav.sharma@iitbhu.ac.in",
    "password": "SecurePass123",
    "phone": "+91-9800000001",
    "roleId": 1,
    "institutionId": 1,
    "departmentId": 1
  }'
```
Response: `201 Created` with `{ token, user: { userId, name, email, phone, status, roleId, roleName, permissions, institutionId, institutionName, departmentId, departmentName, createdAt, updatedAt } }`.

### Register a user (no institution/department yet)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Verma",
    "email": "priya.verma@example.com",
    "password": "SecurePass123",
    "roleId": 2
  }'
```
Just omit `institutionId`/`departmentId` (or send them as `null`) — `institutionId`/`institutionName`/`departmentId`/`departmentName` come back `null` in the response.

**Validation you'll hit if you get it wrong:**
- `institutionId` pointing at a `PENDING` institution → `400 Bad Request`
- `departmentId` given without `institutionId` → `400 Bad Request`
- `departmentId` that belongs to a *different* institution than the one given → `400 Bad Request`

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aarav.sharma@iitbhu.ac.in",
    "password": "SecurePass123",
    "roleId": 1
  }'
```
Returns `403` if `roleId` doesn't match what's stored on the account — this is what makes it a "role-based" login rather than a plain email/password login.

### Register an institution (public, lands as PENDING)
```bash
curl -X POST http://localhost:8080/api/institutions/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IIT (BHU) Varanasi",
    "type": "Autonomous Institute",
    "address": "Varanasi, Uttar Pradesh",
    "contactEmail": "admin@iitbhu.ac.in",
    "contactPhone": "+91-542-2367000"
  }'
```

### Approve an institution (System Administrator only — needs a valid JWT for a role-6 user)
```bash
curl -X PATCH http://localhost:8080/api/institutions/1/approve \
  -H "Authorization: Bearer <system-admin-jwt>"
```

### Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <the-token-you-got-from-login>"
```
Response: `200 OK` `{ "message": "Logged out successfully" }`. That exact token will now be rejected by every protected endpoint, even before its 1-day expiry.

## Roles (fixed, seeded via data.sql)

| role_id | role_name | permissions |
|---|---|---|
| 1 | Researcher / Student | view_equipment, create_booking, view_own_bookings, join_waitlist |
| 2 | Lab Technician | view_equipment, update_equipment_status, manage_maintenance_requests, log_calibration |
| 3 | Lab Manager | approve_bookings, manage_equipment, view_department_utilization, manage_waitlist |
| 4 | Department Head | approve_bookings, view_department_reports, manage_department_budget, approve_sharing_requests |
| 5 | Institution Administrator | manage_users, view_institution_reports, manage_sharing_agreements, manage_institution_equipment |
| 6 | System Administrator | manage_roles, manage_system_settings, view_audit_logs, manage_all_institutions |

## Known simplifications (worth revisiting as the project grows)

- **Roles table is fixed/seeded**, not manageable through the API yet — "manage_roles" permission exists but there's no endpoint behind it yet in this task.
- **No refresh token** — access token is a flat 1-day JWT. Logout blacklists it early via jti, but there's no separate longer-lived refresh token yet.
- **Blacklist table grows forever unless cleaned up** — `blacklisted_tokens` rows are only ever inserted, never purged. In production you'd want a scheduled job (`@Scheduled`) that deletes rows where `expires_at < now()`, since a jti is useless to check once its token would've expired anyway.
- **No email verification** on user registration — status defaults straight to `ACTIVE`. If you want to gate new users the way institutions are gated, add a `PENDING` user status and an activation flow.
- **Department has no self-registration endpoint yet** — this task assumes departments already exist (created some other way, e.g. by an Institution Administrator) so a registering user can just reference an existing `departmentId`. If you need "create a department" too, that's a quick follow-up.
