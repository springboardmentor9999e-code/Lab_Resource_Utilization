# Lab Resource Utilization Platform (LRUP) — Session Progress

## Project Overview

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Spring Boot 3.3 + Java 17 + PostgreSQL 18.4
- **Deployment:** Docker Compose (planned), currently local dev
- **7 User Roles:** SYSTEM_ADMIN, INSTITUTION_ADMIN, DEPARTMENT_HEAD, LAB_MANAGER, LAB_TECHNICIAN, RESEARCHER, STUDENT
- **DB:** Flyway migrations V1–V11, `ddl-auto: update` for dev/default profiles
- **Google OAuth:** After login, new users redirected to role selection page (`/oauth2/complete-profile`)
- **Student role:** Same UI as Researcher (no separate dashboard)
- **Payment model:** Internal chargeback — no user-facing payment gateway; mock prototype for demo

---

## Session 1 — Core Bug Fixes

### AnalyticsDashboard Download Import Fix
- Fixed broken import in `AnalyticsDashboard.jsx`

### AnalyticsService countByStatus Fix
- Fixed incorrect status counting logic in `AnalyticsService.java`

### Audit Logging in AuthService
- Added `@Auditable` annotations to login/register flows

### CostDashboard Fixes
- Fixed `inst.name` → `inst.institutionName` (entity field mismatch)
- Fixed broken breakdown queries in cost summaries

### SystemMonitorService Refactor
- Replaced raw JDBC queries with JPA repository queries for active user/equipment counts

### Repository Fixes
- `BookingRepository.java`: Added `countByStatusIn()` method
- `InvoiceRepository.java`: Fixed MySQL → PostgreSQL `EXTRACT(MONTH FROM ...)` native query
- `AuditLogRepository.java`: Converted `findFiltered`/`findFilteredByModule` to native SQL with `COALESCE` typed defaults

### PasswordEncoder Circular Dependency
- Extracted `PasswordEncoder` bean to `PasswordEncoderConfig.java`

### Dead Code Cleanup
- Removed unused `OAuth2Controller.java`
- Consolidated duplicate OAuth2 routes

### ResetPasswordPage Fix
- Fixed password validation mismatch between frontend and backend

---

## Session 2 — Google OAuth + Role Selection Flow

### Problem
Google OAuth logged users in but didn't allow role/institution selection for new users.

### Backend Changes
- **JwtTokenProvider:** Added token generation with email + role claims
- **OAuth2AuthenticationSuccessHandler:** After Google login, redirects new users to `/oauth2/complete-profile` with JWT token
- **AuthService:** Added `completeOAuthProfile()` — sets role, institution, department for OAuth users; creates new Institution when "Other" is selected
- **AuthController:** Added `POST /auth/oauth2/complete-profile` endpoint

### Frontend Changes
- **RoleSelectionPage.jsx:** New page with role dropdown, institution dropdown (fetched from API), department dropdown (filtered by institution), "Other (Not Listed)" option with custom institution name text input
- **OAuth2CallbackPage.jsx:** Extracts JWT from URL params, stores in localStorage, redirects to role selection if first-time user
- **App.jsx:** Added routes for `/oauth2/complete-profile` and `/oauth2/callback`
- **api.js:** Added OAuth2 API helpers
- **CustomOAuth2UserService:** Updated to check `role_config.enabled` and `user.status` for existing OAuth users

### SecurityConfig Changes
- Added `permitAll` for `GET /institutions` and `GET /departments` (needed for role selection dropdowns)

---

## Session 3 — Role Enforcement & Inactive User Toggle

### Role Enable/Disable Enforcement
- **CustomUserDetailsService:** Throws `DisabledException` (instead of `UsernameNotFoundException`) when user's role is disabled in `role_config`
- **CustomOAuth2UserService:** Checks `user.getStatus()` and `role_config.enabled` for OAuth users; throws `OAuth2AuthenticationException` for disabled
- **GlobalExceptionHandler:** Added handler for `DisabledException` → 403 + `ACCOUNT_DISABLED` error code
- **JwtAuthenticationFilter:** Added try-catch to handle exceptions gracefully

### Inactive User Toggle — Email/Password Login
- **LoginPage.jsx:** Reads `?error=true` query param; shows 6-second toast message for deactivated accounts: "Your account has been deactivated. Please contact an administrator."

### Inactive User Toggle — Google OAuth
- **SecurityConfig:** `failureUrl` set to `frontendUrl + "/login?error=true"` for OAuth failures
- **CustomOAuth2UserService:** Checks `user.getStatus()` before allowing login
- **LoginPage.jsx:** Reads `?error=true` and displays same deactivation toast

