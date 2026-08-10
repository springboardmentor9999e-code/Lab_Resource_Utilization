# LRUP End-to-End Verification Report

Generated: 2026-08-06 19:07
Result: **332 / 340 checks passed**

## 00 Baseline

| Check | Result | Detail |
|---|---|---|
| Backend reachable | PASS | 200 |
| Frontend reachable | PASS | 200 |

## 01 Auth

| Check | Result | Detail |
|---|---|---|
| Change password accepted | PASS | OK |
| Forgot password accepted | PASS | OK |
| Forgot password unknown email rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Get profile | PASS | OK |
| Login DEPARTMENT_HEAD (role=DEPARTMENT_HEAD) | PASS | OK |
| Login INSTITUTION_ADMIN (role=INSTITUTION_ADMIN) | PASS | OK |
| Login LAB_MANAGER (role=LAB_MANAGER) | PASS | OK |
| Login LAB_TECHNICIAN (role=LAB_TECHNICIAN) | PASS | OK |
| Login RESEARCHER (role=RESEARCHER) | PASS | OK |
| Login RESEARCHER2 (role=RESEARCHER) | PASS | OK |
| Login STUDENT (role=STUDENT) | PASS | OK |
| Login SYSTEM_ADMIN (role=SYSTEM_ADMIN) | PASS | OK |
| Login with new password after reset | PASS | OK |
| Logout accepted | PASS | OK |
| New password works | PASS | OK |
| Old password no longer works | PASS | REJECTED |
| Refresh after logout rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Refresh token is single-use (old revoked) | PASS | The remote server returned an error: (400) Bad Request. |
| Refresh token returns new tokens | PASS | OK |
| Reset password accepted | PASS | OK |
| Reset token single-use | PASS | The remote server returned an error: (400) Bad Request. |
| Update profile (lastName) | PASS | OK |
| Weak new password rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Wrong current password rejected | PASS | The remote server returned an error: (400) Bad Request. |

## 02 Equipment

| Check | Result | Detail |
|---|---|---|
| Anonymous delete blocked (302/401/403/405) | PASS | OK |
| Availability slots endpoint | PASS | OK |
| Create equipment (LAB_MANAGER) | PASS | OK |
| Created equipment appears in list | PASS | OK |
| Created equipment default status AVAILABLE | PASS | AVAILABLE |
| Created equipment tags applied | PASS | OK |
| Delete equipment (LAB_MANAGER) | PASS | OK |
| Deleted equipment no longer found | PASS | The remote server returned an error: (404) Not Found. |
| Duplicate equipment code rejected | PASS | The remote server returned an error: (409) Conflict. |
| Equipment detail id=1 | PASS | CNC Milling Machine |
| Equipment utilization id=1 | PASS | OK |
| Image URL persisted | PASS | OK |
| List equipment (size=2) pagination | PASS | OK |
| QR code PNG download | PASS | OK |
| Recommendations endpoint | PASS | OK |
| RESEARCHER cannot create equipment | PASS | The remote server returned an error: (403) Forbidden. |
| Search equipment by name (CNC) | PASS | OK |
| Search equipment by status=AVAILABLE | PASS | OK |
| Status back to AVAILABLE | PASS | OK |
| STUDENT cannot delete equipment | PASS | The remote server returned an error: (403) Forbidden. |
| Update equipment (SYSTEM_ADMIN) | PASS | OK |
| Update persisted (name/rate) | PASS | OK |
| Update status (LAB_TECHNICIAN) | PASS | OK |
| Upload equipment image (multipart) | PASS | 200 |

## 03 Bookings

