import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLES } from "../auth/permissions";
import { institutionsApi } from "../api/institutions";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { Modal } from "../components/Modal";

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null); // null | { mode: "create" } | { mode: "edit", institution }

  const isSystemAdmin = user?.role === ROLES.SYSTEM_ADMINISTRATOR;
  const isInstitutionAdmin = user?.role === ROLES.INSTITUTION_ADMINISTRATOR;

  function load() {
    setLoading(true);
    setError(null);
    return institutionsApi
      .list()
      .then(setInstitutions)
      .catch((err) => setError(err.response?.data?.message || "Couldn't load institutions."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // Bug fix: this previously checked institutionId match alone, so ANY role
  // (including STUDENT/RESEARCHER) whose institutionId matched the row saw an
  // Edit button - the backend would 403 them, but the button shouldn't have
  // been shown at all. Matches the backend's actual rule: SYSTEM_ADMINISTRATOR
  // (any institution) or INSTITUTION_ADMINISTRATOR (own institution only).
  function canEdit(inst) {
    return isSystemAdmin || (isInstitutionAdmin && user?.institutionId === inst.institutionId);
  }

  // Item #3 fix: institutionsApi.remove() already existed but had no UI entry
  // point - only SYSTEM_ADMINISTRATOR can delete an institution (per the
  // Role-Operation Matrix and the backend's @PreAuthorize), so the button is
  // gated the same way and confirms first since this can't be undone.
  async function handleDelete(inst) {
    if (!window.confirm(`Delete "${inst.institutionName}"? This can't be undone.`)) return;
    try {
      await institutionsApi.remove(inst.institutionId);
      setInstitutions((prev) => prev.filter((i) => i.institutionId !== inst.institutionId));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete this institution.");
    }
  }

  if (loading) return <LoadingState label="Loading institutions…" />;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Institutions"
        description={
          isSystemAdmin
            ? "Every institution on the platform."
            : isInstitutionAdmin
            ? "You can update your own institution's details here."
            : "Institutions on the platform."
        }
        action={
          isSystemAdmin && (
            <button
              onClick={() => setModalState({ mode: "create" })}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + Add institution
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      {institutions.length === 0 ? (
        <Card>
          <EmptyState title="No institutions yet" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Address</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {institutions.map((inst) => (
                <tr key={inst.institutionId}>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">{inst.institutionName}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{inst.address || "—"}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">
                    {inst.contactEmail || "—"}
                    {inst.contactPhone ? ` · ${inst.contactPhone}` : ""}
                  </td>
                  <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                    {canEdit(inst) && (
                      <button
                        onClick={() => setModalState({ mode: "edit", institution: inst })}
                        className="text-xs font-medium text-[var(--color-brass-600)] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {isSystemAdmin && (
                      <button
                        onClick={() => handleDelete(inst)}
                        className="text-xs font-medium text-[var(--color-status-maintenance)] hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={modalState?.mode === "edit" ? "Edit institution" : "Add institution"}
      >
        {modalState && (
          <InstitutionForm
            initial={modalState.mode === "edit" ? modalState.institution : null}
            onSaved={(saved) => {
              setInstitutions((prev) =>
                modalState.mode === "edit"
                  ? prev.map((i) => (i.institutionId === saved.institutionId ? saved : i))
                  : [...prev, saved]
              );
              setModalState(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

function InstitutionForm({ initial, onSaved }) {
  const [institutionName, setInstitutionName] = useState(initial?.institutionName || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = { institutionName, address, contactEmail, contactPhone };
    try {
      const saved = initial
        ? await institutionsApi.update(initial.institutionId, payload)
        : await institutionsApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Institution name" htmlFor="i-name">
        <input
          id="i-name"
          required
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Address" htmlFor="i-address">
        <input id="i-address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Contact email" htmlFor="i-email">
        <input
          id="i-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Contact phone" htmlFor="i-phone">
        <input id="i-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
      </Field>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Add institution"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";

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