### OAuth2 "Other" Institution Option
- **CompleteProfileRequest:** Accepts nullable `institutionId` + `departmentId` + `customInstitutionName`
- **AuthService.completeOAuthProfile():** Creates new `Institution` entity when `institutionId` is null and `customInstitutionName` is provided
- **RoleSelectionPage.jsx:** Added "Other (Not Listed)" option with conditional text input

---

## Session 4 — Budget System, Auto-Invoice, Mock Payment

### Budget System

#### Backend
- **V10__add_department_budgets.sql:** New Flyway migration creating `department_budgets` table (id, department_id, fiscal_year, budget_amount, description, timestamps)
- **DepartmentBudget.java:** Entity mapping to `department_budgets`
- **DepartmentBudgetRepository.java:** Queries for budgets by institution, department, fiscal year
- **BudgetService.java:** Full CRUD — `setBudget` (upsert by dept+year), `getBudget`, `getAllBudgets` (with filters), `updateBudget`, `deleteBudget`; all methods annotated with `@Auditable`
- **BudgetController.java:** REST endpoints — `POST/GET/PUT/DELETE /budgets` with `@PreAuthorize` role checks
- **BudgetRequest.java:** Added `fiscalYear` field

#### Frontend
- **BudgetManagement.jsx:** Full CRUD page with summary cards (total budget, spent, utilization), data table with utilization bars, set/edit/delete modals

### Auto-Invoice Generation

#### Backend
- **BookingService.completeBooking():** Sets status to `COMPLETED`, creates booking history, frees equipment, auto-generates invoice via `InvoiceService.generateInvoiceFromBooking()`, sends notification, promotes from waitlist
- **BookingController.java:** Added `PUT /{id}/complete` endpoint with role-based access

### Mock Payment Prototype

#### Backend
- **PaymentService.java:** Added `deletePayment()` with invoice status recalculation
- **PaymentController.java:** Added `DELETE /{id}` endpoint (SYSTEM_ADMIN only)

#### Frontend
- **MockPaymentModal.jsx:** 5-step animated payment prototype:
  1. Invoice Summary (amount, tax, total)
  2. Payment Method Selection (Credit Card / Bank Transfer / UPI)
  3. Mock Form (card number, expiry, CVV for credit card)
  4. Animated Processing (2.5s spinner)
  5. Success Screen (animated checkmark, payment ref, "Download Receipt" button)
- **InvoiceManagement.jsx:** Added "Pay" button (green CreditCard icon) for `PENDING`/`PARTIALLY_PAID` invoices; integrated MockPaymentModal; changed currency to INR

### API & Routing Fixes
- **api.js:** Added `budgetApi` (getAll/set/update/delete), `bookingApi.complete()`, `paymentApi.delete()`, `costApi.getBudgetSummary()`
- **App.jsx:** Added `/admin/budgets` route with `AdminRoute` wrapper
- **Layout.jsx:** Added "Budget Management" sidebar nav link in `adminNavItems`

### CostTrackingService Budget Data
- **CostTrackingService.buildBudgetSummary():** Now queries real `DepartmentBudgetRepository` for budget data instead of hardcoding zeros

---

## Session 5 — E2E Testing & Bug Fixes

### Test Infrastructure
- Confirmed backend running on `:8081` (context-path `/api`), PostgreSQL on `:5433`, frontend on `:3000`
- Created test user `admin@lrup.com` (SYSTEM_ADMIN, Demo University, Mechanical Eng)
- Required `Accept: application/json` header to prevent OAuth2 redirects in API calls

### Full E2E Flow Verified

| Step | Action | Result |
|------|--------|--------|
| 1 | Admin creates budget (₹50L, Mechanical Eng, 2026) | PASS |
| 2 | Researcher Arun books GPU Server (2hrs, PENDING_APPROVAL) | PASS |
| 3 | Lab Manager Priya approves → completes booking | PASS |
| 3b | Invoice auto-generated: ₹4,000 (2hrs × ₹2,000/hr) | PASS |
| 4 | Admin pays via CREDIT_CARD mock → status = PAID | PASS |
| 5 | Audit logs confirm full trail: CREATE→APPROVE→COMPLETE→INVOICE→PAYMENT | PASS |
| 6 | Notifications: Arun received "Approved" + "Completed" notifications | PASS |

### Bugs Found & Fixed During E2E

1. **Invoice amount calculation** (`InvoiceService.java:148-151`): Was `purchaseCost × hours` → Fixed to `hourlyRate × hours` (with fallback)
2. **completeBooking status check** (`BookingService.java:258`): Only allowed `CONFIRMED`/`IN_USE` → Fixed to also allow `APPROVED`
3. **MyBookingsPage.jsx** (`line 107`): "Complete" button only for `CONFIRMED`/`IN_USE` → Fixed to also show for `APPROVED`

---

## Current State

