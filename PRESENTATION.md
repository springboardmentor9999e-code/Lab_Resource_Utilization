# Lab Resource Utilization Platform — Demo Walkthrough

A step-by-step script for demonstrating the complete platform end-to-end.
Total runtime: ~15 minutes.

---

## 0. Setup (before the demo)

**Option A — Docker (recommended, one command):**
```bash
cp .env.docker.example .env
docker compose up --build
# Frontend: http://localhost:3000
```

**Option B — Local dev:**
```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run
# Terminal 2
cd frontend && npm install && npm run dev   # http://localhost:5173
```

**Seeded accounts:**
| Role | Username | Password |
|------|----------|----------|
| System Admin | `admin` | `admin123` |
| Student | `student` | `student123` |

Have a second browser profile / incognito window ready so you can show two roles side by side.

---

## 1. The pitch (30 seconds)

> "Research institutions own expensive lab equipment that sits idle 60–70% of the
> time because nobody knows what's available or how it's being used. This platform
> gives them a single system to catalog equipment, book it, monitor real-time
> utilization, share it across institutions, and make data-driven procurement
> decisions — with role-based access for seven different user types."

---

## 2. Authentication & roles (2 min)

1. Open `http://localhost:3000` → land on the **Login** page.
2. Show **"Continue with Google"** (OAuth), then log in as `student` / `student123`.
3. Point out the **role-aware dashboard** — a student sees only their bookings,
   availability, and recommendations.
4. Log out → demonstrate **Forgot Password**: enter an email, show the OTP flow
   (OTP prints to the backend console when mail is disabled).
5. Log back in as `admin` / `admin123` — note the richer admin navigation.

*Talking point:* stateless JWT + refresh tokens, BCrypt hashing, `@PreAuthorize`
method-level RBAC across 7 roles.

---

## 3. Equipment inventory (2 min) — Module 2

1. Go to **Equipment Inventory**.
2. **Add Equipment** — fill name, code, category, manufacturer, cost, hourly rate;
   toggle "shareable".
3. Upload an **image** and a **document** (manual / calibration certificate).
4. Open the **details page**: image gallery, specs, auto-generated QR code, warranty.
5. Search + filter by category/status. Change a status (Available → Under Maintenance).
6. Log in as `student` in the second window → show Add/Edit/Delete buttons are
   **hidden** (view-only role).

---

## 4. Booking & scheduling (2 min) — Module 3

1. As `student`, open **Bookings** → book the equipment for a future slot.
2. Show the **availability calendar** (month/week/day, color-coded).
3. Try a conflicting slot → **SLOT_TAKEN** rejection; join the **waitlist** instead.
4. As `admin`/manager → **approve** the pending booking (equipment auto → RESERVED).
5. Open the **booking history / audit trail** modal — every status change logged.
6. Mention **recurring bookings** (daily/weekly series, conflict dates skipped).

---

## 5. Utilization monitoring (2 min) — Module 4

1. Open **Utilization**.
2. Walk through the **stat cards** (overall rate, total booked/used minutes, idle count).
3. Show the **7×12 day/hour heatmap** — peak-usage patterns at a glance.
4. Show the **top-10 utilization bar chart** and the **idle-equipment alerts**.

*Talking point:* utilization = booked minutes ÷ operating capacity (08:00–20:00),
aggregated per equipment and per department.

---

## 6. Inter-institution sharing (2 min) — Module 5

1. Open **Sharing → Discover** — equipment shared by *other* institutions,
   with per-hour fee chips.
2. Submit a **sharing request** — show the live fee estimate (rate × hours).
3. Switch to the owning institution's manager → **Incoming** tab → **approve**.
4. Approval **auto-creates a confirmed booking** for the requester (with conflict check).

---

## 7. Maintenance & billing (2 min) — Modules 6 & 9

1. **Maintenance** → create a work order, assign a technician; equipment auto →
   UNDER_MAINTENANCE, downtime tracked on completion.
2. Show **calibration records** with next-due dates and renewal reminders.
3. Show **preventive schedules** that auto-generate work orders when due.
4. **Billing** → cost analysis per equipment/department; generate an **invoice**
   from an approved sharing request; mark PAID.

---

## 8. Notifications & analytics (2 min) — Modules 7, 8, 10

1. Click the **notification bell** — live unread badge, mark-read, click-through.
2. Open **Analytics** — the role-aware intelligence dashboard (org utilization,
   department bars, procurement insights, high-demand equipment).
3. Open **Reports** → export a utilization report to **PDF** and **Excel**.

---

## 9. Engineering quality (1 min)

- **Testing:** 81 backend tests (JUnit + Mockito) + 21 frontend tests (Vitest + RTL);
  run `./mvnw test` and `npm test` live if time allows.
- **Deployment:** `docker compose up --build` brings up Postgres + backend + Nginx
  frontend; migrations run automatically.
- **CI/CD:** GitHub Actions runs tests and builds Docker images on every push.
- **Performance:** route-level code splitting; single-query utilization aggregation.

---

## 10. Close (30 seconds)

> "Every one of the ten specified modules is implemented, tested, and deployable
> with a single command. The platform turns idle, invisible lab equipment into a
> measured, shareable, optimally-scheduled resource."

**Q&A.**
