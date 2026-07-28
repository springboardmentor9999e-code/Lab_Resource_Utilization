import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, X, Zap, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceApi, institutionApi } from '../../api/api';
import MockPaymentModal from './MockPaymentModal';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid', color: 'bg-blue-100 text-blue-700' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-700' },
];

const getStatusColor = (status) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export default function InvoiceManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ institutionId: '', bookingId: '', totalAmount: '', taxAmount: '', dueDate: '' });
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bookingId, setBookingId] = useState('');
  const [payingInvoice, setPayingInvoice] = useState(null);

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => { const res = await institutionApi.getAll(); return res.data; },
  });

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoices', page, search, statusFilter],
    queryFn: async () => {
      const params = { page, size: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await invoiceApi.getAll(params);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => invoiceApi.create(data),
    onSuccess: () => { toast.success('Invoice created'); queryClient.invalidateQueries(['invoices']); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create invoice'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => invoiceApi.update(id, data),
    onSuccess: () => { toast.success('Invoice updated'); queryClient.invalidateQueries(['invoices']); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update invoice'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invoiceApi.delete(id),
    onSuccess: () => { toast.success('Invoice deleted'); queryClient.invalidateQueries(['invoices']); setDeleteTarget(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete invoice'),
  });

  const generateFromBookingMutation = useMutation({
    mutationFn: (id) => invoiceApi.generateFromBooking(id),
    onSuccess: () => { toast.success('Invoice generated from booking'); queryClient.invalidateQueries(['invoices']); setModal(null); setBookingId(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate invoice from booking'),
  });

  const resetForm = () => setForm({ institutionId: '', bookingId: '', totalAmount: '', taxAmount: '', dueDate: '' });

  const handleSubmit = () => {
    if (!form.institutionId || !form.totalAmount || !form.dueDate) {
      toast.error('Institution, total amount, and due date are required');
      return;
    }
    const payload = {
      institutionId: parseInt(form.institutionId),
      bookingId: form.bookingId ? parseInt(form.bookingId) : null,
      totalAmount: parseFloat(form.totalAmount),
      taxAmount: parseFloat(form.taxAmount) || 0,
      dueDate: new Date(form.dueDate).toISOString(),
    };
    if (modal === 'create') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ id: editingInvoice.id, data: payload });
    }
  };

  const invoices = invoiceData?.content || invoiceData?.invoices || [];
  const totalPages = invoiceData?.totalPages || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Manage invoices and billing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setBookingId(''); setModal('generate'); }} className="btn-secondary flex items-center gap-2">
            <Zap size={16} /> Generate from Booking
          </button>
          <button onClick={() => { resetForm(); setEditingInvoice(null); setModal('create'); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input className="input-field flex-1" placeholder="Search by invoice # or institution..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="input-field" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Invoice #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Institution</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Equipment</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Tax</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Paid</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Due</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Due Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{invoice.institutionName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{invoice.equipmentName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{invoice.userName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(invoice.taxAmount)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(invoice.amountPaid)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(invoice.amountDue)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          {(invoice.paymentStatus === 'PENDING' || invoice.paymentStatus === 'PARTIALLY_PAID') && (
                            <button onClick={() => setPayingInvoice(invoice)}
                              className="p-1.5 hover:bg-green-100 rounded text-green-600 flex items-center gap-1 text-xs font-medium"
                              title="Pay Now">
                              <CreditCard size={14} /> Pay
                            </button>
                          )}
                          <button onClick={() => {
                            setForm({
                              institutionId: invoice.institutionId || '',
                              bookingId: invoice.bookingId || '',
                              totalAmount: invoice.totalAmount || '',
                              taxAmount: invoice.taxAmount || '',
                              dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
                            });
                            setEditingInvoice(invoice);
                            setModal('edit');
                          }} className="p-1.5 hover:bg-gray-200 rounded" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(invoice)}
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
            <h3 className="text-lg font-semibold mb-2">Delete Invoice</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete invoice <strong>{deleteTarget.invoiceNumber}</strong>? This action cannot be undone.
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

      {/* Generate from Booking Modal */}
      {modal === 'generate' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Invoice from Booking</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID *</label>
              <input className="input-field w-full" type="number" placeholder="Enter booking ID"
                value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => {
                if (!bookingId) { toast.error('Booking ID is required'); return; }
                generateFromBookingMutation.mutate(parseInt(bookingId));
              }} className="btn-primary" disabled={generateFromBookingMutation.isPending}>
                {generateFromBookingMutation.isPending ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Invoice Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{modal === 'create' ? 'Create Invoice' : 'Edit Invoice'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                <select className="input-field w-full" value={form.institutionId}
                  onChange={(e) => setForm({ ...form, institutionId: e.target.value })}>
                  <option value="">Select Institution</option>
                  {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.institutionName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID (Optional)</label>
                <input className="input-field w-full" type="number" placeholder="Booking ID"
                  value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input className="input-field w-full" type="date" value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="0.00"
                  value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="0.00"
                  value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (modal === 'create' ? 'Create' : 'Update')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mock Payment Modal */}
      {payingInvoice && (
        <MockPaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={() => queryClient.invalidateQueries(['invoices'])}
        />
      )}
    </div>
  );
}