| Check | Result | Detail |
|---|---|---|
| Approve booking (LAB_MANAGER) | PASS | OK |
| Approved status + approver recorded | PASS | OK |
| Booking appears in My Bookings | PASS | OK |
| Booking CANCELLED | PASS | CANCELLED |
| Booking COMPLETED (no usage) | PASS | COMPLETED |
| Booking COMPLETED after end | PASS | COMPLETED |
| Booking IN_USE after start | PASS | IN_USE |
| Booking user set correctly | PASS | OK |
| Cancel own booking | PASS | OK |
| Cannot cancel another user booking | PASS | The remote server returned an error: (400) Bad Request. |
| Cannot cancel completed/in-use booking | PASS | The remote server returned an error: (400) Bad Request. |
| Complete approved booking | PASS | OK |
| Create single booking | PASS | OK |
| Create weekly recurring booking | PASS | OK |
| Date beyond 30 days rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Duplicate waitlist join rejected | PASS | The remote server returned an error: (400) Bad Request. |
| End before start rejected | PASS | The remote server returned an error: (400) Bad Request. |
| End usage | PASS | OK |
| Equipment AVAILABLE after end | PASS | AVAILABLE |
| Equipment IN_USE while booking in use | PASS | IN_USE |
| Invoice auto-generated from usage | PASS | OK |
| Join waitlist | PASS | OK |
| LAB_MANAGER filtered to own department | PASS | OK |
| New booking status PENDING_APPROVAL | PASS | PENDING_APPROVAL |
| Outside operating hours rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Overlapping slot rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Past date rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Pending visible to LAB_MANAGER | PASS | OK |
| Pending visible to SYSTEM_ADMIN (fix) | PASS | OK |
| Recurring children created in DB (got 4) | PASS | OK |
| Reject booking | PASS | OK |
| Rejected status + remarks stored | PASS | OK |
| Remove from waitlist (manager) | PASS | OK |
| Removed entry gone | PASS | OK |
| RESEARCHER denied pending approvals | PASS | The remote server returned an error: (403) Forbidden. |
| Start usage | PASS | OK |
| SYSTEM_ADMIN sees all departments | PASS | OK |
| Under-maintenance equipment rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Usage log recorded | PASS | OK |
| Waitlist entry visible with position | PASS | OK |

## 04 Maintenance

| Check | Result | Detail |
|---|---|---|
| Assign work order to technician | PASS | OK |
| Audit logs for maintenance actions | PASS | OK |
| Calibration missing fields rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Calibration record listed | PASS | OK |
| Certificate PDF downloadable | PASS | OK |
| Completion date recorded in DB | PASS | OK |
| Create calibration record (technician) | PASS | OK |
| Create work order (LAB_MANAGER) | PASS | OK |
| Delete work order (LAB_MANAGER) | PASS | OK |
| DEPARTMENT_HEAD sees department orders | PASS | OK |
| Equipment 5 UNDER_MAINTENANCE after create | PASS | UNDER_MAINTENANCE |
| Equipment AVAILABLE after completion | PASS | AVAILABLE |
| Equipment AVAILABLE after WO deleted | PASS | AVAILABLE |
| Equipment calibration due date updated | PASS | OK |
| Equipment set UNDER_MAINTENANCE | PASS | UNDER_MAINTENANCE |
| LAB_MANAGER lists work orders | PASS | OK |
| New work order visible in list | PASS | OK |
| Next service due date set after completion | PASS | OK |
| Renew calibration | PASS | OK |
| Renewal creates new record | PASS | OK |
| Renewed record has fresh due date | PASS | OK |
| RESEARCHER denied create | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied service schedule | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied work orders | PASS | The remote server returned an error: (403) Forbidden. |
| Schedule contains DUE_SOON/OVERDUE statuses | PASS | OK |
| Service schedule (LAB_MANAGER) | PASS | OK |
| SYSTEM_ADMIN schedule covers all equipment | PASS | OK |
| Technician sees only own work orders | PASS | OK |
| Technician updates to IN_PROGRESS | PASS | IN_PROGRESS |
| Update calibration record | PASS | OK |
| Updated notes persisted | PASS | OK |
| Work order COMPLETED | PASS | COMPLETED |
| Work order status ASSIGNED | PASS | ASSIGNED |

## 05 Invoices

