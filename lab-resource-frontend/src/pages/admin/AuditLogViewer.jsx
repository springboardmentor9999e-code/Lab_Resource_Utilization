import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { auditLogApi } from '../../api/api';

const MODULES = ['AUTH', 'INSTITUTION', 'DEPARTMENT', 'LABORATORY', 'EQUIPMENT', 'BOOKING', 'MAINTENANCE', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'PAYMENT', 'ANNOUNCEMENT', 'CALIBRATION', 'INVOICE', 'NOTIFICATION_PREFERENCE'];

export default function AuditLogViewer() {
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: pageData, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs-page', page, moduleFilter, dateFrom, dateTo, userSearch],
    queryFn: async () => {
      const params = { page, size: 20 };
      if (moduleFilter) params.module = moduleFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (userSearch) params.userSearch = userSearch;
      const res = await auditLogApi.getPage(params);
      return res.data;
    },
  });

  const logs = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const exportCsv = () => {
    const headers = ['Time', 'User', 'Module', 'Action', 'Entity', 'Result'];
    const rows = logs.map(log => [
      log.actionTime,
      log.userFullName || 'System',
      log.module,
      log.action,
      `${log.entityType || ''} ${log.entityId ? '#' + log.entityId : ''}`.trim(),
      log.result,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-red-300 mb-3" />
        <p className="text-red-500">Failed to load audit logs</p>
        <p className="text-sm text-gray-400">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <select className="input-field w-full" value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}>
              <option value="">All Modules</option>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input type="date" className="input-field w-full" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input type="date" className="input-field w-full" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input type="text" className="input-field w-full" placeholder="Search user..."
              value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setPage(0); }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Module</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Entity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {log.actionTime}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-xs">{log.userFullName?.charAt(0) || '?'}</span>
                          </div>
                          <span className="text-sm text-gray-700">{log.userFullName || 'System'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">{log.module}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{log.entityType || 'N/A'} {log.entityId ? `#${log.entityId}` : ''}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          log.result === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
