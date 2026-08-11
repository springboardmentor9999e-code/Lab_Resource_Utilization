import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { billingRecordsApi } from "../api/billingRecords";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";
import { StatusDial } from "../components/StatusDial";

export default function BillingPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    return billingRecordsApi
      .list()
      .then(setRecords)
      .catch((err) => setError(err.response?.data?.message || "Couldn't load billing records."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(record, status) {
    try {
      const updated = await billingRecordsApi.updateStatus(record.billingRecordId, status);
      setRecords((prev) => prev.map((r) => (r.billingRecordId === updated.billingRecordId ? updated : r)));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update this billing record.");
    }
  }

  if (loading) return <LoadingState label="Loading billing records…" />;

  const ownInstitutionId = user?.institutionId;
  const owedToYou = records.filter((r) => r.ownerInstitution?.institutionId === ownInstitutionId);
  const youOwe = records.filter((r) => r.billedInstitution?.institutionId === ownInstitutionId);

  return (
    <>
      <PageHeader
        eyebrow="Cost & Billing"
        title="Inter-institution billing"
        description="Charges generated automatically when a cross-institution booking on priced equipment is completed."
      />

      {error && <ErrorState message={error} />}

      {records.length === 0 ? (
        <Card>
          <EmptyState
            title="No billing activity yet"
            description="A record appears here once someone from another institution completes a booking on equipment with an hourly rate set."
          />
        </Card>
      ) : (
        <div className="space-y-8">
          <BillingTable
            title="Owed to your institution"
            description="Other institutions' use of your equipment."
            records={owedToYou}
            canManageStatus
            onStatusChange={handleStatusChange}
          />
          <BillingTable
            title="Your institution owes"
            description="Your researchers' use of other institutions' equipment."
            records={youOwe}
            canManageStatus={false}
          />
        </div>
      )}
    </>
  );
}

function StatusSelect({ record, onStatusChange }) {
  // A genuinely controlled select, not an uncontrolled one with defaultValue -
  // defaultValue only sets the INITIAL value when the element first mounts
  // and never updates again, so after picking a new status the dropdown kept
  // visually showing the picked value regardless of whether the update
  // actually succeeded, making it look like nothing happened (or like it was
  // stuck on the new value) even when the backend had genuinely saved it.
  // Always resetting `value` back to "" after the record prop updates makes
  // the dropdown accurately reflect "nothing pending" vs "saving" at all times.
  const [pending, setPending] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    if (!next) return;
    setPending(true);
    try {
      await onStatusChange(record, next);
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      value=""
      disabled={pending}
      onChange={handleChange}
      className="text-xs border border-[var(--color-paper-200)] rounded-md px-2 py-1 disabled:opacity-50"
    >
      <option value="" disabled>
        {pending ? "Saving…" : "Update…"}
      </option>
      {["Pending", "Invoiced", "Paid"]
        .filter((s) => s !== record.status)
        .map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
    </select>
  );
}
function BillingTable({ title, description, records, canManageStatus, onStatusChange }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-[var(--font-display)] text-lg text-[var(--color-ink-900)]">{title}</h2>
        <p className="text-sm text-[var(--color-ink-600)]">{description}</p>
      </div>
      {records.length === 0 ? (
        <Card>
          <EmptyState title="Nothing here" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Equipment</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">
                  {canManageStatus ? "Billed institution" : "Owner institution"}
                </th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Hours</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Rate</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Total</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Status</th>
                {canManageStatus && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {records.map((r) => (
                <tr key={r.billingRecordId}>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">
                    {r.equipment?.equipmentName || `Equipment #${r.equipment?.equipmentId ?? "—"}`}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">
                    {(canManageStatus ? r.billedInstitution : r.ownerInstitution)?.institutionName || "—"}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{Number(r.hoursUsed).toFixed(2)}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">${Number(r.hourlyRate).toFixed(2)}/hr</td>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">${Number(r.totalCost).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <StatusDial status={r.status} size="sm" />
                  </td>
                  {canManageStatus && (
                    <td className="px-5 py-3 text-right">
                      {r.status !== "Paid" && (
                        <StatusSelect record={r} onStatusChange={onStatusChange} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
