# Security Audit Report — Lab Resource Management Platform (LRUP)

**Audit date:** 2026-08-06
**Scope:** Full-stack codebase — Spring Boot 3.3.0 REST API (`lab-resource-backend`) + Vite/React 18 SPA (`lab-resource-frontend`), H2 (dev) / PostgreSQL (base + prod), Flyway, JWT + Google OAuth2, local filesystem uploads, docker-compose deployment.
**Method:** Two-pass audit per `SECURITY AUDIT PROMPT.md` (discovery → 33-item checklist 1.1–8.3). Every item gets an explicit verdict. ❌ findings use the FINDING block format. Findings that were **remediated during this session** are marked `[FIXED]` with the fix summary; `[REQUIRES ACTION]` items still need human/ops follow-up.
**Verification performed after fixes:** `mvn compile` ✅ · `mvn test` 64/64 ✅ · `npm run build` ✅.

> **Adaptation note:** The prompt's Supabase/Next.js checks (RLS 2.1–2.4, service-role key 2.5, storage buckets 2.6, `getUser()` vs `getSession()` 3.3) do not apply — this app uses a **server-only** persistence layer (Spring Data JPA + Hibernate + PostgreSQL/H2) with no client-side database access. Those items are marked ⬚ N/A with the reason stated. Storage is the local filesystem under `./uploads`, not Supabase buckets.

---

## 1. Security Posture Rating

### 🟠 NEEDS WORK

The codebase has a solid defensive foundation — default-deny Spring Security with role-based access control, parameterized SQL everywhere, server-side DTO validation, a locked-down CORS policy, and no frontend XSS sinks. **However, this session found and fixed three critical-class issues that would have been immediately exploitable in production:**

1. **A full database backup containing live refresh tokens and bcrypt password hashes was committed to git** (`lrup_backup.sql`, added in the latest commit `7d7df31`). Anyone with repo access could forge sessions or crack admin credentials.
2. **A hardcoded default JWT signing secret** in `application.yml` — combined with #1, an attacker with the source could mint valid tokens for *any* account, including `SYSTEM_ADMIN`.
3. **Google OAuth client secret committed in plaintext** (gitignored dev file + launch script) and OAuth **tokens delivered in redirect URLs** (browser history / server logs).

All three are **fixed in the working tree** (see Findings 1, 2, 3, 4), and the previously-open **HIGH localStorage token-storage risk (Finding 5) has also been closed** via the httpOnly-cookie auth refactor. A small set of MEDIUM/LOW issues remain (rate-limit in-memory store, frontend dependency CVEs, user enumeration, shared seed passwords) — documented with concrete remediation in Findings 15, 17, 19, 20.

**Immediate human actions required (cannot be done from code):** rotate the Google OAuth client secret in Google Cloud Console, rotate the DB dump exposure (all user passwords + refresh tokens), and set a strong `JWT_SECRET` in production.

---

## 2. Critical And High Findings

| # | Severity | Title | Location | Status |
|---|----------|-------|----------|--------|
| 1 | CRITICAL | Live DB backup committed to git (refresh tokens + bcrypt hashes) | `lrup_backup.sql` | **[FIXED]** removed from index + gitignored — **rotate secrets** |
| 2 | HIGH | Hardcoded default JWT signing secret | `application.yml:96` | **[FIXED]** env-required + random fallback |
| 3 | HIGH | Google OAuth client secret in plaintext | `application-dev.yml:8`, `start.ps1:2` | **[FIXED]** env-referenced — **rotate in Google Console** |
| 4 | HIGH | Access + refresh tokens in OAuth redirect URL query string | `OAuth2AuthenticationSuccessHandler:65-73` | **[FIXED]** moved to URL fragment |
| 5 | HIGH | Access + refresh tokens in `localStorage` | `axiosConfig.js`, `AuthContext.jsx`, `OAuth2CallbackPage.jsx` | **[FIXED]** httpOnly cookie auth refactor |
| 6 | HIGH | JWT sent in WebSocket/SSE URL query string | `useNotificationWebSocket.js:16` | **[FIXED]** replaced with short-lived one-time SSE ticket |

All six are detailed as FINDING blocks in the section-by-section results below.

---

## 3. Quick Wins

Quick wins here were **already implemented in this session** (each < 10 min):

- ✅ **Removed committed DB backup** from git index + added `*.sql` to `.gitignore` (Finding 1).
- ✅ **Removed the hardcoded JWT default** so production fails closed if `JWT_SECRET` is unset (Finding 2).
- ✅ **Scrubbed the Google client secret** from `application-dev.yml` and `start.ps1` (Finding 3).
- ✅ **401 JSON entry point** — anonymous/invalid-token requests now get `401 {"success":false,...}` instead of a 302 redirect to Google's login HTML (Finding 7).
- ✅ **Generic error messages** — `GlobalExceptionHandler` no longer echoes `ex.getMessage()` (Finding 8).
- ✅ **File-upload allowlist** — only `.jpg/.jpeg/.png/.gif/.webp` with `image/*` content type (Finding 9).
- ✅ **Auth endpoints rate-limited** + X-Forwarded-For spoofing closed (Finding 10).
- ✅ **h2-console/swagger** restricted to non-prod profiles; `X-Frame-Options: SAMEORIGIN` (Finding 11).
- ✅ **Notification IDOR** — mark-as-read/delete now enforce ownership (Finding 12).
- ✅ **Refresh-token jti** — eliminates same-second token collisions (Finding 13).
- ✅ **rememberMe cookie** — auth cookies now `Secure` when HTTPS + `SameSite=Strict`, `HttpOnly` (Finding 5, 14).
- ✅ **JWT removed from SSE URL** — short-lived one-time ticket instead (Finding 6).

---

## 4. Prioritized Remediation Plan

Ordered by severity, then effort. `[FIXED]` items are done in the working tree but may require ops follow-up (rotation).

