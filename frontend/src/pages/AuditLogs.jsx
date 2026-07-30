import { useState, useEffect } from 'react';
import { MdListAlt, MdRefresh, MdSearch, MdShield } from 'react-icons/md';
import { auditLogService } from '../services/services';
import { useToast } from '../context/ToastContext';

export default function AuditLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll();
      setLogs(res.data.data || []);
    } catch {
      toast.showError('Failed to load system audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
    (l.userEmail && l.userEmail.toLowerCase().includes(search.toLowerCase())) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdShield className="text-purple-600 text-3xl" />
            System Audit Logs
          </h1>
          <p className="page-subtitle">Platform activity trail and administrative security logs</p>
        </div>

        <button onClick={fetchLogs} className="btn-secondary">
          <MdRefresh className="text-lg" /> Refresh
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="search-box max-w-md w-full">
          <MdSearch className="text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {filteredLogs.length} of {logs.length} events
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">No audit logs found.</td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id}>
                    <td className="text-xs text-slate-500 font-semibold">{new Date(l.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="font-bold text-slate-900">{l.userName}</div>
                      <div className="text-xs text-slate-500">{l.userEmail}</div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-[11px] rounded-lg border border-purple-200 uppercase tracking-wider">
                        {l.action}
                      </span>
                    </td>
                    <td className="text-xs font-semibold text-slate-700">{l.entityName} {l.entityId ? `(#${l.entityId.slice(0, 8)})` : ''}</td>
                    <td className="text-xs text-slate-600">{l.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
