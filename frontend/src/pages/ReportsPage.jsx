import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '../services/billingService';
import { maintenanceService } from '../services/maintenanceService';
import { utilizationService } from '../services/utilizationService';
import {
  Loader2, FileDown, FileSpreadsheet, FileText, BarChart3, Wrench, Share2, Wallet, Building2, TrendingUp, ShieldCheck
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useToast } from '../components/ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const fmt = (n) => (n == null ? '0' : Number(n).toLocaleString('en-IN'));

// For figures the system may genuinely not know, such as a department that has
// never had a budget set. Printing '0' there would claim a budget of zero.
const fmtOrDash = (n) => (n == null ? 'Not set' : Number(n).toLocaleString('en-IN'));

const downloadXlsx = (filename, title, subtitle, columns, rows) => {
  const headerRow = columns.map((c) => c.header);
  const dataRows = rows.map((r) => columns.map((c) => c.value(r)));

  const sheetData = [
    [title],
    [subtitle],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    headerRow,
    ...dataRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = columns.map(() => ({ wch: 22 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
  XLSX.writeFile(wb, filename);
};

const downloadPdf = (title, subtitle, columns, rows) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle, 14, 25);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  autoTable(doc, {
    startY: 36,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => c.value(r))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  doc.save(title.replace(/\s+/g, '_').toLowerCase() + '.pdf');
};

const ReportsPage = () => {
  const toast = useToast();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const [equipmentCosts, setEquipmentCosts] = useState([]);
  const [departmentCosts, setDepartmentCosts] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [outgoingInvoices, setOutgoingInvoices] = useState([]);
  const [incomingInvoices, setIncomingInvoices] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [costs, deptCosts, util, maint, out, inc] = await Promise.all([
        billingService.getEquipmentCosts(days).catch(() => []),
        billingService.getDepartmentCosts(days).catch(() => []),
        utilizationService.getSummary(days).catch(() => null),
        maintenanceService.getRequests().catch(() => []),
        billingService.getOutgoingInvoices().catch(() => []),
        billingService.getIncomingInvoices().catch(() => []),
      ]);
      setEquipmentCosts(costs || []);
      setDepartmentCosts(deptCosts || []);
      setUtilization(util);
      setMaintenance(maint || []);
      setOutgoingInvoices(out || []);
      setIncomingInvoices(inc || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ----- Report definitions -----
  const reports = [
    {
      id: 'utilization',
      title: 'Equipment Utilization Report',
      icon: BarChart3,
      accent: 'text-blue-500',
      description: 'Per-equipment utilization rate, booked hours, and availability status.',
      columns: [
        { header: 'Equipment', value: (r) => r.equipmentName },
        { header: 'Code', value: (r) => r.equipmentCode },
        { header: 'Status', value: (r) => r.status },
        { header: 'Bookings', value: (r) => r.bookingCount },
        { header: 'Booked Hours', value: (r) => (r.bookedMinutes / 60).toFixed(1) },
        { header: 'Utilization %', value: (r) => `${r.utilizationRate}%` },
      ],
      rows: () => utilization?.equipment || [],
      count: utilization?.equipment?.length || 0,
    },
    {
      id: 'department',
      title: 'Department Resource & Budget Report',
      icon: Building2,
      accent: 'text-indigo-500',
      description: 'Departmental cost allocation, annual budget status, and chargeback utilization.',
      columns: [
        { header: 'Department', value: (r) => r.departmentName },
        { header: 'Equipment Count', value: (r) => r.equipmentCount },
        { header: 'Usage Hours', value: (r) => r.usageHours },
        { header: 'Usage Cost (₹)', value: (r) => fmt(r.usageCost) },
        { header: 'Maintenance (₹)', value: (r) => fmt(r.maintenanceCost) },
        { header: 'Annual Budget (₹)', value: (r) => fmtOrDash(r.annualBudget) },
        {
          header: 'Budget Utilized %',
          value: (r) => (r.budgetUtilizedPercent == null ? '—' : `${r.budgetUtilizedPercent}%`),
        },
      ],
      rows: () => departmentCosts,
      count: departmentCosts.length,
    },
    {
      id: 'maintenance',
      title: 'Maintenance & Downtime Report',
      icon: Wrench,
      accent: 'text-orange-500',
      description: 'Work order logs, technician assignments, downtime tracking, and repair expenses.',
      columns: [
        { header: 'ID', value: (r) => `#${r.requestId}` },
        { header: 'Equipment', value: (r) => r.equipmentName },
        { header: 'Type', value: (r) => r.type },
        { header: 'Priority', value: (r) => r.priority },
        { header: 'Status', value: (r) => r.status },
        { header: 'Assigned Technician', value: (r) => r.assignedToName || '—' },
        { header: 'Downtime (min)', value: (r) => r.downtimeMinutes ?? 0 },
        { header: 'Repair Cost (₹)', value: (r) => fmt(r.cost) },
      ],
      rows: () => maintenance,
      count: maintenance.length,
    },
    {
      id: 'billing',
      title: 'Inter-Institution Sharing & Billing Report',
      icon: Share2,
      accent: 'text-purple-500',
      description: 'Cross-institutional sharing invoices, billing status, and usage fee chargebacks.',
      columns: [
        { header: 'Invoice #', value: (r) => r.invoiceNumber },
        { header: 'Direction', value: (r) => r._direction },
        { header: 'From Institution', value: (r) => r.fromInstitutionName },
        { header: 'To Institution', value: (r) => r.toInstitutionName },
        { header: 'Amount (₹)', value: (r) => fmt(r.amount) },
        { header: 'Status', value: (r) => r.status },
        { header: 'Issued Date', value: (r) => r.issuedDate },
        { header: 'Due Date', value: (r) => r.dueDate },
      ],
      rows: () => [
        ...outgoingInvoices.map((i) => ({ ...i, _direction: 'OUTGOING' })),
        ...incomingInvoices.map((i) => ({ ...i, _direction: 'INCOMING' })),
      ],
      count: outgoingInvoices.length + incomingInvoices.length,
    },
    {
      id: 'roi',
      title: 'Procurement & ROI Analysis Report',
      icon: TrendingUp,
      accent: 'text-emerald-500',
      description: 'Acquisition investment return (ROI %), cumulative revenue value, and net financial return.',
      columns: [
        { header: 'Equipment Name', value: (r) => r.equipmentName },
        { header: 'Category', value: (r) => r.category },
        { header: 'Acquisition Cost (₹)', value: (r) => fmt(r.acquisitionCost) },
        { header: 'Usage Revenue (₹)', value: (r) => fmt(r.usageCost) },
        { header: 'Maintenance Expense (₹)', value: (r) => fmt(r.maintenanceCost) },
        { header: 'Net Return (₹)', value: (r) => fmt(r.netReturn) },
        { header: 'ROI %', value: (r) => `${r.roiPercent || 0}%` },
      ],
      rows: () => equipmentCosts,
      count: equipmentCosts.length,
    },
    {
      id: 'lifecycle',
      title: 'Equipment Lifecycle & Valuation Report',
      icon: ShieldCheck,
      accent: 'text-cyan-500',
      description: 'Straight-line book value depreciation, warranty status, age, and lifecycle stage.',
      columns: [
        { header: 'Equipment Name', value: (r) => r.equipmentName },
        { header: 'Purchase Date', value: (r) => r.purchaseDate || 'N/A' },
        { header: 'Age (Years)', value: (r) => r.ageInYears },
        { header: 'Warranty Expiry', value: (r) => r.warrantyExpiry || 'N/A' },
        { header: 'Warranty Status', value: (r) => r.warrantyStatus },
        { header: 'Book Value (₹)', value: (r) => fmt(r.currentBookValue) },
        { header: 'Lifecycle Phase', value: (r) => (r.lifecyclePhase || 'OPTIMAL').replace('_', ' ') },
      ],
      rows: () => equipmentCosts,
      count: equipmentCosts.length,
    },
  ];

  const exportReport = (report, format) => {
    const rows = report.rows();
    if (!rows.length) {
      toast.error('No data available to export for this report.');
      return;
    }
    setBusy(`${report.id}-${format}`);
    try {
      const subtitle = `Report Window: Last ${days} days`;
      if (format === 'pdf') {
        downloadPdf(report.title, subtitle, report.columns, rows);
      } else {
        downloadXlsx(report.title.replace(/\s+/g, '_').toLowerCase() + '.xlsx', report.title, subtitle, report.columns, rows);
      }
      toast.success(`${report.title} exported as ${format.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      toast.error('Export failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-3">
              <FileText className="h-7 w-7 text-primary" /> Reports & Analytics Exports
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate utilization, budget chargeback, maintenance, billing, ROI, and lifecycle reports — export to PDF or native Excel (.xlsx).
            </p>
          </div>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  days === d ? 'bg-primary text-white border-primary'
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
            <span className="text-sm text-slate-500">Preparing report data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id}
                  className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 ${report.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white my-0">{report.title}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{report.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">{report.count} record{report.count === 1 ? '' : 's'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => exportReport(report, 'pdf')} disabled={!!busy}
                        className="px-3 py-1.5 border border-red-500/25 text-red-500 bg-red-500/5 text-xs font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1 disabled:opacity-50">
                        {busy === `${report.id}-pdf` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />} PDF
                      </button>
                      <button onClick={() => exportReport(report, 'xlsx')} disabled={!!busy}
                        className="px-3 py-1.5 border border-emerald-500/25 text-emerald-600 bg-emerald-500/5 text-xs font-bold rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center gap-1 disabled:opacity-50">
                        {busy === `${report.id}-xlsx` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3 w-3" />} Excel (.xlsx)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ReportsPage;
