# LRUP Live Deployment Plan (Netlify + Render + Neon)

**Status:** Draft — to be executed after the project is evaluated and accepted by the mentor.
**Target repo:** Will be pushed to a separate GitHub project (different from the current one).

## Architecture

Netlify hosts the static React frontend. The Spring Boot backend **cannot run on Netlify** (no Java runtime) — it runs on Render via Docker. Data lives in a managed Neon PostgreSQL.

```
Frontend (React) ──HTTPS/CORS──> Backend (Spring Boot) ──> PostgreSQL
Netlify (static)                Render (Docker, free)     Neon (free)
```

## A. Code changes (commit + push to the new repo)

### Backend (`lab-resource-backend`)

1. **`Dockerfile`** — fix the broken build (repo has no `mvnw`):
   - Build stage: `FROM maven:3.9-eclipse-temurin-17 AS build`, run `mvn package -DskipTests`
   - Runtime stage: `eclipse-temurin:17-jre`, `EXPOSE 8081`

2. **`application.yml`**
   - `server.port: ${PORT:8081}` (Render injects `PORT`)
   - Datasource → env placeholders:
     - `url: ${DB_URL:jdbc:postgresql://localhost:5432/lrup}`
     - `username: ${DB_USERNAME:postgres}`
     - `password: ${DB_PASSWORD:postgres}`
   - `prod` block additions:
     - `server.forward-headers-strategy: framework` (correct `https` OAuth redirect behind Render's proxy)
     - `app.cors.allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:http://localhost:3000}`

3. **`SecurityConfig.java`** — read CORS origins from `app.cors.allowed-origins` property (comma-separated) instead of hardcoded `http://localhost:3000`

4. **`WebMvcConfig.java`** — `/uploads/**` CORS origin from the same property

5. **`WebSocketConfig.java`** — SockJS allowed origins from the same property

### Frontend (`lab-resource-frontend`)

6. New **`src/config.js`**:
   ```js
   export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
   ```

7. **`src/api/axiosConfig.js`** — use `API_BASE_URL` instead of hardcoded `'/api'`

8. **`src/pages/auth/LoginPage.jsx`** — Google button navigates to `${API_BASE_URL}/oauth2/authorization/google` instead of `'/api/oauth2/authorization/google'`

9. **`src/hooks/useNotificationWebSocket.js`** — SSE URL `${API_BASE_URL}/ws?token=${token}` instead of `http://localhost:8081/ws?token=...`

10. New **`netlify.toml`** — SPA fallback:
    ```toml
    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```

> Local dev is unaffected: `VITE_API_BASE_URL` unset → falls back to `/api` (Vite dev proxy to `localhost:8081`).

## B. Deployment steps

### 1. Neon (database)
- Sign up at [neon.tech](https://neon.tech) → create a project → copy the connection string
- JDBC format: `jdbc:postgresql://<host>:5432/<db>?sslmode=require`

### 2. Render (backend)
- Push code to the new GitHub repo
- dashboard.render.com → New → Web Service → select the repo
- Root directory: `lab-resource-backend`; runtime: **Docker**
- Environment variables:
  - `SPRING_PROFILES_ACTIVE=prod`
  - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (from Neon)
  - `JWT_SECRET` (long random string)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `APP_OAUTH2_FRONTEND_URL=https://<app>.netlify.app`
  - `APP_CORS_ALLOWED_ORIGINS=https://<app>.netlify.app`
- Deploy → backend URL e.g. `https://lrup-backend.onrender.com` (API root = `<url>/api`)

### 3. Google Cloud Console
- OAuth client **LRUP** (web):
  - Add Authorized redirect URI: `https://<backend>.onrender.com/api/login/oauth2/code/google`
  - Add Authorized JS origins: `https://<backend>.onrender.com` and `https://<app>.netlify.app`
- **Rotate the client secret** (it was shared in an earlier session) → put the new secret on Render

### 4. Netlify (frontend)
- app.netlify.com → Add new site → Import from GitHub → select the repo
- Build settings:
  - Base directory: `lab-resource-frontend`
  - Build command: `npm run build`
  - Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://<backend>.onrender.com/api`
- Deploy → frontend URL e.g. `https://lrup-app.netlify.app`

### 5. Verification
- Visit the Netlify URL
- Test email/password login (seeded demo users) and Google OAuth end-to-end
- Test a booking, dashboard, and notifications flow

## C. Known limitations (free tier / demo)

- Render free tier **sleeps** after ~15 min idle → first request is slow (30–60s wake-up)
- File uploads stored on ephemeral disk → lost on redeploy (use object storage for production)
- Email/SMS need real credentials (`MAIL_USERNAME`, `MAIL_PASSWORD`; SMS currently a stub)
- Live notifications: frontend uses `EventSource` (SSE) but the backend endpoint is SockJS/STOMP — pre-existing mismatch; may need fixing. The app has a polling fallback.
- `DataSeeder` is idempotent (`count() > 0` / `existsBy` guards) — safe to run on a persistent DB; no change needed
- Rate limiting: 60 req/min per IP (adjust `rate-limit` config if demos hit it)
- `application-dev.yml` (Google credentials for local dev) is gitignored — do NOT push it; use env vars on Render for prod
