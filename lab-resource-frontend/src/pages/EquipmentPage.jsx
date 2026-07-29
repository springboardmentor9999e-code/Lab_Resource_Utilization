import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { equipmentApi } from "../api/equipment";
import { labsApi } from "../api/labs";
import { bookingsApi } from "../api/bookings";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";
import { DocIcon } from "../components/DocIcon";
import { Modal } from "../components/Modal";

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null); // null | {mode:"create"} | {mode:"edit", item} | {mode:"view", item}
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [labFilter, setLabFilter] = useState("");

  const canUpdateStatus = can(user?.role, "equipment:updateStatus");
  const canManage = can(user?.role, "equipment:fullEdit");

  function load() {
    setLoading(true);
    setError(null);
    return Promise.all([equipmentApi.list(), labsApi.list()])
      .then(([e, l]) => {
        setEquipment(e);
        setLabs(l);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load equipment."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // Institutions derived from the loaded labs (each lab already carries its
  // institution), deduplicated - avoids a separate institutions fetch just for
  // this filter.
  const institutionOptions = Array.from(
    new Map(
      labs
        .filter((lab) => lab.institution)
        .map((lab) => [lab.institution.institutionId, lab.institution])
    ).values()
  );

  // Labs shown in the lab filter narrow to the selected institution, if any.
  const labOptions = institutionFilter
    ? labs.filter((lab) => String(lab.institution?.institutionId) === institutionFilter)
    : labs;

  // Filtering client-side against the already-loaded list (equipment/labs are
  // both small, whole-institution-scale datasets) rather than re-fetching on
  // every dropdown change - simpler and avoids an extra round trip per filter.
  const filteredEquipment = equipment.filter((item) => {
    if (labFilter && String(item.lab?.labId) !== labFilter) return false;
    if (institutionFilter && !labFilter && String(item.lab?.institution?.institutionId) !== institutionFilter) {
      return false;
    }
    return true;
  });

  function handleInstitutionFilterChange(value) {
    setInstitutionFilter(value);
    // Clear an incompatible lab selection when the institution changes.
    setLabFilter((prevLab) => {
      const lab = labs.find((l) => String(l.labId) === prevLab);
      if (value && lab && String(lab.institution?.institutionId) !== value) {
        return "";
      }
      return prevLab;
    });
  }

  if (loading) return <LoadingState label="Loading equipment…" />;

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Equipment"
        description="Real-time availability, specifications, and documentation across every lab you have access to."
        action={
          canManage && (
            <button
              onClick={() => setModalState({ mode: "create" })}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + Add equipment
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      {labs.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label htmlFor="filter-institution" className="block text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">
              Institution
            </label>
            <select
              id="filter-institution"
              value={institutionFilter}
              onChange={(e) => handleInstitutionFilterChange(e.target.value)}
              className="text-sm rounded-md border border-[var(--color-paper-200)] bg-white px-3 py-2 focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors"
            >
              <option value="">All institutions</option>
              {institutionOptions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-lab" className="block text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">
              Lab
            </label>
            <select
              id="filter-lab"
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="text-sm rounded-md border border-[var(--color-paper-200)] bg-white px-3 py-2 focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors"
            >
              <option value="">All labs</option>
              {labOptions.map((lab) => (
                <option key={lab.labId} value={lab.labId}>
                  {lab.labName}
                </option>
              ))}
            </select>
          </div>
          {(institutionFilter || labFilter) && (
            <button
              onClick={() => {
                setInstitutionFilter("");
                setLabFilter("");
              }}
              className="text-xs font-medium text-[var(--color-brass-600)] hover:underline pb-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!error && filteredEquipment.length === 0 ? (
        <Card>
          <EmptyState
            title={equipment.length === 0 ? "No equipment yet" : "No equipment matches these filters"}
            description={
              equipment.length === 0
                ? "Equipment added by lab managers will appear here."
                : "Try a different lab or institution, or clear the filters."
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Category</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Lab</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Documentation</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {filteredEquipment.map((item) => (
                <EquipmentRow
                  key={item.equipmentId}
                  item={item}
                  canUpdateStatus={canUpdateStatus}
                  canManage={canManage}
                  onStatusChange={(status) =>
                    setEquipment((prev) =>
                      prev.map((e) => (e.equipmentId === item.equipmentId ? { ...e, status } : e))
                    )
                  }
                  onView={() => setModalState({ mode: "view", item })}
                  onEdit={() => setModalState({ mode: "edit", item })}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={
          modalState?.mode === "edit"
            ? "Edit equipment"
            : modalState?.mode === "view"
            ? modalState.item.equipmentName
            : "Add equipment"
        }
      >
        {modalState?.mode === "view" && <EquipmentDetails item={modalState.item} />}
        {(modalState?.mode === "create" || modalState?.mode === "edit") && (
          <EquipmentForm
            initial={modalState.mode === "edit" ? modalState.item : null}
            labs={labs}
            onSaved={(saved) => {
              setEquipment((prev) =>
                modalState.mode === "edit"
                  ? prev.map((e) => (e.equipmentId === saved.equipmentId ? saved : e))
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

function EquipmentRow({ item, canUpdateStatus, canManage, onStatusChange, onView, onEdit }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const status = e.target.value;
    setSaving(true);
    try {
      await equipmentApi.updateStatus(item.equipmentId, status);
      onStatusChange(status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="px-5 py-3">
        <button
          onClick={onView}
          className="text-[var(--color-ink-900)] font-medium hover:text-[var(--color-brass-600)] hover:underline text-left"
        >
          {item.equipmentName}
        </button>
      </td>
      <td className="px-5 py-3 text-[var(--color-ink-600)]">{item.category || "—"}</td>
      <td className="px-5 py-3 text-[var(--color-ink-600)]">{item.lab?.labName || "—"}</td>
      <td className="px-5 py-3">
        {item.documentationUrl ? (
          <a
            href={item.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-brass-600)] hover:underline"
          >
            <DocIcon className="h-3.5 w-3.5" />
            View
          </a>
        ) : (
          <span className="text-xs text-[var(--color-ink-600)]">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        <StatusDial status={item.status} size="sm" />
      </td>
      <td className="px-5 py-3 text-right whitespace-nowrap space-x-3">
        {canManage && (
          <button onClick={onEdit} className="text-xs font-medium text-[var(--color-brass-600)] hover:underline">
            Edit
          </button>
        )}
        {canUpdateStatus && (
          <select
            defaultValue=""
            disabled={saving}
            onChange={handleChange}
            className="text-xs border border-[var(--color-paper-200)] rounded-md px-2 py-1 disabled:opacity-50"
          >
            <option value="" disabled>
              Change status…
            </option>
            {["Available", "Booked", "Under Maintenance", "Out of Service", "Retired"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </td>
    </tr>
  );
}

function EquipmentDetails({ item }) {
  const { user } = useAuth();
  // Matches the backend's @PreAuthorize on GET /api/bookings/waitlist/{id} -
  // STUDENT/RESEARCHER would get a 403 from that endpoint, so skip the section
  // (and the request) entirely for them rather than showing an error.
  const canViewWaitlist = can(user?.role, "bookings:approve");

  const [waitlist, setWaitlist] = useState([]);
  const [waitlistLoading, setWaitlistLoading] = useState(canViewWaitlist);
  const [waitlistError, setWaitlistError] = useState(null);

  useEffect(() => {
    if (!canViewWaitlist) {
      return;
    }
    let cancelled = false;
    setWaitlistLoading(true);
    setWaitlistError(null);
    bookingsApi
      .waitlistFor(item.equipmentId)
      .then((data) => {
        if (!cancelled) setWaitlist(data);
      })
      .catch((err) => {
        if (!cancelled) setWaitlistError(err.response?.data?.message || "Couldn't load the waitlist.");
      })
      .finally(() => {
        if (!cancelled) setWaitlistLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.equipmentId, canViewWaitlist]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">Category</p>
        <p className="text-sm text-[var(--color-ink-900)]">{item.category || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">Lab</p>
        <p className="text-sm text-[var(--color-ink-900)]">{item.lab?.labName || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">Status</p>
        <StatusDial status={item.status} size="sm" />
      </div>
      {/* Uses the per-equipment waitlist endpoint that previously existed in
          the API client but was never called from anywhere - the Bookings
          page only showed a Waitlisted badge on individual bookings, with no
          view of the ordered queue for a specific piece of equipment. */}
      {canViewWaitlist && (
        <div>
          <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">
            Waitlist{waitlist.length > 0 ? ` (${waitlist.length})` : ""}
          </p>
          {waitlistLoading ? (
            <p className="text-sm text-[var(--color-ink-600)]">Loading…</p>
          ) : waitlistError ? (
            <p className="text-sm text-[var(--color-status-maintenance)]">{waitlistError}</p>
          ) : waitlist.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-600)]">No one is waitlisted for this equipment.</p>
          ) : (
            <ol className="space-y-1.5">
              {waitlist.map((booking, index) => (
                <li
                  key={booking.bookingId || booking.id}
                  className="flex items-center justify-between text-sm bg-[var(--color-paper-100)] rounded-md px-3 py-1.5"
                >
                  <span className="text-[var(--color-ink-900)]">
                    <span className="text-[var(--color-ink-600)] mr-1.5">#{index + 1}</span>
                    {booking.user?.name || "—"}
                  </span>
                  <span className="text-[var(--color-ink-600)] text-xs">{formatWaitlistRange(booking.startTime, booking.endTime)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">Specification</p>
        <p className="text-sm text-[var(--color-ink-900)] whitespace-pre-wrap">
          {item.specification || "No specification on file."}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--color-ink-600)] uppercase tracking-wide mb-1">Documentation</p>
        {item.documentationUrl ? (
          <a
            href={item.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brass-600)] hover:underline"
          >
            <DocIcon className="h-4 w-4" />
            Open manual / calibration certificate
          </a>
        ) : (
          <p className="text-sm text-[var(--color-ink-600)]">No documentation on file.</p>
        )}
      </div>
    </div>
  );
}

function formatWaitlistRange(start, end) {
  if (!start) return "—";
  const dateFmt = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  const s = new Date(start).toLocaleString(undefined, dateFmt);
  const e = end ? new Date(end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;
  return e ? `${s} – ${e}` : s;
}

function EquipmentForm({ initial, labs, onSaved }) {
  const [equipmentName, setEquipmentName] = useState(initial?.equipmentName || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [labId, setLabId] = useState(initial?.lab?.labId || "");
  const [specification, setSpecification] = useState(initial?.specification || "");
  const [documentationUrl, setDocumentationUrl] = useState(initial?.documentationUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      equipmentName,
      category,
      lab: { labId: Number(labId) },
      specification: specification || undefined,
      documentationUrl: documentationUrl || undefined,
      ...(initial ? {} : { status: "Available" }),
    };
    try {
      const saved = initial
        ? await equipmentApi.update(initial.equipmentId, payload)
        : await equipmentApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Equipment name" htmlFor="e-name">
        <input
          id="e-name"
          required
          value={equipmentName}
          onChange={(e) => setEquipmentName(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Category" htmlFor="e-category">
        <input
          id="e-category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Imaging, Molecular Bio, Lab Equipment"
          className={inputClass}
        />
      </Field>

      <Field label="Lab" htmlFor="e-lab">
        <select id="e-lab" required value={labId} onChange={(e) => setLabId(e.target.value)} className={inputClass}>
          <option value="" disabled>
            Select lab
          </option>
          {labs.map((lab) => (
            <option key={lab.labId} value={lab.labId}>
              {lab.labName} {lab.institution?.institutionName ? `— ${lab.institution.institutionName}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Specification" htmlFor="e-spec">
        <textarea
          id="e-spec"
          rows={3}
          value={specification}
          onChange={(e) => setSpecification(e.target.value)}
          placeholder="Model, capacity, technical details…"
          className={inputClass}
        />
      </Field>

      <Field label="Documentation URL" htmlFor="e-doc">
        <input
          id="e-doc"
          type="url"
          value={documentationUrl}
          onChange={(e) => setDocumentationUrl(e.target.value)}
          placeholder="Link to manual, calibration certificate, etc."
          className={inputClass}
        />
        <p className="text-xs text-[var(--color-ink-600)] mt-1">
          Paste a link (e.g. from your S3/Cloudinary storage) to the equipment manual or
          calibration certificate.
        </p>
      </Field>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Add equipment"}
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
