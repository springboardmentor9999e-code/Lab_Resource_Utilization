import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { sharingRequestsApi } from "../api/sharingRequests";
import { equipmentApi } from "../api/equipment";
import { institutionsApi } from "../api/institutions";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";
import { Modal } from "../components/Modal";

export default function SharingRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const canApprove = can(user?.role, "sharing:approve");
  const canCreate = can(user?.role, "sharing:create");

  function loadData() {
    setLoading(true);
    setError(null);
    return Promise.all([sharingRequestsApi.list(), equipmentApi.list(), institutionsApi.list()])
      .then(([r, e, i]) => {
        setRequests(r);
        setEquipment(e);
        setInstitutions(i);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load sharing requests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    requests.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [requests]);

  if (loading) return <LoadingState label="Loading sharing requests…" />;

  return (
    <>
      <PageHeader
        eyebrow="Inter-institution"
        title="Sharing Requests"
        description="Request and approve cross-institution access to shared equipment."
        action={
          canCreate && (
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + New request
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} count={requests.length} />
        {Object.entries(statusCounts).map(([status, count]) => (
          <FilterPill
            key={status}
            label={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            count={count}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "all" ? "No sharing requests yet" : `No ${filter.toLowerCase()} requests`}
            description="Requests to borrow equipment from another institution or lab will appear here."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Equipment</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Requesting institution</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Purpose</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Window</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Status</th>
                {canApprove && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {filtered.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  canApprove={canApprove}
                  onUpdated={(updated) =>
                    setRequests((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                  }
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Request equipment sharing">
        <CreateRequestForm
          equipment={equipment}
          institutions={institutions}
          currentInstitutionId={user?.institutionId}
          onCreated={(request) => {
            setRequests((prev) => [request, ...prev]);
            setCreateOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

function FilterPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink-900)] text-white"
          : "bg-white border border-[var(--color-paper-200)] text-[var(--color-ink-700)] hover:border-[var(--color-brass-500)]"
      }`}
    >
      {label} <span className="opacity-70">· {count}</span>
    </button>
  );
}

function RequestRow({ request, canApprove, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [approvalNote, setApprovalNote] = useState(null);

  async function handle(action) {
    setSaving(true);
    try {
      const updated =
        action === "approve"
          ? await sharingRequestsApi.approve(request.id)
          : await sharingRequestsApi.reject(request.id);
      onUpdated(updated);
      if (action === "approve") {
        setApprovalNote(
          updated.status === "WAITLISTED"
            ? "Approved, but that slot was already taken — the requester has been placed on the equipment's waitlist."
            : "Approved — a booking was created for the requester."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <tr>
        <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">
          {request.equipment?.equipmentName || `Equipment #${request.equipment?.equipmentId ?? "—"}`}
          {request.booking && (
            <span
              title="Booked directly rather than submitted for review — logged here for visibility."
              className="ml-2 align-middle text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-600)] bg-[var(--color-paper-200)] rounded px-1.5 py-0.5"
            >
              Auto-logged
            </span>
          )}
        </td>
        <td className="px-5 py-3 text-[var(--color-ink-600)]">
          {request.requesterInstitution?.institutionName || "—"}
        </td>
        <td className="px-5 py-3 text-[var(--color-ink-600)] max-w-xs truncate">{request.purpose || "—"}</td>
        <td className="px-5 py-3 text-[var(--color-ink-600)]">
          {formatRange(request.startDate, request.endDate)}
        </td>
        <td className="px-5 py-3">
          <StatusDial status={request.status} size="sm" />
        </td>
        {canApprove && (
          <td className="px-5 py-3 text-right">
            {request.status === "PENDING" ? (
              <div className="flex gap-2 justify-end">
                <button
                  disabled={saving}
                  onClick={() => handle("approve")}
                  className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-available-bg)] text-[var(--color-ink-900)] hover:opacity-80 disabled:opacity-50 transition-opacity"
                >
                  Approve
                </button>
                <button
                  disabled={saving}
                  onClick={() => handle("reject")}
                  className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-maintenance-bg)] text-[var(--color-status-maintenance)] hover:opacity-80 disabled:opacity-50 transition-opacity"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-xs text-[var(--color-ink-600)]">
                {request.booking
                  ? "booked directly"
                  : request.approvedBy?.name
                  ? `by ${request.approvedBy.name}`
                  : "—"}
              </span>
            )}
          </td>
        )}
      </tr>
      {approvalNote && (
        <tr>
          <td colSpan={canApprove ? 6 : 5} className="px-5 pb-3 -mt-1">
            <div className="text-xs text-[var(--color-brass-600)] bg-[var(--color-status-booked-bg)]/40 rounded-md px-3 py-1.5 inline-block">
              {approvalNote}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CreateRequestForm({ equipment, institutions, currentInstitutionId, onCreated }) {
  const [equipmentId, setEquipmentId] = useState("");
  const [ownerInstitutionId, setOwnerInstitutionId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const otherInstitutions = institutions.filter((i) => i.institutionId !== currentInstitutionId);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const request = await sharingRequestsApi.create({
        equipment: { equipmentId: Number(equipmentId) },
        ownerInstitution: ownerInstitutionId ? { institutionId: Number(ownerInstitutionId) } : undefined,
        requesterInstitution: currentInstitutionId ? { institutionId: currentInstitutionId } : undefined,
        purpose,
        startDate,
        endDate,
      });
      onCreated(request);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit the request. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="sr-equip" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Equipment
        </label>
        <select
          id="sr-equip"
          required
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Select equipment
          </option>
          {equipment.map((eq) => (
            <option key={eq.equipmentId} value={eq.equipmentId}>
              {eq.equipmentName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sr-owner" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Owning institution
        </label>
        <select
          id="sr-owner"
          value={ownerInstitutionId}
          onChange={(e) => setOwnerInstitutionId(e.target.value)}
          className={inputClass}
        >
          <option value="">Same as equipment's home institution</option>
          {otherInstitutions.map((inst) => (
            <option key={inst.institutionId} value={inst.institutionId}>
              {inst.institutionName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sr-purpose" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Purpose
        </label>
        <textarea
          id="sr-purpose"
          required
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What will this equipment be used for?"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sr-start" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
            Start
          </label>
          <input
            id="sr-start"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sr-end" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
            End
          </label>
          <input
            id="sr-end"
            type="datetime-local"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";

function formatRange(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const dateFmt = { month: "short", day: "numeric" };
  const datePart = s.toLocaleDateString(undefined, dateFmt);
  const endPart = e ? e.toLocaleDateString(undefined, dateFmt) : null;
  return endPart ? `${datePart} – ${endPart}` : datePart;
}
