# Lab Resource Utilization Platform

A full-stack platform for research institutions to manage lab equipment —
booking, cross-institution sharing, maintenance, calibration, cost tracking,
and usage analytics.

## Tech Stack

### Backend
- **Java** + **Spring Boot 4** (Spring Web, Spring Data JPA, Spring Security)
- **PostgreSQL** — primary database
- **JWT** (jjwt) — stateless authentication
- **OpenPDF** — server-generated PDF reports
- **Maven** — build tool

### Frontend
- **React 19**
- **React Router 7**
- **Vite** — build tool / dev server
- **Tailwind CSS 4**
- **Axios** — API client

### Architecture
- REST API (Spring Boot) + SPA (React), talking over JSON with a Bearer JWT
- Role-based access control enforced on both the backend (`@PreAuthorize` +
  service-level checks) and the frontend (route guards + conditional UI)
- A daily scheduled job (`@Scheduled`) generates in-app alerts; a
  `CommandLineRunner` self-heals data drift on every startup

---

## Milestone 1 — Project Initialization & Core Setup

- React + Spring Boot project scaffolding
- JWT authentication (register/login) and role-based access control
- 7 user roles: Student, Researcher, Lab Technician, Lab Manager,
  Department Head, Institution Administrator, System Administrator
- Equipment inventory management (CRUD, status tracking, lab/institution
  assignment)
- Core booking and scheduling workflows

## Milestone 2 — Utilization Monitoring & Inter-Institution Sharing

- Real-time equipment utilization tracking, logged automatically when a
  booking is completed
- Utilization heatmap and idle-equipment detection
- Inter-institution equipment sharing requests, with an approval workflow
- Waitlist management: conflicting bookings queue automatically and get
  promoted (with re-validated conflict checks) when a slot frees up
- Booking equipment directly across institutions (bypassing a formal
  request) is still allowed, but auto-logged into Sharing Requests for
  visibility and audit

## Milestone 3 — Maintenance, Cost Management & Analytics

- **Maintenance & work orders**: preventive/corrective work order types,
  technician assignment, and recurring maintenance (completing a work order
  auto-schedules its next occurrence)
- **Calibration tracking**: full calibration history per piece of
  equipment, renewal reminders, and a default 6-month validation cycle
- **New-equipment calibration gate**: newly registered equipment starts as
  "Pending Calibration" and cannot be booked until a technician logs its
  first calibration record — modeling a real-world accuracy check before
  equipment goes into service
- **Cost tracking & billing**: equipment can carry an hourly rate; a
  cross-institution booking that completes automatically generates an
  itemized billing record between the two institutions (owed/owing, with a
  Pending → Invoiced → Paid status, no real payment processing)
- **Analytics dashboards**: three distinct views — Researcher/Student,
  Lab Manager/Department Head, and Institution Administrator (the latter
  adds cross-department billing totals and calibration reminders)
- **Usage pattern analytics**: which day of the week equipment is used
  most, and a per-equipment usage pattern breakdown (busiest day, most
  common start time, average session length)
- **Downloadable PDF reports**: a generated report combining utilization,
  idle equipment, maintenance history, calibration reminders, and billing
  into one document
- **Notification & alert system**: a daily job flags equipment idle for a
  week or more, maintenance due/overdue, and calibrations due/expired, and
  delivers them as in-app notifications

## Milestone 4

- User management: filter by institution and role
- Equipment search


---
