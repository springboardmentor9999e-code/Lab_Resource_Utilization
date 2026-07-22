import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      // error state already surfaced via useAuth().error
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-paper-50)]">
      {/* Left: instrument-panel identity panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--color-ink-900)] text-[var(--color-paper-50)] p-12 relative overflow-hidden">
        <BackgroundDials />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-[var(--font-display)] text-xl tracking-tight">LabShare</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--color-brass-400)] mb-4">
            Lab Resource Utilization Platform
          </p>
          <h1 className="font-[var(--font-display)] text-4xl leading-[1.15] mb-6">
            Every instrument, accounted for.
          </h1>
          <p className="text-[var(--color-paper-200)] text-base leading-relaxed">
            Track availability, schedule access, and share equipment across
            departments and institutions — from a single console.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 font-[var(--font-mono)] text-xs text-[var(--color-paper-200)]/70">
          <span>Utilization monitoring</span>
          <span aria-hidden="true">·</span>
          <span>Inter-institution sharing</span>
          <span aria-hidden="true">·</span>
          <span>Maintenance tracking</span>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <BrandMark dark />
            <span className="font-[var(--font-display)] text-xl text-[var(--color-ink-900)] tracking-tight">
              LabShare
            </span>
          </div>

          <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-ink-900)] mb-1">
            Sign in
          </h2>
          <p className="text-[var(--color-ink-600)] text-sm mb-8">
            Enter your institutional credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-600)]/50 focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-600)]/50 focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors"
              />
            </div>

            {(error || localError) && (
              <div
                role="alert"
                className="rounded-md bg-[var(--color-status-maintenance-bg)] px-3.5 py-2.5 text-sm text-[var(--color-status-maintenance)]"
              >
                {error || localError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-ink-600)]">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-[var(--color-brass-600)] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandMark({ dark = false }) {
  const stroke = dark ? "var(--color-ink-900)" : "var(--color-paper-50)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="var(--color-brass-500)" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="3.5" fill="var(--color-brass-500)" />
      <line x1="14" y1="4" x2="14" y2="7" stroke={stroke} strokeWidth="1.5" />
      <line x1="14" y1="21" x2="14" y2="24" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

// Faint decorative dials scattered in the hero panel — echoes the StatusDial
// signature element without competing with the headline.
function BackgroundDials() {
  const dials = [
    { top: "8%", left: "72%", size: 140 },
    { top: "58%", left: "-6%", size: 200 },
    { top: "78%", left: "68%", size: 100 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {dials.map((d, i) => (
        <svg
          key={i}
          width={d.size}
          height={d.size}
          viewBox="0 0 100 100"
          style={{ position: "absolute", top: d.top, left: d.left, opacity: 0.08 }}
        >
          <circle cx="50" cy="50" r="48" stroke="var(--color-brass-400)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="34" stroke="var(--color-brass-400)" strokeWidth="1" fill="none" />
          <line x1="50" y1="50" x2="50" y2="10" stroke="var(--color-brass-400)" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
}