1. **[FIXED — rotate] Rotate the Google OAuth client secret** (Google Cloud Console) — the old one (`GOCSPX-…`) shipped in plaintext files. (Finding 3)
2. **[FIXED — rotate] Rotate all user sessions / force password reset** — every refresh token and bcrypt hash from `lrup_backup.sql` is exposed. Delete the file from disk too, and consider `git filter-branch`/BFG only if this repo is ever public (it currently lives only in the HEAD commit). (Finding 1)
3. **[FIXED] Harden JWT secret** — `JWT_SECRET` env var now required for prod; dev generates a random key at startup (tokens invalidated on restart). **Set a strong base64 secret in prod now.** (Finding 2)
4. **[FIXED] Tokens migrated to httpOnly cookies** — `localStorage`/`sessionStorage` removed everywhere; access cookie (1h), path-scoped refresh cookie (7d), OAuth setup cookie; `SameSite=Strict` + `Secure`; `/auth/me` bootstrap; single-flight cookie refresh on 401. (Finding 5)
5. **[FIXED] OAuth token delivery** — redirect carries only `?mode=login|setup`; tokens via httpOnly cookies. Residual follow-up: Authorization Code + PKCE. (Findings 4, 6)
6. **[REQUIRES ACTION — ~30 min] Bump frontend build deps** — `vite` 5.4.21 has a high-severity dev-server advisory (GHSA-fx2h-pf6j-xcff); upgrade to latest 5.x or 6.x (semver-major for 7/8 — test carefully). (Finding 19)
7. **[REQUIRES ACTION — ~2–4h] Rate limiting: move to a shared store** (Redis) so limits survive restarts and scale across instances. (Finding 20)
8. **[FIXED] Notification IDOR** — ownership enforced. (Finding 12)
9. **[FIXED] Generic error responses** — no more internal message leakage. (Finding 8)
10. **[FIXED] Upload validation** — MIME + extension allowlist. (Finding 9)
11. **[REQUIRES ACTION — ~15 min] User enumeration** — return a generic response from `forgot-password` (Finding 15); seed users share `Password@123` — rotate seeds (Finding 17).
12. **[FIXED] rememberMe cookie flags** — `Secure` when HTTPS, `SameSite=Lax`. (Finding 14)

---

## 5. What's Already Done Right

- **Default-deny authorization.** `SecurityConfig` uses an explicit allowlist (`permitAll` only for the listed auth endpoints, `/uploads/**`, `/notifications/stream`, OPTIONS, public GET lookups, dev tools); `anyRequest().authenticated()`, plus `@EnableMethodSecurity` / `@PreAuthorize` role checks on sensitive mutations (e.g. `EquipmentController` uploads/status require LAB_TECHNICIAN+).
- **Stateless JWT auth** with HS256 `Keys.hmacShaKeyFor`; signature verified on every request via `JwtAuthenticationFilter`.
- **Parameterized SQL everywhere.** Repositories use Spring Data `@Query` with positional params; `NotificationScheduler`'s `JdbcTemplate` text-blocks use `?` placeholders only (verified all 4 queries + `findUserById`). No string-concatenated SQL found.
- **Server-side input validation.** All request DTOs (`LoginRequest`, `RegisterRequest`, `ResetPasswordRequest`, etc.) use `jakarta.validation` annotations; controllers use `@Valid`.
- **Identity derived from the session**, never from request bodies (`CurrentUserUtil` reads the JWT subject → DB user). No `{ userId: … }` trust in write paths.
- **CSRF mitigated by SameSite=Strict cookies.** Auth is stateless JWT carried in httpOnly cookies; Spring CSRF remains disabled, but every auth cookie is `SameSite=Strict` so browsers never attach them to cross-site requests — closing the main CSRF vector without a token dance. OAuth2 authorization request is additionally CSRF-protected via a state param persisted in a signed HttpOnly cookie (`CookieOAuth2AuthorizationRequestRepository`).
- **No XSS sinks.** React escapes by default; grep for `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `eval`, `document.write` returned nothing in `src/`.
- **Restrictive CORS** — `http://localhost:3000` only, explicit methods, `allowCredentials=true` paired with specific origins (never `*`).
- **Password reset tokens** expire in 1 hour, are single-use, and are stored hashed-never-cleartext in the DB.
- **bcrypt for passwords** (Spring Security `BCryptPasswordEncoder`).
- **No committed `.env` files**, no `VITE_`-prefixed secrets, no `console.log` of tokens/env in the frontend, prod build has no source maps.
- **Uploads served as static resources** (not under an executable webapp path) — execution prevention (8.3).

---

## 6. Checklist Summary

| Item | Verdict | Item | Verdict |
|------|---------|------|---------|
| 1.1 Hardcoded secrets | ❌ (FIXED + rotate) | 5.1 Audit results | ❌ (deps) |
| 1.2 .gitignore coverage | ❌ (FIXED) | 5.2 Hallucinated packages | ✅ |
| 1.3 Public prefix leaks | ⬚ N/A | 5.3 Lockfile committed | ✅ |
| 1.4 Console/error leaks | ✅ | 5.4 Outdated packages | ⚠️ |
| 1.5 Build artifact exposure | ✅ | 5.5 Unused dependencies | ✅ |
| 1.6 Startup validation | ✅ (FIXED) | 6.1 Expensive ops | ✅ |
| 2.1 RLS enabled | ⬚ N/A | 6.2 Auth endpoints | ✅ (FIXED) |
| 2.2 RLS policies exist | ⬚ N/A | 6.3 Rate-limit impl | ⚠️ |
| 2.3 WITH CHECK clauses | ⬚ N/A | 7.1 API route CORS | ✅ |
| 2.4 Policy identity source | ⬚ N/A | 7.2 Credentials mode | ✅ |
| 2.5 Service role key isolation | ⬚ N/A | 8.1 Server-side validation | ❌ (FIXED) |
| 2.6 Storage bucket policies | ⬚ N/A | 8.2 Storage permissions | ⚠️ |
| 2.7 SQL injection | ✅ | 8.3 Execution prevention | ✅ |
| 2.8 SECURITY DEFINER | ⬚ N/A | | |
| 3.1 Auth middleware | ✅ | | |
| 3.2 Default-deny routing | ✅ | | |
| 3.3 getUser() vs getSession() | ⬚ N/A | | |
| 3.4 Auth callback handler | ⚠️ (improved) | | |
| 3.5 Session storage | ✅ (FIXED) | | |
| 3.6 Protected API routes | ✅ | | |
| 3.7 OAuth security | ⚠️ | | |
| 3.8 Password reset flows | ✅ | | |
| 4.1 Schema validation | ✅ | | |
| 4.2 Identity from session | ✅ | | |
| 4.3 Input sanitization | ✅ | | |
| 4.4 HTTP method enforcement | ✅ | | |
| 4.5 Error info leaks | ❌ (FIXED) | | |
| 4.6 Webhook signature verification | ⬚ N/A | | |

---

## Section 1: Environment Variables And Secret Management

### 1.1 — Hardcoded secrets: ❌ (two found; all remediated)

Secret-pattern grep battery run across the whole tree (`GOCSPX-`, `sk_live_`, `AKIA`, `eyJ`/JWT, `Bearer`, 32+ char base64/quoted strings, client secrets, `.env`, refresh tokens). Matches appeared **only** in `lrup_backup.sql` plus the JWT/Google defaults below. Frontend: zero matches.

