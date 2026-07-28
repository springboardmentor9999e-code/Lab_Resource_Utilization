import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Trash2, Search, ChevronLeft, ChevronRight, X, DollarSign, Clock, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi, reportApi } from '../../api/api';

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
];

const PAYMENT_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid', color: 'bg-blue-100 text-blue-700' },
  { value: 'FAILED', label: 'Failed', color: 'bg-red-100 text-red-700' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-700' },
];

const getStatusColor = (status) => {
  return PAYMENT_STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

export default function PaymentTracking() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ invoiceId: '', amountPaid: '', paymentMethod: 'BANK_TRANSFER', paymentReference: '', paymentDate: '' });

  const { data: summary } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => { const res = await paymentApi.getSummary(); return res.data; },
  });

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['payments', page, search, methodFilter, dateFrom, dateTo],
    queryFn: async () => {
      const params = { page, size: 10 };
      if (search) params.search = search;
      if (methodFilter) params.paymentMethod = methodFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await paymentApi.getAll(params);
      return res.data;
    },
  });

  const recordMutation = useMutation({
    mutationFn: (data) => paymentApi.record(data),
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment-summary']);
      setShowRecordModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => paymentApi.delete(id),
    onSuccess: () => {
      toast.success('Payment deleted');
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment-summary']);
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete payment'),
  });

  const resetForm = () => setForm({ invoiceId: '', amountPaid: '', paymentMethod: 'BANK_TRANSFER', paymentReference: '', paymentDate: '' });

  const handleSubmit = () => {
    if (!form.invoiceId || !form.amountPaid || !form.paymentDate) {
      toast.error('Invoice ID, amount, and payment date are required');
      return;
    }
    recordMutation.mutate({
      invoiceId: parseInt(form.invoiceId),
      amountPaid: parseFloat(form.amountPaid),
      paymentMethod: form.paymentMethod,
      paymentReference: form.paymentReference,
      paymentDate: new Date(form.paymentDate).toISOString(),
    });
  };

  const payments = paymentData?.content || paymentData?.payments || [];
  const totalPages = paymentData?.totalPages || 0;

  const handleExportExcel = async () => {
    try {
      const res = await reportApi.generate({ reportType: 'PAYMENT_SUMMARY', format: 'EXCEL' });
      const reportId = res.data?.id;
      if (reportId) {
        const downloadRes = await reportApi.download(reportId);
        const url = URL.createObjectURL(new Blob([downloadRes.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.fileName || 'payment_summary.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Payment summary exported');
      }
    } catch (err) {
      toast.error('Failed to export payments');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Tracking</h1>
          <p className="text-gray-600 mt-1">Record and track all payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => { resetForm(); setShowRecordModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(summary?.totalPaid || 0)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(summary?.totalPending || 0)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Overdue</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(summary?.totalOverdue || 0)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input className="input-field flex-1" placeholder="Search by invoice # or reference..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="input-field" value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(0); }}>
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input className="input-field" type="date" placeholder="From" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
          <input className="input-field" type="date" placeholder="To" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Invoice #</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Payment Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{payment.invoiceNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(payment.amountPaid)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.paymentMethod?.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.paymentReference || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                          {payment.paymentStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setDeleteTarget(payment)}
                            className="p-1.5 hover:bg-red-100 rounded text-red-600" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete payment <strong>#{deleteTarget.id}</strong> of {formatCurrency(deleteTarget.amountPaid)}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID *</label>
                <input className="input-field w-full" type="number" placeholder="Invoice ID"
                  value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid *</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="0.00"
                  value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select className="input-field w-full" value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input className="input-field w-full" type="date" value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                <input className="input-field w-full" placeholder="Transaction ID, cheque #, etc."
                  value={form.paymentReference} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowRecordModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary" disabled={recordMutation.isPending}>
                {recordMutation.isPending ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
