# Milestone 4 — Testing, Deployment & Documentation

## Context

Modules 1–3 (all 10 feature modules from the PDF) are complete: auth/RBAC, equipment inventory, booking/scheduling, utilization monitoring, inter-institution sharing, maintenance/calibration, notifications, analytics dashboards, cost & billing, reports/export.

**Milestone 4 (Week 7 & 8) per the PDF:**
1. Application testing and workflow validation
2. Platform performance and UI responsiveness improvements
3. Deploy platform using Docker (+ cloud-ready CI configs)
4. Final project documentation and presentation

**Current state:**
- Backend: Spring Boot 3.5 (Java 17), 141 Java files, 16 controllers, H2 test profile already configured, 3 service test classes exist (Billing, Booking, Maintenance) + a context smoke test.
- Frontend: React 19 + Vite 8 + Tailwind 4, 14 pages, no test setup yet (no Vitest/RTL).
- No Docker files, no CI, no git repo initialized.

## Implementation — feature by feature (in order)

### Phase 1: Backend testing (JUnit + Mockito)

Add unit tests following the existing `BillingServiceTest` pattern (`@ExtendWith(MockitoExtension.class)`, mocked repositories):

1. `EquipmentServiceImplTest` — CRUD, status transitions, validation failures
2. `UtilizationServiceImplTest` — utilization rate calc, idle detection, heatmap aggregation
3. `SharingServiceImplTest` — request workflow (create → approve/reject), cross-institution rules
4. `WaitlistServiceImplTest` — join waitlist, promotion on cancellation
5. `AuthServiceImplTest` — register/login, wrong password, duplicate username
6. Controller slice tests (`@WebMvcTest`) for 2–3 key controllers (Auth, Equipment, Booking) with mocked services + security

Run: `./mvnw test` — all green before moving on.

### Phase 2: Frontend testing (Vitest + React Testing Library)

1. Add dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
2. Configure `vite.config.js` test block + `src/test/setup.js`
3. Tests for:
   - `authService` / `api.js` (token attach, interceptor logic) — mocked axios
   - `LoginPage` — renders, validation, submit calls service
   - `ProtectedRoute` — redirects unauthenticated users
   - `EquipmentPage` or a smaller component (e.g. `ConfirmDialog`, `Toast`) — render + interaction
4. Add `"test": "vitest run"` script; run until green.

### Phase 3: Performance & UI responsiveness

1. **Route-level code splitting** — convert `AppRoutes.jsx` page imports to `React.lazy()` + `Suspense` (currently all 14 pages are eagerly bundled)
2. **Backend**: add missing `@Transactional(readOnly = true)` on read paths and pagination where lists are unbounded (only where clearly missing — light touch)
3. **Vite build check** — `npm run build`, inspect chunk sizes

### Phase 4: Dockerization

1. `backend/Dockerfile` — multi-stage: maven build → JRE 17 slim runtime
2. `frontend/Dockerfile` — multi-stage: node build → Nginx serving `dist/` with SPA fallback + `/api` proxy
3. `frontend/nginx.conf`
4. `docker-compose.yml` (project root) — services: `postgres` (with `database/*.sql` mounted as init scripts), `backend`, `frontend`; healthchecks, env vars via `.env`
5. Root `.env.example` for compose
6. Verify: `docker compose up` boots the full stack (if Docker is available locally; otherwise configs validated via `docker compose config`)

### Phase 5: CI/CD (GitHub Actions)

1. `.github/workflows/ci.yml` — two jobs:
   - backend: JDK 17, `./mvnw test`
   - frontend: Node 20, `npm ci`, `npm run lint`, `npm test`, `npm run build`
2. `.github/workflows/docker.yml` — build both Docker images on push to main (push to registry left commented/optional — no cloud creds)

### Phase 6: Documentation & presentation

1. Update `README.md` — add Docker quick start, testing section, architecture summary
2. `DOCUMENTATION.md` — final project documentation: architecture, module-by-module feature list mapped to the PDF requirements, API endpoint reference (per controller), DB schema overview, screenshots placeholders
3. `PRESENTATION.md` — demo script/walkthrough for the final demonstration (login as each role → showcase each module)

## Verification

- `./mvnw test` passes (backend)
- `npm test` + `npm run build` pass (frontend)
- `docker compose config` validates; `docker compose up` if Docker present
- Each phase completed and confirmed before starting the next (per your "one by one" instruction)