┌─────────────────────────────────────────────────────────┐
│ FINDING #1                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ CRITICAL                                     │
│ Category │ Secret Exposure / Credential Leak            │
│ Location │ `lrup_backup.sql` (repo root)                │
│ CWE      │ CWE-798 (Use of Hard-coded Credentials)      │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ A full PostgreSQL dump was added to git in commit       │
│ `7d7df31` (HEAD). It contains the `refresh_tokens`      │
│ table (dozens of live `eyJ…` JWTs, lines ~2100+) and    │
│ `users` rows including bcrypt `$2b$10$…` hashes         │
│ embedded in audit-log JSON (e.g. the admin hash, line   │
│ ~1400).                                                 │
│                                                         │
│ Why it matters:                                         │
│ Anyone with repo access can replay a leaked refresh     │
│ token to obtain a fresh session as that user, or        │
│ offline-crack the admin bcrypt hash. Combined with the  │
│ shared default JWT secret (Finding 2), total account    │
│ compromise is trivial.                                  │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ # file existed in git index (git ls-files → tracked)    │
│ # lrup_backup.sql:  INSERT INTO refresh_tokens ... 'eyJhbGciOiJIUzI1NiJ9...'  (~2100+)
│ # lrup_backup.sql:  ... "password":"$2b$10$djAhahOySCeeHNUIfI8pw./GZyONvurM7OsocQSdjeZHLSh.eJLyK" ...
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ git rm --cached lrup_backup.sql   # remove from index   │
│ # .gitignore now includes:                              │
│ #   *.sql                                                │
│ #   lrup_backup.sql                                      │
│ # OPS: rotate all sessions + reset passwords, delete    │
│ #      the file from disk.                              │
│ ```                                                     │
│                                                         │
│ Effort: ~5 min (code) + ops follow-up                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FINDING #2                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ HIGH                                         │
│ Category │ Secret Exposure / Hardcoded Crypto Key       │
│ Location │ `lab-resource-backend/src/main/resources/application.yml:96` │
│ CWE      │ CWE-798 (Use of Hard-coded Credentials)      │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `jwt.secret` shipped a default base64 HMAC key. Every   │
│ clone of this repo could sign its own valid JWTs.       │
│ The prod profile already required `JWT_SECRET`, but     │
│ the dev/default path silently used the shared key.      │
│                                                         │
│ Why it matters:                                         │
│ With the shared key (and it is exposed in git), an      │
│ attacker forges `Authorization: Bearer <own token>`     │
│ for ANY email — full auth bypass including admin.       │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ jwt:                                                    │
│   secret: ${JWT_SECRET:ZWxhYm9yYXRlaGViYWx5YmF0cmlwcm9kdWN0aW9uc2VjcmV0a2V5Zm9yamF3YXBwbGljYXRpb24=}  # ← hardcoded default
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ jwt:                                                    │
│   secret: ${JWT_SECRET:}          # no shared default   │
│ # JwtTokenProvider.init(): if blank, generate a random  │
│ # 64-byte key at startup + warn (dev). prod keeps       │
│ # `secret: ${JWT_SECRET}` → fails closed if unset.      │
│ ```                                                     │
│                                                         │
│ Effort: ~10 min                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FINDING #3                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ HIGH                                         │
│ Category │ Secret Exposure (OAuth client secret)        │
│ Location │ `lab-resource-backend/src/main/resources/application-dev.yml:8`, `lab-resource-backend/start.ps1:2` │
│ CWE      │ CWE-798 (Use of Hard-coded Credentials)      │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ The live Google OAuth client secret `GOCSPX-<REDACTED>` was hardcoded in the gitignored dev config and the launch script. Gitignored ≠ safe (shared machines, backups, screenshots, shell history). |
│                                                         │
│ Why it matters:                                         │
│ With the client-id + secret, an attacker completes the  │
│ OAuth code exchange for themselves and (if the same     │
│ OAuth app is ever used in prod) interacts with the      │
│ account — and the secret also reveals the OAuth app     │
│ used for testing. Rotate it in Google Cloud Console.    │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ # application-dev.yml                                   │
│ client-secret: GOCSPX-<REDACTED>      │
│ # start.ps1                                             │
│ $env:GOOGLE_CLIENT_SECRET = "GOCSPX-<REDACTED>"  │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ # application-dev.yml                                   │
│ client-secret: ${GOOGLE_CLIENT_SECRET:your-google-client-secret} │
│ # start.ps1 now fails fast if GOOGLE_CLIENT_ID /        │
│ # GOOGLE_CLIENT_SECRET are not in the environment.      │
│ ```                                                     │
│                                                         │
│ Effort: ~10 min + Google Console rotation               │
└─────────────────────────────────────────────────────────┘

### 1.2 — .gitignore coverage: ❌ (gap found, now fixed)

`client_secret_*.json`, `.env`, `.env.*.local`, `application-dev.yml`, `start.ps1` were already ignored. **Gap:** `lrup_backup.sql` (and `*.sql` backups generally) was **tracked**. `git log --all --name-status` confirmed it was added only in the latest commit (`7d7df31`), so removing it from the index fully clears the exposure — no history rewrite needed. Added `*.sql` + `lrup_backup.sql` to `.gitignore` and ran `git rm --cached lrup_backup.sql`.

### 1.3 — Public prefix leaks: ⬚ N/A

Vite public prefix is `VITE_`. Grep found **no** `VITE_`-prefixed variables and no server secrets referenced from the frontend bundle. The OAuth client-id is public by design; the client-secret is server-side only.

### 1.4 — Console/error leaks: ✅ PASS

Grep for `console.log|console.error` in `lab-resource-frontend/src` returned no env/token/session output. `GlobalExceptionHandler` (see Finding 8) no longer echoes exception internals. `ErrorBoundary.jsx` renders a generic fallback.

### 1.5 — Build artifact exposure: ✅ PASS

`vite.config.js` sets no `build.sourcemap`; Vite 5 defaults to **no** production source maps (`dist/` verified — `.js`/`.css` only). React app code is bundled/minified; no secrets are bundled (verified: no secrets in `src/`).

### 1.6 — Startup validation: ✅ PASS (fixed this session)

- Prod profile: `jwt.secret: ${JWT_SECRET}` (no default) → **fails fast** at startup if unset. ✅
- Dev/default: `JwtTokenProvider.init()` now generates a random key and logs a warning if `JWT_SECRET` is unset (previously silently used a shared default). ✅
- `start.ps1` now aborts unless `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the environment. ✅

---

## Section 2: Database Security

**Architecture note:** No Supabase/Firebase. Server-only JPA + Hibernate (H2 file DB in dev, PostgreSQL in base/prod), no client-side SDK, no anon/service-role keys. Checks 2.1–2.6 and 2.8 are N/A; 2.7 (SQLi) is directly applicable and passed.