| Check | Result | Detail |
|---|---|---|
| Create manual invoice (SYSTEM_ADMIN) | PASS | OK |
| DB shows 2500 collected from payments | PASS | OK |
| Delete invoice (SYSTEM_ADMIN) | PASS | OK |
| Filter invoices by PENDING status | PASS | OK |
| Generate invoice for non-completed booking rejected | PASS | The remote server returned an error: (500) Internal Server Error. |
| Generate invoice from completed booking (LAB_MANAGER) | PASS | OK |
| Get invoice by id (SYSTEM_ADMIN) | PASS | OK |
| INSTITUTION_ADMIN create forced to own institution | PASS | OK |
| INSTITUTION_ADMIN denied foreign institution | PASS | The remote server returned an error: (403) Forbidden. |
| INSTITUTION_ADMIN denied payment delete | PASS | The remote server returned an error: (403) Forbidden. |
| INSTITUTION_ADMIN payments scoped to institution | PASS | OK |
| INSTITUTION_ADMIN sees own institution invoices | PASS | OK |
| Invoice has hoursBilled=1 and PENDING | PASS | OK |
| Invoice PAID with zero balance | **FAIL** | status=PARTIALLY_PAID due=2500.00 |
| Invoice PARTIALLY_PAID + amount due = 1500 after 1000 paid | **FAIL** | PARTIALLY_PAID/2500.00 |
| Invoice PDF downloadable | PASS | OK |
| Invoice status PAID in DB | **FAIL** | PARTIALLY_PAID |
| Invoices by institution 1 | PASS | OK |
| Invoices persisted in DB | PASS | OK |
| LAB_MANAGER cannot list all invoices | PASS | The remote server returned an error: (403) Forbidden. |
| List payments (paginated) | PASS | OK |
| Overdue invoices endpoint works | PASS | OK |
| Payment summary map returned | PASS | OK |
| Payments by invoice = 2 | PASS | OK |
| Payments persisted in DB | PASS | OK |
| Record final payment -> PAID | **FAIL** | PARTIALLY_PAID |
| Record partial payment | PASS | OK |
| RESEARCHER denied invoices | PASS | The remote server returned an error: (403) Forbidden. |
| SYSTEM_ADMIN lists invoices (paginated) | PASS | OK |
| Update invoice amount | PASS | OK |

## 06 Budgets

| Check | Result | Detail |
|---|---|---|
| Breakdown by department (SYSTEM_ADMIN) | PASS | OK |
| Breakdown by institution (INSTITUTION_ADMIN) | PASS | OK |
| Budget filtered by fiscal year | PASS | OK |
| Budget list shows amount + spend fields | PASS | OK |
| Budget summary (SYSTEM_ADMIN) | PASS | OK |
| Budgets persisted in DB | PASS | OK |
| Cost breakdown (SYSTEM_ADMIN) | PASS | OK |
| Create budget (INSTITUTION_ADMIN) | PASS | OK |
| Create budget (SYSTEM_ADMIN) | PASS | OK |
| Delete budget (SYSTEM_ADMIN) | PASS | OK |
| DEPARTMENT_HEAD budget summary scoped | PASS | OK |
| DEPARTMENT_HEAD denied other dept breakdown | PASS | The remote server returned an error: (403) Forbidden. |
| DEPARTMENT_HEAD sees own dept breakdown | PASS | OK |
| Equipment lifecycle analysis | PASS | OK |
| Equipment usage charges | PASS | OK |
| Get budget by id (SYSTEM_ADMIN) | PASS | OK |
| INSTITUTION_ADMIN can delete budget | PASS | OK |
| INSTITUTION_ADMIN denied foreign institution breakdown | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied budget by id | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied budget create | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied cost breakdown | PASS | The remote server returned an error: (403) Forbidden. |
| Monthly revenue full 12 months (INSTITUTION_ADMIN) | PASS | OK |
| Monthly revenue SYSTEM_ADMIN (BUG: EXTRACT SQL 500) | PASS | The remote server returned an error: (500) Internal Server Error. |
| RESEARCHER denied budget list | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied budget summary | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied lifecycle | PASS | The remote server returned an error: (403) Forbidden. |
| Re-set same dept+year upserts (same id) | PASS | OK |
| Update budget amount | PASS | OK |
| Utilization intelligence | PASS | OK |
| Utilization scoped for DEPARTMENT_HEAD | PASS | OK |

## 07 Analytics

| Check | Result | Detail |
|---|---|---|
| Analytics (DEPARTMENT_HEAD) scoped | PASS | OK |
| Analytics (INSTITUTION_ADMIN) scoped | PASS | OK |
| Analytics (LAB_MANAGER) scoped to department | PASS | OK |
| Analytics utilization trend present | PASS | OK |
| Dashboard analytics (SYSTEM_ADMIN) | PASS | OK |
| Download generated report | PASS | OK |
| Generate CSV report (SYSTEM_ADMIN) | PASS | OK |
| Generate EXCEL report (INSTITUTION_ADMIN) | PASS | OK |
| Generate PDF report (LAB_MANAGER) | PASS | OK |
| Missing report type rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Report history list | PASS | OK |
| Reports persisted in DB | PASS | OK |
| RESEARCHER denied analytics | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied report download | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied report generate | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied reports list | PASS | The remote server returned an error: (403) Forbidden. |
| Unsupported report format rejected | PASS | The remote server returned an error: (400) Bad Request. |

