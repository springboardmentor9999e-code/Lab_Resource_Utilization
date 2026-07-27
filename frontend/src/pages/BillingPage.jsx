import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '../services/billingService';
import { sharingService } from '../services/sharingService';
import { motion } from 'framer-motion';
import {
  Loader2, AlertTriangle, Wallet, ArrowDownLeft, ArrowUpRight, ReceiptText,
  FileCheck2, Ban, BadgeIndianRupee, Building2, Pencil, Check, X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageTransition from '../components/PageTransition';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

const fmt = (n) => (n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`);

const INVOICE_STATUS_STYLES = {
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  PAID: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25',
  CANCELLED: 'bg-slate-500/10 text-slate-500 border-slate-500/25',
};

const BillingPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('costs'); // costs | invoices
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [summary, setSummary] = useState({});
  const [equipmentCosts, setEquipmentCosts] = useState([]);
  const [departmentCosts, setDepartmentCosts] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [billableSharing, setBillableSharing] = useState([]);

  const [dialog, setDialog] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Inline budget editing, keyed by departmentId so only one card is ever in edit mode.
  const [editingBudgetFor, setEditingBudgetFor] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [sum, eqCosts, deptCosts, out, inc, incomingSharing] = await Promise.all([
        billingService.getSummary(days),
        billingService.getEquipmentCosts(days),
        billingService.getDepartmentCosts(days),
        billingService.getOutgoingInvoices(),
        billingService.getIncomingInvoices(),
        sharingService.getIncoming().catch(() => []),
      ]);
      setSummary(sum || {});
      setEquipmentCosts(eqCosts || []);
      setDepartmentCosts(deptCosts || []);
      setOutgoing(out || []);
      setIncoming(inc || []);
      // Approved incoming sharing requests with a fee and no invoice yet are billable
      const invoicedIds = new Set((out || []).map((i) => i.sharingRequestId).filter(Boolean));
      setBillableSharing((incomingSharing || []).filter(
        (r) => ['APPROVED', 'COMPLETED'].includes(r.status) && r.estimatedFee > 0 && !invoicedIds.has(r.sharingRequestId)
      ));
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch billing data. This page requires a manager role.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEditBudget = (d) => {
    setEditingBudgetFor(d.departmentId);
    // Prefill with the current figure, or blank when none is set — a blank field is the
    // honest starting point for a department whose budget has never been recorded.
    setBudgetInput(d.annualBudget == null ? '' : String(d.annualBudget));
  };

  const saveBudget = async (departmentId) => {
    const raw = budgetInput.trim();
    if (raw !== '' && (Number.isNaN(Number(raw)) || Number(raw) < 0)) {
      toast.error('Enter a valid non-negative amount, or leave it blank to clear the budget.');
      return;
    }
    setSavingBudget(true);
    try {
      await billingService.setAnnualBudget(departmentId, raw === '' ? null : Number(raw));
      toast.success(raw === '' ? 'Budget cleared' : 'Annual budget updated');
      setEditingBudgetFor(null);
      // Refetch rather than patch locally: utilization % and remaining budget are both
      // derived server-side, so guessing them here would only risk disagreeing with it.
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the budget');
    } finally {
      setSavingBudget(false);
    }
  };

  const generateInvoice = (req) => setDialog({
    title: 'Generate invoice?',
    message: `Issue an invoice of ${fmt(req.estimatedFee)} to ${req.fromInstitutionName} for ${req.equipmentName} (${req.requestedDate}).`,
    confirmLabel: 'Issue Invoice', danger: false,
    onConfirm: async () => {
      await billingService.generateInvoiceFromSharing(req.sharingRequestId);
      toast.success('Invoice issued and requester notified.');
      fetchData();
    },
  });

  const changeInvoiceStatus = (invoice, status) => setDialog({
    title: status === 'PAID' ? 'Mark invoice as paid?' : 'Cancel invoice?',
    message: `${invoice.invoiceNumber} — ${fmt(invoice.amount)} (${invoice.fromInstitutionName} → ${invoice.toInstitutionName})`,
    confirmLabel: status === 'PAID' ? 'Mark Paid' : 'Cancel Invoice',
    danger: status !== 'PAID',
    onConfirm: async () => {
      await billingService.updateInvoiceStatus(invoice.invoiceId, status);
      toast.success(status === 'PAID' ? 'Invoice marked as paid.' : 'Invoice cancelled.');
      fetchData();
    },
  });

  const runDialog = async () => {
    if (!dialog?.onConfirm) return;
    setDialogLoading(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setDialogLoading(false);
    }
  };

  const statCard = (Icon, label, value, accent) => (
    <div className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 my-0">{label}</p>
        <p className="text-lg font-extrabold text-slate-900 dark:text-white my-0">{value}</p>
      </div>
    </div>
  );

  const invoiceRow = (invoice, mode) => (
    <div key={invoice.invoiceId}
      className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">{invoice.invoiceNumber}</span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${INVOICE_STATUS_STYLES[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 truncate" title={invoice.description}>{invoice.description}</p>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {mode === 'outgoing'
            ? `Billed to ${invoice.toInstitutionName}`
            : `From ${invoice.fromInstitutionName}`} · issued {invoice.issuedDate} · due {invoice.dueDate}
          {invoice.paidDate && ` · paid ${invoice.paidDate}`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-lg font-extrabold text-slate-900 dark:text-white">{fmt(invoice.amount)}</span>
        {invoice.status === 'PENDING' && (
          <div className="flex gap-1.5">
            <button onClick={() => changeInvoiceStatus(invoice, 'PAID')}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 flex items-center gap-1">
              <FileCheck2 className="h-3 w-3" /> Mark Paid
            </button>
            {mode === 'outgoing' && (
              <button onClick={() => changeInvoiceStatus(invoice, 'CANCELLED')}
                className="px-3 py-1.5 border border-red-500/25 text-red-500 bg-red-500/5 text-xs font-bold rounded-xl hover:bg-red-500/10 flex items-center gap-1">
                <Ban className="h-3 w-3" /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const tabBtn = (key, label) => (
    <button onClick={() => setActiveTab(key)}
      className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        activeTab === key
          ? 'border-primary text-primary dark:text-blue-400 font-bold'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}>
      {label}
    </button>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-3">
              <Wallet className="h-7 w-7 text-primary" /> Cost & Billing Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Usage-based cost tracking, department allocation and inter-institution invoicing.
            </p>
          </div>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  days === d
                    ? 'bg-primary text-white border-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Crunching cost data...</span>
          </div>
        ) : errorMsg ? (
          <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{errorMsg}</span>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {statCard(ArrowDownLeft, 'Receivable (pending)', fmt(summary.receivablePending), 'text-amber-500')}
              {statCard(FileCheck2, 'Received (paid)', fmt(summary.receivedPaid), 'text-emerald-500')}
              {statCard(ArrowUpRight, 'Payable (pending)', fmt(summary.payablePending), 'text-red-500')}
              {statCard(ReceiptText, 'Paid Out', fmt(summary.paidOut), 'text-slate-500')}
              {statCard(BadgeIndianRupee, `Usage Cost (${days}d)`, fmt(summary.usageCost), 'text-blue-500')}
              {statCard(BadgeIndianRupee, `Maintenance (${days}d)`, fmt(summary.maintenanceCost), 'text-orange-500')}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
              {tabBtn('costs', 'Cost Analysis')}
              {tabBtn('invoices', `Invoices${billableSharing.length ? ` (${billableSharing.length} billable)` : ''}`)}
            </div>

            {activeTab === 'costs' ? (
              <div className="space-y-6">
                {/* Department cost chart */}
                {departmentCosts.length > 0 && (
                  <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Department-wise Operating Cost ({days}d)</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentCosts.map((d) => ({
                          name: d.departmentName,
                          Usage: Number(d.usageCost),
                          Maintenance: Number(d.maintenanceCost),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#33415522" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => fmt(v)} />
                          <Bar dataKey="Usage" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="Maintenance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Department Budget & Chargeback Breakdown */}
                {departmentCosts.length > 0 && (
                  <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Department Annual Budget & Internal Chargeback Tracking
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departmentCosts.map((d) => {
                        // null, not 0: a department with no budget on record has no
                        // utilization to report, and a 0% bar would read as healthy.
                        const tracked = d.budgetUtilizedPercent != null;
                        const pct = tracked ? Math.min(100, d.budgetUtilizedPercent) : 0;
                        const isEditing = editingBudgetFor === d.departmentId;
                        return (
                          <div key={d.departmentName} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 dark:text-white text-sm">{d.departmentName}</span>
                                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d.equipmentCount} Assets</span>
                              </div>
                              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between items-center gap-2">
                                  <span>Annual Budget:</span>
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        autoFocus
                                        value={budgetInput}
                                        onChange={(e) => setBudgetInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveBudget(d.departmentId);
                                          if (e.key === 'Escape') setEditingBudgetFor(null);
                                        }}
                                        placeholder="Not set"
                                        className="w-24 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right"
                                      />
                                      <button
                                        onClick={() => saveBudget(d.departmentId)}
                                        disabled={savingBudget}
                                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50"
                                        aria-label="Save budget"
                                      >
                                        {savingBudget
                                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          : <Check className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => setEditingBudgetFor(null)}
                                        disabled={savingBudget}
                                        className="p-1 rounded-md text-slate-500 hover:bg-slate-500/10 disabled:opacity-50"
                                        aria-label="Cancel"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startEditBudget(d)}
                                      disabled={d.departmentId == null}
                                      title={d.departmentId == null
                                        ? 'This grouping has no matching department record'
                                        : 'Set annual budget'}
                                      className="group flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 hover:text-primary disabled:cursor-not-allowed disabled:hover:text-slate-800"
                                    >
                                      {d.annualBudget == null
                                        ? <span className="italic text-slate-400 font-normal">Not set</span>
                                        : fmt(d.annualBudget)}
                                      {d.departmentId != null && (
                                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <div className="flex justify-between">
                                  <span>Operating Chargeback:</span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">{fmt(d.totalOperatingCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Remaining Budget:</span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(d.remainingBudget)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                                <span>Budget Utilized</span>
                                <span>{tracked ? `${d.budgetUtilizedPercent}%` : 'Not tracked'}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                {tracked ? (
                                  <div className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${pct}%` }} />
                                ) : (
                                  // Hatched placeholder: visibly "no data" rather than an empty green bar.
                                  <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgb(148_163_184/0.35)_4px,rgb(148_163_184/0.35)_8px)]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Equipment cost table */}
                <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200/50 dark:border-slate-800/50">
                          <th className="p-4">Equipment</th>
                          <th className="p-4">Department</th>
                          <th className="p-4">Usage Hours</th>
                          <th className="p-4">Rate/hr</th>
                          <th className="p-4">Usage Cost</th>
                          <th className="p-4">Maintenance Cost</th>
                          <th className="p-4">Total Operating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                        {equipmentCosts.map((row) => (
                          <tr key={row.equipmentId} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                            <td className="p-4">
                              <span className="font-bold text-slate-800 dark:text-white block">{row.equipmentName}</span>
                              <span className="font-mono text-[10px] text-slate-400">{row.equipmentCode}</span>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{row.departmentName}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{row.usageHours} h</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{row.hourlyRate ? fmt(row.hourlyRate) : 'Free'}</td>
                            <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{fmt(row.usageCost)}</td>
                            <td className="p-4 font-semibold text-orange-600 dark:text-orange-400">{fmt(row.maintenanceCost)}</td>
                            <td className="p-4 font-extrabold text-slate-900 dark:text-white">{fmt(row.totalOperatingCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Billable sharing requests */}
                {billableSharing.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Billable Sharing Requests (approved, not yet invoiced)</h2>
                    {billableSharing.map((req) => (
                      <motion.div key={req.sharingRequestId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white my-0">{req.equipmentName}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {req.fromInstitutionName} · {req.requestedDate} · {req.startTime?.substring(0, 5)}-{req.endTime?.substring(0, 5)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{fmt(req.estimatedFee)}</span>
                          <button onClick={() => generateInvoice(req)}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5">
                            <ReceiptText className="h-3.5 w-3.5" /> Issue Invoice
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ArrowDownLeft className="h-3.5 w-3.5" /> Outgoing (we bill others)
                    </h2>
                    {outgoing.length === 0
                      ? <p className="text-xs text-slate-400 py-4">No outgoing invoices.</p>
                      : outgoing.map((i) => invoiceRow(i, 'outgoing'))}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5" /> Incoming (billed to us)
                    </h2>
                    {incoming.length === 0
                      ? <p className="text-xs text-slate-400 py-4">No incoming invoices.</p>
                      : incoming.map((i) => invoiceRow(i, 'incoming'))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          open={!!dialog}
          title={dialog?.title}
          message={dialog?.message}
          confirmLabel={dialog?.confirmLabel}
          danger={dialog?.danger}
          loading={dialogLoading}
          onConfirm={runDialog}
          onCancel={() => setDialog(null)}
        />
      </div>
    </PageTransition>
  );
};

export default BillingPage;
