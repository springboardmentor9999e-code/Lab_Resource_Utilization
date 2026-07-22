import { useEffect, useState } from "react";
import { roleLabel } from "../auth/permissions";
import { roleChangeRequestsApi } from "../api/roleChangeRequests";
import { Card, LoadingState, ErrorState, PageHeader, EmptyState } from "../components/ui";

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    return roleChangeRequestsApi
      .listPending()
      .then(setRequests)
      .catch((err) => setError(err.response?.data?.message || "Couldn't load role requests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handle(id, action) {
    try {
      await (action === "approve" ? roleChangeRequestsApi.approve(id) : roleChangeRequestsApi.reject(id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update this request.");
    }
  }

  if (loading) return <LoadingState label="Loading role requests…" />;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Role Requests"
        description="People who registered asking for a staff role, pending your approval. Approving grants that role immediately."
      />

      {error && <ErrorState message={error} />}

      {requests.length === 0 ? (
        <Card>
          <EmptyState
            title="No pending role requests"
            description="When someone registers asking for a role other than Student or Researcher, it shows up here for review."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-200)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Current role</th>
                <th className="px-5 py-3 font-medium text-[var(--color-ink-600)] text-xs uppercase tracking-wide">Requested role</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-200)]">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">{r.user?.name || "—"}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{r.user?.email || "—"}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-600)]">{roleLabel(r.user?.role)}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-900)] font-medium">{roleLabel(r.requestedRole)}</td>
                  <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handle(r.id, "approve")}
                      className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-available-bg)] text-[var(--color-ink-900)] hover:opacity-80 transition-opacity"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handle(r.id, "reject")}
                      className="text-xs font-medium rounded-md px-2.5 py-1 bg-[var(--color-status-maintenance-bg)] text-[var(--color-status-maintenance)] hover:opacity-80 transition-opacity"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