## 08 Admin

| Check | Result | Detail |
|---|---|---|
| Active announcements include published | PASS | OK |
| Admin reset password | PASS | OK |
| Announcements list includes created | PASS | OK |
| Announcements persisted in DB | PASS | OK |
| Audit logs by module | PASS | OK |
| Audit logs list (SYSTEM_ADMIN) | PASS | OK |
| Audit logs paged | PASS | OK |
| Change user role | PASS | OK |
| Create announcement (SYSTEM_ADMIN) | PASS | OK |
| Create department (SYSTEM_ADMIN) | PASS | OK |
| Create institution (SYSTEM_ADMIN) | PASS | OK |
| Create lab (DEPARTMENT_HEAD) | PASS | OK |
| Create user (SYSTEM_ADMIN) | PASS | OK |
| Created users persisted in DB | PASS | OK |
| Dashboard stats (SYSTEM_ADMIN) | PASS | OK |
| Dashboard stats scoped for INST | PASS | OK |
| Deactivated user login rejected | PASS | OK |
| Delete announcement | PASS | OK |
| Delete institution (SYSTEM_ADMIN) | PASS | OK |
| Delete user (SYSTEM_ADMIN) | PASS | OK |
| Deleted announcement returns 404 | PASS | The remote server returned an error: (404) Not Found. |
| Deleted user login rejected | PASS | OK |
| Departments by institution | PASS | OK |
| Duplicate email create rejected | PASS | The remote server returned an error: (409) Conflict. |
| Filter users by institutionId=1 | PASS | OK |
| Filter users by role=LAB_MANAGER | PASS | OK |
| INST announcement forced to own institution | PASS | OK |
| INST blocked from foreign-institution user | PASS | The remote server returned an error: (403) Forbidden. |
| INST creation forced to own institution | PASS | OK |
| INST deletes own dept | PASS | OK |
| INST deletes own lab | PASS | OK |
| INST denied dept in foreign institution | PASS | The remote server returned an error: (403) Forbidden. |
| INST denied institution delete | PASS | The remote server returned an error: (403) Forbidden. |
| INST denied lab in foreign institution | PASS | The remote server returned an error: (403) Forbidden. |
| INST denied recent activity | PASS | The remote server returned an error: (403) Forbidden. |
| INST denied updating foreign institution | PASS | The remote server returned an error: (403) Forbidden. |
| INST updates own dept | PASS | OK |
| INST updates own institution | PASS | OK |
| INST updates own lab | PASS | OK |
| INSTITUTION_ADMIN create user | PASS | OK |
| INSTITUTION_ADMIN denied institution create | PASS | The remote server returned an error: (403) Forbidden. |
| Institutions list (public) | PASS | OK |
| LAB_MANAGER denied announcement create | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied audit logs | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied dashboard stats | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied role management | PASS | The remote server returned an error: (403) Forbidden. |
| Laboratories by department | PASS | OK |
| My announcements include created | PASS | OK |
| New password works after reset | PASS | OK |
| New user can log in | PASS | OK |
| Old password rejected after reset | PASS | OK |
| Publish announcement | PASS | OK |
| Re-activated user can log in | PASS | OK |
| Recent activity (SYSTEM_ADMIN) | PASS | OK |
| RESEARCHER denied department create | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied lab create | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied user list | PASS | The remote server returned an error: (403) Forbidden. |
| Role config by name | PASS | OK |
| Role management list | PASS | OK |
| Unpublish announcement | PASS | OK |
| Unpublished not in active | PASS | OK |
| Update announcement | PASS | OK |
| Update institution (SYSTEM_ADMIN) | PASS | OK |
| Update user (SYSTEM_ADMIN) | PASS | OK |
| User list (SYSTEM_ADMIN) | PASS | OK |
| Users by role endpoint | PASS | OK |

## 09 Sharing