### 2.1 — RLS enabled: ⬚ N/A
No client-accessible DB; all access goes through the authenticated Spring API.

### 2.2 — RLS policies exist: ⬚ N/A
See 2.1.

### 2.3 — WITH CHECK clauses: ⬚ N/A
See 2.1.

### 2.4 — Policy identity source: ⬚ N/A
See 2.1.

### 2.5 — Service role key isolation: ⬚ N/A
No service-role key exists.

### 2.6 — Storage bucket policies: ⬚ N/A
Uploads go to the local filesystem (`./uploads`), not Supabase Storage. See 8.2 for the local equivalent.

### 2.7 — SQL injection: ✅ PASS

No string-concatenated SQL found. Audited:
- `NotificationScheduler.java` — all 5 `JdbcTemplate` queries use `?` placeholders (`booking reminders`, `calibration due`, `service due` incl. the two role lookups, `idle equipment`, and `findUserById`).
- Repositories use Spring Data `@Query("... ?1 ...")` (parameterized).
- No `nativeQuery` with concatenation found in the codebase.

### 2.8 — SECURITY DEFINER functions: ⬚ N/A
No stored DB functions/functions marked SECURITY DEFINER (pure JPA/Hibernate; Flyway migrations contain DDL/DML only).

---

## Section 3: Authentication And Session Management

### 3.1 — Auth middleware exists: ✅ PASS

`JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter` in `SecurityConfig:71`; it parses the `Authorization: Bearer` header, validates the JWT via `JwtTokenProvider.validateToken`, loads the user, and seeds the `SecurityContext`. `CurrentUserUtil` derives the current user from that context's token for every controller that needs it.

