import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { maintenanceApi } from "../api/maintenance";
import { equipmentApi } from "../api/equipment";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";
import { Modal } from "../components/Modal";

const STATUS_OPTIONS = ["Scheduled", "In Progress", "Completed", "Cancelled"];

export default function MaintenancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const canManage = can(user?.role, "maintenance:manage");

  function loadData() {
    setLoading(true);
    setError(null);
    return Promise.all([maintenanceApi.list(), equipmentApi.list()])
      .then(([m, e]) => {
        setRecords(m);
        setEquipment(e);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load maintenance records."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return records;
    if (filter === "unset") return records.filter((r) => !r.status);
    return records.filter((r) => r.status === filter);
  }, [records, filter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      const key = r.status || "unset";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [records]);

  if (loading) return <LoadingState label="Loading maintenance records…" />;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Maintenance"
        description="Preventive maintenance scheduling and work order tracking."
        action={
          canManage && (
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-[var(--color-ink-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] transition-colors"
            >
              + New work order
            </button>
          )
        }
      />

      {error && <ErrorState message={error} />}

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} count={records.length} />
        {Object.entries(statusCounts).map(([status, count]) => (
          <FilterPill
            key={status}
            label={status === "unset" ? "No status" : status}
            active={filter === status}
            onClick={() => setFilter(status)}
            count={count}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "all" ? "No maintenance records yet" : "No records match this filter"}
            description={canManage ? "Log preventive maintenance or repair work orders here." : "Nothing scheduled right now."}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Equipment</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Description</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Window</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Status</th>
                {canManage && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {filtered.map((r) => (
                <MaintenanceRow
                  key={r.maintenanceId}
                  record={r}
                  canManage={canManage}
                  onUpdated={(updated) =>
                    setRecords((prev) =>
                      prev.map((x) => (x.maintenanceId === updated.maintenanceId ? updated : x))
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New work order">
        <CreateMaintenanceForm
          equipment={equipment}
          onCreated={(record) => {
            setRecords((prev) => [record, ...prev]);
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

function MaintenanceRow({ record, canManage, onUpdated }) {
  const [saving, setSaving] = useState(false);

  async function setStatus(status) {
    setSaving(true);
    try {
      const updated = await maintenanceApi.update(record.maintenanceId, { status });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">
        {record.equipment?.equipmentName || `Equipment #${record.equipment?.equipmentId ?? "—"}`}
      </td>
      <td className="px-5 py-3 text-[var(--color-ink-600)] max-w-xs truncate">{record.description || "—"}</td>
      <td className="px-5 py-3 text-[var(--color-ink-600)]">{formatRange(record.startDate, record.endDate)}</td>
      <td className="px-5 py-3">
        {record.status ? <StatusDial status={record.status} size="sm" /> : <span className="text-xs text-[var(--color-ink-600)]">—</span>}
      </td>
      {canManage && (
        <td className="px-5 py-3 text-right">
          <select
            defaultValue=""
            disabled={saving}
            onChange={(e) => e.target.value && setStatus(e.target.value)}
            className="text-xs border border-[var(--color-paper-200)] rounded-md px-2 py-1 disabled:opacity-50"
          >
            <option value="" disabled>
              Update…
            </option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
      )}
    </tr>
  );
}

function CreateMaintenanceForm({ equipment, onCreated }) {
  const [equipmentId, setEquipmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const record = await maintenanceApi.create({
        equipment: { equipmentId: Number(equipmentId) },
        startDate,
        endDate: endDate || undefined,
        description: description || undefined,
        status: "Scheduled",
      });
      onCreated(record);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the work order. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="m-equip" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Equipment
        </label>
        <select
          id="m-equip"
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="m-start" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
            Start date
          </label>
          <input
            id="m-start"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="m-end" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
            End date <span className="text-[var(--color-ink-600)] font-normal">(optional)</span>
          </label>
          <input
            id="m-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="m-desc" className="block text-sm font-medium text-[var(--color-ink-800)] mb-1.5">
          Description <span className="text-[var(--color-ink-600)] font-normal">(optional)</span>
        </label>
        <textarea
          id="m-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What work is being done?"
          className={inputClass}
        />
      </div>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--color-ink-900)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-800)] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Creating…" : "Create work order"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-paper-200)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink-900)] focus:border-[var(--color-brass-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-500)]/20 transition-colors";

function formatRange(start, end) {
  if (!start) return "—";
  const dateFmt = { month: "short", day: "numeric", year: "numeric" };
  const startPart = new Date(start).toLocaleDateString(undefined, dateFmt);
  const endPart = end ? new Date(end).toLocaleDateString(undefined, dateFmt) : null;
  return endPart ? `${startPart} – ${endPart}` : `${startPart} – ongoing`;
}