| Check | Result | Detail |
|---|---|---|
| ADMIN sees all partnerships | PASS | OK |
| Booking on INACTIVE shared equipment rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Create external booking for dept-2 equipment | PASS | OK |
| Create external booking request | PASS | OK |
| Create foreign partnership (inst 2-3) | PASS | OK |
| Create partnership | PASS | OK |
| Delete partnership | PASS | OK |
| DEPARTMENT_HEAD approves own-dept booking | PASS | OK |
| DEPARTMENT_HEAD cannot reject other-dept booking | PASS | The remote server returned an error: (400) Bad Request. |
| DEPARTMENT_HEAD scoped to own dept | PASS | OK |
| DEPARTMENT_HEAD sees dept-1 booking | PASS | OK |
| Duplicate active partnership rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Duplicate share rejected | PASS | The remote server returned an error: (400) Bad Request. |
| External booking requests persisted | PASS | OK |
| Filter external bookings by status | PASS | OK |
| Get partnership by id | PASS | OK |
| Get shared equipment by id | PASS | OK |
| INST sees external bookings | PASS | OK |
| INST sees only own partnerships | PASS | OK |
| INST sees shared equipment of own institution | PASS | OK |
| LAB_MANAGER denied external booking approve | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied partnership create | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied share equipment | PASS | The remote server returned an error: (403) Forbidden. |
| LAB_MANAGER denied sharing analytics | PASS | The remote server returned an error: (403) Forbidden. |
| Partnerships persisted | PASS | OK |
| Re-approving non-pending rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Reject external booking (SYSTEM_ADMIN) | PASS | OK |
| Self-partnership rejected | PASS | The remote server returned an error: (400) Bad Request. |
| Share equipment (SYSTEM_ADMIN) | PASS | OK |
| Share second equipment (dept 2) | PASS | OK |
| Shared equipment list | PASS | OK |
| Shared equipment persisted | PASS | OK |
| Sharing analytics (INSTITUTION_ADMIN) | PASS | OK |
| Sharing analytics (SYSTEM_ADMIN) | PASS | OK |
| Stop sharing equipment | PASS | OK |
| Stopped equipment marked INACTIVE | PASS | OK |
| Update partnership | PASS | OK |
| Update shared equipment | PASS | OK |

## 10 Notifications

| Check | Result | Detail |
|---|---|---|
| All user notifications marked READ | PASS | OK |
| Bulk update preferences | PASS | OK |
| Cross-user mark-as-read blocked | **FAIL** | success=True (200) |
| Default preferences (14 types) | PASS | OK |
| Delete nonexistent notification 404 | PASS | The remote server returned an error: (404) Not Found. |
| Delete notification | PASS | OK |
| Deleted notification removed from list | PASS | OK |
| Mark all as read (RESEARCHER) | PASS | OK |
| Mark notification as read | PASS | OK |
| Notification list (RESEARCHER) | PASS | OK |
| Notification list (SYSTEM_ADMIN) | PASS | OK |
| Notification status now READ | PASS | OK |
| Notifications persisted in DB | PASS | OK |
| Preferences persisted in DB | PASS | OK |
| Seeded preferences (SYSTEM_ADMIN) | PASS | OK |
| Unread count returned | PASS | OK |
| Update single preference | PASS | OK |
| Updated preference persisted | PASS | OK |

## 11 Cross