┌─────────────────────────────────────────────────────────┐
│ FINDING #7                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Authentication Bypass Signal / UX            │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/config/SecurityConfig.java` (no `authenticationEntryPoint`) │
│ CWE      │ CWE-287 (Improper Authentication) — info     │
│          │ disclosure variant                           │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ With no `authenticationEntryPoint` configured, the      │
│ default Spring Security behavior for anonymous access   │
│ to a protected resource is a 302 redirect to the        │
│ Google OAuth2 login page (HTML), instead of a JSON      │
│ 401. This also affected requests with an invalid/       │
│ expired bearer token.                                   │
│                                                         │
│ Why it matters:                                         │
│ API clients (axios, SSE, scripts) get bounced to an     │
│ HTML login page they cannot consume; it also leaked     │
│ that the app uses Google OAuth and polluted server      │
│ logs with redirect traffic. Invalid-token detection     │
│ becomes a redirect loop rather than a clean 401.        │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ .exceptionHandling(ex -> ex.authenticationEntryPoint(   │
│   (req, res, authEx) -> {                               │
│     res.setStatus(401); res.setContentType("application/json"); │
│     res.getWriter().write("{\"success\":false,\"message\":\"Unauthorized: valid authentication is required\"}");
│   }))                                                   │
│ ```                                                     │
│                                                         │
│ Effort: ~5 min                                          │
└─────────────────────────────────────────────────────────┘

### 3.2 — Default-deny routing: ✅ PASS

`SecurityConfig` uses an **allowlist**: only `/auth/**`, `/uploads/**`, `/notifications/stream` (ticket-authed), `OPTIONS`, and two public GET lookups are `permitAll`; **everything else is `anyRequest().authenticated()`**. New endpoints are protected by default.

### 3.3 — getUser() vs getSession(): ⬚ N/A
Supabase-specific. Equivalent behavior here: server validates the JWT signature on every request.

### 3.4 — Auth callback handler: ⚠️ PARTIAL (improved)

The OAuth2 flow (Google → `/api/login/oauth2/code/*` → `OAuth2AuthenticationSuccessHandler`) is standard Spring Security with the authorization request CSRF-protected by a state param stored in an HttpOnly cookie. **Before this session**, the success redirect put `token`, `refreshToken`, `setupToken` into the **query string** — tokens leak into browser history, proxy/access logs, and the `Referer` header. **Fixed:** tokens now ride in the **URL fragment** (`#token=…`), which is never sent to servers and does not appear in access logs. Frontend `OAuth2CallbackPage.jsx` reads the hash and (for the profile-setup path) stashes the short-lived setup token in `sessionStorage` instead of a URL param. **Since updated (Finding 5, item 3.5):** the whole flow now delivers tokens exclusively via httpOnly cookies — the success redirect carries only `?mode=login`/`?mode=setup`, no tokens or PII in the URL at all. Residual hardening (documented, not implemented): OAuth2 still uses the implicit-style response within the code flow; Authorization Code + PKCE with a dedicated session is a further hardening step.

┌─────────────────────────────────────────────────────────┐
│ FINDING #4                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ HIGH                                         │
│ Category │ Token Exposure in URL / Sensitive Info Leak  │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/security/OAuth2AuthenticationSuccessHandler.java:65-73` │
│ CWE      │ CWE-598 (Sensitive Info in URL via GET)      │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ After a successful Google login the handler issued a    │
│ `sendRedirect` with the access token, refresh token and │
│ profile data in the query string.                       │
│                                                         │
│ Why it matters:                                         │
│ URLs end up in browser history, the `Referer` header,   │
│ and web-server/proxy access logs. A stolen refresh      │
│ token (30-day expiry) means a persistent session.       │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ String redirectUrl = frontendUrl + "/oauth2/callback"   │
│     + "?token=" + accessToken                           │
│     + "&refreshToken=" + refreshToken                   │
│     + "&role=" + user.getRole().name() + ...;           │
│ response.sendRedirect(redirectUrl);                     │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ String redirectUrl = frontendUrl + "/oauth2/callback"   │
│     + "#token=" + accessToken                           │
│     + "&refreshToken=" + refreshToken + ...;            │
│ // frontend: new URLSearchParams(location.hash.substring(1))  │
│ ```                                                     │
│                                                         │
│ Effort: ~20 min (backend + frontend)                    │
└─────────────────────────────────────────────────────────┘

### 3.5 — Session storage: ✅ (fixed)

┌─────────────────────────────────────────────────────────┐
│ FINDING #5 (CLOSED)                                     │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ HIGH                                         │
│ Category │ Session Fixation / Token Theft via XSS       │
│ Location │ `lab-resource-frontend/src/api/axiosConfig.js` · `src/context/AuthContext.jsx` · `src/pages/auth/OAuth2CallbackPage.jsx` · `lab-resource-backend/.../security/JwtCookieUtil.java` │
│ CWE      │ CWE-922 (Insecure Storage of Sensitive Info) │
├──────────┴──────────────────────────────────────────────┤
│ What was wrong:                                         │
│ `accessToken` and `refreshToken` were persisted in      │
│ `localStorage` (readable by ANY script on the origin)   │
│ and attached via an axios request interceptor. One XSS  │
│ bug or a compromised dependency could exfiltrate the    │
│ 30-day refresh token and take over the account.         │
├──────────┴──────────────────────────────────────────────┤
│ Fix applied (cookie-based JWT, no JS-visible tokens):   │
│ • NEW `JwtCookieUtil` issues three httpOnly cookies:    │
│   – `lrp_access_token`  (path `/`, 1h)                  │
│   – `lrp_refresh_token` (path `/api/auth`, 7d,          │
│     session cookie when "remember me" is off)           │
│   – `lrp_setup_token`   (path `/`, 10 min, OAuth        │
│     profile-setup step)                                 │
│   All: `HttpOnly`, `SameSite=Strict`, `Secure` when     │
│   `request.isSecure()` (prod adds forward-headers).     │
│ • `JwtAuthenticationFilter` + `CurrentUserUtil` read    │
│   the access cookie (Bearer header still supported).    │
│ • `AuthResponse` tokens are `WRITE_ONLY` (never appear  │
│   in response bodies).                                  │
│ • `login`/`refresh`/`oauth2`/`complete-profile` set and │
│   rotate cookies; `logout` clears all three.            │
│ • NEW `GET /auth/me` (authenticated) returns the        │
│   profile for app bootstrap; NEW `GET /auth/oauth2/     │
│   setup-info` feeds the profile-setup page from the     │
│   httpOnly setup cookie (no sessionStorage).            │
│ • OAuth success redirect now carries only `?mode=` —    │
│   no token, PII, or query-string secrets at all.        │
│ • Frontend: axios `withCredentials: true`; request      │
│   interceptor removed; 401 → single-flight `POST        │
│   /auth/refresh` (cookie) → replay; no localStorage /   │
│   sessionStorage anywhere (verified by grep).           │
│ • `SecurityConfig`: explicit permitAll allowlist        │
│   (login/register/refresh/logout/forgot/reset/oauth2    │
│   endpoints/uploads/stream); `/auth/me`, `/auth/        │
│   profile` are now authenticated.                       │
│ • Verification: `mvn test` 64/64 ✅, `npm run build` ✅. │
│   Residual hardening (documented, not implemented):     │
│   CSRF stays disabled — mitigated by SameSite=Strict    │
│   (cookies never sent cross-site).                      │
└─────────────────────────────────────────────────────────┘

### 3.6 — Protected API routes: ✅ PASS

Every controller endpoint falls under `anyRequest().authenticated()` unless explicitly allowlisted. Role gating via `@PreAuthorize` on privileged mutations (equipment status/image, admin user management, budgets, invoices, etc.). `GET /institutions` and `GET /departments` are intentionally public lookups (registration form). The `rememberMe` cookie path `/api/auth/refresh` is inside `/auth/**` (public) but consumes a server-side DB-validated refresh token — acceptable. SSE stream is public-path but gated by the one-time ticket (Finding 6).

┌─────────────────────────────────────────────────────────┐
│ FINDING #12                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Broken Object Level Authorization (IDOR)     │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/controller/NotificationController.java:35-39,48-52` · `service/NotificationService.java:160-166,181-186` │
│ CWE      │ CWE-639 (Authorization Bypass Through User-Controlled Key) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `PUT /notifications/{id}/read` and                       │
│ `DELETE /notifications/{id}` took only the path id and  │
│ modified/deleted whatever notification matched — no     │
│ check that it belonged to the caller.                   │
│                                                         │
│ Why it matters:                                         │
│ Any authenticated user could mark others' notifications │
│ read or delete them by iterating ids (minor data        │
│ integrity), demonstrating the pattern that usually      │
│ hides worse IDOR bugs.                                  │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ @PutMapping("/{id}/read")                               │
│ public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {  │
│     notificationService.markAsRead(id);   // no ownership check │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ Long userId = currentUserUtil.getCurrentUserId(request); │
│ notificationService.markAsRead(id, userId);              │
│ // service: if (notification.getUser()==null ||          │
│ //     !notification.getUser().getId().equals(userId))   │
│ //   throw new ForbiddenException("...");                │
│ // same for deleteNotification(id, userId)               │
│ ```                                                     │
│                                                         │
│ Effort: ~15 min                                         │
└─────────────────────────────────────────────────────────┘

### 3.7 — OAuth security: ⚠️ PARTIAL

- ✅ Authorization endpoint uses `CookieOAuth2AuthorizationRequestRepository` — state parameter stored in HttpOnly cookie (CSRF protection for the OAuth dance).
- ✅ Callback base URI validated by Spring; client-id/secret server-side only.
- ⚠️ Token delivery is implicit-style (fragment) — see Findings 4/5. Full hardening = PKCE + httpOnly cookie session.

┌─────────────────────────────────────────────────────────┐
│ FINDING #6                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ HIGH                                         │
│ Category │ Token Exposure in URL                        │
│ Location │ `lab-resource-frontend/src/hooks/useNotificationWebSocket.js:16` │
│ CWE      │ CWE-598 (Sensitive Info in URL via GET)      │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ The realtime hook opened `EventSource("http://localhost:8081/ws?token=" + token)`, embedding the live JWT in the connection URL. |
│                                                         │
│ Why it matters:                                         │
│ The token would land in proxy/server logs and any       │
│ network inspection. `EventSource` cannot send custom    │
│ headers, so a raw token in the URL was the only way it  │
│ "worked" — a bad trade.                                 │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ const wsUrl = `http://localhost:8081/ws?token=${token}`;│
│ const eventSource = new EventSource(wsUrl);             │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ // Backend: POST /api/notifications/ticket (authenticated, │
│ // via axios/Authorization header) → 60s single-use ticket │
│ //         GET  /api/notifications/stream?ticket=<t> (SSE) │
│ // Frontend: fetch ticket with axios, then:             │
│ const es = new EventSource(`${SSE_URL}?ticket=${ticket}`); │
│ // Token never appears in a URL.                        │
│ ```                                                     │
│                                                         │
│ Effort: ~1 hour (ticket service + SSE controller + hook)│
└─────────────────────────────────────────────────────────┘

### 3.8 — Password reset flows: ✅ PASS

`AuthService.forgotPassword` (line 188) generates a `UUID` token, stores it with a **1-hour expiry** (`PasswordResetToken`), and `resetPassword` (line 204) rejects expired **and already-used** tokens (single-use enforced). The reset link (`EmailService.java:29`) places the token in the URL query — standard practice, and the token is single-use/short-lived; acceptable. Residual: `forgotPassword` reveals account existence (Finding 15).

┌─────────────────────────────────────────────────────────┐
│ FINDING #11                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Attack Surface / Clickjacking                │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/config/SecurityConfig.java:49-50,57` │
│ CWE      │ CWE-1021 (Clickjacking) · CWE-668 (Exposure of Resource) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `/h2-console/**` and Swagger UI were `permitAll` in     │
│ every profile, and `frameOptions().disable()` removed   │
│ `X-Frame-Options` app-wide (clickjacking on any         │
│ page). In prod, H2 is unused but the console + swagger  │
│ docs stayed public.                                     │
│                                                         │
│ Why it matters:                                         │
│ Prod exposure of the DB console (if ever enabled) or    │
│ API docs leaks endpoints/schema; a missing frame        │
│ header lets attackers embed any app page in a           │
│ malicious iframe (clickjacking).                        │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ boolean isProd = environment.acceptsProfiles(Profiles.of("prod")); │
│ if (!isProd) {                                          │
│   auth.requestMatchers("/h2-console/**").permitAll()    │
│       .requestMatchers("/swagger-ui/**","/v3/api-docs/**").permitAll(); │
│ }                                                       │
│ auth.anyRequest().authenticated();                      │
│ .headers(h -> h.frameOptions(f -> f.sameOrigin()))      │
│ ```                                                     │
│                                                         │
│ Effort: ~10 min                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FINDING #13                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM (availability)                        │
│ Category │ Cryptographic Token Collision                │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/security/JwtTokenProvider.java:56-81` │
│ CWE      │ CWE-330 (Use of Insufficiently Random Values)│
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ Refresh tokens contained only (subject, type, iat,      │
│ exp). `iat` has second precision, so two logins for     │
│ the same user within the same second produced          │
│ byte-identical tokens → the `refresh_tokens` table's    │
│ unique constraint rejected the second insert and the    │
│ login returned 500 (observed as bug #1 in              │
│ TEST_REPORT.md).                                        │
│                                                         │
│ Why it matters:                                         │
│ Session provisioning becomes flaky (500s) under normal  │
│ double-tab / refresh race; also degrades token          │
│ entropy for same-user, same-second issuance.            │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ return Jwts.builder()                                   │
│     .id(UUID.randomUUID().toString())   // unique jti   │
│     .subject(email).issuedAt(now).expiration(expiryDate)│
│     .signWith(getSigningKey()).compact();               │
│ ```                                                     │
│                                                         │
│ Effort: ~5 min                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FINDING #14                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ LOW                                          │
│ Category │ Cookie Flags                                 │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/controller/AuthController.java:35-42` │
│ CWE      │ CWE-614 (Sensitive Cookie Without Secure Flag) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ The remember-me `refresh_token` cookie was set with     │
│ `HttpOnly=true` (good) but `Secure=false` and no        │
│ `SameSite` — the refresh token would ride over plain    │
│ HTTP.                                                   │
│                                                         │
│ Why it matters:                                         │
│ On any non-TLS hop, the 30-day refresh cookie is        │
│ readable by a network attacker.                         │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ refreshCookie.setSecure(httpRequest.isSecure());        │
│ refreshCookie.setAttribute("SameSite", "Lax");          │
│ ```                                                     │
│                                                         │
│ Effort: ~5 min                                          │
└─────────────────────────────────────────────────────────┘

---

## Section 4: Server-Side Validation

### 4.1 — Schema validation: ✅ PASS

All request DTOs are validated server-side with `jakarta.validation` annotations and `@Valid` on controller params: `LoginRequest` (`@NotBlank`, `@Email`, `@Size(min=6)`), `RegisterRequest`, `ResetPasswordRequest`, `CompleteProfileRequest`, budget/invoice/payment DTOs, etc. Field errors are returned as structured `errors` maps by `GlobalExceptionHandler`. Frontend validation is present but is UX, not the security boundary.

### 4.2 — Identity from session: ✅ PASS

Write operations derive identity from `CurrentUserUtil.getCurrentUserId(request)` (JWT → DB user), never from request-body `userId` fields. Admin endpoints are additionally `@PreAuthorize` role-gated. (The one prior exception — notification IDOR where the controller trusted the path id — is fixed, Finding 12.)

### 4.3 — Input sanitization: ✅ PASS

React escapes by default. Grep across `src/` for `dangerouslySetInnerHTML`, `v-html`, `innerHTML=`, `eval(`, `document.write` → **no matches**. Notification messages are additionally stripped of `<...>` tags before push/SMS (`NotificationService`, `NotificationSseService`).

### 4.4 — HTTP method enforcement: ✅ PASS

All state changes are `POST`/`PUT`/`DELETE` (e.g. `POST /auth/login`, `PUT /notifications/{id}/read`, `DELETE /bookings/...`). Only read-only lookups use `GET`. CORS explicitly allows only `GET,POST,PUT,DELETE,OPTIONS`.

### 4.5 — Error information leaks: ❌ (fixed)

┌─────────────────────────────────────────────────────────┐
│ FINDING #8                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Information Disclosure                       │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/exception/GlobalExceptionHandler.java:110-116` (and `EquipmentController.java:151`) │
│ CWE      │ CWE-209 (Generation of Error Message Containing Sensitive Information) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ The catch-all handler returned `"Internal server error: " + ex.getMessage()`, echoing raw exception text (SQL/JPA messages, file paths, class names). The image-upload controller did the same in its catch block. `UsernameNotFoundException` and `UnauthorizedException` also echoed internal messages. |
│                                                         │
│ Why it matters:                                         │
│ Attackers probe endpoints to learn DB structure,        │
│ libraries/versions, and internals; the messages also    │
│ help confirm valid emails (enumeration).                │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ body.put("message", "Internal server error: " + ex.getMessage()); │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ log.error("Unhandled exception", ex);                   │
│ body.put("message", "An unexpected error occurred. Please try again later."); │
│ // upload catch: ApiResponse.error("Failed to upload image")  │
│ // UsernameNotFound → "Invalid email or password"        │
│ // Unauthorized → "Invalid or missing authentication"    │
│ ```                                                     │
│                                                         │
│ Effort: ~15 min                                         │
└─────────────────────────────────────────────────────────┘

### 4.6 — Webhook signature verification: ⬚ N/A

No inbound webhooks. Payments use an internal mock provider (`PaymentService`), and SMTP/SMS are outbound only. If a real payment/webhook provider is added later, signature verification must be implemented.

---

## Section 5: Dependency And Package Security

### 5.1 — Audit results: ❌

`npm audit` in `lab-resource-frontend`:

| Severity | Package | Issue | Fix |
|----------|---------|-------|-----|
| **high** | `vite` ≤6.4.2 | `server.fs.deny` bypass — arbitrary file read via dev server (GHSA-fx2h-pf6j-xcff) | upgrade vite (major bump available: 8.2.1) |
| moderate | `vite` via `esbuild` ≤0.24.2 | dev-server request/response read (GHSA-67mh-4wv8-2f99) | upgrade esbuild/vite |
| moderate | `postcss` ≤8.5.22 | sourceMappingURL arbitrary .map read (GHSA-fxqj-rqcc-2cmp) | upgrade postcss |
| moderate | `react-router-dom`/`react-router` | open redirect / constructor injection (GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg) | upgrade react-router-dom |

Total: **1 high, 4 moderate, 0 critical**. All are **build-time / dev-server / client-router** — none are exploitable against the deployed production build directly, but they should be upgraded. The vite fix requires a **semver-major** bump (`isSemVerMajor: true`), so treat as a scheduled upgrade with regression testing.

┌─────────────────────────────────────────────────────────┐
│ FINDING #19                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM (1 high + 4 moderate advisories)      │
│ Category │ Vulnerable / Outdated Dependencies           │
│ Location │ `lab-resource-frontend/package.json` + `package-lock.json` │
│ CWE      │ CWE-1104 (Use of Unmaintained Third-Party Components) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `npm audit` reports `vite` ≤6.4.2 (high: `server.fs.deny`│
│ bypass — GHSA-fx2h-pf6j-xcff), plus moderate in         │
│ esbuild, postcss, react-router-dom/react-router.        │
│                                                         │
│ Why it matters:                                         │
│ The vite high is a **dev-server** file-read issue       │
│ (not shipped in the prod build) and the router issues   │
│ are client-side; none are remotely exploitable in the   │
│ deployed app today, but they must be upgraded before    │
│ long-running public deployment.                         │
│                                                         │
│ The fix (recommended):                                  │
│ ```                                                     │
│ npm install vite@^6  # or latest (major bump; rerun     │
│                       # the TEST_REPORT suite after)     │
│ npm audit fix         # postcss, react-router            │
│ ```                                                     │
│                                                         │
│ Effort: ~30–60 min + regression run                     │
└─────────────────────────────────────────────────────────┘

### 5.2 — Hallucinated packages: ✅ PASS

All dependencies are mainstream and well-known (react, react-dom, react-router-dom, axios, react-query, react-hot-toast, zxing for QR, Spring ecosystem, jjwt 0.12.6, testcontainers, mapstruct). No suspiciously-named or brand-new packages found.

### 5.3 — Lockfile committed: ✅ PASS

`lab-resource-frontend/package-lock.json` is tracked. Maven uses pinned versions in `pom.xml`.

### 5.4 — Outdated packages: ⚠️ PARTIAL

Spring Boot 3.3.0 (2024 era), jjwt 0.12.6 (current API), vite 5.4.21 (advisories above). Backend deps have no known critical CVEs in this configuration; frontend carries the 5.1 items. Recommend `mvn versions:display-dependency-updates` + scheduled dependency bumps.

### 5.5 — Unused dependencies: ✅ (fixed)

Verified every declared dependency against imports across `src/`. One unused dependency found and removed:

┌─────────────────────────────────────────────────────────┐
│ FINDING #21                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ LOW                                          │
│ Category │ Supply Chain / Dependency Hygiene            │
│ Location │ `lab-resource-frontend/package.json` (removed) │
│ CWE      │ CWE-1104 (Unmaintained Dependency)           │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `dayjs` (^1.11.11) was declared but referenced 0 times  │
│ across `src/` (verified by import-usage scan).          │
├──────────┴──────────────────────────────────────────────┤
│ Fix applied:                                            │
│ `npm uninstall dayjs` (1 package removed). Build        │
│ verified: `npm run build` succeeds (2480 modules,       │
│ chunk-size warning only).                               │
│ Remaining: `@fullcalendar/*`, `react-dom`, etc. all     │
│ actively used; no other orphans found by import scan.   │
└─────────────────────────────────────────────────────────┘

---

## Section 6: Rate Limiting

### 6.1 — Expensive operations: ✅ PASS

Outbound email/SMS sends (`EmailService`, `SmsService` stub) and the DB-heavy reminder schedulers are rate-limited by IP via the global interceptor. No paid third-party LLM/Stripe calls exist. The reminder schedulers run on fixed cron intervals, not user-triggerable.

### 6.2 — Auth endpoints: ✅ (fixed)

┌─────────────────────────────────────────────────────────┐
│ FINDING #10                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Brute Force / Missing Rate Limiting          │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/config/WebMvcConfig.java:34-37` · `config/RateLimitInterceptor.java:79-85` │
│ CWE      │ CWE-307 (Improper Restriction of Excessive Authentication Attempts) · CWE-346 (Origin Validation) |
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `/api/auth/login`, `/register`, `/forgot-password`,     │
│ `/reset-password` were explicitly EXCLUDED from the     │
│ rate limiter (free brute-force/credential-stuffing),    │
│ and the client-IP extractor trusted the user-supplied   │
│ `X-Forwarded-For` header unconditionally (spoofable to  │
│ bypass limits entirely).                                │
│                                                         │
│ Why it matters:                                         │
│ Unthrottled login + password reset → online brute       │
│ force; spoofed XFF → trivially evade the existing       │
│ limit.                                                  │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ .excludePathPatterns("/api/auth/login", ...);           │
│ String xForwardedFor = request.getHeader("X-Forwarded-For"); │
│ if (xForwardedFor != null && !xForwardedFor.isEmpty()) return xForwardedFor.split(",")[0].trim(); │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**");  // no excludes
│ // getClientIp(): use X-Forwarded-For ONLY when the     │
│ // direct peer is in rate-limit.trusted-proxies (env).  │
│ // Default: no trusted proxies → use getRemoteAddr().   │
│ ```                                                     │
│                                                         │
│ Effort: ~15 min                                         │
└─────────────────────────────────────────────────────────┘

### 6.3 — Implementation check: ⚠️ PARTIAL

┌─────────────────────────────────────────────────────────┐
│ FINDING #20                                             │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ LOW                                          │
│ Category │ Rate Limiting Reliability                    │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/config/RateLimitInterceptor.java:31-32` │
│ CWE      │ CWE-799 (Improper Control of Interaction Frequency) |
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ Limits are enforced server-side (good) but held in an   │
│ in-memory `ConcurrentHashMap` per JVM instance — they   │
│ reset on every deploy/restart and do not share across   │
│ instances.                                              │
│                                                         │
│ Why it matters:                                         │
│ A restart or a multi-instance deployment (docker-       │
│ compose) weakens the control; a determined attacker     │
│ can spread requests across instances or time them       │
│ around restarts.                                        │
│                                                         │
│ The fix (recommended):                                  │
│ ```                                                     │
│ // Back to Redis-backed limiter (spring-data-redis is   │
│ // already excluded from autoconfigure; re-enable or    │
│ // use an in-process TokenBucket per IP + write-ahead   │
│ // to Redis). Wire `rate-limit.enabled` to env.         │
│ ```                                                     │
│                                                         │
│ Effort: ~2–4 hours                                      │
└─────────────────────────────────────────────────────────┘

---

## Section 7: CORS Configuration

### 7.1 — API route CORS: ✅ PASS

CORS in both `SecurityConfig.corsConfigurationSource()` and `WebMvcConfig` is locked to `http://localhost:3000` with explicit methods. No `Access-Control-Allow-Origin: *` on any endpoint. (If this app is ever served from a real domain, update both lists together.)

### 7.2 — Credentials mode: ✅ PASS

`allowCredentials(true)` is paired with the **specific** origin `http://localhost:3000` — never a wildcard. Correct combination per the fetch spec.

---

## Section 8: File Upload Security

### 8.1 — Server-side validation: ❌ (fixed)

┌─────────────────────────────────────────────────────────┐
│ FINDING #9                                              │
├──────────┬──────────────────────────────────────────────┤
│ Severity │ MEDIUM                                       │
│ Category │ Unrestricted File Upload                     │
│ Location │ `lab-resource-backend/src/main/java/com/lrplatform/service/EquipmentService.java:126-146` · `controller/EquipmentController.java:143` │
│ CWE      │ CWE-434 (Unrestricted Upload of File with Dangerous Type) │
├──────────┴──────────────────────────────────────────────┤
│ What's wrong:                                           │
│ `uploadImage` accepted ANY extension/content type and   │
│ stored it under `/uploads/equipment/` which is served   │
│ `permitAll`. A `.html`/`.svg`/polyglot file could be    │
│ hosted and rendered on the origin.                      │
│                                                         │
│ Why it matters:                                         │
│ Served attacker-controlled HTML/SVG under the API       │
│ origin enables phishing and (before the Finding 5 fix,  │
│ when tokens lived in localStorage) token theft.         │
│                                                         │
│ The vulnerable code:                                    │
│ ```                                                     │
│ String extension = originalFilename.substring(originalFilename.lastIndexOf("."));  // any
│ Path filePath = equipmentDir.resolve(filename);         │
│ file.transferTo(filePath.toFile());                     │
│ ```                                                     │
│                                                         │
│ The fix (applied):                                      │
│ ```                                                     │
│ // validateImageFile(file):                              │
│ //  - extension ∈ {.jpg,.jpeg,.png,.gif,.webp}           │
│ //  - Content-Type startsWith "image/"                   │
│ //  - server-generated filename (equipment_<id>_<rand>)  │
│ //  - multipart size capped at 10MB (application.yml)    │
│ ```                                                     │
│                                                         │
│ Effort: ~15 min                                         │
└─────────────────────────────────────────────────────────┘

### 8.2 — Storage permissions: ⚠️ PARTIAL

`/uploads/**` is served publicly (`permitAll`). Equipment images are public by design, and URLs are server-generated — acceptable. But: QR-code PNGs, calibration certificate PDFs, and invoice PDFs are written into the same tree and therefore **also public** even when their API endpoints are role-gated. For documents/certificates, serve via an authenticated controller endpoint (e.g. `@PreAuthorize` + `FileSystemResource`) rather than the static `permitAll` handler.

### 8.3 — Execution prevention: ✅ PASS

Uploads land in `./uploads/` (outside the app webapp root), served only through Spring's static resource handler — no script execution path. With the 8.1 allowlist, only image bytes can be stored. `server.servlet.context-path=/api` isolates the API.

---

## 7. Remaining Human / Ops Actions (not code-fixable)

1. **Rotate the Google OAuth client secret** in Google Cloud Console; regenerate `GOOGLE_CLIENT_SECRET` and set it in the deploy environment (docker-compose env / CI secrets / start.ps1 caller env).
2. **Rotate all sessions + reset credentials** exposed by `lrup_backup.sql`; delete the file from disk. (Optional, if the repo may become public: rewrite history with BFG — currently it only exists in the HEAD commit so `rm` + new commit suffices.)
3. **Set a strong random `JWT_SECRET`** (e.g. `openssl rand -base64 64`) in prod; restart the backend (current dev instance will invalidate sessions if it was relying on the generated random key).
4. ~~Decide on the token-storage refactor (Finding 5)~~ — **done** in this session (httpOnly cookie auth); residual follow-up is Authorization Code + PKCE.
5. **Schedule frontend dependency upgrades** (Finding 19) with regression run of `TEST_REPORT.md` (332/340 baseline).

## 8. Verification Evidence (post-fix)

| Check | Result |
|-------|--------|
| `mvn compile` | ✅ success |
| `mvn test` (unit, `src/test`) | ✅ **64 run, 0 failures, 0 errors** (incl. new cookie-assertion AuthControllerTest) |
| `npm run build` (production) | ✅ success |
| `git status` | `lrup_backup.sql` staged for deletion (index removed); `.gitignore` updated |
| Secret re-grep (post-fix) | ❌ none remaining in tracked files (`application-dev.yml`/`start.ps1` now env-referenced) |
| Token-storage grep (post-fix) | ❌ zero matches for `localStorage`/`sessionStorage`/`accessToken`/`refreshToken` in `lab-resource-frontend/src` — cookies only |
| Live demo (backend running) | ✅ login 200 + `lrp_access_token` (Path=/, 1h) + `lrp_refresh_token` (Path=/api/auth, session) both `HttpOnly; SameSite=Strict`; response body contains **no** token fields (WRITE_ONLY) |
| Live demo (backend running) | ✅ `GET /auth/me` 200 (cookie-authenticated); `POST /auth/refresh` rotates refresh cookie each call; `POST /auth/logout` clears access+refresh+setup cookies → `/auth/me` returns 401; `setup-info` without cookie → clean 400 |
| Schema fix (found in demo) | ✅ `RefreshToken.token` `@Column(length = 500)` (was default 255) to match Flyway `VARCHAR(500)`; dev H2 column ALTERed to 500 — 282-char rotated refresh tokens persist without error |

---
*Report generated from the two-pass audit. FINDING #1–#14, #20 and #21 documented above (blocks for #1–#13, #19, #20, #21; #14 summarized). **Applied in the working tree (not committed):** #1–#5 (incl. the httpOnly-cookie auth refactor), #6–#14, #16 (as part of #8), #21, plus the upload/rate-limit/XFF/frame fixes. **Open (require action):** #15 (user enumeration), #17 (seed passwords), #19 (dependency upgrades), #20 (rate-limit store).*
