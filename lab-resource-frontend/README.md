# LabShare Frontend

React (Vite) frontend for the Lab Resource Utilization Platform.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if backend isn't on localhost:8080
npm run dev
```

Runs on http://localhost:5173 by default. Make sure the Spring Boot backend is
running on the URL set in `.env` (default http://localhost:8080) — this app
calls it directly via axios, no mock data.

## What's built

- **Auth**: Login and Register pages, JWT stored in localStorage, auto-attached
  to every API call, auto-redirect to /login on 401.
- **Routing**: role-agnostic protected routes (`/dashboard`, `/equipment`, etc.)
  — anyone logged in can view them, but role-gated actions (buttons, nav items)
  only appear for roles the Final Role-Operation Matrix allows. This mirrors
  the backend's @PreAuthorize rules but does NOT replace them — the backend is
  still the source of truth.
- **Dashboard**: two variants — a self-service view for STUDENT/RESEARCHER
  (their bookings, available equipment) and an operations view for staff roles
  (pending approvals, idle equipment, sharing requests awaiting review).
- **Equipment**: list with live status, category, lab, and a Documentation
  column (links to manuals/calibration certs when set). Clicking an equipment
  name opens a details view with its full specification and documentation
  link. "Add equipment" and "Edit" are now fully wired (previously a stub) -
  includes a Lab picker (required by the backend), specification text, and a
  documentation URL field. The `specification`/`documentationUrl` fields
  already existed on the backend `Equipment` entity but had no UI before this.
- **Bookings**: the equipment column now shows a small documentation icon
  linking to the manual/cert when the booked equipment has one on file, and
  the "New booking" form previews the selected equipment's specification and
  documentation link before submitting.
- **Bookings**: list with status filter pills, staff approve/reject actions on
  pending/waitlisted bookings, staff status dropdown for confirmed/in-progress
  bookings, and a "New booking" modal that creates a booking (auto-waitlists on
  conflict, per the backend's overlap detection).
- **Utilization**: heatmap (sorted bars, color-coded by utilization rate),
  date-range picker, summary stat cards (tracked count, average utilization,
  underutilized count), and an idle-equipment panel for roles that can see it
  (LAB_MANAGER, DEPARTMENT_HEAD, INSTITUTION_ADMINISTRATOR, SYSTEM_ADMINISTRATOR).
- **Sharing Requests**: list with status filter pills (PENDING/APPROVED/REJECTED/
  CANCELLED), staff approve/reject actions on pending requests, and a "New
  request" modal (equipment, owning institution, purpose, date range).
- **Maintenance**: list with status filter pills, a "New work order" modal
  (equipment, start date, optional end date/description), and a staff status
  dropdown per record. Status is free text on the backend (no enum), so the UI
  offers a fixed set of common values (Scheduled/In Progress/Completed/Cancelled)
  without restricting what the backend will actually accept.
- **Users / Labs / Institutions** (admin): full CRUD list+form pages for roles
  with manage permissions (INSTITUTION_ADMINISTRATOR / SYSTEM_ADMINISTRATOR).
  Institutions and Labs are visible (read-only) to every role per the matrix;
  only the create/edit controls are permission-gated. User edit never sends a
  `password` field unless the admin explicitly types a new one, since the
  backend overwrites the password hash whenever the field is present and non-null.

Every route in the sidebar is now built out — no placeholder screens remain.

## Backend field audit

Before building Maintenance, every existing API call was checked field-by-field
against the actual backend entities (not assumed from memory). One real bug was
found and fixed in the process: the Bookings "New booking" form wasn't sending
`bookingDate`, which is a required (`NOT NULL`) column on the backend — every
booking creation would have failed with a 500. It's now derived automatically
from the selected start time.

Everything else checked out: partial updates (PUT) are null-safe on the backend
for Bookings/SharingRequests/Maintenance, so sending just `{ status }` works as
the UI assumes; status-update payload shapes match; utilization date-range
params match the format Spring expects.

Not yet wired: `SharingRequest.requestedBy` isn't auto-populated from the
logged-in user on the backend (no current-user lookup in that controller), so
"who requested this" won't populate until that's added server-side. Not a bug
today since the field is nullable — just incomplete.

A second real bug was found and fixed while building the Users admin page:
the form initially sent a flat `institutionId` field (matching the
`RegisterRequest` DTO shape used at signup), but `UserController`'s admin
create/update path uses the raw `User` entity, which expects a nested
`institution: { institutionId }` object instead. Sending the flat field would
have silently saved with no institution set (Jackson ignores unknown JSON
fields rather than erroring), so every admin-created or admin-edited user
would have lost their institution assignment without any visible error. Fixed
and confirmed via captured network payloads before shipping.

## Design system

Tokens live in `src/index.css` under `@theme`. Signature element is the
`StatusDial` component (`src/components/StatusDial.jsx`) — a small dial-style
status pill used consistently for equipment and booking states.

## Folder structure

```
src/
  api/          axios calls per resource (auth, equipment, bookings, ...)
  auth/         AuthContext, ProtectedRoute, permissions.js (role -> action map)
  components/   shared UI primitives (Card, StatusDial, etc.)
  layouts/      AppLayout (sidebar shell for authenticated pages)
  pages/        one file per route
```
