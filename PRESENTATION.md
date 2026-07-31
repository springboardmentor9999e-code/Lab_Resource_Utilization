# Lab Resource Utilization Platform — Final Presentation

Two things in one file:

* **[Part A — Slide deck outline](#part-a--slide-deck-outline)** (14 slides, ~10 min)
* **[Part B — Live demo script](#part-b--live-demo-script)** (~15 min, doubles as the UAT checklist)

Supporting material: [DOCUMENTATION.md](DOCUMENTATION.md) ·
[DEPLOYMENT.md](DEPLOYMENT.md) · [database/eer-diagram-4k.png](database/eer-diagram-4k.png)

---

# Part A — Slide deck outline

One slide per block. The **Say** line is the spoken point; everything else is what goes on
the slide.

### Slide 1 — Title

**Lab Resource Utilization Platform**
A role-based system for cataloguing, scheduling, monitoring and costing shared laboratory
equipment.
*Name · Course · Guide · Date*

### Slide 2 — The problem

* Expensive lab instruments sit idle much of the working week — and nobody can prove by how
  much, because usage is not measured.
* Booking happens over email, WhatsApp and paper registers → double-bookings and no audit trail.
* Departments cannot see equipment in the next building, let alone the next institution.
* Procurement decisions are made without utilization data, so idle assets get duplicated.
* Maintenance and calibration are tracked in spreadsheets, so overdue calibration is found
  after the fact.

**Say:** every one of these is an information problem, not a hardware problem.

### Slide 3 — Objectives

1. One authoritative catalogue of equipment across institution → department → lab.
2. Conflict-free booking with an approval workflow and a complete audit trail.
3. Utilization measured automatically from actual bookings, not self-reported.
4. Controlled sharing between institutions, with agreements and costs attached.
5. Maintenance and calibration scheduled preventively.
6. Cost, ROI and chargeback visible per asset and per department.
7. Least-privilege access for seven distinct user roles.

### Slide 4 — Technology stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 · Vite · Tailwind 4 | fast build, route-level code splitting |
| Backend | Spring Boot 3.5 · Java 17 | mature security and transaction model |
| Security | Spring Security · JWT · BCrypt · OAuth2 | stateless, horizontally scalable |
| Data | PostgreSQL 17 · Spring Data JPA | constraints enforce the rules the code assumes |
| Realtime | Spring WebSocket | live utilization without polling |
| Infra | Docker · Compose · Nginx · GitHub Actions · AWS/Azure | one command from clone to running stack |

### Slide 5 — Architecture

Use the diagram from [DOCUMENTATION.md §1](DOCUMENTATION.md#1-architecture).

**Say:** a modular monolith, deliberately. Booking, utilization and billing all mutate the
same rows; keeping them in one transaction is what prevents a chargeback from surviving a
booking that rolled back. Microservices would add a distributed transaction and buy nothing
at this scale.

### Slide 6 — Data model

Full-page [database/eer-diagram-4k.png](database/eer-diagram-4k.png).

**25 tables · 272 columns · 53 foreign keys · 8 subsystems**

Call out three EER constructs:
* M:N through `user_role` (composite PK) — one user, several roles.
* `sharing_request` / `sharing_agreement` / `invoice` each reference `institution` **twice**
  (from and to), with a CHECK that forbids self-sharing.
* 1:1 through UNIQUE foreign keys — `department_charge.booking_id` is what makes billing
  idempotent, in the database rather than in a service method.

### Slide 7 — Security

* 7 roles → `@PreAuthorize` on every non-public endpoint.
* Rate limiting **before** authentication: 20 req/min on `/api/auth/**`, 200 elsewhere.
  A credential-stuffing attempt never reaches the user table.
* Google ID tokens verified server-side — signature, issuer, audience, expiry.
* Password reset: OTP → short-lived reset token, single use, attempt-capped.
* Production hides stack traces, exposes only `/actuator/health`, and runs
  `ddl-auto=validate` so a missing migration fails the deploy instead of altering live data.

### Slide 8 — The 11 modules

The traceability table from
[DOCUMENTATION.md §2](DOCUMENTATION.md#2-requirement-traceability), one row per module,
with the class and the page that implements it.

**Say:** every module maps to named classes and a named screen — nothing is a stub.

### Slide 9 — What runs on its own

| Job | Cadence | Effect |
|---|---|---|
| Booking reminders | hourly | notifies users before a slot starts |
| Waitlist offer expiry | minutes | expires an unanswered offer, promotes the next in queue |
| Maintenance reminders | daily | opens work orders from due preventive schedules |
| Idle equipment alerts | daily | flags assets below their utilization target |
| Sharing agreement expiry | daily | closes agreements past their end date |

Plus the live utilization WebSocket and the notification ladder
(in-app → email → SMS → push).

### Slide 10 — A decision worth defending

**Notification and billing failures are contained, never propagated.**

Both are side-effects of an action that has already succeeded. An SMTP timeout must not
roll back a confirmed booking. So `NotificationService` is `@Async` and swallows its own
errors, and chargeback posting runs `REQUIRES_NEW` — which in turn means it takes **IDs, not
entities**, because an entity crossing that boundary arrives detached and its lazy
associations blow up.

**Say:** this is the sort of thing that is invisible until it produces a
`LazyInitializationException` in production.

### Slide 11 — Testing

* **128** backend tests (JUnit 5 + Mockito) · **26** frontend tests (Vitest + RTL).
* A context smoke test parses every repository `@Query` at startup, so a malformed JPQL
  string fails the build rather than the first request that hits it.
* Failure-containment tests take the database down mid-notification and assert the
  triggering transaction still commits — they log `ERROR` lines *on purpose*.
* CI runs both suites, the lint and a production build on every push.

### Slide 12 — Deployment

Three containers, one exposed port.

```bash
cp .env.prod.example .env && chmod 600 .env
docker compose -f docker-compose.prod.yml up -d
```

Compose refuses to start if any secret is missing. GitHub Actions builds both images,
pushes them to GHCR tagged with the commit SHA, then SSHes to the AWS EC2 / Azure VM host
and rolls the stack onto **that SHA** — so a push landing mid-deploy cannot swap in a
different build — and waits for the backend healthcheck before reporting success.

### Slide 13 — Limitations, honestly

Take three rows from
[DOCUMENTATION.md §11](DOCUMENTATION.md#11-known-limitations-and-future-work):
manual migrations after first boot, uploads on a single-host volume, and per-instance rate
limiting. State the mitigation next to each.

**Say:** the failure mode of each is loud, not silent — that was the design goal.

### Slide 14 — Close

> Idle, invisible equipment becomes a measured, shareable, scheduled resource.
> All 11 modules implemented, 154 tests green, one command from clone to running stack.

**Q&A.**

---

# Part B — Live demo script

~15 minutes. Also serves as the **user acceptance testing checklist** — tick each numbered
step.

## 0. Before you start

**Docker (recommended):**
```bash
cp .env.docker.example .env
docker compose up --build          # http://localhost:3000
```

**Local dev:**
```bash
cd backend  && ./mvnw spring-boot:run     # :8080
cd frontend && npm install && npm run dev # :5173
```

**Login.** The database ships with **no demo data** — only the 7 roles and a single
bootstrap admin created on first start:

| Account | Username | Password |
|---|---|---|
| System Admin | `admin` | `admin123` (dev default; required env var in prod) |

Everything else you will create live. Before the demo, create one extra account —
register a `RESEARCHER`, approve it as admin — and keep it in a second browser profile so
you can show two roles side by side.

Have ready: an image file and a PDF to upload.

## 1. The pitch — 30 s

> "Research institutions own expensive lab equipment that sits idle much of the week,
> because nobody knows what exists or how it is actually used. This platform is one system
> to catalogue it, book it, watch utilization in real time, share it across institutions,
> keep it maintained, and cost it — with least-privilege access for seven roles."

## 2. Authentication and roles — 2 min

1. Land on **Login**. Point out **Continue with Google**.
2. Log in as `admin`.
3. **User Management** → show the pending registration from the second profile; assign the
   `RESEARCHER` role and activate the account.
4. Log out. **Forgot password** → enter the email → show the OTP flow (with mail disabled
   the OTP is printed to the backend console).
5. Log in as the researcher in the second window — a visibly smaller sidebar.

**Say:** stateless JWT + revocable refresh tokens, BCrypt, `@PreAuthorize` on every
endpoint, and the sidebar is built from the same permission helpers as the route guard — a
user is never shown a link to a 403.

## 3. Organization and equipment — 2 min · modules 3–4

6. As admin: create an **institution → department → lab**.
7. **Equipment → Add**: name, code, category, manufacturer, purchase cost, hourly rate;
   tick **shareable**.
8. Upload an **image** and a **document** (manual or calibration certificate).
9. Open the **details page** — gallery, specification table, QR code, warranty status.
10. Search and filter by category / status / lab; change a status Available →
    Under Maintenance and back.
11. Switch to the researcher window — the Add / Edit / Delete controls are simply **not
    there**.

## 4. Booking and scheduling — 2.5 min · modules 5–6

12. As the researcher, open **Bookings** and book the equipment for a future slot.
13. Show the **calendar** (month / week / day, colour-coded by status).
14. Book an **overlapping** slot → rejected with a conflict message.
15. Join the **waitlist** for that slot instead.
16. As admin, **approve** the pending booking.
17. Open the **history / audit trail** — every transition, who and when.
18. Cancel the approved booking → the waitlist entry is **offered** the slot and notified;
    show the offer with its expiry.
19. Mention **recurring bookings** — a daily/weekly series that skips conflicting dates
    rather than failing whole.

## 5. Utilization monitoring — 2 min · module 7

20. Open **Utilization**: overall rate, booked vs used minutes, idle count.
21. The **day × hour heatmap** — peak demand at a glance.
22. The **top-10 chart** and **idle equipment** list.
23. In the other window, approve or complete a booking → this page updates **without a
    refresh**.

**Say:** the socket pushes a signal, not data — clients refetch through the normal
authorized REST endpoint, so authorization stays in exactly one place and the WebSocket
never becomes a second, unguarded read path.

## 6. Inter-institution sharing — 2 min · module 8

24. Create a second institution with one shareable instrument (or prepare it beforehand).
25. **Sharing → Discover** — only *other* institutions' shareable equipment, with per-hour
    fee.
26. Submit a **request**; the fee estimate updates live with the duration.
27. As the owning institution: **Incoming → approve** → a confirmed booking is created for
    the requester, conflict-checked.
28. Show a **sharing agreement** — its discount applies to the fee, and it may auto-approve
    requests; expiry is handled by a scheduled job.

## 7. Maintenance and calibration — 2 min · module 9

29. **Maintenance → new work order**, assign a technician.
30. Move it to **In Progress** → the equipment becomes `UNDER_MAINTENANCE` and new bookings
    against it are blocked. Demonstrate the block.
31. **Complete** it with downtime and cost → equipment released, and a maintenance charge is
    posted to the owning department.
32. Show **calibration** records with next-due dates, and a **preventive schedule** that
    generates work orders automatically.

## 8. Billing and chargeback — 1.5 min · module 10

33. **Billing → cost analysis**: usage cost, maintenance cost, net return, ROI %, book value
    on straight-line depreciation, lifecycle phase.
34. **Department charges** and budget consumption — including the maintenance charge you
    just created.
35. Generate an **invoice** from the approved sharing request; mark it PAID.

**Say:** `department_charge.booking_id` is UNIQUE. A retry or a concurrent call cannot
double-charge, because the database refuses it — not because a service method remembered to
check.

## 9. Notifications and analytics — 1.5 min · module 11

36. Click the **bell** — unread badge, mark read, click through to the source record.
37. **Profile → notification preferences** — per-channel toggles.
38. **Analytics** — organization utilization, department comparison, booking trends,
    procurement insight (which assets to buy more of, which to redeploy).
39. **Reports** → export to **PDF** and **Excel**.

## 10. Engineering quality — 1 min

40. Run `cd backend && ./mvnw test` → **128 passing**. Warn in advance that the
    failure-containment tests print `ERROR` lines deliberately.
41. Run `cd frontend && npm test` → **26 passing**.
42. Show the green GitHub Actions run, the GHCR images, and `docker-compose.prod.yml` — one
    exposed port, required secrets, healthchecks.

## 11. Close — 30 s

> "All eleven modules are implemented, tested and deployable with one command. The platform
> turns idle, invisible lab equipment into a measured, shareable, optimally-scheduled
> resource — and every rule it depends on is enforced by a constraint, not by a comment."

**Q&A.**

---

## Likely questions, with short answers

| Question | Answer |
|---|---|
| Why a monolith? | Booking, utilization and billing mutate the same rows. One transaction boundary is the feature; distributed transactions would be the cost. |
| How is utilization calculated? | Booked minutes ÷ operating capacity (08:00–20:00), per equipment and per department, from `equipment_usage` rows written when a booking completes — so usage cannot drift from the booking record. |
| What stops a double booking? | An overlap query against every non-cancelled booking, inside the same transaction that inserts, with equipment status and maintenance windows also checked. |
| What if the email server is down? | Nothing user-facing breaks. Notification sending is async and contains its own failures; the booking is already committed. |
| Can a user of one institution see another's data? | No — services scope every query by the caller's institution, taken from the token, never from a client-supplied id. The only cross-institution surface is Sharing → Discover, which returns explicitly shareable equipment. |
| How do you upgrade the schema in production? | Manually, deliberately — see [DEPLOYMENT.md §8](DEPLOYMENT.md#applying-a-new-migration). `ddl-auto=validate` means a forgotten migration fails startup instead of silently altering a live table. |
| What would you do next? | Flyway for migrations, object storage for uploads, Redis-backed rate limiting, and a materialized nightly utilization summary. |
