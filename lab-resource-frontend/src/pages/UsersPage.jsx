import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLES, roleLabel, can } from "../auth/permissions";
import { usersApi } from "../api/users";
import { institutionsApi } from "../api/institutions";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { Modal } from "../components/Modal";

const ALL_ROLES = Object.values(ROLES);

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);

  const isSystemAdmin = currentUser?.role === ROLES.SYSTEM_ADMINISTRATOR;
  // DEPARTMENT_HEAD can reach this page for read-only visibility into their own
  // institution's users, but has no write access - the backend's @PreAuthorize
  // on POST/PUT /api/users only allows INSTITUTION_ADMINISTRATOR/SYSTEM_ADMINISTRATOR,
  // so these controls stay hidden for them rather than showing actions that would 403.
  const canManage = can(currentUser?.role, "users:manage");

  function load() {
    setLoading(true);
    setError(null);
    return Promise.all([usersApi.list(), institutionsApi.list()])
      .then(([u, i]) => {
        setUsers(u);
        setInstitutions(i);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load users."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this user? This can't be undone.")) return;
    try {
      await usersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.userId !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete this user.");
    }
  }

  if (loading) return <LoadingState label="Loading users…" />;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description={
          canManage
            ? "Everyone with access to your institution's equipment and bookings."
            : "Users in your institution."
        }
        action={
          canManage && (
            <button
              onClick={() => setModalState({ mode: "create" })}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + Add user
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      {users.length === 0 ? (
        <Card>
          <EmptyState title="No users yet" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Institution</th>
                {canManage && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {users.map((u) => (
                <tr key={u.userId}>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{u.email}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{roleLabel(u.role)}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{u.institution?.institutionName || "—"}</td>
                  {canManage && (
                    <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => setModalState({ mode: "edit", user: u })}
                        className="text-xs font-medium text-[var(--color-brass-600)] hover:underline"
                      >
                        Edit
                      </button>
                      {isSystemAdmin && (
                        <button
                          onClick={() => handleDelete(u.userId)}
                          className="text-xs font-medium text-[var(--color-status-maintenance)] hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {canManage && (
        <Modal
          open={!!modalState}
          onClose={() => setModalState(null)}
          title={modalState?.mode === "edit" ? "Edit user" : "Add user"}
        >
          {modalState && (
            <UserForm
              initial={modalState.mode === "edit" ? modalState.user : null}
              institutions={institutions}
              isSystemAdmin={isSystemAdmin}
              onSaved={(saved) => {
                setUsers((prev) =>
                  modalState.mode === "edit" ? prev.map((u) => (u.userId === saved.userId ? saved : u)) : [...prev, saved]
                );
                setModalState(null);
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
}

function UserForm({ initial, institutions, isSystemAdmin, onSaved }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role || ROLES.STUDENT);
  const [institutionId, setInstitutionId] = useState(initial?.institution?.institutionId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Mirrors the backend's role ceiling (UserService.assertCanAssignRole): an
  // INSTITUTION_ADMINISTRATOR may assign any role up to and including their
  // own tier, but never SYSTEM_ADMINISTRATOR - offering it here would just
  // show an option the backend rejects. Purely a UX improvement; the real
  // enforcement lives server-side regardless of what this dropdown offers.
  // The user's CURRENT role is always included even if it's above the
  // ceiling (e.g. viewing an existing SYSTEM_ADMINISTRATOR's profile) so the
  // dropdown never shows a value that isn't one of its own options - actually
  // submitting a change would still be rejected server-side either way.
  const assignableRoles = isSystemAdmin
    ? ALL_ROLES
    : Array.from(new Set([...ALL_ROLES.filter((r) => r !== ROLES.SYSTEM_ADMINISTRATOR), initial?.role].filter(Boolean)));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Only include a password field when creating, or when an admin explicitly
    // typed a new one while editing. Sending an empty/omitted password on edit
    // would otherwise risk the backend overwriting the existing hash.
    const payload = {
      name,
      email,
      role,
      institution: institutionId ? { institutionId: Number(institutionId) } : undefined,
      ...(!initial || password ? { password } : {}),
    };

    try {
      const saved = initial ? await usersApi.update(initial.userId, payload) : await usersApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="u-name" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Full name
        </label>
        <input id="u-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="u-email" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Email
        </label>
        <input
          id="u-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="u-password" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          {initial ? "New password" : "Password"}{" "}
          {initial && <span className="text-[var(--color-ink-600)] font-normal">(leave blank to keep current)</span>}
        </label>
        <input
          id="u-password"
          type="password"
          required={!initial}
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={initial ? "••••••••" : "At least 8 characters"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="u-role" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Role
        </label>
        <select id="u-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
          {assignableRoles.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="u-inst" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Institution
        </label>
        <select
          id="u-inst"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className={inputClass}
        >
          <option value="">No institution</option>
          {institutions.map((inst) => (
            <option key={inst.institutionId} value={inst.institutionId}>
              {inst.institutionName}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Add user"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";