### Backend
- **BUILD SUCCESS** — `mvn clean package -DskipTests` passes
- **63/63 tests pass** — `mvn test` all green
- **11 Flyway migrations** — V1 through V11
- **Running on port 8081** with context-path `/api`

### Frontend
- **BUILD SUCCESS** — `npm run build` passes
- **Running on port 3000** (Vite dev server)
- Non-blocking chunk size warning (1,370 KB main bundle)

### Database State
- 3 Institutions (Demo University, SIMATS Engineering, SEC)
- 5 Departments across 2 institutions
- 6 Equipment items with hourly rates
- 14 Bookings (various statuses)
- 3 Invoices (1 orphan PAID, 1 PAID from E2E, 1 PENDING from E2E)
- 2 Payments (1 old PAID, 1 E2E mock CREDIT_CARD)
- 197+ Audit log entries
- 37+ Notifications

### Test Credentials
| Email | Role | Password | Institution |
|-------|------|----------|-------------|
| admin@lrup.com | SYSTEM_ADMIN | Admin@12345 | Demo University |
| admin@demouniversity.edu | SYSTEM_ADMIN | Password@123 | Demo University |
| priya@demouniversity.edu | LAB_MANAGER | Password@123 | Demo University |
| arun@demouniversity.edu | RESEARCHER | Password@123 | Demo University |
| rajesh@demouniversity.edu | LAB_TECHNICIAN | Password@123 | Demo University |
| meena@demouniversity.edu | DEPARTMENT_HEAD | Password@123 | Demo University |
| suresh@demouniversity.edu | INSTITUTION_ADMIN | Password@123 | Demo University |
| sneha@demouniversity.edu | RESEARCHER | Password@123 | Demo University |

---

## All Files Modified/Created (Cumulative)

### New Backend Files
| File | Purpose |
|------|---------|
| `V10__add_department_budgets.sql` | Budget table migration |
| `V11__add_hourly_rate_to_equipment.sql` | Hourly rate column + seed data |
| `DepartmentBudget.java` | Budget entity |
| `DepartmentBudgetRepository.java` | Budget queries |
| `BudgetService.java` | Budget CRUD |
| `BudgetController.java` | Budget REST endpoints |
| `BudgetRequest.java` | Budget DTO (with fiscalYear) |
| `PasswordEncoderConfig.java` | Extracted PasswordEncoder bean |

### New Frontend Files
| File | Purpose |
|------|---------|
| `BudgetManagement.jsx` | Budget CRUD page |
| `MockPaymentModal.jsx` | 5-step payment prototype |
| `OAuth2CallbackPage.jsx` | Google OAuth callback handler |
| `RoleSelectionPage.jsx` | Post-login role/institution selection |

### Edited Backend Files
| File | Change |
|------|--------|
| `BookingService.java` | `completeBooking()` with auto-invoice, status check fix |
| `BookingController.java` | `PUT /{id}/complete` endpoint |
| `BookingRepository.java` | `countByStatusIn()` |
| `InvoiceService.java` | `generateInvoiceFromBooking()`, hourly rate fix |
| `InvoiceRepository.java` | PostgreSQL EXTRACT fix |
| `PaymentService.java` | `deletePayment()` with status recalculation |
| `PaymentController.java` | `DELETE /{id}` endpoint |
| `CostTrackingService.java` | Real budget data from repository |
| `SystemMonitorService.java` | JPA-based active counts |
| `JwtAuthenticationFilter.java` | Exception handling |
| `CustomUserDetailsService.java` | DisabledException for inactive users |
| `CustomOAuth2UserService.java` | Status + role_config checks for OAuth |
| `JwtTokenProvider.java` | Token generation with claims |
| `OAuth2AuthenticationSuccessHandler.java` | Redirect to role selection |
| `AuthService.java` | `completeOAuthProfile()`, institution creation |
| `AuthController.java` | OAuth2 complete-profile endpoint |
| `GlobalExceptionHandler.java` | DisabledException handler |
| `SecurityConfig.java` | permitAll for institutions/departments, OAuth failure URL |
| `Equipment.java` | Added `hourlyRate` field |
| `AuditLogRepository.java` | Native SQL with COALESCE |

### Edited Frontend Files
| File | Change |
|------|--------|
| `App.jsx` | OAuth2 routes, budget route |
| `api.js` | budgetApi, bookingApi.complete, paymentApi.delete |
| `Layout.jsx` | Budget Management sidebar link |
| `InvoiceManagement.jsx` | Pay Now button + MockPaymentModal integration |
| `MyBookingsPage.jsx` | Mark Complete button (APPROVED/CONFIRMED/IN_USE) |
| `RoleSelectionPage.jsx` | "Other (Not Listed)" institution option |
| `OAuth2CallbackPage.jsx` | JWT extraction from URL |
| `LoginPage.jsx` | Deactivation toast for ?error=true |
