import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiClient } from "../api/client";
import { roleLabel } from "../auth/permissions";

const SELF_REGISTER_ROLES = ["STUDENT", "RESEARCHER", "LAB_TECHNICIAN", "LAB_MANAGER", "DEPARTMENT_HEAD"];

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [success, setSuccess] = useState(false);

  // Any role other than Student/Researcher requires admin approval after
  // registration - the account is created as Student/Researcher immediately,
  // and the requested role only takes effect once approved. See the security
  // note on backend RegisterRequest.role: the account is never created with an
  // elevated role directly, regardless of what's selected here.
  const needsApproval = role !== "STUDENT" && role !== "RESEARCHER";

  // Institution list is a public-ish read (GET /api/institutions has no
  // @PreAuthorize), so an unauthenticated registrant can still pick theirs.
  useEffect(() => {
    apiClient
      .get("/api/institutions")
      .then((r) => setInstitutions(r.data))
      .catch(() => setInstitutions([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register({
        name,
        email,
        password,
        role,
        institutionId: institutionId ? Number(institutionId) : undefined,
      });
      setSuccess(true);
      // Give the pending-approval message more time to be read; the plain
      // "account created" case can move on quickly as before.
      setTimeout(() => navigate("/login"), needsApproval ? 2600 : 1200);
    } catch {
      // error surfaced via useAuth().error
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper-50)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="12" stroke="var(--color-brass-500)" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="3.5" fill="var(--color-brass-500)" />
          </svg>
          <span className="font-[var(--font-display)] text-xl text-[var(--color-ink-900)] tracking-tight">
            LabShare
          </span>
        </div>

        <div className="bg-white border border-[var(--color-paper-200)] rounded-xl p-8 shadow-sm">
          <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-ink-900)] mb-1">
            Create your account
          </h2>
          <p className="text-[var(--color-ink-600)] text-sm mb-6">
            Student and Researcher accounts are active immediately. Staff roles (Lab
            Technician, Lab Manager, Department Head) require your institution
            admin's approval before they take effect. Institution and system
            administrators are provisioned separately.
          </p>

          {success ? (
            <div className="rounded-md bg-[var(--color-status-available-bg)] px-4 py-3 text-sm text-[var(--color-ink-900)]">
              {needsApproval ? (
                <>
                  Account created as {roleLabel("STUDENT")}. Your request for {roleLabel(role)} access has been
                  sent to your institution's admin for approval — you'll have {roleLabel(role)} permissions once
                  it's approved. Redirecting to sign in…
                </>
              ) : (
                "Account created. Redirecting to sign in…"
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Full name" htmlFor="name">
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Sam Student"
                />
              </Field>

              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@institution.edu"
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </Field>

              <Field label="Role" htmlFor="role">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                >
                  {SELF_REGISTER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Institution" htmlFor="institution">
                <select
                  id="institution"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>
                    Select your institution
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.institutionId} value={inst.institutionId}>
                      {inst.institutionName}
                    </option>
                  ))}
                </select>
              </Field>

              {error && (
                <div role="alert" className="rounded-md bg-[var(--color-status-maintenance-bg)] px-3.5 py-2.5 text-sm text-[var(--color-status-maintenance)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-600)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--color-brass-600)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-600)]/50 focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
