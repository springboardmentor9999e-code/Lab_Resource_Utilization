import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { labsApi } from "../api/labs";
import { institutionsApi } from "../api/institutions";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { Modal } from "../components/Modal";

export default function LabsPage() {
  const { user } = useAuth();
  // Full manage (any institution) for admins; LAB_MANAGER gets create/edit
  // scoped to their own institution - the backend enforces the scoping either
  // way, but locking the institution field below keeps the form from offering
  // an option that would just get rejected.
  const canManage = can(user?.role, "labs:manage");
  const canManageOwnInstitution = can(user?.role, "labs:manageOwnInstitution");
  const [labs, setLabs] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    return Promise.all([labsApi.list(), institutionsApi.list()])
      .then(([l, i]) => {
        setLabs(l);
        setInstitutions(i);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load labs."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading labs…" />;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Labs"
        description="Every lab across the institutions you manage."
        action={
          canManageOwnInstitution && (
            <button
              onClick={() => setModalState({ mode: "create" })}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + Add lab
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      {labs.length === 0 ? (
        <Card>
          <EmptyState title="No labs yet" description="Add a lab to start assigning equipment to it." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Location</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Institution</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {labs.map((lab) => (
                <tr key={lab.labId}>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">{lab.labName}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{lab.location || "—"}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{lab.institution?.institutionName || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {(canManage ||
                      (canManageOwnInstitution && lab.institution?.institutionId === user?.institutionId)) && (
                      <button
                        onClick={() => setModalState({ mode: "edit", lab })}
                        className="text-xs font-medium text-[var(--color-brass-600)] hover:underline"
                      >
                        Edit
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
        title={modalState?.mode === "edit" ? "Edit lab" : "Add lab"}
      >
        {modalState && (
          <LabForm
            initial={modalState.mode === "edit" ? modalState.lab : null}
            institutions={institutions}
            lockInstitutionId={!canManage ? user?.institutionId : null}
            onSaved={(saved) => {
              setLabs((prev) =>
                modalState.mode === "edit" ? prev.map((l) => (l.labId === saved.labId ? saved : l)) : [...prev, saved]
              );
              setModalState(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

function LabForm({ initial, institutions, lockInstitutionId, onSaved }) {
  const [labName, setLabName] = useState(initial?.labName || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [institutionId, setInstitutionId] = useState(
    initial?.institution?.institutionId || lockInstitutionId || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      labName,
      location,
      institution: { institutionId: Number(institutionId) },
    };
    try {
      const saved = initial ? await labsApi.update(initial.labId, payload) : await labsApi.create(payload);
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
        <label htmlFor="l-name" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Lab name
        </label>
        <input
          id="l-name"
          required
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="l-location" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Location
        </label>
        <input id="l-location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="l-inst" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Institution
        </label>
        {lockInstitutionId ? (
          <input
            disabled
            value={institutions.find((i) => i.institutionId === lockInstitutionId)?.institutionName || "Your institution"}
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
        ) : (
          <select
            id="l-inst"
            required
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select institution
            </option>
            {institutions.map((inst) => (
              <option key={inst.institutionId} value={inst.institutionId}>
                {inst.institutionName}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Add lab"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";