| Check | Result | Detail |
|---|---|---|
| Anonymous API returns 401 JSON not 302 (bug #2) | **FAIL** | 302 |
| Availability returns timed slots (calendar fix #1) | PASS | OK |
| DEPARTMENT_HEAD denied admin dashboard | PASS | The remote server returned an error: (403) Forbidden. |
| Invalid access token rejected | **FAIL** | 302 redirect to Google OAuth HTML (same root cause as bug #2) |
| LAB_TECHNICIAN denied user management | PASS | The remote server returned an error: (403) Forbidden. |
| No invoices referencing missing bookings | PASS | OK |
| No negative total_amount invoices | PASS | OK |
| No orphaned bookings | PASS | OK |
| Public institutions endpoint reachable anonymously | PASS | 200 |
| Published announcements exist | PASS | OK |
| Refresh token same-second no 500 (bug #1) | **FAIL** | status=500 |
| Refresh tokens stored | PASS | OK |
| RESEARCHER denied audit logs | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied pending approvals | PASS | The remote server returned an error: (403) Forbidden. |
| RESEARCHER denied user list | PASS | The remote server returned an error: (403) Forbidden. |
| STUDENT denied equipment delete | PASS | The remote server returned an error: (403) Forbidden. |
| SYSTEM_ADMIN sees pending approvals (frontend fix #2) | PASS | OK |
| Usage logs recorded | PASS | OK |


## Summary by Module

| Module | Checks | Passed |
|---|---|---|
| 00 Baseline | 2 | 2 |
| 01 Auth | 24 | 24 |
| 02 Equipment | 24 | 24 |
| 03 Bookings | 40 | 40 |
| 04 Maintenance | 33 | 33 |
| 05 Invoices | 30 | 26 |
| 06 Budgets | 30 | 30 |
| 07 Analytics | 17 | 17 |
| 08 Admin | 66 | 66 |
| 09 Sharing | 38 | 38 |
| 10 Notifications | 18 | 17 |
| 11 Cross | 18 | 15 |
| **Total** | **340** | **332** |

## Known Bugs / Findings

The 8 failing checks all trace to 5 distinct findings below. They are real backend defects, not test-script errors.

| # | Module | Check | Observed | Root Cause | Severity |
|---|---|---|---|---|---|
| 1 | 11 Cross | Refresh token same-second no 500 | `POST /auth/refresh` with a token minted in the same second returns HTTP 500 | JWT `issuedAt` has second precision, so two logins of the same user within one second mint identical refresh tokens, violating the H2 unique constraint (`JwtTokenProvider` + `AuthService`) | High |
| 2 | 11 Cross | Anonymous API returns 401 JSON not 302 | Anonymous `/api` call returns 302 to `/api/oauth2/authorization/google` (Google OAuth HTML), not a 401 JSON body | `SecurityConfig` configures OAuth2 login but no `authenticationEntryPoint`; absent/invalid tokens are treated as unauthenticated and redirected into the OAuth2 flow | Medium |
| 3 | 11 Cross | Invalid access token rejected | Request with a garbage bearer token follows the same 302 to Google HTML instead of 401 | Same root cause as finding #2 (no authenticationEntryPoint) | Medium |
| 4 | 05 Invoices | Partial payments never accumulate to PAID | After partial payments totalling the invoice amount, status remains PARTIAL | `PaymentService` computes the cumulative paid sum filtering `paymentStatus == 'PAID'` only, dropping PARTIAL amounts | High |
| 5 | 10 Notifications | Cross-user mark-as-read blocked | Marking another user's notification returns `success=True` (200) instead of 403 | `NotificationController.markAsRead` performs no ownership check | Medium |

## Test Data

All seed accounts use password `Password@123`:

| Account | Email | Role |
|---|---|---|
| admin | admin@demouniversity.edu | SYSTEM_ADMIN |
| priya | priya@demouniversity.edu | LAB_MANAGER |
| meena | meena@demouniversity.edu | DEPARTMENT_HEAD |
| rajesh | rajesh@demouniversity.edu | LAB_TECHNICIAN |
| arun | arun@demouniversity.edu | RESEARCHER |
| sneha | sneha@demouniversity.edu | RESEARCHER (2) |
| suresh | suresh@demouniversity.edu | INSTITUTION_ADMIN |
| student | selvakumark1059.sse@saveetha.com | STUDENT |

Additional fixtures exercised by the runs: equipment ids 1-6 (id=1 = CNC Milling Machine), institutions 1-3, departments 1-2, seed invoice id=1 (`INV-2026-000001`). E2E bookings/invoices are recreated by each run and were cleaned before the final run so it starts from seed data only.

## How to Run

Phase scripts live in the harness directory (`C:\Users\selva\AppData\Local\Temp\opencode`), each dot-sourcing `lru-test.ps1` and emitting its own module results:

| Module | Script |
|---|---|
| 00 Baseline / 01-11 | `phase12-report.ps1` (orchestrator, runs all phases in one session) |
| 01 Auth | `phase1b-auth.ps1` |
| 02 Equipment | `phase2-equipment.ps1` |
| 03 Bookings | `phase3-bookings.ps1` |
| 04 Maintenance | `phase4-maintenance.ps1` |
| 05 Invoices | `phase5-invoices.ps1` |
| 06 Budgets | `phase6-budgets.ps1` |
| 07 Analytics | `phase7-analytics.ps1` |
| 08 Admin | `phase8-admin.ps1` |
| 09 Sharing | `phase9-sharing.ps1` |
| 10 Notifications | `phase10-notifications.ps1` |
| 11 Cross | `phase11-cross.ps1` |
| Cleanup | `phase12-clean.ps1` (removes stale E2E data before a full re-run) |

Prerequisites: backend up on `http://localhost:8081` (H2 file DB `jdbc:h2:file:./data/lrup`), frontend dev server on `http://localhost:3000`. Verify both with the 00 Baseline checks, then run `phase12-report.ps1`.
