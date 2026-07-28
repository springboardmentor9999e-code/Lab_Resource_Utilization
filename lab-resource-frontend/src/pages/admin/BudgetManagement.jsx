import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Pencil, Trash2, X, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetApi, departmentApi, institutionApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function BudgetManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [form, setForm] = useState({ departmentId: '', fiscalYear: currentYear, budgetAmount: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'INSTITUTION_ADMIN';

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', selectedYear],
    queryFn: async () => {
      const params = { fiscalYear: selectedYear };
      const res = await budgetApi.getAll(params);
      return res.data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-all'],
    queryFn: async () => {
      if (!user?.institutionId) {
        const res = await departmentApi.getByInstitution(1);
        return res.data;
      }
      const res = await departmentApi.getByInstitution(user.institutionId);
      return res.data;
    },
    enabled: isAdmin && showModal,
  });

  const setBudgetMutation = useMutation({
    mutationFn: (data) => budgetApi.set(data),
    onSuccess: () => {
      toast.success(editingBudget ? 'Budget updated' : 'Budget set successfully');
      queryClient.invalidateQueries(['budgets']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save budget'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetApi.delete(id),
    onSuccess: () => {
      toast.success('Budget deleted');
      queryClient.invalidateQueries(['budgets']);
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete budget'),
  });

  const openModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setForm({
        departmentId: budget.departmentId,
        fiscalYear: budget.fiscalYear,
        budgetAmount: budget.budgetAmount,
        description: budget.description || '',
      });
    } else {
      setEditingBudget(null);
      setForm({ departmentId: '', fiscalYear: selectedYear, budgetAmount: '', description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setForm({ departmentId: '', fiscalYear: selectedYear, budgetAmount: '', description: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.departmentId || !form.budgetAmount) {
      toast.error('Please fill all required fields');
      return;
    }
    setBudgetMutation.mutate({
      departmentId: parseInt(form.departmentId),
      fiscalYear: parseInt(form.fiscalYear),
      budgetAmount: parseFloat(form.budgetAmount),
      description: form.description,
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.budgetAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spentAmount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilPercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budget Management</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {isAdmin && (
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Set Budget
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><DollarSign size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-bold">₹{totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg"><TrendingUp size={20} className="text-orange-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-bold">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><DollarSign size={20} className="text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-xl font-bold">₹{totalRemaining.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg"><TrendingUp size={20} className="text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-xl font-bold">{utilPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No budgets set for {selectedYear}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Budget</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Spent</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Remaining</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Utilization</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Invoices</th>
                  {isAdmin && <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const spent = parseFloat(b.spentAmount || 0);
                  const budget = parseFloat(b.budgetAmount || 0);
                  const remaining = budget - spent;
                  const util = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;
                  return (
                    <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{b.departmentName}</td>
                      <td className="py-3 px-4 text-right">₹{budget.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">₹{spent.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{remaining.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(util, 100)}%` }}></div>
                          </div>
                          <span className="text-sm">{util}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{b.invoiceCount}</td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openModal(b)} className="p-1 text-blue-600 hover:text-blue-800">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(b)} className="p-1 text-red-600 hover:text-red-800">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editingBudget ? 'Edit Budget' : 'Set Budget'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="input-field" disabled={!!editingBudget}>
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year *</label>
                <select value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })} className="input-field">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount (₹) *</label>
                <input type="number" value={form.budgetAmount} onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
                  className="input-field" placeholder="e.g. 500000" min="0" step="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field" rows="2" placeholder="Optional description" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="btn-primary" disabled={setBudgetMutation.isLoading}>
                  {setBudgetMutation.isLoading ? 'Saving...' : editingBudget ? 'Update' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Budget</h2>
            <p className="text-gray-600 mb-4">Delete budget for <strong>{deleteConfirm.departmentName}</strong> ({deleteConfirm.fiscalYear})?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
